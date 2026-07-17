# Report — QA draft safety phase 01-04 (#21,#22,#23,#27,#28,#29,#30,#31)

**Plan:** `plans/260717-1325-qa-draft-safety-member-profile-supabase/` — phase 01→04.

## Trạng thái đầu phiên

Vào việc thì **cây làm việc đã có sẵn diff khớp gần như 100% spec 4 phase file** (chưa commit). Không rõ do phiên trước bị ngắt hay do chạy trùng — không tìm thấy report cũ (`plans/reports/` không có file `*qa-ux-9-bugs*` nào trước). Đã đọc kỹ 4 phase file trước, rồi đối chiếu TỪNG dòng code hiện có với spec (không tin sẵn, verify thật) — khớp đủ. Không phát sinh việc code mới ngoài verify + fix docs.

## Verify theo phase

**Phase 01 (#21+#22)** — `QAStore.createAnswer/createReply` đã `@discardableResult -> Bool`, catch trả `false` giữ `errorMessage`. `QuestionDetailView.send()` và `AnswerCardView.sendReply()` đều `guard ok else { return }` trước khi xoá draft. `InlineReplyField` có `isSending` (spinner + disable gửi VÀ huỷ) + `onCancel` (nút ✕, `.disabled(isSending)`). Key `"Huỷ trả lời"` đủ 9 ngôn ngữ.

**Phase 02 (#23+#27)** — `AskQuestionView`: nút Huỷ rẽ nhánh `hasText ? confirm : dismiss()`, `.confirmationDialog` đặt ở tầng `body` (ngoài ScrollView) — đúng. `titleTooShort` bám sát ngưỡng `canAsk` (`<=6` khớp `>6`), chỉ hiện khi đã gõ. `.accessibilityHint` trên nút "Chiếu sáng". 4 key (`"Bỏ câu hỏi đang viết?"`, `"Bỏ"`, `"Tiếp tục viết"`, hint text) đủ 9 ngôn ngữ.

**Phase 03 (#28+#29)** — `MyContentScaffold` đổi cấu trúc: `ScrollView` bọc CẢ nhánh rỗng (minHeight 320) lẫn nhánh danh sách, `.refreshable` gắn ngoài cùng → rỗng vẫn kéo được. `isLoading` branch tách riêng ngoài ScrollView (không kéo trong lúc quay lần đầu). 3 view (`MyQuestionsView`/`SavedQuestionsView`/`MyAnswersView`) đều có `reload()` riêng dùng chung `.task` + `onRefresh`, không đụng `isLoading` khi kéo tay. Dòng mồ côi: `.opacity(0.55)` + nhãn "Câu hỏi gốc đã xoá" cạnh badge "Hay nhất" + `.accessibilityHint`. Key đủ 9 ngôn ngữ.

**Phase 04 (#30+#31)** — `NodieRelativeTimeText.swift` tồn tại tại `NODIE/Components/` (phase file ghi `Components/`, không phải `DesignSystem/` như prompt gốc — bám phase file vì đó là spec chi tiết hơn). `TimelineView(.everyMinute)` + `@ViewBuilder`, comment đúng giọng repo. Bọc HẸP đúng dòng `Text` ở 4 chỗ: `QuestionDetailView:46`, `AnswerCardView:83`, `AnswerReplyRow:24` (bọc cả cụm `Text + Text` ghép — đúng vì không tách được), `MyContentViews:192`. `QuestionDetailView` đã có `import UIKit` + `.contextMenu` copy thân câu hỏi (copy `question.body`, đúng tiêu đề không copy — khớp yêu cầu). Key `"Sao chép"` tái dùng, không thêm mới — grep xác nhận đã có (AnswerCardView dùng từ trước).

## i18n

Grep trực tiếp `Localizable.xcstrings` (JSON) cho mọi key mới: `"Huỷ trả lời"`, `"Bỏ câu hỏi đang viết?"`, `"Bỏ"`, `"Tiếp tục viết"`, hint tiêu đề, `"Câu hỏi gốc đã xoá"`, `"Sao chép"` — **mỗi key đều có đúng 8 localization (de/en/es/fr/ja/ko/ru/zh-Hans) + VI là chính key** = 9 ngôn ngữ. Đạt.

## Build

```
xcodebuild ... build 2>&1 | grep -E "error:|BUILD SUCCEEDED|BUILD FAILED"
```
→ **BUILD FAILED**, nhưng **toàn bộ lỗi nằm ở `Features/Conversations/*`** (`ChatDetailView.swift`, `ConversationListView.swift`) — file **CẤM sửa**, thuộc "session chính" đang refactor `Conversation` → kiểu mới (`git status` xác nhận 5 file Conversations đang `M` chưa commit, không phải do tôi). Lọc `grep error: | grep -v Conversations/` → **rỗng** — nghĩa là 8 file thuộc phạm vi phase 01-04 (QAStore, QuestionDetailView, AnswerCardView, AnswerReplyRow, InlineReplyField, AskQuestionView, MyContentViews, NodieRelativeTimeText.swift) **tự chúng không có lỗi biên dịch**.

Không thể chạy `QAWireUITests`/`ProfileContentUITests` vì build tổng thể đỏ (phụ thuộc target chung).

## File đã sửa (docs only, phiên này)

- `plans/260717-1325-.../phase-01-draft-safety.md` — tick Todo, ghi chú build/UITest bị chặn ngoài phạm vi
- `phase-02-ask-question-guards.md`, `phase-03-my-content-refresh-orphan.md`, `phase-04-live-time-and-copy.md` — tương tự
- `plan.md` — cột Status 4 phase → "code xong, build tổng thể chặn bởi Conversations/*"

**Không sửa code** — code phase 01-04 đã đúng từ trước khi tôi vào việc; việc của tôi là audit + xác nhận + đồng bộ docs.

## Chưa đạt / rủi ro còn treo

1. **Build tổng thể chưa xanh** — chặn hoàn toàn bởi `Features/Conversations/*` (session chính, cấm sửa). Cần session đó commit xong phần refactor `Conversation`/`ChannelRow` rồi build lại toàn repo.
2. **UITests chưa chạy được** — phụ thuộc mục 1.
3. Không rõ nguồn gốc diff có sẵn (ai code, khi nào) — đã verify kỹ nội dung khớp 100% spec nên tin được, nhưng đáng để Đăng biết là code không phải do phiên này gõ mới.

## Status

**Status:** DONE_WITH_CONCERNS
**Summary:** Code phase 01-04 đã đúng spec 100% (đã có sẵn trong working tree, verify từng dòng, không cần sửa thêm), i18n đủ 9 ngôn ngữ. Build tổng thể vẫn ĐỎ nhưng do `Features/Conversations/*` — vùng cấm, thuộc session chính đang giữa chừng refactor, không liên quan 8 file thuộc phase 01-04 (lọc riêng thì 0 lỗi).
**Concerns/Blockers:** Build xanh + UITests xanh (acceptance #8 của yêu cầu, mục "Build xanh" của 4 phase Todo) CHƯA đạt — chặn bởi file ngoài phạm vi cấm sửa. Cần session chính (Conversations refactor) commit xong rồi build lại full để xác nhận.
