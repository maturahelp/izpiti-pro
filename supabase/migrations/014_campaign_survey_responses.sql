-- ============================================================
-- Survey responses for time-sensitive marketing campaigns.
-- Currently used by the final DZI campaign before 20 May 2026.
-- ============================================================

create table if not exists public.campaign_survey_responses (
  id                 uuid primary key default gen_random_uuid(),
  campaign_key       text not null,
  email              text not null,
  user_id            uuid references auth.users(id) on delete set null,
  blocker_key        text not null,
  help_need_key      text not null,
  start_trigger_key  text not null,
  free_text          text,
  discount_code      text not null,
  source             text not null default 'unknown',
  class_snapshot     text,
  plan_snapshot      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (campaign_key, email)
);

create index if not exists campaign_survey_responses_campaign_idx
  on public.campaign_survey_responses (campaign_key, created_at desc);

alter table public.campaign_survey_responses enable row level security;
