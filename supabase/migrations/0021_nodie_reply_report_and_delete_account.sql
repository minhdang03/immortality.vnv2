-- 0021_nodie_reply_report_and_delete_account.sql
--
-- Hai việc phục vụ App Store review (guideline 1.2 UGC + 5.1.1(v) xoá tài khoản):
--
-- 1) Cho báo cáo reply: 0018 thêm bảng answer_replies nhưng check constraint của
--    reports (0017) chỉ nhận message/question/answer/user — báo cáo một reply sẽ
--    bị DB từ chối dù UI có nút. Mở rộng check thay vì lách bằng target_type khác:
--    id của reply và answer là hai không gian khác nhau, admin xử lý phải biết loại thật.
--
-- 2) delete_account(): client không tự xoá được auth.users (cần service role).
--    SECURITY DEFINER chạy bằng quyền owner (postgres) nên xoá được, và chỉ xoá
--    ĐÚNG user đang gọi (auth.uid()) — không nhận tham số nên không thể xoá hộ ai.
--    Dây chuyền xoá (đã kiểm ở 0020): auth.users → cascade profiles →
--    author_id/user_id SET NULL → nội dung ở lại dưới dạng "Ẩn danh".
--    Đây là khuôn Reddit/HN dùng: xoá người, giữ mạch thảo luận.

alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports add constraint reports_target_type_check
  check (target_type in ('message','question','answer','reply','user'));

create or replace function public.delete_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

-- Mặc định Postgres grant execute cho public — thu hồi rồi chỉ mở cho authenticated:
-- anon không có auth.uid() nhưng thu quyền tường minh vẫn rẻ hơn một giả định.
revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
