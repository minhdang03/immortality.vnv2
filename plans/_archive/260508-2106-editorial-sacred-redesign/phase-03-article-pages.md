# Phase 03 — Article List + Detail

**Status:** pending
**Effort:** 1 day
**Depends on:** Phase 01 (tokens), Phase 02 (FeaturedGrid component)

---

## Goal

Article LIST: compact 3-col grid with hover lift. Article DETAIL: long-form reader with drop cap, pull quote, breadcrumb, byline, hero image 21:9.

---

## Files

| File | Change |
|---|---|
| `src/pages/content/ArticlesPage.jsx` | Use new `<ArticleGrid>` (3-col desktop, 2-col tablet, 1-col mobile) + topic chips reused from Phase 02 |
| `src/pages/content/ArticleDetail.jsx` | Restructure: breadcrumb → centered head (kicker + title + deck + byline) → hero 21:9 → drop-cap body → pull-quote |
| `src/components/shared/ArticleCard.jsx` | Refine: bigger title, subtler meta, hover translate-Y, image with shadow-md → shadow-lg on hover |
| `src/components/shared/PullQuote.jsx` (new) | `<aside>` with border-top + border-bottom rule, italic gold large |
| `src/components/shared/ArticleBody.jsx` (new) | Body wrapper with drop cap on first p, h2 styling, blockquote rule |
| `src/styles/components/article-card.css` | Already partly done last session — refine |
| `src/styles/components/article-detail.css` | Rewrite: reading width 720px desktop, drop cap CSS, pull quote, h2 spacing |

---

## Article LIST page

```
[ Header: section eyebrow + title + link ]
[ Topic chips ]
[ ARTICLE GRID — 3 col desktop, 2 col tablet, 1 col mobile ]
[ Load more (when count > 12) ]
```

Card structure (kept from last session, refined):
- Image 4:3 with skeleton shimmer + shadow-sm → shadow-md on hover
- Tag pill + date row
- h3 title 1.55rem serif, line-clamp 2
- Summary line-clamp 3
- Footer: read more button + share (no share in list — already removed)

## Article DETAIL page

```
[ Breadcrumb: Trang chủ / Bài viết / Tâm Linh / Linh thai... ]
[ Article HEAD — centered, max-w 720]
  [ Kicker: TÂM LINH · 06.05.2026 · 12 PHÚT ĐỌC ]
  [ H1 mega-serif clamp(2.5rem, 5vw, 4.2rem) with em italic ]
  [ Deck italic serif 1.4rem ]
  [ Byline divider ]
[ HERO image 21:9 full-width ]
[ ARTICLE BODY — max-w 720, serif 1.25rem, line-height 1.8 ]
  [ Drop cap on first paragraph (5.5em, gold-deep) ]
  [ H2 sections inline serif 2.2rem ]
  [ Blockquote with gold border-left ]
  [ Pull quote ─── center italic gold ─── ]
[ Article footer ]
  [ Tags + share buttons (full size 44px) ]
  [ Author byline / publish info ]
[ Related articles (3 cards in row) ]
[ Comments section ]
```

## Drop cap

```css
.article-body > p:first-of-type::first-letter {
  font-family: var(--serif);
  font-weight: 700;
  font-size: 5.5em;
  float: left;
  line-height: 0.85;
  margin: 0.05em 0.12em 0 -0.05em;
  color: var(--gold-deep);
}
```

Skip drop cap on mobile <600px (size 4em max).

## Pull quote

```jsx
<aside className="pull-quote">
  "Đây là phương pháp duy nhất<br/>để không đau bệnh, không ung thư..."
</aside>
```

```css
.pull-quote {
  text-align: center;
  padding: 60px 40px;
  margin: 60px 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  font-family: var(--serif);
  font-size: clamp(1.5rem, 2.5vw, 2.2rem);
  font-style: italic;
  color: var(--gold-deep);
  line-height: 1.3;
}
```

Detect pull quote markers in body via `[!quote]` syntax or admin manual insert.

---

## Acceptance criteria

- [ ] Article list: 3-col desktop, 2-col tablet, 1-col mobile
- [ ] Article detail: reading width 720px capped, drop cap renders correctly
- [ ] Pull quote renders when body has marker
- [ ] Breadcrumb 4 levels (home / list / topic / current)
- [ ] Hero 21:9 with skeleton on lazy load
- [ ] Mobile: drop cap reduced to 4em, font scales down

## Out of scope

- Inline annotations / footnotes
- Reading-position tracker (already exists via ReadingProgress)
- Audio narration
