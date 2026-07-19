# Phase 09 — Link preview card trong bubble (chuẩn IG/Messenger)

**Model đề xuất:** Opus (fast) — LinkPresentation là API hệ thống, pattern cache đã có khuôn
(SignedURLCache); Fable soát lại phần threading.

## Thiết kế

- File mới `ChatLinkPreviewCard.swift`: actor `LinkPreviewCache` (dict + inFlight dedup, cùng
  khuôn SignedURLCache; chặn ~80 entry) + `ChatLinkPreviewCard` view.
- Fetch bằng `LPMetadataProvider` (timeout 8s) → title/host/ảnh. KHÔNG render `LPLinkView`
  (khối hệ thống to, lệch tông Nodie) — card SwiftUI tự vẽ: ảnh (nếu có, cao ≤120) + title 2
  dòng + host, bấm mở URL.
- Gắn trong `textBubble` (MessageBubbleView) dưới phần chữ: URL http(s) ĐẦU TIÊN của tin,
  chỉ khi `message.media == nil`. Chưa loaded/failed → không chiếm chỗ (bubble nở ra khi
  preview đến — Messenger cũng vậy, đừng giữ skeleton cho link chết).
- Nợ ghi nhận: fetch on-device phía NGƯỜI ĐỌC → site chủ link thấy IP người đọc (iMessage
  receiver-side cùng tradeoff). Sender-side metadata nhúng vào message là bản nâng cấp sau.

## Nghiệm thu

Build sạch. Gửi tin chứa URL → card hiện title/ảnh ≤vài giây, bấm mở đúng link; link hỏng →
bubble y như cũ; cuộn qua lại không refetch (cache).
