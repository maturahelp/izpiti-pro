-- Allow 4th grade NVO accounts and signup metadata.

alter table public.profiles
  drop constraint if exists profiles_class_check;

alter table public.profiles
  add constraint profiles_class_check
  check (class in ('4', '7', '12'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta_class text;
begin
  meta_class := new.raw_user_meta_data->>'class';
  if meta_class is not null and meta_class not in ('4', '7', '12') then
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
