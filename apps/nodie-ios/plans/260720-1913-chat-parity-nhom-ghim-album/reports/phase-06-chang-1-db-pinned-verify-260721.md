# Phase 06 — Chặng 1: DB ghim tin, verify prod (21/07)

## Trạng thái xuất phát (khác prompt)

Phiên trước (bị cắt) đã đi XA hơn state-reconstruction ghi nhận:
- `0045_pinned_messages.sql` đã tồn tại VÀ **đã applied prod** (ledger, cột, index, RPC đều có).
- Swift cũng đã viết phần lớn (models/store/realtime/UI) — xử lý ở chặng 2.
- Nhóm test bỏ quên `"Nhóm test 0043 đã đổi tên"` đã được dọn từ trước (query 0 rows).
- Lưu ý: có **hai file 0045** (`0045_nodie_app_config.sql` của workstream rate-limit chiếm song song). Cả hai đã applied, ledger theo filename nên không đụng nhau — nhưng đánh số đã va.

## Việc đã làm

### 1. Vá RPC `set_pinned` (sửa file 0045, re-apply)

Bản đã deploy đếm trần 3 ghim SAI hai chỗ:
- **Đếm cả tin đã xoá mềm** → tin ghim bị xoá chiếm slot VĨNH VIỄN (RPC từ chối đụng tin
  đã xoá — "Tin không tồn tại" — nên không ai gỡ nổi ghim của nó). Vi phạm tiêu chí
  "xoá mềm tin đang ghim → băng tự gỡ" ở tầng slot.
- **Đếm cả chính tin đang ghim lại** → re-ghim tin đã ghim khi đủ 3 báo lỗi trần oan.

Sửa: `and deleted_at is null and id <> p_message_id` trong count. File 0045 chưa từng commit
nên sửa tại chỗ (file trên đĩa = sự thật trên prod). Dry-run sạch → applied.

### 2. Lỗ MỚI phát hiện + vá: tác giả tự ghim bằng UPDATE thẳng → `0048_guard_pinned_columns.sql`

Chứng minh sống trên prod (forged JWT An role='user', rollback):
```
update messages set pinned_at=now(), pinned_by=auth.uid() where id=<tin của mình>;
→ UPDATE 1, self_pin_succeeded = t
```
Nguyên nhân: `messages_update_own` cho tác giả ghi hàng của mình, RLS không bó theo cột
(đúng bài 0044/0047). 0045 đóng cửa mod nhưng cửa TÁC GIẢ có sẵn vẫn mở — vượt mặt cả
is_channel_mod lẫn trần 3.

Vá: mở rộng `tg_messages_guard` (0047) clamp thêm `pinned_at`/`pinned_by`. `set_pinned`
security definer (current_user ≠ 'authenticated') không bị ảnh hưởng — vẫn là đường ghim
duy nhất. 0048 phải đứng SAU 0047 (cùng create-or-replace một function). Dry-run sạch → applied.

## Verify prod — forged JWT role='user', tất cả trong transaction rollback

| Test | Kỳ vọng | Kết quả |
|---|---|---|
| A. Tác giả (member) tự ghim tin mình bằng UPDATE thẳng | bị chặn | TRƯỚC 0048: **lọt** (t) · SAU 0048: clamp về null ✓ |
| B. Mod (Chi) ghim qua RPC | OK | ✓ pinned_at set, pinned_by=Chi |
| C. Member thường (Bình) ghim qua RPC | 42501 | ✓ "Chỉ quản trị nhóm mới ghim được tin." |
| D. Ghim tin thứ 4 | 23514 | ✓ "Mỗi kênh chỉ ghim tối đa 3 tin. Gỡ bớt trước." |
| E. Re-ghim tin đã ghim khi đủ 3 | OK (bump) | ✓ không lỗi trần oan |
| F. Xoá mềm 1 tin ghim → ghim tin mới | OK (slot tự do) | ✓ đếm sống = 3 |
| G. DM — ghim | 42501 (DM không mod) | ✓ |
| Regression: tác giả sửa body / xoá mềm tin mình | vẫn chạy | ✓ / ✓ |
| Regression: mod gỡ ghim qua RPC | OK | ✓ |

## Realtime

`messages` đã nằm trong publication `supabase_realtime` với `prattrs` rỗng (= MỌI cột) →
`pinned_at`/`pinned_by` tự chảy qua event UPDATE, không cần migration realtime riêng.
Swift handler (ConversationStoreRealtime:207) đã đọc hai field này.

## Trạng thái prod sau chặng 1

- `set_pinned` bản vá (count loại deleted + self) — applied.
- `tg_messages_guard` clamp 6 cột (4 cũ + pinned_at/pinned_by) — applied.
- Ledger: `0045_pinned_messages.sql`, `0048_guard_pinned_columns.sql` đều ghi sổ.
- 0 tin ghim, 0 kênh test còn sót (mọi fixture verify đều rollback).

## Bẫy vận hành gặp khi test (cho phiên sau)

- `create_group` qua forged JWT dính **rate_limit channels 3/3600** (An đã tạo ≥3 kênh trong
  giờ trước đó) → fixture phải dựng bằng psql owner (auth.uid() null không bị đếm).
- Insert messages dính **slow_mode 2s/tin cùng tác giả** (`tg_message_inserted` so
  `now() - max(created_at)`) → backdate `created_at` khi seed fixture.
