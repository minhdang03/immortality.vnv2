-- seed_nodie_launch_questions.sql — 12 câu hỏi mồi cho NODIE.
--
-- Nguồn: public.content type='khaitri' (vi_question là câu hỏi THẬT người ta từng gửi,
-- không bịa). Đăng duyệt 18/07: lấy cả 12, tác giả = 4 persona (scripts/seed-launch-questions.sh
-- tạo trước qua Admin API), chia vòng tròn.
--
-- Idempotent theo questions.title. KHÔNG ghi _applied_migrations: seed là dữ liệu.
-- body để trống — vi_question tự đủ; vi_summary là tóm tắt CÂU TRẢ LỜI (giọng đáp),
-- nhét vào thân câu hỏi là sai vai.

do $$
declare
  persona_count int;
begin
  select count(*) into persona_count
  from auth.users where email like 'seed-thanh-vien-%@battudao.com';
  if persona_count = 0 then
    raise exception 'Chưa có persona nào — chạy scripts/seed-launch-questions.sh chứ đừng psql file này trực tiếp.';
  end if;

  insert into public.questions (author_id, title, body, lang, topic, created_at)
  select p.id, c.vi_question, '', 'vi', 'khai trí',
         -- Mốc CỐ ĐỊNH giãn 5 tiếng/câu, KHÔNG dùng now():
         --   · 12 câu cùng đóng dấu "vừa xong" trông giả — giãn ra mới giống cộng đồng thật;
         --   · nằm TRƯỚC nội dung thật (câu mới của người thật luôn nổi lên trên seed);
         --   · deterministic — chạy seed lại không xê dịch thời gian;
         --   · UITest assert các câu hỏi cũ ở ĐẦU danh sách — seed chen lên trên là suite đỏ.
         timestamptz '2026-07-14 09:00+07' - (c.rn * interval '5 hours')
  from (
    select vi_question,
           row_number() over (order by order_index nulls last, content_date desc) as rn
    from public.content
    where type = 'khaitri' and status = 'published'
      and vi_question is not null and vi_question <> ''
    order by order_index nulls last, content_date desc
    limit 12
  ) c
  join (
    select id, row_number() over (order by email) as rn, count(*) over () as total
    from auth.users where email like 'seed-thanh-vien-%@battudao.com'
  ) p on p.rn = ((c.rn - 1) % p.total) + 1
  where not exists (
    select 1 from public.questions q where q.title = c.vi_question
  );

  -- Dòng đã seed từ bản trước (created_at = lúc chạy) → kéo về đúng mốc cố định.
  update public.questions q
  set created_at = timestamptz '2026-07-14 09:00+07' - (c.rn * interval '5 hours')
  from (
    select vi_question,
           row_number() over (order by order_index nulls last, content_date desc) as rn
    from public.content
    where type = 'khaitri' and status = 'published'
      and vi_question is not null and vi_question <> ''
    order by order_index nulls last, content_date desc
    limit 12
  ) c
  where q.title = c.vi_question
    and q.author_id in (select id from auth.users where email like 'seed-thanh-vien-%@battudao.com')
    and q.created_at <> timestamptz '2026-07-14 09:00+07' - (c.rn * interval '5 hours');
end $$;
