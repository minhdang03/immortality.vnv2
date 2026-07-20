# Phase 02 — Gộp album nhiều ảnh (mục 11)

**Model:** Opus (fast) — cơ khí; `metadata` là jsonb nên không cần migration.
**Migration:** không. **Phụ thuộc:** không (dựng trên `ChatCaptionSheet` vừa ship `d70259c`).

## Vấn đề

Gửi 6 ảnh ra 6 bong bóng rời, chiếm hết màn và đẩy ngữ cảnh lên trên. Messenger/Zalo gộp
thành một lưới. Chú thích (vừa làm ở đợt 1) gắn tin cuối cũng đang trông rời rạc vì thế.

## Cách làm

**Không đổi schema.** Mỗi ảnh vẫn là một hàng `messages` riêng — giữ nguyên xoá/reply/
reaction/forward theo từng ảnh, và giữ nguyên hàng đợi offline. Chỉ thêm một khoá nhóm vào
`metadata` (jsonb, tự do):

```
metadata.media.album_id = <uuid sinh ở client cho mỗi lượt gửi>
```

View gộp các tin **liên tiếp** cùng `album_id` + cùng người gửi thành MỘT bong bóng lưới.
Liên tiếp là điều kiện bắt buộc: tin người khác chen vào giữa thì hai nửa album tách ra —
đúng thứ tự thời gian, không nhảy cóc.

## Bố cục lưới

| Số ảnh | Lưới |
|---|---|
| 2 | 2 cột |
| 3 | 1 lớn trái + 2 nhỏ phải |
| 4 | 2×2 |
| 5–6 | 3 cột |

Trần 6 (đúng `maxSelectionCount` của picker). Cạnh lưới = `maxBubbleWidth` (78% khung, đã
có từ đợt 1). Ảnh cắt vuông `scaledToFill` + `clipped`.

## Files

- `ConversationModels.swift` — `MessageMedia` thêm `albumId: UUID?` (CodingKey `album_id`).
- `ConversationStore.swift` — `sendMedia(albumId:)` truyền xuống `MessageMedia`.
- `ChatDetailView.swift` — `sendPrepared` sinh MỘT `albumId` cho cả lượt (chỉ khi ≥2 mục);
  gom hàng trong `body` (cùng chỗ đã chụp `rows`), thêm `AlbumBubbleView`.
- `ChatMediaViewer.swift` — mở từ lưới phải xem được cả album, vuốt ngang qua lại.

## Các bước

1. `albumId` vào model + `sendMedia`.
2. `sendPrepared` sinh id cho lượt ≥2 mục (1 mục thì nil — một ảnh không phải album).
3. Gom `rows` thành `[ChatRow]` (`.single(MessageRow)` / `.album([MessageRow])`) NGAY chỗ
   đã chụp `rows` — không tính lại trong từng bong bóng.
4. `AlbumBubbleView` vẽ lưới; mỗi ô mở viewer với chỉ số tương ứng.
5. Trạng thái từng ảnh: ô nào đang upload thì mờ + spinner **trên chính ô đó**; hỏng thì
   nút "Gửi lại" trên ô đó, không phải cả album.
6. Menu giữ-bong-bóng của album: thao tác áp lên ô đang chạm, không phải cả cụm.

## Xong khi

- Gửi 6 ảnh → 1 bong bóng lưới 3 cột; chú thích nằm dưới lưới.
- Xoá 1 ảnh trong album → lưới còn 5, không vỡ layout, không mất cả cụm.
- Offline gửi album → cả 6 ô hiện "chờ mạng", mạng về đi hết, thứ tự giữ nguyên.
- Album cũ (tin trước phase này, không có `album_id`) vẫn hiện như cũ — không migration
  ngược, không mất tin.

## Rủi ro

- **Gom hàng làm lệch `ForEach` id** → SwiftUI dựng lại sai, mất vị trí cuộn, hỏng
  `scrollTo(pendingScrollId)` của jump-to-message. Id của `.album` phải ổn định (lấy id tin
  ĐẦU album), và `firstOfDayIds`/`unreadDividerId` phải tính theo tin thật chứ không theo
  hàng gộp.
- Kéo lên nạp trang cũ (`before:`) có thể cắt album làm đôi giữa hai trang — album ở rìa
  chỉ gộp phần đã có, trang sau về thì gộp lại. Không được nhân đôi ảnh.
