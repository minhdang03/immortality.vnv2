# Phase 03 — Tier 2: Deep Wiki (NL / RP / Đa-tên / Câu hỏi mở)

## Context Links

- Notion: [🧭 Wiki Index](https://www.notion.so/354cf39103c781db92bbc272ffbe5251) — cấu trúc gốc
- Notion: [💎 Knowledge Base — Nguyên Lý](https://www.notion.so/352cf39103c781a4bd94c5c1631db562)
- Notion DB Nguyên Lý: collection://e9c676cb-02f3-4ff1-84db-3c9b714715ac
- Notion DB Reasoning Patterns: collection://8db5873a-2039-4533-81cf-3492ccc2061f
- Notion DB Raw Materials: collection://b663b13c-17fa-4317-a422-25248c1938af

## Overview

**Priority:** P2 (sau phase-01, song song với phase-02)
**Current status:** Draft
**Brief:** Port 3 DB Notion (Raw, NL, RP) ra public dạng tra cứu. Mục tiêu: học trò mở `/wiki/nguyen-ly/NL-018` đọc được trọn nội dung như đọc Notion, nhưng UX web phù hợp (filter, search, cross-ref).

## Key Insights

- Notion có 43 NL chia 3 cụm: Cụm 1 (NL-001 → NL-015 từ bat-tu-dao.md draft), Cụm 2 (NL-016 → NL-030 từ chat cũ Fly), Cụm 3 (NL-031 → NL-040 từ BTD-001 — đã CHỐT). Phải giữ phân cụm vì mỗi cụm có level chốt khác nhau.
- Có **30 RP** với 2 FOUNDATION đã chốt (RP-26 "Phóng ra trước", RP-29 "Không chấp dính ngôn ngữ"). FOUNDATION phải xuất hiện đầu tiên trên list RP.
- Trạng thái mỗi NL: "ĐANG CHƯNG" / "CHỐT" / "DRAFT". Tier 2 chỉ public "CHỐT" và "ĐANG CHƯNG"; KHÔNG public "DRAFT".
- Đa-tên cho trạng thái cuối (vô nhiễm sắc thể / Người Opal Kim Cương Bất Tử / Linh thai Kim Cương / Tánh không tự tại / Linh không / Ánh sáng vô nhiễm / Bất Tử / Kim cương bất hoại) — phải giữ TẤT CẢ, không quy về 1 (theo RP-29).
- Có 11 câu hỏi mở chờ anh dạy thêm — list public để học trò biết "chưa chốt", không tự suy diễn.

## Requirements

### Functional

- 4 entry tier 2: `/wiki/nguyen-ly`, `/wiki/reasoning-patterns`, `/wiki/da-ten`, `/wiki/cau-hoi-mo`.
- List view + detail view cho NL và RP.
- Filter NL: theo Cụm, theo Trạng thái, theo Module áp dụng, theo Tier áp dụng.
- Filter RP: FOUNDATION trước, sau đó theo Tầm quan trọng.
- Mỗi NL detail: phát biểu ngắn / cách reasoning / Tầng 1 / Neo khoa học / áp dụng + cross-ref NL liên quan + nguồn BTD.
- Mỗi RP detail: phát biểu / khi nào dùng / ví dụ từ NL / FOUNDATION flag.
- Đa-tên page: list 8 tên + giải thích tại sao giữ đa-tên (link sang RP-29).
- Câu hỏi mở page: 11 câu hỏi, mỗi câu hỏi có "Đang chờ Anh chốt" badge.

### Non-functional

- Load < 1.5s với list 43 items (lazy paginate hoặc client-side filter).
- URL ổn định: `/wiki/nguyen-ly/NL-018` (theo Mã NL, không theo slug để tránh đổi name).
- Notion sync: page Notion đổi → web tự update trong 5 phút (cron đã có sẵn).
- Mobile: detail view không tràn ngang.

## Architecture

### Data flow

```
Notion DB Nguyên Lý
   │
   │  workers/notion (đã có) — extend để sync thêm DB này
   │  cron 5 min
   ▼
Firestore: wiki_nguyen_ly (mới) hoặc btd_knowledge với type filter
   │
   │  Firestore client SDK (web app)
   ▼
Web /wiki/nguyen-ly/* — lazy load, filter client-side
```

Chi tiết schema + sync ở phase-04.

### URL patterns

- `/wiki/nguyen-ly` → list view với filter sidebar
- `/wiki/nguyen-ly/cum-1` → list view filter sẵn cụm 1
- `/wiki/nguyen-ly/NL-018` → detail
- `/wiki/reasoning-patterns` → list, FOUNDATION group lên đầu
- `/wiki/reasoning-patterns/RP-26` → detail
- `/wiki/da-ten` → static page (8 tên + RP-29 link)
- `/wiki/cau-hoi-mo` → list 11 câu hỏi

### Component tree

```
WikiNguyenLyList
  ├── FilterSidebar (cụm / trạng thái / module / tier)
  ├── NguyenLyCard (mã + phát biểu ngắn + trạng thái badge)
  └── Pagination (12/page)

WikiNguyenLyDetail
  ├── Breadcrumb (Wiki / Nguyên Lý / NL-018)
  ├── Header (mã + tên + trạng thái badge)
  ├── Section: Phát biểu ngắn
  ├── Section: Cách reasoning (link sang RP)
  ├── Section: Tầng 1 — Cơ chế gốc
  ├── Section: Neo khoa học
  ├── Section: Áp dụng (Module: Fly, 37 stories...)
  ├── Cross-references (NL liên quan)
  └── Footer: nguồn BTD-XXX raw

WikiRpList (giống NguyenLyList nhưng FOUNDATION lên đầu)
WikiRpDetail (giống NguyenLyDetail nhưng layout khác)
```

## Related Code Files

**Modify:**
- `functions/index.js` — OG cho `/wiki/nguyen-ly/:id`, `/wiki/reasoning-patterns/:id`
- `firestore.rules` — thêm rule cho `wiki_nguyen_ly`, `wiki_reasoning_patterns` (public read trừ DRAFT)

**Create:**
- `apps/web/src/pages/wiki/NguyenLyList.jsx`
- `apps/web/src/pages/wiki/NguyenLyDetail.jsx`
- `apps/web/src/pages/wiki/RpList.jsx`
- `apps/web/src/pages/wiki/RpDetail.jsx`
- `apps/web/src/pages/wiki/DaTen.jsx` (static content)
- `apps/web/src/pages/wiki/CauHoiMo.jsx`
- `apps/web/src/components/wiki/FilterSidebar.jsx`
- `apps/web/src/components/wiki/NguyenLyCard.jsx`
- `apps/web/src/hooks/use-wiki-nguyen-ly.js` (Firestore query hook)
- `apps/web/src/hooks/use-wiki-rp.js`

## Implementation Steps

1. Confirm data source ở phase-04 trước (Firestore collection name + schema).
2. Tạo Firestore index cho `wiki_nguyen_ly`: composite (cụm, mã), (trạng thái, mã), (tier, mã).
3. Tạo `useWikiNguyenLy()` hook: fetch tất cả 43 NL 1 lần, cache 5 phút (Notion sync 5 min).
4. Build list page với client-side filter (43 items đủ ít để filter client-side, không cần server query).
5. Build detail page; nhận `:id` từ URL → match `data.code === id`.
6. Render markdown (bodyMarkdown từ Notion) qua `react-markdown` + custom components cho cross-ref link.
7. Cross-ref: khi gặp "NL-018" trong body → tự link sang `/wiki/nguyen-ly/NL-018`.
8. Tương tự cho RP.
9. Static page `da-ten` và `cau-hoi-mo` — content hard-code (ít thay đổi).
10. OG dynamic: ogRenderer fetch Firestore `wiki_nguyen_ly` theo id, render title "NL-018: Không Đạo — Cốt lõi BTĐ".

## Todo List

- [ ] Phase-04 chốt schema xong
- [ ] Tạo Firestore indexes
- [ ] Hook `useWikiNguyenLy()`, `useWikiRp()`
- [ ] Component FilterSidebar
- [ ] Component NguyenLyCard
- [ ] Page NguyenLyList với filter
- [ ] Page NguyenLyDetail với cross-ref
- [ ] Page RpList với FOUNDATION ưu tiên
- [ ] Page RpDetail
- [ ] Page DaTen (static)
- [ ] Page CauHoiMo (static + admin có thể edit)
- [ ] OG dynamic cho NL/RP detail
- [ ] Test cross-ref link giữa NL ↔ RP ↔ Raw Materials
- [ ] Test filter trên mobile

## Success Criteria

- `/wiki/nguyen-ly` list 43 NL (hoặc chỉ "CHỐT" + "ĐANG CHƯNG" — chốt với anh).
- Filter theo cụm: bấm "Cụm 1" → ra 15 NL.
- `/wiki/nguyen-ly/NL-018` render đủ 6 section của Notion.
- `/wiki/reasoning-patterns` FOUNDATION (RP-26, RP-29) ở đầu, đánh dấu rõ.
- Cross-ref click được, navigate đúng.
- Notion edit "NL-018" → 5 phút sau web cập nhật.

## Risk Assessment

- **Risk:** load 43 NL 1 lần làm chậm. **Mitigation:** chỉ 43 items, mỗi item ~2KB → 86KB total, OK. Nếu thành 100+ thì paginate.
- **Risk:** content Notion có nội dung "Áp dụng Fly" — không nên public lên battudao.com. **Mitigation:** field `áp dụng` filter theo "Module" — chỉ render module liên quan đến BTĐ, không render Fly-only.
- **Risk:** anh không muốn public 100% nội dung Notion (có thông tin nội bộ). **Mitigation:** thêm field `publicOnWeb: bool` trong Notion DB — chỉ sync field này = true.
- **Risk:** thuật ngữ Notion thay đổi (em dash, "tâm linh" lọt vào). **Mitigation:** sync worker chạy validator: detect em dash + "tâm linh" → flag vào `btd_ai_flags` để admin review trước khi publish.

## Security Considerations

- `firestore.rules` thêm:
  ```
  match /wiki_nguyen_ly/{id} {
    allow read: if resource.data.status in ['CHỐT', 'ĐANG CHƯNG'] && resource.data.publicOnWeb == true;
    allow write: if false; // chỉ Notion sync Worker
  }
  match /wiki_reasoning_patterns/{id} { ... tương tự ... }
  ```
- DRAFT NL không bao giờ render lên web.

## Next Steps

- phase-04 chốt schema để phase-03 bắt đầu được.
- Sau phase-03 xong, phase-05 lo SEO + internal linking từ stories/khaitri → wiki concepts.
