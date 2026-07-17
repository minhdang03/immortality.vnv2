# Editorial Sacred Redesign — Master Plan

**Created:** 2026-05-08 21:06
**Style direction:** Editorial Sacred v2 (modern editorial + spiritual warmth)
**Inspiration:** themarginalian.org · Aeon · Substack · Apple HIG (for iOS)

---

## Mockups (source of truth)

- `docs/redesign-mockup-editorial-sacred-v2.html` — full web Editorial Sacred v2
- `docs/redesign-mockup-multi-device.html` — mobile / tablet / desktop preview
- `docs/redesign-mockup-ios-app.html` — 6 iOS screens (Capacitor)

---

## Goals

1. **Visual identity unified** across home, articles, khaitri, stories, about, practice, contact, search
2. **Modern editorial feel** — mega-serif headlines, asymmetric grids, drop caps, pull quotes
3. **Responsive end-to-end** — mobile / foldable / tablet / desktop / ultrawide
4. **iOS-ready** — same design tokens reused via Capacitor (community/newsletter scaffold)
5. **A11y** — semantic h1/h2/h3, focus-visible, prefers-reduced-motion, ARIA labels
6. **Performance** — skeleton on F5 deep-link, no double-flash, lazy images, fluid type via `clamp()`

---

## Phases (depend on each other)

| # | Phase | Files (primary) | Status |
|---|---|---|---|
| 01 | [Design tokens + base layout](phase-01-design-tokens-base.md) | `base.css`, new `tokens.css`, `responsive.css`, `Header.jsx`, `Footer.jsx` (new) | pending |
| 02 | [Home page redesign](phase-02-home-page.md) | `HomePage.jsx`, `home.css`, hero asymmetric, featured grid, chips, CTA band | pending |
| 03 | [Article list + detail](phase-03-article-pages.md) | `ArticlesPage.jsx`, `ArticleDetail.jsx`, drop cap, pull quote, breadcrumb | pending |
| 04 | [Khai Trí list + detail](phase-04-khaitri-pages.md) | `KhaiTriPage.jsx`, `KhaiTriDetail.jsx`, `KhaiTriList.jsx`, Q-A card style | pending |
| 05 | [Secondary pages](phase-05-secondary-pages.md) | Stories, About, Practice, Contact, Search, Topic, Ungho — unify wrappers | pending |
| 06 | [Community + Newsletter + iOS banner](phase-06-community-cta.md) | New `CommunityPlaceholder.jsx`, `NewsletterBand.jsx`, `AppBanner.jsx` | pending |
| 07 | [Polish + a11y + perf](phase-07-polish-a11y.md) | focus-visible, reduced-motion, skeleton consistency, perf audit | pending |

---

## Decisions locked

- **Style:** Editorial Sacred v2 (modern)
- **Typography:** Cormorant Garamond display, Be Vietnam Pro UI/body
- **Color tokens:** cream (#f8f3ea) bg, ink (#161310), gold (#b08642 / deep #7a5a28 / soft #e9d9b4)
- **Container scale:** 480 / 640 / 720 / 960 / 1140 / 1280 (mobile → ultrawide)
- **Drop cap** trên paragraph đầu của Article body
- **Pull quote** giữa article body (border-top + border-bottom hairline)
- **Community** = placeholder badge "SOON" trong v1 (Firestore schema sẵn sàng nhưng UI ẩn)
- **iOS app shell** = giữ Capacitor wrap web hiện tại (đã có `ios/` dir). Native screens v2 sau.
- **Newsletter** = form Firestore lưu email (không tích hợp Mailchimp/Beehiiv v1)

---

## Migration strategy

- **No breaking URL changes** — giữ tất cả routes hiện tại
- **CSS rewrite, JS tweak** — phần lớn là CSS overhaul + small JSX restructure
- **Per-phase deploys** — sau mỗi phase em build local + show anh, ok thì push prod
- **Rollback path** — branch `stable-with-bugfixes` đã có baseline working; mỗi phase commit riêng, có thể revert từng commit

---

## Out of scope (v1)

- ❌ Native iOS screens (Swift/SwiftUI) — defer v2
- ❌ Native push notifications
- ❌ Real-time chat
- ❌ User-generated content moderation queue (chỉ comment moderation hiện có)
- ❌ Multi-author blogging (1 voice "Bất Tử Đạo")

---

## Success criteria

- [ ] Lighthouse mobile/desktop ≥90 across all pages
- [ ] CLS <0.05 (drop cap + pull quote không gây shift)
- [ ] All 13 pages render đúng style từ mockup
- [ ] Mobile (375) / tablet (768) / desktop (1440) / ultrawide (1920) đều mượt
- [ ] Foldable Z Fold (open ~717) không vỡ
- [ ] Dark mode contrast pass WCAG AA
- [ ] Keyboard nav hoàn chỉnh (Tab order = visual order)
- [ ] No double-flash on F5 deep-link

---

## Estimated effort

| Phase | Time |
|---|---|
| 01 — tokens + layout | 1 day |
| 02 — home | 0.5 day |
| 03 — article pages | 1 day |
| 04 — khaitri pages | 0.5 day |
| 05 — secondary pages | 1 day |
| 06 — community/newsletter | 0.5 day |
| 07 — polish | 0.5 day |
| **Total** | **5 days** |

Mỗi phase em làm xong, anh review, ok thì commit + deploy production.
