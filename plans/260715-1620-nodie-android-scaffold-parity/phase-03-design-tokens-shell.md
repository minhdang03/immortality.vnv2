---
phase: 3
title: "design-tokens-shell"
status: pending
effort: 1.5h
priority: high
---

# Phase 3: design-tokens-shell

## Context Links

- iOS tokens: `apps/nodie-ios/NODIE/DesignSystem/NodieColors.swift`
- iOS tabs: `apps/nodie-ios/NODIE/Shell/NodieTabBar.swift`, `RootTabView.swift`
- Parent plan token list: bg `#faf7f0` · ink `#241c10` · accent `#2b7a5e` · …

## Overview

Port design tokens + floating pill tab bar 4 tab. Compose idiom, **không** copy SwiftUI API.

## Requirements

### Colors (must match hex)

| Token | Hex |
|-------|-----|
| bg | `#FAF7F0` |
| ink | `#241C10` |
| accent | `#2B7A5E` |
| accentLight | `#A894FF` |
| gold | `#B8862B` |
| rule | `#E8DFC9` |
| tagBg | `#F1E9D8` |
| cream | `#FAF7F0` |

Full list: mirror `NodieColors.swift` (inkBody, inkMuted, expertBg, best*, onDark*).

### Tabs (order + labels + glyphs)

| Tab | Label | Glyph |
|-----|-------|-------|
| feed | Bảng tin | ✦ |
| qa | Hỏi đáp | ? |
| conversations | Hội thoại | ◧ |
| journey | Hành trình | ◍ |

Pill bar: dark ink capsule, cream labels, selected full cream / unselected dim ~50%.

### Typography

- System fonts OK (iOS uses SF/New York). Map title/body/meta sizes roughly to iOS `NodieTypography` — no need bundle Lora yet.

## Architecture

```
designsystem/NodieColors.kt
designsystem/NodieTypography.kt
designsystem/NodieSpacing.kt
designsystem/NodieTheme.kt          // CompositionLocal or Material Theme colorScheme map
shell/NodieTab.kt                   // enum
shell/NodieTabBar.kt
shell/RootTabScaffold.kt            // Scaffold/Box + bottom bar overlay
```

## Implementation Steps

1. Create Color tokens as `Color(0xFF…)`
2. `NodieTheme { }` wrapping app content — background `bg`
3. Implement `NodieTabBar` Compose
4. `RootTabScaffold` holds selected tab state; content area placeholder per tab
5. Hide system nav clash: pad content above bar (~74dp like iOS)
6. Wire MainActivity → RootTabScaffold

## Todo

- [ ] Tokens file complete
- [ ] 4 tabs switch state
- [ ] Visual: cream bg + ink pill bar

## Success Criteria

- [ ] Switching tabs changes content placeholder title
- [ ] Side-by-side with iOS simulator: bar shape/labels recognizable same product
- [ ] Light-only

## Risks

| Risk | Mitigation |
|------|------------|
| Material3 defaults purple | Override colorScheme fully |
| Edge-to-edge nav bar | Use WindowInsets padding |

## Next

Phase 4 — mock screens
