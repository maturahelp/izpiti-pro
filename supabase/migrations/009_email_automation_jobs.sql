-- ============================================================
-- Email automation queue for post-purchase and nurture emails
-- ============================================================

create table if not exists public.email_automation_jobs (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  template_key         text not null check (
    template_key in (
      'purchase_welcome',
      'purchase_feedback',
      'grade12_no_purchase_nudge'
    )
  ),
  status               text not null default 'pending' check (
    status in ('pending', 'processing', 'sent', 'failed', 'skipped', 'canceled')
  ),
  dedupe_key           text unique,
  email                text,
  payload              jsonb not null default '{}'::jsonb,
  attempts             integer not null default 0,
  scheduled_for        timestamptz not null,
  processing_started_at timestamptz,
  sent_at              timestamptz,
  canceled_at          timestamptz,
  provider_message_id  text,
  last_error           text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists email_automation_jobs_status_scheduled_idx
  on public.email_automation_jobs (status, scheduled_for asc);

create index if not exists email_automation_jobs_user_template_idx
  on public.email_automation_jobs (user_id, template_key, created_at desc);

alter table public.email_automation_jobs enable row level security;

grant select, insert, update, delete
  on table public.email_automation_jobs
  to service_role;

create or replace function public.queue_grade12_no_purchase_nudge()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.role, '') = 'admin' then
    return new;
  end if;

  if new.class = '12'
     and not (
       new.plan = 'premium'
       and coalesce(new.is_active, true) <> false
       and (new.plan_expires_at is null or new.plan_expires_at > now())
     ) then
    insert into public.email_automation_jobs (
      user_id,
      template_key,
      status,
      dedupe_key,
      payload,
      scheduled_for,
      updated_at
    )
    values (
      new.id,
      'grade12_no_purchase_nudge',
      'pending',
      'grade12-no-purchase:' || new.id::text,
      jsonb_build_object('source', 'profiles-trigger', 'class_snapshot', new.class),
      now() + interval '3 hours',
      now()
    )
    on conflict (dedupe_key) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists queue_grade12_no_purchase_nudge_on_profiles on public.profiles;

create trigger queue_grade12_no_purchase_nudge_on_profiles
after insert or update of class, plan, is_active, plan_expires_at, role
on public.profiles
for each row
execute function public.queue_grade12_no_purchase_nudge();
