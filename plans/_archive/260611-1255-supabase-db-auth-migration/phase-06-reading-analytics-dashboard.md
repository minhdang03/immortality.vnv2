# Phase 06 — Reading Analytics + Admin Content-Analytics Dashboard

## Context Links
- Brainstorm §4 (dashboard is missing; per-paragraph micro): ../reports/brainstorm-260611-1244-supabase-db-auth-migration-reading-analytics.md
- Paragraphs already rendered: ../../apps/web/src/pages/content/ArticleDetail.jsx (`<p data-para={i}>` at line 45; existing IO usage at line 23)
- GA4 macro events: ../../apps/web/src/hooks/useAnalytics.js (article_view, scroll_depth, article_read_time)
- reading_events table: phase-01 `0006_analytics.sql`
- Supabase client: phase-03 `supabase-client.js`

## Overview
- **Priority:** P2 (blocks 08 only as a feature to verify; depends on 04)
- **Status:** pending
- **Description:** Add micro reading analytics: an IntersectionObserver on each `<p data-para={i}>` logs per-paragraph visibility + dwell to Supabase `reading_events`. Build an admin "Phân tích nội dung" page showing per-article drop-off % per paragraph, completion rate, and median read time. GA4 stays for macro; Supabase owns micro.

## Key Insights
- `ArticleDetail.jsx` already renders `<p data-para={i}>` and already uses an IntersectionObserver (line 23) — extend that, don't reinvent. This is the cheapest possible hook point.
- GA4 is bad at "which paragraph lost readers" — that's exactly why micro events go to Supabase (per brainstorm §4). Do NOT duplicate into GA4.
- Write path: batch events (don't fire one network call per paragraph). Buffer in memory, flush on `visibilitychange`/`beforeunload` via `navigator.sendBeacon` or a single insert. RLS = anon INSERT only on reading_events (phase-01); no SELECT for anon.
- Dashboard reads via service-side aggregation. Free-tier friendly: aggregate with SQL views / RPC, not client-side over raw rows.
- `session_id` = ephemeral client-generated id (localStorage/sessionStorage) — anonymous, no PII.

## Requirements
**Functional**
- Per-paragraph event: `{ content_id, session_id, para_index, dwell_ms, reached_end }`.
- Completion = reached last paragraph. Drop-off per paragraph = % of sessions that viewed para i but not i+1.
- Median read time per article.
- Admin page: select article → paragraph drop-off chart + completion % + median read time + cross-article comparison (best/worst retention).

**Non-functional**
- Batched writes (≤1 insert per page session, or beacon on exit). No per-paragraph network spam.
- Dashboard aggregation in Postgres (SQL view or RPC), not client loops over raw events.
- Anonymous only — session_id is not a user id.

## Architecture
```
ArticleDetail: IntersectionObserver per <p data-para> → buffer {para_index, dwell_ms, reached_end}
   on exit (visibilitychange/beforeunload) → supabase.from('reading_events').insert(batch)
   RLS: anon INSERT only (no read)
Admin dashboard page → supabase.rpc('article_reading_stats', {content_id})
   SQL: drop-off per para, completion %, median dwell → chart
GA4 unchanged (macro)
```
**Data flow:** reader scroll → IO → buffered events → batched insert → reading_events → SQL aggregation → admin chart.

## Related Code Files
**Create**
- `apps/web/src/hooks/useReadingTracker.js` (IO per paragraph, dwell buffer, batched flush)
- `apps/web/src/lib/reading-session.js` (ephemeral session_id helper)
- `apps/web/src/pages/admin/content-analytics-page.jsx` (admin dashboard)
- `apps/web/src/components/admin/paragraph-dropoff-chart.jsx` (drop-off bars)
- `supabase/migrations/0011_reading_stats_rpc.sql` (`article_reading_stats` RPC/view: drop-off, completion, median)

**Modify**
- `apps/web/src/pages/content/ArticleDetail.jsx` (wire `useReadingTracker`; reuse existing IO at line 23)
- `apps/web/src/config/pages.js` (register admin content-analytics route, admin-gated)

**Delete** — none

## Implementation Steps
1. `reading-session.js`: generate/persist anonymous `session_id` (sessionStorage).
2. `useReadingTracker.js`: IntersectionObserver over `[data-para]`; track first-seen + dwell per para; mark `reached_end` when last para seen; buffer in a ref.
3. Flush buffer on `visibilitychange=hidden` / `beforeunload` via single `insert` (sendBeacon fallback). Anon RLS insert.
4. Wire into `ArticleDetail.jsx` (extend existing IO, keep current behavior intact).
5. `0011_reading_stats_rpc.sql`: SQL that computes per-article paragraph drop-off (% sessions reaching each para), completion rate, median dwell. Expose as RPC callable by admin (RLS: admin role).
6. Build `content-analytics-page.jsx`: article picker → call RPC → render `paragraph-dropoff-chart` + completion % + median + best/worst list.
7. Register admin route in `pages.js` (admin-gated via role from phase-03).
8. Verify: read a few articles in different browsers → events land → dashboard shows plausible drop-off.

## Todo List
- [ ] `reading-session.js` anonymous session id
- [ ] `useReadingTracker.js` (IO per para, dwell buffer, batched flush + beacon)
- [ ] Wire into ArticleDetail.jsx (extend existing IO)
- [ ] `0011_reading_stats_rpc.sql` (drop-off, completion, median)
- [ ] `content-analytics-page.jsx` admin dashboard
- [ ] `paragraph-dropoff-chart.jsx`
- [ ] Register admin route (role-gated)
- [ ] Verify events + dashboard numbers

## Success Criteria
- Reading an article writes batched reading_events (1 insert per session, not per paragraph).
- Admin dashboard shows per-paragraph drop-off %, completion rate, median read time per article.
- Anon cannot SELECT reading_events (RLS); only admin sees aggregates via RPC.
- No GA4 changes; macro events still flow.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Per-paragraph network spam exhausts free tier | Med | Med | Batch buffer + single insert on exit; sendBeacon |
| sendBeacon/insert lost on hard close | Med | Low | Best-effort analytics; flush on visibilitychange too |
| Aggregation slow on raw events at scale | Low | Med | SQL view/RPC + index on (content_id, para_index); free-tier volume small |
| IO change regresses existing ArticleDetail behavior | Med | Med | Extend existing observer; QA reading view unchanged |

## Security Considerations
- session_id anonymous (no user linkage, no PII) — privacy-safe.
- reading_events RLS: anon INSERT only, admin-only aggregate read.
- Dashboard route admin-gated (role from phase-03).

## Next Steps
- Verified in phase-08 acceptance (feature parity sign-off).
- Depends on phase-01 (reading_events table), phase-04 (supabase client + data layer).
