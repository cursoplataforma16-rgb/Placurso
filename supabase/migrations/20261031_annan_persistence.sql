create table if not exists public.annan_learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  source text not null check (source in ('phase3a','crypto','psychotechnical','bible')),
  game text not null check (game in ('memoria','reflexo','dinheiro','negocio','crypto','biblia','psychotechnical')),
  level text,
  correct integer check (correct is null or correct >= 0),
  total integer check (total is null or total > 0),
  score numeric(5,2) check (score is null or (score >= 0 and score <= 100)),
  passed boolean,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, event_id),
  check (correct is null or total is null or correct <= total)
);

create index if not exists idx_annan_learning_events_user_occurred
  on public.annan_learning_events (user_id, occurred_at desc);

create table if not exists public.annan_student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.annan_learning_events enable row level security;
alter table public.annan_student_profiles enable row level security;

create policy "students read own ANNAN learning events"
  on public.annan_learning_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "students insert own ANNAN learning events"
  on public.annan_learning_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "students update own ANNAN learning events"
  on public.annan_learning_events
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "students read own ANNAN profile"
  on public.annan_student_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "students insert own ANNAN profile"
  on public.annan_student_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "students update own ANNAN profile"
  on public.annan_student_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
