# Phase 01 — Stats Cá nhân + Câu hỏi/Trả lời/Đã lưu của tôi + migration saves

**Priority:** cao · **Status:** XONG (17/07) — build xanh, 32/32 UI test xanh.

## Kết quả đo được

- `TouchTargetUITests` (nợ verify từ lượt trước): **hỏng sẵn**, nay xanh. Nguyên nhân: ô nhập chat có
  `.submitLabel(.send)` ⇒ phím Enter bàn phím VI vẽ chữ "Gửi", trùng đúng nhãn nút gửi của app ⇒
  `buttons["Gửi"]` khớp HAI phần tử. Sửa: nút gửi/ghi âm có `accessibilityIdentifier`, test bám định
  danh và kiểm nhãn riêng. Hai test `ChatDetailUITests` cũng hỏng vì y hệt lý do → sửa cùng.
- `AuthUITests.testSignOutReturnsToLogin`: **đợt này làm hỏng, đã sửa.** Khối thống kê làm màn Cá nhân
  cao thêm ~140pt ⇒ nút Đăng xuất trôi xuống mép (y=868 trên màn 874). `tap()` bấm vào TÂM phần tử,
  tâm nằm ngoài màn ⇒ cú chạm rơi vào hư không, dialog không mở. Không phải lỗi app (người thật cuộn
  xuống là bấm được) — test phải cuộn trước khi bấm, và bám vào dialog thay cho `firstMatch`.
- Test mới: `ProfileContentUITests` (4 ô ra số thật — hết "—"; 3 dòng push màn thật; có nút lưu).

## Context

- Màn Cá nhân (`ProfileView` + `ProfileSections`) chưa có khối thống kê; 3 hàng "Câu hỏi của tôi / Trả lời của tôi / Đã lưu" đang là `Text("Sắp có")`.
- Prototype (dòng 488–491 `Aion Prototype v3.dc.html`): lưới 2×2, card `surface` viền `rule` bo 14, số serif 23, nhãn 10.5 `inkMuted`.
- Quyết định user: 4 ô toàn số thật — ngày tham gia · câu hỏi đã đặt · trả lời đã viết · hạt ánh sáng nhận được. "Đã lưu" = bảng Supabase mới.
- `profiles.created_at` có sẵn (migration 0005). `answers.lit_count`/`answer_replies.lit_count` có sẵn (0018).

## Files

**Tạo:**
- `../../supabase/migrations/0022_nodie_question_saves.sql` — bảng `question_saves(user_id, question_id, created_at, PK(user_id,question_id))`, FK → `questions on delete cascade`, RLS: select/insert/delete `auth.uid() = user_id`. Theo style 0018 (authed-only như 0019).
- `NODIE/Features/QA/QAStoreSaves.swift` — extension QAStore (pattern QAStoreModeration): `savedQuestionIds: Set<UUID>` sống ở QAStore (var, cùng lý do errorMessage), `loadSaves()`, `toggleSave(_ questionId:)`, `savedQuestions` (lọc từ cache + fetch riêng khi thiếu).
- `NODIE/Features/Profile/ProfileStatsGrid.swift` — LazyVGrid 2×2 + `ProfileStatsStore` (@Observable, 4 số):
  - ngày tham gia: `profiles.created_at` → số ngày đến hôm nay.
  - câu hỏi đã đặt: `questions?author_id=eq.uid` count exact head.
  - trả lời đã viết: `answers?author_id=eq.uid` count exact head.
  - hạt ánh sáng nhận: `select("lit_count")` trên answers + answer_replies của mình, cộng client-side (nội dung của 1 user — bounded; RPC tính sau nếu cần).
- `NODIE/Features/Profile/MyContentViews.swift` — `MyQuestionsView` / `MyAnswersView` / `SavedQuestionsView` (list đơn giản theo style QuestionListView row; answers select kèm `question:questions(title)`; tap → push `QuestionDetailView`).

**Sửa:**
- `NODIE/Auth/UserProfile.swift` — thêm `let createdAt: Date?` (+ CodingKey `created_at`). ĐỔI TỐI THIỂU — user đang sửa Auth.
- `NODIE/Auth/AuthStore.swift:193` — thêm `created_at` vào câu select tường minh (câu `.select()` ở :169 đã lấy hết cột).
- `NODIE/Features/Profile/ProfileSections.swift` — chèn `ProfileStatsGrid` dưới header; 3 hàng "Sắp có" → `NavigationLink(value: ProfileRoute...)`.
- `NODIE/Features/Profile/ProfileView.swift` — `enum ProfileRoute { myQuestions, myAnswers, saved }` + `.navigationDestination(for: ProfileRoute.self)` KHAI BÁO TRONG ProfileView để chạy được ở cả stack Feed lẫn Friends (path 2 tab là enum khác nhau, không nhét chung được).
- `NODIE/Features/QA/QuestionDetailView.swift` — nút lưu (glyph ◍ / `bookmark`) cạnh nút ⋯ ở header, toggle `qa.toggleSave`.

## Steps

1. Viết migration 0022 (chỉ viết file — anh apply tay).
2. `UserProfile.createdAt` + select :193.
3. `QAStoreSaves.swift` (state + toggle + load).
4. `ProfileStatsGrid.swift` (store + UI, `.task` load, redacted khi đang tải).
5. `MyContentViews.swift` + `ProfileRoute` + wire 3 hàng.
6. Nút lưu ở QuestionDetailView.
7. `xcodegen generate` → build.

## Validation

- Build xanh. Chạy `TouchTargetUITests` (đang nợ verify từ trước) + `SwipeBackUITests`.
- Stats/saves đụng Supabase thật → không assert số trong UI test (RLS authed-only chặn bypass-auth); chỉ smoke: 3 hàng push được màn, không crash khi chưa đăng nhập (hiện "Cần đăng nhập" / rỗng).

## Risks

- Anh đang sửa `Auth/` + `Moderation/` — đổi UserProfile/AuthStore giữ tối thiểu 2 dòng; nếu conflict thì báo, không tự merge.
- Migration chưa apply thì màn Đã lưu báo lỗi quyền → ErrorText đã map sẵn thông điệp thân thiện.
