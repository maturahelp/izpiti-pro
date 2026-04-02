-- ============================================================
-- profiles — разширява auth.users с допълнителни данни
-- ============================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null default '',
  role          text not null default 'student' check (role in ('student', 'admin')),
  class         text check (class in ('7', '12')),
  exam_path     text not null default 'НВО',
  plan          text not null default 'free' check (plan in ('free', 'premium')),
  streak_days   int  not null default 0,
  is_active     bool not null default true,
  plan_expires_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- test_results — резултати от тестове
-- ============================================================
create table if not exists public.test_results (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  test_id     text not null,
  test_name   text not null,
  score       int  not null check (score >= 0 and score <= 100),
  subject     text not null default '',
  completed_at timestamptz not null default now()
);

alter table public.test_results enable row level security;

create policy "Users can view own test results"
  on public.test_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own test results"
  on public.test_results for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- lesson_completions — завършени уроци
-- ============================================================
create table if not exists public.lesson_completions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  lesson_id   text not null,
  lesson_title text not null,
  completed_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

alter table public.lesson_completions enable row level security;

create policy "Users can view own lesson completions"
  on public.lesson_completions for select
  using (auth.uid() = user_id);

create policy "Users can insert own lesson completions"
  on public.lesson_completions for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- topic_scores — резултати по теми (за слаби/силни теми)
-- ============================================================
create table if not exists public.topic_scores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  topic_name  text not null,
  subject_name text not null,
  score       int  not null check (score >= 0 and score <= 100),
  recorded_at timestamptz not null default now()
);

alter table public.topic_scores enable row level security;

create policy "Users can view own topic scores"
  on public.topic_scores for select
  using (auth.uid() = user_id);

create policy "Users can insert own topic scores"
  on public.topic_scores for insert
  with check (auth.uid() = user_id);
