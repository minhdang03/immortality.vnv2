---
title: FE+BE Redesign — Cloudflare-First Hybrid
status: pending
created: 2026-05-15
target_completion: 2026-06-26
owner: Đăng
branch: claude/immortality-mobile-hybrid
brainstorm_report: ../reports/brainstorm-260515-2130-febe-redesign.md
---

# FE+BE Redesign — Cloudflare-First Hybrid

## Mục tiêu

Dọn dẹp kiến trúc lởm do làm chắp vá 3 tháng qua. Consolidate 3 backend (Firebase Functions + Vercel `/api` + Cloudflare Workers scaffold) → 1 stack canonical. Chuẩn bị mobile app launch với 1 API endpoint stable.

**KHÔNG migrate Firebase Auth + Firestore.** GIỮ vì FE đã wire 19 hooks + mobile RN native SDK realtime tốt nhất ở free tier.

## Stack đích

- **Web hosting:** Cloudflare Pages (drop Firebase Hosting + Vercel)
- **API:** Cloudflare Workers (Hono) tại `api.battudao.com`
- **Realtime:** Durable Objects tại `rt.battudao.com`
- **Cron + AI:** workers/notion daily sync
- **Auth + DB:** Firebase Auth + Firestore (GIỮ, scope lại 3 services)
- **Media:** Cloudflare R2
- **Cache:** Cloudflare KV (JWKS + OG cache + rate-limit)

## Phases

| # | Phase | Tuần | Status |
|---|---|---|---|
| 00 | [Vì sao redesign — for non-tech](phase-00-why-redesign-for-non-tech.md) | — | Read first |
| 01 | [Foundation: workers/api + OG consolidation](phase-01-foundation-api-og-consolidation.md) | 1-2 | pending |
| 02 | [Mobile API + Realtime (Durable Objects)](phase-02-mobile-api-realtime.md) | 2-3 | pending |
| 03 | [Web hosting → Cloudflare Pages](phase-03-web-hosting-migration.md) | 3-4 | pending |
| 04 | [Notion sync + Claude AI cron](phase-04-notion-ai-cron.md) | 4-5 | pending |
| 05 | [Database hygiene](phase-05-database-hygiene.md) | 5 | pending |
| 06 | [Cleanup + security hardening](phase-06-cleanup-security-hardening.md) | 5-6 | pending |

## Key dependencies

- Phase 1 phải xong + verify trước Phase 2 (mobile cần API ổn định)
- Phase 3 cutover DNS phải sau Phase 1+2 stable 7 ngày
- Phase 6 chỉ chạy sau Phase 1-5 verified — KHÔNG retire infra cũ sớm
- Phase 5 có thể chạy song song Phase 1-4 (DB không touch compute)

## Success criteria (overall)

- [ ] 1 backend canonical (Cloudflare Workers), retire Firebase Functions + Vercel `/api`
- [ ] Mobile RN có 1 API endpoint `api.battudao.com` stable
- [ ] OG render 1 implementation, 1 deploy, 1 log stream
- [ ] Admin auth dùng custom claim, không phải `auth != null`
- [ ] Firestore rules + indexes auto-deploy qua CI
- [ ] Daily backup Firestore → R2
- [ ] Total monthly cost: $0-5/mo (current ~$0)
- [ ] Vendor dashboards: 2 (Firebase + Cloudflare), drop Vercel

## Open questions (cần anh Đăng confirm trước Phase 3)

1. DNS provider của battudao.com hiện tại?
2. Mobile RN có cert-pin Firebase Hosting cert không?
3. Admin UID anh để grant custom claim trước khi siết Firestore rules?
4. AI Hỏi Ngược paid tier billing đang chạy đâu (SePay/Stripe)?
5. Có Sentry/Datadog gắn vào Vercel/Firebase Functions hiện tại không?
6. Comments canonical schema: nested under articles hay top-level?
