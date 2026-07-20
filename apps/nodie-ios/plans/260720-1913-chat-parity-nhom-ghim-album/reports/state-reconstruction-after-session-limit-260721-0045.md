# Tái dựng trạng thái sau khi phiên bị cắt (21/07 00:45)

Subagent Fable phase-04 bị cắt giữa chừng bởi session limit, chưa kịp viết report.
Đây là trạng thái THẬT, kiểm bằng psql trên prod + git, không tin lời subagent.

## Đã xong & đã kiểm

| Phase | Trạng thái | Bằng chứng |
|---|---|---|
| 01 status từng tin | ✅ committed `350606c` | git log |
| 02 album | ✅ committed `350606c` | git log |
| 03 chọn nhiều tin | ✅ committed `350606c` | git log |
| 04 backend RLS | ✅ **applied prod** | psql: create_group, transfer_group_owner, channels_update_by_mod, members_add_by_mod, members_manage_by_mod_{delete,update} đều có |
| 04 Swift DTO | ✅ ChannelRow.createdBy, ChannelMember.role | grep (đã committed) |
| **0044 (ngoài kế hoạch)** | ✅ **applied prod** | Fable phát hiện lỗ tự-phong-mod (RLS không bó theo cột), vá bằng trigger `trg_guard_member_role` giống `nodie_clamp_last_read_at` (0042). Đã kiểm trigger sống trên prod. |

## CHƯA xong

- **04 Swift store methods**: `createGroup/addMembers/removeMember/setRole/renameGroup/transferOwner` — grep KHÔNG thấy `func createGroup`. Chưa viết.
- **05 UI quản trị nhóm**: chưa (không có `NewGroupView.swift`, `GroupInfoView` chưa mở rộng).
- **06 ghim tin**: chưa (0 ref `pinnedAt`). 0044 đã dùng cho guard → migration ghim sẽ là **0045**.

## Cần dọn / chốt

1. **Prod có nhóm test bỏ quên**: `"Nhóm test 0043 đã đổi tên"` (afb714d1-...) — Fable tạo lúc test, chưa dọn vì bị cắt. Cần xoá. (KHÔNG đụng 2 nhóm `[uitest-chat-seed]` — fixture thật.)
2. **0043, 0044 còn untracked** — chưa commit.
3. **Perf changes (QAStore/QAModels/QuestionDetailView) còn uncommitted** — workstream riêng, chưa verify sau khi tách.
4. Suite UITest chạy 23:29 (trên cây trước 04): **52 test / 6 fail** — nhưng result bundle lỗi lưu (mkstemp), và cây đã đổi. Phải chạy lại sạch, không tin số này.

## Ngoài kế hoạch: 6 /cook mới user xếp hàng

Rich push+mention+forward · Archive hội thoại · Voice nâng cao (tốc độ/waveform/transcript) ·
"Đã xem bởi ai" nhóm · Draft theo hội thoại. → backlog mới, chưa đụng.
