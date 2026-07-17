-- 0032_nodie_profiles_self_update.sql — cho người ta sửa hồ sơ CỦA CHÍNH MÌNH,
-- mà không mở đường tự phong admin.
--
-- TRIỆU CHỨNG (đo trên prod 17/07 bằng tài khoản thường): màn "Sửa hồ sơ" **không lưu được gì**.
-- PATCH /profiles?id=eq.<mình> → `[]`, HTTP 200, tên trong DB không đổi. Và vì
-- `AuthStore.updateProfile` dùng `.single()`, 0 dòng trở thành lỗi ném vào mặt user.
--
-- NGUYÊN NHÂN: `profiles` từ 0007 tới giờ chỉ có HAI policy —
--   profiles_self_read  [SELECT] (id = auth.uid() or is_admin())
--   profiles_admin_all  [ALL]    (is_admin())
-- Không có policy UPDATE nào cho chính chủ. RLS không báo lỗi khi chặn UPDATE, nó chỉ khớp
-- 0 dòng — nên hỏng kiểu này im lặng tuyệt đối, không log, không 403.
--
-- Vì sao không ai thấy: prod chỉ có một tài khoản và nó là admin → `profiles_admin_all` cho
-- qua hết. Cùng gốc rễ với 0030 (DM bế tắc) và 0031 (gửi tin hỏng). Xem đầu hai file đó.
--
-- VÌ SAO CẦN TRIGGER, KHÔNG CHỈ POLICY: `with check (id = auth.uid())` là đủ để chặn sửa hồ sơ
-- NGƯỜI KHÁC, nhưng KHÔNG chặn được `role`. User gửi `{"role":"admin"}` cho chính hàng của mình
-- thì `id = auth.uid()` vẫn đúng ⇒ tự phong admin ⇒ mở khoá 29 policy `is_admin()`.
-- Với đăng ký public đang MỞ, đó là leo thang đặc quyền cho bất kỳ ai.
--
-- Không siết bằng subquery trong chính policy (`role = (select role from profiles ...)`):
-- policy của `profiles` mà tự SELECT `profiles` là đệ quy vô hạn. Trigger BEFORE UPDATE đứng
-- ngoài RLS nên không dính.
--
-- Giữ im lặng (gán lại giá trị cũ) thay vì `raise`: client hợp lệ không bao giờ gửi `role`, còn
-- client cố tình gửi thì cho nó thành công một cách vô hại — không cần dựng thêm đường lỗi để
-- kẻ dò tìm biết mình vừa chạm đúng chỗ.

create or replace function public.tg_profiles_guard_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Chỉ admin mới đổi được `role` (của mình hoặc của người khác). Người thường có gửi gì
  -- thì `role` vẫn nguyên như cũ.
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_guard_role on public.profiles;
create trigger trg_profiles_guard_role
  before update on public.profiles
  for each row execute function public.tg_profiles_guard_role();

-- `using` = được đụng vào hàng nào; `with check` = hàng sau khi sửa phải còn thoả.
-- Cần CẢ HAI: thiếu `with check` thì user sửa `id` thành người khác và mang hàng đi mất.
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
