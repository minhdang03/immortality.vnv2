---
title: Locked Decisions During Execution
---

# Locked Decisions During Execution

## iOS IAP (In-App Purchase) — Phase 8

**Decision:** Defer StoreKit IAP implementation via feature flag.

**Context:** Phase 8 (Self-Inquiry vertical) initially scoped StoreKit 2 for premium subscriptions. Time constraints + complexity of sandbox testing pushed deferral.

**Implementation:**
- Feature flag: `USE_STORE_KIT_IAP` (default: `false`)
- Stub endpoint: `packages/api/src/routes/iap-stub.ts` (returns mock responses)
- Firestore: `user_subscriptions` collection prepared, no writes until flag enabled
- RN: `packages/rn/screens/SubscriptionScreen.tsx` checks flag, renders placeholder if disabled

**Action Required Before Store Submit:**
1. Enable `USE_STORE_KIT_IAP=true` in production env
2. Test sandbox transactions in Xcode
3. Configure StoreKit 2 signing certificates (App Store Connect)
4. Update privacy policy (data collection clause for subscription IDs)
5. Complete IAP testing checklist at `docs/store-submit-checklist.md`

**Timeline:** Defer to Phase 13 or post-launch optimization.

---

## Video Provider Abstraction — Phase 10

**Decision:** Defer concrete video provider selection via abstraction layer.

**Context:** Phase 10 (Trao Đổi NLTT) required video for mentorship sessions. Three candidates exist:
1. YouTube Live (cheapest, limited interactivity)
2. Zoom (enterprise-grade, complex SDK)
3. WebRTC (native, most complex, best UX)

Abstraction layer allows switching without code churn.

**Implementation:**
- Abstraction: `packages/api/src/video/video-provider-abstract.ts`
- Stubs:
  - `YouTubeProvider` (iframe embed, no code changes)
  - `ZoomProvider` (Zoom SDK wrapper, requires credentials)
  - `WebRTCProvider` (TURN server, signaling server)
- Env var: `VIDEO_PROVIDER=youtube|zoom|webrtc` (default: `youtube`)
- RN: `packages/rn/screens/VideoSessionScreen.tsx` detects provider, renders appropriate component

**Action Required Before Mentorship Launch:**
1. Evaluate provider based on mentor + user feedback
2. Implement chosen provider's full SDK
3. Test video quality + latency
4. Configure turn servers (if WebRTC)
5. Update privacy policy (video recording + storage)
6. Update terms of service (session recording disclosure)

**Timeline:** Defer to mentorship beta launch (Phase 13).

---

## App Store & Play Store Submission — Phase 12

**Decision:** Defer store submission. Checklist prepared at `docs/store-submit-checklist.md`.

**Context:** Phase 12 completed PWA + iOS/Android build setup. Submission requires:
- Marketing assets (screenshots, app preview videos, app description)
- Privacy policy + terms of service review
- TestFlight beta testing (iOS)
- Internal testing (Android)
- Store compliance audit (age rating, payment methods, etc.)

**Implementation:**
- Checklist: `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/docs/store-submit-checklist.md`
- Build artifacts: `packages/rn/build/` (EAS Builds)
- Credentials: stored in CI/CD secrets (Apple Developer, Google Play)
- Staging: testflight-build and google-play-internal-testing already configured

**Action Required Before Production Launch:**
1. Complete checklist items in priority order
2. Upload marketing assets (500 char description, 20+ screenshots)
3. Privacy policy review (GDPR, CCPA compliance)
4. TestFlight submission (v1.0.0 candidate build)
5. Internal testing on Play Console
6. Submit to App Store + Play Store review queue
7. Monitor review feedback, iterate if rejected

**Timeline:** Defer to Phase 13 (store submission sprint, ~1-2 weeks per store).

---

## Architecture Decisions Locked

| Decision | Rationale | Locked |
|----------|-----------|--------|
| Monorepo (pnpm workspaces) | Code reuse (types, components), single CI/CD | Phase 1 |
| CF Workers + Hono | Serverless cost, global edge, TypeScript | Phase 2 |
| DO WebSocket | Stateful, persistent, low-latency broadcast | Phase 3 |
| Notion sync | Content source, no CMS infrastructure | Phase 4 |
| Expo (not bare RN) | Faster development, EAS Build, OTA updates | Phase 5 |
| Firestore (not Postgres) | Real-time subscriptions, Firebase Auth integration | Phases 6–12 |
| Claude API (not local LLM) | Quality, no inference infra, goclaw integration | Phases 4, 6–8 |

---

## Risk Register (Resolved During Execution)

| Risk | Mitigation | Status |
|------|-----------|--------|
| Monorepo complexity | Peer support + shared CI/CD | ✅ Resolved |
| CF Workers cold starts | Scheduled warmup job | ✅ Deferred to Phase 13 |
| DO cost overruns | Usage monitoring + alerts | ✅ In place |
| RN build failures | EAS managed builds, Xcode locally | ✅ Resolved |
| Firestore security rule bugs | JSON schema validation + lint | ✅ Resolved |
| Claude API rate limits | Rate limiter middleware, fallback prompt | ✅ In place |

---

## Open Questions for User (6 Total)

1. **Store submission timeline:** Target launch date (Q2 2026 or Q3 2026)? Affects priority of store submission sprint.

2. **Mentor payment model:** Stripe or PayPal for mentorship bookings? Affects Phase 10 payment integration (deferred).

3. **Video provider preference:** YouTube, Zoom, or WebRTC? Concrete implementation blocked on this choice (Phase 10 deferred).

4. **Admin moderation SLA:** How quickly should user-flagged forum posts be reviewed (4h, 24h, 1 week)? Affects forum automation (Phase 6).

5. **Analytics events:** Which user actions should trigger analytics events (every screen view, every button click, or only purchase/conversion events)? Affects Firebase Analytics setup (all phases).

6. **Backup strategy:** What's the RTO/RPO for Firestore data (daily snapshots, hourly WAL, or real-time replica)? Affects disaster recovery plan (post-Phase 12).

---

## Production Blockers (4 Total)

1. **Firestore security rules missing:** `firestore.rules` not deployed to production. Must copy-paste rules manually to Firebase Console or enable CLI auto-deploy.
   - **Owner:** User (requires Firebase Console access)
   - **Unblock:** Copy `firestore.rules` to Console Rules editor, publish
   - **Impact:** Without rules, data is readable/writable to any authenticated user

2. **Admin SDK key exposure:** Firebase Admin SDK key stored in source tree (`.gitignore`'d but not ideal). Should move to `scripts/` or Cloud Key Management Service.
   - **Owner:** User (infrastructure decision)
   - **Unblock:** Move key to env var or KMS, rotate key in Firebase Console
   - **Impact:** Security best practice; low risk if key is truly gitignored

3. **Environment variables not configured:** `VITE_FIREBASE_API_KEY`, `VIDEO_PROVIDER`, etc. not set in CI/CD. Builds may fail if .env is missing.
   - **Owner:** User (CI/CD setup)
   - **Unblock:** Configure secrets in Firebase CI/CD, EAS Secrets (for RN builds)
   - **Impact:** Build failures, deploy failures

4. **iOS provisioning profile expired:** Xcode certificate/provisioning profile may expire before store submission. Must renew in Apple Developer account.
   - **Owner:** User (Apple Developer access required)
   - **Unblock:** Renew certificate + provisioning profile in Apple Developer Console
   - **Impact:** iOS builds fail, TestFlight submission blocked

---

## Recommendations for Next Session

1. **Immediate (before next development):**
   - Resolve production blockers (Firestore rules, env vars, certificates)
   - Answer 6 open questions (store timeline, payment model, video provider, etc.)
   - Review store submission checklist

2. **Phase 13 scope (post-core development):**
   - Store submission sprint (iOS App Store + Play Store)
   - StoreKit IAP implementation + sandbox testing
   - Video provider concrete implementation (based on user choice)
   - Monitoring + analytics dashboards setup
   - Performance optimization (Lighthouse audit, RN bundle size)

3. **Long-term (Phase 14+):**
   - Community features (user profiles, follow/block, direct messaging)
   - Content moderation automation (spam detection, inappropriate content filtering)
   - Mentor matching algorithm
   - Advanced analytics + business intelligence dashboards
