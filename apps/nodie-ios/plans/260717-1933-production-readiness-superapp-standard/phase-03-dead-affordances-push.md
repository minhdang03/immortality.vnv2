# Phase 03 — Diệt dead affordance + push trong chat đang mở

**Audit:** P0-04 ("Xem hồ sơ/Thông tin nhóm" disable cứng trong menu Chat) + medium (push foreground vẫn banner khi đang đứng trong đúng chat).
**Chuẩn:** IG rule #1 — nút chưa hoạt động thì không render. WhatsApp — không notify hội thoại đang mở.

## Files

- Sửa: `ChatDetailView.swift` (menu), `PushManager.swift` (foreground filter), `AppState.swift` (biết chat nào đang mở — có thể đã track sẵn qua navigation)
- Tạo: `NODIE/Features/Conversations/GroupInfoView.swift` (chỉ khi làm option A group)

## Steps

1. **Xem hồ sơ (DM):** wire → `MemberProfileView` (đã có ở Features/Friends, đã nhận userId — plan 1404 phase 04 wire xong follow/profile). Truyền userId của đối phương từ channel members.
2. **Thông tin nhóm:** quyết theo chi phí lúc làm:
   - **A (ưu tiên):** `GroupInfoView` tối thiểu — tên nhóm, emoji, danh sách thành viên (từ `channel_members` + `public_profiles`), mỗi hàng tap → MemberProfileView. Không edit (chỉ admin tạo nhóm — theo product).
   - **B (fallback nếu A vượt 0.5 ngày):** ẨN mục này khỏi menu với channel group. Tuyệt đối không giữ disabled.
3. **Quét toàn app dead affordance còn sót:** grep `.disabled(true)` + no-op closure trong Features/ — mục nào chưa wire thì ẩn. (Audit DoD #1 tính TOÀN app, không riêng Chat.)
4. **Push suppress:** `userNotificationCenter(_:willPresent:)` — payload có `channel_id` trùng chat đang mở → không banner/sound (return `[]`), vẫn cập nhật UI qua Realtime. Khác chat → giữ banner như hiện tại.

## Validation

- DM menu → Xem hồ sơ mở đúng người. Group menu → info hiện thành viên thật (hoặc mục biến mất nếu option B).
- Đứng trong chat X, nhắn từ account kia vào X → KHÔNG banner; nhắn vào chat Y → CÓ banner.
- Grep confirm: không còn `disabled` cứng vô lý trong Features/.
