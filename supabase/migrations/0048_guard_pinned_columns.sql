-- Chặn tự ghim tin bằng UPDATE thẳng (bịt nốt cửa thứ hai của phase ghim).
--
-- LỖ ĐANG SỐNG TRÊN PROD (chứng minh 21/07/2026 bằng phiên psql giả JWT role='user',
-- đã rollback): tác giả một tin — KHÔNG phải quản trị nhóm — chạy
--   update messages set pinned_at = now(), pinned_by = auth.uid() where id = <tin của mình>;
--   → UPDATE 1, tin thành "đã ghim".
--
-- Nguyên nhân: cùng bài 0044/0047 — policy `messages_update_own` cho tác giả ghi hàng CỦA
-- MÌNH (sửa body, xoá mềm), mà RLS của Postgres không bó được theo CỘT. 0045 cố tình KHÔNG
-- thêm policy update nào cho mod và dồn hết quyền ghim vào RPC `set_pinned` (kiểm
-- is_channel_mod + trần 3 ghim/kênh) — nhưng cửa `messages_update_own` có sẵn từ trước vẫn
-- để tác giả tự ghim tin mình, vượt mặt cả hai phép kiểm đó.
--
-- Cách chữa: mở rộng đúng guard 0047 đã dựng cho messages — clamp thêm pinned_at/pinned_by
-- về giá trị cũ với mọi phiên `authenticated` không phải admin. `set_pinned` (security
-- definer, current_user = owner của function, không phải 'authenticated') không bị ảnh
-- hưởng — nó vẫn là đường ghim DUY NHẤT.
--
-- File này PHẢI đứng sau 0047: nó create-or-replace cùng function; chạy trước thì 0047
-- replay sẽ ghi đè mất clamp này.
--
-- Idempotent: create or replace; trigger trg_messages_guard đã trỏ sẵn vào function.

create or replace function public.tg_messages_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' and not public.is_admin() then
    new.channel_id := old.channel_id;
    new.user_id    := old.user_id;
    new.parent_id  := old.parent_id;
    new.created_at := old.created_at;
    new.pinned_at  := old.pinned_at;
    new.pinned_by  := old.pinned_by;
  end if;
  return new;
end $$;

insert into public._applied_migrations(filename)
values ('0048_guard_pinned_columns.sql')
on conflict (filename) do nothing;
