-- ============================================================
-- 012_nvo_plan_progress — store per-user completion of the
-- NVO 29-day daily plan tasks.
--
-- Един ред = един завършен task. Композитен ключ (user_id, day, task_idx)
-- предотвратява двойни вписвания. completed_at се ползва за streak/прогрес.
-- ============================================================

create table if not exists public.nvo_plan_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  day_index    smallint not null check (day_index between 1 and 29),
  task_index   smallint not null check (task_index >= 0),
  completed_at timestamptz not null default now(),
  primary key (user_id, day_index, task_index)
);

create index if not exists idx_nvo_plan_progress_user_day
  on public.nvo_plan_progress (user_id, day_index);

create index if not exists idx_nvo_plan_progress_user_completed_at
  on public.nvo_plan_progress (user_id, completed_at desc);

-- RLS — само собственикът чете/пише.
alter table public.nvo_plan_progress enable row level security;

drop policy if exists "users select own plan progress" on public.nvo_plan_progress;
create policy "users select own plan progress"
  on public.nvo_plan_progress
  for select
  using (auth.uid() = user_id);

drop policy if exists "users insert own plan progress" on public.nvo_plan_progress;
create policy "users insert own plan progress"
  on public.nvo_plan_progress
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "users delete own plan progress" on public.nvo_plan_progress;
create policy "users delete own plan progress"
  on public.nvo_plan_progress
  for delete
  using (auth.uid() = user_id);
