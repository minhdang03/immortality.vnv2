# Phase 07 — Polish + A11y + Performance

**Status:** pending
**Effort:** 0.5 day
**Depends on:** All previous phases (cross-cutting)

---

## Goal

Ship-ready polish pass. Audit a11y, fix focus states, respect reduced-motion, ensure no double-flash on F5, run Lighthouse, fix CLS, optimize images, write release notes.

---

## A11y audit checklist

| Item | Verify |
|---|---|
| All `<a>` and `<button>` have `:focus-visible` outline 2px gold + offset 4px | yes |
| H1/H2/H3 hierarchy correct (one H1 per page, no level skip) | yes |
| Card components use `<article>`, list pages use `<section>` | yes |
| Image `alt=""` for decorative, descriptive for content (hero) | yes |
| Icon-only buttons have `aria-label` (search, theme, close) | yes |
| Form inputs have `<label>` (visible or `aria-labelledby`) | yes |
| Color contrast ≥4.5:1 light + dark (run axe / Lighthouse) | yes |
| Tab order matches visual order (no `tabIndex` > 0) | yes |
| Modals/sheets have `role="dialog"` + escape route | yes |
| Skip-to-main-content link at top of `<body>` | yes |
| `<html lang="vi">` or `lang="en"` matches active lang | yes |

---

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .article-card-image,
  .skeleton-line,
  .hero-sun {
    animation: none !important;
    background: var(--gold-tint) !important;
  }
}
```

Test with macOS System Preferences → Accessibility → Display → Reduce motion = on.

---

## Performance audit

### CLS (target <0.05)
- All `<img>` have `width`/`height` or `aspect-ratio`
- Drop cap doesn't shift layout (uses `float: left` not block reflow)
- Pull quote has `min-height` reservation
- Fonts: `font-display: swap` + preload only critical Cormorant 600 weight

### LCP (target <2.5s)
- Hero image preloaded with `fetchpriority="high"`
- Hero webp 124KB desktop / 41KB mobile (already optimized)
- Inline critical CSS in `<head>` for hero/header

### TBT (target <200ms)
- Lazy load all non-hero components (already using React.lazy)
- Defer Firebase Auth init until /admin route hit
- Move Analytics to user interaction or after onload

### Images
- All article hero images: WebP via R2, max 1600px wide
- Thumbnails: lazy with `loading="lazy"`
- Skeleton shimmer while loading

---

## Deep-link skeleton consistency

Verify these scenarios show correct skeleton (no flash):
- F5 `/` → HomeSkeleton
- F5 `/articles` → ListSkeleton
- F5 `/article/:slug` → DetailSkeleton (already fixed)
- F5 `/khaitri/:slug` → DetailSkeleton (already fixed)
- F5 `/story/:slug` → DetailSkeleton (already fixed)
- F5 `/topic/:id` → ListSkeleton
- F5 `/about`, `/practice`, `/contact`, `/search` → PageSkeleton

---

## Service Worker cache

Bump cache version (existing pattern):
```js
const CACHE_NAME = 'app-shell-v3'  // was v2
```

Invalidate old caches on new SW activation.

---

## Bundle size audit

```bash
npm run build
# Inspect dist/ size; current ~500KB warning threshold
```

If chunk too large, `manualChunks` for Firebase + React-DOM split.

---

## Release notes / changelog

Write to `docs/project-changelog.md`:

```
## 2026-05-XX — Editorial Sacred Redesign v2

Visual overhaul of public-facing pages following editorial design system.

Highlights:
- Mega-serif headlines (Cormorant Garamond) with italic gold accents
- Asymmetric hero (text + image) on home + article detail
- Drop cap on first paragraph of articles
- Pull quotes with hairline rules
- Q-A card pattern for Khai Trí (filled gold-tint Q + clean A)
- Modern topic chips with active state
- Sticky glass header with backdrop blur
- 5-column footer
- Newsletter signup band (Firestore-backed)
- iOS app banner with phone mockup
- Community placeholder page (/cong-dong) with feature roadmap

Technical:
- Unified design tokens (colors, type scale, spacing, shadows)
- Fluid typography via clamp() across breakpoints
- 6-tier responsive scale: 480/640/720/960/1140/1280
- All page wrappers unified under <PageShell> + <PageHeader>
- Semantic h1/h2/h3 hierarchy fixed
- Drop cap, pull quote as reusable components
- Newsletter Firestore schema + rules
- Service Worker cache bumped v2 → v3

Migration: no URL changes. localStorage lang preference preserved.
```

---

## Acceptance criteria

- [ ] Lighthouse mobile + desktop ≥90 on 5 key pages (Home, Articles, Article detail, Khaitri detail, About)
- [ ] CLS <0.05 on all pages
- [ ] LCP <2.5s on Home + Article detail
- [ ] All a11y checklist items pass
- [ ] No double-flash on any F5 deep-link
- [ ] Service Worker cache bumped + old caches purged
- [ ] Changelog written
- [ ] Tested on: iPhone Safari, Android Chrome, iPad Safari, macOS Safari + Chrome + Firefox, Windows Edge

---

## Final deploy

After all phases pass:
1. `npm run build` — verify clean
2. `git commit -am "feat(redesign): editorial sacred v2 release"` — single big commit OR keep per-phase commits
3. `vercel --prod --yes` — deploy production
4. Test live URLs
5. Bump `service-worker.js` cache version
6. Push to remote

---

## Post-launch

- Monitor analytics for 72h: bounce rate, time-on-page, conversion (newsletter signups)
- Collect user feedback via Telegram channel
- Schedule iOS app v1 build for Q4 2026
