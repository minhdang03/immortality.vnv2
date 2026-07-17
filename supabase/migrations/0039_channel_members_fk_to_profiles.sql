-- 0039_channel_members_fk_to_profiles.sql — cùng bệnh, cùng thuốc với 0020 (messages).
--
-- `channel_members.user_id` trỏ `auth.users` nên PostgREST không lần được sang
-- `public_profiles` (view trên `profiles`) → không embed được tên thành viên:
-- "Xem hồ sơ" trong DM và danh sách thành viên nhóm không có đường lấy dữ liệu.
-- Repoint sang `profiles(id)`; `profiles` đã cascade từ `auth.users` (0009) nên xoá
-- tài khoản vẫn dọn membership y như cũ. Đo 18/07: 0 dòng mồ côi trước khi đổi.
--
-- (0038 đã được phase seed của plan 2015 đặt chỗ — file này lấy 0039.)

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'channel_members_user_id_fkey'
      and confrelid = 'auth.users'::regclass
  ) then
    alter table public.channel_members drop constraint channel_members_user_id_fkey;
    alter table public.channel_members
      add constraint channel_members_user_id_fkey
      foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
end $$;

insert into public._applied_migrations(filename)
values ('0039_channel_members_fk_to_profiles.sql')
on conflict (filename) do nothing;
