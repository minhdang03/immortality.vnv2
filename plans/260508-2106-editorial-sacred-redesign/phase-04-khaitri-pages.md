# Phase 04 — Khai Trí List + Detail

**Status:** pending
**Effort:** 0.5 day
**Depends on:** Phase 01, Phase 03 (ArticleCard pattern)

---

## Goal

Khai Trí list as compact archive with question-as-title pattern. Khai Trí DETAIL with Q-A card pairs (Q filled gold-tint, A clean), centered like article detail.

---

## Files

| File | Change |
|---|---|
| `src/pages/content/KhaiTriPage.jsx` | Already restructured for deep-link last session; only refine wrapper to use `.section` |
| `src/components/khaitri/KhaiTriList.jsx` | Replace current list with editorial archive — number + question title + summary, hover translate |
| `src/components/khaitri/KhaiTriDetail.jsx` | Centered head (kicker "Câu hỏi 05" + title + deck), then Q-A pairs with new component |
| `src/components/shared/QAPair.jsx` (new) | Q (filled gold-tint, border-left gold) + A (clean) |
| `src/styles/pages/khaitri.css` | Rewrite Q-A styling per mockup |

---

## List page

```
[ Header: eyebrow "Hỏi đáp" + title "Khai Trí" + count link ]
[ Search box (existing) ]
[ Topic chips for tags ]
[ ARCHIVE — vertical list, hover translate +4px ]
  Each row:
    01 · Câu hỏi: "Vì sao ngồi thiền kiết già..."  [03.05.2026 · 5 phút]
    02 · Câu hỏi: "Cốt sống thư lỏng..."           [03.05.2026 · 6 phút]
```

Numeric leading (01, 02) — dùng `var(--gold)` opacity 0.4, font display 1.4rem.

## Detail page

```
[ Breadcrumb: Trang chủ / Khai Trí / [title] ]
[ HEAD centered max-w 720 ]
  [ Kicker: KHAI TRÍ · CÂU HỎI 05 · 03.05.2026 ]
  [ H1 serif clamp() with em italic ]
  [ Deck italic optional ]
[ Q&A pairs (max-w 720) ]
  [ Q card filled gold-tint, border-left 3px gold, label "— HỎI" uppercase 2px tracking ]
  [ A card clean (no bg), label "— ĐÁP" muted ]
  [ Multiple pairs separated by 48px ]
[ Tags + share + footer ]
[ Related Q&As (3 cards) ]
```

## QAPair component

```jsx
<div className="qa-pair">
  <div className="qa-q">
    <span className="qa-label qa-label-q">— Hỏi</span>
    <p>{question}</p>
  </div>
  <div className="qa-a">
    <span className="qa-label qa-label-a">— Đáp</span>
    <ParagraphedText text={answer} />
  </div>
</div>
```

Body parser: split on `Hỏi:` / `Đáp:` / `Question:` / `Answer:` markers, group into Q-A pairs.

---

## Acceptance criteria

- [ ] List shows numeric leading + title + meta in archive style
- [ ] Detail centered head, Q card filled, A card clean, label kicker styled
- [ ] Body parser correctly splits Q/Đ markers into card pairs
- [ ] Bilingual: same parser works for English Question/Answer
- [ ] Mobile: Q-A cards stack with reduced padding 18px, label text smaller

## Out of scope

- Side-by-side Q/A on desktop (defer — vertical scroll is more readable for long answers)
- Audio version of Q&A
