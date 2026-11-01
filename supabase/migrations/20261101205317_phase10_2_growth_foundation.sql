-- Generated migration record: 20261101205317_phase10_2_growth_foundation
-- Additive Phase 10.2 schema. Sensitive records are server-only.
create table if not exists public.growth_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('facebook','instagram','tiktok','youtube','whatsapp','x')),
  external_account_id text,
  display_name text,
  account_type text,
  connection_state text not null default 'disconnected' check (connection_state in ('disconnected','pending','connected','revoked','error')),
  capabilities jsonb not null default '[]'::jsonb check (jsonb_typeof(capabilities) = 'array'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists growth_accounts_platform_external_uq
  on public.growth_accounts(platform, external_account_id)
  where external_account_id is not null;
create index if not exists growth_accounts_state_idx
  on public.growth_accounts(connection_state, platform);

create table if not exists public.growth_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 120),
  objective text not null check (objective in ('awareness','traffic','leads','enrollments','sales')),
  audience text not null default '' check (length(audience) <= 600),
  offer text not null default '' check (length(offer) <= 600),
  budget_limit numeric(16,2) not null default 0 check (budget_limit >= 0),
  currency text not null default 'AOA' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'draft' check (status in ('draft','active','paused','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists growth_campaigns_owner_status_idx
  on public.growth_campaigns(created_by, status, created_at desc);

create table if not exists public.growth_contents (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict,
  campaign_id uuid references public.growth_campaigns(id) on delete set null,
  platform text not null check (platform in ('facebook','instagram','tiktok','youtube','whatsapp','x')),
  format text not null check (format in ('text','image','video','reel','carousel','story','short')),
  body text not null default '' check (length(body) <= 8000),
  asset_refs jsonb not null default '[]'::jsonb check (jsonb_typeof(asset_refs) = 'array'),
  version integer not null default 1 check (version > 0),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  status text not null default 'draft' check (status in ('draft','pending_approval','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists growth_contents_owner_status_idx
  on public.growth_contents(created_by, status, created_at desc);
create index if not exists growth_contents_campaign_idx
  on public.growth_contents(campaign_id, created_at desc);

create table if not exists public.growth_approvals (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.growth_contents(id) on delete cascade,
  content_version integer not null check (content_version > 0),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  decision text not null check (decision in ('approved','rejected')),
  decided_by uuid not null references auth.users(id) on delete restrict,
  reason text not null default '' check (length(reason) <= 500),
  created_at timestamptz not null default now(),
  unique (content_id, content_version, content_hash)
);
create index if not exists growth_approvals_content_idx
  on public.growth_approvals(content_id, created_at desc);

create table if not exists public.growth_publications (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.growth_contents(id) on delete restrict,
  account_id uuid not null references public.growth_accounts(id) on delete restrict,
  approved_version integer not null check (approved_version > 0),
  idempotency_key text not null unique,
  status text not null default 'draft' check (status in ('draft','queued','scheduled','published','failed','cancelled')),
  provider_post_id text,
  scheduled_at timestamptz,
  published_at timestamptz,
  safe_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists growth_publications_status_idx
  on public.growth_publications(status, scheduled_at);

create table if not exists public.growth_metrics (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.growth_accounts(id) on delete restrict,
  publication_id uuid references public.growth_publications(id) on delete cascade,
  platform text not null check (platform in ('facebook','instagram','tiktok','youtube','whatsapp','x')),
  metric_name text not null check (length(btrim(metric_name)) between 1 and 80),
  metric_value numeric(24,6) not null,
  source text not null check (source in ('provider_api','webhook','verified_import')),
  window_start timestamptz,
  window_end timestamptz,
  collected_at timestamptz not null default now(),
  check (window_end is null or window_start is null or window_end >= window_start)
);
create unique index if not exists growth_metrics_publication_window_uq
  on public.growth_metrics(publication_id, metric_name, window_start, window_end)
  where publication_id is not null;
create index if not exists growth_metrics_account_time_idx
  on public.growth_metrics(account_id, collected_at desc);

create table if not exists public.growth_audit_log (
  id uuid primary key default gen_random_uuid(),
  request_id text not null unique check (length(btrim(request_id)) between 8 and 128),
  actor_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (length(btrim(action)) between 1 and 80),
  object_type text not null check (object_type in ('account','campaign','content','approval','publication','metric')),
  object_id uuid,
  outcome text not null default 'started' check (outcome in ('started','success','failed')),
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists growth_audit_actor_time_idx
  on public.growth_audit_log(actor_id, created_at desc);
create index if not exists growth_audit_object_idx
  on public.growth_audit_log(object_type, object_id, created_at desc);

create or replace function public.growth_decide_approval(
  p_content_id uuid,
  p_content_version integer,
  p_content_hash text,
  p_decision text,
  p_actor_id uuid,
  p_reason text default ''
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_content public.growth_contents%rowtype;
  v_updated public.growth_contents%rowtype;
  v_approval_id uuid;
begin
  if p_decision is null or p_decision not in ('approved','rejected') then
    raise exception using errcode = '23514', message = 'growth_invalid_decision';
  end if;

  select * into v_content
  from public.growth_contents
  where id = p_content_id
  for update;

  if not found
    or v_content.status <> 'pending_approval'
    or v_content.version <> p_content_version
    or v_content.content_hash <> p_content_hash then
    raise exception using errcode = '23505', message = 'growth_stale_content_version';
  end if;

  insert into public.growth_approvals (
    content_id, content_version, content_hash, decision, decided_by, reason
  ) values (
    p_content_id, p_content_version, p_content_hash, p_decision, p_actor_id, coalesce(p_reason, '')
  ) returning id into v_approval_id;

  update public.growth_contents
  set status = p_decision, updated_at = now()
  where id = p_content_id
  returning * into v_updated;

  return jsonb_build_object(
    'approval_id', v_approval_id,
    'content', to_jsonb(v_updated)
  );
end;
$function$;

alter table public.growth_accounts enable row level security;
alter table public.growth_campaigns enable row level security;
alter table public.growth_contents enable row level security;
alter table public.growth_approvals enable row level security;
alter table public.growth_publications enable row level security;
alter table public.growth_metrics enable row level security;
alter table public.growth_audit_log enable row level security;

revoke all privileges on table public.growth_accounts from anon, public, authenticated;
revoke all privileges on table public.growth_campaigns from anon, public, authenticated;
revoke all privileges on table public.growth_contents from anon, public, authenticated;
revoke all privileges on table public.growth_approvals from anon, public, authenticated;
revoke all privileges on table public.growth_publications from anon, public, authenticated;
revoke all privileges on table public.growth_metrics from anon, public, authenticated;
revoke all privileges on table public.growth_audit_log from anon, public, authenticated;

grant all privileges on table public.growth_accounts to service_role;
grant all privileges on table public.growth_campaigns to service_role;
grant all privileges on table public.growth_contents to service_role;
grant all privileges on table public.growth_approvals to service_role;
grant all privileges on table public.growth_publications to service_role;
grant all privileges on table public.growth_metrics to service_role;
grant all privileges on table public.growth_audit_log to service_role;

revoke all on function public.growth_decide_approval(uuid, integer, text, text, uuid, text) from public, anon, authenticated;
grant execute on function public.growth_decide_approval(uuid, integer, text, text, uuid, text) to service_role;
