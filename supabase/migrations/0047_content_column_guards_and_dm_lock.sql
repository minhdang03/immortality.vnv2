-- 0047_content_column_guards_and_dm_lock.sql — bịt leo thang qua UPDATE trực tiếp trên
-- messages/answers/questions + khoá đua tạo DM + siết insert kênh.
--
-- BỐI CẢNH: channel_members đã được 0044_guard_member_role bảo vệ (role/channel_id/user_id).
-- File này lo NỐT các bảng còn lại mà audit 20/07 chỉ ra, cùng một lớp lỗi:
--
-- một policy `for update` với using/with check chỉ kiểm ĐƯỢC-ĐỤNG-HÀNG-NÀO, KHÔNG kiểm
-- ĐƯỢC-ĐỔI-CỘT-NÀO. `messages_update_own`/`answers_update_own`/`questions_update_own`
-- (0017) đều `user_id/author_id = auth.uid()` — đủ chặn sửa bài NGƯỜI KHÁC, KHÔNG chặn
-- chính chủ tự sửa cột đáng ra bất biến:
--
--   messages.created_at  → future-date ⇒ badge unread kẹt vĩnh viễn toàn kênh.
--   messages.channel_id  → dời tin của mình sang kênh khác.
--   answers.vote_count/is_best/lit_count → PATCH vote=9999, tự phong "Hay nhất".
--   questions.answer_count → cùng lớp; số do trigger giữ mà client ghi đè được.
--
-- VÌ SAO TRIGGER: khoá cột trong chính policy cần subquery đọc lại bảng đang sửa → đệ quy.
-- BEFORE UPDATE trigger đứng ngoài RLS (0032/0044 đã chứng minh trên prod).
--
-- MỐC `current_user = 'authenticated'`: mọi trigger đếm-số + set_best_answer là SECURITY
-- DEFINER owner postgres (đo prod: tg_answers_count, tg_answer_reaction_count, set_best_answer,
-- tg_message_inserted) → current_user='postgres' ⇒ guard TỰ bỏ qua, không giết đường hợp lệ.
-- Client PostgREST chạy dưới 'authenticated' ⇒ đúng đối tượng. (Cùng thủ pháp 0043/0044.)
--
-- Giữ IM LẶNG (gán lại cột cũ) thay vì raise: client hợp lệ chỉ gửi body/edited_at (sửa) hoặc
-- deleted_at (xoá mềm). Client over-send cột khác → cho update thành công một cách vô hại,
-- không dựng đường lỗi. (0044_guard_member_role chọn raise cho role vì đó là leo thang QUYỀN;
-- ở đây là số liệu/thời gian, revert êm là đủ và không phá client hơi thừa tay.)
--
-- KHÔNG begin/commit trong file. Idempotent: create or replace + drop if exists.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. messages — chỉ body/edited_at/lang/metadata sửa được; danh tính + created_at đóng băng.
--    deleted_at KHÔNG khoá: soft-delete của chính chủ là update hợp lệ (RLS đã gác author).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.tg_messages_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' and not public.is_admin() then
    new.channel_id := old.channel_id;
    new.user_id    := old.user_id;
    new.parent_id  := old.parent_id;
    new.created_at := old.created_at;
  end if;
  return new;
end $$;

drop trigger if exists trg_messages_guard on public.messages;
create trigger trg_messages_guard
  before update on public.messages
  for each row execute function public.tg_messages_guard();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. answers — vote/lit/is_best do trigger + set_best_answer giữ; client chỉ body/edited/deleted.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.tg_answers_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' and not public.is_admin() then
    new.question_id := old.question_id;
    new.author_id   := old.author_id;
    new.created_at  := old.created_at;
    new.vote_count  := old.vote_count;
    new.lit_count   := old.lit_count;
    new.is_best     := old.is_best;
  end if;
  return new;
end $$;

drop trigger if exists trg_answers_guard on public.answers;
create trigger trg_answers_guard
  before update on public.answers
  for each row execute function public.tg_answers_guard();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. questions — answer_count do tg_answers_count giữ; đóng băng cùng danh tính + created_at.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.tg_questions_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' and not public.is_admin() then
    new.author_id    := old.author_id;
    new.created_at   := old.created_at;
    new.answer_count := old.answer_count;
  end if;
  return new;
end $$;

drop trigger if exists trg_questions_guard on public.questions;
create trigger trg_questions_guard
  before update on public.questions
  for each row execute function public.tg_questions_guard();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. channels_insert_dm — buộc created_by = chính mình. Bản 0043 để `kind='dm'` trần, không
--    kiểm created_by ⇒ client insert thẳng kênh dm giả created_by người khác + spam orphan.
--    Đường tạo THẬT (create_dm/create_group) là SECURITY DEFINER, vượt RLS, KHÔNG đi qua
--    policy này — siết ở đây không phá tính năng tạo nhóm của 0043.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists channels_insert_dm on public.channels;
create policy channels_insert_dm on public.channels
  for insert with check (
    (kind in ('dm','group') and created_by = (select auth.uid()))
    or public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. create_dm — advisory lock chống đua tạo hai kênh DM trùng cặp. Hai máy cùng bấm
--    "Nhắn tin" một lúc: cả hai select-không-thấy rồi cùng insert ⇒ hai kênh DM một cặp.
--    `on conflict` cũ chỉ chống trùng (channel_id,user_id), KHÔNG chống trùng KÊNH. Khoá
--    theo cặp (đối xứng least/greatest) serialize đúng cặp đó, không cản cặp khác.
--    Giữ nguyên phần còn lại của 0030.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.create_dm(other_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me  uuid := auth.uid();
  cid uuid;
begin
  if me is null then
    raise exception 'Cần đăng nhập.' using errcode = '42501';
  end if;

  if other_id is null or other_id = me then
    raise exception 'Không thể tự nhắn cho chính mình.' using errcode = '22023';
  end if;

  if not exists (select 1 from public.profiles p where p.id = other_id) then
    raise exception 'Không tìm thấy người này.' using errcode = 'P0002';
  end if;

  if public.is_blocked_pair(me, other_id) then
    raise exception 'Không thể nhắn tin với người này.' using errcode = '42501';
  end if;

  -- Khoá theo cặp trong phạm vi transaction: người thứ hai chờ ở đây tới khi người thứ nhất
  -- commit, rồi select thấy kênh vừa tạo và trả lại nó thay vì tạo trùng.
  perform pg_advisory_xact_lock(
    hashtextextended(least(me, other_id)::text || '|' || greatest(me, other_id)::text, 0));

  select c.id into cid
  from public.channels c
  where c.kind = 'dm'
    and (select count(*) from public.channel_members m where m.channel_id = c.id) = 2
    and exists (select 1 from public.channel_members m where m.channel_id = c.id and m.user_id = me)
    and exists (select 1 from public.channel_members m where m.channel_id = c.id and m.user_id = other_id)
  limit 1;

  if cid is not null then
    return cid;
  end if;

  insert into public.channels (kind, is_broadcast, created_by)
  values ('dm', false, me)
  returning id into cid;

  insert into public.channel_members (channel_id, user_id)
  values (cid, me), (cid, other_id)
  on conflict (channel_id, user_id) do nothing;

  return cid;
end;
$$;

revoke all on function public.create_dm(uuid) from public, anon;
grant execute on function public.create_dm(uuid) to authenticated;

-- Sổ cái migration (0035): ghi nhận đã áp — idempotent nhờ on conflict.
insert into public._applied_migrations (filename)
values ('0047_content_column_guards_and_dm_lock.sql')
on conflict (filename) do nothing;
