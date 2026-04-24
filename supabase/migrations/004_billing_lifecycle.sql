-- ============================================================
-- 004_billing_lifecycle.sql
-- Добавя надеждни Stripe billing полета в profiles и таблица
-- stripe_events за idempotent webhook обработка.
-- profiles.{plan,is_active,plan_expires_at,class,exam_path}
-- остават derived snapshot за access control; canonical source
-- of truth за билинг са Stripe полетата по-долу + webhook-а.
-- ============================================================

alter table public.profiles
  add column if not exists stripe_customer_id      text,
  add column if not exists stripe_subscription_id  text,
  add column if not exists billing_plan_key        text,
  add column if not exists billing_status          text,
  add column if not exists cancel_at_period_end    bool not null default false,
  add column if not exists cancel_at               timestamptz,
  add column if not exists current_period_end      timestamptz,
  add column if not exists last_payment_at         timestamptz,
  add column if not exists last_payment_status     text;

create unique index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists profiles_stripe_subscription_id_idx
  on public.profiles (stripe_subscription_id)
  where stripe_subscription_id is not null;

-- ============================================================
-- stripe_events — dedupe на Stripe webhook събития по event.id.
-- Вмъкваме реда преди да изпълним хендлър. При retry на същото
-- събитие вмъкването ще падне с unique violation и хендлърът
-- няма да се повтори.
-- ============================================================
create table if not exists public.stripe_events (
  id            text primary key,
  type          text not null,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz
);

alter table public.stripe_events enable row level security;

-- Чете/пише само service role (webhook). Без student policies.
drop policy if exists "stripe_events service only" on public.stripe_events;
create policy "stripe_events service only"
  on public.stripe_events
  for all
  using (false)
  with check (false);
