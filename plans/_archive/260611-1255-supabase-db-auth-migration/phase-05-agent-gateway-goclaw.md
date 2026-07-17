# Phase 05 — Agent Gateway (Worker service_role) + goclaw Edit

## Context Links
- Brainstorm §3 (2 auth planes, Worker gateway): ../reports/brainstorm-260611-1244-supabase-db-auth-migration-reading-analytics.md
- Existing key lib: ../../workers/api/src/lib/api-key.ts (btd_ key gen/hash, scopes)
- Current agent auth (Firebase ID token): ../../api/_lib/auth.js (`requireAgent`)
- Worker structure: ../../workers/api/src/ (index.ts, routes/, middleware/)
- goclaw skills (TO EDIT): /Users/dang/Documents/ClaudeCode/Claw/goclaw/skills/immortality-{publisher,api,editor}/
- SP1 plan (write path reference): ../260610-1740-sp1-agent-content-platform/plan.md

## Overview
- **Priority:** P1 (blocks 08)
- **Status:** pending
- **Description:** Stand up the agent write plane: `goclaw ──Bearer btd_key──► Worker api.battudao.com ──service_role──► Supabase`. Migrate `api_keys` + `agent_audit_log` to Postgres. **EDIT the `Claw/goclaw` repo** so its 3 immortality skills authenticate with a `btd_` key and target `api.battudao.com/v1` instead of Firebase ID token + `battudao.com/api`.

## Key Insights
- 2 auth planes (locked): humans = Supabase Auth (phase-03); agents = btd_ keys. Switching human auth does NOT affect agents as long as the write API stays alive — this phase keeps it alive on Supabase.
- service_role bypasses RLS and lives ONLY in the Worker secret (`wrangler secret put SUPABASE_SERVICE_ROLE`). It is never in goclaw config, repo, or any client. Agent holds only its `btd_` key.
- Worker already has `api-key.ts` (gen/hash/scopes) — reuse it. The auth tables exist in Postgres now (phase-01 `0005_agent.sql`) instead of D1, so the Worker key-lookup queries Supabase, not D1.
- goclaw side is the only place outside this repo we touch. Three skills use Firebase: `immortality-publisher` (publish.mjs — email/pw → ID token), `immortality-api` (articles.mjs/khaitri.mjs — Bearer ID token, base `battudao.com/api`), `immortality-editor` (fetch.mjs).
- Migration for goclaw = swap auth + base URL; the write payload/logic stays the same (per brainstorm §3). Minimal, surgical edit.

## Requirements
**Functional**
- Worker endpoint(s) under `/v1/content` (+ media) that: extract `Bearer btd_...`, hash, look up `api_keys` (not revoked), check scope, write to Supabase via service_role, log to `agent_audit_log`, return result.
- Admin key management: create/list/revoke `btd_` keys (reuse api-key.ts; persist to Postgres).
- goclaw skills authenticate with `IMMORTALITY_AGENT_API_KEY` (btd_) and `IMMORTALITY_API_BASE=https://api.battudao.com/v1`.

**Non-functional**
- service_role only in Worker secret. Key lookup is O(1) on `key_hash` unique index.
- Worker files <200 lines; reuse existing middleware/error-handler patterns.

## Architecture
```
goclaw skill ──Bearer btd_<hex>──► Worker api.battudao.com /v1/content
   middleware: looksLikeApiKey → hashApiKey → SELECT api_keys WHERE key_hash=? AND revoked_at IS NULL
              → scope check (content:write) → update last_used_at
   handler: supabase-js (service_role) insert/update content  (RLS bypassed)
   ctx.waitUntil: INSERT agent_audit_log (key_id, action, content_id, ts, status, detail)
SECRETS: SUPABASE_URL + SUPABASE_SERVICE_ROLE in Worker only
```
**Data flow:** agent key → Worker validates against Postgres api_keys → service_role write → audit row.

## Related Code Files
**Create (this repo — Worker)**
- `workers/api/src/lib/supabase-service-client.ts` (service_role client from env secret)
- `workers/api/src/middleware/api-key-auth-middleware.ts` (btd_ validation against Postgres)
- `workers/api/src/routes/content-write-route-handler.ts` (POST/PATCH /v1/content via service_role)
- `workers/api/src/lib/agent-audit-log.ts` (insert audit row to Postgres)
- `supabase/migrations/0010_agent_keys_seed.sql` (optional: indexes already in 0005; seed first agent key hash if desired)

**Modify (this repo)**
- `workers/api/src/index.ts` (mount /v1/content with api-key middleware)
- `workers/api/wrangler.toml` (add SUPABASE_URL var; document SUPABASE_SERVICE_ROLE secret; api.battudao.com route)
- `workers/api/src/lib/api-key.ts` (reuse; extend if scope list needs content types)

**Modify (Claw/goclaw repo — EXPLICIT cross-repo edit)**
- `/Users/dang/Documents/ClaudeCode/Claw/goclaw/skills/immortality-api/scripts/articles.mjs` (base URL → api.battudao.com/v1; auth → btd_ key header; remove Firebase token exchange)
- `/Users/dang/Documents/ClaudeCode/Claw/goclaw/skills/immortality-api/scripts/khaitri.mjs` (same)
- `/Users/dang/Documents/ClaudeCode/Claw/goclaw/skills/immortality-publisher/scripts/publish.mjs` (drop email/pw→ID-token; send btd_ key; new base URL)
- `/Users/dang/Documents/ClaudeCode/Claw/goclaw/skills/immortality-editor/scripts/fetch.mjs` (read path → new base/key if it writes)
- goclaw `.env.example` files: replace `IMMORTALITY_AGENT_EMAIL/PASSWORD/FIREBASE_*` with `IMMORTALITY_AGENT_API_KEY` + `IMMORTALITY_API_BASE`
- goclaw `SKILL.md` files: update auth + base URL docs

**Delete (deferred)**
- `api/_lib/auth.js` Firebase-ID-token agent path (retire at phase-08 with Vercel api/)

## Implementation Steps
1. Worker: `supabase-service-client.ts` reading `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE` from env; `wrangler secret put SUPABASE_SERVICE_ROLE`.
2. `api-key-auth-middleware.ts`: reuse `looksLikeApiKey` + `hashApiKey`; SELECT api_keys from Postgres; scope check; 401/403 on fail; update `last_used_at`.
3. `content-write-route-handler.ts`: validate payload (zod, mirror existing schemas), upsert `content` via service_role (preserve idempotency via `source_ref`), return id+slug.
4. `agent-audit-log.ts`: insert audit row in `ctx.waitUntil`.
5. Admin key mgmt endpoint (create/list/revoke) — reuse api-key.ts gen; store hash in Postgres; show raw once.
6. Mount routes in `index.ts`; configure `wrangler.toml` route `api.battudao.com/v1/*`.
7. Generate a `btd_` key for goclaw; deliver raw key to Đăng once.
8. EDIT goclaw skills: swap base URL + auth header; remove Firebase token exchange; update .env.example + SKILL.md.
9. End-to-end: goclaw publishes a test khaitri/article → lands in Supabase content → audit row recorded. Verify with both valid + revoked key (revoked → 401).

## Todo List
- [ ] Worker service_role client + secret (`wrangler secret put`)
- [ ] api-key-auth-middleware (Postgres lookup, scope, last_used_at)
- [ ] content-write-route-handler (/v1/content, service_role upsert, idempotent)
- [ ] agent-audit-log writer
- [ ] Admin key create/list/revoke (reuse api-key.ts)
- [ ] Mount routes + wrangler.toml api.battudao.com/v1 route
- [ ] Generate btd_ key for goclaw (deliver once)
- [ ] EDIT goclaw 3 skills: base URL + btd_ key; drop Firebase token; update .env.example + SKILL.md
- [ ] E2E: agent write lands in Supabase + audit; revoked key → 401

## Success Criteria
- goclaw publishes content with a btd_ key → appears in Supabase `content`.
- service_role exists only in Worker secret (grep goclaw + repos confirm absent).
- Revoked key returns 401; out-of-scope key returns 403.
- Every agent write produces an `agent_audit_log` row.
- goclaw `.env.example` no longer references Firebase agent creds.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| service_role leaks into goclaw config/repo | Low | Critical | service_role ONLY in Worker secret; agent holds btd_ key; grep audit before sign-off |
| goclaw breaks mid-migration (content pipeline down) | Med | High | Keep old Firebase write path live until E2E passes; cut goclaw over after Worker verified |
| Key lookup latency / cold start | Low | Low | Unique index on key_hash; minimal middleware |
| Scope model too loose (write any type) | Med | Med | Enforce VALID_SCOPES; content:write scoped; audit log every action |

## Security Considerations
- Per memory: agent identity = btd_ key plane, NEVER a human Supabase Auth account.
- Per memory: per-agent `btd_` keys (revocable, audited) — one key per agent, not shared.
- service_role bypasses RLS → it is the crown jewel; Worker secret only; rotate if exposed.
- CORS/host check on Worker (reuse existing allowlist pattern).

## Next Steps
- Blocks phase-08 (cutover retires old Vercel agent path).
- Depends on phase-01 (api_keys/audit tables), phase-03 (human/agent plane separation established).
- Note: SP1 (260610) write path re-scopes onto this Supabase gateway (drop D1/Vectorize) — separate plan update.
