# Vá giật khi cuộn/gõ — NODIE

Status: in progress · 1 phase · không đổi UI, không đổi hành vi.

## Bối cảnh

3 lỗi render đã xác minh bằng đọc code (không phải suy đoán):

| # | Chỗ | Lỗi | Vá |
|---|---|---|---|
| 1 | `QuestionDetailView.swift:40,96` | `VStack` + `ForEach(answers)` → 40 trả lời dựng một lúc, state đổi vẽ lại hết | `LazyVStack` |
| 2 | `AnswerCardView.swift:27` → `QAStore.flatReplies` (`QAStore.swift:225`) | DFS + cấp phát dict chạy trong `body`, mọi answer, mọi keystroke → O(answer × reply) | cache dựng lúc GHI, view chỉ tra dict |
| 3 | `ConversationModels.swift:309` + `QAModels.swift:266` | `DateFormatter()` mới cho MỖI bong bóng / mỗi item cũ >7 ngày | `static let` dùng chung |

## Quyết định thiết kế (#2)

`repliesByAnswer` bị ghi ở **11 chỗ** rải qua 4 file (QAStore, Undo, OwnContent, Moderation).
Gọi rebuild thủ công ở từng chỗ = sót một chỗ là UI đứng hình.

⇒ dùng `didSet` trên `repliesByAnswer` + `blockedUserIds` làm **choke point duy nhất** —
mọi ghi, kể cả `subscript`/`append`, đều đi qua setter nên đều kích hoạt.

Đã kiểm chứng `didSet` có chạy dưới `@Observable` bằng chương trình Swift thật
(macro giữ nguyên property observer) — không đoán.

Cache đánh `@ObservationIgnored`: nó là dữ liệu dẫn xuất, view đã phụ thuộc vào
`repliesByAnswer` rồi; đăng ký thêm một nguồn quan sát nữa chỉ tổ vẽ lại thừa.

**Đổi chiều tính toán**: từ "tính mỗi lần vẽ" (nhiều, mỗi keystroke)
sang "tính mỗi lần dữ liệu đổi" (hiếm, theo sự kiện mạng).

## Ngoài phạm vi

- `FeedView.swift:14` — cũng `VStack` không Lazy nhưng đang chạy MockData 6 item.
  Đăng đã chốt: chưa đau, để lại. Sẽ đau khi lên data thật.
- Bọc `UICollectionView` UIKit cho màn chat (để bằng Telegram/Zalo, vốn dùng
  AsyncDisplayKit render off-main-thread). Việc lớn, chưa cần ở quy mô hiện tại.
  Ba vá trên đưa từ "giật thấy rõ" → "mượt đủ dùng", không phá trần SwiftUI.

## Nghiệm thu

- [ ] `xcodebuild` xanh
- [ ] `flatReplies` không còn DFS trong đường vẽ
- [ ] Không còn `DateFormatter()` khởi tạo trong computed property nào chạy mỗi row
- [ ] Reply hiện/mất đúng sau: gửi reply, sửa, xoá, hoàn tác, chặn/bỏ chặn người
      (5 đường ghi phải thấy cache cập nhật)
- [ ] Chuỗi hiển thị y hệt trước (format không đổi, chỉ đổi chỗ khởi tạo formatter)
