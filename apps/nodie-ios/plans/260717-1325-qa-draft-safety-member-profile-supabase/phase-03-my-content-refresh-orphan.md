# Phase 03 — #28 + #29: kéo-tay-làm-mới + dòng mồ côi đừng giả vờ bấm được

**Ưu tiên:** P2. **Status:** chưa bắt đầu. **Đụng độ:** TRUNG — plan 260717-1306 phase-02 cũng nhận `MyContentViews.swift`.

## Context

- `MyContentViews.swift` (175 dòng). 3 màn `MyQuestionsView` (:60), `SavedQuestionsView` (:86), `MyAnswersView` (:114) đều chỉ `.task { rows = await qa.myXxx(); isLoading = false }` — **không có `.refreshable`**.
- Lệch với chính app: `QuestionDetailView.swift:82-84` đã có `.refreshable`, và comment ở đó nói rõ vì sao.
- `MyContentScaffold` (:8-56) là khung chung — nhưng `ScrollView` nằm **trong nhánh else của isEmpty** (:34-40). Đặt `.refreshable` lên đó thì **màn rỗng không kéo được** (đúng lúc người ta muốn kéo nhất: "sao chưa thấy gì?").
- `MyAnswersView` :126 `if answer.isOrphaned { row(answer) } else { NavigationLink... }` — logic ĐÚNG rồi (comment :124-125 giải thích), chỉ là **trông y hệt dòng bấm được**. `isOrphaned` = `question == nil` (`QAModels.swift:140`).

## Requirements

**#28** — 3 màn kéo-tay-làm-mới được, **kể cả lúc rỗng**.
**#29** — dòng mồ côi: mờ đi + ghi chú "câu hỏi gốc đã xoá".

⚠️ **KHÔNG sửa `QAModels.swift`** (`isOrphaned` sống ở đó) — chỉ đọc.

## Files

**Modify:** `NODIE/Features/Profile/MyContentViews.swift` · `NODIE/Localizable.xcstrings` (1 key)
**Create/Delete:** không.

## Implementation

1. `MyContentScaffold` nhận thêm `let onRefresh: () async -> Void`.
2. **Sửa cấu trúc scaffold** để rỗng cũng kéo được — `ScrollView` ra ngoài, nhánh isEmpty vào trong:
   ```
   ScrollView {
       if isEmpty {
           Text(emptyText)... .frame(minHeight: 320)   // đẩy chữ xuống giữa như Spacer cũ
       } else {
           LazyVStack(spacing: 0) { rows() }...
       }
   }
   .refreshable { await onRefresh() }
   ```
   - Nhánh `isLoading` **giữ nguyên** ngoài ScrollView: đang quay vòng lần đầu mà kéo lại là hai spinner chồng nhau.
   - ⚠️ `ScrollView` rỗng **không kéo được** nếu nội dung ngắn hơn khung → phải có `.frame(minHeight:)` hoặc `.frame(maxWidth:.infinity, minHeight: ...)`. Đây là lý do phải đổi cấu trúc chứ không chỉ dán `.refreshable`.
   - Comment VÌ SAO: *rỗng là lúc người ta muốn kéo nhất — "tôi vừa lưu mà, sao chưa thấy?". Để `.refreshable` trong nhánh else thì đúng lúc đó lại không kéo được.*
3. 3 call site truyền `onRefresh`:
   - `MyQuestionsView`: `{ rows = await qa.myQuestions() }`
   - `SavedQuestionsView`: `{ rows = await qa.savedQuestions() }`
   - `MyAnswersView`: `{ rows = await qa.myAnswers() }`
   **KHÔNG** đụng `isLoading` trong `onRefresh` — spinner của `.refreshable` là spinner riêng của hệ thống; bật `isLoading` sẽ nuốt luôn danh sách đang hiện thành màn quay vòng.
4. Rút phần gọi lặp thành helper trong mỗi view (`private func reload() async`) để `.task` và `onRefresh` dùng chung — DRY, và tránh `.task` set `isLoading` còn refresh thì không.
5. **#29** — trong `MyAnswersView`, nhánh mồ côi:
   ```
   if answer.isOrphaned {
       row(answer)
           .opacity(0.55)
           .accessibilityHint("Câu hỏi gốc đã xoá")
   }
   ```
   và trong `row(_:)`, cạnh `Text(answer.questionTitle)` — thêm ghi chú khi mồ côi. Vì `row` không biết ngữ cảnh → truyền cờ: `private func row(_ answer: MyAnswerRow)` đọc thẳng `answer.isOrphaned` (đã có sẵn trên model, không cần tham số mới).
   ```
   if answer.isOrphaned {
       Text("Câu hỏi gốc đã xoá")
           .font(NodieTypography.tag)
           .foregroundStyle(NodieColors.inkFaint)
   }
   ```
   Đặt cạnh badge "Hay nhất" trong `HStack` :159-168.
6. Key mới × 9 ngôn ngữ: `"Câu hỏi gốc đã xoá"`.

## Todo

- [x] `MyContentScaffold` + `onRefresh` + đổi cấu trúc ScrollView (rỗng kéo được)
- [x] 3 call site truyền `onRefresh`, không đụng `isLoading`
- [x] `reload()` helper dùng chung với `.task`
- [x] Dòng mồ côi: `.opacity(0.55)` + nhãn + `.accessibilityHint`
- [x] Key `"Câu hỏi gốc đã xoá"` × 9 ngôn ngữ
- [ ] Build xanh · `ProfileContentUITests` còn xanh — **chặn bởi lỗi ngoài phạm vi** (xem phase-01), `MyContentViews.swift` tự nó sạch lỗi.

## Success criteria

1. Cả 3 màn: kéo xuống → spinner hệ thống → danh sách cập nhật.
2. **Màn rỗng cũng kéo được** (không phải chờ có dữ liệu mới kéo được).
3. Kéo làm mới → danh sách đang hiện **không** chớp thành màn quay vòng.
4. Dòng mồ côi mờ hơn rõ rệt + có chữ "câu hỏi gốc đã xoá"; bấm vào không đi đâu (giữ nguyên hành vi cũ).

## Risks / Rollback

| Rủi ro | Mitigation |
|---|---|
| Đổi cấu trúc scaffold gãy layout 3 màn cùng lúc | `minHeight` thay `Spacer()`; chụp màn trước/sau cả 3. Nếu lệch → giữ `.refreshable` chỉ ở nhánh else + ghi nợ phần rỗng. |
| Plan 260717-1306 phase-02 cũng sửa file này | Họ chưa code. Commit trước, báo rebase (bảng ở plan.md). |
| `.opacity` làm chữ không đủ tương phản (a11y) | 0.55 trên `inkBody` vẫn đạt; kiểm bằng Accessibility Inspector. Nếu trượt → dùng `NodieColors.inkFaint` cho chữ thay vì opacity cả khối. |

**Rollback:** 1 commit, client-only, revert thẳng.
