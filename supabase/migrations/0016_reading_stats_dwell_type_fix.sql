-- 0016_reading_stats_dwell_type_fix.sql
-- Fix: "structure of query does not match function result type" on the admin
-- content-analytics detail view.
--
-- reading_events.dwell_ms is integer, so percentile_cont(0.5) within group
-- (order by dwell_ms) picks the double-precision variant, and round(double
-- precision) stays double precision — but both functions declare
-- median_dwell_ms as numeric. Cast the percentile to numeric so the returned
-- column type matches the declared one.
--
-- Signatures, guards and result shape are unchanged; the admin client is
-- unaffected.

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Per-paragraph drop-off for a single article
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.article_reading_stats(p_content_id text)
returns table (
  para_index       integer,
  sessions_reached bigint,
  pct_of_total     numeric,
  median_dwell_ms  numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  with total as (
    select count(distinct session_id) as n
    from public.reading_events
    where content_id = p_content_id
  ),
  per_para as (
    select
      re.para_index,
      count(distinct re.session_id)                                       as sessions_reached,
      (percentile_cont(0.5) within group (order by re.dwell_ms))::numeric as median_dwell
    from public.reading_events re
    where re.content_id = p_content_id
    group by re.para_index
  )
  select
    pp.para_index,
    pp.sessions_reached,
    case when t.n = 0 then 0
         else round(pp.sessions_reached::numeric / t.n * 100, 1)
    end as pct_of_total,
    round(pp.median_dwell) as median_dwell_ms
  from per_para pp, total t
  order by pp.para_index asc;
end;
$$;

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
  median_dwell_ms    numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  select
    count(distinct re.session_id)                                   as total_sessions,
    count(distinct case when re.reached_end then re.session_id end) as completed_sessions,
    case when count(distinct re.session_id) = 0 then 0
         else round(
           count(distinct case when re.reached_end then re.session_id end)::numeric
           / count(distinct re.session_id) * 100, 1
         )
    end                                                             as completion_pct,
    round(
      (percentile_cont(0.5) within group (order by re.dwell_ms))::numeric
    )                                                               as median_dwell_ms
  from public.reading_events re
  where re.content_id = p_content_id;
end;
$$;

revoke execute on function public.article_completion_summary(text) from public, anon;
grant execute on function public.article_completion_summary(text) to authenticated;
