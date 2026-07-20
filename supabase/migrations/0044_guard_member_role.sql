-- Chặn tự phong quản trị nhóm.
--
-- LỖ ĐANG SỐNG TRÊN PROD (chứng minh 20/07/2026 bằng phiên psql giả JWT, đã rollback):
--   set local role authenticated;
--   set local request.jwt.claims = '{"sub":"<uuid thành viên thường>"}';
--   update channel_members set role='mod' where channel_id=<nhóm> and user_id=auth.uid();
--   → UPDATE 1, và is_channel_mod(<nhóm>) trả true ngay sau đó.
--
-- Nguyên nhân: policy `members_self_update` cho user ghi hàng CỦA MÌNH
-- (`user_id = auth.uid()` ở cả USING lẫn WITH CHECK), mà **RLS của Postgres không giới hạn
-- được theo CỘT** — cho ghi hàng là cho ghi mọi cột trong hàng đó, kể cả `role`.
-- Policy sinh ra cho `last_read_at`/`muted_until` (mute, đánh dấu đã đọc), nhưng nó không
-- có cách nào tự bó lại chỉ hai cột ấy.
--
-- Vì sao gấp: trước 0043, `role='mod'` chỉ mở thêm quyền xoá tin trong kênh. Từ 0043, mod
-- LÀ quản trị nhóm — thêm/xoá thành viên, đổi tên nhóm; và kế hoạch ghim tin (phase 06)
-- cũng treo quyền lên đúng vai trò này. Tự phong = tự chiếm nhóm của người khác.
--
-- Cách chữa: trigger, không phải policy — cùng khuôn `nodie_clamp_last_read_at` (0042),
-- vốn đã dựng ra chính vì lý do này (RLS không nói được chuyện cấp cột). Policy giữ nguyên
-- để mute/đánh dấu đã đọc vẫn chạy; trigger chỉ chặn đúng thứ cần chặn.
--
-- Idempotent: create or replace + drop trigger if exists.

create or replace function public.nodie_guard_member_role()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  -- Đổi vai trò: chỉ quản trị nhóm (hoặc admin — `is_channel_mod` đã gộp sẵn `is_admin()`).
  --
  -- BEFORE trigger nên hàng CHƯA đổi: `is_channel_mod` đọc `role` cũ, tức kẻ đang tự phong
  -- vẫn còn là 'member' lúc bị hỏi. Đó chính là điều làm phép kiểm này đúng.
  if new.role is distinct from old.role then
    if not public.is_channel_mod(old.channel_id) then
      raise exception 'Chỉ quản trị nhóm mới đổi được vai trò thành viên'
        using errcode = '42501';
    end if;
  end if;

  -- Không cho dời hàng sang kênh khác hay sang người khác. Cùng lý do trên: được ghi hàng
  -- không có nghĩa được biến hàng đó thành tư cách thành viên của một kênh khác.
  if new.channel_id is distinct from old.channel_id
     or new.user_id is distinct from old.user_id then
    raise exception 'Không đổi được channel_id/user_id của một tư cách thành viên'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_member_role on public.channel_members;
create trigger trg_guard_member_role
  before update on public.channel_members
  for each row execute function public.nodie_guard_member_role();

insert into public._applied_migrations(filename)
values ('0044_guard_member_role.sql')
on conflict (filename) do nothing;

-- Ghi bù hai migration đã áp trên prod nhưng thiếu trong ledger (kiểm 20/07: publication
-- realtime có channel_members, hàm nodie_clamp_last_read_at tồn tại — cả hai đã chạy thật,
-- chỉ là không ai ghi sổ). Ledger nói dối thì lần sau không ai dám tin nó nữa.
insert into public._applied_migrations(filename)
values ('0041_realtime_channel_members.sql'), ('0042_server_clock_last_read_at.sql')
on conflict (filename) do nothing;
