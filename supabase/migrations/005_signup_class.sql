-- ============================================================
-- Allow handle_new_user trigger to capture `class` from auth.users
-- raw_user_meta_data so the user is locked to their chosen exam
-- (НВО / ДЗИ) at registration time.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta_class text;
begin
  meta_class := new.raw_user_meta_data->>'class';
  if meta_class is not null and meta_class not in ('7', '12') then
    meta_class := null;
  end if;

  insert into public.profiles (id, name, class)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    meta_class
  );
  return new;
end;
$$;
