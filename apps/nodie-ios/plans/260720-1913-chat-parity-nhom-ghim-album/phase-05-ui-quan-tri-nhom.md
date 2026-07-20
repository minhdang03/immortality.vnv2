# Phase 05 — UI quản trị nhóm (mục 7b)

**Model:** Opus (fast) — RLS đã chốt ở phase 04, đây là dựng màn theo spec.
**Migration:** không. **Phụ thuộc:** phase 04.

## Hiện trạng

`GroupInfoView` (140 dòng) chỉ liệt kê thành viên và mở hồ sơ. Không nút nào.

## Yêu cầu

### Tạo nhóm
Nút ✎ ở `ConversationListView` hiện chỉ mở `NewMessageView` (chọn MỘT người → DM). Thêm
ngã rẽ: **"Nhắn tin"** / **"Tạo nhóm"**.

Màn tạo nhóm: ô tên nhóm + chọn nhiều người (từ `FollowStore.suggestions`, cùng nguồn với
`NewMessageView`) + nút Tạo → `createGroup` → vào thẳng nhóm vừa tạo.

### GroupInfoView mở rộng
Chỉ hiện với **quản trị** (`role == 'mod'` hoặc là `created_by`):

- **Đổi tên nhóm** — chạm tiêu đề để sửa tại chỗ.
- **Thêm thành viên** — cùng màn chọn người của tạo nhóm.
- **Xoá khỏi nhóm** — vuốt trái trên dòng thành viên, có xác nhận.
- **Phong/gỡ quản trị** — menu trên dòng thành viên.
- **Chuyển giao chủ nhóm** — chỉ chủ nhóm thấy; xác nhận hai bước (không hoàn tác được).

Thành viên thường thấy đúng màn như hôm nay — không nút, không thấy có gì bị khoá. Ẩn hẳn
chứ không hiện-rồi-disable: nút xám mời người ta bấm để nhận một câu từ chối.

Nhãn vai trò ("Quản trị") hiện cạnh tên **trong màn này thôi** — không rò ra bong bóng chat
hay hồ sơ. Nhãn vai trò khắp nơi là phân tầng người dùng, đúng thứ CLAUDE.md cấm.

## Files

- `GroupInfoView.swift` — mở rộng (đang 140 dòng; vượt 200 thì tách `GroupMemberRow`).
- `NewGroupView.swift` (mới) — tạo nhóm + dùng lại cho "thêm thành viên".
- `ConversationListView.swift` — ngã rẽ ở nút ✎.
- `ChatDetailView.swift` — menu ⋯ thêm "Thông tin nhóm" cho mọi thành viên (đã có).

## Xong khi

- User thường tạo nhóm 3 người → vào thẳng nhóm, thấy mình là quản trị.
- Quản trị thêm/xoá người, đổi tên, phong quản trị → danh sách cập nhật ngay (optimistic),
  hỏng thì lùi lại và báo.
- Thành viên thường mở cùng màn → không thấy nút nào.
- Chuyển giao xong: người cũ mất quyền chủ (vẫn là quản trị), người mới thấy đủ nút.

## Rủi ro

- **Optimistic quá tay**: xoá người khỏi danh sách trên máy rồi server bác (RLS) → danh sách
  nói dối. Lùi lại theo đúng khuôn `deleteMessage` đang dùng.
- Tự xoá chính mình qua đường "xoá thành viên" → dùng `leave()`, không nhầm hai đường.
- Nhóm rỗng sau khi xoá hết người: server chưa dọn — nhóm mồ côi còn trong danh sách. Bàn ở
  phase 04 hay để đây? → ghi vào câu hỏi mở, đừng tự quyết.
