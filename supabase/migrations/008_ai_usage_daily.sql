-- ============================================================
-- 008_ai_usage_daily — switch AI quota from weekly to daily.
-- Renames ai_usage.week_start → period_start and replaces
-- check_and_increment_ai_usage() to bucket by current_date.
-- ============================================================

alter table if exists public.ai_usage
  rename column week_start to period_start;

create or replace function public.check_and_increment_ai_usage(
  p_user_id uuid,
  p_limit   int
) returns int language plpgsql security definer set search_path = public as $$
declare
  v_period_start date := current_date;
  v_count        int;
begin
  insert into public.ai_usage (user_id, period_start, count, updated_at)
  values (p_user_id, v_period_start, 0, now())
  on conflict (user_id) do update
    set period_start = case
                         when public.ai_usage.period_start <> excluded.period_start then excluded.period_start
                         else public.ai_usage.period_start
                       end,
        count        = case
                         when public.ai_usage.period_start <> excluded.period_start then 0
                         else public.ai_usage.count
                       end,
        updated_at   = now();

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
