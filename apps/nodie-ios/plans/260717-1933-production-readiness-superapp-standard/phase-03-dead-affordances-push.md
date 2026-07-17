# Phase 03 — Diệt dead affordance + push trong chat đang mở

**Audit:** P0-04 ("Xem hồ sơ/Thông tin nhóm" disable cứng trong menu Chat) + medium (push foreground vẫn banner khi đang đứng trong đúng chat).
**Chuẩn:** IG rule #1 — nút chưa hoạt động thì không render. WhatsApp — không notify hội thoại đang mở.
**Model:** Opus (fast) — việc cơ khí có spec rõ (gỡ menu item, filter push foreground); ít bẫy prod, verify bằng build + chạy tay.

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

## Kết quả (18/07 08:5x — Fable làm thay Opus, Đăng duyệt 17/07 21:00)

- ✅ **Option A**: `GroupInfoView` thật — avatar/tên/loại kênh + danh sách thành viên
  (embed `public_profiles`), hàng của mình ghim đầu, tap hàng khác → `MemberProfileView`.
- ✅ "Xem hồ sơ" (DM): `store.members(of:)` tìm người kia → push `ChatRoute.member`.
- ✅ **Migration `0039`** (đã áp prod, idempotent): `channel_members.user_id` FK
  `auth.users` → `profiles` — cùng bệnh 0020; FK cũ làm PostgREST không embed được
  `public_profiles` (PGRST200, đo bằng HTTP thật). Sau khi áp: An thấy 2 thành viên DM
  kèm tên thật qua JWT user thường.
- ✅ Push suppress: `willPresent` nuốt banner khi `channel_id` trùng chat đang HIỂN THỊ
  (tab Trò chuyện + `chatsPath.last == .chat(id)` — đứng ở member profile vẫn có banner,
  đúng chuẩn WhatsApp). Provider gắn ở RootTabView, `weak state`.
- ✅ Quét dead affordance toàn Features/: chỉ còn đúng dòng menu này; các `Button {}`
  khác đều là nút Huỷ/OK hợp lệ của alert.
- ✅ i18n 3 key mới đủ 8 ngôn ngữ. Build xanh.
- ⚠️ Validation runtime (banner suppress cần APNs thật / `simctl push`): dồn vào phase 04
  (UITests menu→profile) + ma trận tay phase 08.

## Validation

- DM menu → Xem hồ sơ mở đúng người. Group menu → info hiện thành viên thật (hoặc mục biến mất nếu option B).
- Đứng trong chat X, nhắn từ account kia vào X → KHÔNG banner; nhắn vào chat Y → CÓ banner.
- Grep confirm: không còn `disabled` cứng vô lý trong Features/.
