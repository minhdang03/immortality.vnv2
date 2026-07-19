# Phase 10 — Vạch "Tin chưa đọc" khi mở chat

**Model đề xuất:** Opus (fast) — view thuần + một phép so mốc, khuôn có sẵn.

## Thiết kế

- Mốc: `channel.me.lastReadAt` (đã có trong ChannelRow.membership). Tin ĐẦU TIÊN của người
  khác có `createdAt > lastReadAt` → vạch đứng TRƯỚC tin đó.
- Chụp MỘT LẦN mỗi lần vào màn (`@State unreadDividerId`, set trong `.task` sau loadMessages,
  TRƯỚC markRead) — vạch đứng yên suốt phiên xem, không nhảy khi tin mới đến (Messenger-style).
- UI: line — "Tin chưa đọc" — line, token màu rule/inkMuted có sẵn.
- KHÔNG đổi hành vi cuộn (vẫn mở ở đáy) v1 — đổi scroll target đụng cảm biến atBottom/unseen,
  để riêng một đợt nếu Đăng muốn.
- i18n: 1 key splice × 8 ngôn ngữ.

## Nghiệm thu

Build sạch. Có N tin chưa đọc → mở chat thấy vạch đúng trước tin đầu tiên chưa đọc; đọc xong
thoát vào lại → không còn vạch.
