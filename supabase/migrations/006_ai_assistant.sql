-- ============================================================
-- 006_ai_assistant.sql
-- AI помощник: pgvector RAG корпус, разговори, съобщения и квота.
-- Векторите идват от Gemini gemini-embedding-001 (outputDimensionality=768).
-- ============================================================

create extension if not exists vector;

-- ============================================================
-- content_chunks — embed-нати парчета съдържание (RAG корпус).
-- Само service role има достъп; user roles не виждат корпуса.
-- ============================================================
create table if not exists public.content_chunks (
  id            uuid primary key default gen_random_uuid(),
  source        text not null,          -- 'lit-summary' | 'nvo-lit-summary' | 'bel-theory' | 'lesson' | 'curriculum' | 'dzi-qbank' | 'nvo-qbank' | 'bel-topics-qbank'
  source_id     text not null,          -- e.g. 'lit-01', 'lesson-1', 'topic-3'
  section       text not null default '',
  grade         smallint,               -- 7 | 12 | NULL
  exam_type     text,                   -- 'nvo7' | 'dzi' | NULL
  title         text,                   -- човешко име за цитиране ("Железният светилник", "Lesson: Представки …")
  content       text not null,
  embedding     vector(768) not null,
  created_at    timestamptz not null default now(),
  unique (source, source_id, section)
);

create index if not exists content_chunks_embedding_idx
  on public.content_chunks using hnsw (embedding vector_cosine_ops);
create index if not exists content_chunks_source_idx
  on public.content_chunks (source);
create index if not exists content_chunks_grade_idx
  on public.content_chunks (grade);

-- Hard lock: никой role освен service_role не пипа корпуса.
alter table public.content_chunks enable row level security;
revoke all on public.content_chunks from public, anon, authenticated;
grant all on public.content_chunks to service_role;
-- Никаква policy за authenticated/anon — RLS ги отрязва изцяло.

-- Вектор-търсене с опционални филтри по grade и source.
create or replace function public.match_content_chunks(
  query_embedding vector(768),
  match_count     int default 6,
  grade_filter    smallint default null,
  source_filter   text default null
) returns table (
  id uuid,
  source text,
  source_id text,
  section text,
  grade smallint,
  exam_type text,
  title text,
  content text,
  similarity float
) language sql stable security definer set search_path = public as $$
  select
    cc.id, cc.source, cc.source_id, cc.section,
    cc.grade, cc.exam_type, cc.title, cc.content,
    1 - (cc.embedding <=> query_embedding) as similarity
  from public.content_chunks cc
  where (grade_filter is null or cc.grade = grade_filter)
    and (source_filter is null or cc.source = source_filter)
  order by cc.embedding <=> query_embedding
  limit match_count;
$$;

revoke all on function public.match_content_chunks(vector, int, smallint, text)
  from public, anon, authenticated;
grant execute on function public.match_content_chunks(vector, int, smallint, text)
  to service_role;

-- ============================================================
-- ai_conversations — нишки от диалог per user.
-- ============================================================
create table if not exists public.ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists ai_conversations_user_idx
  on public.ai_conversations (user_id, updated_at desc);

alter table public.ai_conversations enable row level security;

drop policy if exists "ai_conversations select own" on public.ai_conversations;
create policy "ai_conversations select own"
  on public.ai_conversations for select
  using (auth.uid() = user_id);

drop policy if exists "ai_conversations insert own" on public.ai_conversations;
create policy "ai_conversations insert own"
  on public.ai_conversations for insert
  with check (auth.uid() = user_id);

drop policy if exists "ai_conversations update own" on public.ai_conversations;
create policy "ai_conversations update own"
  on public.ai_conversations for update
  using (auth.uid() = user_id);

drop policy if exists "ai_conversations delete own" on public.ai_conversations;
create policy "ai_conversations delete own"
  on public.ai_conversations for delete
  using (auth.uid() = user_id);

-- ============================================================
-- ai_messages — отделните съобщения в нишка.
-- ============================================================
create table if not exists public.ai_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role            text not null check (role in ('user','assistant')),
  content         text not null,
  created_at      timestamptz not null default now()
);
create index if not exists ai_messages_conversation_idx
  on public.ai_messages (conversation_id, created_at);

alter table public.ai_messages enable row level security;

drop policy if exists "ai_messages select own" on public.ai_messages;
create policy "ai_messages select own"
  on public.ai_messages for select
  using (
    auth.uid() = (
      select c.user_id from public.ai_conversations c
      where c.id = ai_messages.conversation_id
    )
  );

drop policy if exists "ai_messages insert own" on public.ai_messages;
create policy "ai_messages insert own"
  on public.ai_messages for insert
  with check (
    auth.uid() = (
      select c.user_id from public.ai_conversations c
      where c.id = ai_messages.conversation_id
    )
  );

-- ============================================================
-- ai_usage — седмична квота per user.
-- week_start = ISO Monday. При нова седмица записът се ресетва от
-- check_and_increment_ai_usage() (атомарно).
-- ============================================================
create table if not exists public.ai_usage (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  week_start   date not null,
  count        int  not null default 0,
  updated_at   timestamptz not null default now()
);

alter table public.ai_usage enable row level security;

drop policy if exists "ai_usage select own" on public.ai_usage;
create policy "ai_usage select own"
  on public.ai_usage for select
  using (auth.uid() = user_id);

-- ============================================================
-- check_and_increment_ai_usage — атомарна квота.
-- p_limit:
--   * NULL → неограничено (премиум). Връща -1 (sentinel).
--   * INT  → free план; връща remaining (≥0) при успех или -1 при превишаване.
-- Атомарността се постига в две стъпки в една транзакция:
--   1. INSERT … ON CONFLICT DO UPDATE: ресетва count при нова седмица
--      и хваща row lock върху редa.
--   2. Условен UPDATE с RETURNING: единичен оператор, който или
--      инкрементира (когато count<limit), или връща 0 реда. Заради row
--      lock-а от стъпка 1, паралелните транзакции се сериализират.
-- ============================================================
create or replace function public.check_and_increment_ai_usage(
  p_user_id uuid,
  p_limit   int
) returns int language plpgsql security definer set search_path = public as $$
declare
  v_week_start date := date_trunc('week', now())::date;  -- ISO: Monday
  v_count      int;
begin
  insert into public.ai_usage (user_id, week_start, count, updated_at)
  values (p_user_id, v_week_start, 0, now())
  on conflict (user_id) do update
    set week_start = case
                       when public.ai_usage.week_start <> excluded.week_start then excluded.week_start
                       else public.ai_usage.week_start
                     end,
        count      = case
                       when public.ai_usage.week_start <> excluded.week_start then 0
                       else public.ai_usage.count
                     end,
        updated_at = now();

  update public.ai_usage
     set count = count + 1, updated_at = now()
   where user_id = p_user_id
     and (p_limit is null or count < p_limit)
   returning count into v_count;

  if v_count is null then
    return -1;
  end if;

  if p_limit is null then
    return -1;            -- sentinel: "неограничено"
  end if;

  return greatest(p_limit - v_count, 0);
end;
$$;

revoke all on function public.check_and_increment_ai_usage(uuid, int) from public, anon, authenticated;
grant execute on function public.check_and_increment_ai_usage(uuid, int) to service_role;
