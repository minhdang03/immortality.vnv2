# Phase 01 — GRDB disk cache cho channels + messages

**Model đề xuất:** Fable — tích hợp vào ConversationStore nhiều bẫy đã trả giá; sai một điểm
(nuốt bong bóng pending, lộ cache người cũ) là bug P0 khó thấy.

## Context

- `NODIE/Features/Conversations/ConversationStore.swift` — nguồn sự thật RAM; `channels`,
  `messagesByChannel`, `unreadByChannel`, `pendingMedia`.
- `NODIE/Features/Conversations/ConversationModels.swift` — `ChannelRow`/`MessageRow` đã Codable.
- `project.yml` — SPM packages; sau khi sửa PHẢI `xcodegen generate`.
- Khuôn tham chiếu: `SignedURLCache.clear()` gọi lúc đăng xuất → cache mới cũng phải wipe cùng chỗ.

## Yêu cầu

- Mở app (cold start) → tab Chat vẽ danh sách kênh + unread từ đĩa ngay, không spinner nếu có cache.
- Mở một chat → 50 tin gần nhất hiện ngay từ đĩa, network sync chạy sau và thay bằng bản server.
- Cache theo NGƯỜI: đăng xuất hoặc đổi tài khoản → wipe sạch, không lộ tin người cũ.
- Bong bóng đang gửi (`pendingMedia`) sống trong RAM, KHÔNG persist (đóng app đang gửi thì mất — đúng thiết kế hiện tại).

## Thiết kế

**File mới:** `NODIE/Features/Conversations/ChatDiskCache.swift` (~200 dòng, actor hoặc final class
với DatabaseQueue riêng — GRDB DatabaseQueue tự an toàn đa luồng).

Schema (payload = JSON blob của Codable row — KHÔNG map từng cột, KISS; cột rời chỉ để index/sort):

```sql
meta(key TEXT PRIMARY KEY, value TEXT)                -- schema_version, owner_uid
channel_snapshot(id TEXT PRIMARY KEY, sort_at REAL, unread INTEGER NOT NULL DEFAULT 0,
                 payload BLOB NOT NULL)
message_snapshot(id TEXT PRIMARY KEY, channel_id TEXT NOT NULL, created_at REAL NOT NULL,
                 payload BLOB NOT NULL)
CREATE INDEX idx_msg_channel_time ON message_snapshot(channel_id, created_at)
```

- Vị trí: `Application Support/chat-cache.sqlite`, `isExcludedFromBackup = true`.
- JSON encode/decode TỰ NHẤT QUÁN (ISO8601 fractional seconds) — không đụng decoder của SDK.
- `owner_uid` khác uid hiện tại → wipe toàn bộ trước khi dùng. Migration = bump `schema_version`
  → wipe (cache là cache, không cần migrate dữ liệu).
- Trim: giữ tối đa 200 tin/kênh; xoá `message_snapshot` của kênh không còn trong danh sách.

**Điểm ghi (fire-and-forget Task, không chặn UI):**
- `loadChannels` thành công → replace toàn bộ `channel_snapshot`.
- `loadUnreadCounts` thành công → update cột `unread`.
- `loadMessages` trang đầu thành công → delete rows của kênh + insert 50 tin server (replace,
  để tin đã xoá mềm trên server biến mất khỏi đĩa). Trang cũ hơn (`before`) → insert thêm.
- `fetchNewMessages` (Realtime) append → insert.
- `send`/`uploadPending` server ack thành công → insert row đã xác nhận (author nil OK — view so `userId`).
- `deleteMessage` thành công → delete row. `edit` → đã gọi `loadMessages` nên tự replace.
- `leave` → xoá rows kênh đó.

**Điểm đọc:**
- `warmFromDisk()` mới trong ConversationStore — RootTabView `.task` gọi TRƯỚC `loadChannels`:
  nạp channels + unread vào RAM nếu `channels.isEmpty`.
- `loadCachedMessages(channelId:)` — ChatDetailView gọi trước `loadMessages`: chỉ apply nếu
  `messagesByChannel[id] == nil` (KHÔNG clobber RAM mới hơn bằng đĩa cũ), xong gọi
  `reattachPendingRows` (bẫy đã trả giá: trang đầu thay cả mảng nuốt bong bóng đang gửi).
- `loadChannels` giữ `isLoading` spinner CHỈ khi chưa có kênh nào (cached hay không).

**Wipe:** chỗ đăng xuất đang gọi `SignedURLCache.shared.clear()` — thêm `ChatDiskCache.clear()`.

## Files

- Sửa: `project.yml` (GRDB from 7.0.0), `ConversationStore.swift`, `ChatDetailView.swift`
  (gọi loadCachedMessages), `RootTabView.swift` (warmFromDisk), chỗ sign-out (AuthStore/SettingsView).
- Mới: `ChatDiskCache.swift`. Sau đó `xcodegen generate`.

## Bẫy phải né

1. Disk load KHÔNG được ghi đè optimistic rows — thứ tự: disk → reattach pending → network replace.
2. Blocked users: accessor `messages(for:)` đã lọc lúc đọc → đĩa cứ lưu thô, lọc vẫn ở accessor (DRY).
3. GRDB import làm SourceKit báo bậy "No such module" — chỉ tin `xcodebuild`.
4. Không persist `loadError`/`messageLoadErrors` — lỗi là trạng thái phiên.

## Nghiệm thu

- Build sạch; mở app airplane-mode sau lần chạy đầu → danh sách + tin vẫn hiện.
- Đăng xuất → đăng nhập tài khoản khác → không thấy tin người cũ (kiểm bằng 2 tài khoản role='user').
- `run-uitest-gate.sh 3` xanh (chạy cuối phase, sau khi tích hợp xong).
