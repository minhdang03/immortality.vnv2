-- 0037_app_events.sql — bảng sự kiện: MetricKit crash/diagnostic + funnel events từ client.
--
-- Client ghi bằng JWT của chính mình (insert-only, đúng uid); chỉ admin đọc.
-- KHÔNG chứa nội dung tin nhắn/PII — payload là metric/call stack; ai ghi gì thêm
-- vào đây phải soi một payload thật trước khi ship (xem phase 04 plan 2015).

create table if not exists public.app_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid(),
  kind       text not null,
  -- Trần 64KB: một crash payload khổng lồ không được phép thổi phình bảng trên free tier.
  payload    jsonb not null default '{}'::jsonb
             constraint app_events_payload_size check (pg_column_size(payload) < 64000),
  created_at timestamptz not null default now()
);

create index if not exists app_events_kind_created_idx
  on public.app_events (kind, created_at desc);

alter table public.app_events enable row level security;

drop policy if exists app_events_insert_own on public.app_events;
create policy app_events_insert_own on public.app_events
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists app_events_admin_read on public.app_events;
create policy app_events_admin_read on public.app_events
  for select using (public.is_admin());

insert into public._applied_migrations(filename)
values ('0037_app_events.sql')
on conflict (filename) do nothing;
