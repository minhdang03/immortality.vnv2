---
date: 2026-07-18
role: tester
scope: battudao web articles UX and accessibility fixes
status: passed-with-limitations
---

# Test Report — 2026-07-18 — Articles UX/A11y Fixes

## Summary

- Production build: PASS, exit 0, 224 modules transformed.
- Desktop browser regression: PASS at 1920×1080.
- Source/diff acceptance review: PASS for all requested changes.
- Mobile/tablet computed-style and click-event runtime matrix: not completed before test cutoff; source cascade/event logic reviewed instead.
- Implementation files untouched by tester.

## Results

| Check | Result | Evidence |
|---|---|---|
| Production build | PASS | `pnpm --dir apps/web run build`; Vite completed in 1.53s |
| Articles double top spacing | PASS | Browser: `.articles-page` computed `padding-top: 0px`, section top `60px` |
| Article content above fold | PASS | Browser 1920×1080: grid top `342.84px`, 12 cards rendered |
| Responsive padding rule | PASS (source) | `.articles-page.section` specificity overrides later `.section` at mobile/tablet/desktop breakpoints |
| Header link semantics | PASS | Browser returned 5 primary `<a>` destinations with `/`, `/articles`, `/stories`, `/khaitri`, `/nang-luong` |
| Current destination | PASS | `/articles` anchor returned `aria-current="page"`; others returned no current state |
| Normal SPA click | PASS (source) | Unmodified primary click calls `preventDefault()` then existing `navigate(id)` |
| Modifier/non-primary click | PASS (source) | Handler returns before `preventDefault()` for non-left, Meta, Ctrl, Shift, Alt clicks |
| Theme action label | PASS | Browser Vietnamese state: `aria-label` and `title` both `Chế độ tối`; icon is wrapped `aria-hidden` in source |
| Overlay close localization | PASS (source) | `Đóng menu` for `vi`; `Close menu` for `en` |
| Reduced motion | PASS (source) | Reduce query disables sun ray/glow, particle, ambient pseudos, light ray, old/new root view-transition animations; smooth scroll becomes auto |

## Browser Evidence

Test URL: `http://localhost:5174/articles`

```text
viewport: 1920 × 1080
articles section top: 60px
articles section padding-top: 0px
page hero: top 60px, bottom 334.84px
article grid: top 342.84px
article cards: 12
theme accessible name/title: Chế độ tối / Chế độ tối
```

## Build Warnings

- Vite reports `firebase.js` and `supabase-client.js` are both statically and dynamically imported, so dynamic imports do not create separate chunks.
- Non-blocking and outside this UX/a11y fix scope.

## Limitations

- Browser runtime was measured at desktop only. Mobile/tablet `padding-top: 0` is supported by CSS specificity inspection, not a completed computed-style viewport matrix.
- Normal and modified click behavior was verified from the exact handler branch logic, not a completed event-instrumented browser run.
- English theme label, mobile overlay close label, and reduced-motion computed animation names were source-verified, not runtime-emulated.

## Recommendation

- Accept fix. Optional follow-up: add a small Playwright regression covering 390×844, 768×1024, 1440×770 and reduced-motion emulation.

## Unresolved Questions

- None blocking.
