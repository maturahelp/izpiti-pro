-- ============================================================
-- Safety net: skill_mastery and energy_events are queried directly
-- from the browser (lib/mastery.ts, anon key) filtered by
-- `.eq('user_id', user.id)` on the client side. That filter is not a
-- security boundary by itself — without RLS, any authenticated user
-- could read or write any other user's rows via the Supabase REST
-- API directly. No prior migration created these tables or their
-- policies (unlike every other per-user table in this schema), so
-- this migration creates them if missing and (re)applies the same
-- row-owner policy pattern used for test_results / lesson_completions
-- either way. Safe to run whether the tables already exist or not.
-- ============================================================

create table if not exists public.skill_mastery (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  skill_id      text not null,
  skill_name    text not null,
  subject_id    text not null,
  subject_name  text not null,
  level         text not null,
  points        int not null default 0,
  last_score    int,
  updated_at    timestamptz not null default now(),
  unique (user_id, skill_id)
);

create table if not exists public.energy_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  source_id    text not null,
  source_type  text not null,
  points       int not null default 0,
  reason       text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists energy_events_user_created_idx
  on public.energy_events (user_id, created_at desc);

alter table public.skill_mastery enable row level security;
alter table public.energy_events enable row level security;

drop policy if exists "Users can view own skill mastery" on public.skill_mastery;
create policy "Users can view own skill mastery"
  on public.skill_mastery for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own skill mastery" on public.skill_mastery;
create policy "Users can insert own skill mastery"
  on public.skill_mastery for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own skill mastery" on public.skill_mastery;
create policy "Users can update own skill mastery"
  on public.skill_mastery for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can view own energy events" on public.energy_events;
create policy "Users can view own energy events"
  on public.energy_events for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own energy events" on public.energy_events;
create policy "Users can insert own energy events"
  on public.energy_events for insert
  with check (auth.uid() = user_id);
