# Phase 01 — Content Architecture & 2-Tier IA

## Context Links

- Notion Wiki Index (internal): https://www.notion.so/354cf39103c781db92bbc272ffbe5251
- Notion Knowledge Base: https://www.notion.so/352cf39103c781a4bd94c5c1631db562
- Current routing: `apps/web/src/config/pages.js`, `src/App.jsx`
- OG infra: `functions/index.js` (ogRenderer)

## Overview

**Priority:** P0 (gốc của plan)
**Current status:** Draft
**Brief:** Thiết kế thông tin 2 tier cho `/wiki/*`. Tier 1 entry-level cho người mới. Tier 2 deep cho học trò. Mục tiêu: không bị overwhelm bởi 43 NL, vẫn cho học trò tra cứu đủ sâu.

## Key Insights

- Notion wiki nội bộ đã có cấu trúc 3 DB (Raw Materials, Nguyên Lý, Reasoning Patterns) + 2 FOUNDATION (RP-26 "Phóng ra trước", RP-29 "Không chấp dính ngôn ngữ"). Không cần phát minh lại — port sang public.
- Anh đã chốt: "không tâm linh", "không em dash", "duyên ma" thay "viên ma", "xoá đi" thay "chữa lành". IA phải bake các quy tắc này vào.
- Web hiện tại có `about` page nhưng nội dung mỏng. Wiki sẽ là phần đào sâu cho `about`, hoặc thay luôn `about` bằng wiki landing.
- RP-29 dạy đa-tên là feature: 1 trạng thái có 8 tên (vô nhiễm sắc thể, Người Opal Kim Cương Bất Tử, Linh thai Kim Cương, Tánh không tự tại, Linh không, Ánh sáng vô nhiễm, Bất Tử, Kim cương bất hoại). Wiki phải giữ đa-tên, không quy về 1.

## Requirements

### Functional

- 2 tier rõ rệt, mỗi tier có entry path riêng.
- Search trong wiki (dùng lại search hiện tại của site hoặc thêm filter `type=wiki`).
- Cross-link tier 1 ↔ tier 2 (đọc intro xong có thể nhảy vào NL chi tiết).
- Internal link từ articles/stories/khaitri → wiki concept khi nhắc đến thuật ngữ.
- Song ngữ VI/EN cho tier 1 (bắt buộc). Tier 2 chỉ VI ở phase đầu (NL/RP Notion chưa dịch).

### Non-functional

- Lazy-load: tier 2 không kéo nặng nếu user chỉ ở tier 1.
- SEO: mỗi page wiki có OG meta riêng (qua ogRenderer Cloud Function).
- Mobile-first: tier 1 ưu tiên đọc trên điện thoại; tier 2 cho phép view table/list rộng.
- A11y: heading hierarchy đúng, không dùng `<h1>` cho nav.

## Architecture

### Sitemap

```
/wiki                         ← Landing (tier 1 entry — chọn đường đọc)
├── /wiki/bat-tu-dao-la-gi   ← Tier 1: nhập môn (đọc 5 phút)
├── /wiki/khong-dao           ← Tier 1: cốt lõi
├── /wiki/hat-bat-tu          ← Tier 1: khái niệm gốc
├── /wiki/phi-thuyen          ← Tier 1: hiện tượng phi thuyền
├── /wiki/thai-duong-quyen    ← Tier 1: võ mặt trời (link sang /practice)
├── /wiki/btd-khac-phat-giao  ← Tier 1: định vị
├── /wiki/thuat-ngu           ← Tier 1: glossary cho người mới
│
├── /wiki/nguyen-ly                       ← Tier 2 entry: 43 NL
│   ├── /wiki/nguyen-ly/cum-1            ← View by cụm
│   ├── /wiki/nguyen-ly/cum-2
│   ├── /wiki/nguyen-ly/cum-3
│   └── /wiki/nguyen-ly/NL-018           ← Detail page mỗi NL
│
├── /wiki/reasoning-patterns              ← Tier 2: 30 RP, foundation lên đầu
│   └── /wiki/reasoning-patterns/RP-26
│
├── /wiki/da-ten                          ← Tier 2: đa-tên trạng thái cuối
└── /wiki/cau-hoi-mo                      ← Tier 2: 11 câu hỏi còn mở
```

### Routing

Thêm vào `apps/web/src/config/pages.js`:

```js
{
  id: 'wiki',
  path: 'wiki',
  aliases: ['wiki/'],
  labelVi: 'Wiki', labelEn: 'Wiki',
  titleVi: 'Wiki Bất Tử Đạo', titleEn: 'Immortality Wiki',
  descVi: 'Kho nguyên lý gốc — Không Đạo, Hạt Bất Tử, Phi thuyền, Thái Dương Quyền, 43 nguyên lý.',
  descEn: 'Original principles — Không Đạo, Immortal Particle, Soul flight, Solar Fist, 43 principles.',
  icon: '📚',
  navDefault: { visible: true, showInBottom: false },
  adminTab: { vi: 'Wiki', en: 'Wiki' },
  homeCard: { icon: 'book-open', descVi: 'Tra cứu nguyên lý và thuật ngữ Bất Tử Đạo', descEn: 'Look up principles and terminology' },
}
```

Sub-routes (`wiki/:slug`, `wiki/nguyen-ly/:id`, `wiki/reasoning-patterns/:id`) xử lý trong App.jsx route matcher — pattern giống `article/:slug`.

### Entry path — 2 cửa vào khác nhau

**Cửa người mới:** Home → "Wiki" card → `/wiki` landing → 7 thẻ tier 1 (Bất Tử Đạo là gì, Không Đạo, Hạt Bất Tử...) → đọc → đến cuối có "Muốn đào sâu? → /wiki/nguyen-ly".

**Cửa học trò:** Top nav → "Wiki" → click vào "43 Nguyên Lý" hoặc "Reasoning Patterns" → vào thẳng tier 2.

Cùng 1 landing page, nhưng tier 2 được expand từ accordion "Cho học trò đang đi sâu" (mặc định collapsed để không doạ người mới).

### Liên kết với pages cũ

- `/about` → giữ nguyên nhưng thêm "Đọc tiếp về Bất Tử Đạo →" link sang `/wiki/bat-tu-dao-la-gi`.
- `/practice` (Thái Dương Quyền) → backlink "Nguyên lý nền tảng →" link sang `/wiki/thai-duong-quyen`.
- `/stories/*` → khi nội dung nhắc "Hạt Bất Tử", "Không Đạo", "Phi thuyền" → link sang wiki concept tương ứng (component `<WikiLink concept="hat-bat-tu" />`).
- `/khaitri/*` → tương tự.

## Related Code Files

**Sẽ modify:**
- `apps/web/src/config/pages.js` — thêm entry `wiki`
- `apps/web/src/App.jsx` — route matcher cho wiki sub-routes
- `apps/web/src/components/Home/HomeCards.jsx` (hoặc tương đương) — thêm wiki card
- `functions/index.js` — extend `PAGE_OG` cho `wiki`; add slug-based OG cho `/wiki/:slug`
- `firebase.json` — extend rewrite cho `/wiki/**`

**Sẽ tạo:**
- `apps/web/src/pages/WikiLanding.jsx` — landing tier 1
- `apps/web/src/pages/WikiConcept.jsx` — render tier 1 page
- `apps/web/src/pages/WikiNguyenLyList.jsx` — list 43 NL
- `apps/web/src/pages/WikiNguyenLyDetail.jsx` — detail NL
- `apps/web/src/pages/WikiRpList.jsx`, `WikiRpDetail.jsx`
- `apps/web/src/pages/WikiGlossary.jsx` — thuật ngữ
- `apps/web/src/components/WikiLink.jsx` — inline link `<WikiLink concept="hat-bat-tu">Hạt Bất Tử</WikiLink>`

**Không touch:** `apps/mobile/` — phase này chỉ web. Mobile dùng WebView nên auto thừa hưởng.

## Implementation Steps

1. Cập nhật `pages.js` thêm entry `wiki` (cấu hình ở trên).
2. Cập nhật `App.jsx` route matcher: nhận diện `/wiki`, `/wiki/:slug`, `/wiki/nguyen-ly`, `/wiki/nguyen-ly/:id`, `/wiki/reasoning-patterns`, `/wiki/reasoning-patterns/:id`, `/wiki/da-ten`, `/wiki/cau-hoi-mo`, `/wiki/thuat-ngu`.
3. Tạo skeleton component cho mỗi route mới (chưa cần content thật).
4. Cập nhật `firebase.json` rewrite để `/wiki/**` cũng đi qua ogRenderer.
5. Cập nhật `functions/index.js`: handle `/wiki/:slug` — fetch từ Firestore (collection sẽ chốt ở phase-04), render OG. Mặc định fallback OG cho `/wiki` landing.
6. Thêm `WikiLink` component dùng được trong mọi article/story/khaitri.
7. Test routing: 3 cửa vào (direct URL, từ home card, từ search) đều resolve đúng.

## Todo List

- [ ] Thêm entry `wiki` vào `pages.js`
- [ ] Update `matchRoute()` xử lý sub-routes `/wiki/*`
- [ ] Tạo 8 skeleton page (Wiki*.jsx)
- [ ] Cập nhật `firebase.json` rewrite
- [ ] Update `ogRenderer` handle `/wiki/:slug` từ Firestore
- [ ] Thêm wiki home card vào HomeCards
- [ ] Thêm `WikiLink` component
- [ ] Test routing trên `pnpm run dev`

## Success Criteria

- Truy cập `/wiki` ra landing có 7 thẻ tier 1 + accordion tier 2.
- Truy cập `/wiki/khong-dao` ra page tier 1 (kể cả khi content chưa có — fallback "Coming soon").
- Truy cập `/wiki/nguyen-ly` ra danh sách (kể cả mock data).
- Crawler nhận đúng OG meta cho mọi route wiki.
- Không có regression: stories/khaitri/about routing vẫn chạy.

## Risk Assessment

- **Risk:** thêm 8+ page làm bundle to. **Mitigation:** lazy-load tất cả wiki page qua `React.lazy()` + `Suspense`.
- **Risk:** OG fallback render sai khi slug không tồn tại. **Mitigation:** ogRenderer fallback về meta của `/wiki` landing nếu slug không match.
- **Risk:** thuật ngữ giữa code comment và content lệch. **Mitigation:** content lấy từ Firestore (sync từ Notion), không hard-code; code comment dùng tiếng Anh trung tính.

## Security Considerations

- Wiki collections public-read (giống stories, khaitri, articles). Write: server-only qua Notion sync Worker (giống `btd_knowledge` hiện tại).
- Không có user-generated content trong wiki ở phase đầu → không cần input sanitization.

## Next Steps

phase-02 (Tier 1 content), phase-03 (Tier 2 content), phase-04 (Data layer) bắt đầu sau khi anh duyệt IA này. phase-04 đặc biệt phụ thuộc quyết định ở phase-01 về Firestore schema (`wiki_concepts`, `wiki_nguyen_ly`, `wiki_reasoning_patterns` hay extend `btd_knowledge`).
