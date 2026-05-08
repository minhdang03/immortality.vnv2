# Phase 01 — Scaffold Expo App + Navigation

## Context Links
- Reference structure: `apps/fly0-app/src/` (Expo SDK 54, screens/components/services pattern)
- Reference config: `apps/fly0-app/app.json`, `apps/fly0-app/package.json`
- Project root: `apps/immortality-vn/` (Vite web lives at `src/`, mobile goes to `mobile/`)

## Overview
- **Priority**: P1 (blocks all other phases)
- **Status**: pending
- **Effort**: 1.5d
- Bootstrap Expo SDK 54 RN app under `mobile/` with TypeScript + bottom tabs + dark theme tokens. Chat-only MVP — livestream phases deferred.

## Key Insights
- Chat-only MVP can run on Expo Go (no native modules needed). Custom dev client deferred to v2 livestream.
- Match Fly0's monorepo style: each app has own `package.json`, `node_modules`. No yarn workspaces.
- Use `@react-navigation/native@^7` + bottom tabs (matches Fly0 pattern, allows nesting Channels stack: List → Channel).
- Splash + icon: placeholder PNGs initially; design refined in P07.

## Functional Requirements
- App launches on iOS sim + real device (Expo Go OK for MVP).
- 2 bottom tabs: **Channels** (chat — primary), **Profile**.
- Channels tab has nested stack: ChannelsScreen → ChannelScreen.
- Dark theme applied globally.
- TypeScript strict mode.

## Architecture
```
mobile/
├── app.json               # Expo config (slug battudao, scheme battudao://, ios.bundleId)
├── package.json
├── tsconfig.json
├── App.tsx                # Entry: NavigationContainer + ThemeProvider
├── babel.config.js
├── metro.config.js        # if needed for shared/ resolution
├── assets/                # icon.png, splash.png, adaptive-icon.png
└── src/
    ├── navigation/
    │   ├── root-navigator.tsx       # Stack: Auth | Main
    │   ├── main-tabs.tsx            # Bottom tabs
    │   └── types.ts                 # navigation prop types
    ├── screens/
    │   ├── channels/channels-screen.tsx   # placeholder SectionList (categories+channels)
    │   ├── channels/channel-screen.tsx    # placeholder messages view
    │   └── profile/profile-screen.tsx
    ├── theme/
    │   ├── colors.ts
    │   ├── typography.ts
    │   ├── spacing.ts
    │   └── theme-provider.tsx
    └── components/
        └── tab-bar-icon.tsx
```

## Related Code Files

**Read for reference:**
- `apps/fly0-app/App.tsx`, `apps/fly0-app/src/navigation/*` (if exists), `apps/fly0-app/src/screens/HomeScreen.tsx`
- `apps/fly0-app/app.json`, `apps/fly0-app/package.json`

**Create:**
- `apps/immortality-vn/mobile/package.json`
- `apps/immortality-vn/mobile/app.json`
- `apps/immortality-vn/mobile/tsconfig.json`
- `apps/immortality-vn/mobile/App.tsx`
- `apps/immortality-vn/mobile/src/navigation/root-navigator.tsx`
- `apps/immortality-vn/mobile/src/navigation/main-tabs.tsx`
- `apps/immortality-vn/mobile/src/screens/channels/channels-screen.tsx`
- `apps/immortality-vn/mobile/src/screens/channels/channel-screen.tsx`
- `apps/immortality-vn/mobile/src/screens/profile/profile-screen.tsx`
- `apps/immortality-vn/mobile/src/theme/colors.ts`
- `apps/immortality-vn/mobile/src/theme/typography.ts`
- `apps/immortality-vn/mobile/src/theme/spacing.ts`
- `apps/immortality-vn/mobile/src/theme/theme-provider.tsx`
- `apps/immortality-vn/mobile/src/components/tab-bar-icon.tsx`
- `apps/immortality-vn/mobile/assets/icon.png` (placeholder 1024x1024)
- `apps/immortality-vn/mobile/assets/splash.png` (placeholder 1284x2778)

**Modify:** none (Vite web + Fly0 untouched).

## Implementation Steps
1. `cd apps/immortality-vn && npx create-expo-app@latest mobile --template blank-typescript`
2. `cd mobile && npx expo install expo-status-bar expo-font expo-splash-screen expo-haptics`
3. `npm i @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @expo/vector-icons`
4. Configure `app.json`: name `Battudao`, slug `battudao`, scheme `battudao`, iOS bundleId `com.battudao.mobile`, Android pkg `com.battudao.mobile`, dark theme, splash bg `#0a0612`.
5. Create theme tokens (basic dark + purple/gold; full polish in P07).
6. Build `root-navigator` with conditional Auth vs Main (Auth wired in P03 — placeholder boolean for now).
7. Build `main-tabs` with 2 tabs + vector icons. Channels tab uses nested stack navigator.
8. Stub each screen with placeholder text "Battudao – {name}".
9. `npx expo start` to verify launches on iOS sim via Expo Go.
10. Smoke test on iOS sim: tabs switch, theme applied, no console errors.

## Todo
- [ ] Run create-expo-app
- [ ] Install navigation deps
- [ ] Configure app.json
- [ ] Create theme tokens (basic)
- [ ] Build navigators (root + tabs + channels-stack)
- [ ] Stub 3 screens (channels-list + channel + profile)
- [ ] Verify launches on iOS sim via Expo Go

## Success Criteria
- `npx expo start` launches app on iOS sim via Expo Go.
- 2 tabs visible (Channels, Profile), switchable, dark bg.
- Tapping a placeholder channel navigates to channel screen via nested stack.
- TypeScript compiles with no errors (`npx tsc --noEmit`).

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Expo SDK 54 dep peer conflicts | Med | Med | Use `npx expo install` (pins compatible versions) |
| iOS build fails locally (no Xcode) | Low | High | Document fallback: EAS Build cloud build |

## Security
- No secrets committed. `.env` not introduced yet (P03 adds Firebase config via `expo-constants` extra).
- `app.json` only contains public ids (slug, bundleId).

## Next Steps
- P02 (shared module) and P07 (design system polish) can run in parallel after this.
- P03 (auth) blocked by P02.
