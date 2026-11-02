-- Phase 10.5 — OAuth state and encrypted credentials.
-- All access is through the authenticated server-side Edge Function only.

create table if not exists public.growth_oauth_states (
  state_hash text primary key check (state_hash ~ '^[a-f0-9]{64}$'),
  platform text not null check (platform in ('meta','youtube','whatsapp')),
  created_by uuid not null references auth.users(id) on delete cascade,
  code_verifier text,
  requested_scopes text[] not null default '{}'::text[],
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at),
  check (used_at is null or used_at <= expires_at)
);

create index if not exists growth_oauth_states_expiry_idx
  on public.growth_oauth_states(expires_at);
create index if not exists growth_oauth_states_owner_idx
  on public.growth_oauth_states(created_by, created_at desc);

create table if not exists public.growth_oauth_credentials (
  account_id uuid primary key references public.growth_accounts(id) on delete cascade,
  encrypted_access_token text not null,
  encrypted_refresh_token text,
  token_expires_at timestamptz,
  token_type text not null default 'Bearer',
  scopes text[] not null default '{}'::text[],
  encryption_version smallint not null default 1 check (encryption_version = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists growth_oauth_credentials_expiry_idx
  on public.growth_oauth_credentials(token_expires_at)
  where token_expires_at is not null;

alter table public.growth_oauth_states enable row level security;
alter table public.growth_oauth_credentials enable row level security;

revoke all privileges on table public.growth_oauth_states from anon, public, authenticated;
revoke all privileges on table public.growth_oauth_credentials from anon, public, authenticated;

grant all privileges on table public.growth_oauth_states to service_role;
grant all privileges on table public.growth_oauth_credentials to service_role;
