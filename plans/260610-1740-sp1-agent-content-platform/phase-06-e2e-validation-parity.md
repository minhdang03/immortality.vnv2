# Phase 06 — E2E validation + contract-parity sign-off

## Context Links
- Brainstorm §6 (success metrics), §4 backward-compat (strangler, contract mirror)
- Depends on ALL prior phases (P01–P05)

## Overview
- **Priority:** P1 (gate before declaring SP1 done)
- **Status:** pending
- Full agent-loop validation across REST + MCP, contract-parity check vs Vercel `/api`, and confirmation that nothing in Vercel/functions/web/mobile changed. This is the acceptance gate.
- **Depends on:** P01–P05.

## Key Insights
- SP1 "done" = an agent can do the entire publish→enrich→search→reconcile loop through new Workers API via both REST and MCP, while the old Vercel API still serves its old contract untouched (zero downtime for agents mid-migration — brainstorm §6).
- Parity is **behavioral**, not path-identical: new paths are `/v1/...`; the mapping table (P02) is the migration doc. Validate each old endpoint has a working new equivalent producing equivalent results (same slug, same R2 URL scheme, same dedup semantics).

## Requirements
**Functional (acceptance scenarios)**
1. **Publish loop (REST):** create key → `POST /v1/content` article → 201 + publicUrl → appears in `GET /v1/content` + Firestore + D1 + Vectorize within budget.
2. **Idempotency:** repeat source_ref → existing id, no dup. Same body new ref → hash dedup.
3. **Media:** `/v1/media` bytes + `/v1/media/from-url` → R2 URL; oversize/SSRF blocked.
4. **Search:** keyword (diacritic-insensitive VI), semantic, hybrid all return the published doc < 200ms.
5. **MCP loop:** Claude Code connects `/mcp`, `publish_content`→`search_content` round-trip; scope-denied path returns problem-details.
6. **Degradation:** force neuron budget exhaustion → publish still 201 `embedded=0` → cron drains backlog → searchable next run.
7. **Self-heal:** delete D1 row → cron restores from Firestore.
8. **Discovery:** fresh agent onboards from `/v1/agent-spec` + `/doc` only.

**Non-functional**
- Confirm `$0/mo` posture (all free-tier bindings; no paid features enabled).
- `git status` shows changes confined to `workers/` (+ this plan + docs) — Vercel `api/`, `functions/`, `apps/web`, `apps/mobile` untouched.

## Architecture
Validation harness = thin scripts + `wrangler dev` (local D1/Vectorize emulation where supported) + a staging deploy for Vectorize/AI (not fully local). Prefer real staging env (`btd-api-staging`) for AI/Vectorize-dependent scenarios.

## Related Code Files
**Create**
- `workers/api/test/content-ingest-idempotency.test.ts`
- `workers/api/test/content-slug-parity.test.ts` (vs `api/_lib/slug.js` cases)
- `workers/api/test/search-hybrid.test.ts`
- `workers/api/test/api-key-scope-guard.test.ts`
- `workers/api/test/enrich-degradation.test.ts` (budget-exhausted → embedded=0)
- `plans/260610-1740-sp1-agent-content-platform/reports/` (e2e result + parity sign-off report)

**Modify**
- `docs/system-architecture.md` (add Workers content platform section)
- `docs/project-changelog.md` (SP1 entry)

## Implementation Steps
1. Write Vitest unit/integration tests for idempotency, slug parity, scope guard, search, enrich degradation (use `@cloudflare/vitest-pool-workers` — already a dep).
2. Run full suite `pnpm -F @btd/api test`; fix until green (no skipped/mocked-to-pass).
3. Deploy `btd-api-staging`; run manual acceptance scenarios 1–8 against staging (AI/Vectorize real).
4. Execute contract-parity matrix: for each old Vercel endpoint, hit new equivalent, diff result shape + slug + R2 URL scheme.
5. Run MCP scenario with a real MCP client (Claude Code) against staging `/mcp`.
6. Confirm `git status` scope; confirm free-tier (no `[[d1_databases]]` paid, no Queues, Workers AI within neurons).
7. Update `docs/system-architecture.md` + `docs/project-changelog.md`.
8. Write sign-off report to plan `reports/`.

## Todo List
- [ ] Vitest: idempotency, slug-parity, scope-guard, search, enrich-degradation
- [ ] full suite green (no mocks-to-pass)
- [ ] staging deploy + manual scenarios 1–8
- [ ] contract-parity matrix executed + documented
- [ ] MCP client round-trip on staging
- [ ] verify git scope (only workers/) + $0 free-tier posture
- [ ] docs/system-architecture.md + project-changelog.md updated
- [ ] e2e + parity sign-off report in reports/

## Success Criteria
- All 8 acceptance scenarios pass on staging.
- Vitest suite green, zero skipped/faked.
- Parity matrix: every old Vercel content/media endpoint has a verified `/v1` equivalent (same slug + R2 URL + dedup semantics).
- `git status` confirms zero changes to Vercel `api/`, `functions/`, `apps/web`, `apps/mobile`.
- Published article live + indexed (FTS + Vectorize) in < 5 min (brainstorm metric).
- Docs updated; sign-off report written.

## Risk Assessment
| Risk | L×I | Mitigation |
|------|-----|------------|
| Local emulation can't fully run AI/Vectorize → false greens | M×M | Run AI/Vectorize scenarios on real staging, not local |
| Slug parity edge cases (rare VI chars) diverge | L×H | Parity test seeds full VI_MAP char set from `api/_lib/slug.js` |
| Staging Vectorize index pollution vs prod | L×M | Separate staging index name; never point staging at prod index |
| Hidden coupling accidentally touched Vercel files | L×H | Final `git status` gate; CODEOWNERS-style review of diff scope |

## Security Considerations
- Use throwaway staging `btd_` keys; revoke after validation.
- Don't log raw keys or Firebase SA in test output.
- Confirm admin endpoints reject non-admin Firebase tokens in tests.

## Next Steps
On sign-off: SP1 complete. Hand to SP2 (Astro reads D1) — D1 `content` + Vectorize are the contract SP2 consumes. Flag Notion-retire question for SP3 (do NOT touch `workers/notion` here).
