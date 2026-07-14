# Bất Tử Đạo Development Roadmap

## Phase 1: Hybrid Mobile Bootstrap — COMPLETE (2026-05-11)

**Status:** ✅ DONE  
**Duration:** 1 day (12 parallel agents)  
**Commits:** 260510-2129 session (12 phases)

### Deliverables
- **Monorepo restructure:** pnpm workspaces (apps/web, apps/mobile, packages/, workers/)
- **Mobile app:** Expo SDK 54, 12 screens, WebView content reuse
- **Workers API:** Hono REST endpoints (profiles, Q&A, votes, comments)
- **Realtime chat:** Durable Objects WebSocket (ephemeral, slow-mode)
- **Notion sync:** Daily cron + Claude AI hỏi ngược
- **Web PWA:** sw.js v3, manifest.json, FCM web push
- **Tests:** 150+ passing across all workspaces
- **Shared packages:** firebase-config, ui-tokens, shared utils

### Phase breakdown (12 completed phases)
1. Monorepo restructure → pnpm workspaces
2. Web PWA upgrade (sw.js v3, manifest, FCM)
3. Mobile App Hub screen
4. Mobile Tự Khai Trí browse + parallel UI
5. Mobile AI Q&A (Claude integration)
6. Mobile Đối thoại sâu (thread viewer)
7. Mobile Forum + Q&A (vote system)
8. Mobile Bay Cùng (profile screen)
9. Mobile Phá Nô Lệ + Trao Đổi NLTT
10. Workers REST API (Hono + auth)
11. Workers Realtime (Durable Objects WebSocket)
12. Workers Notion sync + Claude AI

---

## Phase 2: Production Deploy Blockers — IN PLANNING

**Status:** 🔄 NEXT  
**Estimated:** 2026-05-15 to 2026-05-25  
**Goal:** Unblock Apple App Store + Google Play submission

### Critical blockers to resolve
1. **Cloudflare deployment** — Verify CF dashboard (wrangler.toml auth, R2 bucket setup, env secrets)
2. **Apple Developer Program** — Team ID, certificates, TestFlight flow validation
3. **Google Play Console** — APK signing setup, internal testing track
4. **SePay integration** — Payment endpoint for subscriptions (fallback if no IAP)
5. **Notion API credentials** — Store in Cloudflare env, test daily sync
6. **FCM web push** — Apple APNs certificate upload to Firebase
7. **iOS app provisioning** — EAS build profile, signing identities
8. **Android app signing** — Play Console upload key configuration
9. **PWA icons** — Replace stub with actual brand assets
10. **Video hosting provider** — Decide on provider (YouTube, Vimeo, custom CDN) for audio/video content

### Success criteria
- [ ] Firebase Functions deploy succeeds
- [ ] Cloudflare Workers API responds with valid auth
- [ ] Durable Objects WebSocket connects from mobile
- [ ] Apple TestFlight build accepts submission
- [ ] Google Play Console accepts APK upload
- [ ] Web PWA installs on mobile browser
- [ ] Notion sync completes 1 cycle without errors
- [ ] SePay payment endpoint returns 200
- [ ] FCM push notification received on web + mobile

---

## Phase 3: Beta Testing & Iteration — DEFERRED

**Status:** ⏸️ BLOCKED BY Phase 2  
**Estimated:** 2026-05-26 to 2026-06-15

### Focus areas
- Closed beta (50 users): iOS TestFlight + Android internal testing
- Gathering feedback on UX (especially WebView content loading)
- Performance profiling on low-end devices
- Analytics instrumentation (GA4 events, crash reporting)
- Bug fixes from beta feedback

### Success criteria
- 20+ beta testers active on iOS + Android
- <2sec page load time (p95)
- <1% crash rate on beta builds
- Analytics events flowing to BigQuery

---

## Phase 4: Production Release — DEFERRED

**Status:** ⏸️ BLOCKED BY Phase 3  
**Estimated:** 2026-06-16+

### App Store submission
- Apple App Store review (typically 1-3 days)
- Google Play Store review (typically <1 day)
- Marketing launch (social, email, in-app banners)

### Post-launch monitoring
- Crash reporting (Sentry integration)
- Performance monitoring (real user monitoring)
- User feedback collection (in-app rating flow)

---

## Phase 5: Paid Features — DEFERRED

**Status:** ⏸️ NOT STARTED  
**Estimated:** 2026-07-01+

### Features
- AI Hỏi Ngược: 99K/tháng subscription
- 1-on-1 coaching: 2-5tr pricing (deferred indefinitely)
- Payment processing: SePay → Firestore `donations` write

### Requirements
- Subscription state in Firestore (`user.subscription`)
- Entitlement checking before paid features render
- Renewal reminders (email, push notification)
- Churn analysis (GA4 funnel)

---

## Metrics & Success

| Metric | Target | Status |
|---|---|---|
| **App Store approval** | <7 days | Pending Phase 2 |
| **Build pipeline** | <5min CI/CD | ✅ EAS Build working |
| **Core UX performance** | <2s p95 load | TBD beta |
| **API response time** | <200ms | TBD load test |
| **WebSocket uptime** | 99.5% (Durable Objects) | TBD production |
| **Crash-free users** | 99.5% | TBD beta |

---

## Dependencies

- **External:** Apple Developer Program (annual fee), Google Play Console ($25 one-time), Cloudflare Workers paid tier (if realtime chat > free quota)
- **Internal:** Notion integration complete (Phase 1 ✅), Firebase Firestore security rules finalized, SePay merchant account setup

---

## Notes

- **Video provider decision blocker:** Needed before Phase 2 can unblock app store submission
- **IAP deferral:** Using SePay web payment flow instead of Apple IAP/Google Billing
- **PWA icons:** Placeholder paths in manifest.json must be replaced before release
- **Durable Objects pricing:** Monitor usage costs once realtime chat goes live; may need rate-limiting adjustment
