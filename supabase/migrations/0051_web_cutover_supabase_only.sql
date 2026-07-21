-- 0051_web_cutover_supabase_only.sql — hạ tầng cho web bỏ hẳn Firestore (quyết định 21/07).
-- Idempotent; chạy lại được. Áp prod bằng psql tay như mọi migration khác.
--
-- Gồm 5 việc:
--   (1) newsletter_signups — bảng mới (trước nằm Firestore), dedupe bằng unique index
--       thay vì cho client ĐỌC bảng để tự dedupe (lỗi cũ: NewsletterBand đọc → lộ email).
--   (2) comments — ép mọi insert công khai thành status='pending' (trước cho phép
--       'visible' → comment lên thẳng site không qua duyệt).
--   (3) agent_audit_log — admin được ĐỌC (tab Agent log của admin panel chuyển từ
--       Firestore `agent_log` sang bảng này; ghi vẫn chỉ service_role).
--   (4) set_user_role(target, role) — đường đổi vai trò duy nhất cho admin panel;
--       kèm sửa tg_profiles_guard_role: bỏ SECURITY DEFINER + chỉ áp cho client
--       'authenticated'. Bản 0032 là SECDEF không phân biệt current_user, nên
--       UPDATE role qua psql/service_role bị clamp IM LẶNG — đường bootstrap admin
--       trong 0009 chết mà không ai hay (phát hiện audit 21/07). Cùng bài học 0047.
--   (5) tg_web_flood_guard — chặn flood thô cho các bảng anon-insert của web
--       (comments/contacts/donations/donation_contacts/newsletter_signups nằm ngoài
--       tg_rate_limit của 0046 vì 0046 tính theo auth.uid, anon không có).

-- ── (1) newsletter_signups ────────────────────────────────────────────────────
create table if not exists public.newsletter_signups (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  lang       text,
  source     text,
  created_at timestamptz not null default now()
);

-- Dedupe server-side: trùng email → 23505, client coi như đã đăng ký thành công.
create unique index if not exists uq_newsletter_signups_email
  on public.newsletter_signups (lower(email));

alter table public.newsletter_signups enable row level security;

drop policy if exists newsletter_public_insert on public.newsletter_signups;
create policy newsletter_public_insert on public.newsletter_signups
  for insert with check (true);

drop policy if exists newsletter_admin_read on public.newsletter_signups;
create policy newsletter_admin_read on public.newsletter_signups
  for select using (public.is_admin());
-- Không có policy đọc cho anon/authenticated thường → default deny.

-- ── (2) comments: công khai chỉ được tạo 'pending' ───────────────────────────
alter table public.comments alter column status set default 'pending';

drop policy if exists comments_public_insert on public.comments;
create policy comments_public_insert on public.comments
  for insert with check (status = 'pending');
-- comments_admin_all (0007) vẫn cho admin tạo/sửa 'visible' trực tiếp.

-- ── (3) agent_audit_log: admin đọc được ──────────────────────────────────────
drop policy if exists agent_audit_log_admin_read on public.agent_audit_log;
create policy agent_audit_log_admin_read on public.agent_audit_log
  for select using (public.is_admin());

-- ── (4) đổi vai trò ──────────────────────────────────────────────────────────
-- 4a. Guard role: NON-secdef + chỉ áp cho client 'authenticated' (mẫu 0047).
--     psql/service_role (current_user = postgres/service_role) đi thẳng — khôi phục
--     đường bootstrap admin. IF lồng nhau thay vì AND: Postgres không cam kết
--     short-circuit, tránh gọi is_admin() trong phiên không có JWT.
create or replace function public.tg_profiles_guard_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
    if new.role is distinct from old.role and not public.is_admin() then
      new.role := old.role;
    end if;
  end if;
  return new;
end $$;
-- Trigger trg_profiles_guard_role (0032) giữ nguyên, chỉ thay ruột function.

-- 4b. RPC cho admin panel. SECURITY DEFINER: chạy như owner nên qua guard (4a),
--     nhưng tự kiểm is_admin() từ JWT của người gọi. Không cho tự đổi vai trò
--     của chính mình (chặn tự khoá admin cuối cùng).
create or replace function public.set_user_role(target_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if target_id = auth.uid() then
    raise exception 'cannot_change_own_role' using errcode = '22023';
  end if;
  if new_role not in ('user', 'mod', 'admin') then
    raise exception 'invalid_role' using errcode = '22023';
  end if;
  update public.profiles set role = new_role where id = target_id;
  if not found then
    raise exception 'profile_not_found' using errcode = '22023';
  end if;
end $$;

revoke all on function public.set_user_role(uuid, text) from public, anon;
grant execute on function public.set_user_role(uuid, text) to authenticated;

-- ── (5) chặn flood thô cho bảng anon-insert của web ──────────────────────────
-- Đếm số dòng toàn bảng trong 60s gần nhất; vượt trần → chặn. Thô nhưng đủ chặn
-- script flood; per-IP không làm được trong Postgres (không thấy IP qua PostgREST).
-- Trần cố ý rộng so với lưu lượng thật (~chục user); chỉnh bằng cách sửa function.
-- Đếm phải chạy SECDEF: các bảng này anon KHÔNG có policy đọc, nếu đếm dưới RLS
-- của anon thì count luôn 0 và guard thành vô dụng. Nhưng check current_user phải
-- nằm NGOÀI hàm SECDEF (trong SECDEF, current_user = owner — bài học 0047).
-- Tách đôi: trigger non-SECDEF check role → gọi hàm đếm SECDEF, allowlist bảng cứng.
create or replace function public.web_flood_recent_count(tbl text)
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $$
declare recent integer;
begin
  if tbl not in ('comments','contacts','donations','donation_contacts','newsletter_signups') then
    raise exception 'invalid_table' using errcode = '22023';
  end if;
  execute format(
    'select count(*) from public.%I where created_at > now() - interval ''60 seconds''',
    tbl
  ) into recent;
  return recent;
end $$;

grant execute on function public.web_flood_recent_count(text) to anon, authenticated;

create or replace function public.tg_web_flood_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  cap integer;
begin
  -- service_role/psql (seed, migrate, moderate) đi thẳng.
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  cap := case tg_table_name
    when 'comments'           then 30
    when 'newsletter_signups' then 30
    else 10  -- contacts, donations, donation_contacts
  end;

  if public.web_flood_recent_count(tg_table_name) >= cap then
    raise exception 'rate_limit' using errcode = 'P0001';
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['comments','contacts','donations','donation_contacts','newsletter_signups'] loop
    execute format('drop trigger if exists trg_web_flood_guard on public.%I', t);
    execute format(
      'create trigger trg_web_flood_guard before insert on public.%I
         for each row execute function public.tg_web_flood_guard()', t);
  end loop;
end $$;
