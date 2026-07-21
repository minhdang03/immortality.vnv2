-- "Đánh dấu chưa đọc" — sửa xung đột với trigger clamp 0042.
--
-- BUG (Fable phát hiện 21/07): trigger `nodie_clamp_last_read_at` (0042) ép MỌI thay đổi
-- `last_read_at` về `now()`. markRead cần đúng vậy (chống lệch đồng hồ máy). Nhưng markUnread
-- cần đẩy mốc LÙI về trước tin mới nhất để badge >0 — clamp vô hiệu hoá nó, badge "chưa đọc"
-- chỉ sống trong RAM/disk local, restart app là `nodie_unread_counts` đếm 0 → mất dấu.
--
-- Hai thao tác đối nghịch trên cùng một cột, mà client KHÔNG đáng tin về thời gian tuyệt đối:
--   markRead  → last_read_at = "bây giờ" (server)  → giữ clamp cho cập nhật client trực tiếp.
--   markUnread → last_read_at = một mốc QUÁ KHỨ server-tính → phải BỎ QUA clamp.
--
-- Cách tách: clamp CHỈ áp khi `current_user = 'authenticated'` (cập nhật trực tiếp của client,
-- tức markRead qua PostgREST). RPC security definer chạy dưới OWNER (current_user <>
-- 'authenticated') nên đi qua clamp, đặt được mốc lùi có chủ đích. markUnread thành RPC.
--
-- ⚠️ Đây là bypass CÓ CHỦ ĐÍCH — khác lỗ [[project_nodie_column_guard_trigger_not_secdef]]
-- nơi bypass là VÔ TÌNH. markRead trực tiếp VẪN bị clamp (client = authenticated), nên tính
-- chống-lệch-đồng-hồ của 0042 nguyên vẹn; chỉ RPC được đặt mốc quá khứ.
--
-- Idempotent: create or replace.

create or replace function public.nodie_clamp_last_read_at()
returns trigger
language plpgsql
as $$
begin
  -- Chỉ clamp cập nhật TRỰC TIẾP của client. RPC security definer (mark_unread) đặt mốc
  -- quá khứ có chủ đích thì để yên.
  if current_user = 'authenticated'
     and new.last_read_at is distinct from old.last_read_at then
    new.last_read_at := now();
  end if;
  return new;
end;
$$;

-- markUnread — đặt last_read_at về NGAY TRƯỚC tin mới nhất (chưa xoá), server-tính, để tin
-- đó thành chưa đọc và `nodie_unread_counts` đếm ≥1. Không nhận mốc từ client: thời gian
-- tuyệt đối do server quyết, client chỉ nói "kênh nào".
create or replace function public.mark_unread(p_channel_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target timestamptz;
begin
  -- security definer bỏ RLS → tự kiểm caller là thành viên kênh.
  if not exists (
    select 1 from public.channel_members
    where channel_id = p_channel_id and user_id = auth.uid()
  ) then
    raise exception 'Không phải thành viên kênh.' using errcode = '42501';
  end if;

  select max(created_at) - interval '1 millisecond' into target
  from public.messages
  where channel_id = p_channel_id and deleted_at is null;

  -- Kênh chưa có tin nào → không có gì để đánh dấu chưa đọc.
  if target is null then return; end if;

  update public.channel_members
  set last_read_at = target
  where channel_id = p_channel_id and user_id = auth.uid();
end;
$$;

revoke all on function public.mark_unread(uuid) from public, anon;
grant execute on function public.mark_unread(uuid) to authenticated;

insert into public._applied_migrations(filename)
values ('0053_mark_unread_rpc.sql')
on conflict (filename) do nothing;
