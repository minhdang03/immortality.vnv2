-- 0043_group_management.sql — user thường tạo nhóm + vai trò quản trị + RLS nhóm.
--
-- Đăng ĐẢO quyết định 20/07: "chỉ admin tạo nhóm" → user thường tạo được nhóm, mô hình
-- Telegram/Zalo. Người tạo là quản trị (channels.created_by + channel_members.role='mod'),
-- nhiều quản trị, chuyển giao chủ nhóm được.
--
-- BẤT BIẾN (phase-04, không thương lượng):
--   - MỌI policy mới ràng kind='group'. Nới sang 'dm' = một người "quản trị" cuộc trò chuyện
--     riêng của hai người; nới sang 'public' = user tự mở kênh phát sóng toàn hệ thống.
--   - Vị từ quyền dùng LẠI is_channel_mod/is_channel_member (0017, security definer) —
--     policy trên channel_members mà tự truy vấn channel_members là đệ quy vô hạn,
--     chết TOÀN BỘ chat.
--   - members_self_leave / members_self_join / members_self_update GIỮ NGUYÊN.
--
-- KHÔNG có begin/commit trong file — người áp bọc ngoài (begin; \i ...; rollback|commit;).
-- Idempotent: create or replace + drop policy/trigger if exists.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. RPC create_group — tạo kênh + tự thêm mình làm mod là HAI ghi phải cùng thành
--    công; làm hai lệnh từ client thì đứt giữa chừng sinh nhóm không có chủ (bài học
--    0030: create_dm). Security definer còn là đường DUY NHẤT: members_self_join chỉ
--    cho public/dm, người tạo không tự chèn nổi mình vào group qua RLS.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.create_group(p_title text, p_member_ids uuid[] default array[]::uuid[])
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me  uuid := auth.uid();
  cid uuid;
begin
  if me is null then
    raise exception 'Cần đăng nhập.' using errcode = '42501';
  end if;
  if p_title is null or btrim(p_title) = '' then
    raise exception 'Nhóm cần có tên.' using errcode = '22023';
  end if;

  insert into public.channels (kind, title, is_broadcast, created_by)
  values ('group', btrim(p_title), false, me)
  returning id into cid;

  insert into public.channel_members (channel_id, user_id, role)
  values (cid, me, 'mod');

  -- Thành viên mời: lọc chính mình, người không tồn tại, và cặp chặn/bị chặn (cùng
  -- luật với create_dm 0030 — kéo người đã chặn mình vào nhóm là mở lại đường nói
  -- chuyện họ đã đóng). Lọc im lặng chứ không raise: Telegram cũng vậy, nhóm vẫn
  -- được tạo với những người mời được.
  insert into public.channel_members (channel_id, user_id, role)
  select distinct cid, m.uid, 'member'
  from unnest(coalesce(p_member_ids, array[]::uuid[])) as m(uid)
  where m.uid <> me
    and exists (select 1 from public.profiles p where p.id = m.uid)
    and not public.is_blocked_pair(me, m.uid)
  on conflict (channel_id, user_id) do nothing;

  return cid;
end;
$$;

revoke all on function public.create_group(text, uuid[]) from public, anon;
grant execute on function public.create_group(text, uuid[]) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. channels_insert_dm — nới cho kind='group' khi chính mình là người tạo.
--    'public'/'feed' vẫn CHỈ admin: kênh phát sóng không phải thứ ai cũng mở.
--    (create_group là đường chính; policy này cho phép insert trực tiếp nếu client
--    nào cần — nhưng tự chèn mình vào members thì vẫn kẹt RLS, nên dùng RPC.)
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists channels_insert_dm on public.channels;
create policy channels_insert_dm on public.channels
  for insert with check (
    kind = 'dm'
    or (kind = 'group' and created_by = (select auth.uid()))
    or public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. channels_update_by_mod — quản trị sửa nhóm (đổi tên…). Ràng kind='group' ở CẢ
--    using LẪN with check: using để mod không đụng kênh public/dm, with check để
--    không đổi được kind sang 'public' (tự thăng nhóm thành kênh phát sóng).
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists channels_update_by_mod on public.channels;
create policy channels_update_by_mod on public.channels
  for update
  using (kind = 'group' and public.is_channel_mod(id))
  with check (kind = 'group' and public.is_channel_mod(id));

-- Policy trên KHÔNG phân biệt được cột: một mod (không phải chủ) có thể UPDATE
-- created_by = chính mình → cướp quyền chủ nhóm, rồi xoá chủ cũ. Trigger chặn từ
-- gốc: đổi created_by chỉ được đi qua transfer_group_owner (security definer chạy
-- dưới owner của function, current_user <> 'authenticated') hoặc admin/service_role.
create or replace function public.tg_channels_guard_created_by()
returns trigger
language plpgsql
as $$
begin
  if new.created_by is distinct from old.created_by
     and current_user = 'authenticated'
     and not public.is_admin() then
    raise exception 'Chuyển chủ nhóm phải qua transfer_group_owner.' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_channels_guard_created_by on public.channels;
create trigger trg_channels_guard_created_by
  before update of created_by on public.channels
  for each row
  execute function public.tg_channels_guard_created_by();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. members_add_by_mod — quản trị thêm người vào NHÓM. Bổ sung cho members_self_join
--    (giữ nguyên — đó là đường tự vào kênh public/dm). Subquery channels chạy dưới RLS
--    người gọi: mod là thành viên nên channels_read cho thấy — đúng ý.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists members_add_by_mod on public.channel_members;
create policy members_add_by_mod on public.channel_members
  for insert with check (
    public.is_channel_mod(channel_id)
    and exists (select 1 from public.channels c
                where c.id = channel_id and c.kind = 'group')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. members_manage_by_mod — quản trị xoá thành viên / đổi role, CHỈ trong nhóm.
--    Hai policy vì mỗi policy một command. Chặn đụng CHỦ NHÓM (hàng của created_by)
--    ở cả delete lẫn update: xoá chủ = nhóm mồ côi; hạ role chủ = phá bất biến
--    "chủ nhóm là mod". Chủ nhóm tự sửa hàng mình qua members_self_update như cũ.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists members_manage_by_mod_delete on public.channel_members;
create policy members_manage_by_mod_delete on public.channel_members
  for delete using (
    public.is_channel_mod(channel_id)
    and exists (select 1 from public.channels c
                where c.id = channel_id and c.kind = 'group')
    and user_id <> (select c.created_by from public.channels c where c.id = channel_id)
  );

drop policy if exists members_manage_by_mod_update on public.channel_members;
create policy members_manage_by_mod_update on public.channel_members
  for update
  using (
    public.is_channel_mod(channel_id)
    and exists (select 1 from public.channels c
                where c.id = channel_id and c.kind = 'group')
    and user_id <> (select c.created_by from public.channels c where c.id = channel_id)
  )
  with check (
    public.is_channel_mod(channel_id)
    and exists (select 1 from public.channels c
                where c.id = channel_id and c.kind = 'group')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. RPC transfer_group_owner — chuyển giao chủ nhóm. Security definer vì phải vượt
--    trigger guard ở mục 3 (và là chỗ DUY NHẤT được vượt). Chủ cũ GIỮ mod —
--    chuyển giao không phải trục xuất (Telegram cũng vậy).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.transfer_group_owner(p_channel_id uuid, p_new_owner uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me        uuid := auth.uid();
  cur_owner uuid;
  cur_kind  text;
begin
  if me is null then
    raise exception 'Cần đăng nhập.' using errcode = '42501';
  end if;

  select created_by, kind into cur_owner, cur_kind
  from public.channels where id = p_channel_id;

  if cur_kind is null then
    raise exception 'Không tìm thấy nhóm.' using errcode = 'P0002';
  end if;
  if cur_kind <> 'group' then
    raise exception 'Chỉ chuyển giao được nhóm.' using errcode = '22023';
  end if;
  if cur_owner is distinct from me then
    raise exception 'Chỉ chủ nhóm mới chuyển giao được.' using errcode = '42501';
  end if;
  if p_new_owner is null or p_new_owner = me then
    raise exception 'Chọn một thành viên khác làm chủ nhóm.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.channel_members m
                 where m.channel_id = p_channel_id and m.user_id = p_new_owner) then
    raise exception 'Người nhận phải là thành viên nhóm.' using errcode = '22023';
  end if;

  update public.channels set created_by = p_new_owner where id = p_channel_id;
  -- Người nhận thành mod; chủ cũ cũng đảm bảo còn mod (bình thường đã là mod sẵn).
  update public.channel_members set role = 'mod'
  where channel_id = p_channel_id and user_id in (p_new_owner, me);
end;
$$;

revoke all on function public.transfer_group_owner(uuid, uuid) from public, anon;
grant execute on function public.transfer_group_owner(uuid, uuid) to authenticated;

-- Sổ cái migration (0035): ghi nhận đã áp — idempotent nhờ on conflict.
insert into public._applied_migrations (filename)
values ('0043_group_management.sql')
on conflict (filename) do nothing;
