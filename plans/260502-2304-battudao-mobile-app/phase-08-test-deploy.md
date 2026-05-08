# Phase 08 — Manual Test, EAS Build, Deploy

## Context Links
- All prior phases.
- EAS Build docs (Expo).
- Apple TestFlight + Google Play Console internal track.

## Overview
- **Priority**: P1 (gates launch)
- **Status**: pending
- **Effort**: 2d
- Run end-to-end manual test matrix on real devices, configure EAS Build, produce signed iOS + Android binaries, upload to TestFlight + Play Console internal track.

## Key Insights
- `react-native-webrtc` requires real device (sim audio is broken). Cannot rely on simulator-only testing.
- iOS provisioning: needs Apple Developer Program account ($99/yr). Use EAS managed credentials to avoid Xcode signing dance.
- Android: signing key managed by EAS (recommended).
- env vars: prod Firebase config + Google OAuth client IDs go into `eas.json` `env` per-profile.
- Vietnamese App Store metadata: title, subtitle, keywords, description in vi-VN.

## Functional Requirements (test matrix)

### Auth
- [ ] Email signup creates user → lands in main tabs
- [ ] Email login persists across force-quit
- [ ] Google sign-in opens browser, returns to app
- [ ] Anonymous sign-in works
- [ ] Logout returns to login screen
- [ ] battudao.com web auth still works (regression check post rules deploy)

### Chat
- [ ] Open room from list
- [ ] Send message → appears immediately
- [ ] Second device receives message <1s
- [ ] Pagination scrolls older messages without dup
- [ ] Long-press own message → delete works
- [ ] Long-press other message → report flag set in console
- [ ] Typing indicator appears <2s, disappears <5s after stop

### Livestream
- [ ] Host: tap Go Live → permissions prompt → preview → start broadcast
- [ ] Stream doc created with `status: live`
- [ ] Viewer sees stream in Home list within 2s
- [ ] Viewer joins → video renders <2s
- [ ] Reactions float on both devices
- [ ] Chat overlay sends/receives during stream
- [ ] Viewer leaves → count decrements
- [ ] Host ends stream → all viewers see "Stream ended" + bounce back
- [ ] Permission denied → graceful error
- [ ] Background app during stream → stream ends cleanly

### Network conditions
- [ ] WiFi → all features work
- [ ] 4G → chat works, livestream works (lower quality acceptable)
- [ ] Offline → app shows offline state, doesn't crash

### Devices
- [ ] iPhone (iOS 17+) — primary
- [ ] iPad — basic smoke (won't optimize)
- [ ] Android (Pixel or similar, Android 13+) — primary

## Architecture (deploy pipeline)
```
git push
  ↓
manual: eas build --profile preview --platform ios
        eas build --profile preview --platform android
  ↓
EAS Build cloud → produces .ipa + .aab
  ↓
manual: eas submit -p ios --latest    → TestFlight
        eas submit -p android --latest → Play Console internal
  ↓
Internal testers install
```

## Related Code Files

**Read:**
- All prior phase outputs.

**Create:**
- `apps/immortality-vn/mobile/eas.json`
- `apps/immortality-vn/mobile/.easignore` (exclude shared/ if needed; or include via metro)
- `apps/immortality-vn/mobile/app.config.ts` (if needed for env-driven config — replaces app.json)
- `apps/immortality-vn/mobile/scripts/test-checklist.md` (the matrix above as a runnable doc)
- `apps/immortality-vn/mobile/store-assets/ios/screenshots/` (placeholder)
- `apps/immortality-vn/mobile/store-assets/android/screenshots/` (placeholder)
- `apps/immortality-vn/mobile/store-assets/listing-vi.md` (App Store + Play listing copy in vi)

**Modify:**
- `apps/immortality-vn/mobile/app.json` — add `extra` field, `runtimeVersion`, `updates.url` (optional EAS Update)
- `apps/immortality-vn/mobile/package.json` — add EAS scripts

## Implementation Steps
1. `npm i -g eas-cli` (or `npx eas-cli`); `eas login`.
2. `cd mobile && eas build:configure` — generates `eas.json`.
3. Define profiles: `development` (dev client), `preview` (internal distribution), `production` (store).
4. Configure `eas.json` `env` per profile: Firebase config, Google OAuth client IDs.
5. Set up Apple credentials via `eas credentials` (managed mode).
6. Run `eas build --profile preview --platform all`. Wait for cloud build.
7. Install preview on real iPhone + Android — run full test matrix.
8. Fix any issues (loop back to relevant phase).
9. Bump version, run `eas build --profile production --platform all`.
10. `eas submit -p ios --latest` → TestFlight.
11. `eas submit -p android --latest` → Play Console internal track.
12. Add internal testers (5-10 people).
13. Create store listing copy in `listing-vi.md`. Capture 6 screenshots (auth, rooms list, room chat, home livestreams, watch stream, profile).

## Todo
- [ ] Install eas-cli + login
- [ ] eas build:configure
- [ ] Define 3 profiles in eas.json
- [ ] Wire env vars per profile
- [ ] Set up Apple credentials
- [ ] Cloud build preview iOS + Android
- [ ] Run full test matrix on real devices
- [ ] Fix any blockers
- [ ] Bump version + production build
- [ ] Submit TestFlight
- [ ] Submit Play Console internal
- [ ] Add testers
- [ ] Capture screenshots
- [ ] Write vi listing copy

## Success Criteria
- All test matrix items pass on real iOS + Android device.
- TestFlight build available to internal testers.
- Play Console internal track build available.
- Crash-free session ≥99% over 1 week of internal testing (Firebase Crashlytics OR manual reporting).
- No regressions on battudao.com web (auth, content read) post-rules-deploy.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Apple review reject (livestream content rules) | Med | High | Privacy policy + age gate + report flow + EULA in-app; likely needs 17+ rating |
| Play review reject (camera/mic without justification) | Low | Med | Clear permission rationale strings + privacy policy |
| EAS build fails on react-native-webrtc native module | Med | High | Test build EARLY (don't wait until P08); custom config plugin if needed |
| Push notif missing → user retention low | Med | Med | Acknowledged YAGNI; revisit post-launch |
| TURN server absent → P2P fails on cellular for some users | Med | High | Provision TURN BEFORE public launch (Twilio NTS or Cloudflare) |

## Security
- Privacy policy URL in app (App Store + Play require). Must cover: camera, mic, chat content, livestream content retention, account deletion path.
- EULA disclaimer (UGC liability).
- In-app report mechanism (P04) — App Store requires this for UGC apps.
- Account deletion endpoint (Firebase Auth → delete user — implement before submit; required by Apple).
- Secrets: ONLY public Firebase keys in client. No service account.
- `.env*` gitignored. EAS env-vars never committed.

## Next Steps
- Public launch after internal feedback loop.
- Post-launch v1.1: TURN server, push notifications, recording, moderation tools.
