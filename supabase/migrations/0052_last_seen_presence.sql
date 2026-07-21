-- "Đang hoạt động" / "Hoạt động X phút trước" (mục 9).
--
-- Một cột `last_seen_at` trên profiles, app cập nhật nhịp (heartbeat) khi mở app. KHÔNG
-- dùng Supabase Realtime Presence: presence là trạng thái phù du theo từng kênh socket, mà
-- ta cần một mốc BỀN để hiện "hoạt động 5 phút trước" cả khi người đó đã đóng app. Một cột
-- vừa lo "đang online" (mốc trong vòng ~60s) vừa lo "lần cuối thấy" — một nguồn sự thật.
--
-- Ghi qua policy `profiles_self_update` sẵn có (id = auth.uid()). Trigger `tg_profiles_guard_role`
-- REVERT im lặng cột `role` nếu ai đó lén đổi kèm — heartbeat chỉ đụng `last_seen_at` nên đi
-- qua sạch (đã dry-run 21/07: last_seen update chạy, role giữ nguyên 'user').
--
-- Idempotent.

alter table public.profiles
  add column if not exists last_seen_at timestamptz;

-- Đọc của người khác đi qua view `public_profiles` (mọi user đã đăng nhập đọc được; view
-- security_invoker=false nên chạy quyền owner, vượt RLS self-read của bảng gốc). Thêm cột
-- vào view — GIỮ security_invoker=false, nếu không recreate sẽ đổi hành vi và mọi join
-- author:public_profiles đang chạy sẽ vỡ quyền đọc.
create or replace view public.public_profiles
  with (security_invoker = false) as
  select id, display_name, bio, created_at, last_seen_at
  from public.profiles;

grant select on public.public_profiles to authenticated;

insert into public._applied_migrations(filename)
values ('0052_last_seen_presence.sql')
on conflict (filename) do nothing;
