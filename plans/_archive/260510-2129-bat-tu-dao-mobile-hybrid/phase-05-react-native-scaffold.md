---
title: Phase 5 · React Native scaffold
status: completed
completedAt: 2026-05-11
commit: 567ff9e
priority: critical
---

# Phase 5: React Native Scaffold

## Overview

Initialize React Native + Expo iOS app. Connect to backend API and realtime layer.

## Key Insights

- Expo for rapid iOS development (no native bridge complexity initially)
- Shared TypeScript types from `@btd/shared`
- Navigation via React Navigation
- API client via Fetch or Axios

## Requirements

- Expo SDK 51+
- React Navigation
- Environment config (API endpoint, Firebase config)
- iOS build pipeline ready

## Related Code Files

Files created:
- `packages/rn/` (Expo workspace)
- `packages/rn/app/` (app structure)
- `packages/rn/screens/` (screen components)
- `app.json` (Expo config)
- `eas.json` (Expo Application Services config)

## Status

✅ Completed. React Native iOS app scaffolded and connected to backend.

## Success Criteria

- [x] Expo initialized
- [x] iOS build working
- [x] Navigation configured
- [x] API client integrated
- [x] Firebase/realtime connected
- [x] Simulators tested

## Next Step

Phase 6: Forum Q&A vertical
