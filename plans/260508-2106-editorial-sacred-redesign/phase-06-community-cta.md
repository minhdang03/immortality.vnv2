# Phase 06 — Community Placeholder + Newsletter + iOS App Banner

**Status:** pending
**Effort:** 0.5 day
**Depends on:** Phase 02 (NewsletterBand, AppBanner from Home), Phase 01 (Footer)

---

## Goal

Build the foundation for future iOS app community feature without shipping live community v1. Newsletter form goes live (lo-fi: writes to Firestore). iOS app banner appears site-wide as a footer band before main footer.

---

## Files

| File | Change |
|---|---|
| `src/pages/community/CommunityPlaceholder.jsx` (new) | Coming soon page with email collect + iOS app preview |
| `src/styles/pages/community.css` (new) | Page styles |
| `src/config/pages.js` | Add `community` page entry with route `/cong-dong` |
| `src/components/layout/Header.jsx` | Add Cộng Đồng nav link with "Soon" badge (already in Phase 01 mockup) |
| `src/hooks/useNewsletterSignup.js` (new) | Firestore write helper for `newsletter_signups` collection |
| `firestore.rules` | Add public-create rule for `newsletter_signups` (admin-only read) |
| `schemas/newsletter-signup.js` (new) | Schema: email + timestamp + source ('home' | 'community' | 'footer') + lang |

---

## Community placeholder page (`/cong-dong`)

```
[ Header (existing) ]
[ Hero with phone mockup ]
  [ Eyebrow "✦ SẮP RA MẮT" ]
  [ H1 "Cộng đồng Bất Tử Đạo" ]
  [ Deck: "App iOS + Android + Web — đọc offline, thông báo bài mới, thảo luận, chia sẻ trải nghiệm" ]
  [ Newsletter signup form (large) ]
  [ Phone mockup screenshot grid (3 phones angled) ]
[ Feature list ]
  - 📖 Đọc offline (Lưu bài đọc trong app)
  - 🔔 Thông báo bài mới (Tuần báo + custom topics)
  - 💬 Thảo luận (Hỏi đáp, chia sẻ trải nghiệm)
  - 🌅 Reading mode (Font scale, dark mode, reading position)
  - 🔖 Bookmarks + collections
[ Roadmap timeline ]
  Q3 2026: Web v2 (✓ done after this redesign)
  Q4 2026: iOS app v1 (Capacitor wrap + community)
  Q1 2027: Android app v1
  Q2 2027: Native iOS screens (push notifications, widgets)
[ Newsletter band (reused from Home) ]
[ Footer ]
```

## Newsletter Firestore schema

```js
// Collection: newsletter_signups
{
  email: string (lowercase normalized),
  timestamp: serverTimestamp,
  source: 'home' | 'community' | 'footer' | 'article-end',
  lang: 'vi' | 'en',
  ip: optional (anti-spam),
  status: 'pending' | 'confirmed' | 'unsubscribed',
}
```

Email validation client-side (regex) + dedup via lowercase indexed query.

## Firestore rules

```
match /newsletter_signups/{id} {
  allow create: if request.resource.data.email is string
                && request.resource.data.email.size() > 3
                && request.resource.data.email.size() < 200;
  allow read: if isAdmin();
  allow update, delete: if isAdmin();
}
```

## iOS app banner (site-wide)

Already created in Phase 02 as `<AppBanner>` component. In Phase 06, mount it in:
- HomePage (already has)
- ArticlesPage footer (one banner per page)
- KhaiTriPage footer
- StoriesPage footer

Use `<AppBanner variant="compact">` for non-home pages (smaller, less prominent).

## Roadmap timeline component

Simple vertical list with quarter labels left, milestone right, gold dot connector.

---

## Acceptance criteria

- [ ] `/cong-dong` route renders Community Placeholder
- [ ] Newsletter form submits successfully → success state "Cảm ơn anh/chị"
- [ ] Duplicate email check (client-side warn + Firestore dedup)
- [ ] iOS App Banner appears on Home, Articles list, Khaitri list, Stories
- [ ] Header "Cộng Đồng" link routes to `/cong-dong` with "Soon" badge
- [ ] Firestore rules deployed allowing public create on `newsletter_signups`
- [ ] Admin can view signups in `/admin` panel (new tab)

## Out of scope

- Real-time community discussions (defer to native iOS app v2)
- Email confirmation double-opt-in (defer)
- Mailchimp/Beehiiv integration (defer)
- Push notifications (defer to iOS native)
