-- 0004_engagement.sql — comments, donations, donation_contacts, contacts.
-- Matches current Firestore field shapes + moderation status enums.
-- RLS (public create / admin moderate / PII lockdown) lives in 0007_rls.sql.

-- Comments: public create, admin update/delete. status gates public visibility.
create table if not exists public.comments (
  id          text primary key default gen_random_uuid()::text,
  content_id  text references public.content(id) on delete cascade,
  author_name text,
  body        text not null,
  status      text not null default 'visible' check (status in ('visible','hidden','pending')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_comments_content on public.comments(content_id, created_at desc);

-- Donations: public create (pending), admin moderate. Only status='approved' is public-readable.
create table if not exists public.donations (
  id          text primary key default gen_random_uuid()::text,
  amount      numeric,
  channel     text,                                  -- bank / momo / ...
  donor_name  text,                                  -- display name (non-PII, optional)
  message     text,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_donations_status on public.donations(status, created_at desc);

-- Donor PII (email/phone/realName) — admin-only. Separated from donations for RLS lockdown.
create table if not exists public.donation_contacts (
  id          text primary key default gen_random_uuid()::text,
  donation_id text references public.donations(id) on delete cascade,
  real_name   text,
  email       text,
  phone       text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_donation_contacts_donation on public.donation_contacts(donation_id);

-- Contact form: public create, admin read only.
create table if not exists public.contacts (
  id         text primary key default gen_random_uuid()::text,
  name       text,
  email      text,
  phone      text,
  message    text,
  created_at timestamptz not null default now()
);
