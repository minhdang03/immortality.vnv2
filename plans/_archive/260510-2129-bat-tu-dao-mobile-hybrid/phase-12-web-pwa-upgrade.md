---
title: Phase 12 · Web PWA upgrade
status: completed
completedAt: 2026-05-11
commit: TBD
priority: medium
---

# Phase 12: Web PWA Upgrade

## Overview

Convert web SPA to Progressive Web App (PWA) with offline support, installability, and native-like experience.

## Key Insights

- Service Worker v2 (manifest, install prompts)
- Offline-first with IndexedDB sync
- App shortcut manifests
- Push notifications via Firebase Cloud Messaging
- Store submission checklist deferred (see decisions.md)

## Requirements

- PWA manifest (`manifest.json`)
- Service Worker enhancements
- Install-time prompts
- Offline data sync
- Push notification setup

## Related Code Files

Files modified:
- `packages/web/public/manifest.json` (PWA manifest)
- `packages/web/public/sw.js` (v2 service worker)
- `packages/web/src/main.jsx` (install prompt logic)

Files created:
- `packages/web/src/services/offline-sync.ts` (offline queue)
- `packages/web/src/services/push-notifications.ts` (FCM bridge)
- `docs/store-submit-checklist.md` (iOS App Store + Play Store prep)

## Status

✅ Completed. Web PWA functional with offline support and installability.

**DONE_WITH_CONCERNS:** App Store/Play Store submission deferred. Checklist available at `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/docs/store-submit-checklist.md`. See `decisions.md`.

## Success Criteria

- [x] PWA manifest deployed
- [x] Service Worker v2 working
- [x] Install prompt functional
- [x] Offline content accessible
- [x] Push notifications enabled
- [x] Store submission checklist created
- [x] Lighthouse audit passing

## Deferred Items

- App Store submission (awaiting marketing assets + privacy policy review)
- Play Store submission (awaiting compliance review)
- Web hosting migration (Firebase → Vercel, pending DNS cutover)

## Next Step

End of core development. Proceed to production hardening, monitoring, and store submissions (Phase 12 continuations).
