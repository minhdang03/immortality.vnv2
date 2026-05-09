# Home Mockup Alignment

**Created:** 2026-05-09 09:49
**Source of truth:** `docs/redesign-mockup-editorial-sacred-v2.html`
**Why:** Phase-02 commit (`eeb7902`) áp tokens nhưng skip layout restructure → hero + article section không khớp mockup.

## Scope (KISS — minimal restructure)

| Section | Action |
|---|---|
| Hero | Rewrite single-col centered → **2-col asymmetric** (text trái + gradient image phải). Drop `hero-cosmic.webp`. |
| Articles section | Add **section-header** (eyebrow + em title + "View all →"), **topic chips** filter, **featured-grid** (1 main + 3 side) + remaining articles in `grid-cards` 3-col. |
| Wisdom Quotes | Keep (unique app feature, không có trong mockup). |
| Home Cards (Quick Access) | Keep. |
| Topics Grid | Keep (chip filter trong section articles overlap nhưng topics có descVi/descEn riêng). |
| Newsletter / AppBanner | Keep — đã có components match mockup. |

## Out of scope

- Hero text auto-bind từ `articles[0]` (giữ siteSettings/translations cũ)
- Featured-grid items không click vào article thật v1 (sẽ wire sau)
- Mobile breakpoints chi tiết — chỉ collapse 2-col → 1-col tại 900px (như mockup)

## Files

- `src/pages/core/HomePage.jsx` — JSX restructure hero + articles section
- `src/styles/home.css` — add `.hero-eyebrow`, `.hero-deck`, `.hero-meta`, `.hero-image`, `.section-header`, `.topic-chips`, `.chip`, `.featured-grid`, `.featured-main`, `.featured-side`, `.side-card`, `.grid-cards`, `.grid-card`, `.btn`, `.btn-primary`, `.btn-ghost`. Drop `.hero-sun`.

## Steps

1. Rewrite `<section className="hero">` JSX → mockup structure
2. Rewrite `{/* Latest Articles */}` section → section-header + chips + featured-grid + grid-cards
3. Update `home.css` with new selectors (mockup-exact, dark mode auto via `--ink` etc.)
4. Build verify (`pnpm build`)
5. Visual verify in dev server

## Success

- [x] Hero 2-col layout, h1 mega-serif với em italic accent
- [x] Hero image = CSS gradient (no raster, no missing alpha)
- [x] Article section có chips + featured-grid (1 main + 3 side)
- [x] No compile errors
- [x] Dark mode tokens vẫn hoạt động
