-- 0027_nodie_device_token_env.sql — mỗi token nhớ nó thuộc môi trường APNs nào.
--
-- Vì sao không dùng một biến chung cho cả hệ thống: token từ build Debug chỉ sống ở
-- api.sandbox.push.apple.com, token từ TestFlight/App Store chỉ sống ở api.push.apple.com.
-- Hai loại máy chạy CÙNG LÚC (Đăng vừa dev vừa có tester), nên một biến toàn cục thì luôn
-- có một nửa số máy nhận `BadDeviceToken` — mà token đó hoàn toàn hợp lệ, chỉ gõ nhầm cửa.
-- Kiểu hỏng này rất khó lần ra vì nó không giống lỗi cấu hình, nó giống token hỏng.
--
-- App tự khai: nó là bên DUY NHẤT biết chắc mình build bằng entitlement nào
-- (`aps-environment` trong embedded.mobileprovision).

alter table public.device_tokens
  add column if not exists apns_env text not null default 'production'
  check (apns_env in ('sandbox', 'production'));

-- Token cũ (nếu có) đến từ Simulator/Debug trong lúc dựng phase 04b → sandbox.
-- Sai thì lần mở app sau nó tự khai lại đúng.
update public.device_tokens set apns_env = 'sandbox' where updated_at < now();
