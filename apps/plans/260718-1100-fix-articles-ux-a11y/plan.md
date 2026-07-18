# Fix Articles UX and Header Accessibility

## Overview

- Status: Complete
- Priority: P2
- Goal: reduce above-fold whitespace, restore semantic navigation, label controls, respect reduced motion.
- Scope: existing web app only; no routing library or design-system expansion.

## Context

- `web/src/pages/content/ArticlesPage.jsx`
- `web/src/components/layout/Header.jsx`
- `web/src/config/pages.js`
- `web/src/App.jsx`
- `web/src/styles/home.css`
- `web/src/styles/responsive.css`
- `web/src/styles/components/page-hero.css`
- `web/src/styles/base.css`

## Phase 1 — Articles spacing

- [x] Add a page-specific class to the articles section.
- [x] Remove only the wrapper's stacked top padding; keep `PageHero` as spacing owner.
- [x] Preserve horizontal padding, max width, bottom rhythm, filters, grid, and other pages.
- [x] Verify desktop first viewport reveals filters/content; verify mobile/tablet remain balanced.

## Phase 2 — Semantic header navigation

- [x] Derive canonical `href` values from page config (`/` for home, configured path otherwise).
- [x] Convert logo, desktop destinations, More-menu destinations, mobile destinations, and admin destination to `<a>`.
- [x] Intercept only ordinary same-tab clicks to call existing `navigate`; allow modifier/middle clicks and copied links to use native browser behavior.
- [x] Preserve active classes, dropdown close, overlay close, analytics, View Transitions, popstate, and deep-link refresh behavior.
- [x] Keep actual toggles as buttons: More, theme, language, hamburger, overlay close.
- [x] Adjust existing header selectors only where button element selectors would stop styling links.

## Phase 3 — Accessible controls

- [x] Add localized dynamic `aria-label` to theme control matching the action (light/dark), retaining optional tooltip.
- [x] Localize the overlay close label; confirm hamburger already has label, expanded state, and controlled target.
- [x] Ensure decorative glyphs/icons remain hidden from assistive tech where the link/control has a text label.

## Phase 4 — Reduced motion

- [x] Add one `prefers-reduced-motion: reduce` block in `base.css`.
- [x] Disable sun-ray/glow, particle, ambient-glow, and light-ray animation while preserving static visuals.
- [x] Disable smooth scrolling and root view-transition animation for reduced-motion users.

## Verification

- [x] Run `pnpm --dir web run build`; require zero syntax/build errors.
- [x] Check `/articles` responsive behavior via runtime desktop measurement and CSS cascade review.
- [x] Review keyboard focus order, active nav, More/Escape, mobile overlay/Escape, and theme announcement.
- [x] Check normal click uses SPA navigation; review native modifier-click and direct URL behavior.
- [x] Verify reduced-motion rules cover ambient/sun/particle/ray movement and page crossfade.

## Risks / Mitigation

- Anchor conversion may lose styling: retain classes and expand narrow element selectors.
- Preventing every click would break native link behavior: intercept unmodified primary clicks only.
- Broad spacing changes could regress other pages: use an articles-only override.

## Docs Impact

- Minor: record UX/accessibility bug fix in `docs/project-changelog.md` if present.
- No roadmap or architecture change expected.

## Unresolved Questions

- None.
