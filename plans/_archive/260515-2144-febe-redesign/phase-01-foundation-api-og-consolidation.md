# Phase 01 — Foundation: workers/api + OG Consolidation

## Context Links

- Plan overview: [plan.md](plan.md)
- Brainstorm report: [../reports/brainstorm-260515-2130-febe-redesign.md](../reports/brainstorm-260515-2130-febe-redesign.md)
- Non-tech explainer: [phase-00-why-redesign-for-non-tech.md](phase-00-why-redesign-for-non-tech.md)
- Current Firebase OG renderer: `functions/index.js`
- Current Vercel OG renderer: `api/og.js`
- Workers API scaffold: `workers/api/` (Hono, JWKS verify)

## Overview

- **Priority:** P0 (blocker cho mọi phase sau)
- **Status:** pending
- **Duration:** Tuần 1-2 (10-14 ngày)
- **Owner:** Đăng (Đăng confirm cutover gates)

**Mục tiêu:** Deploy `workers/api` to production, consolidate OG render từ 2 implementations (Firebase Functions + Vercel) → 1 implementation trên Workers. Cutover crawler traffic side-by-side, retire Firebase Function ogRenderer sau 7 ngày verify.

## Key Insights

- `workers/api/` đã scaffold xong Hono + jose JWKS (commit 280f6de). Chỉ cần fill KV namespace IDs + deploy.
- OG render hiện có 2 source code khác nhau (Firebase Functions Node.js vs Vercel Node.js). Consolidate = pick 1 logic làm canonical, port sang Workers Web Standards API (Request/Response native).
- KV cache OG response → giảm Firestore reads từ ~5K/day xuống ~500/day (10x).
- Firebase Hosting `firebase.json` rewrites trỏ về function `ogRenderer` — phải đổi thành proxy fetch đến Worker (hoặc đổi hosting sang CF Pages ở Phase 3, lúc đó loại bỏ rewrite hoàn toàn).

## Requirements

### Functional

- `api.battudao.com/og/article/:slug` returns OG meta HTML
- `api.battudao.com/og/topic/:id` returns OG meta HTML
- `api.battudao.com/og/khaitri/:slug` returns OG meta HTML
- Crawler user-agent detection (Facebook, Twitter, Zalo, Telegram, WhatsApp, Slack, Discord, Googlebot, Bingbot, LinkedIn)
- Non-crawler returns SPA shell (fallback to CF Pages serving in Phase 3, currently proxy to Firebase Hosting)
- KV cache OG response 1 hour TTL

### Non-functional

- p95 latency < 200ms (vs Firebase Function cold start 3-10s)
- Cache hit rate > 80% sau 24h warm
- Error rate < 0.1%
- Zero downtime cutover (side-by-side 7 ngày)

## Architecture

```
BEFORE:
Crawler → battudao.com/article/foo
  → Firebase Hosting rewrites
    → Firebase Function ogRenderer (Node.js, cold start 3-10s)
      → Firestore REST → render HTML

Crawler → battudao.com/article/foo (if Vercel host)
  → Vercel rewrite /api/og?p=...
    → Vercel Function api/og.js (Node.js)
      → Firestore REST → render HTML

(2 implementations, 2 deploys, possible drift)

AFTER:
Crawler → battudao.com/article/foo
  → Firebase Hosting rewrites (Phase 1) OR CF Pages middleware (Phase 3)
    → fetch api.battudao.com/og/article/foo
      → Worker (V8 isolate, cold start 5ms)
        → KV cache check
          → hit: return cached HTML
          → miss: Firestore REST → render → cache 1h → return

(1 implementation, 1 deploy, KV cache hot path)
```

## Related Code Files

### Modify
- `workers/api/wrangler.toml` — fill KV namespace IDs (production + staging)
- `workers/api/src/index.ts` — add `/og/*` routes (read Firestore, render HTML)
- `firebase.json` — change rewrites từ `function: ogRenderer` → `destination: https://api.battudao.com/og/...` proxy

### Create
- `workers/api/src/og/render.ts` — port OG render logic từ `functions/index.js`
- `workers/api/src/og/crawler-detect.ts` — user-agent regex
- `workers/api/src/og/cache.ts` — KV cache wrapper
- `workers/api/src/firestore/rest-client.ts` — Firestore REST API client (no SDK)
- `workers/api/src/__tests__/og.test.ts` — vitest cho 9 route types

### Delete (Phase 6 — không phải phase này)
- `functions/index.js` (Firebase Functions ogRenderer)
- `api/og.js` (Vercel)
- `functions/spa.html` copy step trong `apps/web/package.json` build script

## Implementation Steps

### Day 1-2: Setup
1. `wrangler login` để authenticate CF account
2. `cd workers/api && wrangler kv:namespace create KV_JWKS` → copy ID
3. `wrangler kv:namespace create KV_CACHE` → copy ID
4. Repeat for `--env staging` → fill `wrangler.toml` 4 IDs
5. `wrangler secret put FIREBASE_PROJECT_ID` (value: `immortalityvn`)
6. `wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON` (paste full JSON)
7. Repeat secrets for staging env
8. `wrangler deploy --env staging` → verify endpoint trả 200 OK

### Day 3-5: Port OG render
1. Read `functions/index.js` ogRenderer logic — note: Firestore admin SDK, OG meta template, crawler detection
2. Read `api/og.js` — compare logic, pick canonical (Firebase version newer, sources of truth)
3. Create `workers/api/src/og/render.ts`:
   - Input: route params (slug/id, collection name)
   - Output: HTML string với OG meta
   - Use Firestore REST API (not SDK — Workers không hỗ trợ Firebase Admin SDK well)
4. Create `workers/api/src/og/crawler-detect.ts` — port regex từ existing code
5. Create `workers/api/src/firestore/rest-client.ts` — `GET https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/{collection}/{docId}` với service account JWT auth
6. Wire routes vào `workers/api/src/index.ts`:
   - `GET /og/article/:slug`
   - `GET /og/articles/:slug`
   - `GET /og/topic/:id`
   - `GET /og/topic/:slug`
   - `GET /og/stories`
   - `GET /og/khaitri/:slug`
   - `GET /og/khaitri`
   - `GET /og/about`, `/og/practice`, `/og/contact`, `/og/search`, `/og/articles`
7. Run vitest unit tests local

### Day 6-7: KV cache layer
1. Create `workers/api/src/og/cache.ts`:
   - Cache key: `og:{collection}:{slug}` 
   - TTL: 3600s (1 hour)
   - Stale-while-revalidate: serve stale + async refresh
2. Wrap OG render in cache check
3. Add `?nocache=1` query param to bust cache (admin debug)
4. Deploy staging → load test 100 req → verify cache hit rate

### Day 8-9: Deploy production
1. `wrangler deploy --env production` → verify `api.battudao.com/og/article/test` returns valid HTML
2. Custom domain setup: CF Dashboard → Workers → `api.battudao.com` route
3. CORS headers verify (allow `https://battudao.com`, `https://immortality.vn`)

### Day 10-11: Cutover crawler traffic
1. Edit `firebase.json` rewrites — change từ:
   ```json
   { "source": "/article/**", "function": "ogRenderer" }
   ```
   thành:
   ```json
   { "source": "/article/**", "destination": "https://api.battudao.com/og/article/**" }
   ```
   **NOTE:** Firebase Hosting không hỗ trợ proxy rewrites đến external URL trực tiếp. Phải:
   - Option A: Tạm dùng Firebase Function pass-through (Function chỉ proxy fetch → Worker)
   - Option B: Defer cutover đến Phase 3 khi hosting đã sang CF Pages (Pages có `_redirects` native proxy)
2. **Em recommend Option B** — defer cutover crawler traffic đến Phase 3 cùng lúc với DNS migration. Phase 1 chỉ verify Worker hoạt động đứng độc lập.
3. Test crawler bằng `curl -A "facebookexternalhit/1.1" https://api.battudao.com/og/article/foo`
4. Validate Facebook Sharing Debugger + Twitter Card Validator

### Day 12-14: Verify + monitor
1. Tail logs `wrangler tail --env production` 24h
2. Check error rate via CF Dashboard
3. Compare OG HTML output 1-1 với Firebase Function (script diff)
4. Document any edge cases / drift

## Todo List

- [ ] Wrangler login + KV namespaces created (4 IDs)
- [ ] Secrets set (production + staging)
- [ ] `workers/api/src/firestore/rest-client.ts` created + unit tested
- [ ] `workers/api/src/og/render.ts` ported từ `functions/index.js`
- [ ] `workers/api/src/og/crawler-detect.ts` created
- [ ] `workers/api/src/og/cache.ts` KV wrapper
- [ ] 12 `/og/*` routes wired
- [ ] Staging deploy successful
- [ ] Production deploy successful
- [ ] `api.battudao.com` custom domain bound
- [ ] CORS verified
- [ ] OG HTML diff script confirms parity with Firebase Function
- [ ] Facebook Sharing Debugger validates 3 article URLs
- [ ] 24h tail log clean (no 5xx)
- [ ] Cache hit rate > 80% after 24h

## Success Criteria

- [ ] All 12 OG routes return valid HTML matching Firebase Function output (semantic diff acceptable: ws/timestamp ok, content must match)
- [ ] p95 latency < 200ms (measured via CF Analytics)
- [ ] Cache hit rate > 80% sau 24h warm
- [ ] Zero 5xx errors trong 7 ngày staging
- [ ] Production deploy chạy 7 ngày không incident before Phase 3 cutover gate

## Risk Assessment

| # | Risk | Mitigation |
|---|---|---|
| P1-R1 | Firestore REST egress từ Workers tăng cost | KV cache 1h TTL, expect 80%+ hit rate, monitor weekly |
| P1-R2 | Worker bundle size > 1MB (CF free tier limit) | Tree-shake, dynamic imports nếu cần; hiện scaffold ~200KB |
| P1-R3 | JWKS rotation breaks auth (Firebase rotate public keys 6h) | KV cache JWKS 6h, fallback fetch on miss |
| P1-R4 | Firebase Hosting không proxy external URL — Option A/B decision | Em recommend Option B (defer to Phase 3) — simplify Phase 1 scope |
| P1-R5 | OG HTML drift giữa Worker và Firebase Function → social share broken | Diff script trong CI, side-by-side 7 ngày verify |
| P1-R6 | Wrangler deploy fail trong CI | Manual deploy fallback, wrangler 3.91+ stable |

## Security Considerations

- Service account JSON trong wrangler secret (encrypted at rest by CF)
- JWKS cache KV — read-only, no PII
- CORS strict: only `battudao.com`, `immortality.vn` origins
- No write endpoints exposed yet (Phase 2)
- Rate limit not required Phase 1 (OG is read-only, KV cache absorbs spike)

## Next Steps

- **Blocks:** Phase 2 (Mobile API) needs workers/api production-stable
- **Unblocks:** Phase 3 (Web hosting migration) can cutover crawler routes once `api.battudao.com/og/*` proven
- **Parallel:** Phase 5 (DB hygiene) can start anytime — no compute dependency

## Open Questions

1. Cutover crawler traffic Option A (Firebase Function pass-through) hay Option B (defer to Phase 3)? Em recommend B.
2. Có cần preserve OG analytics tracking pixel hiện tại không? (Check `functions/index.js` xem có log gì)
3. `vercel.json` rewrites — leave alone hay remove now? (Em recommend leave — Phase 6 cleanup)
