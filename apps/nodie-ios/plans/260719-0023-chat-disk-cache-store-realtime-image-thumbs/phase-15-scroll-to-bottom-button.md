# Phase 15 — Nút cuộn-xuống-đáy luôn hiện khi đã cuộn lên (chuẩn WhatsApp/Zalo)

**Model:** Opus (fast) — view thuần, state có sẵn (`atBottom`, `unseen`), tự chứa.

## Hiện trạng → đích

`newMessagesPill(proxy)` chỉ hiện khi `unseen > 0` ("↓ N tin mới"). WhatsApp/Zalo hiện nút
mũi tên xuống MỖI KHI đã cuộn lên khỏi đáy — kể cả không có tin mới — để quay về đáy một chạm.

## Thiết kế

- Đổi `newMessagesPill` → hiện khi `!atBottom` (không phải `unseen > 0`):
  - Nút tròn nhỏ mũi tên `chevron.down`, nền surface + viền rule + bóng nhẹ, đặt bottom-trailing
    (trên inputBar). Tap → `scrollTo(bottomAnchor)` + `unseen = 0` (giữ hành vi cũ).
  - Khi `unseen > 0`: gắn badge số nhỏ (accent) ở góc trên nút — "có N tin mới" mà không chiếm
    cả dải như pill cũ.
- Giữ `accessibilityIdentifier("newMessagesPill")` (UITest có thể tham chiếu) + nhãn a11y đọc số
  tin mới khi có.
- Tôn trọng `motion` (reduce motion) cho cú cuộn.

## Kèm theo (cùng file, sửa luôn)

Comment lỗi thời ~dòng 1116 nói `"Sửa"/"Xoá"/"(đã sửa)"` CHƯA có trong xcstrings — SAI, cả
6 key bubble-menu đã có (kiểm 19/07). Xoá/sửa comment cho khỏi gây hiểu lầm.

## Ràng buộc

CHỈ sửa `ChatDetailView.swift`. KHÔNG đụng xcstrings/store/model. KHÔNG build (controller lo).

## Nghiệm thu

Build sạch. Cuộn lên giữa chat → nút mũi tên xuống hiện; có tin mới → badge số; tap → về đáy.
Đứng ở đáy → nút ẩn.
