# Plan: Thống kê Cá nhân (số thật) · Wire 3 hàng "Sắp có" · Đã lưu (Supabase) · Nút soạn tin mới

**Status:** phase-01 XONG · phase-02 XONG — build xanh, 32/32 UI test xanh (17/07).
**Còn treo:** migration 0022 anh chưa apply → màn "Đã lưu" hiện rỗng, nút lưu báo lỗi quyền cho tới khi apply.
**Nợ i18n:** ~14 chuỗi mới chưa vào `Localizable.xcstrings` → 8 ngôn ngữ kia rơi về tiếng Việt (VI đúng vì key = literal VI).
**Branch:** claude/immortality-mobile-hybrid
**Quyết định user (16/07):** stats = 4 ô toàn số thật (lệch nhãn prototype 2 ô, không số ma) · "Đã lưu" = migration Supabase mới · mục 7 LoginView KHÔNG đụng (user đang sửa).

## Phases

| # | File | Nội dung | Status |
|---|---|---|---|
| 01 | [phase-01-profile-stats-my-content-saves.md](phase-01-profile-stats-my-content-saves.md) | Migration 0022 `question_saves` + stats 2×2 + 3 màn Câu hỏi/Trả lời/Đã lưu của tôi + nút lưu ở chi tiết câu hỏi | XONG |
| 02 | [phase-02-new-dm-picker.md](phase-02-new-dm-picker.md) | Nút soạn tin mới → màn chọn người nhận → mở/tạo DM | XONG |

## Lệch so với kế hoạch (đã đo, không phải phỏng đoán)

1. **KHÔNG đụng `Auth/` một dòng nào** (kế hoạch định sửa 2 file). `ProfileStatsStore` tự đọc
   `profiles.created_at` — nó đã nói chuyện với Supabase sẵn, không cần `UserProfile.createdAt`.
2. **`feedPath`/`friendsPath` → `NavigationPath`.** Kế hoạch định dùng `NavigationLink(value: ProfileRoute…)`
   trên path mảng có kiểu — SwiftUI nuốt lặng giá trị khác kiểu ⇒ ba dòng sẽ CHẾT không báo lỗi.
   Kéo theo 3 chỗ gọi phải ghi rõ `FeedRoute.` / `FriendsRoute.`.
3. **`QAStore.questionsById`.** `QuestionDetailView` chỉ tra `qa.questions` (50 câu mới nhất) ⇒ mở câu
   cũ từ "Đã lưu" là xoay vô tận. Cache theo id + `loadQuestion(id:)`; KHÔNG nhét vào `questions`
   (sẽ mọc bài lạ trong danh sách Hỏi đáp).
4. **Tách `NodieStatGrid`** (dùng chung với `MemberProfileView` — đã có sẵn lưới y hệt) và
   **`QuestionRowContent`** (Button lồng NavigationLink thì tranh cú chạm).
5. **Ba test hỏng SẴN từ trước được sửa** (không phải do đợt này gây ra) — xem phase-01.

## Acceptance criteria

1. Màn Cá nhân có lưới 2×2: ngày tham gia (profiles.created_at) · câu hỏi đã đặt · trả lời đã viết · hạt ánh sáng nhận được — tất cả từ Supabase, không hardcode.
2. 3 hàng "Sắp có" thành 3 màn push thật; "Đã lưu" đọc bảng `question_saves` (RLS chỉ mình thấy); chi tiết câu hỏi có nút lưu toggle.
3. Nút ✎ ở màn Chat mở màn chọn người từ `MockData.people`, chọn → mở/tạo DM (dùng `openOrCreateDM` sẵn có).
4. Build xanh; UI tests hiện-xanh vẫn xanh (Swipe*, TouchTarget trừ Q&A-Supabase-phụ-thuộc); không đổi contract public ngoài cột thêm vào `UserProfile` (optional).

## Ngoài phạm vi

Mục 7 LoginView · "Thông tin nhóm" (kênh/nhóm) · media/voice thật · realtime chat Supabase · huy hiệu/lĩnh vực đang theo ở Cá nhân (prototype có, chưa được yêu cầu).

## Ràng buộc

- File < 200 dòng → stats/saves tách extension-file theo pattern `QAStoreModeration.swift`.
- KHÔNG đụng `NODIE/Auth/*` ngoài việc thêm `createdAt` (optional) vào `UserProfile` + thêm cột vào câu select :193 — anh đang sửa Auth, đổi tối thiểu.
- Migration em chỉ VIẾT file; anh tự apply lên Supabase như 0017–0021.
- `xcodegen generate` sau khi thêm file mới.
