-- last_read_at phải theo ĐỒNG HỒ SERVER, không phải đồng hồ máy người đọc.
--
-- Client gửi Date() của máy khi đánh dấu đã đọc; máy nhanh 5 phút thì mốc "đã đọc tới
-- T+5ph" nằm luôn trong DB — nhãn "Đã xem" (so với created_at do server cấp) sẽ nhận vơ
-- cả tin người ta CHƯA thấy, và unread RPC (0040) cũng đếm lệch cùng kiểu. Giá trị skew
-- không tự sạch, nên chặn từ gốc: mọi UPDATE đổi last_read_at đều bị ép về now().
-- "Đánh dấu đã đọc" về ngữ nghĩa chỉ có một mốc hợp lệ là "bây giờ" — không có ca hợp lệ
-- nào client cần đặt mốc khác.
--
-- Idempotent: create or replace + drop trigger if exists.

create or replace function public.nodie_clamp_last_read_at()
returns trigger
language plpgsql
as $$
begin
  if new.last_read_at is distinct from old.last_read_at then
    new.last_read_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_clamp_last_read_at on public.channel_members;
create trigger trg_clamp_last_read_at
  before update of last_read_at on public.channel_members
  for each row
  execute function public.nodie_clamp_last_read_at();
