-- Chặn tự phong quản trị qua đường INSERT — lỗ CRITICAL còn hở sau 0044.
--
-- 0044 vá được đường UPDATE (trigger BEFORE UPDATE), nhưng `members_self_join` (0017) cho
-- user tự chèn hàng CỦA MÌNH vào kênh public/dm mà KHÔNG ràng `role`. Chứng minh trên prod
-- 21/07 (giả JWT, đã rollback):
--   set local role authenticated; set local request.jwt.claims = '{"sub":"<user thường>"}';
--   insert into channel_members(channel_id,user_id,role) values ('<kênh public>', auth.uid(), 'mod');
--   → INSERT 1, is_channel_mod('<kênh public>') = true.
--
-- Hệ quả: bất kỳ ai cũng tự phong quản trị KÊNH PUBLIC (thông báo) → ghim/gỡ tin (0045,
-- vừa thêm), xoá tin người khác (`messages_delete_own_or_mod`, 0017). Id kênh public là
-- public-readable nên không cần đoán. DM thoát vì subquery `channels` chạy dưới RLS người
-- gọi (không thấy DM người khác); chỉ kênh public dính.
--
-- Cách vá: ràng `role = 'member'` ở with check của `members_self_join`. Đường tự-vào-kênh
-- luôn là vào với tư cách thành viên thường; muốn thành quản trị phải được quản trị khác
-- phong (đi qua UPDATE, đã bị 0044 canh). RPC `create_group`/`create_dm` là security definer,
-- bypass RLS nên KHÔNG ảnh hưởng — người tạo nhóm vẫn được đặt 'mod' qua RPC.
--
-- Idempotent: drop policy if exists + create.

drop policy if exists members_self_join on public.channel_members;
create policy members_self_join on public.channel_members
  for insert with check (
    user_id = (select auth.uid())
    and role = 'member'
    and (
      exists (select 1 from public.channels c
              where c.id = channel_id and c.kind in ('public','dm'))
      or public.is_admin()
    )
  );

insert into public._applied_migrations(filename)
values ('0048_guard_self_join_role.sql')
on conflict (filename) do nothing;
