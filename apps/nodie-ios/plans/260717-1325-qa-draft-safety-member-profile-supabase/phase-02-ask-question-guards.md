# Phase 02 — #23 + #27: Huỷ phải hỏi lại, nút xám phải nói lý do

**Ưu tiên:** P1. **Status:** chưa bắt đầu. **Đụng độ:** THẤP — `AskQuestionView.swift` không ai giữ.

## Context

- `AskQuestionView.swift:78-87`: nút "Huỷ" gọi thẳng `dismiss()`. Màn đã dùng `fullScreenCover` để chống vuốt-nhầm — nhưng cửa trước vẫn mở toang.
- `AskQuestionView.swift:53-55`: `canAsk = title.trimmed.count > 6 && !sending`. Không một chữ giải thích.
- Đã có sẵn `hasText` (:38) = `combined` (title + context) không rỗng → dùng lại, không tính lại.

## Requirements

**#23** — Huỷ khi đang có nháp → `.confirmationDialog` xác nhận. Ô trống → dismiss thẳng (hỏi khi chẳng có gì để mất là làm phiền).
**#27** — Tiêu đề chưa đủ 7 ký tự → hiện lý do. **Chỉ hiện khi đã gõ** — ô còn trống nghĩa là chưa ai làm gì sai, mắng lúc đó là mắng oan.

## Files

**Modify:** `NODIE/Features/QA/AskQuestionView.swift` (268 dòng — **đã quá 200**, xem Risks) · `NODIE/Localizable.xcstrings`
**Create/Delete:** không (xem Risks về tách file).

## Implementation

1. Thêm `@State private var showDiscardConfirm = false`.
2. Nút Huỷ (:78-87) → `Button { hasText ? (showDiscardConfirm = true) : dismiss() }`.
   Comment VÌ SAO: *fullScreenCover đã chặn vuốt-nhầm rồi; nút Huỷ mà bỏ nháp không hỏi thì cửa sau khoá còn cửa trước mở.*
3. `.confirmationDialog("Bỏ câu hỏi đang viết?", isPresented: $showDiscardConfirm, titleVisibility: .visible)` với:
   - `Button("Bỏ", role: .destructive) { dismiss() }`
   - `Button("Tiếp tục viết", role: .cancel) {}`
   Đặt trên `header` hoặc thân `body` — KHÔNG đặt trong `ScrollView` (dialog gắn vào view có thể bị huỷ khi cuộn).
4. #27 — thêm computed:
   ```
   /// Đã gõ mà tiêu đề chưa đủ dài. Ô trống KHÔNG tính: lúc đó người ta chưa làm gì sai.
   private var titleTooShort: Bool {
       let t = title.trimmingCharacters(in: .whitespacesAndNewlines)
       return !t.isEmpty && t.count <= 6
   }
   ```
   ⚠️ Bám đúng `canAsk`: `> 6` ⇒ hint là `<= 6`. Đừng viết `< 7` ở một chỗ và `> 6` ở chỗ kia rồi lệch nhau.
5. Hiện hint dưới `titleField`:
   ```
   if titleTooShort {
       Text("Tiêu đề cần dài hơn 6 ký tự để mọi người hiểu bạn đang hỏi gì.")
           .font(NodieTypography.metaSm)
           .foregroundStyle(NodieColors.inkMuted)
   }
   ```
   KHÔNG tô đỏ báo động — đây là chỉ dẫn, không phải lỗi.
6. `.accessibilityHint` cho nút "Chiếu sáng" khi `!canAsk` — VoiceOver không thấy được chữ hint đặt cạnh.
7. Key mới × 9 ngôn ngữ: `"Bỏ câu hỏi đang viết?"`, `"Bỏ"`, `"Tiếp tục viết"`, `"Tiêu đề cần dài hơn 6 ký tự để mọi người hiểu bạn đang hỏi gì."`. Grep `"Huỷ"` trước — đã có.

## Todo

- [x] `showDiscardConfirm` + nút Huỷ rẽ nhánh theo `hasText`
- [x] `.confirmationDialog` bỏ nháp
- [x] `titleTooShort` + hint dưới titleField
- [x] `.accessibilityHint` nút Chiếu sáng
- [x] 4 key × 9 ngôn ngữ
- [ ] Build xanh — **chặn bởi lỗi ngoài phạm vi** (xem phase-01), `AskQuestionView.swift` tự nó sạch lỗi.

## Success criteria

1. Gõ dở → bấm Huỷ → hỏi "Bỏ câu hỏi đang viết?" → "Tiếp tục viết" thì chữ còn nguyên; "Bỏ" thì đóng.
2. Ô trống → bấm Huỷ → đóng ngay, **không hỏi**.
3. Gõ "abc" → hint hiện. Xoá hết → hint biến mất. Gõ đủ 7 ký tự → hint biến mất, nút sáng lên.
4. VoiceOver đọc được lý do nút bị tắt.

## Risks / Rollback

| Rủi ro | Mitigation |
|---|---|
| **File 268 dòng, vượt luật <200** — phase này còn thêm ~20 dòng | Không tách trong phase này: tách `AskQuestionView` = đụng `fieldRules`/`detectedTag` (logic AI phân loại) → rủi ro cao hơn lợi. **Ghi nợ**: tách `AskQuestionFields.swift` ở vòng sau. Cần lead gật. |
| `confirmationDialog` đặt sai chỗ → không hiện | Đặt ở tầng `body`/`header`, không trong ScrollView. Test tay. |
| Hint nhảy layout khi hiện/ẩn | Chấp nhận — hint chỉ hiện lúc đang gõ dở, không phải trạng thái thường trực. Nếu giật quá thì `.animation(.easeOut, value: titleTooShort)`. |

**Rollback:** 1 commit độc lập, client-only, revert thẳng.
