# Phase 03 — Thumbnail bubble ảnh qua Storage transform (+ fallback)

**Model đề xuất:** Opus (fast) — spec cơ khí, diện tích nhỏ. RIÊNG bước verify HTTP transform
trên prod chạy tay/Fable: transform là tính năng Pro của Supabase, free tier trả lỗi.

## Context

- Bubble ảnh: `ChatDetailView.swift:1253` `photoWidth = 232` (pt) → 464px @2x là đủ nét.
- `ChatMediaStorage.signedURL` (`ChatMediaStorage.swift:53`) — `createSignedURL(path:expiresIn:)`
  chưa transform. Bucket `chat-media` PRIVATE trên **Supabase Storage** (không phải R2 — R2 là web).
- `SignedURLCache` khoá theo `path` — thêm biến thể cỡ là phải đổi key.
- `ChatImageCache` (NSCache) cũng khoá theo `path`.
- Viewer full-screen `ChatMediaViewer.swift` phải giữ bản GỐC.

## Yêu cầu

- Bubble ảnh tải bản ~464px (tiết kiệm ~4× data so với 2048px). Viewer full-screen tải bản gốc.
- Free tier (transform bị từ chối) → tự rơi về ảnh gốc, KHÔNG khung hỏng, không retry vô hạn.
- Upload pipeline giữ nguyên (2048px).

## Thiết kế

1. `ChatMediaStorage.signedURL(for:client:thumbWidth: Int? = nil)`:
   - `thumbWidth != nil` VÀ `transformKnownUnavailable == false` →
     `createSignedURL(path:expiresIn:transform: TransformOptions(width: thumbWidth, quality: 75))`.
   - `transformKnownUnavailable` = cờ tĩnh in-memory (set một lần, cả phiên khỏi thử lại từng ảnh).
2. `SignedURLCache.url(for:client:thumbWidth:forceRefresh:)` — cache key = `"\(path)#w\(width)"`
   (nil → key cũ). inFlight dedup theo key mới.
3. `ChatRemoteImage` thêm `thumbWidth: Int?`:
   - Bubble ảnh (`ChatDetailView` photo bubble) truyền `464`; mọi chỗ khác (viewer) mặc định nil.
   - `ChatImageCache` key cùng biến thể `"\(path)#w464"`.
   - Nhánh lỗi hiện có (400 → re-sign) mở rộng: URL transform trả 4xx → set
     `transformKnownUnavailable = true`, tải lại bằng URL gốc. Phân biệt với "URL hết hạn"
     (đường re-sign giữ nguyên).
4. Reply-quote/preview nhỏ nếu có dùng `ChatRemoteImage` → cũng truyền thumbWidth (grep call sites).

## Files

- Sửa: `ChatMediaStorage.swift`, `SignedURLCache.swift`, `ChatRemoteImage.swift`,
  `ChatDetailView.swift` (call site bubble). Không file mới, không đổi schema.

## Bẫy phải né

1. **Verify bằng HTTP thật trên prod TRƯỚC khi wire UI**: ký một URL transform rồi `curl` —
   xem trả ảnh hay JSON lỗi. Build xanh không chứng minh gì về Storage.
2. Transform URL đi qua endpoint `/render/image/` — nhánh bắt status 400 hiện có sẽ nuốt nhầm
   lỗi "plan không hỗ trợ" thành "hết hạn" nếu không tách: thử re-sign 1 lần, vẫn 4xx → coi là
   transform unavailable, về ảnh gốc.
3. Cùng path hiện ở bubble (464) và viewer (gốc) = 2 entry NSCache — đúng thiết kế, nhưng cost
   tính riêng từng bản (bản 464 rẻ hơn ~20×).
4. GIF/ảnh động nếu có: transform trả ảnh tĩnh — kind hiện tại chỉ image/file/voice, file không
   qua ChatRemoteImage nên không sao; ghi nhận nếu sau này thêm GIF.

## Nghiệm thu

- Chat có ảnh: request bubble mang `width=464` (soi network/log), viewer mang URL gốc.
- Nếu prod là free tier: bubble vẫn hiện ảnh (fallback), không khung hỏng, chỉ 1 lần thử transform.
- Cuộn qua lại không tải lại (cache key biến thể hoạt động). `run-uitest-gate.sh 3` xanh.
