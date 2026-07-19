# Phase 13 — Polish tốc độ render (mượt kiểu WhatsApp/Zalo)

**Model đề xuất:** Fable — refactor đường nóng của body view, sai một chỗ là UI stale khó thấy.

## Chẩn đoán (đo bằng đọc code, 19/07 trưa)

1. **O(n²) mỗi render ở ChatDetailView**: `messages` là computed gọi `store.messages(for:)`
   (filter+map cả mảng). Mỗi ROW lại gọi `senderLabel` (3 lượt truy cập `messages`) +
   `replyTarget` (1 lượt + scan tìm parent) + `statusLabelMessageId` (scan) ⇒ ~4n lượt
   accessor × O(n) = O(n²), chạy MỖI PHÍM GÕ (draft binding re-render). 150 tin ≈ 90k phép
   toán/khung hình trên máy cũ = jank thấy được.
2. **Ảnh decode lười trên main**: `UIImage(data:)` decode bitmap ở LẦN VẼ ĐẦU — cuộn tới ảnh
   mới là khựng đúng lúc nó lên màn.

## Sửa

1. Chụp một lần mỗi render: `let rows = messages` + `parentById` dict + `statusId` ở đầu
   body; `senderLabel(at:in:)`/`statusLabelMessageId(in:)` nhận mảng, replyTarget = tra dict
   O(1). Xoá helper cũ.
2. `ChatRemoteImage`: sau decode gọi `byPreparingForDisplay()` (ép decode NGAY, ngoài main)
   rồi mới cache/hiện.

## Nghiệm thu

Build sạch; hành vi y nguyên (label tên, quote reply, nhãn Đã xem/chờ mạng đúng như cũ).
Cảm quan: gõ phím trong chat dài không giật; cuộn qua ảnh không khựng.
