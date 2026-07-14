# Phase 02 — Content ingest v2 + Firestore write + R2 media

## Context Links
- Brainstorm §4 (write path), §10 (idempotent ingest, structured errors)
- Vercel contract to mirror: `api/articles/index.js`, `api/khaitri/index.js`, `api/upload-file.js`, `api/upload-from-url.js`, `api/_lib/r2.js`, `api/_lib/slug.js`, `schemas/articles.js`, `schemas/khaitri.js`
- Reuse: `workers/api/src/lib/firestore-rest-client.ts` (getDoc/setDoc/queryCollection already built)

## Overview
- **Priority:** P1
- **Status:** pending
- Unified ingest for 5 content types with idempotent dedup, zod validation, problem-details errors. Write path: validate → (enrich stub, real in P03) → Firestore canonical write → `waitUntil` D1 upsert. R2 media upload mirrors Vercel contract (raw bytes + from-URL).
- **Depends on:** phase-01 (D1 client, `content:write`/`media:write` scopes, env bindings).

## Key Insights
- Firestore stays **canonical** per brainstorm — write there first (existing `setDoc`/`createOnly`), then mirror to D1 in `waitUntil` so D1 drift is repaired by P05 cron even if waitUntil fails.
- Type discriminator decides Firestore collection: `article→articles`, `story→stories`, `khaitri→khaitri`, `teaching→teachings`, `practice→practices`. Single ingest path, per-type collection mapping (matches existing Firestore collections in CLAUDE.md).
- **Idempotency two-layer:** `source_ref` (agent-supplied external_id) unique → 409-as-success returns existing id; `content_hash` (sha256 of canonical vi/en body) catches same-content-different-ref → warn, return existing. Mirrors Vercel `sourceRef` 409 behavior but additive hash layer.
- R2 in Workers uses **native R2 binding** (`env.R2.put`), NOT the `@aws-sdk/client-s3` the Vercel side uses. Simpler, no creds in env. Public URL = `R2_PUBLIC_URL/key`. Key scheme identical to Vercel (`immortality-vn/{folder}/{slug}-{ts}.{ext}`) so URLs stay consistent.
- Slug logic must be **byte-identical** to `api/_lib/slug.js` (VI_MAP) so URLs match web/functions. Port verbatim to `content-slug.ts`.

## Contract mapping (old Vercel → new Workers)
| Old (Vercel, keep running) | New (Workers `/v1`) | Notes |
|---|---|---|
| `POST /api/articles` | `POST /v1/content` `{type:'article'}` | unified |
| `POST /api/khaitri` | `POST /v1/content` `{type:'khaitri'}` | unified |
| `PUT/PATCH /api/articles/:id` | `PATCH /v1/content/:id` | partial merge |
| `GET /api/articles` / `:id` | `GET /v1/content?type=article` / `/v1/content/:id` | list reads D1, detail reads D1 (fallback Firestore) |
| `POST /api/upload-file` | `POST /v1/media` (raw bytes, `X-Intent`,`X-Slug`) | native R2 |
| `POST /api/upload-from-url` | `POST /v1/media/from-url` `{url,intent,slug}` | SSRF-hardened |
| Firebase ID token + email allowlist | `btd_` API key + scopes | auth swap |
| `GET /api/agent-spec` | `GET /v1/agent-spec` (P04) | discovery |

## Requirements
**Functional**
- `POST /v1/content` (scope `content:write`): zod-validate per type, dedup (source_ref + hash), stamp slugs + `created_by=agentName`, write Firestore, mirror D1, return `{ id, type, publicUrl, status }`.
- `PATCH /v1/content/:id`: partial update, re-stamp slug if title changed, re-hash, Firestore merge + D1 upsert, mark `embedded=0` if body changed (re-embed in P03/cron).
- `GET /v1/content` (scope `content:read`): list from D1 (paginated, `type`/`status` filters). `GET /v1/content/:id`: D1 then Firestore fallback.
- `POST /v1/media` + `POST /v1/media/from-url` (scope `media:write`): ≤8MB, allowed CTs, SSRF guard on from-url (deny data:/file:/private IPs — port from Vercel).

**Non-functional**
- Structured problem-details on every error: `{ type, title, status, code, detail, hint }` (RFC 9457 shape) so agent loop self-corrects.
- Firestore write is the commit point; D1/enrich failures never fail the request (waitUntil).

## Architecture
**Write flow:** `ingest-content-service.ts`
1. zod parse (type-discriminated union) → 422 problem-details on fail.
2. dedup: query D1 `source_ref` + `content_hash` → 200 existing if dup.
3. enrich (P02 stub: slug only; P03 fills taxonomy/SEO/embed).
4. `firestore.setDoc(collection, id, doc, {createOnly})` — id = generated or from source_ref-derived.
5. `ctx.waitUntil(d1Upsert(content) + auditLog(action='publish'))`.

**Handler core extraction (for P04 MCP reuse):** business logic in `services/ingest-content-service.ts` takes `(env, input, agentCtx)` and returns a plain result — REST route and MCP tool both call it. No `Context`-coupling in the service.

## Related Code Files
**Create**
- `workers/api/src/schemas/content-request-schemas.ts` (zod discriminated union, 5 types)
- `workers/api/src/services/ingest-content-service.ts` (handler core, env+input→result)
- `workers/api/src/services/content-dedup.ts` (source_ref + content-hash)
- `workers/api/src/lib/content-slug.ts` (port `api/_lib/slug.js` verbatim)
- `workers/api/src/lib/problem-details.ts` (RFC 9457 error builder)
- `workers/api/src/lib/r2-media.ts` (native R2 put + key scheme + SSRF guard for from-url)
- `workers/api/src/routes/content-route-handler.ts` (POST/PATCH/GET `/v1/content`)
- `workers/api/src/routes/media-route-handler.ts` (`/v1/media`, `/v1/media/from-url`)
- `workers/api/src/db/content-repository.ts` (D1 upsert/list/get for `content`)

**Modify**
- `workers/api/src/index.ts` (mount `/v1/content`, `/v1/media`)
- `workers/api/src/middleware/error-handler-middleware.ts` (emit problem-details shape)

## Implementation Steps
1. Port slug + SSRF guard from Vercel `_lib/slug.js` / `upload-from-url.js` verbatim.
2. Define zod schemas: base `{ type, source_ref?, status, vi{title,summary,body}, en{...}, topic?, tags?, image? }` + per-type extras (khaitri `question`, story `order`, etc.). Discriminated on `type`.
3. `content-hash.ts` helper inside dedup: sha256 of `vi.body+en.body` canonicalized.
4. `ingest-content-service.ts`: orchestrate validate→dedup→slug→Firestore→waitUntil(D1+audit). Keep <200 lines; extract dedup + repository.
5. `content-repository.ts`: D1 `INSERT ... ON CONFLICT(id) DO UPDATE` upsert; list with `type`/`status`/limit/offset; get by id.
6. `r2-media.ts`: native `env.R2.put(key, bytes, {httpMetadata})`; reuse key scheme; from-url path fetches with SSRF allowlist.
7. Wire routes with `requireScope`. Mount in index.ts.
8. typecheck; manual `wrangler dev` curl: create → dup → patch → media upload.

## Todo List
- [ ] content-slug.ts (verbatim port) + parity test vs Vercel output
- [ ] content-request-schemas.ts (5-type discriminated union)
- [ ] content-dedup.ts (source_ref + content-hash)
- [ ] problem-details.ts (RFC 9457)
- [ ] r2-media.ts (native R2 + SSRF guard)
- [ ] content-repository.ts (D1 upsert/list/get)
- [ ] ingest-content-service.ts (handler core, MCP-reusable)
- [ ] content-route-handler.ts + media-route-handler.ts
- [ ] index.ts mounts + error-handler problem-details
- [ ] typecheck + dev curl smoke (create/dup/patch/media)

## Success Criteria
- `POST /v1/content {type:article}` → 201 with `publicUrl` matching web slug format; repeat same `source_ref` → 200 existing id (no dup in Firestore or D1).
- Same body, new source_ref → content-hash dedup returns existing with warning.
- `POST /v1/media` 7MB png → R2 URL resolves; 9MB → 413 problem-details; from-url to `http://169.254.x` → blocked.
- D1 `content` + `content_fts` populated after each write. All errors are problem-details JSON.

## Risk Assessment
| Risk | L×I | Mitigation |
|------|-----|------------|
| Slug drift from Vercel/web → broken canonical URLs | M×H | Verbatim port + parity test against `api/_lib/slug.js` cases |
| waitUntil D1 mirror fails silently → drift | M×M | P05 nightly reconcile repairs; audit log records D1 write failures |
| SSRF on from-url | L×H | Port Vercel allowlist (deny data:/file:/private CIDR) before merge |
| Firestore id strategy collides with Vercel auto-id docs | L×M | Generate ids in same namespace; source_ref-unique index prevents dupes |
| R2 native binding vs Vercel S3 produces different URL | L×M | Identical key scheme + `R2_PUBLIC_URL`; verify URL string equality |

## Security Considerations
- `content:write` / `media:write` scope enforced per route.
- SSRF hardening mandatory on from-url. Size + content-type allowlist on both upload paths.
- `created_by` = authenticated `agentName` from key (audit trail).

## Next Steps
Unblocks P03 (enrich plugs into ingest-content-service), P04 (MCP wraps service core), P05 (reconcile syncs `content` table).
