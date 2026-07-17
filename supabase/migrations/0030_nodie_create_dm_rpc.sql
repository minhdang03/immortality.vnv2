-- 0030_nodie_create_dm_rpc.sql — mở DM 1-1 bằng RPC, vì bằng RLS thì KHÔNG mở được.
--
-- BẾ TẮC CÓ THẬT (đo trên prod 17/07 bằng tài khoản THƯỜNG, không phải admin):
--
--   channels_read      (0019): dm chỉ THÀNH VIÊN mới thấy
--   members_self_join  (0017): chèn được hàng thành viên khi
--                              `exists (select 1 from channels where id = channel_id and kind in ('public','dm'))`
--
-- Câu `exists` đó chạy DƯỚI RLS CỦA NGƯỜI GỌI. Với một kênh dm vừa tạo, người gọi chưa là
-- thành viên ⇒ `channels_read` giấu kênh đi ⇒ `exists` = false ⇒ chèn bị chặn.
-- Muốn vào DM phải thấy DM; muốn thấy DM phải đã ở trong DM. Không có đường vào.
--
-- Đo được: An (user thường) tạo channel dm → 201. An tự chèn mình vào → **403**.
-- Chèn người kia → 403 (đằng nào cũng chặn: `user_id = auth.uid()`).
--
-- Vì sao trước giờ không ai thấy: prod chỉ có MỘT tài khoản, và nó là admin — `is_admin()`
-- ngắn mạch cả hai policy. Đúng cái bẫy plan 1325 đã ghi: "1 tài khoản = admin = không thấy bug".
--
-- CÁCH CHỮA: không nới policy (nới `channels_read` cho mọi dm = ai cũng đọc được DM người
-- khác; nới `members_self_join` bỏ `user_id = auth.uid()` = ai cũng lôi người lạ vào kênh).
-- Thay vào đó server đứng ra tạo — đúng khuôn Slack/IG: client KHÔNG tự lắp DM, nó gọi một
-- việc "mở hội thoại với người này" và server trả về kênh.
--
-- RPC này còn gánh 3 việc mà client làm sẽ sai:
--   1. Dồn trùng — mở lại đúng kênh cũ, không đẻ kênh thứ hai cho cùng một cặp.
--   2. Chặn — không mở DM với người đã chặn/bị chặn (dùng is_blocked_pair của 0028).
--   3. Nguyên tử — kênh và CẢ HAI hàng thành viên cùng sống hoặc cùng chết. Client làm 3
--      request thì hỏng giữa chừng để lại kênh mồ côi không ai vào được.

create or replace function public.create_dm(other_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me  uuid := auth.uid();
  cid uuid;
begin
  if me is null then
    raise exception 'Cần đăng nhập.' using errcode = '42501';
  end if;

  if other_id is null or other_id = me then
    raise exception 'Không thể tự nhắn cho chính mình.' using errcode = '22023';
  end if;

  if not exists (select 1 from public.profiles p where p.id = other_id) then
    raise exception 'Không tìm thấy người này.' using errcode = 'P0002';
  end if;

  -- Chặn hai chiều: người bị chặn không mở được đường nói chuyện mới, và người chặn
  -- cũng không vô tình mở lại. 0028 đã có sẵn hàm này, không viết lại logic chặn.
  if public.is_blocked_pair(me, other_id) then
    raise exception 'Không thể nhắn tin với người này.' using errcode = '42501';
  end if;

  -- Kênh dm ĐÚNG HAI người và đủ cả hai. Không có `count = 2` thì một kênh dm có thêm
  -- người thứ ba (dữ liệu rác) vẫn khớp và ta trả nhầm.
  select c.id into cid
  from public.channels c
  where c.kind = 'dm'
    and (select count(*) from public.channel_members m where m.channel_id = c.id) = 2
    and exists (select 1 from public.channel_members m where m.channel_id = c.id and m.user_id = me)
    and exists (select 1 from public.channel_members m where m.channel_id = c.id and m.user_id = other_id)
  limit 1;

  if cid is not null then
    return cid;
  end if;

  insert into public.channels (kind, is_broadcast, created_by)
  values ('dm', false, me)
  returning id into cid;

  -- Cả hai vào cùng lúc. `on conflict do nothing` phòng hai máy cùng bấm "Nhắn tin" một lúc.
  insert into public.channel_members (channel_id, user_id)
  values (cid, me), (cid, other_id)
  on conflict (channel_id, user_id) do nothing;

  return cid;
end;
$$;

-- `authenticated` thôi: anon không có auth.uid() nên vào cũng chỉ để ăn exception.
revoke all on function public.create_dm(uuid) from public, anon;
grant execute on function public.create_dm(uuid) to authenticated;
