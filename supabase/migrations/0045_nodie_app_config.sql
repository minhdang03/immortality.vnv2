-- 0045_nodie_app_config.sql — bảng cấu hình runtime: feature flags + ngưỡng rate-limit.
--
-- Vì sao tồn tại: gate tính năng đang cứng trong code Swift (qaUnlocked theo role) —
-- muốn mở tab Hỏi đáp cho user thường là phải release App Store. Bảng này cho phép
-- bật/tắt bằng UPDATE một dòng; app đọc lúc khởi động. Ngưỡng rate-limit (0046) cũng
-- đặt ở đây để chỉnh không cần migration.
--
-- Hình dạng value = jsonb:
--   - flag boolean: value = 'true' / 'false' (jsonb bool thuần, KHÔNG bọc object)
--   - rate_limits:  value = {"messages":{"limit":30,"window":60}, ...} (seed ở 0046)
--
-- Quyền: authed đọc (flag/ngưỡng không nhạy cảm), chỉ admin ghi. Client KHÔNG có đường
-- ghi — đổi flag bằng psql hoặc tài khoản admin.

create table if not exists public.app_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

drop policy if exists app_config_authed_read on public.app_config;
create policy app_config_authed_read on public.app_config
  for select using (auth.uid() is not null);

drop policy if exists app_config_admin_insert on public.app_config;
create policy app_config_admin_insert on public.app_config
  for insert with check (public.is_admin());

drop policy if exists app_config_admin_update on public.app_config;
create policy app_config_admin_update on public.app_config
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists app_config_admin_delete on public.app_config;
create policy app_config_admin_delete on public.app_config
  for delete using (public.is_admin());

-- Flag đầu tiên: mở tab Hỏi đáp cho user thường. false = chỉ admin/mod thấy (như hiện tại).
insert into public.app_config(key, value)
values ('qa_public', 'false'::jsonb)
on conflict (key) do nothing;

insert into public._applied_migrations(filename, note)
values ('0045_nodie_app_config.sql', 'app_config: feature flags + chỗ chứa ngưỡng rate-limit')
on conflict (filename) do nothing;
