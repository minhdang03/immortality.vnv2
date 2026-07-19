# Phase 08 — Ẩn reaction của người bị chặn (đóng P2-4, chuẩn IG)

**Model đề xuất:** Opus (fast) — fix một điểm ở accessor, nhỏ.

Quyết định sản phẩm: theo mandate "chuẩn IG/Messenger" (Đăng 19/07 04:21) — IG ẩn toàn bộ
tương tác của người bị chặn ⇒ reaction của họ cũng ẩn.

## Thiết kế

Lọc MỘT LẦN ở accessor `ConversationStore.messages(for:)` — nơi đã lọc tin của người bị chặn:
row nào có reaction của user bị chặn thì `replacingReactions(đã lọc)`. Cả đường load lẫn
realtime cùng hưởng (view chỉ đọc qua accessor này). KHÔNG vá riêng trong handleReaction —
DRY, và unblock là thấy lại ngay (dữ liệu thô còn nguyên trong `messagesByChannel`/đĩa).

## Nghiệm thu

Build sạch. Chặn user X → mọi ❤️/số đếm của X biến khỏi màn; bỏ chặn → hiện lại không cần refetch.
