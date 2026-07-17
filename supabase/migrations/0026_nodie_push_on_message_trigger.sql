-- 0026_nodie_push_on_message_trigger.sql — tin mới → gọi Edge Function `push-on-message`.
--
-- Vì sao trigger ở DB chứ không để client tự gọi sau khi gửi: client gửi xong có thể chết,
-- mất mạng, hoặc bị kill — tin đã vào bảng mà không ai được báo. Ở DB thì tin nào vào cũng
-- có chuông, kể cả tin do agent/psql/admin chèn.
--
-- `net.http_post` (pg_net) chạy BẤT ĐỒNG BỘ: nó xếp yêu cầu vào hàng rồi trả về ngay, nên
-- APNs chậm hay chết cũng KHÔNG làm chậm việc gửi tin. Người gửi không phải chờ push.
--
-- Secret + URL đọc từ Vault, KHÔNG viết thẳng vào file này: migration nằm trong git.
-- Nạp một lần bằng scripts/set-push-secrets.sh (không commit).

create or replace function public.tg_push_on_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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

  perform extensions.net.http_post(
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
end $$;

-- AFTER INSERT: chỉ báo cho tin đã thật sự nằm trong bảng.
-- Tin xoá mềm (`deleted_at`) không đi qua đây vì đó là UPDATE, không phải INSERT.
drop trigger if exists trg_push_on_message on public.messages;
create trigger trg_push_on_message
  after insert on public.messages
  for each row execute function public.tg_push_on_message();
