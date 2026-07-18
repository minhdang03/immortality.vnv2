-- 0040_unread_counts_rpc.sql — đếm chưa đọc MỘT round trip thay vì N.
--
-- Client cũ đếm từng kênh một, TUẦN TỰ: 6 kênh × 170-430ms = 1.5-2.5 giây spinner khi mở
-- tab Chat (đo 18/07 22:5x, cùng đường mạng với máy Đăng). Đây là món nợ chính
-- ConversationStore.loadUnreadCounts tự ghi: "khi nào nhiều kênh thì gộp thành RPC".
--
-- SECURITY INVOKER, không phải definer: count chạy dưới RLS của người gọi — hàm này
-- không được phép biết nhiều hơn chính user đó. Cùng bất biến với messages_read.
-- (0038 vẫn trống — plan 2015 phase 03 đặt chỗ rồi chuyển hướng seed không-migration; nhường số.)

create or replace function public.nodie_unread_counts()
returns table (channel_id uuid, unread bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select m.channel_id, count(*)::bigint
  from public.messages m
  join public.channel_members cm
    on cm.channel_id = m.channel_id
   and cm.user_id = auth.uid()
  where m.created_at > cm.last_read_at
    and m.deleted_at is null
  group by m.channel_id
$$;

insert into public._applied_migrations(filename)
values ('0040_unread_counts_rpc.sql')
on conflict (filename) do nothing;
