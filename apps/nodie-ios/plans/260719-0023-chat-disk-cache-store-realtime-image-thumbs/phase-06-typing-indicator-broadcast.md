# Phase 06 — "Đang nhập…" (typing indicator, chuẩn Messenger)

**Model đề xuất:** Fable — lần đầu dùng Realtime Broadcast trong app (khởi đầu trả nợ scale).

## Thiết kế

**Broadcast per-chat topic `typing:{channelId}`**, KHÔNG đi qua postgres_changes (typing là tín
hiệu phù du, không được chạm DB). Vòng đời theo MÀN chat (subscribe khi vào, unsubscribe khi
rời) — đúng scope hiển thị: chỉ người đang mở cùng khung chat cần biết ai đang gõ.

- Gửi: draft đổi → `broadcastTyping(channelId:)`, throttle 3s/lần (`lastTypingSentAt`).
  Payload: `user_id` + `name` (display name mình). `broadcast self = false` — không nhận echo.
- Nhận: event → bỏ qua nếu là mình → `typers[uid] = (name, hạn now+5s)`; UI đọc computed đã
  lọc hạn. Nhận ĐƯỢC TIN THẬT từ người đó (handleIncoming) → xoá typer ngay (Messenger-style:
  "đang gõ" đổi thành tin).
- UI: một dòng nhỏ trên inputBar — 1 người: "{tên} đang nhập…", nhiều: "Nhiều người đang nhập…".
- Leak chấp nhận v1 (ghi nợ): topic đoán được nếu biết channelId — broadcast không kiểm RLS
  (private channel authorization là setup riêng, để đợt Broadcast tổng).

## Files

Sửa: `ConversationStoreRealtime.swift` (hoặc file typing riêng nếu >~80 dòng: `ConversationStoreTyping.swift`),
`ConversationStore.swift` (state), `ChatDetailView.swift` (hook draft + dòng chỉ báo),
`Localizable.xcstrings` (splice 2 key × 8 ngôn ngữ).

## Nghiệm thu

Build sạch (gate bỏ). 2 máy cùng mở 1 chat: B gõ → A thấy "{B} đang nhập…" ≤1s, tự tắt sau 5s
ngừng gõ hoặc khi tin đến.
