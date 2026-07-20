# Phase 04 — Nền quyền nhóm: tạo nhóm + vai trò + RLS (mục 7a)

**Model:** **Fable** — đụng RLS trên prod, đúng vùng đã trả giá 4 bug P0 hôm 17/07.
**Migration:** `0043` (số kế tiếp sau `0042`). **Phụ thuộc:** không. **Chặn:** phase 05, 06.

## Quyết định sản phẩm (Đăng chốt 20/07 — ĐẢO quyết định cũ)

CLAUDE.md ghi **"chỉ admin tạo nhóm"**; `channels_insert_dm` thi hành đúng vậy. Đăng chốt
**mở cho user thường tạo nhóm**, mô hình Telegram/Zalo/FB/IG:

- Người tạo nhóm là **quản trị** của nhóm đó.
- **Nhiều quản trị** — quản trị phong thêm quản trị.
- **Chuyển giao** quyền chủ nhóm được.

⚠️ Việc đầu tiên khi làm phase này: sửa CLAUDE.md, không để tài liệu nói ngược code.

## Mô hình quyền

Không đẻ khái niệm mới — dùng đúng cái đã có:

| Khái niệm | Chỗ lưu | Ghi chú |
|---|---|---|
| Chủ nhóm | `channels.created_by` | chuyển giao = đổi cột này |
| Quản trị | `channel_members.role = 'mod'` | cột + check constraint đã có từ 0017 |
| Thành viên | `role = 'member'` | mặc định |

`is_channel_mod(cid)` **đã tồn tại** (security definer, đã gộp `is_admin()`) — dùng lại làm
vị từ "là quản trị nhóm". Không viết hàm mới: hai hàm cùng nghĩa là hai chỗ phải sửa khi
luật đổi.

**Security definer là bắt buộc**, không phải cho gọn: policy trên `channel_members` mà tự
truy vấn `channel_members` sẽ đệ quy vô hạn. Đây là lý do `is_channel_member` có sẵn dạng
definer từ 0017.

## Migration 0043

1. **RPC `create_group(p_title text, p_member_ids uuid[])`** — security definer:
   - chèn `channels(kind='group', title, created_by=auth.uid())`
   - chèn người tạo với `role='mod'`, các thành viên mời với `role='member'`
   - trả về `channel_id`
   - Định nghĩa RPC vì "tạo kênh + tự thêm mình làm mod" là **hai** ghi phải cùng thành
     công; làm hai lệnh từ client thì đứt giữa chừng sinh nhóm không có chủ (bài học 0030).
2. **`channels_insert_dm` → nới**: cho `kind='group'` khi `created_by = auth.uid()`.
   Giữ nguyên `kind='public'`/`'feed'` chỉ admin — kênh phát sóng không phải thứ ai cũng mở.
3. **`channels_update_by_mod`**: `for update using (is_channel_mod(id))` — đổi tên nhóm.
   Ràng thêm `kind = 'group'` để mod không sửa được kênh public.
4. **`members_add_by_mod`**: `for insert with check (is_channel_mod(channel_id))` — bổ sung
   cho `members_self_join` (giữ nguyên, đó là đường tự vào kênh public).
5. **`members_manage_by_mod`**: `for delete using (is_channel_mod(channel_id))` và
   `for update using (is_channel_mod(channel_id))` (đổi role).
   **Chặn xoá chủ nhóm**: `and user_id <> (select created_by from channels where id = channel_id)`.
6. **RPC `transfer_group_owner(p_channel_id, p_new_owner)`** — security definer: kiểm caller
   là `created_by`, người nhận đang là thành viên → đổi `created_by`, đặt người nhận
   `role='mod'`. Chủ cũ giữ `mod` (Telegram cũng vậy — chuyển giao không phải trục xuất).

## Bất biến phải giữ

- **DM không có quản trị.** Mọi policy mới ràng `kind = 'group'`. Nới nhầm sang `dm` là một
  người "quản trị" được cuộc trò chuyện riêng của hai người.
- `members_self_leave` giữ nguyên — ai cũng tự rời được, kể cả mod.
- Chủ nhóm rời nhóm: chặn ở RPC, bắt chuyển giao trước. Nhóm mồ côi không ai sửa được.

## Files

- `supabase/migrations/0043_group_management.sql` (mới)
- `ConversationStore.swift` — `createGroup`, `addMembers`, `removeMember`, `setRole`,
  `renameGroup`, `transferOwner`; `ChannelRow` thêm `createdBy`; `ChannelMember` thêm `role`.
- `ConversationModels.swift` — DTO tương ứng.

## Kiểm chứng (KHÔNG thương lượng)

1. Dry-run `begin; … rollback;` trước, `commit;` sau. Migration phải chạy lại được.
2. Test bằng **tài khoản `role='user'`** (`NODIE_TEST_*`). **Test bằng admin = không test
   gì** — `is_admin()` ngắn mạch mọi nhánh policy, đã giấu 4 bug P0.
3. Kiểm bằng HTTP thật, không chỉ `xcodebuild`: đổi chuỗi `select` mà thêm embed trùng bảng
   là PGRST201, Swift vẫn compile sạch.
4. Ma trận phải chạy tay: user thường tạo nhóm ✓ · thêm người ✓ · xoá người ✓ · đổi tên ✓ ·
   phong mod ✓ · chuyển giao ✓ · **người ngoài nhóm làm mọi thứ trên → hỏng hết** ·
   **thành viên thường thêm người → hỏng** · **mod xoá chủ nhóm → hỏng** · **mod đụng DM →
   hỏng**.

## Rủi ro

- **Đệ quy policy** trên `channel_members` nếu quên security definer → mọi truy vấn chat
  chết, không chỉ nhóm.
- **Nới quá tay ở `channels_insert_dm`** → user tự tạo kênh `public` (kênh phát sóng toàn
  hệ thống). Ràng `kind='group'` tường minh.
- **Mở tạo nhóm = mở cửa nhóm rác.** Moderation hiện chỉ có report/block ở mức người và nội
  dung. Cần bàn tiếp: giới hạn số nhóm mỗi người? báo cáo nhóm?
- Dev đang chạy thẳng trên prod (roadmap scale đặt "tách staging" là việc số 1).
