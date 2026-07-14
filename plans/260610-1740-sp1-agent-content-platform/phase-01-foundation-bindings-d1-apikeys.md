# Phase 01 — Foundation: wrangler bindings + D1 migrations + API-key auth

## Context Links
- Brainstorm §9 decision #1 (per-agent `btd_` keys), #4 (unified `content` table)
- Research §3 (D1 FTS5, unicode61 diacritic issue), §6 (Hono v4)
- Existing: `workers/wrangler.toml`, `workers/api/src/index.ts`, `workers/api/src/cloudflare-worker-env.d.ts`, `workers/api/src/middleware/firebase-auth-verify-middleware.ts`

## Overview
- **Priority:** P1 (blocks all phases)
- **Status:** pending
- Wire real CF bindings (D1, Vectorize, R2, AI, KV, cron, secrets), create D1 schema + migrations, build per-agent API-key auth (`btd_` prefix, SHA-256 in D1, RBAC scopes), and admin-only key management (Firebase Auth custom claim). No content writes yet.

## Key Insights
- Scaffold already has Hono v4, Firestore REST client, service-account JWT, Firebase ID-token verifier — **reuse**, don't rebuild.
- FTS5 `unicode61` drops VI diacritics by default. Use `tokenize="unicode61 remove_diacritics=2"` so "Bất Tử" and "Bat Tu" both match (accent-insensitive). This is acceptance-critical for VI search.
- API-key auth is a **separate** middleware from existing Firebase-ID-token middleware. Content endpoints use API keys; admin key-management endpoints use Firebase custom claim `admin=true`.
- `wrangler.toml` `main` currently points to `api/src/index.ts` (relative to `workers/`) — verify deploy works from `workers/` root or move config into `workers/api/`. Decide: keep single root `workers/wrangler.toml` (current convention).

## Requirements
**Functional**
- D1 tables: `content`, `content_fts` (FTS5 external-content), `api_keys`, `agent_audit_log`, `taxonomy` (topics/tags cache).
- API-key lifecycle: create (show-once raw key), verify (hash lookup + scope check), revoke, list. Scopes: `content:read`, `content:write`, `media:write`.
- Admin endpoints (Firebase custom claim `admin`): `POST /v1/admin/keys`, `GET /v1/admin/keys`, `DELETE /v1/admin/keys/:id`.
- `GET /v1/health` returns binding status (D1 reachable, env).

**Non-functional**
- Key verify ≤ 1 D1 read (indexed on `key_hash`). Cache verified key in `KV_CACHE` 60s to cut D1 reads.
- All bindings free-tier; no secret values in repo.

## Architecture
**Data flow (auth):** request `Authorization: Bearer btd_<hex>` → middleware SHA-256(raw) → KV cache check → D1 `api_keys WHERE key_hash=? AND revoked_at IS NULL` → attach `{ keyId, agentName, scopes }` to context → scope guard per route.

**D1 schema (migration `0001_init.sql`):**
```sql
CREATE TABLE content (
  id TEXT PRIMARY KEY,            -- Firestore doc id (canonical)
  type TEXT NOT NULL,            -- article|story|khaitri|teaching|practice
  source_ref TEXT,              -- agent idempotency key (external_id)
  content_hash TEXT,            -- sha256 of canonical body for dedup
  vi_slug TEXT, en_slug TEXT,
  vi_title TEXT, en_title TEXT,
  vi_summary TEXT, en_summary TEXT,
  vi_body TEXT, en_body TEXT,
  topic TEXT, tags TEXT,        -- tags = JSON array string
  status TEXT NOT NULL DEFAULT 'draft',
  seo_meta TEXT,                -- JSON
  embedded INTEGER DEFAULT 0,   -- 0=pending,1=done (for cron backfill)
  created_at TEXT, updated_at TEXT, created_by TEXT
);
CREATE UNIQUE INDEX idx_content_sourceref ON content(source_ref) WHERE source_ref IS NOT NULL;
CREATE INDEX idx_content_type_status ON content(type, status);
CREATE INDEX idx_content_hash ON content(content_hash);
CREATE INDEX idx_content_embedded ON content(embedded) WHERE embedded = 0;

CREATE VIRTUAL TABLE content_fts USING fts5(
  vi_title, en_title, vi_body, en_body, vi_summary, en_summary,
  content='content', content_rowid='rowid',
  tokenize="unicode61 remove_diacritics=2"
);
-- triggers content_ai/_ad/_au keep FTS in sync (in migration)

CREATE TABLE api_keys (
  id TEXT PRIMARY KEY, key_hash TEXT NOT NULL UNIQUE,
  agent_name TEXT NOT NULL, scopes TEXT NOT NULL,  -- comma list
  created_at TEXT, created_by TEXT, revoked_at TEXT, last_used_at TEXT
);
CREATE TABLE agent_audit_log (
  id TEXT PRIMARY KEY, key_id TEXT, agent_name TEXT,
  action TEXT, content_id TEXT, ts TEXT,
  status_code INTEGER, neurons_used INTEGER DEFAULT 0, detail TEXT
);
CREATE TABLE taxonomy (
  id TEXT PRIMARY KEY, kind TEXT,  -- topic|tag
  vi TEXT, en TEXT, slug TEXT, usage_count INTEGER DEFAULT 0
);
```

## Related Code Files
**Create**
- `workers/api/migrations/0001_init.sql` (schema + FTS triggers)
- `workers/api/src/db/d1-client.ts` (thin query helpers, <120 lines)
- `workers/api/src/lib/api-key.ts` (generate `btd_`+32hex, sha256, verify)
- `workers/api/src/middleware/api-key-auth-middleware.ts` (scope-guarded)
- `workers/api/src/routes/admin-keys-route-handler.ts` (Firebase-claim guarded)
- `workers/.dev.vars.example` (secret names only, no values)

**Modify**
- `workers/wrangler.toml` (add `[[d1_databases]]`, `[[vectorize]]`, `[[r2_buckets]]`, `[ai]`, `[triggers] crons`, KV real IDs, document secrets in comments)
- `workers/api/src/cloudflare-worker-env.d.ts` (add `DB: D1Database`, `VECTORIZE`, `R2: R2Bucket`, `AI`, new secret names)
- `workers/api/src/index.ts` (mount `/v1/admin/keys`, `/v1/health`)
- `workers/api/package.json` (add `@hono/zod-openapi`, `@cloudflare/agents`; D1 migrate scripts)
- `workers/api/src/middleware/firebase-auth-verify-middleware.ts` (add `requireAdminClaim` helper if absent)

## Implementation Steps
1. Add bindings to `wrangler.toml` for dev/staging/production (D1 `btd-content`, Vectorize `battudao-content` dims=1024 cosine, R2 `btd-media`, AI, cron `0 18 * * *` = 2am ICT). Real IDs created via `wrangler d1 create` / `vectorize create` / `kv namespace create` — leave `REPLACE_*` placeholders + creation commands in comments.
2. Write `0001_init.sql` with all tables + FTS triggers (insert/delete/update sync rowid).
3. Add D1 migrate scripts to package.json (`d1:migrate:local`, `d1:migrate:remote`).
4. Build `api-key.ts`: `generateKey()` → `{ raw: 'btd_'+hex32, hash }`; `hashKey(raw)` WebCrypto SHA-256.
5. Build `api-key-auth-middleware.ts`: parse Bearer, KV-cache 60s, D1 lookup, scope guard factory `requireScope('content:write')`, update `last_used_at` via waitUntil.
6. Build `admin-keys-route-handler.ts` guarded by Firebase `admin` claim: create (return raw once), list (no hashes), revoke.
7. Update env.d.ts + index.ts mounts. Add `.dev.vars.example`.
8. `pnpm -F @btd/api typecheck`; run `wrangler d1 migrations apply --local` to verify SQL.

## Todo List
- [ ] wrangler.toml bindings (D1/Vectorize/R2/AI/cron/KV) for 3 envs
- [ ] migrations/0001_init.sql (content+FTS+api_keys+audit+taxonomy)
- [ ] d1-client.ts helpers
- [ ] api-key.ts (gen/hash/verify)
- [ ] api-key-auth-middleware.ts (scopes + KV cache)
- [ ] admin-keys-route-handler.ts (Firebase claim guard)
- [ ] env.d.ts + index.ts + package.json deps + .dev.vars.example
- [ ] typecheck + local D1 migrate verify

## Success Criteria
- `wrangler d1 migrations apply --local` succeeds; FTS5 query with diacritic-stripped term matches accented row.
- Admin creates a key (raw shown once) → key authenticates a `content:read` probe; wrong-scope request → 403 with problem-details.
- Revoked key → 401. `typecheck` clean. No secret values committed.

## Risk Assessment
| Risk | L×I | Mitigation |
|------|-----|------------|
| FTS5 diacritic config wrong → VI search misses | M×H | Acceptance test: insert "Bất Tử", query "bat tu" returns row before phase done |
| `wrangler.toml` `main` path mismatch (workers/ vs workers/api/) | M×M | Verify `wrangler dev` boots from `workers/`; fix path or relocate config |
| KV key cache → stale after revoke (60s window) | L×M | Short 60s TTL accepted; document. Admin revoke also deletes KV entry immediately |
| D1 free-tier write cap (1k/day) hit during seed | L×M | Key/content writes low volume; batch reconcile is upsert not insert-storm |

## Security Considerations
- Raw API keys never persisted (only SHA-256). Show-once on create.
- `created_by` on keys = Firebase admin uid (audit). Admin endpoints require custom claim `admin=true`, not mere auth (avoids "any login = admin" caveat from CLAUDE.md).
- Scope guards default-deny: missing scope → 403.

## Next Steps
Unblocks phase-02 (ingest uses `content:write` scope + D1 client + Firestore REST already present).
