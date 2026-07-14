# Brainstorm — FE+BE Redesign (DevOps)

**Date:** 2026-05-15 21:30 (Sydney)
**Branch:** `claude/immortality-mobile-hybrid`
**Driver (per user):** kiến trúc lởm do LLM cùi làm trước đó — redesign clean
**Constraints:** mở vendor, timeline 4-6 tuần phased side-by-side
**Status:** Design phase — chưa implement

---

## 1. Problem Statement

Hiện trạng có 3 backend song song, OG render duplicate, mobile RN sắp launch chưa có 1 API endpoint canonical, admin auth lỏng (`request.auth != null`).

**Pain points cụ thể:**

| # | Vấn đề | Bằng chứng |
|---|---|---|
| 1 | OG render 2 nơi | `functions/index.js` + `api/og.js` cùng logic, fork-and-forget |
| 2 | Deploy split-brain | `firebase.json` rewrite → Function; `vercel.json` rewrite → `/api/og` — tùy host nào active |
| 3 | Workers scaffold dở 3 tháng | `wrangler.toml` chứa `REPLACE_WITH_KV_*_ID` placeholders, chưa deploy |
| 4 | Mobile API mơ hồ | RN sắp submit App Store nhưng không rõ trỏ `api.battudao.com` về đâu |
| 5 | Admin lỏng | `firestore.rules:request.auth != null` = bất kỳ user login đều ghi được mọi collection |
| 6 | Firestore rules manual deploy | `firebase.json` có `firestore.rules` config nhưng historical deploy thủ công, dễ sót |
| 7 | node_modules sưng | `functions/` 73MB, `workers/` 376MB → CI chậm |
| 8 | Vendor sprawl | Firebase + Vercel + Cloudflare scaffold = 3 dashboard, 3 secret store, 3 deploy pipeline |

---

## 2. Recommended Architecture — Cloudflare-First Hybrid

**Triết lý:** giữ cái đang work tốt (Firebase Auth + Firestore), thay BE compute sang Cloudflare (Workers + Pages + R2 + DO + KV) đồng nhất. Retire Vercel + Firebase Functions.

### 2.1 Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                          USERS                                  │
│         Web (battudao.com) + Mobile RN (iOS/Android)            │
└─────────┬───────────────────────────────────┬───────────────────┘
          │ HTTPS                             │ HTTPS
          ▼                                   ▼
    ┌──────────────────┐            ┌──────────────────────┐
    │ Cloudflare Pages │            │ Cloudflare Workers   │
    │ apps/web Vite    │            │ workers/api (Hono)   │
    │ + edge CDN       │            │ api.battudao.com     │
    │ + OG rewrite     │            │                      │
    │   crawler→Worker │            │ Routes:              │
    └──────────────────┘            │  /v1/profiles        │
          │                         │  /v1/questions       │
          │                         │  /v1/answers         │
          │                         │  /v1/votes           │
          │ Firebase JS SDK         │  /v1/comments        │
          │ (web — direct read)     │  /v1/upload (→ R2)   │
          │                         │  /og/* (consolidate) │
          ▼                         │  /paid/*  (paid-tier)│
    ┌────────────────────────┐      └──────────┬───────────┘
    │ FIREBASE (KEPT)        │ ◄────────────── │ JWKS verify
    │ • Auth (web+mobile)    │                 │ + Firestore REST
    │ • Firestore (CMS DB)   │                 │
    │ • IndexedDB cache (web)│                 │
    └────────────────────────┘                 │
                                               │
          ┌────────────────────┬───────────────┼────────────────┐
          ▼                    ▼               ▼                ▼
    workers/realtime      workers/notion    Cloudflare R2   Cloudflare KV
    Durable Objects       Cron daily        media/uploads   JWKS cache,
    ephemeral chat        Notion → Firestore + R2 prefix    OG cache,
    slow-mode 1msg/2s     Claude AI bridge  shared bucket   rate-limit
    5min idle TTL                           btd/ key prefix counters
```

### 2.2 Decisions table

| Layer | Choice | Why | Drop |
|---|---|---|---|
| Web hosting | **Cloudflare Pages** | Free, edge CDN tốt VN, build pnpm native | Firebase Hosting, Vercel |
| Web framework | **Vite 5 + React 18 SPA** (keep) | App.jsx 299 dòng, lazy pages — đang ổn. Migrate Next chỉ tăng complexity | (no change) |
| API runtime | **Cloudflare Workers (Hono)** | Scaffold đã có, edge V8 isolates, free 100K req/day | Firebase Functions, Vercel `/api/*` |
| Realtime | **Durable Objects** (`workers/realtime`) | Đã design slow-mode + TTL, ephemeral chat phù hợp | (no alt needed) |
| Cron + AI | **Workers cron** (`workers/notion`) | Đã có, daily Notion sync + Claude hỏi ngược | (no alt) |
| Auth | **Firebase Auth** (keep) | Mobile RN native SDK + Web SDK + JWKS verify Worker | (no change) |
| DB | **Firestore** (keep) | Mobile RN native realtime, web SDK direct read, IndexedDB cache | (no migrate — too much rewrite) |
| Storage | **Cloudflare R2** (already chosen) | Shared bucket `btd/` prefix, S3 API compat | Firebase Storage (Blaze) |
| Secrets | **Wrangler secrets + .env** | Per-env (staging, prod), no checked-in keys | Vercel env, Firebase config |
| DNS | **Cloudflare DNS** (proxy on for web, off for api subdomain) | Faster, free | (no change if đang dùng) |
| CI/CD | **GitHub Actions → Wrangler deploy + CF Pages auto** | Push to main = staging, tag = prod | Vercel auto-deploy |

### 2.3 Routing strategy (consolidate OG render)

**Current mess:**
- `firebase.json` rewrites `/article/**` → Firebase Function `ogRenderer`
- `vercel.json` rewrites `/article/:slug*` → `/api/og?p=...`
- **Two implementations of the same logic.**

**New:**
- Cloudflare Pages serves `apps/web/dist/index.html` for all routes
- Worker (or Pages Function) intercepts **only crawler user-agents** for routes `/article/**`, `/topic/**`, `/stories`, `/khaitri/**`, `/about`, `/practice`, `/articles`, `/contact`, `/search`
- Crawler detection: `User-Agent` regex (Facebook, Twitter, Zalo, Telegram, WhatsApp, Slack, Discord, Googlebot, Bingbot, Linkedin)
- Worker fetches Firestore → renders OG meta HTML inline
- **One implementation, one deploy, one log stream.**

### 2.4 Security hardening (phase 5 deliverable)

| # | Fix |
|---|---|
| S1 | Firestore admin → custom claim `admin=true` set via Firebase Admin SDK, rules check `request.auth.token.admin == true` |
| S2 | `firebase.json` already has `firestore.rules` block — wire to CI deploy step (or document one-line `firebase deploy --only firestore:rules`) |
| S3 | Move admin SDK key out of `src/` → `secrets/` (gitignored already, but convention) |
| S4 | Rotate any Firebase/Vercel/Cloudflare API keys that may have leaked in 3 months of dual-deploy |
| S5 | CSP header — already strict in `firebase.json`; migrate to Pages `_headers` file |
| S6 | Rate limit on Worker — KV-backed counter per IP for write endpoints |

---

## 3. Alternative Approaches (Considered, Rejected)

### 3.1 Vercel-Native (Fluid Compute)
- **Pros:** Đang chạy `/api/*`, DX nhất, ISR cho future migration Next
- **Rejected because:**
  - Bandwidth pricing đắt hơn CF khi media (audio Khai Trí, video) scale
  - Không có native ephemeral WS như Durable Objects → cần Ably/Pusher = vendor mới
  - Vercel Functions cold start (so với Workers V8 isolates) lâu hơn cho VN traffic
  - Đã đầu tư scaffold Workers — bỏ = phí

### 3.2 Firebase-Native Consolidation
- **Pros:** 1 vendor, mobile SDK realtime "free", auth tích hợp sâu
- **Rejected because:**
  - Firebase Functions v2 cold start tệ nhất (5-10s) cho mobile RN UX
  - Vendor lock Google tuyệt đối — không exit ramp
  - Firestore scaling cost vượt CF Workers nhanh
  - Mất Durable Objects design đã có cho chat ephemeral

### 3.3 Conservative (chỉ fix fragmented, không rewrite)
- **Pros:** 1 tuần xong, ít risk
- **Rejected because:**
  - User explicit: "redesign anh chấp nhận thay đổi"
  - Workers scaffold đã có sẵn 80% — phí nếu không dùng
  - Mobile API contract cần stable endpoint trước launch
  - Maintenance nợ tiếp tục tích lũy

### 3.4 Full migrate DB (Firestore → D1/Turso/Neon)
- **Considered briefly, rejected:**
  - Web hooks (useArticles, useKhaiTri, useStories, ...19 hooks) đã dùng Firestore SDK trực tiếp
  - Mobile RN `@react-native-firebase` realtime listeners không thay được bằng D1 (no push)
  - Migrate = rewrite toàn bộ FE data layer = không phải DevOps redesign, là rebuild project
  - Firestore free tier 50K reads/day đủ cho hiện tại + 6 tháng growth

---

## 4. Phased Migration Plan (4-6 weeks, side-by-side)

### Phase 1 — Foundation (Week 1-2)
**Goal:** workers/api production-ready, OG consolidated.

- [ ] Fill KV namespace IDs trong `workers/wrangler.toml` (`wrangler kv:namespace create KV_JWKS` etc.)
- [ ] `wrangler secret put FIREBASE_PROJECT_ID` + `FIREBASE_SERVICE_ACCOUNT_JSON`
- [ ] Deploy `workers/api` to staging (`btd-api-staging.workers.dev`)
- [ ] Implement `/og/*` route trong workers/api — port từ `functions/index.js` (Firebase) + `api/og.js` (Vercel) sang 1 file canonical
- [ ] Test OG meta với Facebook Sharing Debugger + Twitter Card Validator (staging)
- [ ] Deploy `workers/api` to production (`api.battudao.com`)
- [ ] **Cutover crawler traffic:** Firebase Hosting `firebase.json` rewrites → Worker thay vì Function (proxy via fetch)
- [ ] **Side-by-side:** Function vẫn live 7 ngày để rollback nếu cần
- [ ] Retire `functions/index.js` ogRenderer rewrites sau verify (DELETE deploy)

**Verify:** Facebook share `/article/foo` shows correct OG image + title. No 500s 24h.

### Phase 2 — Mobile API (Week 2-3)
**Goal:** mobile RN có 1 endpoint canonical.

- [ ] Port `/api/upload-file.js` + `/api/upload-from-url.js` (Vercel) → workers/api `/v1/upload` (R2 direct)
- [ ] Port `/api/chat.js` (Vercel) → workers/api `/v1/chat` (Claude AI proxy)
- [ ] Implement `/v1/profiles`, `/v1/questions`, `/v1/answers`, `/v1/votes`, `/v1/comments` routes (Firestore REST via JWKS verify)
- [ ] Deploy `workers/realtime` Durable Objects (`rt.battudao.com`) — `/chat/:channelId` WS endpoint
- [ ] Mobile RN env: `EXPO_PUBLIC_API_URL=https://api.battudao.com` + `EXPO_PUBLIC_RT_URL=wss://rt.battudao.com`
- [ ] Test Durable Objects slow-mode rate limit (1msg/2sec) + presence broadcast
- [ ] Test JWKS cache hit rate (target >99% after warm)

**Verify:** Mobile RN dev client connects, posts question, receives realtime chat. No errors 48h.

### Phase 3 — Web Hosting Migration (Week 3-4)
**Goal:** battudao.com served từ Cloudflare Pages.

- [ ] Lower DNS TTL battudao.com (3600 → 300) — 24h trước cutover
- [ ] Create Cloudflare Pages project `btd-web`, connect GitHub repo
- [ ] Build settings: root `apps/web`, build `pnpm install && pnpm run build`, output `dist`
- [ ] Add `_headers` file `apps/web/public/_headers` migrate CSP từ `firebase.json`
- [ ] Add `_redirects` file cho crawler → Worker OG (or use Pages Function middleware)
- [ ] Deploy preview, test FCM web push, IndexedDB cache, SW v3
- [ ] **DNS cutover:** battudao.com CNAME → Pages
- [ ] **Side-by-side:** Firebase Hosting alive 7 ngày
- [ ] Monitor sw.js cache invalidation (bump cache name v3 → v4 nếu cần)

**Verify:** Lighthouse score parity, PWA install works, FCM push notifications arrive. No 4xx spike.

### Phase 4 — Notion + AI (Week 4-5)
**Goal:** workers/notion live, Claude AI bridge từ Worker.

- [ ] Deploy `workers/notion` cron (`0 3 * * *` daily)
- [ ] Notion API key → CF secret (rotate từ existing storage)
- [ ] Claude API key → CF secret
- [ ] Sync 1 collection (articles) end-to-end → verify Firestore writes
- [ ] Enable AI hỏi ngược endpoint (paid tier 99K/tháng)
- [ ] Monitor cron success rate 1 tuần

### Phase 5 — Cleanup + Security (Week 5-6)
**Goal:** retire old infra, harden auth.

- [ ] **Delete Vercel project** btd-web (sau khi Phase 3 ổn 14 ngày)
- [ ] **Delete Firebase Functions** `ogRenderer` (sau khi Phase 1 ổn 21 ngày)
- [ ] Move admin SDK key `apps/web/src/immortalityvn-firebase-adminsdk-*.json` → `secrets/`
- [ ] Add Firebase custom claim `admin=true` via script (`scripts/grant-admin.js`)
- [ ] Rewrite `firestore.rules`: change `request.auth != null` → `request.auth.token.admin == true` cho admin-only collections
- [ ] Wire CI: `firebase deploy --only firestore:rules` trong release workflow
- [ ] Rotate all secrets touched 3 tháng qua (audit list)
- [ ] Update CLAUDE.md known caveats — mark fixed

---

## 5. Risk Assessment

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R1 | DNS cutover sai → site down | Low | High | TTL 300s 24h trước, rollback CNAME trong 5 phút |
| R2 | OG render Worker bug → social share lỗi | Med | Med | Phase 1 side-by-side 7 ngày, A/B sample 10% |
| R3 | Firestore egress từ Worker → cost spike | Med | Med | KV cache OG 1h, Firestore READ via REST batch only |
| R4 | Durable Objects scale cost (chat heavy users) | Low | Med | Slow-mode 1msg/2sec đã có, monitor DO billing weekly |
| R5 | Firebase Auth JWKS cache miss → latency | Low | Low | Pre-warm KV trên Worker init, TTL 6h |
| R6 | Mobile cert pinning broken khi đổi cert chain | Low | High | Confirm mobile không cert-pin trước cutover |
| R7 | sw.js stale cache → users see broken UI sau Pages migrate | Med | Low | Bump SW cache name + skipWaiting + force update banner |
| R8 | Notion API rate limit | Low | Low | Daily cron only, exponential backoff |
| R9 | Wrangler deploy fail trong CI | Low | Med | Wrangler 3.91+ stable, fallback manual deploy |
| R10 | Firestore rules tighten → admin lock out | High | High | **TEST trên emulator trước**, grant claim `admin=true` cho UID anh TRƯỚC khi siết rules |

**[Per memory: ask-before-destructive-security-changes]** — R10 cần em xin credentials anh (uid) + xác nhận trước khi flip Firestore rules.

---

## 6. Cost Projection

**Current (estimated):**
- Firebase Functions: ~$0 (free tier 2M invocations/mo, ogRenderer dùng ~10K)
- Vercel Hobby: $0 (under limits)
- Firebase Hosting: $0 (under 10GB transfer)
- Firestore: $0 (under 50K reads/day)
- Total: ~$0/mo

**After redesign (estimated):**
- Cloudflare Pages: $0 (unlimited bandwidth)
- Cloudflare Workers Free: $0 (100K req/day = 3M/mo)
- Durable Objects: $0 (1M req/mo + 400K GB-s included in Workers Paid $5/mo when scale)
- R2: $0 (10GB storage + 1M class A ops)
- KV: $0 (100K reads/day)
- Firebase Auth + Firestore: $0 (same)
- Total: $0-5/mo at current scale; ~$25/mo at 10x scale

**Savings vs scaling on Vercel/Firebase Functions:** ~$50-100/mo at 100K MAU.

---

## 7. Success Metrics

| Metric | Baseline | Target post-redesign |
|---|---|---|
| OG render p95 latency | ? (Function cold start ~3s) | < 200ms (Worker edge) |
| Mobile API p95 latency (VN) | N/A | < 100ms |
| Deploy time (full stack) | ~5min (Firebase + Vercel) | ~2min (CF Pages + Workers) |
| Vendor dashboards | 3 (FB+Vercel+CF) | 2 (FB+CF) |
| OG render duplicate code | 2 implementations | 1 |
| Admin auth security | `auth != null` | custom claim `admin=true` |
| node_modules total | ~450MB | ~150MB (drop functions/, drop Vercel /api deps) |
| Plan/scaffold debt | workers scaffold idle 3mo | All deployed, none idle |

---

## 8. Open Questions

1. **DNS provider hiện tại của battudao.com?** (Cloudflare? Namecheap? Google Domains?) — ảnh hưởng Phase 3 cutover.
2. **Mobile RN có cert-pin Firebase Hosting cert không?** — nếu có, cần update SHA pins trước Phase 3.
3. **AI Hỏi Ngược paid tier — billing đang chạy đâu?** (SePay? Stripe?) — nếu có active subscriptions, Phase 4 cần migration plan billing not chỉ API.
4. **Có analytics/monitoring nào đang gắn vào Vercel/Firebase Functions không?** (Sentry? Datadog?) — cần re-wire vào Workers tail logs.
5. **Notion sync hiện đang chạy ở đâu?** (Manual? GitHub Actions? Server bên ngoài?) — `workers/notion` scaffold chưa deploy, nên có thể chưa migrate gì.
6. **Audio Khai Trí + video TBD đang host đâu?** — confirm R2 hay external CDN.
7. **CI/CD hiện tại:** Vercel auto-deploy + Firebase manual? Cần re-design pipeline trước Phase 1 hay sau?

---

## 9. Next Step

Em recommend **chạy `/ck:plan` với context report này** → tạo plan dir `plans/260515-2130-febe-redesign/` với 5 phase files (phase-01 → phase-05) tương ứng Section 4 above. Plan sẽ có TODO checkboxes, file ownership, risk per phase, success criteria per phase.

Sau khi anh approve plan, em (hoặc subagent fullstack-developer) implement từng phase tuần tự, side-by-side cutover, rollback gates giữa các phase.

**Status:** DONE_WITH_CONCERNS
**Summary:** Architecture design complete — Cloudflare-first hybrid, keep Firebase Auth+Firestore, retire Vercel + Firebase Functions, phased 5-step migration over 4-6 weeks.
**Concerns:** 7 open questions ở Section 8 cần anh answer trước khi plan chi tiết (đặc biệt DNS, mobile cert-pin, admin UID cho R10 mitigation).
