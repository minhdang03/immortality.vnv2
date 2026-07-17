# Phase 03 — Web Hosting Migration → Cloudflare Pages

## Context Links

- Plan overview: [plan.md](plan.md)
- Phase 1 (workers/api): [phase-01-foundation-api-og-consolidation.md](phase-01-foundation-api-og-consolidation.md)
- Phase 2 (mobile API): [phase-02-mobile-api-realtime.md](phase-02-mobile-api-realtime.md)
- Current hosting: Firebase Hosting (battudao.com)
- Alt hosting: Vercel (vercel.json present)
- Web app source: `apps/web/`
- Build config: `apps/web/package.json` script `build`
- SW: `apps/web/public/sw.js` (v3)

## Overview

- **Priority:** P1
- **Status:** pending (depends on Phase 1+2 verify)
- **Duration:** Tuần 3-4 (7-10 ngày, includes 7-day side-by-side observation)
- **Owner:** Đăng (anh decide cutover window)

**Mục tiêu:** battudao.com serve từ Cloudflare Pages thay vì Firebase Hosting. Migrate CSP headers, OG crawler rewrite, PWA manifest, SW cache. DNS cutover gradual. Firebase Hosting giữ alive 14 ngày sau cutover để rollback.

## Key Insights

- `apps/web/package.json` build script copy `dist/index.html` → `functions/spa.html` cho Firebase Function. Step này thừa sau Phase 6 retire Function. Tạm giữ trong Phase 3.
- `firebase.json` đã có CSP + security headers — port sang Pages `_headers` file format.
- PWA SW v3 cache name — sau khi migrate hosting có thể cần bump v4 vì origin (Firebase Hosting) đổi sang (CF Pages); SW path không đổi nhưng asset hashes có thể đổi.
- DNS battudao.com — chưa biết provider hiện tại. **OPEN QUESTION** ở plan.md.
- FCM web push — relies trên domain ownership verification trong Firebase Console. Cutover hosting KHÔNG ảnh hưởng FCM (FCM verify qua DNS TXT record, không depend hosting provider).

## Requirements

### Functional

- battudao.com + www.battudao.com serve từ CF Pages
- immortality.vn serve từ CF Pages (cùng project, separate domain)
- Build từ `apps/web` source, pnpm install --frozen-lockfile
- Output `apps/web/dist`
- SPA fallback all routes → index.html (except crawler → OG Worker)
- Static assets cache 1 year immutable
- SW cache no-cache
- FCM push notifications continue working
- Service worker registration + update flow works

### Non-functional

- Build time < 3 min (CF Pages)
- LCP parity hoặc better vs Firebase Hosting
- Lighthouse score ≥ 90 (current baseline)
- DNS cutover downtime < 5 min worst case (TTL 300s)
- Zero data loss

## Architecture

```
DNS battudao.com (Cloudflare DNS recommend)
  │
  ├── A / CNAME → CF Pages (orange-cloud ON: proxied)
  │
  └── (Phase 1+2 already done)
       ├── api.battudao.com → CF Workers (workers/api)
       └── rt.battudao.com → CF Workers (workers/realtime)

CF Pages Project: btd-web
  │
  ├── Source: github.com/.../immortality-vn
  ├── Branch: claude/immortality-mobile-hybrid (or main after merge)
  ├── Build cmd: pnpm install --frozen-lockfile && pnpm --filter @btd/web build
  ├── Output: apps/web/dist
  ├── Root dir: / (monorepo root, build filters via --filter)
  │
  ├── _headers (CSP, security, cache rules)
  ├── _redirects (crawler → api.battudao.com/og/*, SPA fallback)
  │
  └── Functions (optional): middleware crawler-detect → fetch Worker OG
```

## Related Code Files

### Modify
- `apps/web/package.json` — build script (drop `functions/spa.html` copy in Phase 6)
- `apps/web/vite.config.js` — verify base path `/`
- `apps/web/public/sw.js` — bump cache name v3 → v4 (force update)

### Create
- `apps/web/public/_headers` — CSP + security headers + cache rules (port từ `firebase.json`)
- `apps/web/public/_redirects` — crawler routes + SPA fallback
- `apps/web/functions/_middleware.ts` (optional CF Pages Function) — UA-based crawler detect + proxy to Worker

### Reference (no edit)
- `firebase.json` — read CSP/headers config to port
- `vercel.json` — read rewrites for OG (Phase 6 delete)

## Implementation Steps

### Day 1: Pre-flight checks
1. Confirm DNS provider của battudao.com với anh
2. If not Cloudflare DNS → recommend migrate DNS to Cloudflare first (free, faster, easier orange-cloud)
3. Audit mobile cert-pin (Phase 2 follow-up if not done)
4. Audit FCM web push setup — note Firebase Console "Authorized domains" list

### Day 2: CF Pages project setup
1. Cloudflare Dashboard → Pages → "Create application" → "Connect to Git"
2. Select repo, branch `claude/immortality-mobile-hybrid` (will merge to main later)
3. Build settings:
   - Framework preset: None (custom)
   - Build command: `pnpm install --frozen-lockfile && pnpm --filter @btd/web build`
   - Build output: `apps/web/dist`
   - Root directory: `/`
   - Node version: 20 (Vite 5 compat)
4. Env vars: copy từ `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_API_URL=https://api.battudao.com`
   - `VITE_RT_URL=wss://rt.battudao.com`
5. Trigger first build, verify success

### Day 3: Headers + redirects
1. Create `apps/web/public/_headers`:
   ```
   /*
     X-Content-Type-Options: nosniff
     X-Frame-Options: DENY
     Referrer-Policy: strict-origin-when-cross-origin
     Permissions-Policy: geolocation=(), microphone=(), camera=()
     Strict-Transport-Security: max-age=31536000; includeSubDomains
     Content-Security-Policy: <port từ firebase.json>
   
   /assets/*
     Cache-Control: public, max-age=31536000, immutable
   
   /sw.js
     Cache-Control: no-cache
   ```
2. Update CSP — add `https://api.battudao.com`, `wss://rt.battudao.com` vào connect-src
3. Create `apps/web/public/_redirects`:
   ```
   # Crawler OG → Worker
   /article/*  https://api.battudao.com/og/article/:splat  200  Country=*  User-Agent=facebookexternalhit|Twitterbot|TelegramBot|WhatsApp|Slackbot|Discordbot|Googlebot|Bingbot|LinkedInBot|zalo
   ... (12 routes)
   
   # SPA fallback
   /*  /index.html  200
   ```
   **Note:** CF Pages `_redirects` UA filter syntax — verify support. If not, fallback to Pages Function middleware (next step).
4. Alternative: `apps/web/functions/_middleware.ts` (CF Pages Function):
   ```ts
   export const onRequest: PagesFunction = async ({ request, next, env }) => {
     const ua = request.headers.get('user-agent') || '';
     if (CRAWLER_REGEX.test(ua) && OG_ROUTES.test(new URL(request.url).pathname)) {
       return fetch(`https://api.battudao.com/og${url.pathname}`);
     }
     return next();
   };
   ```

### Day 4: Preview deploy + test
1. Push branch, CF Pages auto-deploys preview at `<branch>.btd-web.pages.dev`
2. Test functional checklist:
   - [ ] Home page loads
   - [ ] Article detail page (`/article/some-slug`) loads
   - [ ] Auth flow (Firebase email/password) works
   - [ ] FCM push registration succeeds
   - [ ] SW v3 → v4 update banner shows
   - [ ] IndexedDB persistent cache works (Firestore offline)
   - [ ] Donation flow works
   - [ ] Admin panel works
3. Lighthouse audit preview URL → record baseline
4. Crawler test: `curl -A "facebookexternalhit/1.1" https://<preview>.pages.dev/article/foo` → returns OG HTML (proxied via Worker)

### Day 5: FCM domain authorization
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add `<preview>.pages.dev` temporarily
3. Plan: after DNS cutover, `battudao.com` stays authorized; remove preview later

### Day 6: DNS preparation
1. Lower TTL: battudao.com A/CNAME → 300s (5 min)
2. Wait 24h for cache propagation worldwide
3. Document current DNS records cho rollback
4. Custom domain setup CF Pages:
   - CF Dashboard → Pages → btd-web → Custom domains
   - Add `battudao.com` (will show pending DNS)
   - Add `www.battudao.com`
   - Add `immortality.vn`

### Day 7: DNS cutover (low-traffic window 3am VN)
1. **GO/NO-GO meeting với anh**
2. Update DNS:
   - `battudao.com` → CF Pages (CNAME or apex flattening)
   - `www.battudao.com` → CF Pages
   - `immortality.vn` → CF Pages
3. **DO NOT TOUCH** `api.battudao.com`, `rt.battudao.com` (Phase 1+2)
4. Monitor:
   - Real-time analytics CF Dashboard
   - Firebase Hosting traffic graph (should drop within 5-15 min)
   - Sentry/error tracker if exists
5. If error rate > 0.5% in 15 min → rollback DNS

### Day 8-14: Side-by-side observation
1. Firebase Hosting deployment KEEP ALIVE — anh có thể `firebase deploy --only hosting` if rollback needed
2. Daily check:
   - CF Pages analytics
   - Lighthouse drift
   - FCM delivery rate
   - User reports (if any)
3. Day 14: GO/NO-GO retire Firebase Hosting → Phase 6

## Todo List

- [ ] DNS provider confirmed
- [ ] DNS TTL lowered to 300s (24h before cutover)
- [ ] CF Pages project created + first build success
- [ ] Env vars set
- [ ] `_headers` file created with full CSP port
- [ ] `_redirects` file (or Pages Function middleware) for crawler routing
- [ ] CSP updated for api.battudao.com + rt.battudao.com
- [ ] Preview deploy functional test passed (all 9 items)
- [ ] Lighthouse parity confirmed
- [ ] Crawler test passes
- [ ] FCM authorized domains updated
- [ ] DNS cutover executed (low traffic window)
- [ ] Real-time monitoring 1h post-cutover
- [ ] 7-day stability verified
- [ ] sw.js bumped v3→v4 + force update tested

## Success Criteria

- [ ] battudao.com fully served từ CF Pages
- [ ] Zero data loss (Firestore reads + writes continue uninterrupted)
- [ ] LCP ≤ Firebase Hosting baseline (or better)
- [ ] Lighthouse score ≥ baseline
- [ ] FCM push delivery rate unchanged
- [ ] Crawler share preview (FB, Twitter, Zalo) renders correct OG image + title
- [ ] No 5xx spike trong 24h post-cutover
- [ ] 7-day stable before retiring Firebase Hosting

## Risk Assessment

| # | Risk | Mitigation |
|---|---|---|
| P3-R1 | DNS cutover misconfig → battudao.com down | TTL 300s prep 24h before, document old records, rollback < 5min |
| P3-R2 | CF Pages build fails (pnpm monorepo edge case) | Test preview deploy 24h before cutover; have manual `firebase deploy` fallback |
| P3-R3 | CSP mismatch breaks Firebase SDK / FCM | Side-by-side preview test on `<preview>.pages.dev` first |
| P3-R4 | SW cache stale → users see broken UI sau cutover | Bump cache name v4, add force-update banner, skipWaiting |
| P3-R5 | FCM domain authorization gap | Add CF Pages domain to Firebase Console BEFORE cutover |
| P3-R6 | `_redirects` UA filter not supported → crawler get SPA shell instead OG | Fallback Pages Function `_middleware.ts` |
| P3-R7 | Mobile cert-pin → won't connect | Verified Phase 2; if pin Firebase cert chain, plan re-cert post-launch |
| P3-R8 | Search engines de-rank during cutover | DNS only, no URL change; 301 unnecessary; sitemap stays |
| P3-R9 | Vercel deployment still configured + auto-deploys → could fight DNS | Pause Vercel project (don't delete yet — Phase 6) |

## Security Considerations

- CSP must include new origins: `api.battudao.com` (HTTPS) + `rt.battudao.com` (WSS)
- HSTS preload remain — confirm CF Pages serves correct header
- TLS: CF Pages issues TLS cert auto (universal SSL)
- Service Worker scope: ensure no path collision với Pages Function `_middleware`
- Firebase Auth: authorized domain list must include `battudao.com` + dev/preview domains

## Next Steps

- **Blocks:** Phase 6 (cleanup) — Firebase Hosting retire after Phase 3 stable 14 ngày
- **Unblocks:** Phase 4 (Notion cron) can deploy regardless
- **Pause Vercel:** Don't auto-deploy to avoid DNS conflict

## Open Questions

1. DNS provider battudao.com — Cloudflare DNS đã? Hay Namecheap/Google/khác?
2. immortality.vn DNS provider — cùng hay khác?
3. Có analytics tracking pixel nào hard-coded Firebase Hosting domain không?
4. CF Pages free tier 500 builds/month — đủ cho dev velocity? (Hiện push ~10-30/tuần)
5. Có cần preview environment riêng (vd: `staging.battudao.com`) sau migrate không?
