-- ============================================================
-- consent_logs — audit trail for legal and checkout consent
-- ============================================================
create table if not exists public.consent_logs (
  id                              uuid primary key default gen_random_uuid(),
  user_id                         uuid not null references auth.users(id) on delete cascade,
  context                         text not null check (context in ('registration', 'checkout')),
  legal_version                   text not null,
  accepted_terms_privacy          bool not null default false,
  confirmed_age_14                bool not null default false,
  immediate_access_acknowledged   bool not null default false,
  marketing_emails                bool not null default false,
  auto_renew_notice_shown         bool not null default false,
  user_agent                      text not null default '',
  created_at                      timestamptz not null default now()
);

alter table public.consent_logs enable row level security;

drop policy if exists "Users can view own consent logs" on public.consent_logs;
create policy "Users can view own consent logs"
  on public.consent_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own checkout consent logs" on public.consent_logs;
create policy "Users can insert own checkout consent logs"
  on public.consent_logs for insert
  with check (auth.uid() = user_id and context = 'checkout');

-- Auto-create profile and persist registration consent metadata on signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(metadata->>'name', split_part(new.email, '@', 1)));

  if metadata->>'consent_context' = 'registration' then
    insert into public.consent_logs (
      user_id,
      context,
      legal_version,
      accepted_terms_privacy,
      confirmed_age_14,
      immediate_access_acknowledged,
      marketing_emails,
      auto_renew_notice_shown,
      user_agent
    )
    values (
      new.id,
      'registration',
      coalesce(metadata->>'legal_version', 'unknown'),
      coalesce((metadata->>'accepted_terms_privacy')::boolean, false),
      coalesce((metadata->>'confirmed_age_14')::boolean, false),
      coalesce((metadata->>'immediate_access_acknowledged')::boolean, false),
      coalesce((metadata->>'marketing_emails')::boolean, false),
      coalesce((metadata->>'auto_renew_notice_shown')::boolean, false),
      coalesce(metadata->>'consent_user_agent', '')
    );
  end if;

  return new;
end;
$$;
