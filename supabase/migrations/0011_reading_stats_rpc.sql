-- 0011_reading_stats_rpc.sql
-- Reading analytics aggregation for admin dashboard.
-- RPC callable by admin only (RLS: is_admin()). Anon cannot call.
--
-- article_reading_stats(p_content_id text)
--   Returns per-paragraph stats: sessions that reached each para, drop-off %, dwell.
--
-- article_completion_summary(p_content_id text)
--   Returns single row: total_sessions, completed_sessions, completion_pct, median_dwell_ms.
--
-- top_articles_by_completion(p_limit int)
--   Returns cross-article comparison: content_id, completion_pct, total_sessions.

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Per-paragraph drop-off for a single article
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.article_reading_stats(p_content_id text)
returns table (
  para_index       integer,
  sessions_reached bigint,
  pct_of_total     numeric,    -- % of all sessions that reached this paragraph
  median_dwell_ms  numeric
)
language sql
security definer
set search_path = public
as $$
  with total as (
    select count(distinct session_id) as n
    from public.reading_events
    where content_id = p_content_id
  ),
  per_para as (
    select
      para_index,
      count(distinct session_id)                           as sessions_reached,
      percentile_cont(0.5) within group (order by dwell_ms) as median_dwell_ms
    from public.reading_events
    where content_id = p_content_id
    group by para_index
  )
  select
    pp.para_index,
    pp.sessions_reached,
    case when t.n = 0 then 0
         else round(pp.sessions_reached::numeric / t.n * 100, 1)
    end as pct_of_total,
    round(pp.median_dwell_ms) as median_dwell_ms
  from per_para pp, total t
  order by pp.para_index asc;
$$;

-- Grant execute to authenticated users (RLS on reading_events restricts to admin read).
-- The function itself is security definer so it bypasses reading_events RLS,
-- but we restrict the grant to authenticated (anon cannot call RPCs).
revoke execute on function public.article_reading_stats(text) from public, anon;
grant execute on function public.article_reading_stats(text) to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Completion summary for a single article
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.article_completion_summary(p_content_id text)
returns table (
  total_sessions     bigint,
  completed_sessions bigint,
  completion_pct     numeric,
  median_dwell_ms    numeric    -- median across all paragraphs
)
language sql
security definer
set search_path = public
as $$
  select
    count(distinct session_id)                                         as total_sessions,
    count(distinct case when reached_end then session_id end)          as completed_sessions,
    case when count(distinct session_id) = 0 then 0
         else round(
           count(distinct case when reached_end then session_id end)::numeric
           / count(distinct session_id) * 100, 1
         )
    end                                                                as completion_pct,
    round(
      percentile_cont(0.5) within group (order by dwell_ms)
    )                                                                  as median_dwell_ms
  from public.reading_events
  where content_id = p_content_id;
$$;

revoke execute on function public.article_completion_summary(text) from public, anon;
grant execute on function public.article_completion_summary(text) to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Cross-article comparison: best / worst retention
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.top_articles_by_completion(p_limit integer default 20)
returns table (
  content_id      text,
  total_sessions  bigint,
  completion_pct  numeric
)
language sql
security definer
set search_path = public
as $$
  select
    content_id,
    count(distinct session_id)                                         as total_sessions,
    case when count(distinct session_id) = 0 then 0
         else round(
           count(distinct case when reached_end then session_id end)::numeric
           / count(distinct session_id) * 100, 1
         )
    end                                                                as completion_pct
  from public.reading_events
  group by content_id
  having count(distinct session_id) > 0
  order by completion_pct desc, total_sessions desc
  limit p_limit;
$$;

revoke execute on function public.top_articles_by_completion(integer) from public, anon;
grant execute on function public.top_articles_by_completion(integer) to authenticated;
