# Phase 02 — Realtime cấp store + scenePhase catch-up

**Model đề xuất:** Fable — hành vi phụ thuộc RLS/WALRUS trên prod; phải test bằng HTTP/socket thật
với tài khoản role='user'. Build xanh không chứng minh gì.

## Context

- `NODIE/Features/Conversations/ConversationStoreRealtime.swift` — hiện per-channel
  `subscribe(to:)`/`unsubscribe(from:)`, chỉ gọi từ `ChatDetailView.swift:198,204`.
- Pattern giữ nguyên: event = tiếng chuông, data nạp lại qua PostgREST `messageSelect`
  (payload không có author nhúng; tự decode là "Ẩn danh" — bug đã vá 17/07).
- `RootTabView.swift` — chưa đọc `scenePhase` ở đâu trong app.

## Yêu cầu

- Đứng BẤT KỲ đâu trong app: tin mới đến → badge tab Chat nhảy, kênh nổi lên đầu danh sách,
  unread kênh tăng — không cần kéo-refresh.
- App về từ background: socket sống lại + fetch bù tin đến trong lúc nền.
- Kênh/DM mới toanh (mình vừa được thêm) → xuất hiện trong danh sách.

## Thiết kế

**MỘT subscription toàn bảng** thay vì N per-channel: `postgres_changes` INSERT trên `messages`
KHÔNG filter — WALRUS kiểm RLS per-subscriber nên chỉ nhận tin của kênh mình đọc được.
(Ghi chú nợ scale Broadcast giữ nguyên ở đầu file.)

Sửa `ConversationStoreRealtime.swift`:

- `startRealtime()` — mở channel `room:messages`, lắng `InsertAction`. Idempotent (đang mở → no-op).
- `stopRealtime()` — huỷ task + unsubscribe.
- Handler mỗi event (đọc `channel_id`, `user_id`, `created_at` từ `record` AnyJSON, KHÔNG decode cả row):
  1. `channel_id` lạ (chưa có trong `channels`) → `loadChannels()` (kênh/DM mới).
  2. Cập nhật `lastMessageAt` của kênh local + re-sort `channels` (mới nhất lên đầu).
  3. `messagesByChannel[ch] != nil` → `fetchNewMessages(channelId:)` như cũ (khử trùng theo id,
     lọc blocked, ghi disk cache phase 01).
  4. Unread: tin của người khác VÀ `ch != visibleChannelId` → `unreadByChannel[ch] += 1`.
     Tin của mình hoặc kênh đang mở → không tăng (markRead hiện hành lo phần còn lại).
- `visibleChannelId: UUID?` mới trên store — `ChatDetailView` set khi vào màn, clear khi rời
  (THAY THẾ cặp `subscribe(to:)`/`unsubscribe(from:)` hiện tại; per-channel subscription XOÁ HẲN,
  `liveChannels`/`liveTasks` per-channel gỡ bỏ).
- Khi vào màn chat vẫn gọi `fetchNewMessages` một phát catch-up (đề phòng event rơi giữa đường).

**Vòng đời** (`RootTabView`):
- `.task` sau `warmFromDisk`/`loadChannels` → `startRealtime()`.
- `@Environment(\.scenePhase)`: `.active` → `stopRealtime()` rồi `startRealtime()` (socket cũ coi
  như chết, không tin auto-reconnect) + `loadChannels()` + `fetchNewMessages(visibleChannelId)`.
  `.background` → `stopRealtime()`.
- Đăng xuất → `stopRealtime()`.

## Files

- Sửa: `ConversationStoreRealtime.swift` (viết lại phần lớn), `ConversationStore.swift`
  (visibleChannelId, bỏ liveChannels/liveTasks per-channel), `ChatDetailView.swift` (đổi 2 call site),
  `RootTabView.swift` (scenePhase + start).

## Bẫy phải né

1. **Verify trên prod bằng tài khoản role='user'**: gửi tin từ tài khoản B, xác nhận A nhận event
   kênh chung VÀ KHÔNG nhận event kênh riêng mà A không phải thành viên. Admin ngắn mạch RLS = không test gì.
2. Realtime authorization: bảng `messages` phải nằm trong publication `supabase_realtime` — đã bật
   ở 0023, nhưng xác nhận lại bằng psql (`select * from pg_publication_tables`).
3. Event đến DỒN (nhiều tin liên tiếp) → `fetchNewMessages` đã keyset theo `last.createdAt`, gọi
   chồng vẫn đúng nhờ khử trùng id; không cần debounce ở v1.
4. Badge tổng `totalUnread` đã lọc muted — bump unread cho kênh muted vẫn đúng (chỉ badge tab im).
5. Đổi chuỗi select/subscription → test bằng socket thật, không tin compile.

## Nghiệm thu

- 2 máy/simulator 2 tài khoản user: gửi từ B trong khi A đứng ở danh sách Chat → hàng kênh nổi lên
  đầu + unread tăng không cần kéo. A đứng tab Hỏi đáp → badge tab Chat nhảy.
- A background 30s, B gửi 3 tin, A quay lại → 3 tin hiện trong vài giây không cần refresh.
- `run-uitest-gate.sh 3` xanh.
