---
title: "QA draft safety (#21,#22,#23,#27,#28,#29,#30,#31) + Hồ sơ thành viên thật (#25)"
description: "Vá 8 lỗi UX Hỏi đáp client-only, rồi nối MemberProfileView vào Supabase thật + bảng follows."
status: pending
priority: P2
effort: ~7h
branch: claude/immortality-mobile-hybrid
tags: [nodie, ios, swiftui, supabase, ux, qa, profile]
created: 2026-07-17
---

# Plan: 9 lỗi UX — draft safety Hỏi đáp + Hồ sơ thành viên thật

**Status:** chưa bắt đầu (17/07 13:39). **Chốt phạm vi (Đăng):** 9 lỗi #21·#22·#23·#25·#27·#28·#29·#30·#31.

## ĐỀ BÀI ĐÃ LỆCH THỰC TẾ — 2 điểm, đọc trước khi code

Đo lúc 13:38, khác đề bài viết lúc ~13:25:

1. **Danh sách file cấm của đề bài GIỜ ĐÃ SẠCH.** `AppState · QAModels · QuestionListView · ChatDetailView · ConversationListView · Models/Conversation` → session kia commit hết ở `ac3a9db`/`402e9d0`. Họ lan sang vùng mới: **`Auth/* · NodieApp.swift · Localizable.xcstrings · Info.plist · project.yml`** đang bẩn.
   ⇒ Vẫn **giữ nguyên lệnh cấm** (họ có thể quay lại). Nhưng **`Localizable.xcstrings` giờ mới là chỗ nóng** — mà phase nào cũng phải thêm key vào đó. Xem "Rủi ro chung".
2. **Số migration đã đổi dưới chân.** Session kia vừa `git mv` **0026_public_profiles → `0027_nodie_public_profiles_and_message_reactions.sql`** (staged, chưa commit) để né trùng số với `0026_nodie_push_on_message_trigger.sql`.
   ⇒ Đề bài bảo lấy **0028**, nhưng lý do của nó ("0027 là của plan 260717-1306") **đã chết**: 0027 giờ là public_profiles, plan 260717-1306 phase-02 phải trượt xuống 0028. **Plan này lấy `0029`** để nhường 0028 cho họ (họ xếp hàng trước). → xem Câu hỏi #1.

**Luật thay cho bản đồ:** chạy `git status --short` + `ls supabase/migrations/` **ngay trước** mỗi phase. Cột "Rủi ro" là ảnh chụp 13:38, không phải lời hứa.

## Phases

| # | Nội dung | File sở hữu | Rủi ro đụng (13:38) | Status |
|---|---|---|---|---|
| 01 | [#21+#22 draft không mất khi gửi fail](phase-01-draft-safety.md) | QAStore · QuestionDetailView · AnswerCardView · InlineReplyField | **TRUNG** — 4 file này plan 260717-1306 phase-02 cũng nhận, nhưng họ CHƯA code | chưa |
| 02 | [#23+#27 Huỷ hỏi lại + nói lý do disabled](phase-02-ask-question-guards.md) | AskQuestionView | THẤP — không ai đụng | chưa |
| 03 | [#28+#29 refreshable + dòng mồ côi](phase-03-my-content-refresh-orphan.md) | MyContentViews | **TRUNG** — 260717-1306 phase-02 cũng nhận | chưa |
| 04 | [#30+#31 giờ tự trôi + copy thân câu hỏi](phase-04-live-time-and-copy.md) | +NodieRelativeTimeText.swift · QuestionDetailView · AnswerCardView · AnswerReplyRow · MyContentViews | **TRUNG** — chồng file với 01+03 ⇒ chạy SAU cả hai | chưa |
| 05 | [migration 0029 follows + view thêm created_at](phase-05-migration-follows.md) | +`supabase/migrations/0029_nodie_follows.sql` | **TRUNG** — số hiệu đang trôi; phụ thuộc 0027 | chưa |
| 06 | [#25 Hồ sơ thành viên thật + follows](phase-06-member-profile-real.md) | +MemberStore.swift · +MemberProfileSections.swift · MemberProfileView · FriendsView · RootTabView | **CAO** — `RootTabView` là của 260717-1306 phase-03; **chặn bởi 0027+0029 apply prod** | chưa |

**Thứ tự bắt buộc: 01 → 02 → 03 → 04 → 05 → 06.** 01/03 chồng file với 04. 06 chặn bởi 05 + Đăng apply.
Nhóm A (01–04) ship được ngay hôm nay, client-only, không chờ ai. Nhóm B (05–06) chờ prod.

## Dependencies

- **06 ⇐ 05 ⇐ Đăng apply 0027** (public_profiles). Đổi Swift `profiles`→`public_profiles` TRƯỚC khi apply = PGRST200 (đã dính 1 lần ở 0020).
- 04 ⇐ 01, 03 (chồng file).
- Không phase nào sửa `QAModels.swift` → **#30 giải bằng TimelineView ở tầng VIEW**, model không đụng (xác nhận: `relativeTime` là computed, chỉ cần ép view dựng lại).

## Acceptance criteria

1. Rớt mạng lúc gửi trả lời/reply → **chữ còn nguyên**, có báo lỗi, bấm gửi lại được. (#21)
2. Ô reply inline: đang gửi → spinner, bấm đúp không ra 2 reply; có nút huỷ đóng ô. (#22)
3. "Huỷ" ở Chiếu câu hỏi khi đã gõ → hỏi xác nhận; ô trống → đóng thẳng. (#23)
4. Tiêu đề <7 ký tự **và đã gõ** → hiện lý do; ô trống → không mắng. (#27)
5. 3 màn "Đóng góp của bạn" kéo-tay-làm-mới được. (#28) Dòng mồ côi mờ + ghi chú, không mời bấm. (#29)
6. Mở màn chi tiết ≥60s → "2 phút trước" tự thành "3 phút trước", không cần rời màn. (#30)
7. Giữ thân câu hỏi → "Sao chép". (#31)
8. Hồ sơ người khác: **tên thật** (không "Ẩn danh"), số liệu thật, follow ghi DB thật, mở lại app còn nguyên; id không tồn tại → màn "không tìm thấy", KHÔNG trắng trơn. (#25)
9. Build xanh; UITests đang xanh vẫn xanh; key mới đủ **9 ngôn ngữ**.

## Việc CHỈ ĐĂNG LÀM ĐƯỢC (migration không auto-deploy)

1. **Apply `0027_nodie_public_profiles_and_message_reactions.sql`** (file session kia vừa đổi tên từ 0026). **Chặn phase 06** — không có nó thì tên người khác = "Ẩn danh" trên toàn app.
2. **Apply `0029_nodie_follows.sql`** sau khi phase 05 viết xong. Chặn phase 06.
3. Xác nhận 3 câu hỏi mở dưới đây (#25 UI + Nhắn tin).

## File plan này đổi → báo plan 260717-1306 rebase

| File | Ta đổi gì | Ảnh hưởng phase nào của họ |
|---|---|---|
| `QAStore.swift` | `createAnswer`/`createReply` Void → **`Bool`** | phase-02 (họ thêm `QAStoreOwnContent.swift`) — chỉ cộng thêm, không xung đột logic |
| `QuestionDetailView.swift` | `send()` giữ draft; +`import UIKit`; +contextMenu; bọc TimelineView | phase-02 |
| `AnswerCardView.swift` | `sendReply` giữ draft; +`replySending`; bọc TimelineView | phase-02 |
| `AnswerReplyRow.swift` | bọc TimelineView | phase-02 |
| `MyContentViews.swift` | +`.refreshable`; dòng mồ côi mờ | phase-02 |
| `InlineReplyField.swift` | +`isSending`, +`onCancel` (đổi signature) | — |
| `RootTabView.swift` | truyền `MemberStore` xuống MemberProfileView | **phase-03 của họ sở hữu file này** ⇒ ai xong trước commit trước |
| migration | ta lấy **0029**, nhường **0028** cho phase-02 của họ | phase-02 |

## Rủi ro chung

- **`Localizable.xcstrings` đang bẩn (auth session)**, 10.877 dòng, họ từng viết lại cả file. Mọi phase phải **edit đúng-chuỗi, cộng thêm** — không ghi đè. Nếu conflict: commit phase xong rồi thêm key sau, đừng ôm.
- **`Text(cond ? "a" : "b")` không tra String Catalog** → luôn tách `cond ? Text("a") : Text("b")`.
- Thêm file mới → `xcodegen generate` (`project.yml` đang bẩn → chạy lúc nó sạch).
- Build: `xcodebuild -project NODIE.xcodeproj -scheme NODIE -destination 'platform=iOS Simulator,name=iPhone 17' build` (máy KHÔNG có iPhone 16).

## Câu hỏi chưa chốt

1. **Số migration: lấy 0029 (kế hoạch đang chọn) hay giữ 0028 như đề bài?** Đề bài nói 0028 vì tưởng 0027 là của plan 260717-1306 — nhưng 0027 vừa bị public_profiles chiếm (staged, 13:38). Nếu giữ 0028 thì đụng phase-02 của họ. **Cần lead gật.**
2. **Nút "Nhắn tin" ở hồ sơ**: `openOrCreateDM` nằm ở `AppState` (CẤM sửa), chạy `MockData.people` id kiểu "huong", và `ConversationStore` **chưa có khái niệm DM** (chỉ channels + join/leave). Với memberId = UUID thật thì nút này **im lặng không làm gì**. Kế hoạch đang chọn: **ẩn nút** ở phase 06 + ghi nợ cho session Conversations. Ship nút chết là tệ hơn. Cần Đăng gật.
3. **7 trường không có trong DB** — phương án + trade-off ở [phase-06](phase-06-member-profile-real.md) §"7 trường". Tóm tắt kế hoạch đang chọn: `join` **suy từ `created_at`** (phải thêm cột vào view — xem phase 05); `stats` + `fields` + `posts` **suy từ dữ liệu thật**; `emoji`/`gradient` → **InitialAvatar** như phần còn lại của app; `verified` + `level` → **xoá** (level "cấp 9" là xếp hạng giữa người với người → phạm luật project; verified phải map `profiles.role` mà 0027 cấm phơi `role`). Cần Đăng gật.
4. **Chat → hồ sơ sẽ gãy tạm**: `ChatRoute.member(id)` lấy id từ `AppState.member(inChat:)` (MockData). Sau phase 06 → rơi vào màn "không tìm thấy". `ChatDetailView` là của session kia nên ta không sửa được đường này. Chấp nhận tạm (họ đang wire Chat sang Supabase, id sẽ thành UUID) hay chặn phase 06 lại chờ họ?
5. **`ConversationStore.swift:29` + `ConversationStoreRealtime.swift:61` cũng dính bug `author:profiles(...)`** — cùng gốc với #25. Ta sửa hộ (đụng vùng của họ) hay để lại + báo họ? Kế hoạch đang: **báo, không sửa**.
</content>
</invoke>
