-- 0006_analytics.sql — per-paragraph reading analytics (micro events).
-- Consumer = phase-06 admin dashboard (drop-off, completion %, median read time).
-- GA4 keeps macro (traffic/page views); this is micro (per-paragraph dwell).

create table if not exists public.reading_events (
  id          bigint generated always as identity primary key,
  content_id  text references public.content(id) on delete cascade,
  session_id  text,                                  -- anon client session (no PII)
  para_index  integer,                               -- paragraph ordinal within content
  dwell_ms    integer,                               -- ms this paragraph was in viewport
  reached_end boolean not null default false,
  ts          timestamptz not null default now()
);

create index if not exists idx_reading_events_content on public.reading_events(content_id, para_index);
create index if not exists idx_reading_events_session on public.reading_events(session_id, ts);
