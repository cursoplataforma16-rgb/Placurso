-- Provision a CEO profile only from the single confirmed Google identity in the database.
-- All other newly created Auth users continue to receive the ordinary student role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_ceo_email text;
  v_is_ceo boolean := false;
  v_providers jsonb := coalesce(new.raw_app_meta_data->'providers', '[]'::jsonb);
begin
  select lower(email)
    into v_ceo_email
    from public.growth_ceo_identity
   where id = 1;

  v_is_ceo :=
    v_ceo_email is not null
    and nullif(lower(btrim(coalesce(new.email, ''))), '') = v_ceo_email
    and new.email_confirmed_at is not null
    and (
      lower(coalesce(new.raw_app_meta_data->>'provider', '')) = 'google'
      or (jsonb_typeof(v_providers) = 'array' and v_providers ? 'google')
    );

  insert into public.perfis (id, nome_completo, pais, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_completo', ''),
    new.raw_user_meta_data->>'pais',
    case when v_is_ceo then 'admin' else 'aluno' end
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;
