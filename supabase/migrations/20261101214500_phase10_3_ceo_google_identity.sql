-- Phase 10.3: one-time CEO identity claim anchored to a confirmed Google Auth user.
create table if not exists public.growth_ceo_identity (
  id smallint primary key check (id = 1),
  email text not null check (email = lower(email)),
  auth_user_id uuid unique references auth.users(id) on delete restrict,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.growth_ceo_identity enable row level security;

revoke all privileges on table public.growth_ceo_identity from public;
revoke all privileges on table public.growth_ceo_identity from anon;
revoke all privileges on table public.growth_ceo_identity from authenticated;
grant select, update on table public.growth_ceo_identity to service_role;

insert into public.growth_ceo_identity (id, email)
values (1, 'johnjunior.tchek@gmail.com')
on conflict (id) do nothing;
