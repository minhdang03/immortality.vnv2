# Phase 04 — #30 + #31: giờ tự trôi + copy được thân câu hỏi

**Ưu tiên:** P2. **Status:** chưa bắt đầu. **Chạy SAU 01 và 03** (chồng file: QuestionDetailView, AnswerCardView, MyContentViews).

## Context

- `QAModels.swift:35,83,110,138`: `var relativeTime: String { RelativeTime.format(createdAt) }` — computed, **tính lại mỗi lần render**. Vấn đề không nằm ở model: model đúng. Vấn đề là **không ai bảo view dựng lại** → "2 phút trước" đứng im mãi.
- ⚠️ **KHÔNG SỬA `QAModels.swift`** — đã chốt. TimelineView chỉ cần bọc ở **tầng VIEW**. ✅ **Xác nhận: giải pháp này KHÔNG cần đụng model một dòng nào** — `TimelineView(.everyMinute)` ép body dựng lại mỗi phút, computed property tự cho ra chuỗi mới.
- ⚠️ **KHÔNG SỬA `QuestionListView.swift`** (:162 cũng hiện relativeTime) — session kia từng giữ. **Ghi nợ:** màn danh sách vẫn đứng im, xử ở vòng sau.
- `AnswerCardView.swift:33-40` **đã có** `.contextMenu` copy + `import UIKit` (:2). `QuestionDetailView.swift:50-57` thân câu hỏi **không có**, và file **chưa `import UIKit`** (:1 chỉ có SwiftUI).

## Requirements

**#30** — chuỗi thời gian tương đối tự cập nhật mỗi phút, không cần rời màn. Chỗ hiện: `QuestionDetailView:45` · `AnswerCardView:78` · `MyContentViews:165` · `AnswerReplyRow:24`.
**#31** — giữ thân câu hỏi → "Sao chép", khớp đúng cái đã có ở câu trả lời.

## Files

**Create:** `NODIE/Components/NodieRelativeTimeText.swift` (~25 dòng)
**Modify:** `QuestionDetailView.swift` · `AnswerCardView.swift` · `AnswerReplyRow.swift` · `MyContentViews.swift`
**Delete:** không. **KHÔNG đụng:** `QAModels.swift`, `QuestionListView.swift`.

## Implementation

1. **Component dùng chung** — DRY, và 1 chỗ để sau này đổi nhịp:
   ```swift
   import SwiftUI

   /// Chuỗi "2 phút trước" TỰ TRÔI.
   ///
   /// `relativeTime` bên model là computed — nó luôn trả đúng giờ hiện tại mỗi lần được
   /// hỏi. Cái thiếu là không ai HỎI LẠI: SwiftUI chỉ dựng lại body khi state đổi, mà
   /// thời gian trôi không phải state. TimelineView chính là cái đồng hồ gõ cửa mỗi phút.
   ///
   /// `.everyMinute` chứ không `.periodic(1s)`: đơn vị nhỏ nhất RelativeTime nói ra là
   /// phút — gõ mỗi giây là dựng lại 60 lần cho một chuỗi y hệt.
   struct NodieRelativeTimeText<Content: View>: View {
       @ViewBuilder let content: () -> Content
       var body: some View {
           TimelineView(.everyMinute) { _ in content() }
       }
   }
   ```
   ⚠️ Nhận `@ViewBuilder` chứ không nhận `Date` rồi tự vẽ `Text`: 4 chỗ hiện thời gian có **4 kiểu ghép chuỗi khác nhau** (`"\(authorName) · \(relativeTime)"`, `"\(relativeTime) · ☀ \(litCount)"`…). Ép chung một khuôn `Text` là phải viết 4 tham số định dạng — bọc thì rẻ hơn.
2. Bọc 4 chỗ:
   - `QuestionDetailView:45` → `NodieRelativeTimeText { Text(verbatim: "\(question.authorName) · \(question.relativeTime)")... }`
   - `AnswerCardView:78` → bọc `Text(answer.relativeTime)`
   - `AnswerReplyRow:24` → bọc chuỗi thời gian
   - `MyContentViews:165` → bọc `Text(verbatim: "\(answer.relativeTime) · \(NodieGlyph.sun) \(answer.litCount)")`
3. **Bọc HẸP, không bọc cả card.** TimelineView dựng lại toàn bộ cây con mỗi phút — bọc cả `AnswerCardView` là mỗi phút dựng lại cả danh sách reply lồng nhau. Chỉ bọc đúng dòng `Text`.
4. **#31** — `QuestionDetailView`: thêm `import UIKit` (dòng 2, kèm comment `// UIPasteboard — SwiftUI không re-export`, **copy y hệt `AnswerCardView.swift:2`**).
5. Thêm `.contextMenu` vào thân câu hỏi (:50-57), **copy đúng hình dáng `AnswerCardView:34-40`**:
   ```
   .contextMenu {
       Button { UIPasteboard.general.string = body } label: {
           Label("Sao chép", systemImage: "doc.on.doc")
       }
   }
   ```
   Key `"Sao chép"` **đã có** trong catalog (AnswerCardView dùng) → **không thêm key mới ở phase này**. Grep xác nhận trước.
6. ⚠️ Copy **thân bài** (`question.body`), không copy tiêu đề — khớp với câu trả lời (copy `answer.body`). Tiêu đề có `.textSelection` riêng thì tính sau, đừng nhét 2 mục vào 1 menu.

## Todo

- [x] `NodieRelativeTimeText.swift` mới (`NODIE/Components/`)
- [x] `xcodegen generate` (file đã lên target — build không báo thiếu module)
- [x] Bọc 4 chỗ hiện thời gian (hẹp, không bọc cả card)
- [x] `import UIKit` + `.contextMenu` cho thân câu hỏi
- [x] Grep xác nhận `"Sao chép"` đã có key
- [ ] Build xanh — **chặn bởi lỗi ngoài phạm vi** (xem phase-01), 4 file của phase 04 tự chúng sạch lỗi.
- [ ] Ghi nợ: `QuestionListView:162` chưa xử

## Success criteria

1. Mở màn chi tiết, để yên 60s → "2 phút trước" tự thành "3 phút trước", **không chạm gì**.
2. Không giật/chớp mỗi phút; cuộn vẫn mượt (bọc hẹp, không dựng lại cả card).
3. Giữ thân câu hỏi → "Sao chép" → dán ra Notes đúng nội dung.
4. Menu ở thân câu hỏi trông y hệt menu ở câu trả lời.

## Risks / Rollback

| Rủi ro | Mitigation |
|---|---|
| TimelineView dựng lại quá rộng → tốn pin / cuộn giật | Bọc đúng dòng `Text`, không bọc card. `.everyMinute` không phải `.periodic`. |
| `.everyMinute` gõ theo mốc phút của hệ thống, không phải mốc 60s kể từ lúc mở → có lúc đợi tới 59s mới đổi | Chấp nhận: sai số dưới 1 phút trên chuỗi làm tròn theo phút là vô hình. Đổi sang `.periodic(from:by:60)` chỉ khi thật sự thấy vấn đề. |
| TimelineView trong `LazyVStack` (MyContentViews) × nhiều dòng = nhiều đồng hồ | Chỉ dòng đang hiện trên màn mới sống (Lazy). Chấp nhận. |
| Chồng file với phase 01/03 | **Chạy sau cùng.** Rebase nếu 01/03 đã commit. |

**Rollback:** 1 commit, client-only. Revert = xoá file component + gỡ 4 chỗ bọc.
