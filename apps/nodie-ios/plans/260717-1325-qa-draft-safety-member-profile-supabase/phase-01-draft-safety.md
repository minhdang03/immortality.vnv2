# Phase 01 — #21 + #22: gửi fail không được nuốt chữ của người ta

**Ưu tiên:** P0 (nặng nhất trong 9 lỗi). **Status:** chưa bắt đầu.

## Context

- Pattern chuẩn ĐÃ CÓ SẴN cùng file: `QAStore.swift:172-187` `createQuestion` → `@discardableResult` + trả `QuestionRow?`; `AskQuestionView.swift:243-251` chỉ `dismiss()` khi `if let created`. **Phase này chỉ là kéo `createAnswer`/`createReply` về đúng pattern đó** — không phát minh gì mới.
- `QuestionDetailView.swift:178-188` replyBar đã làm đúng phần "đang gửi" (có `@State sending`, `ProgressView`, `.disabled(!canSend || sending)`). `InlineReplyField` thì chưa → đó chính là #22.

## Requirements

**#21** — Gửi fail = chữ còn nguyên:
- `QAStore.createAnswer` (:189-200) và `createReply` (:202-212) đang trả **Void**, catch chỉ set `errorMessage` → caller mù.
- `QuestionDetailView.send()` (:201-207) `draft = ""` vô điều kiện.
- `AnswerCardView.sendReply()` (:122-126) `replyDraft = ""; replyTarget = nil` vô điều kiện.

**#22** — `InlineReplyField.swift` (46 dòng, presentational):
- `Button(action: onSend)` chỉ `.disabled(!canSend)` → double-tap = 2 reply trùng (INSERT thật, không undo).
- Không có đường đóng ô: `AnswerCardView.swift:44-50` mở `replyTarget` nhưng không set về nil được.

## Files

**Modify:**
- `NODIE/Features/QA/QAStore.swift` (391 dòng — chỉ đổi kiểu trả về, KHÔNG thêm dòng ròng)
- `NODIE/Features/QA/QuestionDetailView.swift`
- `NODIE/Features/QA/AnswerCardView.swift`
- `NODIE/Features/QA/InlineReplyField.swift`
- `NODIE/Localizable.xcstrings` (2 key mới × 9 ngôn ngữ)

**Create/Delete:** không.

## Implementation

1. `QAStore.createAnswer(questionId:body:)` → `@discardableResult func ... async -> Bool`. `return true` cuối `do`, `return false` trong `catch` (giữ nguyên `errorMessage = ...` đang có). Y hệt hình dáng `createQuestion`, chỉ khác `QuestionRow?` → `Bool` vì caller không cần hàng trả về.
2. `QAStore.createReply(answerId:parentId:body:)` → y hệt bước 1.
3. `QuestionDetailView.send()`:
   ```
   sending = true
   let ok = await qa.createAnswer(questionId: uuid, body: draft)
   sending = false
   guard ok else { return }   // lỗi đã có alert ở RootTabView lo — ở đây chỉ giữ chữ
   draft = ""
   ```
   Comment VÌ SAO: *xoá draft trước khi biết server nhận chưa = mất trắng đoạn người ta vừa nghĩ; alert báo lỗi mà ô thì trống rỗng là cú lừa.*
4. `AnswerCardView`: thêm `@State private var replySending = false`. `sendReply(parentId:)`:
   ```
   replySending = true
   let ok = await qa.createReply(...)
   replySending = false
   guard ok else { return }   // giữ cả replyDraft LẪN replyTarget: đóng ô là mất luôn chữ
   replyDraft = ""
   replyTarget = nil
   ```
5. `InlineReplyField`: thêm `var isSending: Bool = false` và `let onCancel: () -> Void`.
   - Nút gửi: `.disabled(!canSend || isSending)`; label đổi thành `Group { if isSending { ProgressView().tint(.white) } else { Image(systemName: "arrow.up")... } }` — **copy đúng hình dáng `QuestionDetailView.swift:178-188`**, hai thanh gửi của cùng một app không được cư xử khác nhau.
   - Nút huỷ: `Image(systemName: "xmark")` trước ô text, gọi `onCancel`. `.accessibilityLabel("Huỷ trả lời")`.
   - Default `isSending: Bool = false` để không gãy call site nào khác (grep: chỉ AnswerCardView dùng).
6. `AnswerCardView` call site: truyền `isSending: replySending` + `onCancel: { replyTarget = nil; replyDraft = "" }`.
   ⚠️ **Cân nhắc:** huỷ có nên xoá `replyDraft` không? Có — user chủ động bấm ✕ là chủ động bỏ, khác với fail. Nhưng nếu đang `replySending` thì **không cho huỷ** (`.disabled(isSending)` trên nút ✕) — huỷ giữa chừng không rút được INSERT đã bay đi.
7. Key mới `Localizable.xcstrings` (edit đúng-chuỗi, đủ 9 ngôn ngữ): `"Huỷ trả lời"`. (`"Gửi"` đã có sẵn — grep trước khi thêm.)

## Todo

- [x] `QAStore.createAnswer` → `@discardableResult ... -> Bool`
- [x] `QAStore.createReply` → `@discardableResult ... -> Bool`
- [x] `QuestionDetailView.send()` guard ok
- [x] `AnswerCardView.sendReply()` guard ok + `@State replySending`
- [x] `InlineReplyField` + `isSending` + `onCancel` + nút ✕
- [x] Key `"Huỷ trả lời"` × 9 ngôn ngữ
- [ ] Build xanh — **chặn bởi lỗi ngoài phạm vi** (`Features/Conversations/*` đang giữa chừng refactor của session chính, cấm sửa). File của phase 01 tự nó sạch lỗi (`grep error: | grep -v Conversations/` rỗng).
- [ ] UITest `QAWireUITests` còn xanh — không chạy được vì build tổng thể đỏ (lý do như trên)

## Success criteria

1. Bật máy bay → gõ trả lời → bấm gửi → alert lỗi hiện, **ô vẫn còn nguyên chữ**; tắt máy bay, bấm lại → gửi được.
2. Bấm đúp nút gửi trong ô inline → **đúng 1 reply** trong DB.
3. Đang gửi → spinner, nút gửi và nút ✕ đều không bấm được.
4. Bấm ✕ → ô inline đóng, không gửi gì.

## Risks / Rollback

| Rủi ro | Mitigation |
|---|---|
| Đổi signature `createAnswer`/`createReply` gãy call site khác | Grep trước: chỉ 2 call site (`QuestionDetailView`, `AnswerCardView`). `@discardableResult` giữ mọi caller cũ vẫn biên dịch. |
| Plan 260717-1306 phase-02 cũng sửa 4 file này | Họ CHƯA code (file sạch 13:38). Ta commit trước → họ rebase. Ghi vào bảng "file đã đổi" ở plan.md. |
| `InlineReplyField` đổi signature | Chỉ 1 call site. Tham số mới có default → an toàn. |

**Rollback:** 1 commit độc lập, revert thẳng. Không đụng DB, không đổi schema, không migration.
