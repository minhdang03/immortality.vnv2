-- 0020_nodie_author_fk_to_profiles.sql — cho PostgREST nhúng được tên tác giả.
--
-- LỖI ĐANG SỬA (phát hiện 2026-07-16 khi chạy thật QA wire lần đầu):
--   iOS QAStore query `select=...,author:profiles(display_name)` → PostgREST trả
--   PGRST200: "Could not find a relationship between 'questions' and 'profiles'".
--   Nguyên nhân: 0017/0018 cho author_id trỏ auth.users, còn profiles.id cũng trỏ
--   auth.users. Hai bảng là ANH EM (cùng cha auth.users), không phải cha-con —
--   PostgREST chỉ nhúng được khi có FK TRỰC TIẾP giữa hai bảng. Danh sách Hỏi đáp
--   vì thế rỗng hoàn toàn, không phải lỗi RLS hay giao diện.
--
-- CÁCH SỬA: trỏ author_id/user_id sang public.profiles(id) thay vì auth.users(id).
-- Đây là khuôn Supabase khuyến nghị cho dữ liệu người dùng đọc được qua API.
--
-- Dây chuyền xoá KHÔNG đổi: profiles.id → auth.users ON DELETE CASCADE (đã có).
--   xoá auth.users → cascade xoá profiles → SET NULL author_id. Y như trước.
-- An toàn dữ liệu đã kiểm trước khi chạy: auth.users=1, profiles=1,
--   users không profile=0, author_id mồ côi=0 → FK mới không có gì để từ chối.
-- Điều kiện ngầm mới: phải có profiles row mới đăng nội dung được.
--   Trigger handle_new_user (0009) tạo profiles cho mọi user mới → thoả sẵn.
--
-- messages.user_id sửa CÙNG LÚC dù chat là phase 04: cùng một lỗi, cùng một cách sửa,
-- và ConversationStore (phase 04) sẽ nhúng author:profiles y hệt → vá luôn rẻ hơn
-- để phase sau đâm lại vào cùng cái hố rồi phải thêm một migration nữa.

-- questions.author_id
alter table public.questions drop constraint if exists questions_author_id_fkey;
alter table public.questions add constraint questions_author_id_fkey
  foreign key (author_id) references public.profiles(id) on delete set null;

-- answers.author_id
alter table public.answers drop constraint if exists answers_author_id_fkey;
alter table public.answers add constraint answers_author_id_fkey
  foreign key (author_id) references public.profiles(id) on delete set null;

-- answer_replies.author_id
alter table public.answer_replies drop constraint if exists answer_replies_author_id_fkey;
alter table public.answer_replies add constraint answer_replies_author_id_fkey
  foreign key (author_id) references public.profiles(id) on delete set null;

-- messages.user_id (phase 04 dùng)
alter table public.messages drop constraint if exists messages_user_id_fkey;
alter table public.messages add constraint messages_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete set null;

-- PostgREST cache sơ đồ quan hệ trong bộ nhớ; đổi FK xong phải bảo nó nạp lại,
-- không thì vẫn trả PGRST200 dù DB đã đúng.
notify pgrst, 'reload schema';
