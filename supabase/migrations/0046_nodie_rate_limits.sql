-- 0046_nodie_rate_limits.sql — chống flood ở tầng DB: BEFORE INSERT trigger đếm theo cửa sổ.
--
-- Vì sao ở Postgres: iOS gọi THẲNG PostgREST, không có API trung gian — client-side
-- throttle chặn được người ngay tình, không chặn được script cầm JWT. Đây là chốt duy
-- nhất mọi đường ghi phải đi qua.
--
-- Quan hệ với slow-mode (0017): slow-mode = khoảng cách 2s giữa 2 tin LIỀN KỀ trong kênh;
-- rate-limit = tổng số bản ghi trong cửa sổ (vd 30 tin/60s). Hai lớp sống song song,
-- chuỗi lỗi khác nhau ('slow_mode' vs 'rate_limit') để iOS phân loại đúng.
--
-- Miễn trừ: is_admin() (role='admin' toàn cục). Mod nhóm KHÔNG miễn — quyết định 20/07.
-- auth.uid() null (psql owner, service_role, trigger hệ thống) không đếm.
--
-- Ngưỡng đọc từ app_config['rate_limits'][action] (0045) — chỉnh bằng UPDATE, không cần
-- migration. Thiếu row/thiếu key → default nướng cứng 30/60s: fail-safe, không fail-open.

-- Ngưỡng khởi điểm (generous — tinh chỉnh sau khi đo hành vi thật):
insert into public.app_config(key, value) values ('rate_limits', '{
  "messages":          {"limit": 30, "window": 60},
  "questions":         {"limit": 5,  "window": 300},
  "answers":           {"limit": 10, "window": 300},
  "answer_replies":    {"limit": 15, "window": 300},
  "message_reactions": {"limit": 60, "window": 60},
  "answer_reactions":  {"limit": 60, "window": 60},
  "reports":           {"limit": 5,  "window": 600},
  "follows":           {"limit": 30, "window": 60},
  "channels":          {"limit": 3,  "window": 3600}
}'::jsonb)
on conflict (key) do nothing;

-- Một hàm generic cho mọi bảng: TG_ARGV[0] = action key trong rate_limits,
-- TG_ARGV[1] = tên cột chủ sở hữu (user_id / author_id / reporter_id / ...).
create or replace function public.tg_rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_action text := tg_argv[0];
  v_col    text := tg_argv[1];
  v_uid    uuid := auth.uid();
  v_owner  uuid;
  v_limit  int;
  v_window int;
  v_count  bigint;
begin
  -- psql owner / service_role / hệ thống: không giới hạn.
  if v_uid is null or public.is_admin() then
    return new;
  end if;

  v_owner := (to_jsonb(new) ->> v_col)::uuid;
  if v_owner is distinct from v_uid then
    -- Bản ghi không đứng tên user hiện tại (RLS nơi khác sẽ xử) — không phải việc của limiter.
    return new;
  end if;

  -- Chốt lách cửa sổ: đếm dựa trên created_at, mà PostgREST cho client gửi created_at
  -- tuỳ ý → backdate là thoát đếm. Ép server clock cho user thường (đúng kỷ luật 0042).
  new.created_at := now();

  select coalesce((value -> v_action ->> 'limit')::int,  30),
         coalesce((value -> v_action ->> 'window')::int, 60)
    into v_limit, v_window
    from public.app_config where key = 'rate_limits';
  -- Thiếu cả row (select không trả dòng nào) → biến vẫn null → default cứng.
  v_limit  := coalesce(v_limit, 30);
  v_window := coalesce(v_window, 60);

  execute format(
    'select count(*) from public.%I where %I = $1 and created_at > now() - make_interval(secs => $2)',
    tg_table_name, v_col)
    into v_count using v_uid, v_window;

  if v_count >= v_limit then
    -- KHÔNG nhúng nội dung bản ghi vào message (tránh lộ text tin nhắn qua log).
    raise exception 'rate_limit: thao tác quá nhanh, thử lại sau ít phút'
      using errcode = 'check_violation', hint = 'rate_limit';
  end if;

  return new;
end; $$;

-- Index phục vụ đếm (owner, created_at) — mỗi bảng một cái nếu chưa có.
create index if not exists idx_messages_user_created          on public.messages(user_id, created_at);
create index if not exists idx_questions_author_created       on public.questions(author_id, created_at);
create index if not exists idx_answers_author_created         on public.answers(author_id, created_at);
create index if not exists idx_answer_replies_author_created  on public.answer_replies(author_id, created_at);
create index if not exists idx_message_reactions_user_created on public.message_reactions(user_id, created_at);
create index if not exists idx_answer_reactions_user_created  on public.answer_reactions(user_id, created_at);
create index if not exists idx_reports_reporter_created       on public.reports(reporter_id, created_at);
create index if not exists idx_follows_follower_created       on public.follows(follower_id, created_at);
create index if not exists idx_channels_creator_created       on public.channels(created_by, created_at);

-- Gắn trigger. BEFORE INSERT để chặn TRƯỚC khi ghi (slow-mode 0017 là AFTER — giữ nguyên).
drop trigger if exists trg_rate_limit on public.messages;
create trigger trg_rate_limit before insert on public.messages
  for each row execute function public.tg_rate_limit('messages', 'user_id');

drop trigger if exists trg_rate_limit on public.questions;
create trigger trg_rate_limit before insert on public.questions
  for each row execute function public.tg_rate_limit('questions', 'author_id');

drop trigger if exists trg_rate_limit on public.answers;
create trigger trg_rate_limit before insert on public.answers
  for each row execute function public.tg_rate_limit('answers', 'author_id');

drop trigger if exists trg_rate_limit on public.answer_replies;
create trigger trg_rate_limit before insert on public.answer_replies
  for each row execute function public.tg_rate_limit('answer_replies', 'author_id');

drop trigger if exists trg_rate_limit on public.message_reactions;
create trigger trg_rate_limit before insert on public.message_reactions
  for each row execute function public.tg_rate_limit('message_reactions', 'user_id');

drop trigger if exists trg_rate_limit on public.answer_reactions;
create trigger trg_rate_limit before insert on public.answer_reactions
  for each row execute function public.tg_rate_limit('answer_reactions', 'user_id');

drop trigger if exists trg_rate_limit on public.reports;
create trigger trg_rate_limit before insert on public.reports
  for each row execute function public.tg_rate_limit('reports', 'reporter_id');

drop trigger if exists trg_rate_limit on public.follows;
create trigger trg_rate_limit before insert on public.follows
  for each row execute function public.tg_rate_limit('follows', 'follower_id');

-- Channels: chỉ đếm nhóm user tự tạo (0043). DM đi qua create_dm RPC (0030), public/feed
-- chỉ admin tạo — không đụng.
drop trigger if exists trg_rate_limit on public.channels;
create trigger trg_rate_limit before insert on public.channels
  for each row when (new.kind = 'group') execute function public.tg_rate_limit('channels', 'created_by');

insert into public._applied_migrations(filename, note)
values ('0046_nodie_rate_limits.sql', 'rate-limit BEFORE INSERT trigger 9 bảng + index đếm + ngưỡng trong app_config')
on conflict (filename) do nothing;
