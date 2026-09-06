-- ============================================================
-- Marketing leads captured from the landing-page discount popup
-- (public/discount-popup.js -> POST /api/leads). Previously this
-- data was only console.log'd and thrown away.
-- ============================================================

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  phone       text,
  source      text not null default 'unknown',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (email)
);

create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

alter table public.leads enable row level security;
