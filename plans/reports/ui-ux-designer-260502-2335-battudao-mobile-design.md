# Battudao Mobile — Design Report

**Date:** 2026-05-02 · **Designer:** ui-ux-designer
**Scope:** Chat MVP (no livestream) — Login, Channels List, Channel Detail, Profile, States.

## Files created

Design system
- `apps/immortality-vn/docs/design-guidelines.md`

Wireframes (self-contained HTML, dark, 393×852 iPhone 15 Pro frame, Vietnamese fonts via Google Fonts CDN)
- `apps/immortality-vn/docs/wireframes/01-login.html` — 3 hero variants (Mandala / Lotus / Bagua)
- `apps/immortality-vn/docs/wireframes/02-channels-list.html`
- `apps/immortality-vn/docs/wireframes/03-channel-detail.html` — chat scroll + long-press action sheet
- `apps/immortality-vn/docs/wireframes/04-profile.html`
- `apps/immortality-vn/docs/wireframes/05-states.html` — empty / loading / error

Screenshots (headless Chrome, 1100 px tall window)
- `apps/immortality-vn/docs/wireframes/screenshots/01-login.png`
- `apps/immortality-vn/docs/wireframes/screenshots/02-channels-list.png`
- `apps/immortality-vn/docs/wireframes/screenshots/03-channel-detail.png`
- `apps/immortality-vn/docs/wireframes/screenshots/04-profile.png`
- `apps/immortality-vn/docs/wireframes/screenshots/05-states.png`

## Key visual decisions

- **Two-pigment system** — purple = action, gold = self/sacred. Red reserved for signal only. No third decorative hue. Keeps the dark canvas readable + on-brand to the existing battudao.com web (which already uses gold + Cormorant).
- **Cormorant for category names + headings**, Inter for everything else. Two fonts max on screen. Diacritics validated visually (Bất Tử Đạo, Khai Trí, Thái Dương Quyền, vô ngã, đạo hữu).
- **Own message = gold-tinted right bubble with no avatar**; **other = dark-card left bubble with author name colored**. Author name colors carry identity: purple (member), gold (teacher / Thầy), teal (alt member). System messages center-italic muted.
- **Surface lightness over shadows** for elevation — surface (`#14101e`) → hover (`#1d1729`); only sheet/toast use real shadow. Fits the meditative tone.
- **Hero idle motion** is a slow continuous rotation (60-90s) — barely perceptible; reads as "alive, breathing" rather than animated. NO spring on send (haptic + 250 ms fade-slide instead).

## Login hero variants

| | A — Mandala | B — Lotus | C — Bagua |
|---|---|---|---|
| Tone | Sacred geometry, cosmic | Buddhist / Phật, organic | Đạo / Taoist, balance |
| Cultural fit | Universal mystical | Strongest VN spiritual anchor | Aligns with name "Đạo" + Thái Dương Quyền |
| Risk | Could read generic | Could read religion-specific (Phật) | Heavier symbolism, may polarize |
| Animation | Slow rotation works | Static or breathe-pulse | Slow rotation works |

**Recommended → Variant A (Mandala).** It threads the needle: cosmic + sacred + abstract enough not to anchor too narrowly to one tradition, yet rich enough to feel devotional. Lotus (B) is a strong fallback if marketing wants explicit Phật framing. Bagua (C) is iconographically tied to Thái Dương Quyền but risks reading as kung-fu / martial-arts brand rather than meditative.

## Components delivered (matrix)

| Component | Variants | File |
|---|---|---|
| Avatar | 24/36/64/96, init-fallback, online dot | guidelines §6.1 |
| Button | primary / secondary / ghost / destructive × sm/md/lg | §6.2 |
| Input | idle / focused / error | §6.3 |
| Channel row | default / unread / muted | §6.4, wireframe 02 |
| Category header | expanded / collapsed | §6.5, wireframe 02 |
| Message bubble | own / other / system / reply | §6.6, wireframe 03 |
| Toast | success / error / info | §6.7, wireframe 05 |
| Bottom sheet | backdrop blur + sheet | §6.8, wireframe 03B |
| Tab bar | 2 tabs (active/inactive) | §6.9, wireframe 02/04 |

## NativeWind / token paste-block

In `docs/design-guidelines.md` §9. Includes `colors`, `spacing`, `radius`, `font`, `text`, `motion` consts (TS) + tailwind.config.js extension. Drop into `mobile/src/theme/tokens.ts` directly.

## Motion contract (summary)

- Standard 300 ms ease-out, micro 150, pronounced 500. NO spring.
- Channel row press: surface→hover 150 ms.
- Channel push enter: slide-x + fade 300 ms.
- Send: bubble fade-in + slide-y 8→0, 250 ms + haptic selection.
- Typing dots: stagger 1.2 s loop.
- Sheet enter: slide-y 100→0, 300 ms, backdrop fade 200 ms.
- Reduced-motion → fade-only 150 ms.

## Accessibility

- Token contrasts verified — primary text 14.8:1 on bg.base; secondary 6.1:1.
- Touch targets ≥ 44×44 (composer buttons 40 → bumped to 44 in implementation; flagged below).
- All screens safe-area inset top + bottom; Dynamic Island accommodated by 60-64 px header padding.
- Vietnamese subset explicitly requested in Google Fonts URL.

## Open questions / clarifications before implementation

1. **Login hero choice** — confirm Mandala (A) vs Lotus (B). Mandala is recommended. Decision unblocks final logo direction.
2. **Composer touch target** — wireframe shows 40 px circle send + add buttons. Spec says ≥44. Implementation should use 44 (visually identical, hit-area extended).
3. **Search bar** — included in channels list mockup but not in original scope/feature list. Keep as v1.0 or ship without? Recommend keep — low cost, high UX value.
4. **Author color rule** — currently mapped: purple = default member, gold = teacher/admin role, teal = alt visual identity. Need product confirmation: is "teacher" a real role flag, or do we randomize a small palette of 3-4 muted hues per user (avatar-color-style)? Recommend the latter for MVP (no role schema required).
5. **Reply chip** — wireframe shows replies inline in bubble. P04 spec doesn't list reply as MVP — confirm scope. Easy to remove if out of scope; keep visual reserved for v1.1.
6. **Category collapse persistence** — collapse state per-user device-local (AsyncStorage) or just session? Recommend AsyncStorage; trivial to add.
7. **Empty-state illustration** — current SVG is line-only abstract lotus. If marketing wants a richer illustration, swap-in only (no layout change needed).

**Status:** DONE
**Summary:** Shipped full design system doc + 5 self-contained wireframe HTMLs (Login w/ 3 hero variants, Channels, Chat, Profile, States) + screenshots. Tokens are paste-ready for `mobile/src/theme/`.
**Concerns/Blockers:** none — 7 minor open Qs listed above for product confirmation; none block implementation start (sensible defaults documented).
**Files created:**
- `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/docs/design-guidelines.md`
- `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/docs/wireframes/01-login.html`
- `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/docs/wireframes/02-channels-list.html`
- `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/docs/wireframes/03-channel-detail.html`
- `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/docs/wireframes/04-profile.html`
- `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/docs/wireframes/05-states.html`
- `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/docs/wireframes/screenshots/01-login.png`
- `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/docs/wireframes/screenshots/02-channels-list.png`
- `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/docs/wireframes/screenshots/03-channel-detail.png`
- `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/docs/wireframes/screenshots/04-profile.png`
- `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/docs/wireframes/screenshots/05-states.png`
- `/Users/dang/Documents/ClaudeCode/apps/immortality-vn/plans/reports/ui-ux-designer-260502-2335-battudao-mobile-design.md`
