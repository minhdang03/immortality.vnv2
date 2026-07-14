# Phase 05 — Cron reconcile + observability (AgentLog)

## Context Links
- Brainstorm §4 (cron reconcile Firestore↔D1 nightly), §10 (per-key audit, token cost)
- Research §5 (cron trigger, 5-min wall-time, no Queues needed)
- Depends on P02 (`content` repository), P03 (`embedding-indexer`, `listPendingEmbed`, neuron guard)

## Overview
- **Priority:** P2
- **Status:** pending
- Nightly cron: reconcile Firestore (canonical) ↔ D1 + Vectorize, and drain the `embedded=0` backlog left by P03 budget-degradation. Observability: per-key audit log query endpoint (AgentLog read surface) with token/neuron cost.
- **Depends on:** P02, P03. **Blocks:** P06 (e2e validates reconcile).

## Key Insights
- Cron is the **self-healing** mechanism for the single-write-path: any waitUntil D1/Vectorize miss (P02/P03) is repaired here, so transient failures never permanently drift. This is the mitigation backing several P02/P03 risks.
- Neuron budget resets 00:00 UTC. Schedule cron **after** reset (e.g. `0 18 * * *` = 02:00 ICT, fresh budget) so the embed backlog drains with a full 10k allowance.
- Wall-time ~5 min/invocation → batch: process N pending-embed + reconcile a bounded page of Firestore content per run. If backlog > one run, it drains across nights (acceptable; new content embeds inline same-day when budget available).
- AgentLog here = **read/query** over `agent_audit_log` (writes happen inline in P02/P03). SP4 builds the admin UI; SP1 ships the queryable endpoint + structured rows.

## Requirements
**Functional**
- `scheduled()` handler:
  1. Drain embed backlog: `listPendingEmbed(limit)` → embed+upsert under neuron guard → mark `embedded=1`.
  2. Reconcile: page Firestore published content per type → upsert into D1 (`content`+FTS) where missing/stale (compare `updated_at`) → flag Vectorize gaps.
  3. Write a `reconcile` summary row to `agent_audit_log` (counts, neurons used, duration).
- `GET /v1/admin/audit?agent=&action=&since=&limit=` (Firebase `admin` claim): query audit log.
- `GET /v1/admin/stats` (admin): per-agent content counts, neuron usage today, pending-embed count.

**Non-functional**
- Cron run < 5 min; bounded batch sizes (configurable consts).
- Reconcile is idempotent upsert (safe to re-run).

## Architecture
**Cron flow (`cron/`):**
```
scheduled(event, env, ctx)
  → reconcile-runner:
     drainEmbedBacklog(env, BATCH)   // P03 embedding-indexer + neuron guard
     reconcileFirestoreToD1(env, PAGE) // per type, upsert stale/missing
     logReconcileSummary(env, metrics)
```
Each step bounded + try/catch isolated; one failing step doesn't abort others.

## Related Code Files
**Create**
- `workers/api/src/cron/reconcile-runner.ts` (orchestrate 3 steps)
- `workers/api/src/cron/firestore-to-d1-reconcile.ts` (page Firestore → D1 upsert)
- `workers/api/src/cron/embed-backlog-drainer.ts` (drain `embedded=0`)
- `workers/api/src/db/audit-repository.ts` (write summary + query audit/stats)
- `workers/api/src/routes/admin-observability-route-handler.ts` (`/v1/admin/audit`, `/v1/admin/stats`)

**Modify**
- `workers/api/src/index.ts` (export `scheduled` handler alongside `fetch`; mount admin observability routes)
- `workers/wrangler.toml` (`[triggers] crons = ["0 18 * * *"]` — confirm added P01)

## Implementation Steps
1. `audit-repository.ts`: `writeReconcileSummary`, `queryAudit(filters)`, `statsByAgent`, `neuronsToday`, `pendingEmbedCount`.
2. `embed-backlog-drainer.ts`: reuse P03 `embedding-indexer` + neuron guard; process up to BATCH pending rows; stop when budget low.
3. `firestore-to-d1-reconcile.ts`: for each type, `queryCollection` Firestore published (paged) → compare `updated_at` vs D1 → upsert stale/missing → return metrics.
4. `reconcile-runner.ts`: run drain + reconcile + summary log, isolated try/catch, collect metrics.
5. Convert `index.ts` default export to `{ fetch: app.fetch, scheduled }` (Hono app + scheduled handler).
6. `admin-observability-route-handler.ts`: audit + stats queries, Firebase admin claim guard.
7. typecheck; `wrangler dev` `--test-scheduled` to trigger cron locally; verify backlog drains + summary row written.

## Todo List
- [ ] audit-repository.ts (summary write + audit/stats queries)
- [ ] embed-backlog-drainer.ts (reuse indexer + neuron guard)
- [ ] firestore-to-d1-reconcile.ts (paged upsert, updated_at compare)
- [ ] reconcile-runner.ts (3 isolated steps + metrics)
- [ ] index.ts → { fetch, scheduled }; mount admin observability
- [ ] admin-observability-route-handler.ts (/v1/admin/audit + /stats)
- [ ] typecheck + local --test-scheduled run

## Success Criteria
- Manually set a row `embedded=0`, trigger cron → row becomes `embedded=1`, Vectorize gets chunks.
- Delete a D1 `content` row (simulate drift), trigger cron → row restored from Firestore.
- `GET /v1/admin/audit?agent=X` returns that agent's publish actions with neurons_used; `/v1/admin/stats` shows neuron usage + pending count.
- Cron run completes < 5 min on seeded dataset; reconcile re-run produces zero changes (idempotent).

## Risk Assessment
| Risk | L×I | Mitigation |
|------|-----|------------|
| Cron exceeds 5-min wall-time on large backlog | M×M | Bounded BATCH/PAGE consts; multi-night drain acceptable; metrics logged |
| Neuron budget consumed by backlog starves next-day inline embeds | M×M | Cron runs post-reset 02:00 ICT; cap drain batch to leave headroom |
| Firestore read volume (reconcile paging) cost | L×M | Page bounded; only published; compare `updated_at` to skip unchanged |
| `scheduled` export breaks existing `fetch` default export | L×H | Test both handlers after refactor; existing community routes unaffected |

## Security Considerations
- Observability endpoints require Firebase `admin` custom claim (not mere auth).
- Audit rows contain agent name + action + content id — no raw keys, no PII bodies.
- Reconcile only reads Firestore + writes D1/Vectorize (no Firestore writes → can't corrupt canonical).

## Next Steps
Unblocks P06 (e2e includes reconcile + self-heal verification).
