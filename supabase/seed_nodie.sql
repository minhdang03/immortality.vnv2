-- seed_nodie.sql — dữ liệu tối thiểu để NODIE iOS chạy được với DB thật.
-- Tách khỏi supabase/seed.sql (default của web: settings/translations) — hai vòng đời khác nhau.
--
-- Chạy:
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 --single-transaction \
--     -v admin_uid="'46328fcb-30fe-4183-96f6-4dddd8dfa985'" -f supabase/seed_nodie.sql
--
-- ⚠️ created_at của messages PHẢI đặt tường minh và lùi về quá khứ, giãn > 2 giây.
-- Trigger tg_message_inserted so `now() - max(created_at cũ) < 2s` thì raise. Trong MỘT
-- transaction `now()` là hằng số, nên để created_at mặc định = chèn tin thứ 2 là chết ngay.
-- Backdate → khoảng cách tính theo giờ, trigger cho qua.

-- Kênh: 1 thường (chat được) + 1 broadcast (chỉ mod đăng — để kiểm chứng RLS is_broadcast).
insert into public.channels (id, slug, title, kind, is_broadcast, created_by, created_at)
values
  ('11111111-1111-4111-8111-111111111111', 'naobo',   'Khoa học não bộ', 'public', false, :admin_uid, now() - interval '3 days'),
  ('22222222-2222-4222-8222-222222222222', 'thongbao','Thông báo BTD',   'public', true,  :admin_uid, now() - interval '3 days')
on conflict (id) do nothing;

-- Admin là mod ở cả hai (cần role='mod' mới đăng được vào kênh broadcast).
insert into public.channel_members (channel_id, user_id, role, joined_at, last_read_at)
values
  ('11111111-1111-4111-8111-111111111111', :admin_uid, 'mod', now() - interval '3 days', now() - interval '3 days'),
  ('22222222-2222-4222-8222-222222222222', :admin_uid, 'mod', now() - interval '3 days', now() - interval '3 days')
on conflict (channel_id, user_id) do nothing;

-- Tin nhắn: backdate, giãn 10 phút. last_read_at đặt 3 ngày trước ⇒ cả 3 tin tính là CHƯA ĐỌC
-- → phase 04 có sẵn dữ liệu để kiểm chứng badge đếm chưa đọc, không phải bịa.
insert into public.messages (id, channel_id, user_id, body, created_at)
values
  ('aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', :admin_uid, 'Chào cả nhà, kênh này bàn về não bộ và trí nhớ.', now() - interval '2 hours'),
  ('aaaaaaaa-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', :admin_uid, 'Tuần này mình đọc về vai trò của giấc ngủ sâu trong việc dọn dẹp protein beta-amyloid.', now() - interval '110 minutes'),
  ('aaaaaaaa-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', :admin_uid, 'Ai có tài liệu về glymphatic system thì chia sẻ nhé.', now() - interval '100 minutes')
on conflict (id) do nothing;

insert into public.messages (id, channel_id, user_id, body, created_at)
values
  ('bbbbbbbb-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', :admin_uid, 'Kênh thông báo chính thức của Bất Tử Đạo. Chỉ quản trị viên đăng bài.', now() - interval '1 day')
on conflict (id) do nothing;

-- Hỏi đáp: 1 câu hỏi + 2 trả lời ⇒ trigger trg_answers_count phải đẩy answer_count = 2.
-- Đây là bằng chứng trigger sống, không phải "chạy không báo lỗi".
insert into public.questions (id, author_id, title, body, topic, created_at)
values
  ('cccccccc-0000-4000-8000-000000000001', :admin_uid,
   'Ngủ bao nhiêu là đủ để não tự dọn dẹp?',
   'Mình đọc thấy giấc ngủ sâu giúp hệ glymphatic đẩy beta-amyloid ra khỏi não. Nhưng bao nhiêu tiếng thì đủ, và ngủ trưa có tính không?',
   'não bộ', now() - interval '1 day')
on conflict (id) do nothing;

insert into public.answers (id, question_id, author_id, body, created_at)
values
  ('dddddddd-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000001', :admin_uid,
   'Phần lớn nghiên cứu hiện tại nói 7–9 tiếng cho người lớn, và quan trọng là ĐỦ CHU KỲ chứ không chỉ đủ giờ. Hệ glymphatic hoạt động mạnh nhất ở giai đoạn ngủ sâu (N3), mà N3 tập trung ở nửa đầu đêm.',
   now() - interval '20 hours'),
  ('dddddddd-0000-4000-8000-000000000002', 'cccccccc-0000-4000-8000-000000000001', :admin_uid,
   'Ngủ trưa ngắn 20 phút thì hầu như không vào N3 nên không thay được giấc đêm. Ngủ trưa dài 90 phút có thể vào chu kỳ đầy đủ, nhưng dễ phá giấc đêm hôm sau.',
   now() - interval '19 hours')
on conflict (id) do nothing;

-- Reply lồng: kiểm chứng cây answer_replies + flatReplies() bên iOS có chạy đúng không.
insert into public.answer_replies (id, answer_id, parent_id, author_id, body, created_at)
values
  ('eeeeeeee-0000-4000-8000-000000000001', 'dddddddd-0000-4000-8000-000000000001', null, :admin_uid,
   'Bổ sung: rượu bia làm giảm mạnh N3 dù vẫn ngủ đủ giờ.', now() - interval '18 hours'),
  ('eeeeeeee-0000-4000-8000-000000000002', 'dddddddd-0000-4000-8000-000000000001', 'eeeeeeee-0000-4000-8000-000000000001', :admin_uid,
   'Đúng, và caffeine sau 14h cũng cắt N3 ở nhiều người dù họ vẫn ngủ được.', now() - interval '17 hours')
on conflict (id) do nothing;
