-- Ghim tin nhắn — kênh thông báo cần nội quy/thông báo đứng đầu, không trôi mất sau vài
-- chục tin.
--
-- Quyền: CHỈ quản trị nhóm (Đăng chốt 20/07). `is_channel_mod` đã gộp sẵn admin. Thành viên
-- thường THẤY ghim, không ghim được. DM không có mod → không ai ghim được trong DM (nếu sau
-- này muốn cho phép thì là quyết định riêng, không suy ra từ đây).
--
-- Cột trên `messages`, KHÔNG bảng rời: ghim là thuộc tính một-một của tin. Bảng rời phải
-- join ở mọi đường đọc tin chỉ để biết một cờ.

alter table public.messages
  add column if not exists pinned_at  timestamptz,
  add column if not exists pinned_by  uuid references auth.users(id) on delete set null;

-- Băng ghim đọc "tin đang ghim của kênh này, mới ghim trước". Partial index: đại đa số tin
-- không ghim, index chỉ cần chứa số ít có ghim.
create index if not exists idx_messages_pinned
  on public.messages(channel_id, pinned_at desc) where pinned_at is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- set_pinned — RPC security definer, chỉ đụng pinned_at/pinned_by.
--
-- KHÔNG thêm policy UPDATE cho mod: policy UPDATE của Postgres không giới hạn được theo
-- CỘT (đúng lỗ mà 0044 vừa phải vá bằng trigger). Cho mod `update` trên messages để ghim =
-- vô tình cho mod sửa `body` tin của người khác. RPC đóng đúng cửa cần đóng, không mở thêm.
--
-- Trần 3 tin ghim mỗi kênh: băng ghim chiếm chỗ trên MỌI màn chat; ghim cái thứ 4 phải gỡ
-- bớt, không âm thầm đẩy cái cũ ra (khác Telegram — ở đây băng luôn hiển thị).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_pinned(p_message_id uuid, p_pinned boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  select channel_id into cid from public.messages
   where id = p_message_id and deleted_at is null;
  if cid is null then
    raise exception 'Tin không tồn tại.' using errcode = 'P0002';
  end if;

  -- security definer chạy ngoài RLS, nên phải TỰ kiểm quyền: chỉ quản trị nhóm.
  if not public.is_channel_mod(cid) then
    raise exception 'Chỉ quản trị nhóm mới ghim được tin.' using errcode = '42501';
  end if;

  if p_pinned then
    -- Trần đếm KHÔNG tính: (1) tin đã xoá mềm — RPC này từ chối đụng tin đã xoá ("Tin không
    -- tồn tại" ở trên) nên nếu tính thì một tin ghim bị xoá chiếm slot VĨNH VIỄN, không ai
    -- gỡ nổi; (2) chính tin đang ghim — ghim lại tin đã ghim là bump nó lên đầu băng,
    -- không phải xin thêm slot.
    if (select count(*) from public.messages
         where channel_id = cid and pinned_at is not null
           and deleted_at is null
           and id <> p_message_id) >= 3 then
      raise exception 'Mỗi kênh chỉ ghim tối đa 3 tin. Gỡ bớt trước.' using errcode = '23514';
    end if;
    update public.messages
       set pinned_at = now(), pinned_by = auth.uid()
     where id = p_message_id;
  else
    update public.messages
       set pinned_at = null, pinned_by = null
     where id = p_message_id;
  end if;
end;
$$;

revoke all on function public.set_pinned(uuid, boolean) from public, anon;
grant execute on function public.set_pinned(uuid, boolean) to authenticated;

insert into public._applied_migrations(filename)
values ('0045_pinned_messages.sql')
on conflict (filename) do nothing;
