---
title: "Battudao Mobile App — Bootstrap"
description: "Standalone Expo RN chat app for Battudao spiritual community (Discord-style channels). Livestream deferred to v2."
status: pending
priority: P2
effort: 13d
branch: main
tags: [expo, react-native, firebase, webrtc, livestream, chat, battudao]
created: 2026-05-02
---

# Battudao Mobile App — Bootstrap Plan

## Goal

Ship MVP standalone Expo React Native chat app at `apps/immortality-vn/mobile/` for Battudao spiritual society. **MVP scope = Discord-style chat ONLY**: categories + channels + real-time messages + auth. Livestream + reactions DEFERRED to v2. Use own Firebase project `immortalityvn` (same as battudao.com web — mobile + web share users + data). Future: when Fly0 has real users, decide whether to merge auth across projects.

## Scope

- **IN (MVP)**: Auth (email/Google/anon), categories + channels (Discord-style), real-time messages with pagination, basic moderation (report flag, delete-own/admin-any), typing indicator, dark mystical theme.
- **DEFERRED to v2**: livestream host/viewer (WebRTC mesh), reactions/gifts, push notifications.
- **OUT** (YAGNI): voice rooms, 1:1 video calls, DMs, stories, payment, recording, translation, Android-specific tuning beyond basic build.

## Constraints

- Existing Vite web at `immortality-vn/src/` (LIVE at battudao.com) — DO NOT TOUCH.
- Existing Fly0 Expo app at `fly0-app/src/` — reference only, DO NOT TOUCH.
- New shared module at `immortality-vn/shared/` — TS, framework-agnostic, used by both Vite web (future) + Expo mobile (now).
- Firebase project `immortalityvn` (own — same as battudao.com web). New collections prefixed `battudao_*`. Existing web collections untouched. NO cross-project sharing with Fly0 for MVP.

## Phases

| #  | Phase | Status | Effort |
|----|-------|--------|--------|
| 01 | Scaffold Expo app + navigation (2 tabs) | pending | 1.5d |
| 02 | Shared module (types/firebase/helpers) | pending | 1.5d |
| 03 | Firebase Auth + Firestore rules | pending | 2d |
| 04 | Chat with channels (categories + channels + messages) | pending | 4d |
| 05 | ~~Livestream host~~ | **DEFERRED v2** | — |
| 06 | ~~Livestream viewer + reactions~~ | **DEFERRED v2** | — |
| 07 | Design system + UI primitives | pending | 2d |
| 08 | Test + EAS Build + deploy | pending | 2d |

## Key Dependencies (npm) — chat MVP only

- `expo@~54`, `@react-navigation/native@^7` + `@react-navigation/bottom-tabs` + `@react-navigation/native-stack`
- `firebase@^12` (JS SDK, matches existing battudao.com web)
- `@react-native-async-storage/async-storage` (auth persistence)
- `expo-haptics`, `@expo/vector-icons`
- `expo-auth-session` + `expo-crypto` (Google OAuth)
- (Deferred v2): `react-native-webrtc`, `expo-dev-client`, `expo-camera`, `expo-av`, `react-native-reanimated`

## Top Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Firebase rules regression breaks battudao.com web | High | Append-only rule edits; backup `firestore.rules.bak`; smoke-test web auth after rules deploy |
| Spam from anonymous users in chat | Med | Client rate-limit (1 msg/2s) for MVP; server enforcement v2 |
| Channels/categories CRUD requires admin tooling | Low | MVP: seed via Firebase Console; v2: build admin tab |
| Apple/Play review reject UGC chat without report flow | Med | Build report flag + EULA + privacy policy in P08 before submit |

## Backwards Compatibility

- No DB migrations on existing collections.
- New collections additive only.
- Firestore rules: append `match /battudao_*/{...}` blocks; do not modify existing rules.
- Vite web continues to deploy from `immortality-vn/src/` unchanged. Future: it can adopt `shared/` incrementally.

## Rollback Strategy

- Per phase: each phase lives behind file boundaries (mobile/ + shared/). Revert via `git revert` of phase commits.
- Rules deploy: keep `firestore.rules.bak` snapshot before P03; rollback = `firebase deploy --only firestore:rules` with backup file.
- Auth/data: no destructive ops. Worst case = delete `battudao_*` collections (no impact on Fly0).

## File Ownership (parallel-safe)

- Phase 01, 07: `mobile/app.json`, `mobile/src/navigation/`, `mobile/src/theme/`
- Phase 02: `shared/**` only
- Phase 03: `mobile/src/screens/auth/`, `mobile/src/services/auth.ts`, `firestore.rules` (append-only)
- Phase 04: `mobile/src/screens/channels/`, `mobile/src/components/chat/`, `shared/chat/`
- Phase 08: `mobile/eas.json`, `mobile/.env.example`

## Success Criteria

1. Real device (iOS) installs Expo Go (or dev build), logs in with email/Google/anon, sees channels grouped by category.
2. Tap channel → real-time messages between 2 devices in <1s.
3. Long-press own message → delete works; long-press other → report works.
4. Firestore rules deployed; battudao.com web auth still works post-deploy (smoke test).
5. EAS Build produces signed iOS + Android binaries; TestFlight + Play Console internal track receive uploads.

## Unresolved Questions

- Push notifications (FCM/APNs) — defer to v2? Current plan: NO push in MVP.
- Bilingual (vi/en) toggle — defer? Current plan: vi-only strings in MVP, i18n scaffolded but unused.
- Moderation/reporting flow — admin tools needed? Current plan: simple `reported: true` flag on message, no admin UI in MVP.
