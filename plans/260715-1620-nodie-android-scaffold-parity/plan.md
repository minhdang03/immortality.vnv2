---
title: "NODIE Android scaffold + parity docs"
description: "Scaffold apps/nodie-android (Kotlin/Compose) + docs/nodie/parity.md minimal. UI mock only — no API wire. Parallel track with iOS Q&A/chat wire (parent plan)."
status: pending
priority: P2
effort: 6h
branch: "claude/immortality-mobile-hybrid"
tags: [nodie, android, compose, parity, solo]
blockedBy: []
blocks: []
related: [260714-2147-btd-community-app-swift-zalo-style]
created: "2026-07-15T06:20:32.130Z"
createdBy: "ck:plan"
source: skill
brainstorm: plans/reports/brainstorm-260715-1619-nodie-docs-parity.md
---

# NODIE Android scaffold + parity docs

## Overview

Solo dual-platform setup cho NODIE — **không** full product Android.

**In scope**
- `docs/nodie/parity.md` — 1 file (Approach C brainstorm)
- `apps/nodie-android/` — Kotlin + Jetpack Compose, package `com.battudao.nodie`
- Design tokens hex 1:1 iOS (`NodieColors`)
- Shell 4 tab (Bảng tin / Hỏi đáp / Hội thoại / Hành trình) + mock screens
- Session rule ngắn (start đọc parity / end tick)

**Out of scope (YAGNI)**
- Wire Supabase / supabase-kt auth+queries (chờ iOS vertical wire xong)
- FCM, Play Store, full gesture parity
- 3-file docs suite, feature flags, CI parity gate
- Retire `apps/mobile` Expo (parent plan phase 10)

**Priority conflict:** Parent plan P0 = iOS Q&A/chat wire. Plan này **không block** iOS; chạy khi rảnh / session Android riêng.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [parity-docs](./phase-01-parity-docs.md) | Pending |
| 2 | [android-project-scaffold](./phase-02-android-project-scaffold.md) | Pending |
| 3 | [design-tokens-shell](./phase-03-design-tokens-shell.md) | Pending |
| 4 | [mock-screens-port](./phase-04-mock-screens-port.md) | Pending |
| 5 | [session-rules-verify](./phase-05-session-rules-verify.md) | Pending |

## Dependencies

| Relation | Plan | Note |
|----------|------|------|
| related | `260714-2147-btd-community-app-swift-zalo-style` | Parent product; this = early slice of phase 09 (scaffold only) |
| blockedBy | none | Scaffold không chờ schema iOS |
| does not block | iOS phase 01–05 | iOS wire continues independently |

**Reference code (read-only during cook):**
- `apps/nodie-ios/NODIE/DesignSystem/*`
- `apps/nodie-ios/NODIE/Shell/*`
- `apps/nodie-ios/NODIE/Models/*`
- `apps/nodie-ios/NODIE/Features/**`
- `plans/reports/brainstorm-260715-1619-nodie-docs-parity.md`

## Architecture (target)

```
apps/nodie-android/
  app/src/main/java/com/battudao/nodie/
    NodieApp.kt / MainActivity.kt
    designsystem/   NodieColors, Typography, Spacing
    shell/          RootTabScaffold, NodieTabBar
    features/feed|qa|conversations|journey|profile/
    models/         Question, Conversation, MockData
    auth/           Login placeholder (no supabase wire)
docs/nodie/
  parity.md         Server | iOS | Android matrix + Pending + Contract bullets
```

Stack: minSdk 26+, target 35, Compose BOM, Material3 themed to NODIE cream/ink (not default purple Material). Light-only like iOS.

## Success (plan done when)

- [ ] `docs/nodie/parity.md` exists, seed rows filled
- [ ] `./gradlew :app:assembleDebug` (or Android Studio) builds
- [ ] 4 tabs switch; mock Q&A list visible
- [ ] CLAUDE/app note points sessions to parity.md
- [ ] Parent plan phase 09 note updated: “scaffold started via 260715-1620”

## Cook

```bash
# From monorepo root
/ck:cook plans/260715-1620-nodie-android-scaffold-parity
```

Ownership when cooking: **only** `apps/nodie-android/**`, `docs/nodie/**`, optional 5-line note in root `CLAUDE.md` / parent plan. **Do not** edit `apps/nodie-ios` except reading.
