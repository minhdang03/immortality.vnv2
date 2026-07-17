-- 0031_nodie_fix_push_trigger_net_schema.sql — sửa `extensions.net.http_post` → `net.http_post`,
-- và bọc lỗi push để nó không bao giờ chặn được việc gửi tin nữa.
--
-- TRIỆU CHỨNG (đo trên prod 17/07): MỌI insert vào `messages` đều nổ
--   0A000: cross-database references are not implemented: extensions.net.http_post
-- ⇒ gửi tin nhắn HỎNG HOÀN TOÀN, không riêng push.
--
-- NGUYÊN NHÂN: `extensions.net.http_post` có BA phần, nên Postgres đọc là
-- database `extensions` → schema `net` → hàm `http_post`, tức tham chiếu chéo database.
-- Postgres không làm được việc đó nên từ chối. Tên đúng chỉ có hai phần: `net.http_post`.
--
-- Vì sao dễ nhầm: `pg_net` ĐĂNG KÝ ở schema `extensions`
--   (select nspname from pg_extension e join pg_namespace n on n.oid=e.extnamespace → "extensions")
-- nhưng hàm của nó lại NẰM ở schema `net` do chính extension tạo ra
--   (select nspname from pg_proc ... where proname='http_post' → "net").
-- Nơi extension được đăng ký ≠ nơi hàm của nó sống. 0026 tin vào cái thứ nhất.
--
-- Vì sao không ai thấy sớm: màn Chat chạy bằng dữ liệu giả (MockData) nên chưa từng có tin
-- nào đi qua đường thật. Tin seed thì chèn từ 16/07, TRƯỚC lúc 0026 được áp (17/07 13:38).
-- Trigger hỏng nằm im vì không có ai gọi nó.
--
-- SỬA THÊM: bọc `exception when others` — chính 0026 đã tự viết ra bất biến này
-- ("raise ở đây là CHẶN LUÔN việc gửi tin — hỏng nặng hơn nhiều thứ nó bảo vệ") nhưng chỉ
-- áp cho trường hợp thiếu secret. Lỗi pg_net thì lọt qua và chặn đúng thứ nó thề sẽ không chặn.
-- Giờ bất biến được cưỡng chế thật: push hỏng kiểu gì, tin vẫn đi.

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

  -- `net.http_post`, KHÔNG phải `extensions.net.http_post` — xem đầu file.
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
  raise warning 'push-on-message bỏ qua (%): %', sqlstate, sqlerrm;
  return null;
end $$;
