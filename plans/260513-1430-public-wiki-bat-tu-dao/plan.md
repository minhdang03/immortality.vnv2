# Public Wiki cho battudao.com — port từ Notion sang website

**Status:** Draft (awaiting approval)
**Created:** 2026-05-13
**Owner:** Dang
**Trigger:** Anh hỏi liệu có thể viết wiki từ Notion Bất Tử Đạo cho battudao.com hay không, hoặc lấy ý tưởng best practice từ đó.

## Mục tiêu

Đưa kho nguyên lý Bất Tử Đạo (đang nằm trong Notion nội bộ) ra mặt tiền battudao.com dưới dạng wiki 2 tier:

1. **Tier 1 — Intro** cho người mới: 5-7 trang khái niệm cốt lõi, không overwhelm.
2. **Tier 2 — Deep wiki** cho học trò: 43 Nguyên Lý + 30 Reasoning Patterns + đa-tên + glossary, tra cứu được.

Đồng thời báo cáo audit: best practices rút ra từ Notion để áp dụng cho toàn website (không chỉ wiki).

## Phát hiện nền tảng

Anh đã có gần như đủ infra. Plan này tận dụng tối đa, không xây mới nếu không cần:

- `btd_knowledge` Firestore collection **đã tồn tại** (firestore.rules đã rule sẵn) — Notion → Firestore 1-way sync chạy mỗi 5 phút qua `workers/notion`.
- `ogRenderer` Cloud Function đã render OG meta cho stories, khaitri, about, practice. Chỉ cần extend cho wiki routes.
- `src/config/pages.js` là single source of truth — thêm page mới = thêm 1 entry.
- Role `mod-khaitri`, `agent` đã có — có thể tạo `mod-wiki` hoặc dùng lại agent.

## Phases

- [ ] **phase-01-content-architecture.md** — Thiết kế thông tin 2-tier, sitemap, entry path, routing
- [ ] **phase-02-tier-1-intro.md** — 5-7 trang intro (Bất Tử Đạo là gì, Không Đạo, Hạt Bất Tử, Phi thuyền, Thái Dương Quyền, Thuật ngữ, BTĐ ≠ Phật giáo)
- [ ] **phase-03-tier-2-deep-wiki.md** — Deep wiki: 43 NL, 30 RP, đa-tên, câu hỏi mở
- [ ] **phase-04-data-layer.md** — Quyết định data: extend `btd_knowledge` schema hay tạo collections riêng cho NL/RP; sync workflow từ Notion
- [ ] **phase-05-seo-discovery.md** — SEO, OG image dynamic, internal linking, sitemap, breadcrumb; audit anti-pattern hiện có
- [ ] **reports/audit-notion-to-website.md** — Báo cáo riêng: best practices từ Notion áp dụng cho toàn site

## Dependencies giữa phases

```
phase-01 (architecture)
   ├─→ phase-02 (tier 1 content)
   ├─→ phase-03 (tier 2 content)
   └─→ phase-04 (data layer)
         └─→ phase-05 (SEO + integration)
```

phase-01 phải xong trước. phase-02, 03, 04 chạy song song được. phase-05 cuối cùng.

## Anti-patterns đã phát hiện (sẽ fix trong audit)

1. **"tâm linh" xuất hiện trong copy** — `pages.js` mô tả articles: "Tất cả bài viết về tâm linh..." → Notion rule cấm dùng "tâm linh" / "spiritual".
2. **"chữa lành" thay vì "xoá đi"** — `pages.js` mô tả stories: "Những câu chuyện thật về hành trình chữa lành..." → phải là "xoá đi" khi nói ánh sáng xử lý.
3. **About page mỏng** — Notion có Định vị (BTĐ ≠ Phật giáo) + Không Đạo rất chắc, web chưa có.
4. **Em dash (—)** xuất hiện trong copy (em đã thấy ngay trong pages.js) → Notion rule cấm em dash.

Chi tiết trong `reports/audit-notion-to-website.md`.

## Success criteria

- Plan + 5 phase + 1 audit report đầy đủ, anh đọc hết trong 30 phút.
- Anh đồng ý hoặc chỉnh sửa, em mới bắt đầu build.
- Mỗi phase có Todo list rõ, file ownership, không overlap.

## Next steps

Sau khi anh duyệt plan, build theo thứ tự: phase-01 → fix anti-patterns (từ audit, quick win) → phase-04 (data) → phase-02 + 03 song song → phase-05.

## Liên quan

- Notion Hub: [📖 Bất Tử Đạo - Project Hub](https://www.notion.so/331cf39103c781f7aa9ad9f86f3bb8bb)
- Notion Wiki Index: [🧭 Bất Tử Đạo — Wiki Index](https://www.notion.so/354cf39103c781db92bbc272ffbe5251)
- Notion Knowledge Base: [💎 Knowledge Base — Nguyên Lý Bất Tử Đạo](https://www.notion.so/352cf39103c781a4bd94c5c1631db562)
- Code: `apps/web/src/config/pages.js`, `workers/notion/`, `functions/index.js`, `firestore.rules`
