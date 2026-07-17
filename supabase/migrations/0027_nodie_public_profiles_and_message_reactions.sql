-- 0027_nodie_public_profiles_and_message_reactions.sql
--
-- Hai việc, cùng một gốc: người này phải nhìn thấy người kia.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- 1. public_profiles — VÁ BUG "ẨN DANH" (latent, chưa ai thấy)
-- ─────────────────────────────────────────────────────────────────────────────
-- 0007 đặt `profiles_self_read :: (id = auth.uid() or is_admin())`: mỗi người chỉ
-- đọc được hồ sơ của CHÍNH MÌNH. Embed PostgREST cũng chịu RLS, nên
-- `author:profiles(display_name)` (QAStore) trả author=null cho mọi nội dung của
-- NGƯỜI KHÁC. `AuthorRef.name` có fallback `?? "Ẩn danh"` → hỏng IM LẶNG: không
-- crash, không lỗi, chỉ là tên ai cũng thành "Ẩn danh".
--
-- Vì sao chưa ai thấy (kiểm trên prod 2026-07-17 trước khi viết file này):
--   auth.users=1, profiles=1, admins=1 — user duy nhất CHÍNH LÀ admin, nên nhánh
--   `or is_admin()` cho qua tất. Bug nổ đúng lúc người thứ hai đăng ký.
--
-- ⚠️ FILE NÀY MỘT MÌNH KHÔNG VÁ ĐƯỢC BUG. Nó mới dựng cái view. Ba select string của
-- QAStore.swift (questionSelect/answerSelect/replySelect) VẪN đang embed `profiles` —
-- apply xong mà không đổi chúng thì "Ẩn danh" còn nguyên. Đổi phải làm SAU khi apply,
-- không thì PGRST200 vì view chưa tồn tại. Khi đổi, kiểm lại bằng request thật:
-- PostgREST suy quan hệ view từ FK của bảng gốc (`questions_author_id_fkey` → `profiles.id`,
-- mà view có chở `id`) — đúng chỗ 0020 đã ngã một lần, đừng tin, hãy thử.
--
-- Vì sao VIEW chứ không nới policy của bảng: `profiles` có cột `role`
-- (user/mod/admin). Nới `for select using (auth.uid() is not null)` là phơi luôn
-- ai-là-admin cho mọi người đã đăng nhập. Còn giấu `role` bằng column grant thì
-- gãy AuthStore — nó đọc role của chính mình (UserProfile.role).
--   → Bảng giữ nguyên self-only (AuthStore không đổi một dòng), view chở đúng những
--     cột công khai. Thêm cột nhạy cảm vào `profiles` sau này KHÔNG tự lọt ra.
--
-- security_invoker = false là MẶC ĐỊNH của PG15+, viết ra cho rõ ý: view chạy
-- bằng quyền chủ sở hữu → bỏ qua RLS của `profiles`. Đó chính là thứ ta cần
-- (danh bạ công khai), và grant bên dưới mới là hàng rào thật.
--
-- `created_at` có mặt vì hồ sơ hiện "N ngày tham gia" (ProfileStatsGrid.fetchDaysJoined).
-- Thiếu nó thì thống kê hồ sơ NGƯỜI KHÁC hỏng còn hồ sơ mình vẫn chạy (self-read qua
-- bảng) — đúng kiểu lỗi chỉ lộ khi có người thứ hai, y hệt bug "Ẩn danh" file này đang vá.
-- Ngày tạo tài khoản không phải bí mật: nó vốn đã hiện công khai trên hồ sơ.
create or replace view public.public_profiles
  with (security_invoker = false) as
  select id, display_name, bio, created_at from public.profiles;

-- anon KHÔNG đọc được: 0019 đã chốt "authed only" cho toàn bộ NODIE, danh bạ
-- người dùng không được lỏng hơn nội dung họ đăng.
revoke all on public.public_profiles from anon, public;
grant select on public.public_profiles to authenticated;

-- Tìm người theo tên (FriendsView). pg_trgm đã có từ 0001.
-- Index đứng trên BẢNG GỐC — view là projection thuần nên planner vẫn dùng được nó.
-- gin_trgm_ops mới cứu được ILIKE '%x%'; btree thường vô dụng với wildcard đầu chuỗi.
create index if not exists idx_profiles_display_name_trgm
  on public.profiles using gin (display_name gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. message_reactions — thả ☀/❤️ lên tin nhắn
-- ─────────────────────────────────────────────────────────────────────────────
-- KHÔNG dùng lại `answer_reactions` (0018): check của nó là
-- `target_type in ('answer','reply')` và target_id không có FK — nhét message vào
-- là mất cascade khi xoá tin, và mở check ra thành bảng-cho-mọi-thứ.
--
-- KHÁC 0018 một điểm có chủ ý — KHÔNG trigger đếm denorm:
--   answer_reactions để select self-only, nên buộc phải có lit_count/vote_count
--   cho người khác nhìn thấy tổng. Ở chat, Messenger/Zalo/IG đều cho xem AI đã
--   thả, không chỉ bao nhiêu — nên select mở cho thành viên kênh, client đọc
--   thẳng rồi tự đếm. Bớt được cột denorm + trigger + một nguồn lệch số.
--   Chat nạp 50 tin/lượt → tập reaction nhỏ, không cần denorm để nhanh.
--
-- user_id trỏ profiles (KHÔNG phải auth.users) — đúng bài học 0020: PostgREST chỉ
-- nhúng được khi FK TRỰC TIẾP, mà ta cần nhúng tên người thả.
create table if not exists public.message_reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       text not null check (kind in ('lit','heart')),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, kind)   -- toggle 1 lần/người/tin/loại
);
create index if not exists idx_message_reactions_message on public.message_reactions(message_id);

alter table public.message_reactions enable row level security;

-- Đọc: đọc được TIN thì đọc được reaction của nó. Bám đúng `messages_read` (0019)
-- thay vì chép lại điều kiện kênh — hai bản sao là hai chỗ để lệch nhau về sau.
drop policy if exists message_reactions_read on public.message_reactions;
create policy message_reactions_read on public.message_reactions
  for select using (
    (select auth.uid()) is not null
    and exists (select 1 from public.messages m where m.id = message_id)
  );

-- Thả: chỉ thả danh nghĩa chính mình, và chỉ lên tin mình đọc được.
-- `exists on messages` tự động chịu messages_read → không cần lặp lại luật kênh.
drop policy if exists message_reactions_insert on public.message_reactions;
create policy message_reactions_insert on public.message_reactions
  for insert with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.messages m where m.id = message_id)
  );

-- Gỡ: chỉ gỡ của mình.
drop policy if exists message_reactions_delete on public.message_reactions;
create policy message_reactions_delete on public.message_reactions
  for delete using (user_id = (select auth.uid()));

-- Realtime: 0023 đã bật cho `messages`; reaction đến sau tin nên phải thêm riêng,
-- không thì thả ☀ chỉ mình người thả thấy cho tới lần mở lại app.
--
-- Bọc guard y như 0023: `alter publication ... add table` trần sẽ ném 42710 ở lần chạy
-- thứ hai và kéo đổ CẢ transaction — mọi câu khác trong file này đều replay được
-- (`create or replace`, `if not exists`, `drop ... if exists`), một câu không replay được
-- là đủ để một lần deploy lặp lại biến thành sự cố.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'message_reactions'
  ) then
    alter publication supabase_realtime add table public.message_reactions;
  end if;
end $$;

-- Đổi FK/thêm bảng xong PostgREST phải nạp lại sơ đồ, không thì vẫn PGRST200 (bài học 0020).
notify pgrst, 'reload schema';
