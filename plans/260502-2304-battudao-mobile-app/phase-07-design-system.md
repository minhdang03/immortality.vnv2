# Phase 07 — Design System + UI Primitives

## Context Links
- P01 theme tokens (basic) — extend here.
- Reference brand: Battudao = Bất Tử Đạo (spiritual society). Distinct from Fly0 sleep/calm aesthetic.
- Existing Vite web for color/font hints: `apps/immortality-vn/src/styles/`

## Overview
- **Priority**: P2 (parallel-safe with P03–P06; final polish before P08)
- **Status**: pending
- **Effort**: 2d
- Build full design tokens, shared UI primitives (Button, Avatar, Card, Modal, Badge, Pill), tab bar icons, splash + app icon.

## Key Insights
- Mystical aesthetic: deep dark base + purple/gold/red accent. Avoid cyan/blue (too tech).
- Vietnamese diacritics need fonts with extended Latin support — Cormorant Garamond covers; Inter covers UI body.
- Avoid heavy gradients on mobile (battery + perf); use subtle radial only on hero/overlay.
- Reactions/livestream UI must feel cinematic — translucent overlays, glow on accent.
- All UI primitives <100 lines each.

## Functional Requirements
- Color tokens, typography scale, spacing scale, radius/shadow tokens.
- 8 reusable primitives: `text`, `button`, `avatar`, `card`, `modal`, `badge`, `pill`, `divider`.
- Tab bar custom icons (lucide or vector-icons set).
- App icon (1024×1024) + splash + adaptive Android icon.
- Loading states + empty states components.

## Architecture

### Token files
```
mobile/src/theme/
  ├ colors.ts
  ├ typography.ts
  ├ spacing.ts
  ├ radius.ts
  ├ shadows.ts
  ├ z-index.ts
  └ theme-provider.tsx (exposes via context)
```

### Color palette
```ts
export const colors = {
  // base
  bg:        '#0a0612',     // near-black with violet undertone
  surface:   '#150a1f',
  surfaceAlt:'#1f1130',
  border:    '#2a1a3d',

  // text
  textPrimary:   '#f5ecd6',  // warm off-white
  textSecondary: '#a89bb8',
  textMuted:     '#6b5d7a',

  // brand accents
  purple:    '#8b4dff',
  gold:      '#c9a86c',
  red:       '#d4234e',

  // semantic
  success:   '#5fc28a',
  warning:   '#e3a93f',
  danger:    '#d4234e',

  // overlays
  overlay50: 'rgba(10,6,18,0.5)',
  overlay80: 'rgba(10,6,18,0.8)',
} as const;
```

### Typography
- Display: Cormorant Garamond 600 (24/32/48px)
- Body: Inter 400/500 (14/16/18px)
- Caption: Inter 400 (12px)
- Use `expo-font` to load.

### Spacing scale
4 / 8 / 12 / 16 / 20 / 24 / 32 / 48

### Component primitives
Each <100 lines. Pure StyleSheet, no nested theme bloat. TypeScript props.

## Related Code Files

**Read:**
- P01 theme stubs
- Existing Vite web styles for any palette continuity

**Create:**
- `apps/immortality-vn/mobile/src/theme/colors.ts` (refine P01)
- `apps/immortality-vn/mobile/src/theme/typography.ts`
- `apps/immortality-vn/mobile/src/theme/spacing.ts`
- `apps/immortality-vn/mobile/src/theme/radius.ts`
- `apps/immortality-vn/mobile/src/theme/shadows.ts`
- `apps/immortality-vn/mobile/src/theme/z-index.ts`
- `apps/immortality-vn/mobile/src/components/ui/text.tsx`
- `apps/immortality-vn/mobile/src/components/ui/button.tsx`
- `apps/immortality-vn/mobile/src/components/ui/avatar.tsx`
- `apps/immortality-vn/mobile/src/components/ui/card.tsx`
- `apps/immortality-vn/mobile/src/components/ui/modal.tsx`
- `apps/immortality-vn/mobile/src/components/ui/badge.tsx`
- `apps/immortality-vn/mobile/src/components/ui/pill.tsx`
- `apps/immortality-vn/mobile/src/components/ui/divider.tsx`
- `apps/immortality-vn/mobile/src/components/ui/loading-state.tsx`
- `apps/immortality-vn/mobile/src/components/ui/empty-state.tsx`
- `apps/immortality-vn/mobile/assets/icon.png` (final 1024×1024)
- `apps/immortality-vn/mobile/assets/splash.png` (final)
- `apps/immortality-vn/mobile/assets/adaptive-icon.png` (Android)

**Modify:**
- All P01 stub screens + P03–P06 screens to consume tokens (token rename pass).
- `mobile/App.tsx` — wire `expo-font` loadAsync before render.
- `mobile/app.json` — splash bg + icon paths.

## Implementation Steps
1. Define all token files with values above.
2. Build `text` primitive with variants (display/body/caption).
3. Build `button` (primary/secondary/ghost; sm/md/lg sizes).
4. Build `avatar` (initials fallback if no image).
5. Build `card`, `modal`, `badge`, `pill`, `divider`, `loading-state`, `empty-state`.
6. Generate app icon + splash via `imagemagick` skill or design tool. Theme: simple sigil/glyph (lotus + circle?) on `#0a0612`, gold accent.
7. Load Cormorant + Inter via `expo-font`.
8. Sweep through P01–P06 screens replacing raw colors/fonts with token references.
9. Visual regression test: launch app, navigate every screen, verify dark theme consistent.

## Todo
- [ ] Define all token files
- [ ] Build 10 UI primitives
- [ ] Generate app icon + splash + adaptive icon
- [ ] Load fonts via expo-font
- [ ] Apply tokens to existing screens (P01–P06)
- [ ] Visual sweep on real device

## Success Criteria
- Every screen uses tokens — no hex literals outside `theme/`.
- Cormorant rendered correctly (visual check on iOS).
- App icon installs correctly to home screen.
- Splash transitions cleanly to login/home.
- Primitives total <1000 lines.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Font load delay → flash of system font | Med | Low | `expo-splash-screen.preventAutoHideAsync()` + hide after fonts load |
| Icon design quality below brand | Med | Med | Iterate; AI-assisted draft acceptable for MVP, refine post-launch |
| Token churn breaks screens | Low | Low | Token names stable; rename via codemod if needed |

## Security
- No tracking/analytics SDK in this phase.
- No remote config for theme (KISS).

## Next Steps
- P08 final test + EAS build uses polished UI.
