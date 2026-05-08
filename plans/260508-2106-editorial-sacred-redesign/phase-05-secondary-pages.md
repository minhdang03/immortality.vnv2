# Phase 05 — Secondary Pages

**Status:** pending
**Effort:** 1 day
**Depends on:** Phase 01 (tokens, header), Phase 03 (PullQuote, ArticleBody patterns)

---

## Goal

Unify all secondary pages under same wrapper + section pattern. Eliminate the 6 different page wrappers (`stories-page`, `about-page`, `practice-page`, `khaitri-page`, `ungho-page`, plain `section`) — use one shared `<PageShell>` + `<PageHeader>` component.

---

## Files

| File | Change |
|---|---|
| `src/components/shared/PageShell.jsx` (new) | Common wrapper: `<section className="page page-{name}">` |
| `src/components/shared/PageHeader.jsx` (new) | Common header: kicker + title + deck (consistent h1 vs h2 hierarchy) |
| `src/components/stories/StoryList.jsx` | Use PageShell + PageHeader, archive style like Khai Trí list |
| `src/components/stories/StoryDetail.jsx` | Long-form like ArticleDetail (drop cap, hero image) |
| `src/pages/info/AboutPage.jsx` | PageShell + sections styled like editorial; 2-col grid for items on tablet+, 3-col desktop |
| `src/pages/info/PracticePage.jsx` | PageShell + practice moves grid (2-col tablet, 3-col desktop) |
| `src/pages/info/ContactPage.jsx` | PageShell + form max-w 640px center, Apple HIG inputs |
| `src/pages/info/UngHoPage.jsx` | PageShell + donation channels card grid |
| `src/pages/core/SearchPage.jsx` | PageShell + big search input + result grid (reuse ArticleCard) |
| `src/pages/content/TopicPage.jsx` | PageShell + topic header + filtered ArticleGrid |
| `src/styles/pages/about.css` | Strip page-specific wrappers, keep section content rules only |
| `src/styles/pages/practice.css` | Same |
| `src/styles/pages/search-contact.css` | Same |
| `src/styles/pages/ungho.css` | Same |
| `src/styles/pages/stories.css` | Same |

---

## Shared `PageHeader` component

```jsx
<PageHeader
  kicker="Giới thiệu"
  title="Bất Tử Đạo"
  titleEm="con đường chữa lành"
  deck="Khám phá ánh sáng bên trong bạn..."
  level={1}
/>
```

Renders:
```html
<header className="page-header">
  <div className="page-eyebrow">— Giới thiệu</div>
  <h1 className="page-title">Bất Tử Đạo <em>con đường chữa lành</em></h1>
  <p className="page-deck">Khám phá ánh sáng...</p>
</header>
```

Always `<h1>` for page title (one per page). Section titles within page use `<h2>`. Subsections `<h3>`.

## Wrapper unification

Remove these classes from JSX/CSS:
- `.stories-page`
- `.about-page`
- `.practice-page`
- `.khaitri-page`
- `.ungho-page`

Replace with: `<section className="page page-{slug}">` shell. Page-specific styles use `.page-{slug}` modifier when needed.

## About page sections

```
[ PageHeader ]
[ About-section grid: 2-col tablet, 3-col desktop ]
  Each section:
    [ Number + Title ]
    [ Body paragraphs serif ]
    [ Optional list 2-col ]
[ Pull quote (reuse Phase 03 component) ]
[ CTA: "Tìm hiểu thêm" → /practice ]
```

## Practice page

```
[ PageHeader ]
[ Practice intro card serif body ]
[ Practice moves: 2-col tablet, 3-col desktop, 4-col ultrawide ]
  Each move card:
    [ Big numeric (01, 02...) gold opacity 0.3 ]
    [ Move title serif ]
    [ Description italic ]
```

## Contact page

```
[ PageHeader ]
[ Contact form max-w 640 center ]
  - Email input ≥48px height
  - Textarea ≥220px desktop
  - Submit button gold gradient
[ Alt contact methods (Telegram, Facebook) below ]
```

## Search page

```
[ PageHeader ]
[ Big search input 18px padding desktop ]
[ Filter chips (topic) ]
[ ARTICLE GRID showing matched results ]
[ Empty state: sun icon + "Không tìm thấy" + suggestion CTA ]
```

## Topic page

```
[ Breadcrumb ]
[ PageHeader: kicker "Chủ đề" + topic name + description ]
[ ARTICLE GRID filtered by topic ]
[ Optional: related topics chips below ]
```

## Ungho page

```
[ PageHeader ]
[ Donation reasons grid 2-col tablet, 3-col desktop ]
[ Donation channels: card grid with each method (bank, momo, etc.) ]
[ Donation form ]
[ Wall of supporters (existing pending approval flow) ]
```

---

## Acceptance criteria

- [ ] All 7 secondary pages use PageShell + PageHeader (no custom wrappers)
- [ ] H1 = page title (one per page), H2 = sections, H3 = subsections
- [ ] All wrappers removed from CSS files (no `.about-page`, `.stories-page`, etc.)
- [ ] Search/Contact/Practice/About all responsive 1/2/3/4-col grids per breakpoint
- [ ] Contact form input ≥48px height (touch friendly)
- [ ] Empty states: sun icon + helpful message + CTA

## Out of scope

- Search relevance scoring (defer)
- Donation payment integration (existing channels only)
- Story interactive timeline (defer)
