# Phase 03 — Chọn nhiều tin (mục 10)

**Model:** Opus (fast) — thuần client, không đụng DB.
**Migration:** không. **Phụ thuộc:** không (nên làm SAU 02 để biết album chọn ra sao).

## Vấn đề

Dọn một đoạn hội thoại hoặc chuyển tiếp một mạch 5 tin phải làm từng tin một, mỗi tin ba
cú chạm. `ForwardMessageSheet` hiện chỉ nhận MỘT tin.

## Yêu cầu

- Vào chế độ chọn: mục **"Chọn"** trong menu giữ-bong-bóng (không thêm cử chỉ mới — vuốt
  đã là trả lời, giữ đã là menu, chạm-đôi đã là ☀).
- Trong chế độ chọn: mỗi bong bóng có ô tròn ✓ bên lề; chạm bất kỳ đâu trên hàng là chọn/bỏ.
  Header đổi thành "Đã chọn N" + nút "Xong". Ô nhập nhường chỗ cho thanh hành động.
- Thanh hành động đáy: **Chuyển tiếp** · **Xoá** (chỉ hiện khi mọi tin đã chọn là của mình)
  · **Sao chép** (chỉ khi mọi tin đã chọn là tin chữ).
- Thoát chế độ chọn: nút "Xong", hoặc bỏ chọn hết, hoặc rời màn.

## Files

- `ChatDetailView.swift` — `@State selecting: Bool`, `@State selected: Set<UUID>`; header
  thay thế; thanh hành động thay `inputBar` khi `selecting`.
- `MessageBubbleView` — nhận `selectionState` (nil = không ở chế độ chọn); khi đang chọn thì
  **tắt** vuốt-trả-lời, chạm-đôi và menu (một chế độ, một bộ cử chỉ).
- `ForwardMessageSheet.swift` — nhận `[MessageRow]` thay vì `MessageRow`.
- `ConversationStore.swift` — `deleteMessages(ids:channelId:)` gửi một lượt, cuốn chiếu
  optimistic như `deleteMessage` hiện tại.

## Giới hạn

Trần **20 tin** một lượt. Chuyển tiếp media phải `storage.copy` từng tệp sang kênh đích
(xem `forward`), 50 ảnh một nhát là treo mạng và chặn UI. Chạm trần thì báo thẳng, không
âm thầm cắt.

## Xong khi

- Chọn 5 tin → Chuyển tiếp → chọn kênh → 5 tin sang đúng thứ tự thời gian.
- Chọn tin của người khác → nút Xoá biến mất (không phải hiện rồi báo lỗi).
- Xoá 5 tin của mình → cả 5 biến mất, Hoàn tác khôi phục **cả cụm** (không phải từng tin).
- Đang ở chế độ chọn, tin mới đến qua realtime → danh sách vẫn chạy, lựa chọn không mất.

## Rủi ro

- Chọn tin đang trong hàng đợi offline (`isQueued`) → chuyển tiếp một id server chưa biết,
  FK nổ. Chặn từ cửa như `onForward` đang làm.
- Album (phase 02): chọn ô trong lưới nghĩa là chọn **tin ảnh đó**, không phải cả album —
  nói rõ bằng ✓ trên từng ô.
