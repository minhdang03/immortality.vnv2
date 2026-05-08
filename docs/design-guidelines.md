# Battudao Mobile — Design Guidelines

**Product:** Battudao (Bất Tử Đạo) — Discord-style chat for a Vietnamese spiritual / cultivation community.
**Platforms:** iOS + Android (Expo / React Native, mobile-first portrait).
**Mode:** Dark only.
**Locale:** Vietnamese-first (`vi`).

---

## 1. Brand Rationale

The visual language sits between an ancient lacquer (sơn mài) panel and a quiet meditation app. We use a deep midnight base with a violet undertone to evoke the night sky over a temple, then layer two ceremonial pigments: **mystical purple** (`#8b4dff`) for primary action and identity, **gold** (`#c9a86c`) for the user's own voice and sacred markers. Cormorant Garamond carries headings — its high contrast strokes feel literary, scriptural, slow. Inter handles UI density without breaking the calm. Everything else (motion, spacing, iconography) is restrained: no neon, no spring bounce, no mascot. The app should feel like reading at low light in a temple library.

---

## 2. Color System

### 2.1 Palette (locked tokens)

| Token | Hex | Usage |
|---|---|---|
| `bg.base` | `#0a0612` | App background, channel screen base |
| `bg.surface` | `#14101e` | Cards, channel rows, message bubbles (other) |
| `bg.surfaceHover` | `#1d1729` | Pressed / hovered surface, action sheet |
| `accent.purple` | `#8b4dff` | Primary CTA, active state, send button, focus ring |
| `accent.purpleSoft` | `rgba(139,77,255,0.16)` | Pressed-bg, badge, unread tint |
| `accent.gold` | `#c9a86c` | Own message bubble tint, dividers, premium markers |
| `accent.goldSoft` | `rgba(201,168,108,0.18)` | Own message bg fill |
| `signal.red` | `#d4234e` | Notification dot, errors, destructive, "live" |
| `text.primary` | `#f5f1e8` | Body text, headings on dark |
| `text.secondary` | `#9a8fb8` | Subtitles, timestamps, last-message preview |
| `text.tertiary` | `#5a5170` | Disabled, captions, placeholders |
| `border.subtle` | `rgba(255,255,255,0.06)` | Hairline dividers, row separators |
| `border.strong` | `rgba(255,255,255,0.12)` | Card outline, input outline focused |
| `overlay.scrim` | `rgba(8,4,16,0.72)` | Modal / action sheet backdrop |

### 2.2 Usage rules

- **Purple = action.** Anything tappable that drives the user forward (send, login, save, primary tab active).
- **Gold = self / sacred.** Own message bubble fill (low alpha), section accents in profile, divider glints on the login screen. Never compete with purple.
- **Red = signal.** Unread badge dot, error toast, destructive action ("Đăng xuất", "Xóa"). Never as decoration.
- **Never** use white surfaces. Never use pure black `#000`.
- **Contrast minimums:** body text on `bg.base` ≥ 4.5:1 (verified `f5f1e8` on `0a0612` = 14.8:1). Secondary ≥ 4.5:1 on base (verified `9a8fb8` = 6.1:1). Tertiary OK only for ≥18px / non-essential.

---

## 3. Typography

### 3.1 Families

- **Display** — `Cormorant Garamond` (Google Fonts, Vietnamese subset). Weights 500 / 600 / 700.
- **Body & UI** — `Inter` (Google Fonts, Vietnamese subset). Weights 400 / 500 / 600.
- **Mono / numerics** — `JetBrains Mono`. Weight 400. Timestamps, IDs.

Max **2 families on screen** at any time (Cormorant for headings + Inter for everything else; mono only inside metadata).

### 3.2 Scale

| Name | Size | Line | Letter | Family / weight | Use |
|---|---|---|---|---|---|
| `display.xl` | 32 | 38 | -0.02em | Cormorant 600 | Login hero, profile name |
| `display.lg` | 24 | 30 | -0.01em | Cormorant 600 | Screen titles, category names |
| `body.lg` | 18 | 26 | 0 | Inter 500 | Channel name in header, message body emphasized |
| `body.md` | 16 | 24 | 0 | Inter 400 | Default body / messages |
| `body.sm` | 14 | 20 | 0 | Inter 400 | Last-message preview, secondary labels |
| `caption` | 12 | 16 | 0.02em | Inter 500 | Timestamps, system messages, badges |

### 3.3 Vietnamese diacritics samples (must render cleanly)

```
Cormorant 24:   Bất Tử Đạo — Khai Trí, ngộ đạo, tỉnh thức
Inter 16:       Hôm nay anh đã tập Thái Dương Quyền chưa?
Inter 14:       "Đường về cõi Niết Bàn — chia sẻ cảm nghiệm sâu sắc."
Mono 12:        12 thg 4 · 21:47
```

Always include the Vietnamese subset in Google Fonts URLs:
`https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap&subset=latin,vietnamese`

---

## 4. Spacing & Layout

### 4.1 Spacing scale (4 px base)

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`

- `4` micro (icon ↔ label inline)
- `8` tight (between badge + text)
- `12` cozy (row internal padding)
- `16` standard screen padding (left / right)
- `24` between sections / between message groups
- `32` top of hero / between major blocks
- `48` empty-state vertical breathing room
- `64` reserved for hero composition

### 4.2 Radius scale

| Token | Value | Use |
|---|---|---|
| `r.sm` | 8 | Inputs, badges |
| `r.md` | 12 | Buttons, channel rows |
| `r.lg` | 18 | Message bubbles |
| `r.xl` | 24 | Bottom sheet, cards |
| `r.full` | 999 | Avatars, pill chips |

### 4.3 Elevation / shadow (3 levels)

Dark UI elevation is mostly **surface lightness**, not shadow. Shadows only on lifted overlays.

- `e.0` — flat, no shadow. Use surface color shift only.
- `e.1` — `0 1px 2px rgba(0,0,0,0.4)` — channel rows on press, toasts.
- `e.2` — `0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)` — bottom sheet, modal.

Never glow on text or icons except the **focus ring**: `0 0 0 2px rgba(139,77,255,0.45)`.

---

## 5. Iconography

- **Style:** outline, 1.5 pt stroke, monochrome `text.primary`, single accent `accent.purple` only for active state.
- **Sizes:** 16 / 20 / 24 px. Tab bar 24 px. Inline 16 px.
- **Library:** `@expo/vector-icons` → use Lucide or Feather set. No filled / duotone glyphs in MVP.

---

## 6. Components

### 6.1 Avatar

| Size | Use | Notes |
|---|---|---|
| 24 | inline mention / system row | optional |
| 36 | message list (other) | default |
| 64 | channel header member chips | |
| 96 | profile screen | with optional gold ring |

- Shape: circle (`r.full`).
- Fallback: initials on `bg.surfaceHover` with `text.primary`, Cormorant 500.
- Online dot: 8 px, `accent.purple`, bottom-right, 2 px `bg.base` border.

### 6.2 Button

| Variant | Bg | Text | Border | Use |
|---|---|---|---|---|
| Primary | `accent.purple` | `text.primary` | none | Send, Login, Save |
| Secondary (outline) | transparent | `text.primary` | 1px `border.strong` | Edit profile, Cancel |
| Ghost | transparent | `text.secondary` | none | Tertiary actions |
| Destructive | transparent | `signal.red` | none | Logout, Delete |

Sizes (height / horiz padding / text):
- `sm` 36 / 12 / 14
- `md` 44 / 16 / 16  ← default, meets touch target
- `lg` 52 / 20 / 16

States: idle / pressed (bg darker by 8%) / disabled (40% opacity, no events) / focused (purple ring `e` 0 0 0 2 rgba(139,77,255,0.45)).

### 6.3 Input field

- Height 48, padding 12 / 16, radius `r.sm`, bg `bg.surface`, border 1px `border.subtle`.
- Placeholder: `text.tertiary`.
- Focused: border `accent.purple`, no glow.
- Error: border `signal.red`, helper text `signal.red` 12 px.

### 6.4 Channel row

- Height 56, horizontal padding 16, radius `r.md` (when pressed, `bg.surfaceHover`).
- Layout: `# name` (Inter 16/500) → last message preview (Inter 14/400 `text.secondary`, 1 line ellipsis) → optional unread dot 8 px `signal.red` right-aligned.
- Variants: default / unread (name → `text.primary` + bold weight 600, dot visible) / muted (name → `text.tertiary`, dot hidden).

### 6.5 Category header

- Height 36, padding 16 horizontal, 8 top.
- Layout: emoji 16 + name (Cormorant 600 / 18) + chevron 16 right.
- Tap → toggle collapse with 250 ms ease-out.

### 6.6 Message bubble

| Variant | Align | Bg | Text | Radius |
|---|---|---|---|---|
| Other | left | `bg.surface` | `text.primary` | `r.lg` (top-left 6) |
| Own | right | `accent.goldSoft` (over `bg.base`) | `text.primary` | `r.lg` (top-right 6) |
| System | center | none | `text.tertiary` 12 italic | — |
| Reply | left/right | as above + 3px `accent.purple` left bar | preview chip on top | `r.lg` |

Padding 10 / 14. Max width 80% of screen width.
Gold-tint own bubble: bg `rgba(201,168,108,0.18)`, inner 1px border `rgba(201,168,108,0.32)`.
Author name (other): Inter 13 / 600 `accent.purple` for visual identity (colorless on own).
Timestamp: mono 11 `text.tertiary`, below or beside the bubble (right-end of group).

### 6.7 Toast

Top-anchored under safe area, 12 px from top. Width — screen − 32 px. Padding 12 / 16. Radius `r.md`. Bg `bg.surface`. Left 3 px bar:
- success: `accent.purple`
- error: `signal.red`
- info: `accent.gold`

Auto-dismiss 4 s. Swipe-up to dismiss.

### 6.8 Bottom sheet (action sheet)

- Backdrop `overlay.scrim` + 12 px backdrop blur.
- Sheet bg `bg.surfaceHover`, radius `r.xl` top corners only, padding 16, drag handle 36×4 `border.strong` centered top.
- Rows 56 px tall, 16 padding, icon 20 + label 16. Destructive row text `signal.red`.

### 6.9 Tab bar (2 tabs)

- Height 64 + safe area inset.
- Bg `bg.surface` with `border.subtle` top border, no shadow.
- Tabs: `Channels` (chat-bubble icon) / `Profile` (user icon).
- Active: icon + label `accent.purple`, 2 px purple line top.
- Inactive: icon + label `text.tertiary`.

---

## 7. Motion

- **Durations:** micro 150 / standard 300 / pronounced 500 ms. Default 300.
- **Easing:** `cubic-bezier(0.22, 0.61, 0.36, 1)` (ease-out-expo light). NO spring.
- **Reduced motion:** if OS pref, fade-only at 150 ms.

| Interaction | Spec |
|---|---|
| Channel row press | bg `surface → surfaceHover`, 150 ms |
| Channel enter (push) | slide-x 16→0 + fade, 300 ms |
| Message send | bubble fades-in + slide-y 8→0, 250 ms; haptic `selection` |
| Typing indicator dots | 3 dots stagger opacity 0.2 → 1 → 0.2, 1.2 s loop |
| Bottom sheet enter | slide-y 100% → 0, 300 ms; backdrop fade 200 ms |
| Toast | slide-y -100% → 0 in 250, dwell 4 s, fade out 200 ms |
| Login hero (mandala) | rotate 0.005 rad/s continuous, opacity drift |

---

## 8. Accessibility

- Touch target **≥ 44×44 pt** for all interactive elements.
- Body contrast ≥ 4.5:1; large/heading ≥ 3:1 (all locked tokens verified).
- Screen reader labels in Vietnamese (`accessibilityLabel="Gửi tin nhắn"`).
- Respect `prefers-reduced-motion`.
- Dynamic Type: scale display + body up to 130 % without clipping.

---

## 9. Tailwind / NativeWind tokens (paste-ready)

```ts
// theme/tokens.ts
export const colors = {
  bg: {
    base: '#0a0612',
    surface: '#14101e',
    surfaceHover: '#1d1729',
  },
  accent: {
    purple: '#8b4dff',
    purpleSoft: 'rgba(139,77,255,0.16)',
    gold: '#c9a86c',
    goldSoft: 'rgba(201,168,108,0.18)',
  },
  signal: { red: '#d4234e' },
  text: {
    primary: '#f5f1e8',
    secondary: '#9a8fb8',
    tertiary: '#5a5170',
  },
  border: {
    subtle: 'rgba(255,255,255,0.06)',
    strong: 'rgba(255,255,255,0.12)',
  },
  overlay: { scrim: 'rgba(8,4,16,0.72)' },
} as const;

export const spacing = { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 12: 48, 16: 64 } as const;

export const radius = { sm: 8, md: 12, lg: 18, xl: 24, full: 9999 } as const;

export const font = {
  display: 'Cormorant Garamond',
  body: 'Inter',
  mono: 'JetBrains Mono',
} as const;

export const text = {
  displayXl: { fontFamily: font.display, fontSize: 32, lineHeight: 38, fontWeight: '600', letterSpacing: -0.6 },
  displayLg: { fontFamily: font.display, fontSize: 24, lineHeight: 30, fontWeight: '600', letterSpacing: -0.2 },
  bodyLg:    { fontFamily: font.body,    fontSize: 18, lineHeight: 26, fontWeight: '500' },
  bodyMd:    { fontFamily: font.body,    fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySm:    { fontFamily: font.body,    fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption:   { fontFamily: font.body,    fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 0.2 },
} as const;

export const motion = {
  micro: 150, standard: 300, pronounced: 500,
  ease: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
} as const;
```

```js
// tailwind.config.js (NativeWind)
module.exports = {
  theme: {
    extend: {
      colors: {
        bg:        { base: '#0a0612', surface: '#14101e', hover: '#1d1729' },
        accent:    { purple: '#8b4dff', gold: '#c9a86c' },
        signal:    { red: '#d4234e' },
        textc:     { primary: '#f5f1e8', secondary: '#9a8fb8', tertiary: '#5a5170' },
      },
      borderRadius: { sm: 8, md: 12, lg: 18, xl: 24 },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
};
```

---

## 10. Anti-patterns (do not ship)

- Neon cyan / magenta gradients
- Mascots, cartoon emoji-as-illustration
- Pure `#000` backgrounds
- White / cream surfaces in dark mode
- Spring physics on chat send
- Center-aligned multi-line body text
- Heavy drop shadows on flat UI
- Two display fonts on the same screen
