-- 0033_nodie_answer_count_soft_delete.sql — `answer_count` phải đếm cả lúc xoá MỀM.
--
-- TRIỆU CHỨNG: xoá câu trả lời xong, câu hỏi vẫn ghi "1 câu trả lời" nhưng mở ra trống trơn.
-- Đo trên prod: soft-delete 1 answer → answer_count=1, số answer đọc được=0.
--
-- NGUYÊN NHÂN: `trg_answers_count` khai `AFTER INSERT OR DELETE`. Xoá mềm là **UPDATE**
-- (`deleted_at = now()`), không phải DELETE ⇒ trigger không bao giờ chạy ⇒ số đếm đứng im.
--
-- Vì sao tới giờ mới lộ: cột `deleted_at` có từ 0017 nhưng **chưa có đường nào trong app chạm
-- tới nó** — #15 (sửa/xoá nội dung của mình) vừa mở đúng đường đó. Số đếm sai là hệ quả trực
-- tiếp của việc tính năng mới bắt đầu được dùng.
--
-- Đếm LẠI bằng câu SELECT thay vì cộng/trừ dồn: `+1/-1` chỉ đúng khi mọi lối vào đều đi qua
-- trigger và không lối nào chạy hai lần. Giờ có tới bốn lối (insert · delete cứng · xoá mềm ·
-- khôi phục) thì cộng dồn sẽ trôi, và đã trôi thì không tự sửa được — nó nhớ sai vĩnh viễn.
-- Đếm lại thì sai bao nhiêu lần vẫn tự về đúng ở lần ghi kế tiếp. Bảng nhỏ, một câu đếm có
-- index trên `question_id` là đủ rẻ.

create or replace function public.tg_answers_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  qid uuid;
begin
  -- DELETE chỉ có OLD; INSERT chỉ có NEW; UPDATE có cả hai.
  qid := coalesce(new.question_id, old.question_id);

  update public.questions q
     set answer_count = (
           select count(*) from public.answers a
            where a.question_id = qid and a.deleted_at is null
         )
   where q.id = qid;

  -- Đổi câu trả lời sang câu hỏi KHÁC (hiếm, nhưng UPDATE cho phép): câu cũ cũng phải đếm lại,
  -- không thì nó giữ mãi số của thời còn câu trả lời đó.
  if tg_op = 'UPDATE' and old.question_id is distinct from new.question_id then
    update public.questions q
       set answer_count = (
             select count(*) from public.answers a
              where a.question_id = old.question_id and a.deleted_at is null
           )
     where q.id = old.question_id;
  end if;

  return null;
end $$;

-- Thêm UPDATE vào danh sách sự kiện — đây là thứ 0017 thiếu.
drop trigger if exists trg_answers_count on public.answers;
create trigger trg_answers_count
  after insert or update or delete on public.answers
  for each row execute function public.tg_answers_count();

-- Chữa số đã trôi từ trước (nếu có). Idempotent: chạy lại bao nhiêu lần cũng ra cùng kết quả.
update public.questions q
   set answer_count = (
         select count(*) from public.answers a
          where a.question_id = q.id and a.deleted_at is null
       )
 where q.answer_count is distinct from (
         select count(*) from public.answers a
          where a.question_id = q.id and a.deleted_at is null
       );
