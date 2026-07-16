-- 0017_nodie_community.sql — NODIE community app: chat + Q&A + moderation.
-- Cùng Supabase project với web (auth.users + profiles + content dùng chung).
-- KHÔNG đụng bảng cũ. Chỉ thêm bảng NODIE. Agents/web dùng service_role → bypass RLS.
--
-- Quy mô (chốt ở schema, rẻ giờ đắt sau):
--   - Đếm denormalized: answer_count / last_message_at là CỘT, cập nhật bằng trigger.
--   - Keyset pagination: index composite (channel_id, created_at desc) — KHÔNG offset.
--   - Unread = COUNT WHERE created_at > last_read_at (bounded), không read-state per-message.

-- ─────────────────────────────────────────────────────────────────────────────
-- CHAT: channels / channel_members / messages
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.channels (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique,                          -- null cho DM
  title             text,
  kind              text not null check (kind in ('public','group','dm','feed')),
  is_broadcast      boolean not null default false,       -- kênh phát một chiều: chỉ admin/mod post
  linked_content_id text references public.content(id) on delete set null,
  created_by        uuid references auth.users(id) on delete set null,
  last_message_at   timestamptz,                          -- denormalized: sort list không cần join messages
  created_at        timestamptz not null default now()
);

create table if not exists public.channel_members (
  channel_id  uuid not null references public.channels(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'member' check (role in ('member','mod')),
  joined_at   timestamptz not null default now(),
  last_read_at timestamptz not null default now(),        -- unread = messages created_at > last_read_at
  muted_until timestamptz,
  primary key (channel_id, user_id)
);
create index if not exists idx_channel_members_user on public.channel_members(user_id);

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete set null,
  parent_id  uuid references public.messages(id) on delete set null,  -- thread reply
  body       text,
  lang       text,
  metadata   jsonb not null default '{}',                 -- media url, dung lượng… (media ở Storage/R2, DB giữ URL)
  created_at timestamptz not null default now(),
  edited_at  timestamptz,
  deleted_at timestamptz                                  -- SOFT delete (giữ cho AI corpus/audit)
);
-- Index quyết định cho list view + keyset pagination.
create index if not exists idx_messages_channel_created on public.messages(channel_id, created_at desc);
create index if not exists idx_messages_parent on public.messages(parent_id) where parent_id is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- HỎI ĐÁP: questions / answers  (answer_count denormalized)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.questions (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid references auth.users(id) on delete set null,
  title        text not null,
  body         text,
  lang         text,
  topic        text,                                      -- tag đơn giản; taxonomy đầy đủ để sau
  answer_count int not null default 0,                    -- denormalized (trigger giữ)
  created_at   timestamptz not null default now(),
  edited_at    timestamptz,
  deleted_at   timestamptz
);
create index if not exists idx_questions_created on public.questions(created_at desc) where deleted_at is null;

create table if not exists public.answers (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  author_id   uuid references auth.users(id) on delete set null,
  body        text not null,
  created_at  timestamptz not null default now(),
  edited_at   timestamptz,
  deleted_at  timestamptz
);
create index if not exists idx_answers_question_created on public.answers(question_id, created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- KIỂM DUYỆT UGC (App Store guideline 1.2) + block (bắt buộc khi có DM)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid not null references auth.users(id) on delete cascade,
  target_type   text not null check (target_type in ('message','question','answer','user')),
  target_id     uuid not null,                            -- id của message/question/answer/user bị báo
  reason        text,
  status        text not null default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at    timestamptz not null default now()
);
create index if not exists idx_reports_open on public.reports(created_at desc) where status = 'open';

create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PUSH: device_tokens (APNs / FCM)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.device_tokens (
  user_id    uuid not null references auth.users(id) on delete cascade,
  token      text not null,
  platform   text not null check (platform in ('ios','android')),
  updated_at timestamptz not null default now(),
  primary key (token)
);
create index if not exists idx_device_tokens_user on public.device_tokens(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPERS (SECURITY DEFINER — tránh đệ quy RLS khi policy tham chiếu chéo bảng)
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.is_channel_member(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.channel_members m
    where m.channel_id = cid and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_channel_mod(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.channel_members m
    where m.channel_id = cid and m.user_id = auth.uid() and m.role = 'mod'
  ) or public.is_admin();
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGERS: denormalized counts + last_message_at + slow-mode
-- ─────────────────────────────────────────────────────────────────────────────

-- answer_count trên questions.
create or replace function public.tg_answers_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.questions set answer_count = answer_count + 1 where id = new.question_id;
  elsif tg_op = 'DELETE' then
    update public.questions set answer_count = greatest(answer_count - 1, 0) where id = old.question_id;
  end if;
  return null;
end; $$;
drop trigger if exists trg_answers_count on public.answers;
create trigger trg_answers_count after insert or delete on public.answers
  for each row execute function public.tg_answers_count();

-- last_message_at trên channels + slow-mode 2s/tin (chống spam).
create or replace function public.tg_message_inserted() returns trigger
language plpgsql security definer set search_path = public as $$
declare last_ts timestamptz;
begin
  select max(created_at) into last_ts from public.messages
    where channel_id = new.channel_id and user_id = new.user_id and id <> new.id;
  if last_ts is not null and (now() - last_ts) < interval '2 seconds' then
    raise exception 'slow_mode: chờ 2 giây giữa các tin' using errcode = 'check_violation';
  end if;
  update public.channels set last_message_at = new.created_at where id = new.channel_id;
  return null;
end; $$;
drop trigger if exists trg_message_inserted on public.messages;
create trigger trg_message_inserted after insert on public.messages
  for each row execute function public.tg_message_inserted();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: default-deny, allow tường minh từng bảng.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.channels        enable row level security;
alter table public.channel_members enable row level security;
alter table public.messages        enable row level security;
alter table public.questions       enable row level security;
alter table public.answers         enable row level security;
alter table public.reports         enable row level security;
alter table public.blocks          enable row level security;
alter table public.device_tokens   enable row level security;

-- channels: public/feed đọc thoải mái; group/dm chỉ thành viên. Tạo nhóm/kênh: chỉ admin.
-- DM (kind='dm') thì user nào cũng mở được.
create policy channels_read on public.channels
  for select using (kind in ('public','feed') or public.is_channel_member(id));
create policy channels_insert_dm on public.channels
  for insert with check (kind = 'dm' or public.is_admin());
create policy channels_admin_write on public.channels
  for update using (public.is_admin()) with check (public.is_admin());
create policy channels_admin_delete on public.channels
  for delete using (public.is_admin());

-- channel_members: thấy thành viên kênh mình ở; tự join public; tự rời; admin toàn quyền.
create policy members_read on public.channel_members
  for select using (public.is_channel_member(channel_id) or public.is_admin());
create policy members_self_join on public.channel_members
  for insert with check (
    user_id = auth.uid()
    and (exists (select 1 from public.channels c where c.id = channel_id and c.kind in ('public','dm'))
         or public.is_admin())
  );
create policy members_self_update on public.channel_members       -- last_read_at, mute
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy members_self_leave on public.channel_members
  for delete using (user_id = auth.uid() or public.is_admin());

-- messages: đọc nếu là thành viên (hoặc kênh public/feed); gửi nếu là thành viên và
-- (kênh KHÔNG broadcast, hoặc là mod/admin). Sửa/xoá tin của mình; mod xoá trong kênh.
create policy messages_read on public.messages
  for select using (
    deleted_at is null and exists (
      select 1 from public.channels c where c.id = channel_id
        and (c.kind in ('public','feed') or public.is_channel_member(c.id))
    )
  );
create policy messages_insert on public.messages
  for insert with check (
    user_id = auth.uid()
    and public.is_channel_member(channel_id)
    and (
      not exists (select 1 from public.channels c where c.id = channel_id and c.is_broadcast)
      or public.is_channel_mod(channel_id)
    )
  );
create policy messages_update_own on public.messages
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy messages_delete_own_or_mod on public.messages
  for delete using (user_id = auth.uid() or public.is_channel_mod(channel_id) or public.is_admin());

-- questions / answers: authed đọc tất cả (chưa xoá); tạo dưới tên mình; sửa/xoá của mình; admin all.
create policy questions_read on public.questions
  for select using (deleted_at is null or public.is_admin());
create policy questions_insert on public.questions
  for insert with check (author_id = auth.uid());
create policy questions_update_own on public.questions
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy questions_delete_own on public.questions
  for delete using (author_id = auth.uid() or public.is_admin());

create policy answers_read on public.answers
  for select using (deleted_at is null or public.is_admin());
create policy answers_insert on public.answers
  for insert with check (author_id = auth.uid());
create policy answers_update_own on public.answers
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy answers_delete_own on public.answers
  for delete using (author_id = auth.uid() or public.is_admin());

-- reports: user tự gửi báo cáo của mình; chỉ admin đọc/xử lý.
create policy reports_insert on public.reports
  for insert with check (reporter_id = auth.uid());
create policy reports_admin_read on public.reports
  for select using (public.is_admin());
create policy reports_admin_write on public.reports
  for all using (public.is_admin()) with check (public.is_admin());

-- blocks: user tự quản danh sách chặn của mình.
create policy blocks_self on public.blocks
  for all using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

-- device_tokens: user tự quản token của mình.
create policy device_tokens_self on public.device_tokens
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
