# Phase 11 — Chuyển tiếp tin nhắn (forward, chuẩn Messenger)

**Model đề xuất:** Fable — media forward đụng policy Storage đọc-quyền-từ-đường-dẫn, sai là
người kênh đích nhìn khung hỏng.

## Thiết kế

- Menu bubble thêm "Chuyển tiếp" (ẩn với tin queued/đang upload) → sheet chọn kênh đích
  (channels mình `canPost`, trừ kênh hiện tại) → gửi → đóng sheet.
- **Text:** tái dùng `send()` (được luôn optimistic + offline queue).
- **Media:** KHÔNG trỏ chung path cũ — policy `chat-media` (0024) đọc channel_id TỪ ĐƯỜNG DẪN,
  giữ path kênh nguồn là thành viên kênh đích bị policy chặn khi ký URL. Phải
  `storage.copy` sang `{targetChannel}/{uid}/{uuid}.{ext}` rồi INSERT tin mới với path mới.
  Copy server-side, không tải bytes về máy.
- Sau insert media thành công: kênh đích đã nạp tin → `fetchNewMessages`; chưa nạp → thôi,
  realtime/lần mở sau lo. `lastMessageAt` + resort do handleIncoming echo lo sẵn.
- File mới: `ForwardMessageSheet.swift` (~100 dòng). Store thêm `forward(_:to:)`.

## Nghiệm thu

Build sạch. Forward text → hiện ở kênh đích ngay; forward ảnh → người kênh đích (không phải
thành viên kênh nguồn) MỞ ĐƯỢC ảnh — verify path mới bằng ký URL thật nếu được.
