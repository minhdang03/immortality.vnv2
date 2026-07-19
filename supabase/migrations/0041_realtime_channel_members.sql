-- Cho "Đã xem" trong DM hiện LIVE: client nghe UPDATE trên channel_members để biết
-- last_read_at của người kia đổi ngay khi họ mở chat, không chờ refresh.
--
-- An toàn dữ liệu: WALRUS kiểm RLS per-subscriber — policy members_read chỉ cho thành viên
-- cùng kênh thấy nhau, nên event không lộ trạng thái đọc cho người ngoài kênh.
-- Idempotent: chạy lại không lỗi.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'channel_members'
  ) then
    alter publication supabase_realtime add table public.channel_members;
  end if;
end $$;
