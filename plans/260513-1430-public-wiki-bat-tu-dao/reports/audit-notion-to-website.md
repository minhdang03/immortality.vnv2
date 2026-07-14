# Audit Report: Notion Bất Tử Đạo → Website battudao.com

**Date:** 2026-05-13
**Scope:** So sánh kho Notion BTĐ với website hiện tại (`apps/web`) để tìm anti-pattern, content gap, và best practice áp dụng được.
**Status:** Findings + recommendations. Không phải plan triển khai (xem `plans/260513-1430-public-wiki-bat-tu-dao/`).

## TL;DR

5 phát hiện chính, sắp xếp theo độ ưu tiên fix:

1. **Vi phạm terminology rule** trong code copy (P0 quick win). Notion cấm "tâm linh", "chữa lành" trong context ánh sáng, "—" em-dash. Website hiện đang vi phạm cả 3.
2. **Notion có 43 NL + 30 RP + 2 FOUNDATION** chưa surface ra public. Đây là IP quý nhất, đang nằm im trong Notion nội bộ.
3. **About page mỏng** so với chiều sâu Notion. Định vị "BTĐ ≠ Phật giáo" + "Không Đạo" là khác biệt cốt lõi nhưng website không nêu rõ.
4. **Stories 1-24 published nhưng KHÔNG link sang khái niệm**. Người đọc gặp "Hạt Bất Tử", "Phi thuyền" lần đầu không có chỗ tra cứu.
5. **Anti-Buddhist UX chưa đủ mạnh** ở chỗ copy: vẫn còn "tu luyện", "tâm linh" — tone Phật giáo lọt vào.

## 1. Anti-pattern terminology (P0)

### 1a. "tâm linh" — 2 files

```
apps/web/src/config/pages.js:19      'Tất cả bài viết về tâm linh...'
apps/web/src/components/shared/AppBanner.jsx
```

**Notion rule** (memory `project_bat_tu_dao.md`):
> KHÔNG dùng "tâm linh", "spiritual"

**Fix:** Thay bằng "Khai Trí", "Đối thoại sâu", "Nguyên lý Bất Tử Đạo", hoặc "trí tuệ vũ trụ".

### 1b. "chữa lành" — 6 files

```
apps/web/src/config/pages.js:30                          stories desc
apps/web/src/pages/info/PracticePage.jsx
apps/web/src/pages/info/AboutPage.jsx
apps/web/src/data/translations.js
apps/web/src/data/articles.js
apps/web/src/components/stories/StoryList.jsx
```

**Notion rule:**
> Dùng "xoá đi" thay "chữa lành" khi nói ánh sáng xử lý gốc rễ

**Fix:** Audit từng chỗ. Nếu context là **ánh sáng xử lý** (xoá ma, xoá bệnh từ gốc) → "xoá đi". Nếu context là **kết quả hồi phục** (bệnh nhân hồi phục) → "hồi phục" / "khoẻ lại". KHÔNG mặc định replace-all.

### 1c. Em-dash "—" — 190 occurrences trong 51 files

**Notion rule:**
> KHÔNG dùng em dash (—)

Em chưa rà cụ thể từng chỗ — sẽ có cái là em dash trong comment code (OK giữ), có cái trong user-facing string (phải fix). Cần xếp tay vì 190 chỗ.

**Fix strategy:**
- rg `—` chỉ trong `*.jsx` strings + `data/*.js` + `pages.js` desc fields.
- Skip code comments (`//`, `/*`).
- Thay bằng `:` hoặc xuống dòng. KHÔNG thay bằng `-` (en-dash) vì cũng ngắn.

### 1d. "tu luyện" — sắc thái Phật giáo

`pages.js:34` "Hành trình **tu luyện** siêu trí tuệ qua những câu chuyện có thật"

Notion không cấm cụ thể, nhưng tone Bất Tử Đạo là **mở ra / khởi động / vận hành** (thiên về kỹ sư) chứ không **tu luyện** (thiên về Phật giáo Đông phương cổ điển).

**Đề xuất:** "Hành trình **mở ra** siêu trí tuệ..." hoặc "Hành trình **khởi động** Bất Tử Đạo...".

## 2. Notion IP quý chưa surface (P1)

### 2a. 43 Nguyên Lý đang trong Notion nội bộ

3 cụm:
- **Cụm 1 (NL-001 → NL-015):** từ `bat-tu-dao.md` draft v0.1 — 15 mục cơ bản (phân vai não vs cơ thể, 5 giác quan, ngôn ngữ là lập trình, ánh sáng như đèn nhà máy, vòng tuần hoàn năng lượng, ung thư = "trộm cướp"...).
- **Cụm 2 (NL-016 → NL-030):** từ chat cũ Fly — sâu hơn về Không Đạo, Chứng vs Đạt.
- **Cụm 3 (NL-031 → NL-040):** từ BTD-001 raw — **đã CHỐT**, gồm Hạt Bất Tử, vô tâm não, chip Bất Tử, Quan Âm tần số.

**Value để public:**
- Học trò search Google "Hạt Bất Tử là gì" → ra `/wiki/nguyen-ly/NL-031` thay vì đi vào group Facebook hỏi.
- Tăng đáng kể SEO surface (43 page mới, mỗi page là 1 keyword cluster).
- Trust signal: hệ thống có nguyên lý gốc, không chỉ "câu chuyện viral".

### 2b. 2 FOUNDATION reasoning patterns — gold mine

**FOUNDATION-1 = RP-26 "Phóng ra trước"**
> Đảo ngược pattern "nhận vào, quan sát" của thiền. Cái "nhận" thật ra là kết quả của một động tác "phóng" trước đó.

**FOUNDATION-2 = RP-29 "Không chấp dính ngôn ngữ"**
> Đảo ngược pattern "định nghĩa thuật ngữ chính thức" của triết học/giáo lý. Một trạng thái có nhiều tên (đa-tên là feature, không phải bug).

Đây là **brand positioning** của BTĐ vs mọi đạo khác. Phải có 1 page riêng giải thích 2 FOUNDATION này — đặt ở cổng vào tier 2.

### 2c. Đa-tên cho trạng thái cuối

Notion liệt kê 8 tên: vô nhiễm sắc thể, Người Opal Kim Cương Bất Tử, Linh thai Kim Cương, Tánh không tự tại, Linh không, Ánh sáng vô nhiễm, Bất Tử, Kim cương bất hoại.

Lý do giữ tất cả: RP-29. Page `/wiki/da-ten` show cả 8 và giải thích lý do.

## 3. About page mỏng (P1)

Notion có 2 page **đã CHỐT** rất chắc:
- **Định vị: BTĐ ≠ Phật giáo** (NL-012): bảng so sánh 4 dòng, đắt giá.
- **Không Đạo = Cốt lõi BTĐ** (NL-018): bao gồm rule mới "không quỳ lạy bất cứ ai (kể cả Phật/Chúa/Thượng Đế)".

Website hiện có `/about` nhưng (em chưa đọc nội dung exact) khả năng cao chưa có 2 nội dung này dứt khoát.

**Đề xuất:** Wiki tier 1 page `/wiki/btd-khac-phat-giao` và `/wiki/khong-dao` chứa nội dung gốc; `/about` link sang. Hoặc rewrite `/about` để tích hợp 2 nội dung này thẳng.

## 4. Stories thiếu internal link sang khái niệm (P2)

24 stories đã publish. Mỗi story xuất hiện nhiều thuật ngữ: "Hạt Bất Tử", "Phi thuyền", "Tiếng lạ", "Não giữa", "Mắt thứ ba", "Thái Dương Quyền"...

Hiện tại: text thuần, không link.

**Hệ quả:** người đọc lần đầu gặp "Hạt Bất Tử" trong story 1 phải:
- Đoán nghĩa (thường đoán sai).
- Search Google → ra Facebook group lộn xộn.
- Bỏ đọc.

**Đề xuất:**
- Auto-wiki-link plugin (trong markdown render): detect thuật ngữ trong story body → wrap component `<WikiLink>`.
- Lần đầu xuất hiện trong 1 story → wrap, lần sau plain text (tránh spam).
- Hover popup hiện "Phát biểu ngắn" của khái niệm.

Đây là 1 trong các thay đổi đơn giản nhất nhưng tạo retention lớn nhất.

## 5. Anti-Buddhist UX chưa đủ mạnh (P2)

Notion rất rõ: **BTĐ ≠ Phật giáo**. Nhưng visual + copy của website hiện tại không thoát hẳn:

- Icon `🙏` (chắp tay) nếu có (em chưa rà cụ thể) → Buddhist.
- "Tu luyện", "tâm linh" trong copy → Buddhist.
- Color gold + sun đã rất BTĐ — giữ.
- Dark theme — OK, không Phật giáo.

**Đề xuất:**
- Audit toàn bộ emoji UI: 🙏 / 🧘 / ☸️ (dharma wheel) → thay bằng ☀️ / 💎 / ⚡ / 🌌.
- Audit copy với checklist từ Notion.

## 6. Best practices đề xuất cho toàn site

Đây là general best practices rút từ cách Notion được tổ chức:

### 6a. Source of truth single layer

Notion: 1 raw material → chưng cất → nhiều output (story, khai trí, audio Fly).
Website: nên giữ tương tự. Mỗi khái niệm xuất hiện 1 nơi (wiki). Stories/khai trí/practice link sang, KHÔNG redefine.

Anti-pattern: stories tự định nghĩa "Hạt Bất Tử" mỗi story khác nhau → user confused.

### 6b. Tier hóa content

Notion: NL có field `Tier áp dụng` (T1, T2, T3...). Website cũng nên: mỗi page tag tier audience (newcomer / student / advanced). Filter trong UI.

### 6c. Status visibility

Notion: "ĐANG CHƯNG" / "CHỐT" / "DRAFT". Người đọc trong nhóm hiểu tự nhiên content nào tin được, content nào còn đang xét. Website nên có badge tương tự cho wiki page — đặc biệt "Câu hỏi mở" (page riêng cho 11 câu chờ Anh chốt).

### 6d. Cross-reference dày đặc

Notion: mỗi NL có field "Cross-reference NL" link sang NL khác. Đó là vì BTĐ là mạng lưới khái niệm, không phải chuỗi tuyến tính. Website nên render cross-ref rõ ràng ở mỗi detail page.

### 6e. Reasoning Pattern là first-class

Notion treat RP ngang hàng NL. Đó là điểm khác biệt với mọi knowledge base khác. Website nên có entry riêng `/wiki/reasoning-patterns`, không vùi RP vào `/wiki/nguyen-ly` như metadata.

### 6f. Không "tu luyện" → "mở ra / khởi động / vận hành"

Vocabulary của Notion: "khởi động nhà máy", "đẩy não ra", "phóng ra". Vocabulary website nên match. Hiện tại còn lẫn "tu luyện".

### 6g. Khoa học = neo, không phải thước đo

Mỗi NL Notion có field "Neo khoa học" — nói "khoa học chưa chạm tới" khi cần. Website nên render rõ tách bạch: phần BTĐ vs phần khoa học cận kề. Giúp user trí thức không quay đầu vì nghĩ "viễn vông".

### 6h. Đa-tên là feature

Đừng cố đặt 1 tên chuẩn cho mỗi khái niệm trên web. Glossary nên hiển thị tất cả synonym, không chọn "preferred name".

## 7. Content gap cụ thể (Notion có, web chưa có)

| Nội dung Notion | Web hiện có? | Đề xuất |
|---|---|---|
| Định vị BTĐ ≠ Phật giáo (NL-012) | Một phần ở About? | Tier 1 page riêng |
| Không Đạo cốt lõi (NL-018) | Không | Tier 1 page riêng |
| Hạt Bất Tử concept | Không | Tier 1 page |
| 5 giác quan = 5 cửa nhập rác | Không | Tier 2 NL list |
| Ngôn ngữ = lập trình não | Không | Tier 2 |
| Ánh sáng = đèn nhà máy phân loại rác | Không | Tier 1 hoặc tier 2 |
| Vòng tuần hoàn năng lượng | Không | Tier 2 |
| Ung thư = "trộm cướp" cải tạo | Không | Tier 2 |
| ADN và luân hồi | Không | Tier 2 |
| Hợp kim năng lượng (bất tử) | Không | Tier 2 |
| Mắt giữa = trí tưởng tượng | Không | Tier 2 |
| 11 câu hỏi mở | Không | Tier 2 page |
| 2 FOUNDATION (RP-26, RP-29) | Không | Tier 2 spotlight |
| Đa-tên trạng thái cuối | Không | Tier 2 page |
| 37 stories title undone (25-37) | Có (master list) | Đánh "coming soon" rõ hơn |

## 8. Đề xuất ưu tiên fix

### Tuần 1 — Quick wins (không cần wait wiki build)

1. Audit + fix terminology (P0): "tâm linh", "chữa lành", em-dash, "tu luyện" trong `pages.js` + Home + About + DEFAULT_DESC.
2. Audit emoji 🙏/🧘 trong UI (nếu có).
3. Commit: `fix(copy): align terminology with Bất Tử Đạo rules`.

### Tuần 2-3 — Wiki tier 1

Theo `phase-01` + `phase-02`. 7 page tier 1 + landing.

### Tuần 4-5 — Wiki tier 2 + Notion sync

Theo `phase-04` + `phase-03`. Mở rộng worker Notion sync, 43 NL + 30 RP lên `/wiki/nguyen-ly` và `/wiki/reasoning-patterns`.

### Tuần 6 — SEO + internal linking

Theo `phase-05`. Auto-wiki-link, sitemap, OG dynamic.

## 9. Risks không liên quan tới build

- **Anh có bao nhiêu thời gian review từng tier 1 page?** Mỗi page cần anh duyệt tone. Nếu anh bận → blocker.
- **Public 43 NL có sớm quá không?** Một số nội dung BTĐ (như "không quỳ lạy Phật/Chúa/Thượng Đế") sẽ gây tranh cãi. Anh có muốn rate-limit public sub-set trước, full set sau?
- **Notion sync 1-way thiệt thòi gì?** Nếu cộng tác có người sửa Firestore trực tiếp → sẽ bị overwrite. Web team phải biết rule: edit Notion only.

## 10. Câu hỏi mở (cần anh chốt)

1. Public toàn bộ 43 NL ngay hay select sub-set?
2. Tier 1 song ngữ ngày đầu hay VI trước EN sau?
3. Cấu trúc URL: `/wiki/khong-dao` hay `/wiki/concept/khong-dao` (room cho mở rộng)?
4. `/about` page giữ riêng hay redirect về `/wiki/bat-tu-dao-la-gi`?
5. Có cần admin tab review Notion sync flags không, hay yên tâm rule check + manual edit Notion?

---

## Phụ lục: Notion landmarks anh có thể check trực tiếp

- 📖 [Bất Tử Đạo - Project Hub](https://www.notion.so/331cf39103c781f7aa9ad9f86f3bb8bb)
- 🧭 [Wiki Index](https://www.notion.so/354cf39103c781db92bbc272ffbe5251)
- 💎 [Knowledge Base — Nguyên Lý](https://www.notion.so/352cf39103c781a4bd94c5c1631db562)
- 📕 [bat-tu-dao.md Draft v0.1](https://www.notion.so/352cf39103c7813c91a0de6986d5938a)
- Định vị: BTĐ ≠ Phật giáo (NL-012)
- Không Đạo = Cốt lõi (NL-018)

Sources:
- [📖 Bất Tử Đạo - Project Hub](https://www.notion.so/331cf39103c781f7aa9ad9f86f3bb8bb)
- [🧭 Wiki Index](https://www.notion.so/354cf39103c781db92bbc272ffbe5251)
- [💎 Knowledge Base — Nguyên Lý](https://www.notion.so/352cf39103c781a4bd94c5c1631db562)
- [📕 bat-tu-dao.md Draft v0.1](https://www.notion.so/352cf39103c7813c91a0de6986d5938a)
- [Định vị NL-012](https://www.notion.so/352cf39103c78149b5e7f0ccf480f461)
- [Không Đạo NL-018](https://www.notion.so/352cf39103c78184ad34d4388d198a16)
- [Khai Trí: Năng Lượng, Ánh Sáng và Bất Tử Đạo](https://www.notion.so/331cf39103c78132a3d0e5a4a4ff7822)
