-- 0019_nodie_rls_authed_only.sql — NODIE là cộng đồng ĐÓNG: phải đăng nhập mới đọc.
-- Quyết định Đăng 2026-07-16. Đảo lại ý định của 0017/0018: comment ở đó ghi "authed đọc
-- tất cả" nhưng policy lại không kiểm tra đăng nhập, nên `anon` đọc được toàn bộ Q&A +
-- kênh public. Anon key nằm public trong bundle app iOS ⇒ ai cũng scrape được.
--
-- Không sửa 0017/0018 — hai file đó đã áp lên prod; sửa file đã áp là để file lệch DB.
--
-- Vì sao `(select auth.uid())` chứ không `auth.uid()` trần: bọc trong subquery thì Postgres
-- coi là initPlan, chạy MỘT lần cho cả câu truy vấn thay vì gọi lại trên từng dòng
-- (khuyến nghị hiệu năng RLS của Supabase). Khác biệt lớn ở list view vài nghìn dòng.
--
-- `answer_reactions_self` không cần vá: `user_id = auth.uid()` với anon là `user_id = null`
-- → không bao giờ đúng → anon đã bị chặn sẵn.

-- channels: bỏ đường vào của anon; public/feed vẫn mở cho MỌI user đã đăng nhập.
drop policy if exists channels_read on public.channels;
create policy channels_read on public.channels
  for select using (
    (select auth.uid()) is not null
    and (kind in ('public','feed') or public.is_channel_member(id))
  );

-- messages: giữ nguyên logic thành viên, chỉ thêm chốt đăng nhập.
drop policy if exists messages_read on public.messages;
create policy messages_read on public.messages
  for select using (
    (select auth.uid()) is not null
    and deleted_at is null
    and exists (
      select 1 from public.channels c
      where c.id = channel_id
        and (c.kind in ('public','feed') or public.is_channel_member(c.id))
    )
  );

-- questions / answers / answer_replies: cùng một khuôn.
drop policy if exists questions_read on public.questions;
create policy questions_read on public.questions
  for select using (
    (select auth.uid()) is not null
    and (deleted_at is null or public.is_admin())
  );

drop policy if exists answers_read on public.answers;
create policy answers_read on public.answers
  for select using (
    (select auth.uid()) is not null
    and (deleted_at is null or public.is_admin())
  );

drop policy if exists answer_replies_read on public.answer_replies;
create policy answer_replies_read on public.answer_replies
  for select using (
    (select auth.uid()) is not null
    and (deleted_at is null or public.is_admin())
  );
