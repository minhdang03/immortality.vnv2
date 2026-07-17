# Phase 01 — Design Tokens + Base Layout

**Status:** pending
**Effort:** 1 day
**Depends on:** none

---

## Goal

Build the foundation: design tokens (colors, type, spacing), unified container, sticky glass header, footer with 5 columns. After this phase, all pages share the same shell and visual language.

---

## Files to modify

| File | Change |
|---|---|
| `src/styles/base.css` | Replace color tokens with new palette; add fluid `clamp()` type scale; standardize spacing scale 4/8/12/16/24/32/48/64/80/120 |
| `src/styles/responsive.css` | Already updated last session — verify scale matches new tokens |
| `src/components/layout/Header.jsx` | Sticky glass header with backdrop-blur, lang switch pill, search/theme icons; remove old hamburger pattern |
| `src/styles/layout/header.css` | Glass header CSS (rgba(248,243,234,0.82) + saturate(140%) blur(14px)) |
| `src/components/layout/Footer.jsx` (new) | 5-col footer (brand / Khám phá / Cộng đồng / Về / Theo dõi) |
| `src/styles/layout/footer.css` (new) | Footer styles |
| `src/App.jsx` | Mount Footer once at app level |

## Files to delete (legacy)

- `src/styles/layout/bottom-nav.css` rules at ≥1024 → already hidden, no delete needed
- Any unused `Header.jsx` artifacts

---

## Tokens (final)

```css
:root {
  /* Color */
  --bg: #f8f3ea;
  --surface: #ffffff;
  --ink: #161310;
  --ink-soft: #3d3833;
  --ink-muted: #8a8273;
  --gold: #b08642;
  --gold-deep: #7a5a28;
  --gold-soft: #e9d9b4;
  --gold-tint: rgba(176,134,66,0.07);
  --rule: rgba(22,19,16,0.08);
  --rule-strong: rgba(22,19,16,0.16);

  /* Type */
  --serif: 'Cormorant Garamond', Georgia, serif;
  --sans: 'Be Vietnam Pro', system-ui, sans-serif;
  --fs-display-1: clamp(2.6rem, 5.5vw, 5.4rem);
  --fs-display-2: clamp(1.8rem, 3.5vw, 2.6rem);
  --fs-h2: clamp(1.5rem, 2.5vw, 2rem);
  --fs-body: 1.05rem;
  --fs-reading: clamp(1.05rem, 1.4vw, 1.25rem);

  /* Spacing scale (4-base) */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
  --sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px;
  --sp-9: 80px; --sp-10: 120px;

  /* Radius */
  --r-sm: 4px; --r-md: 8px; --r-lg: 16px; --r-pill: 999px;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgba(22,19,16,0.04), 0 1px 3px rgba(22,19,16,0.06);
  --shadow-md: 0 4px 12px rgba(22,19,16,0.06), 0 8px 24px rgba(22,19,16,0.04);
  --shadow-lg: 0 12px 32px rgba(22,19,16,0.08), 0 24px 56px rgba(22,19,16,0.06);

  /* Container */
  --max-w: 480px;
  --side-pad: 16px;
  --section-gap: 32px;
}
@media (min-width: 600px)  { :root { --max-w: 640px; --side-pad: 20px; --section-gap: 40px; } }
@media (min-width: 768px)  { :root { --max-w: 720px; --side-pad: 24px; } }
@media (min-width: 1024px) { :root { --max-w: 960px; --side-pad: 32px; --section-gap: 56px; } }
@media (min-width: 1280px) { :root { --max-w: 1140px; --side-pad: 40px; } }
@media (min-width: 1536px) { :root { --max-w: 1280px; --side-pad: 48px; } }
```

Dark theme: invert `--bg`/`--ink` and reduce gold saturation (10-15%).

---

## Header

```
[ ✦ Bất Tử Đạo ]   [ Trang Chủ | Bài Viết | Khai Trí | Câu Chuyện | Cộng Đồng (Soon) | Giới Thiệu ]   [ VI/EN pill ] [ search ] [ theme ]
```

- Sticky `top: 0` with `backdrop-filter: blur(14px) saturate(140%)`
- Hide nav links on mobile, show overlay menu (existing `overlay.css`)
- Lang switch as pill toggle (active state pill background = surface + shadow-sm)
- Search/theme icons 36×36 with rounded hover bg

## Footer

```
[ Brand + tagline italic ]   [ Khám phá ]   [ Cộng đồng ]   [ Về ]   [ Theo dõi ]
─────────────────────────────────────────────────────
© 2026 Bất Tử Đạo · battudao.com                  Vietnamese · English
```

5-col grid desktop, 2-col tablet, 1-col mobile.

---

## Acceptance criteria

- [ ] All tokens defined in single `base.css`, no hardcoded hex in component CSS
- [ ] `.container` uses `var(--max-w) + var(--side-pad)` everywhere
- [ ] Header sticky with glass effect on scroll
- [ ] Footer renders on every page
- [ ] Lang switch toggle works (per-domain localStorage already done)
- [ ] Dark mode contrast ≥4.5:1 verified

## Out of scope (deferred to next phase)

- Page-level redesign (Phase 02+)
- Drop cap / pull quote (Phase 03)
