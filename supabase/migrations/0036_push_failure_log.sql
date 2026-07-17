-- 0036_push_failure_log.sql — push hỏng phải ĐỂ LẠI DẤU VẾT.
--
-- 0031 bọc `exception when others` để push hỏng không chặn gửi tin (đúng bất biến),
-- nhưng hệ quả là push chết cả tuần cũng không ai hay. Bảng này là chỗ đọc:
--   · Edge function push-on-message ghi mỗi token trả status != 200 (BadDeviceToken…)
--   · Chính trigger, khi rơi vào exception, cũng tự ghi một dòng `trigger_exception`.
--
-- `user_id` = NGƯỜI NHẬN của token hỏng (edge function biết); dòng trigger_exception
-- xảy ra trước khi biết người nhận nào → user_id null.

create table if not exists public.push_failures (
  id         bigint generated always as identity primary key,
  message_id uuid,
  channel_id uuid,
  user_id    uuid,
  apns_env   text,
  status     int,
  reason     text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_failures_created_at_idx
  on public.push_failures (created_at desc);

alter table public.push_failures enable row level security;

-- Chứa user_id người nhận → admin-only. Không policy ghi: edge function chạy
-- service_role, trigger là security definer của owner — cả hai không cần policy.
drop policy if exists push_failures_admin_read on public.push_failures;
create policy push_failures_admin_read on public.push_failures
  for select using (public.is_admin());

-- Cập nhật trigger: bản dưới đây chép từ pg_get_functiondef TRÊN PROD (18/07),
-- KHÔNG chép từ file 0031 trong repo — đề phòng prod đã drift. Chỉ thêm khối ghi sổ
-- trong exception; mọi logic khác giữ nguyên từng dòng.
create or replace function public.tg_push_on_message()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  fn_url  text;
  secret  text;
begin
  select decrypted_secret into fn_url
    from vault.decrypted_secrets where name = 'push_function_url';
  select decrypted_secret into secret
    from vault.decrypted_secrets where name = 'push_webhook_secret';

  -- Chưa nạp secret (vd lúc dựng lại DB) thì im lặng bỏ qua: thiếu push là mất tiện nghi,
  -- còn raise ở đây là CHẶN LUÔN việc gửi tin — hỏng nặng hơn nhiều thứ nó bảo vệ.
  if fn_url is null or secret is null then
    return null;
  end if;

  -- `net.http_post`, KHÔNG phải `extensions.net.http_post` — xem 0031.
  perform net.http_post(
    url     := fn_url,
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-push-secret', secret
               ),
    body    := jsonb_build_object(
                 'type', 'INSERT',
                 'table', 'messages',
                 'record', to_jsonb(new)
               ),
    timeout_milliseconds := 5000
  );
  return null;
exception when others then
  -- Push là tiện nghi, tin nhắn là sản phẩm. Không có gì trong khối trên đáng để làm hỏng
  -- một tin nhắn của người dùng — kể cả pg_net biến mất hay đổi chỗ lần nữa.
  -- Ghi sổ để có chỗ đọc; sổ hỏng thì cũng KHÔNG được chặn tin — bọc thêm một tầng.
  begin
    insert into public.push_failures(message_id, channel_id, reason)
    values (new.id, new.channel_id, 'trigger_exception: ' || sqlstate || ' ' || sqlerrm);
  exception when others then
    null;
  end;
  raise warning 'push-on-message bỏ qua (%): %', sqlstate, sqlerrm;
  return null;
end $function$;

insert into public._applied_migrations(filename)
values ('0036_push_failure_log.sql')
on conflict (filename) do nothing;
