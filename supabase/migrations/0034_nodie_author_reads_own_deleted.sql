-- 0034_nodie_author_reads_own_deleted.sql — người thường phải xoá được nội dung của CHÍNH MÌNH.
--
-- TRIỆU CHỨNG: bấm ⋯ → Xoá trên bài của mình → "Bạn không có quyền thực hiện thao tác này."
-- Không xoá được câu hỏi, câu trả lời, phản hồi, lẫn tin nhắn. Tính năng #15 hỏng với 100%
-- người dùng thật.
--
-- ĐO TRÊN PROD (không suy đoán), giả quyền user thường An:
--   auth.uid() = author_id                                   → khớp
--   update questions set title = title      where id=…       → UPDATE 1   ✓
--   update questions set edited_at = now()  where id=…       → UPDATE 1   ✓
--   update questions set deleted_at = now() where id=…       → ERROR 42501 ✗
--   alter policy questions_read using (true) rồi thử lại     → UPDATE 1   ✓  ← thủ phạm
--
-- NGUYÊN NHÂN: policy đọc là `deleted_at is null or is_admin()`. Xoá mềm sinh ra một hàng
-- mới có `deleted_at` — hàng đó KHÔNG còn lọt qua chính policy đọc của người vừa xoá, nên
-- Postgres bác cả lệnh update. Sửa `title`/`edited_at` không sao vì hàng vẫn đọc được sau đó.
-- Nói gọn: hiện tại luật đang là "chỉ được sửa bài theo cách khiến nó vẫn còn nhìn thấy" —
-- mà xoá thì theo định nghĩa là làm nó biến mất.
--
-- VÌ SAO GIỜ MỚI LỘ: prod chỉ có một tài khoản và nó là admin; nhánh `or is_admin()` giữ hàng
-- mới vẫn đọc được nên admin xoá ngon lành. Đây là lỗi thứ NĂM thuộc họ "chỉ tài khoản thường
-- mới thấy" (bốn lỗi trước: 0030, 0031, 0032 + push trigger). Cùng một cái bẫy mà `project.yml`
-- đã ghi: chạy test bằng admin là ngắn mạch toàn bộ phân quyền.
--
-- `messages` nặng hơn: policy đọc của nó KHÔNG có nhánh `is_admin()` ⇒ đến admin cũng không
-- xoá nổi tin nhắn của mình.
--
-- CÁCH VÁ: cho tác giả đọc được hàng đã xoá của CHÍNH MÌNH. Hàng đó không biến mất khỏi tầm
-- mắt Postgres nữa nên update đi qua được.
--
-- ĐÁNH ĐỔI PHẢI BIẾT: nới policy đọc = bài đã xoá của mình sẽ hiện lại trong danh sách của
-- chính mình. Client PHẢI lọc `deleted_at is null` ở mọi select (QAStore/ConversationStore) —
-- policy không còn tự lo phần đó nữa. Quên lọc = người ta thấy lại bài mình vừa xoá.
--
-- Đã cân nhắc và loại: làm RPC `soft_delete_content()` SECURITY DEFINER (khuôn `delete_account`
-- của 0021) để khỏi nới policy đọc. Gọn về mặt đọc, nhưng dồn 4 bảng vào một hàm bỏ qua RLS —
-- thêm một cửa hậu phải tự kiểm quyền, trong khi RLS sinh ra để làm đúng việc đó. Đăng chốt
-- hướng nới policy + lọc client (17/07).

begin;

-- questions / answers / answer_replies: cùng một hình dạng, cùng một cách vá.
alter policy questions_read on public.questions
  using (
    (select auth.uid()) is not null
    and (deleted_at is null or is_admin() or author_id = (select auth.uid()))
  );

alter policy answers_read on public.answers
  using (
    (select auth.uid()) is not null
    and (deleted_at is null or is_admin() or author_id = (select auth.uid()))
  );

alter policy answer_replies_read on public.answer_replies
  using (
    (select auth.uid()) is not null
    and (deleted_at is null or is_admin() or author_id = (select auth.uid()))
  );

-- messages: giữ nguyên điều kiện thành viên kênh — nới chỗ đó là lộ tin nhắn kênh riêng.
-- Chỉ nới đúng vế `deleted_at`, và chỉ cho chính người gửi.
alter policy messages_read on public.messages
  using (
    (select auth.uid()) is not null
    and (deleted_at is null or user_id = (select auth.uid()))
    and exists (
      select 1 from public.channels c
       where c.id = messages.channel_id
         and (c.kind = any (array['public','feed']) or is_channel_member(c.id))
    )
  );

commit;
