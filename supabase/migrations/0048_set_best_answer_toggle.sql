-- 0048_set_best_answer_toggle.sql — cho phép BỎ đánh dấu "Hay nhất", không chỉ đặt.
--
-- Bản cũ (0018) chỉ SET: update is_best = (id = p_answer_id) cho mọi answer của câu hỏi ⇒
-- luôn có đúng một "Hay nhất", KHÔNG có đường về không-cái-nào. Tác giả chọn nhầm thì kẹt.
-- iOS gọi đúng RPC nhưng UI không thể toggle vì server không có ngữ nghĩa unset.
--
-- Toggle: gọi lại trên chính answer đang là "Hay nhất" ⇒ gỡ hết (không cái nào). Gọi trên
-- answer khác ⇒ chuyển sang nó. Giữ nguyên bất biến "nhiều nhất một is_best mỗi câu hỏi"
-- và guard tác giả. SECURITY DEFINER + owner postgres như cũ (vượt tg_answers_guard 0047,
-- current_user='postgres' nên guard bỏ qua — đúng đường hợp lệ được đổi is_best).

create or replace function public.set_best_answer(p_answer_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  q_id      uuid;
  q_author  uuid;
  already   boolean;
begin
  select a.question_id, q.author_id, a.is_best
    into q_id, q_author, already
    from public.answers a join public.questions q on q.id = a.question_id
    where a.id = p_answer_id;
  if q_id is null then raise exception 'answer not found'; end if;
  if q_author is null or q_author <> auth.uid() then
    raise exception 'chỉ tác giả câu hỏi được chọn Hay nhất' using errcode = 'insufficient_privilege';
  end if;

  if already then
    -- Đang là "Hay nhất" → bấm lại = gỡ. Không cái nào is_best nữa.
    update public.answers set is_best = false where question_id = q_id and is_best;
  else
    -- Chuyển "Hay nhất" sang answer này; các answer khác về false.
    update public.answers set is_best = (id = p_answer_id) where question_id = q_id;
  end if;
end;
$function$;

insert into public._applied_migrations (filename)
values ('0048_set_best_answer_toggle.sql')
on conflict (filename) do nothing;
