---
phase: 5
title: "session-rules-verify"
status: pending
effort: 45m
priority: medium
---

# Phase 5: session-rules-verify

## Overview

Khóa thói quen dual-session + verify build. Update parent plan note. Không hydrate full process Meta.

## Requirements

1. Short rule block (≤20 lines) in monorepo so agents see it:
   - Preferred: section in root `CLAUDE.md` under NODIE / Mobile
   - Or `apps/nodie-android/README.md` + `apps/nodie-ios/README.md` one-liner "read docs/nodie/parity.md"
2. Session protocol text (copy-paste ready in README):

```
Platform: iOS | Android
0. Read docs/nodie/parity.md
1. git log -15 -- apps/nodie-ios apps/nodie-android docs/nodie
2. Work only own app folder + docs/nodie
3. End: update parity Pending + matrix ticks
```

3. Build verify Android debug
4. Parent plan `260714-2147-.../plan.md` phase 09 line: note scaffold via this plan (status partial)

## Implementation Steps

1. Add README `apps/nodie-android/README.md` (how to open in Studio, gradlew, parity link)
2. Optional 5–10 lines in root `CLAUDE.md` NODIE dual-platform
3. Final parity.md pass: accurate matrix
4. `./gradlew :app:assembleDebug`
5. Update parent plan phase 09 text only (no restructure phases table if CLI-owned — edit prose note under phases)

## Todo

- [ ] Android README
- [ ] CLAUDE or dual README pointer
- [ ] assembleDebug green
- [ ] Parent plan phase 09 annotated
- [ ] parity.md final tick

## Success Criteria

- [ ] New AI session with only "work Android NODIE" finds parity.md from CLAUDE/README
- [ ] Debug APK builds
- [ ] Plan 260715 marked completable (all phases done)

## Risks

| Risk | Mitigation |
|------|------------|
| CLAUDE.md bloat | Max 15 lines pointer |
| Parent plan conflict | Only annotate phase 09; don't rewrite iOS phases |

## Out of scope reminder

- supabase-kt wire → separate plan after iOS Q&A/chat wire (parent 03–04)
- Play internal testing → later

## Next Steps After Plan Complete

1. Continue iOS wire (parent phases 01–04) — P0 product
2. When iOS Q&A wired: new plan “Android wire Q&A” using parity Contract section
3. Port Pending other OS rows when rảnh
