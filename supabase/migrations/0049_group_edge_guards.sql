-- Hai lỗ mép của quản trị nhóm, tìm ra lúc review 21/07.
--
-- M5: mod thêm người ĐÃ CHẶN vào nhóm. `create_group` (0043) lọc `is_blocked_pair`, nhưng
--     policy `members_add_by_mod` thì không → B chặn A, B là mod → B kéo A vào nhóm, mở lại
--     đúng đường nói chuyện A đã đóng (bất biến 0030/0043 tuyên bố chặn). Ràng thêm ở with
--     check: người mời KHÔNG được có quan hệ chặn với người được thêm.
--
--     `auth.uid()` ở đây là NGƯỜI THÊM (mod đang chạy INSERT), `user_id` là người được thêm.
--
-- M6: chủ nhóm tự hạ vai trò mình xuống 'member' → nhóm brick. Trigger 0044 đọc role CŨ nên
--     lúc hạ, chủ vẫn là mod → lọt; sau đó không tự phong lại được (đã là member), và
--     transfer_group_owner cũng fail vì trigger 0044 chặn. Chỉ psql cứu. Cấm hạ vai trò của
--     chính chủ nhóm ngay trong trigger role-guard.
--
-- Idempotent: drop/create policy + create or replace function.

-- ── M5 ──────────────────────────────────────────────────────────────────────
drop policy if exists members_add_by_mod on public.channel_members;
create policy members_add_by_mod on public.channel_members
  for insert with check (
    public.is_channel_mod(channel_id)
    and exists (select 1 from public.channels c
                where c.id = channel_id and c.kind = 'group')
    and not public.is_blocked_pair((select auth.uid()), user_id)
  );

-- ── M6 ──────────────────────────────────────────────────────────────────────
-- Thay hàm 0044: giữ nguyên hai chốt cũ (đổi role phải là mod; không dời channel/user),
-- thêm một chốt — không ai hạ được vai trò của CHỦ NHÓM, kể cả chính chủ.
create or replace function public.nodie_guard_member_role()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  owner_id uuid;
begin
  if new.role is distinct from old.role then
    if not public.is_channel_mod(old.channel_id) then
      raise exception 'Chỉ quản trị nhóm mới đổi được vai trò thành viên'
        using errcode = '42501';
    end if;
    -- Chủ nhóm luôn là quản trị. Hạ chủ = nhóm không còn ai sửa được (chủ không tự phong
    -- lại được, transfer cũng cần chủ là mod). Chuyển quyền chủ đi qua transfer_group_owner.
    select created_by into owner_id from public.channels where id = old.channel_id;
    if old.user_id = owner_id and new.role <> 'mod' then
      raise exception 'Không hạ được vai trò của chủ nhóm. Chuyển quyền chủ trước.'
        using errcode = '42501';
    end if;
  end if;

  if new.channel_id is distinct from old.channel_id
     or new.user_id is distinct from old.user_id then
    raise exception 'Không đổi được channel_id/user_id của một tư cách thành viên'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

insert into public._applied_migrations(filename)
values ('0049_group_edge_guards.sql')
on conflict (filename) do nothing;
