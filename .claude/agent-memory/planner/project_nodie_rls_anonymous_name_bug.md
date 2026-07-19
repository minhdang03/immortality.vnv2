---
name: nodie-rls-anonymous-name-bug
description: NODIE — profiles RLS self-only làm mọi tên người khác thành "Ẩn danh"; bug ẩn vì prod chỉ có 1 user và user đó là admin; vá bằng view public_profiles
metadata:
  type: project
---

`profiles_self_read` (migration 0007) = `(id = auth.uid() or is_admin())`. Embed PostgREST **cũng chịu RLS** → `author:profiles(display_name)` trả `author=null` cho nội dung của người khác → `AuthorRef.name` fallback `?? "Ẩn danh"` → **hỏng IM LẶNG**, không crash không lỗi.

**Why chưa ai thấy:** prod (đo 17/07/2026) có `auth.users=1`, và user duy nhất đó **chính là admin** → nhánh `or is_admin()` cho qua tất. **Bug nổ đúng lúc người thứ hai đăng ký.**

**How to apply:**
- **Test hồ sơ/tên người bằng 2 tài khoản.** Một tài khoản (admin) sẽ không bao giờ thấy bug này. Tài khoản test `NODIE_TEST_EMAIL` có `role='admin'` — nó cũng che luôn bug "admin thấy cả bài xoá mềm".
- Vá = view `public.public_profiles` (id, display_name, bio, created_at), `security_invoker=false` để bypass RLS bảng gốc, grant select cho `authenticated`. Bảng `profiles` giữ self-only để AuthStore đọc `role` của mình vẫn chạy. **KHÔNG nới policy bảng** — sẽ phơi `role` (ai là admin) cho mọi người đã đăng nhập.
- Mọi chỗ select tên người khác phải trỏ `public_profiles`, KHÔNG `profiles`. Tính đến 17/07 còn dính: `QAStore.swift:45-47`, `ConversationStore.swift:29`, `ConversationStoreRealtime.swift:61`.
- **Thứ tự cứng:** apply migration TRƯỚC → rồi mới đổi Swift. Đổi trước = PGRST200 (đã dính 1 lần ở 0020 vì FK không trực tiếp).

Liên quan: [[nodie-parallel-session-churn]]
</content>
