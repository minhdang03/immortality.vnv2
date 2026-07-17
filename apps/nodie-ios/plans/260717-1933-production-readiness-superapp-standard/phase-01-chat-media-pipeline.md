# Phase 01 — Chat media pipeline: ảnh / camera / tệp end-to-end

**Audit:** P0-01 (attach tray chỉ đóng khay), P0-03 (media nhận về là gradient, file không mở được).
**Chuẩn:** IG/WhatsApp — optimistic send, progress, retry, viewer, cache. Không hand-roll thứ hệ thống đã cho.
**Model:** Fable — pipeline nhiều tầng (picker → downscale → upload → optimistic bubble → Realtime → signed URL → cache), sai một khớp là hỏng cả chuỗi mà UI vẫn "trông ổn"; độ tinh interaction chuẩn X/FB/IG (retry per-message, progress, huỷ giữa chừng) là thứ model yếu hơn hay làm ra bản "gần giống".

## Context

- `ChatDetailView.swift:430` `attachTray` — 3 nút Ảnh/Máy ảnh/Tệp, comment `CHƯA nối thật` (dòng 434).
- `ChatDetailView.swift:787` `mediaBubble` — đang render gradient placeholder.
- **Đã có sẵn, KHÔNG viết lại:** `ChatMediaStorage.upload/signedURL` (bucket `chat-media` private, path `{channel_id}/{user_id}/{uuid}.{ext}` là CƠ CHẾ PHÂN QUYỀN — không đổi), `MessageMedia` model, trần 25MB, policy 0024.
- `ConversationStore` đã có send pipeline text (optimistic + draft giữ khi lỗi) — media đi cùng đường, thêm `metadata.media`.

## Files

- Sửa: `ChatDetailView.swift` (attach tray → picker), `ConversationStore.swift` (sendMedia), `ConversationModels.swift` (nếu thiếu field size/duration/dimensions trong `MessageMedia`)
- Tạo: `NODIE/Features/Conversations/ChatMediaPicker.swift` (PhotosPicker + camera + document picker wrapper), `ChatMediaViewer.swift` (full-screen), `SignedURLCache.swift` (cache path→URL, TTL <1h)
- `project.yml`: `NSCameraUsageDescription`, `NSPhotoLibraryAddUsageDescription` nếu cần lưu ảnh — nhớ bẫy INFOPLIST: key vào `info.properties`, verify trên bundle ĐÃ BUILD

## Steps

1. **Ảnh:** SwiftUI `PhotosPicker` (PhotosUI, iOS 16+) — chọn tối đa 6 ảnh (chuẩn IG). Load `Data` → downscale cạnh dài ≤2048px, JPEG q0.8 (`UIGraphicsImageRenderer`). HEIC→JPEG.
2. **Máy ảnh:** `UIImagePickerController` wrapper (`.camera`) — permission flow: chưa hỏi → hỏi; denied → sheet giải thích + nút mở Settings (chuẩn IG, không silent fail).
3. **Tệp:** `.fileImporter` (UTType.item), đọc security-scoped, giữ tên file + size vào metadata.
4. **Send pipeline (ConversationStore):** append optimistic message ngay khi chọn (ảnh hiện từ Data local, chưa cần URL) → upload qua `ChatMediaStorage` → INSERT message với `metadata.media.path`. Upload/INSERT fail → bubble chuyển trạng thái lỗi + nút "Gửi lại" per-message (giống text draft-giữ-lại hiện có). KHÔNG block composer trong lúc upload.
5. **Progress:** overlay tròn % trên bubble ảnh (Supabase upload không stream progress → dùng indeterminate spinner + dim; đừng fake %).
6. **Render nhận về (`mediaBubble`):** `AsyncImage`-tương-đương tự viết trên signed URL qua `SignedURLCache` (ký lại khi hết hạn); placeholder skeleton, lỗi ký/tải → khung hỏng + tap retry. Ảnh giữ aspect ratio từ metadata dimensions (tránh layout jump — chuẩn IG).
7. **Viewer:** tap ảnh → full-screen, pinch zoom, drag-to-dismiss, nút share (`ShareLink`). Tệp → `QLPreviewController` wrapper (QuickLook mở được pdf/ảnh/docx) + share; không mở được → share sheet.
8. i18n: mọi string mới đủ 9 ngôn ngữ trong `Localizable.xcstrings` (nhớ bẫy: sửa file bằng splice text, cấm json round-trip).

## Validation

- 2 account thường: An gửi ảnh → Bình thấy qua Realtime, tap xem full, share được.
- Ảnh 30MB → chặn tại client với message rõ. Airplane mode giữa chừng → bubble lỗi + Gửi lại hoạt động.
- Camera denied → sheet mở Settings. Tệp pdf mở QuickLook.
- Build xanh + UITest attach tray mới (phase 04 cover).

## Risks

- PGRST/embed: message media vẫn đi qua `messageSelect` hiện có — không thêm join mới, chỉ metadata jsonb → rủi ro thấp.
- Signed URL hết hạn khi user để màn chat mở >1h → cache phải re-sign khi load fail, không chỉ theo TTL.
- `PhotosPicker` load chậm với iCloud photo → cần loading state trong tray, không đơ composer.
