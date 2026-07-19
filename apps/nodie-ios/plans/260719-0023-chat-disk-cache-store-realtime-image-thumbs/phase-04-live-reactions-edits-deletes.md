# Phase 04 — Reaction/sửa/xoá của người khác hiện LIVE

**Model đề xuất:** Fable — mở rộng subscription toàn cục phase 02, cùng vùng bẫy WALRUS/decode.

## Đã verify prod (19/07 ~04:00)

- `message_reactions` ĐÃ nằm trong publication `supabase_realtime`.
- PK composite `(message_id, user_id, kind)` → DELETE event mang đủ 3 cột trong `old_record`
  (replica identity default = PK) — xử lý local được, KHÔNG cần round-trip.

## Thiết kế

Cùng channel `room:messages` của phase 02, thêm 4 stream (khai TRƯỚC `subscribe()`):
- `UpdateAction` trên `messages` → `handleMessageUpdate`: `deleted_at` non-null → gỡ khỏi RAM +
  đĩa; ngược lại thay `body`/`edited_at` tại chỗ (`replacingBody`). Tin không trong RAM → bỏ qua
  (đĩa tự lành ở lần replace kế).
- `InsertAction` + `DeleteAction` trên `message_reactions` → `handleReaction(added:)`: event không
  mang `channel_id` → tìm tin trong `messagesByChannel` các kênh đã nạp; append/remove
  `ReactionRow` local. Dedup với optimistic toggle của chính mình (contains-check trước khi append).
- `globalRealtimeTask` đơn → mảng `globalRealtimeTasks` (5 stream 5 task).

Timestamp trong payload là chuỗi ISO8601 ± fractional → helper parse thử cả hai formatter.

## Files

- `ConversationStore.swift`: đổi task đơn → mảng.
- `ConversationModels.swift`: thêm `MessageRow.replacingBody`.
- `ConversationStoreRealtime.swift`: 4 stream + 2 handler + parse helper.

## Nghiệm thu

Build sạch (gate BỎ theo lệnh Đăng 19/07). 2 tài khoản: B thả/gỡ ❤️, sửa, xoá tin trong lúc A
đang mở chat → A thấy trong ~1s không refresh.
