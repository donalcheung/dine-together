-- phone_leads: stores phone numbers captured from the landing page download flow
create table if not exists public.phone_leads (
  id            uuid primary key default gen_random_uuid(),
  phone         text not null unique,          -- E.164 format, e.g. +12125551234
  source        text not null default 'direct', -- 'hero', 'cta', 'direct', or referer URL
  created_at    timestamptz not null default now(),
  last_requested_at timestamptz not null default now()
);

-- Index for quick lookup by phone
create index if not exists phone_leads_phone_idx on public.phone_leads (phone);

-- RLS: only service role can read/write (marketing team uses Supabase dashboard)
alter table public.phone_leads enable row level security;

-- No public read/write — all access goes through the service role key in the API route
-- (The API route uses SUPABASE_SERVICE_ROLE_KEY or anon key with no public policy)
