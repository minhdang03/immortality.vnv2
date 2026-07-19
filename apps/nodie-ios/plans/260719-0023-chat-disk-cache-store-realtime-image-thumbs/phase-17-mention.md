# Phase 17 — Nhắc tên @ (mention, chuẩn IG/Messenger)

**Model:** Fable — đụng composer + store.members + render/parse; Opus có thể gõ popup UI.

## Thiết kế v1

- Gõ `@` trong ô nhập → popup gợi ý thành viên kênh (store.members(of:), lọc prefix theo
  chữ sau @). Chọn → chèn `@DisplayName ` vào draft tại vị trí.
- Lưu: KHÔNG bảng mention riêng v1 — mention sống trong `body` dạng text `@DisplayName`.
  (Nợ ghi: tên trùng/tên có dấu cách nhận diện mờ; bản sau lưu cấu trúc `@[uid]` + render map.)
- Render bong bóng: trong `attributedBody`, ngoài link, tô đậm mọi `@Tên` KHỚP display_name
  của một thành viên đã biết (accent màu), gắn `.link` scheme `nodie://profile/{uid}` → tap
  mở MemberProfileView. Không khớp ai → chữ thường, không tô.
- Thành viên để đối chiếu: nạp `members(of: channelId)` một lần khi vào chat, giữ
  `[displayName: uid]` trong ChatDetailView @State.

## Files

Sửa: ChatDetailView (popup @ + parse mention trong attributedBody + nạp members + xử lý tap
scheme), có thể tách `ChatMentionPopup.swift` nếu >80 dòng. store.members đã có. xcstrings splice.
Điều hướng profile: dùng đường push MemberProfile có sẵn (kiểm route).

## Nghiệm thu

Build sạch. Gõ @ → popup thành viên; chọn chèn tên; bong bóng tô @tên, tap mở hồ sơ người đó.
