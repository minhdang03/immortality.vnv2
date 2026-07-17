# Phase 04 — Web Data-Layer Rewrite (~20 hooks → supabase-js)

## Context Links
- Brainstorm §7 (3-4d web data layer): ../reports/brainstorm-260611-1244-supabase-db-auth-migration-reading-analytics.md
- Hooks dir: ../../apps/web/src/hooks/ (20 hooks)
- SWR core: ../../apps/web/src/hooks/useFirestoreSWR.js
- CRUD pattern: ../../apps/web/src/hooks/useCRUD.js, useArticles.js
- Client: phase-03 `supabase-client.js`

## Overview
- **Priority:** P1 (blocks 06, 07, 08)
- **Status:** pending
- **Description:** Rewrite the Firestore-bound hooks to use supabase-js while **keeping each hook's return shape identical** so 44 components + 12 pages need zero changes. Gate behind a data-source flag so Firestore stays live until cutover.

## Key Insights
- `useFirestoreSWR` is the shared core: cache-then-revalidate via `onSnapshot`. Supabase equivalent = initial `select` + (optional) Realtime subscription. KISS: replace `onSnapshot` with a `select` + manual refresh; only add Realtime where live updates matter (admin lists). Most content is static-ish → polling/refetch is fine and cheaper.
- The localStorage SWR cache layer (versioned, TTL, size cap) is data-source agnostic — KEEP it. Bump `CACHE_VERSION` to invalidate Firestore-shaped caches on cutover.
- Keep hook signatures: `useArticles()` still returns `{ firestoreArticles, loading, fresh, addArticle, updateArticle, deleteArticle }` (rename internal var but keep export keys to avoid touching components — OR do a mechanical rename in a follow-up; default: keep keys).
- CRUD hooks (`useCRUD`, `useArticles`) write directly via supabase-js (admin, RLS-gated). Agent writes are a SEPARATE path (phase-05 Worker) — do not merge.
- Flag: `VITE_DATA_SOURCE=firestore|supabase` → `supabase-client.js` vs `firebase.js`. Enables side-by-side QA + instant rollback.
- Articles + khaitri merge (plan.md decision 2026-07-07): both hooks query the SAME `content` table filtered by `type` (`useArticles` → type='article' order by date desc; `useKhaiTri` → type='khaitri' order by "order" asc). Keep them as thin facades over one shared content-query helper — return shapes unchanged, admin edits land in one table.

## Requirements
**Functional** — rewrite/verify each hook keeping return shape:
- Read+CRUD: `useArticles`, `useStories`, `useKhaiTri`, `usePractices`, `useTeachings`, `useTopics` (→ categories in phase-07), `useCRUD` (generic).
- Engagement: `useComments`, `useDonations`, `useAdminDonations`.
- Config: `useSiteSettings`, `useTranslations`.
- Identity/admin: `useUserRole`, `useAdmins` (done in phase-03), `useAgentLog`.
- Keep as-is (no Firestore): `useFontSize`, `useTheme`, `useSEO`, `useAnalytics` (GA4 stays), `usePageView`.

**Non-functional**
- Component/page API unchanged. Each hook file stays <200 lines.
- Refactor shared core into `useSupabaseSWR` mirroring `useFirestoreSWR` API.

## Architecture
```
Component (unchanged) → useArticles() (same return shape)
   └► useSupabaseSWR(cacheKey, fetcher, fallback)   -- mirrors useFirestoreSWR
        ├─ readCache/writeCache (KEEP, bump CACHE_VERSION → v3)
        ├─ initial: supabase.from('content').select().eq('type','article')...
        └─ optional realtime channel (admin lists only)
   CRUD: supabase.from('content').insert/update/delete  (RLS: admin role)
Flag VITE_DATA_SOURCE switches client → instant rollback to Firestore
```
**Data flow:** component → hook → supabase-client → Postgres (RLS) → cache → render.

## Related Code Files
**Create**
- `apps/web/src/hooks/useSupabaseSWR.js` (mirror of useFirestoreSWR; reuse readCache/writeCache)

**Modify**
- `useArticles.js`, `useStories.js`, `useKhaiTri.js`, `usePractices.js`, `useTeachings.js`, `useTopics.js`, `useCRUD.js`
- `useComments.js`, `useDonations.js`, `useAdminDonations.js`
- `useSiteSettings.js`, `useTranslations.js`, `useAgentLog.js`
- `useFirestoreSWR.js` (extract readCache/writeCache to a shared cache module so both SWR hooks import it; bump CACHE_VERSION at cutover)

**Delete** (at phase-08 cutover only)
- Firestore imports in rewritten hooks; `firebase.js` Firestore init

## Implementation Steps
1. Extract `readCache/writeCache/clearAllCaches` into `apps/web/src/hooks/cache-store.js` (DRY — both SWR hooks share it).
2. Build `useSupabaseSWR.js`: same `(cacheKey, fetcher, fallback) → { data, loading, fresh }` contract; fetcher returns a promise (select) instead of a subscribe fn.
3. Rewrite content read hooks one by one; map Postgres columns back to the shape components expect (e.g. `{ id, vi:{...}, en:{...} }` if components read nested — verify per hook). Keep export keys identical.
4. Rewrite CRUD: `insert/update/delete` via supabase-js; preserve `articleSlugFields` slug computation on write.
5. Rewrite engagement + config + agent-log hooks.
6. Add `VITE_DATA_SOURCE` flag; default `firestore` until QA passes, then `supabase`.
7. QA pass: every page renders identically on Supabase vs Firestore (visual + data parity). Run with seeded data from phase-02.
8. Run `pnpm --filter web build` — fix any compile errors.

## Todo List
- [ ] Extract `cache-store.js` (shared cache, DRY)
- [ ] `useSupabaseSWR.js` mirroring useFirestoreSWR contract
- [ ] Rewrite content read+CRUD hooks (articles/stories/khaitri/practices/teachings/topics/useCRUD)
- [ ] Rewrite engagement hooks (comments/donations/adminDonations)
- [ ] Rewrite config + agent-log hooks (settings/translations/agentLog)
- [ ] `VITE_DATA_SOURCE` flag wired to client selection
- [ ] Page-by-page parity QA (Supabase vs Firestore)
- [ ] `pnpm --filter web build` clean

## Success Criteria
- Every page renders the same data on `VITE_DATA_SOURCE=supabase` as on firestore.
- Admin CRUD (create/edit/delete article etc.) works via supabase-js under RLS.
- No component or page file modified (return shapes preserved).
- Build passes; flag flip switches source with no code change.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Hidden component coupling to Firestore doc shape | High | Med | Preserve return shape exactly; per-hook parity QA against live pages |
| Loss of realtime "live update" UX (onSnapshot) | Med | Low | Realtime channel only where needed (admin lists); content refetch acceptable |
| Cache shows stale Firestore-shaped data post-cutover | Med | Med | Bump CACHE_VERSION → v3 at cutover; clearAllCaches on sign-out |
| RLS blocks legit admin write (policy gap) | Med | High | Depends on phase-03 role; smoke test each CRUD before flag flip |

## Security Considerations
- Anon key only in client; writes gated by RLS (admin role from phase-03).
- No service_role in web bundle — agent writes never go through the browser.
- Donation/contact PII reads stay admin-only via RLS.

## Next Steps
- Blocks phase-06 (analytics writes via same client), phase-07 (category UI uses these hooks), phase-08 (flag flip = cutover).
- Depends on phase-01 (schema), 02 (data), 03 (auth/role + client).
