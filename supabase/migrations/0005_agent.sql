-- 0005_agent.sql — agent write plane: API keys + audit log + profiles.
-- Ported from D1 workers/api/migrations/0001_init.sql. Agents write via Worker service_role
-- (bypasses RLS by design); keys validated by the Worker (phase-05). profiles = human roles.

-- Human profiles. id = auth.users.id (Supabase Auth managed; populated in phase-03).
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'user' check (role in ('user','mod','admin')),
  display_name text,
  bio          text,
  created_at   timestamptz not null default now()
);

-- Per-agent API keys. Raw key never stored — SHA-256 hash only (show-once on create).
create table if not exists public.api_keys (
  id           text primary key default gen_random_uuid()::text,
  key_hash     text not null unique,
  agent_name   text not null,
  scopes       text not null,                        -- comma list: content:read,content:write,media:write
  created_at   timestamptz not null default now(),
  created_by   text,                                 -- admin uid
  revoked_at   timestamptz,
  last_used_at timestamptz
);

create index if not exists idx_api_keys_active on public.api_keys(key_hash) where revoked_at is null;

-- Audit trail: which agent did what, when.
create table if not exists public.agent_audit_log (
  id          text primary key default gen_random_uuid()::text,
  key_id      text references public.api_keys(id) on delete set null,
  agent_name  text,
  action      text,                                  -- content.create | content.update | media.upload | ...
  content_id  text,
  ts          timestamptz not null default now(),
  status_code integer,
  detail      text
);

create index if not exists idx_audit_ts on public.agent_audit_log(ts);
create index if not exists idx_audit_key on public.agent_audit_log(key_id, ts);

-- Helper: is the current authed user an admin? Used by RLS policies (0007).
-- SECURITY DEFINER (runs as owner) is REQUIRED: it reads public.profiles, and profiles
-- itself has RLS policies that call is_admin() — without DEFINER this recurses / permission-
-- denies. DEFINER bypasses RLS on profiles for this narrow check. search_path pinned to
-- avoid hijacking. Grant execute to the Supabase client roles.
create or replace function public.is_admin()
  returns boolean
  language sql
  stable
  security definer
  set search_path = public, auth
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;
