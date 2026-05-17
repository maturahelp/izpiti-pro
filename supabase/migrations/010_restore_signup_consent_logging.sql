-- ============================================================
-- Restore registration consent logging while preserving signup class
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  meta_class text;
begin
  meta_class := metadata->>'class';
  if meta_class is not null and meta_class not in ('4', '7', '12') then
    meta_class := null;
  end if;

  insert into public.profiles (id, name, class)
  values (
    new.id,
    coalesce(metadata->>'name', split_part(new.email, '@', 1)),
    meta_class
  );

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
