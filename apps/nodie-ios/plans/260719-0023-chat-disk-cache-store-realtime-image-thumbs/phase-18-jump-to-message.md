# Phase 18 — Nhảy tới đúng tin từ kết quả tìm kiếm

**Model:** Fable — keyset pagination hai chiều + cảm biến cuộn (atBottom/unseen) dễ vỡ.

## Thiết kế

- Kết quả search (phase 12) tap → mở kênh VÀ cuộn tới đúng tin, nháy nền một nhịp.
- Điều hướng: `AppState.openChat(_:scrollTo:)` mang thêm `messageId?`; ChatRoute vẫn chỉ chở
  channelId, còn target để `AppState.pendingScrollTarget: [channelId: messageId]` (đọc-rồi-xoá,
  cùng khuôn push pendingChannelId).
- Store `loadWindow(around:channelId:)`: nếu tin đã trong `messagesByChannel` → thôi. Chưa có
  → hai query keyset: ≤25 tin `created_at <=` target (desc) + ≤25 tin `created_at >` target
  (asc), ghép cũ→mới, THAY mảng (reattach pending), ghi đĩa. Trả về để view biết đã sẵn.
- ChatDetailView `.task`: nếu có pendingScrollTarget cho kênh này → gọi loadWindow, rồi
  `proxy.scrollTo(id, anchor:.center)` + set `flashMessageId` (nháy nền 1.2s rồi tự tắt).
  KHÔNG chạy cú "mở ở đáy" mặc định khi có target.
- Bong bóng nhận `isFlashing` → overlay accent mờ dần.

## Bẫy

- `atBottom`/`unseen`: nhảy tới giữa chat làm atBottom=false — đúng, nhưng đừng để onChange
  messages.count bơm unseen oan lúc loadWindow thay mảng (nó chỉ bơm khi new>old VÀ !atBottom;
  loadWindow set trước khi user thấy nên OK, kiểm lại).
- Tin nằm ngoài cả window (rất cũ) vẫn tải được vì query theo target, không theo trang hiện có.

## Files

Sửa: AppState (openChat overload + pendingScrollTarget), ConversationStore (loadWindow),
ChatDetailView (.task xử target + flash), ConversationListView (tap hit truyền messageId),
MessageBubbleView (isFlashing). xcstrings nếu có chuỗi mới.

## Nghiệm thu

Build sạch. Search tin cũ (ngoài 50 tin đầu) → tap → chat mở đúng chỗ tin đó, nháy nền; cuộn
lên/xuống quanh đó có tin trước/sau (không kẹt một tin trơ trọi).
