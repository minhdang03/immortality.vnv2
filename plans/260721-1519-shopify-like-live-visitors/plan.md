---
title: "Shopify-like live visitors dashboard"
description: "Add a public, privacy-preserving live visitor view at /live using ephemeral Supabase Presence."
status: completed
priority: P2
effort: 1d
branch: main
tags: [feature, frontend, analytics, realtime, privacy]
blockedBy: []
blocks: []
created: 2026-07-21
---

# Shopify-like Live Visitors Dashboard

## Overview

Ship `/live` as a public bilingual dashboard: active count, approximate globe, current-page breakdown, and recent join activity. Keep MVP ephemeral: no visitor table, IP, city, account ID, or durable event history.

## Reuse and MVP semantics

- Reuse `apps/web/src/lib/supabase-client.js`, the SPA registry in `config/pages.js`, global routing/SEO in `App.jsx`, and the tab-scoped anonymous UUID from `lib/reading-session.js`.
- Reuse Supabase Realtime Presence, not `reading_events`: reading events flush on exit and only cover articles, so they cannot represent “now.”
- Do not reuse `profiles.last_seen_at`: authenticated NODIE members only, persistent, and wrong privacy/product meaning. GA4 page views also are not a client-readable live source.
- One public channel: `site-live-visitors:v1`. A visible public tab tracks one presence keyed by its session UUID. `/live` and `/admin` subscribe but never track themselves.
- “Live” = currently connected, visible browser tabs. Count sessions/tabs, not deduplicated people. Route changes update presence immediately; disconnect/stale cleanup follows Presence sync. Label this caveat in UI.
- `/api/live-location` reads Vercel country/latitude/longitude headers, returns country plus coordinates rounded to 10° buckets, and returns `unknown` locally or when headers are absent. Never return/log IP or city.

## Exact change set

| Action | File | Change |
|---|---|---|
| Create | `api/live-location.js` | Same-origin, `GET`-only, `Cache-Control: no-store` coarse-geolocation response; strict numeric/header validation. |
| Create | `apps/web/src/hooks/use-live-visitors.js` | Fetch coarse location once, join Presence, track only eligible visible routes, expose normalized sync state, reconnect/error status. |
| Create | `apps/web/src/lib/live-visitors.js` | Pure normalization, aggregation, path-label, and globe-projection helpers. |
| Create | `apps/web/src/pages/core/live-visitors-page.jsx` | Public VI/EN count, connection state, empty state, page/country lists, recent activity. |
| Create | `apps/web/src/components/live/live-visitor-globe.jsx` | Accessible approximate SVG globe; aggregate overlapping dots; text fallback. |
| Create | `apps/web/src/styles/pages/live-visitors.css` | Responsive sacred-editorial styling, dark mode, reduced motion, focus and small-screen states. |
| Create | `tests/live-visitors.test.mjs` | Node tests for geo quantization, malformed presence, aggregation, projection, and excluded routes. |
| Modify | `apps/web/src/App.jsx` | Lazy-load `/live`, initialize the single presence hook, pass snapshot to page, exclude private/live routes. |
| Modify | `apps/web/src/config/pages.js` | Register `live` title/description/icon with no default nav placement. |
| Modify | `apps/web/src/hooks/useSEO.js` | Use registry metadata for `/live` canonical, OG, Twitter, and page title. |
| Modify | `apps/web/src/lib/reading-session.js` | Generalize comments/name contract as shared tab session ID while preserving existing export. |
| Modify | `apps/web/src/pages/info/PrivacyPage.jsx` | Disclose ephemeral anonymous presence and coarse country/10° location; update date. |
| Modify | `package.json` | Add targeted Node test script; no new runtime/test dependency. |

## Implementation order

- [x] Add pure helpers and location endpoint. Reject non-GET; clamp country to ISO-like two-letter code; quantize and range-check coordinates; never echo request headers.
- [x] Add one lifecycle-safe Presence hook. Track after `SUBSCRIBED`; update path on SPA navigation; untrack on hidden/unmount; resync on visible/reconnect; ignore malformed/untrusted peer payloads.
- [x] Add `/live` UI and metadata/privacy copy. Render aggregate-only information—never presence keys/session IDs—and cap recent rows/dots to protect rendering.
- [x] Add tests and verify build/browser behavior before deployment.

## Security, privacy, and reliability gates

- Presence payload allowlist: normalized pathname (no query/hash), language, coarse country/coordinates, joined timestamp. Treat every peer payload as spoofable; dashboard is informational, never billing/security evidence.
- Public channel exposes only coarse ephemeral fields. No persistence migration, Realtime database publication, service-role key, user profile, fingerprint, referrer, UA, or cookies.
- Cap path length and aggregate cardinality; HTML renders through React only. Show reconnecting/stale state rather than retaining a misleading count.
- Update privacy text before production enablement. If Supabase project disables public Presence channels, stop and configure the channel deliberately; do not weaken database RLS.

## Verification and deployment

- Run `pnpm test:live` and `pnpm --filter @btd/web build`.
- Browser test: two normal tabs on different routes + one `/live` tab; route update, background/untrack, close/disconnect, reconnect, missing geo headers, reduced motion, mobile layout, VI/EN, keyboard/screen reader.
- Confirm Supabase Realtime is enabled and anonymous clients can join only the intended public channel; verify payload contains no forbidden fields in DevTools.
- Preview deploy first; verify Vercel geo headers and `no-store` response in preview/production. Then deploy web via `main`/Vercel. No SQL migration or Worker deploy.
- Monitor Realtime connection/quota and endpoint errors. Rollback is the web commit; channel state disappears automatically when clients disconnect.

## Success criteria

- [x] `/live` shows connected visible-tab count and updates on route changes and disconnect without refresh.
- [x] Globe/page breakdown degrades cleanly for unknown location and zero visitors.
- [x] No visitor record survives disconnect; no IP/city/session ID appears in UI, analytics tables, logs, or API response.
- [x] Tests pass (7/7), production build passes, two-tab route/close behavior works, mobile has no overflow, and code-review findings are resolved.

## Unresolved questions

- None for MVP. Nav promotion, durable trends, city detail, referrals, and bot-resistant counting explicitly deferred.
