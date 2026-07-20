# Phase 01 — Trạng thái gửi từng tin (mục 8)

**Model:** Opus (fast) — việc cơ khí, spec rõ, không đụng DB.
**Migration:** không. **Phụ thuộc:** không.

## Vấn đề

`statusLabelMessageId(in:)` chỉ gắn nhãn "Đã xem" cho **tin cuối cùng của mình**. Cuộn
ngược lên không tin nào nói được nó đã tới chưa. Zalo/Messenger gắn trạng thái cho **mỗi**
tin mình gửi — đó là cách người ta biết tin nào rơi.

## Yêu cầu

Mỗi tin CỦA MÌNH mang một trạng thái:

| Trạng thái | Điều kiện | Hiện |
|---|---|---|
| Đang chờ mạng | `store.isQueued(id)` | nhãn "Đang chờ mạng…" (đã có) |
| Đang tải lên | `pendingMedia[id] != nil` | overlay upload (đã có) |
| Đã gửi | có trên server | ✓ |
| Đã xem | có thành viên khác `last_read_at >= createdAt` | ✓✓ |

DM: "đã xem" là người kia đọc. Nhóm/kênh: đủ **một** người khác đọc là ✓✓ (không đếm số —
đếm người đọc là metric trên NGƯỜI, chạm anti-pattern; xem CLAUDE.md).

## Nguồn dữ liệu

`channel_members.last_read_at` — đã realtime từ 0041. Hiện `members(of:)` chỉ select
`user_id, display_name`; cần thêm `last_read_at`.

`0042_server_clock_last_read_at` đặt mốc bằng đồng hồ SERVER → so sánh với `createdAt`
(cũng của server) là cùng hệ quy chiếu, không lệch do đồng hồ máy.

## Files

- `ConversationStore.swift` — thêm `readAtByMember[channelId: [UUID: Date]]`, nạp cùng
  `members(of:)`, cập nhật khi realtime bắn UPDATE `channel_members`.
- `ConversationStoreRealtime.swift` — subscribe UPDATE trên `channel_members` của kênh
  đang mở (0041 đã bật realtime cho bảng này).
- `ChatDetailView.swift` — `MessageBubbleView` nhận `deliveryState`, vẽ ✓/✓✓ cạnh giờ.
  **Gỡ** `statusLabelMessageId` + `seenStatusLabel` (nhãn "Đã xem" tin cuối) — thay chứ
  không chồng hai cách nói cùng một chuyện.

## Các bước

1. `readAtByMember` + nạp trong `loadMembers`.
2. Realtime UPDATE `channel_members` → vá map, không refetch cả danh sách.
3. `deliveryState(for:)` trong store (một chỗ quyết định, view chỉ vẽ).
4. Vẽ ✓/✓✓ trong `MessageBubbleView`, chỉ khi `isMine`.
5. Gỡ nhãn "Đã xem" cũ + test liên quan (`ChatDetailUITests` có chạm nhãn này không — kiểm
   trước khi xoá).

## Xong khi

- Cuộn ngược 50 tin: mỗi tin của mình có ✓ hoặc ✓✓, tin người khác không có gì.
- Người kia đọc → ✓ đổi ✓✓ trong ~1s (realtime), không cần rời màn.
- Offline: tin mới vẫn hiện "Đang chờ mạng…", không hiện ✓ sai sự thật.

## Rủi ro

- Map `last_read_at` sai chiều → mọi tin thành "đã xem" ngay khi gửi. Test bằng HAI máy /
  hai tài khoản thật, không suy luận.
- Kênh đông thành viên: `readAtByMember` chỉ cần MAX của người khác — giữ nguyên map nhưng
  tính max một lần mỗi render, đừng quét trong từng bong bóng (bẫy O(n²) đã ghi ở `body`).
