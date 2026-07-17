# Phase 02 — Home Page Redesign

**Status:** pending
**Effort:** 0.5 day
**Depends on:** Phase 01 (tokens, header, footer)

---

## Goal

Replace current home with editorial asymmetric hero + featured grid + topic chips + Khai Trí 3-col grid + Newsletter band + iOS app banner. See `docs/redesign-mockup-editorial-sacred-v2.html`.

---

## Files

| File | Change |
|---|---|
| `src/pages/core/HomePage.jsx` | Restructure: hero asymmetric (text+image), featured grid, topic chips, Khai Trí preview, CTA bands |
| `src/styles/home.css` | Rewrite: hero grid 1.05fr/1fr, eyebrow with hairline, fluid type |
| `src/components/shared/HeroAsymmetric.jsx` (new) | Reusable hero text+image |
| `src/components/shared/FeaturedGrid.jsx` (new) | 1.45fr main + 3 side cards |
| `src/components/shared/TopicChips.jsx` (new) | Modern pill filter |
| `src/components/shared/NewsletterBand.jsx` (new) | Dark CTA band with form |
| `src/components/shared/AppBanner.jsx` (new) | iOS app banner with phone mockup |

---

## Layout

```
[ HERO asymmetric: 1.05fr text + 1fr image ]
─────────────────────────────────────────────
[ Section eyebrow + title + link ]
[ Topic chips ]
[ FEATURED GRID: 1.45fr main + 3 side cards ]
─────────────────────────────────────────────
[ Khai Trí section header ]
[ 3-col grid cards ]
─────────────────────────────────────────────
[ NEWSLETTER BAND (dark, gold accent) ]
─────────────────────────────────────────────
[ APP BANNER (cream gradient + phone mockup) ]
```

## Hero structure

```jsx
<section className="hero">
  <div>
    <div className="hero-eyebrow">Bài đọc nổi bật</div>
    <h1>Linh thai —<br/>vệ tinh tâm linh<br/><em>của mỗi người</em></h1>
    <p className="hero-deck">{heroArticle.summary}</p>
    <div className="hero-cta">
      <Link className="btn btn-primary">Đọc bài →</Link>
      <Link className="btn btn-ghost">Khám phá thêm</Link>
    </div>
    <div className="hero-meta">
      <span><strong>{tag}</strong></span>·<span>{date}</span>·<span>{readTime} phút</span>
    </div>
  </div>
  <div className="hero-image"><img src={heroArticle.image} alt=""/></div>
</section>
```

`heroArticle` = first published article sorted by date.

## Topic chips

Replace old `.story-filters` pattern with new modern chips:
- Default: white surface, light border
- Active: solid black bg, cream text
- Each chip shows count badge

## Newsletter band

Dark `--ink` background with `position: absolute` radial gold glow top-right.
Form: rounded pill input + gold button.
Submit → write to Firestore `newsletter_signups/{auto-id}` with email + timestamp.

## App banner

Cream gradient bg, badge "✦ Sắp ra mắt", title with em italic gold, App Store + Google Play buttons (style match Apple's official badge).

---

## Acceptance criteria

- [ ] Hero text+image render asymmetric on desktop, stack on mobile
- [ ] Featured grid: 1.45:1 desktop, 1-col mobile
- [ ] Topic chips work (filter local on Home? or link to /articles?topic=X)
- [ ] Newsletter form submits to Firestore + shows success state
- [ ] App banner renders with phone mockup placeholder (real screenshots later)
- [ ] All sections respect spacing scale + section-gap

## Out of scope

- Real iOS app screenshots (placeholder gradient OK for v1)
- Newsletter integration with Mailchimp/Beehiiv (defer)
