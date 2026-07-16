-- 0024_nodie_chat_media.sql — ảnh + thoại trong hội thoại (phase 04).
--
-- Bucket `chat-media` là PRIVATE (tạo qua Storage API): không ai tải bằng URL trần,
-- phải xin signed URL và Storage sẽ kiểm policy dưới đây trước khi ký.
--
-- QUY ƯỚC ĐƯỜNG DẪN — policy đứng hết trên nó, đổi là hỏng quyền:
--     chat-media/{channel_id}/{user_id}/{uuid}.{ext}
-- `storage.foldername(name)` trả mảng thư mục 1-based → [1]=channel_id, [2]=user_id.
--
-- Vì sao nhét channel_id vào đường dẫn thay vì tra ngược từ bảng messages: file được
-- upload TRƯỚC khi tin nhắn tồn tại (phải có URL rồi mới ghi tin). Lúc kiểm quyền upload
-- chưa có dòng messages nào để tra, nên chính đường dẫn phải mang thông tin đó.
--
-- Cùng ba hàm helper của 0017 (`is_channel_member`) nên quyền media và quyền đọc tin
-- luôn khớp nhau — rời kênh là mất cả tin lẫn ảnh, không phải nhớ đồng bộ hai nơi.

-- Đọc: phải là thành viên kênh đó. Kênh public thì mọi người ĐÃ ĐĂNG NHẬP đọc được,
-- khớp `messages_read` (0017 + 0019) — media không được lỏng hơn tin chứa nó.
drop policy if exists chat_media_read on storage.objects;
create policy chat_media_read on storage.objects
  for select using (
    bucket_id = 'chat-media'
    and (select auth.uid()) is not null
    and exists (
      select 1 from public.channels c
      where c.id = ((storage.foldername(name))[1])::uuid
        and (c.kind in ('public','feed') or public.is_channel_member(c.id))
    )
  );

-- Ghi: chỉ upload vào thư mục MANG UID CỦA CHÍNH MÌNH, và chỉ vào kênh mình được đăng.
-- Nhánh broadcast lặp lại đúng logic `messages_insert` (0017): kênh phát thì chỉ mod/admin —
-- thiếu vế này thì thành viên thường không gửi được tin vào kênh phát nhưng vẫn nhét được
-- file vào bucket, tức là mở một đường ghi không ai ngó tới.
drop policy if exists chat_media_insert on storage.objects;
create policy chat_media_insert on storage.objects
  for insert with check (
    bucket_id = 'chat-media'
    and ((storage.foldername(name))[2])::uuid = (select auth.uid())
    and public.is_channel_member(((storage.foldername(name))[1])::uuid)
    and (
      not exists (
        select 1 from public.channels c
        where c.id = ((storage.foldername(name))[1])::uuid and c.is_broadcast
      )
      or public.is_channel_mod(((storage.foldername(name))[1])::uuid)
    )
  );

-- Xoá: file của mình, hoặc mod dọn kênh — khớp `messages_delete_own_or_mod`.
drop policy if exists chat_media_delete on storage.objects;
create policy chat_media_delete on storage.objects
  for delete using (
    bucket_id = 'chat-media'
    and (
      ((storage.foldername(name))[2])::uuid = (select auth.uid())
      or public.is_channel_mod(((storage.foldername(name))[1])::uuid)
    )
  );

-- Cố tình KHÔNG có policy UPDATE: file media là bất biến. Sửa ảnh đã gửi = tráo nội dung
-- dưới chân người đã đọc, mà bản ghi tin nhắn vẫn nguyên. Muốn đổi thì xoá rồi gửi lại.
