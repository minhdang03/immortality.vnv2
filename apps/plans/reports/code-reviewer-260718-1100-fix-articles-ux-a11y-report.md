---
date: 2026-07-18
role: code-reviewer
scope: battudao articles UX and header accessibility fix
status: passed-with-notes
---

# Code Review — Articles UX/A11y Fix

## Verdict

- No blocking correctness, regression, or accessibility finding in reviewed diff.
- Spec compliance: PASS. All four planned phases implemented; no unjustified product-scope expansion.
- Code quality: PASS with one low-risk hardening note.
- Adversarial review: no accepted Critical/Medium finding.

## Findings

### Low — Unknown configured nav IDs silently link to home

- Evidence: `web/src/components/layout/Header.jsx:5-8` returns `/` both for the valid `home` page (empty path) and any ID absent from `PAGE_MAP`.
- Trigger: stale/corrupt externally stored `siteSettings.navItems` contains an unknown visible ID.
- Impact: copied link or modified click opens Home while an ordinary click calls `navigate(unknownId)`, producing inconsistent navigation behavior.
- Current risk low: admin additions are constrained by `ALL_NAV_PAGES` (`SettingsTab.jsx:51-55`) and existing migration merges known defaults.
- Recommendation: filter unknown IDs at the settings boundary, or make `pageHref` explicitly handle `home` and reject unknown IDs. Non-blocking for current configured catalog.

## Verified Behavior

- Canonical hrefs: current `PAGE_MAP` IDs used by navigation map correctly; home resolves `/`, all other current nav paths resolve from config (`Header.jsx:5-8`, `config/pages.js:6-159`).
- Native links: `go` prevents only unmodified primary clicks. Meta/Ctrl/Shift/Alt/non-primary clicks remain native (`Header.jsx:10-11,46-51`). Keyboard activation remains SPA navigation because synthesized click is primary/unmodified.
- SPA behavior preserved: ordinary clicks still call existing `navigate`, retaining analytics, View Transitions, history push, scroll reset, and overlay close (`App.jsx:202-228`). Back/forward remains handled by `popstate` (`App.jsx:196-200`).
- Menu states: More closes before ordinary navigation (`Header.jsx:91`); mobile overlay closes through `navigate -> setMenuOpen(false)` (`App.jsx:204-206`). Modified clicks correctly leave the current page/menu state untouched.
- ARIA: primary nav has a localized name; current anchors expose `aria-current="page"`; interactive toggles remain buttons; theme glyph and sun SVG are hidden from assistive tech; overlay close is localized.
- CSS: anchor selectors preserve prior button styling and add visible focus states. Global `a` reset in `base.css:10` prevents default underline/color regressions.
- Spacing scope: `.articles-page.section` has higher specificity than later responsive `.section` shorthands, so only article-index top padding becomes zero; other section sides/bottom and pages remain unaffected (`responsive.css:12-13,27`).
- Reduced motion: requested global sun/particle/ambient/ray effects, smooth scrolling, and root view-transition animations are disabled (`base.css:169-179`). Other page-specific reduced-motion rules remain outside this fix's stated scope.
- Generated artifact should remain: `web/package.json:8` intentionally copies built `index.html` to `functions/spa.html`; `functions/index.js:73-99` serves that file to non-crawler requests on function-rewritten routes. Diff contains only expected asset hash updates.

## Verification Evidence

- `git diff --check` on scoped files: clean.
- Fresh Vite compilation: 224 modules transformed and bundle rendering completed successfully.
- Full `pnpm --dir web run build` could not complete in this reviewer sandbox because its final copy targets `../../functions/spa.html`, outside reviewer writable root (`Operation not permitted`). Tester report records the same full command passing before review.
- Tester runtime evidence: desktop `/articles` section top `60px`, computed top padding `0px`, article grid top `342.84px`, 12 cards rendered.

## Non-blocking Coverage Gap

- Mobile/tablet computed-style matrix, event-instrumented modifier-click tests, and reduced-motion runtime emulation were source-reviewed but not automated. Recommended Playwright coverage remains useful, not a merge blocker.

## Unresolved Questions

- None blocking.

**Status:** DONE_WITH_CONCERNS
**Summary:** Spec and quality review pass; no blocking findings. One low-risk hardening issue exists for corrupt/stale unknown nav IDs.
**Concerns/Blockers:** Fresh Vite compile succeeded; sandbox blocked only the final generated-file copy. Mobile/tablet and reduced-motion runtime automation remain optional follow-up coverage.
