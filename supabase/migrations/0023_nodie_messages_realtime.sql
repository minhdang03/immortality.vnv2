-- 0023_nodie_messages_realtime.sql — bật Realtime cho tin nhắn (phase 04).
--
-- Supabase Realtime `postgres_changes` chỉ đẩy sự kiện của bảng NẰM TRONG publication
-- `supabase_realtime`. Thiếu bước này thì client subscribe vẫn thành công, không lỗi,
-- không cảnh báo — chỉ là không bao giờ nhận được tin. Kiểu hỏng im lặng tốn cả buổi
-- để tìm, nên ghi thành migration thay vì bấm tay trên Dashboard.
--
-- RLS vẫn áp cho từng subscriber: mỗi người chỉ nhận tin của kênh họ đọc được
-- (policy `messages_read` ở 0017 + chốt đăng nhập ở 0019). Publication chỉ mở đường ống,
-- không mở quyền.
--
-- CHỈ thêm `messages`. `channels.last_message_at` do trigger cập nhật và cũng đổi mỗi lần
-- có tin, nhưng danh sách hội thoại tự sắp lại được từ chính sự kiện tin đến —
-- thêm channels vào đây là nhân đôi lượng sự kiện cho cùng một thay đổi.
--
-- Giới hạn cần biết: `postgres_changes` kiểm RLS cho MỖI subscriber trên MỖI sự kiện,
-- nên không gánh nổi quá vài trăm subscriber đồng thời. Khi đông thì chuyển sang Realtime
-- Broadcast — đó là quyết định phía client, đổi được mà không cần đụng lại schema.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
