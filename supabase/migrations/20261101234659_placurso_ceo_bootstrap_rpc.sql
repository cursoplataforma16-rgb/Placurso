-- Promote the one verified CEO identity through a single private database transaction.
-- Normal user role changes remain guarded by the existing anti-escalation trigger.

create or replace function public.bloquear_mudanca_de_papel()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if new.papel is distinct from old.papel
     and not public.eh_admin()
     and not (
       coalesce(auth.role(), '') = 'service_role'
       and coalesce(current_setting('placurso.allow_ceo_role_change', true), '') = 'true'
       and coalesce(current_setting('placurso.ceo_role_change_user', true), '') = new.id::text
       and old.papel = 'aluno'
       and new.papel = 'admin'
     ) then
    raise exception 'Não podes alterar o teu papel.';
  end if;
  return new;
end;
$function$;

-- Signup always creates a normal student profile. The confirmed CEO is promoted
-- later by placurso_ceo_bootstrap_profile after the browser returns with a valid Google session.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.perfis (id, nome_completo, pais, papel)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data->>'name'), ''),
      nullif(btrim(new.raw_user_meta_data->>'nome_completo'), ''),
      ''
    ),
    new.raw_user_meta_data->>'pais',
    'aluno'
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

create or replace function public.placurso_ceo_bootstrap_profile(p_auth_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_identity public.growth_ceo_identity%rowtype;
  v_auth auth.users%rowtype;
  v_profile public.perfis%rowtype;
  v_provider text;
  v_providers jsonb;
  v_nome text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception using errcode = '42501', message = 'ceo_service_role_required';
  end if;

  if p_auth_user_id is null then
    raise exception using errcode = '22004', message = 'ceo_auth_user_required';
  end if;

  select *
    into v_identity
    from public.growth_ceo_identity
   where id = 1
   for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'ceo_identity_not_configured';
  end if;

  select *
    into v_auth
    from auth.users
   where id = p_auth_user_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'ceo_auth_user_not_found';
  end if;

  v_provider := lower(coalesce(v_auth.raw_app_meta_data->>'provider', ''));
  v_providers := coalesce(v_auth.raw_app_meta_data->'providers', '[]'::jsonb);

  if nullif(lower(btrim(coalesce(v_auth.email, ''))), '') <> lower(btrim(v_identity.email))
     or v_auth.email_confirmed_at is null
     or not (
       v_provider = 'google'
       or (jsonb_typeof(v_providers) = 'array' and v_providers ? 'google')
     ) then
    raise exception using errcode = '42501', message = 'ceo_auth_identity_not_verified';
  end if;

  if v_identity.auth_user_id is not null
     and v_identity.auth_user_id <> p_auth_user_id then
    raise exception using errcode = '42501', message = 'ceo_identity_already_claimed';
  end if;

  update public.growth_ceo_identity
     set auth_user_id = p_auth_user_id,
         claimed_at = coalesce(claimed_at, now()),
         updated_at = now()
   where id = 1
     and (auth_user_id is null or auth_user_id = p_auth_user_id);

  if not found then
    raise exception using errcode = '42501', message = 'ceo_identity_claim_failed';
  end if;

  v_nome := coalesce(
    nullif(btrim(v_auth.raw_user_meta_data->>'full_name'), ''),
    nullif(btrim(v_auth.raw_user_meta_data->>'name'), ''),
    nullif(btrim(v_auth.raw_user_meta_data->>'nome_completo'), ''),
    ''
  );

  insert into public.perfis (id, nome_completo, papel)
  values (p_auth_user_id, v_nome, 'aluno')
  on conflict (id) do nothing;

  select *
    into v_profile
    from public.perfis
   where id = p_auth_user_id
   for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'ceo_profile_not_found';
  end if;

  if v_profile.papel = 'aluno' then
    perform pg_catalog.set_config('placurso.allow_ceo_role_change', 'true', true);
    perform pg_catalog.set_config('placurso.ceo_role_change_user', p_auth_user_id::text, true);

    update public.perfis
       set papel = 'admin',
           nome_completo = coalesce(nullif(btrim(v_profile.nome_completo), ''), v_nome)
     where id = p_auth_user_id
       and papel = 'aluno'
    returning * into v_profile;
  elsif v_profile.papel <> 'admin' then
    raise exception using errcode = '42501', message = 'ceo_profile_role_not_eligible';
  end if;

  return jsonb_build_object(
    'id', v_profile.id,
    'email', lower(v_identity.email),
    'auth_user_id', v_profile.id,
    'papel', v_profile.papel
  );
end;
$function$;

revoke all on function public.placurso_ceo_bootstrap_profile(uuid) from public, anon, authenticated;
grant execute on function public.placurso_ceo_bootstrap_profile(uuid) to service_role;
