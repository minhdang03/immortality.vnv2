-- 0050_guard_reply_reaction_immutable_columns.sql — nốt hai bảng lọt lưới 0047:
-- answer_replies + answer_reactions.
--
-- VÌ SAO: rate-limit 0046 đếm theo `created_at` và ép now() lúc INSERT, nhưng
-- `answer_replies_update_own` (0018) là policy for-update không column guard —
-- script cầm JWT insert reply rồi PATCH created_at='2020-01-01' là hàng bay khỏi
-- cửa sổ đếm, spam lại từ đầu (phát hiện ở code review 21/07). `answer_reactions_self`
-- là for-all nên cùng lỗ. Cùng lớp lỗi 0047 đã bịt cho messages/answers/questions;
-- thủ pháp giữ nguyên: BEFORE UPDATE gán lại cột bất biến, im lặng, chỉ áp cho
-- current_user='authenticated' không-admin (trigger đếm SECURITY DEFINER chạy dưới
-- postgres nên tự thoát).

create or replace function public.tg_answer_replies_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' and not public.is_admin() then
    -- Client hợp lệ chỉ sửa body/edited_at/deleted_at (sửa + xoá mềm của chính chủ).
    new.answer_id  := old.answer_id;
    new.parent_id  := old.parent_id;
    new.author_id  := old.author_id;
    new.lit_count  := old.lit_count;   -- số do trigger đếm giữ
    new.created_at := old.created_at;
  end if;
  return new;
end $$;

drop trigger if exists trg_answer_replies_guard on public.answer_replies;
create trigger trg_answer_replies_guard
  before update on public.answer_replies
  for each row execute function public.tg_answer_replies_guard();

-- answer_reactions: mọi cột đều là danh tính (PK 4 cột) + created_at — không có
-- cột nào client được phép sửa. Toggle hợp lệ là INSERT/DELETE; UPDATE thành no-op.
create or replace function public.tg_answer_reactions_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' and not public.is_admin() then
    new.user_id     := old.user_id;
    new.target_type := old.target_type;
    new.target_id   := old.target_id;
    new.kind        := old.kind;
    new.created_at  := old.created_at;
  end if;
  return new;
end $$;

drop trigger if exists trg_answer_reactions_guard on public.answer_reactions;
create trigger trg_answer_reactions_guard
  before update on public.answer_reactions
  for each row execute function public.tg_answer_reactions_guard();

insert into public._applied_migrations(filename, note)
values ('0050_guard_reply_reaction_immutable_columns.sql', 'bịt backdate created_at qua PATCH trên answer_replies/answer_reactions — vá lỗ rate-limit 0046')
on conflict (filename) do nothing;
