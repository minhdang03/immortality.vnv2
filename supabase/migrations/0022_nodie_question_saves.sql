-- 0022_nodie_question_saves.sql — "Đã lưu" ở màn Cá nhân: mỗi người tự đánh dấu câu hỏi
-- muốn quay lại đọc.
--
-- Đánh dấu này RIÊNG TƯ: không đếm, không lộ cho ai khác. Khác hẳn ▲ vote / ☀ lit (0018)
-- vốn là tín hiệu CÔNG KHAI trên nội dung. Vì vậy cố tình KHÔNG có cột đếm denormalized
-- trên questions — thêm `save_count` là biến thứ riêng tư thành thứ công khai.
--
-- `(select auth.uid())` chứ không `auth.uid()` trần: bọc subquery thì Postgres coi là
-- initPlan, chạy MỘT lần cho cả câu truy vấn thay vì gọi lại trên từng dòng (khuyến nghị
-- hiệu năng RLS của Supabase) — cùng lý do đã ghi ở 0019.

create table if not exists public.question_saves (
  user_id     uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- Màn "Đã lưu" đọc theo user, mới lưu nhất lên đầu.
create index if not exists idx_question_saves_user
  on public.question_saves(user_id, created_at desc);

alter table public.question_saves enable row level security;

-- Một policy cho cả select/insert/delete: mọi thao tác đều chỉ chạm hàng của chính mình.
-- Không có update — đã lưu là có hoặc không, không có gì để sửa.
-- Cộng đồng đóng (0019) đã ràng: anon có auth.uid() = null → không khớp hàng nào.
drop policy if exists question_saves_self on public.question_saves;
create policy question_saves_self on public.question_saves
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
