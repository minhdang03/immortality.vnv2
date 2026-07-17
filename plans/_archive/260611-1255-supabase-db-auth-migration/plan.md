---
title: "Supabase Migration — DB + Auth + Agent Gateway + Reading Analytics"
description: "Re-platform Bất Tử Đạo off Firebase (Firestore + Auth) onto Supabase Postgres + Supabase Auth; web + mobile cut over together; goclaw agent switches to btd_ API keys; add per-paragraph reading analytics + relational categories."
status: pending
priority: P1
effort: 12-16d
created: 2026-06-11
owner: Đăng
branch: claude/immortality-mobile-hybrid
brainstorm_report: ../reports/brainstorm-260611-1244-supabase-db-auth-migration-reading-analytics.md
tags: [supabase, postgres, supabase-auth, migration, pgvector, cloudflare-workers, reading-analytics, categories]
blocks: ["root:260621-1212-tiktok-to-battudao-daily-content-pipeline"]
---

> **Blocks** the TikTok→battudao dashboard pipeline (workspace-root plan `260621-1212-tiktok-to-battudao-daily-content-pipeline`). Đăng 2026-06-24: ship THIS (B) first, then that (A). Integration point = the publish leg: the Notion→DB sync worker (`workers/notion/`) must repoint Firestore→Supabase. **Verify phase-04/05 cover repointing `workers/notion/`; if not, add it** — A's publish depends on it.

# Supabase Migration — DB + Auth + Agent Gateway + Reading Analytics

Re-platform the data + identity layer off Firebase onto Supabase. **NOT a UI rewrite** — components, i18n, share, OG, routing stay. The web data hooks (~20) + mobile RN data/auth get rewired to `supabase-js`; agent writes go through the Worker (`api.battudao.com`) using Supabase `service_role`. Firestore stays LIVE in prod throughout; **single cutover (web + mobile together) in phase-08**.

> Supersedes febe-redesign's "do NOT migrate Firebase" decision (locked by Đăng 2026-06-11). SP1 (260610) Firestore+D1+Vectorize design folds into Supabase (1 Postgres replaces 3 stores) — SP1 to be re-scoped separately.

## Stack target
```
Web (Vite/React) ─┐
Mobile (Expo RN) ─┼─► Supabase Postgres + Supabase Auth + pgvector/tsvector
goclaw Agent ─────┘     ▲ writes via Worker api.battudao.com (btd_ key → service_role)
GA4 ◄── macro events (traffic, page views)   ·   Supabase reading_events ◄── micro (per-paragraph)
Cloudflare R2 (media, keep)   ·   Durable Objects (realtime chat, keep — out of scope)
```

## Phases

| # | Phase | Status | Ships |
|---|-------|--------|-------|
| 01 | [Supabase project + schema + RLS + FTS/pgvector](phase-01-supabase-schema-rls.md) | ✅ done | Project provisioned (dzctvmrlsxwkcuidsqzk, SG), 14 tables, RLS 14/14, pgvector+tsvector VI live — pushed+verified on cloud 2026-07-09 |
| 02 | [Data migration scripts (Firestore → Postgres)](phase-02-data-migration-scripts.md) | 🟡 content done | 71 content docs migrated+verified on cloud (ids/slugs preserved, idempotent); PII/config/delta remain (admin key) |
| 03 | [Auth migration (Supabase Auth + roles via RLS)](phase-03-auth-migration.md) | ✅ done | Admin login on Supabase Auth, role claims, user-migration strategy |
| 04 | [Web data-layer rewrite (~20 hooks → supabase-js)](phase-04-web-data-layer-rewrite.md) | ✅ done | All hooks on supabase-js; component API unchanged; web runs on Supabase behind flag |
| 05 | [Agent gateway (Worker service_role) + goclaw edit](phase-05-agent-gateway-goclaw.md) | ✅ done | Worker validates btd_ key → Supabase write; goclaw skills cut to btd_ + api.battudao.com |
| 06 | [Reading analytics + admin content-analytics dashboard](phase-06-reading-analytics-dashboard.md) | ✅ done | IntersectionObserver → reading_events; admin drop-off / completion / median-read dashboard |
| 07 | [Category system (relational, parent-child) + migrate topics](phase-07-category-system.md) | ✅ done | categories table, admin CRUD, browse-by-category UI; topics → categories migrated |
| 08 | [Mobile rewrite + cutover + verification + rollback](phase-08-mobile-cutover-verification.md) | ⏸ human cutover | Mobile RN on supabase-js; single web+mobile cutover; parity checks; Firestore reads retired |

## Key dependencies
- 01 blocks 02, 03, 04, 05 (schema is the foundation).
- 02 blocks 04 (hooks need real data), 07 (topics→categories needs migrated content), 08.
- 03 blocks 04 (admin writes need auth), 05 (human plane), 08.
- 04 blocks 06, 07 (analytics + category UI build on the supabase data layer), 08.
- 05 after 01 + 03 (needs schema + role model; service_role bypasses RLS).
- 08 last — needs ALL phases (mobile rewrite folded here; single cutover).
- Firestore stays live until phase-08. No big-bang mid-stream.

## Success criteria (overall)
- [ ] Web + mobile both read/write Supabase; zero Firestore/Firebase-Auth reads in prod after cutover.
- [ ] All old IDs + slugs resolve (shared links + SEO unbroken) — verified by link-parity check.
- [ ] goclaw writes content via btd_ key through Worker; service_role never leaves Worker secret.
- [ ] Admin content-analytics dashboard shows per-paragraph drop-off, completion %, median read time.
- [ ] Categories are relational parent-child with admin CRUD + browse UI; topics migrated.
- [ ] Rollback path documented + tested (re-point flag to Firestore within 1 deploy).
- [ ] Supabase Cloud free tier; R2 + Durable Objects untouched; GA4 untouched.

## Decisions locked (Đăng, 2026-06-11)
DB+Auth→Supabase; GA4 stays. goclaw→btd_ keys (2 auth planes; service_role in Worker; EDIT Claw/goclaw). Web+mobile cut over TOGETHER. Keep+map old IDs/slugs. Reading analytics per-paragraph. Relational categories replace topics. Astro/SSR render fix = OUT OF SCOPE (follow-up). Supabase Cloud free tier. Realtime chat stays on Durable Objects.

## Decision added (Đăng, 2026-07-07) — merge articles + khaitri
Firestore `articles` and `khaitri` collections merge into the single `content` table (phase-01 already unifies via `type` column — this confirms it as an explicit goal, not just schema convenience). Rules:
- One admin management surface for both types (no separate articles/khaitri editors long-term).
- `/articles` and `/khaitri` routes STAY as type-filtered views — user-facing split unchanged, URLs + SEO preserved (khaitri slug `<order>-<title>` keeps resolving via `slug_redirects`).
- `khaitri` keeps `order` (numbered series, prev/next by order); `article` keeps `date` (feed) — ordering field per type, same table.
- Phase-02 migration imports both collections into `content` with correct `type`; phase-04 may keep `useArticles`/`useKhaiTri` as thin type-filtered facades over one content hook (return shapes unchanged).
- Do NOT merge on current Firestore before cutover — not worth the ogRenderer/mobile/SEO churn (assessed 2026-07-07).

## Open questions
Resolved from brainstorm §10: Q1 keep+map IDs/slugs (yes); Q2 goclaw — edit `Claw/goclaw` skills repo (confirmed); Q3 mobile cuts over WITH web (confirmed); Q5 Supabase Cloud free tier (confirmed); Q6 realtime stays on DO (confirmed). Still open: Q4 — within this plan the order is DB+Auth FIRST, analytics/categories AFTER (encoded in deps). See each phase's "Next Steps" + the consolidated list at bottom of phase-08.

## Follow-up (NOT in this plan)
- Astro/SSR re-platform to fix SPA white-flash + deep-link SEO (separate SP2 plan). Supabase does not fix this.
- SP1 (260610) re-scope around Supabase (drop D1/Vectorize/cron reconcile).
