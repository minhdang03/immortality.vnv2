# Phase 08 — Mobile Rewrite + Cutover + Verification + Rollback

## Context Links
- Brainstorm §7 (mobile 2-3d), §9 (cutover gradual, no big-bang): ../reports/brainstorm-260611-1244-supabase-db-auth-migration-reading-analytics.md
- Mobile app: ../../apps/mobile/ (Expo SDK 54, @react-native-firebase native SDK)
- Web flag: phase-04 `VITE_DATA_SOURCE`
- Delta migration: phase-02 `import-postgres.mjs --since`
- slug_redirects: phase-01 / phase-02

## Overview
- **Priority:** P1 (LAST — needs all phases)
- **Status:** pending
- **Description:** Rewrite the Expo RN mobile data + auth layer from `@react-native-firebase` to `supabase-js`, then perform a **single coordinated cutover of web + mobile together** (decision locked: NOT web-first). Run a final delta migration, parity checks, retire Firestore/Firebase-Auth reads, and keep a tested rollback path.

## Key Insights
- Mobile cuts over WITH web (shared DB; app unfinished) — one wave, not staggered (locked decision).
- Firestore stays LIVE in prod the entire time; cutover is the single moment both clients flip to Supabase. No mid-stream big-bang.
- Mobile uses native `@react-native-firebase` (data + auth) → replace with `@supabase/supabase-js` + AsyncStorage session persistence. WebView content screens (articles via `/article/:slug`) follow the web cutover automatically.
- Cutover is reversible: web flag back to firestore; mobile via a remote config / app flag or hotfix. Because Firestore is untouched (import-only), rollback = re-point reads.
- A final `--since` delta import (phase-02) right before flip captures content created during the rewrite window.

## Requirements
**Functional**
- Mobile data hooks/services → supabase-js (content, comments, votes, Q&A, profiles).
- Mobile auth → Supabase Auth (session persisted via AsyncStorage).
- Coordinated cutover runbook: delta migrate → flip web flag → ship mobile build pointing to Supabase → verify → retire Firestore reads.
- Parity checks: content counts, slug/link resolution, admin CRUD, agent write, analytics, categories.
- Rollback runbook tested.

**Non-functional**
- WebView screens load `https://` content (HTTPS-only caveat) — unaffected by data layer (already web-driven).
- Mobile files <200 lines; mirror web hook contracts where shared.

## Architecture
```
Pre-cutover: Firestore LIVE (prod) ‖ Supabase populated + verified (phases 01-07)
Cutover window:
  1. import-postgres.mjs --since <last-import>   (delta top-up)
  2. web: VITE_DATA_SOURCE=supabase + CACHE_VERSION bump → deploy
  3. mobile: ship build with supabase-js client → submit/OTA
  4. goclaw: confirm writing to Supabase via Worker (phase-05)
  5. parity checks (below) pass → retire Firestore reads
Rollback: web flag → firestore; mobile → previous build/flag; Firestore intact
```
**Data flow:** both clients → Supabase (read+write); agent → Worker→Supabase; GA4 macro + reading_events micro.

## Related Code Files
**Create**
- `apps/mobile/src/lib/supabase-client.js` (supabase-js + AsyncStorage session)
- `apps/mobile/src/hooks/` Supabase equivalents of the RN data hooks (mirror web contracts)
- `plans/260611-1255-supabase-db-auth-migration/cutover-runbook.md` (step-by-step + rollback)

**Modify**
- `apps/mobile/` screens/services using `@react-native-firebase` → supabase-js
- Mobile auth screens → Supabase Auth
- `apps/web/.env` / deploy config → `VITE_DATA_SOURCE=supabase` at flip
- `apps/web/src/hooks/useFirestoreSWR.js` / `cache-store.js` → bump CACHE_VERSION

**Delete (after cutover verified — NOT before)**
- `apps/web/src/firebase.js` Firestore + Auth init (keep GA4 logEvent or relocate)
- Firestore imports across rewritten web hooks
- `@react-native-firebase` deps in mobile (data/auth)
- `api/_lib/auth.js` Firebase-ID-token agent path + Vercel agent endpoints (superseded by phase-05 Worker)

## Implementation Steps
1. Rewrite mobile data layer to supabase-js (mirror web hook return shapes); auth → Supabase Auth + AsyncStorage.
2. Test mobile against Supabase (dev) — content lists, detail WebView, Q&A, votes, login.
3. Write `cutover-runbook.md`: ordered steps + rollback + verification checklist + owner sign-off line.
4. Schedule cutover window with Đăng.
5. Run final delta migration (`--since`).
6. Flip web flag to supabase + bump CACHE_VERSION; deploy.
7. Ship mobile build (TestFlight/Play or OTA) pointing to Supabase.
8. Confirm goclaw writes land in Supabase (phase-05 E2E re-run).
9. Run parity checks (Success Criteria). If any fail → execute rollback.
10. After 48-72h stable: retire Firestore reads + delete dead Firebase code/deps + retire Vercel agent path.

## Todo List
- [ ] Mobile data layer → supabase-js (mirror web contracts)
- [ ] Mobile auth → Supabase Auth + AsyncStorage
- [ ] Mobile dev test (content/WebView/Q&A/votes/login)
- [ ] `cutover-runbook.md` (steps + rollback + checklist)
- [ ] Final delta migration (`--since`)
- [ ] Flip web flag + bump CACHE_VERSION + deploy
- [ ] Ship mobile build on Supabase
- [ ] goclaw E2E write to Supabase confirmed
- [ ] Parity checks pass
- [ ] Post-stability: retire Firestore reads + delete dead Firebase code/deps + Vercel agent path

## Success Criteria (parity checks)
- [ ] Content counts: Supabase == Firestore (per type) after delta.
- [ ] Every old slug/ID + topic link resolves (slug_redirects) — link-parity script green.
- [ ] Web: all 12 pages render identically on Supabase; admin CRUD works.
- [ ] Mobile: all screens load from Supabase; auth + WebView content work.
- [ ] Agent: goclaw publishes via btd_ key → Supabase + audit row.
- [ ] Reading analytics dashboard populated; categories browse works.
- [ ] Zero Firestore/Firebase-Auth reads in prod (verified via Firebase console usage drop / code grep).
- [ ] Rollback executed once in staging and recovers cleanly.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Mobile + web cutover both fail together (single wave) | Med | High | Web flag + mobile flag both reversible; Firestore intact; rehearse rollback in staging |
| Content created during rewrite lost at flip | High | High | Final `--since` delta immediately before flip |
| Mobile app-store review delay desyncs the "together" cutover | Med | High | Prefer OTA (Expo Updates) for the flip; or ship Supabase build pre-approved + remote flag to activate |
| Stale localStorage cache serves Firestore shapes | Med | Med | Bump CACHE_VERSION at flip; clearAllCaches on sign-out |
| Broken shared links post-cutover | Med | High | slug_redirects + link-parity check is a gating criterion |
| Premature deletion of Firebase code blocks rollback | Med | High | Delete dead code ONLY after 48-72h stable, never during window |

## Security Considerations
- Confirm RLS holds under real prod traffic (no draft/PII leak) before retiring Firestore.
- service_role still Worker-only post-cutover (re-grep).
- Remove Firebase agent allowlist creds after Vercel agent path retired.

## Next Steps
- Follow-ups (separate plans): Astro/SSR render fix (SP2); SP1 re-scope onto Supabase; decommission Firebase project entirely once billing/usage confirms zero traffic.

## Consolidated open questions (carried from brainstorm §10)
1. Q4 priority order: this plan encodes DB+Auth FIRST → analytics/categories AFTER (deps). Confirm acceptable, or front-load reading dashboard? (default: as-ordered.)
2. Mobile flip mechanism: OTA (Expo Updates) vs new store build vs remote flag — which does Đăng want for the "together" cutover? (recommend OTA/remote flag to keep web+mobile in sync.)
3. Multi-category per content (phase-07): needed or single category_id? (default single.)
4. End-user accounts: confirmed there is no public end-user base to migrate (admin-only login today)? If public accounts exist anywhere, auth-migration scope grows.
