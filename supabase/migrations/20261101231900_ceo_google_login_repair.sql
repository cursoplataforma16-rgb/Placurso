-- Release the former CEO Auth UUID and configure the one permitted main Google identity.
-- Keep the existing anti-escalation trigger enabled: its admin check is satisfied
-- only for the previously linked CEO UUID, scoped to this migration transaction.
do $migration$
declare
  v_identity public.growth_ceo_identity%rowtype;
  v_demoted_count integer;
begin
  select *
    into v_identity
    from public.growth_ceo_identity
   where id = 1
   for update;

  if not found
     or lower(v_identity.email) <> 'johnjunior.tchek@gmail.com'
     or v_identity.auth_user_id is null then
    raise exception 'CEO identity did not match the expected previous mapping; migration aborted';
  end if;

  perform set_config('request.jwt.claim.sub', v_identity.auth_user_id::text, true);

  update public.perfis
     set papel = 'aluno'
   where id = v_identity.auth_user_id
     and papel = 'admin';

  get diagnostics v_demoted_count = row_count;
  if v_demoted_count <> 1 then
    raise exception 'Expected to demote exactly one former CEO admin profile; migration aborted';
  end if;

  update public.growth_ceo_identity
     set email = 'belcianycosmedionisio@gmail.com',
         auth_user_id = null,
         claimed_at = null,
         updated_at = now()
   where id = 1;
end
$migration$;
