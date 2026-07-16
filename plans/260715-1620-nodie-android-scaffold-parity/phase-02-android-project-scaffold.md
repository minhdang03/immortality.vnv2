---
phase: 2
title: "android-project-scaffold"
status: pending
effort: 1.5h
priority: high
---

# Phase 2: android-project-scaffold

## Overview

Tạo `apps/nodie-android/` Gradle project chạy được (empty Compose hello / MainActivity). Package `com.battudao.nodie`. Chưa design system.

## Requirements

| Item | Value |
|------|--------|
| Package | `com.battudao.nodie` |
| App name | NODIE |
| minSdk | 26+ |
| target/compile | 34 or 35 |
| UI | Jetpack Compose + Material3 (theme override later) |
| Language | Kotlin |
| Build | Gradle Kotlin DSL preferred |

## Architecture

```
apps/nodie-android/
  settings.gradle.kts
  build.gradle.kts
  gradle.properties
  app/
    build.gradle.kts
    src/main/
      AndroidManifest.xml
      java/com/battudao/nodie/MainActivity.kt
      res/values/strings.xml themes.xml
```

Optional: version catalog `gradle/libs.versions.toml`.

## Implementation Steps

1. Generate project (Android Studio New Project template **Empty Activity Compose**, save under `apps/nodie-android`) **hoặc** hand-write Gradle files nếu không có Studio trong session
2. Set `applicationId` / namespace `com.battudao.nodie`
3. `android:label` = NODIE
4. Force light mode where easy (`uiMode` / `AppCompatDelegate` / theme `Light` only) — match iOS `UIUserInterfaceStyle: Light`
5. Root `.gitignore` monorepo: ensure `local.properties`, `.gradle`, `build/` ignored under android app (add if missing)
6. Verify: `cd apps/nodie-android && ./gradlew :app:assembleDebug`

## Constraints

- **No** supabase-kt yet (phase later / parent wire)
- **No** Firebase/FCM
- **Do not** put secrets in repo
- Prefer not depending on `apps/mobile` Expo code

## Todo

- [ ] Gradle project builds debug APK
- [ ] MainActivity shows placeholder text "NODIE"
- [ ] gitignore Android build artifacts

## Success Criteria

- [ ] `assembleDebug` exit 0
- [ ] App launches emulator/device with package `com.battudao.nodie`

## Risks

| Risk | Mitigation |
|------|------------|
| No Android SDK in agent env | Document manual Studio steps; user builds locally |
| AGP version churn | Pin stable AGP + Compose BOM known good |

## Security

- No API keys in source
- When secrets needed later: `local.properties` or BuildConfig from CI secrets

## Next

Phase 3 — tokens + tab shell
