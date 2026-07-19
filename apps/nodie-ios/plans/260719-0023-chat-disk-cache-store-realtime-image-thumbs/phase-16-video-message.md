# Phase 16 — Tin nhắn video (chuẩn IG/Messenger)

**Model:** Fable — pipeline media + async (poster-gen off-main, dual upload, tương tác offline queue).

## Thiết kế v1

- Model `MessageMedia.Kind` thêm `.video`; thêm field optional `posterPath: String?` (ảnh
  poster tải nhanh cho bong bóng — video không tự có thumbnail như ảnh). Tin cũ nil → OK.
- Picker: PHPicker filter đổi `.images` → `.any(of: [.images, .videos])`; nhánh video load
  `loadFileRepresentation(movie)` → Data + AVURLAsset.
- Gửi (`sendVideo`): off-main sinh poster JPEG (frame ~0.0s qua AVAssetImageGenerator) + đọc
  duration/kích thước track. Upload HAI file (video path + poster path, cùng quy ước
  `{channel}/{uid}/{uuid}.{ext}` — policy 0024). INSERT metadata kind=.video, path=video,
  posterPath=poster, duration/width/height. Optimistic bubble vẽ từ poster local ngay.
- Bong bóng `videoBubble`: poster (ChatRemoteImage posterPath, hoặc UIImage local khi pending)
  + nút play tam giác giữa + nhãn thời lượng góc. Khung theo aspectRatio như photoBubble.
- Xem: `ChatVideoViewer` (AVPlayer/VideoPlayer) stream từ signed URL video; tap bong bóng mở.
- Trần 25MB (bucket) — KHÔNG re-encode v1 (nợ ghi: 25MB giới hạn độ dài; sau thêm export
  AVAssetExportSession preset 960x540). Camera-quay-video: sau.
- Offline: sendVideo dùng cùng đường pendingMedia (bytes video + poster giữ RAM), retry/queue
  như ảnh. (Nếu phức tạp: v1 chặn gửi video khi offline, ghi nợ.)

## Files

Sửa: ConversationModels (Kind + posterPath + init), ChatMediaStorage (không đổi — upload chung),
ConversationStore (sendVideo + pending video), ChatMediaPicker (filter + load movie),
ChatDetailView (videoBubble + open video), MỚI ChatVideoViewer.swift, xcstrings (splice controller).

## Nghiệm thu

Build sạch. Chọn video từ thư viện → bong bóng hiện poster + play + thời lượng; tap → phát
toàn màn; người kênh khác (RLS) xem được. Quá 25MB → chặn báo rõ.
