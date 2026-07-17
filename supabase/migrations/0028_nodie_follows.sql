-- 0028_nodie_follows.sql — theo dõi người, và mối quan hệ của nó với chặn.
--
-- Trước file này, TOÀN BỘ tab Bạn bè chạy trên MockData: `followingList`/`suggestList`
-- là `MockData.people.filter{...}` (AppState.swift), nút Theo dõi ở MemberProfile chỉ đổi
-- state trong RAM, và số "người theo dõi" trên hồ sơ là số bịa. Không có bảng thì không
-- có gì để wire.
--
-- Không denormalize follower_count vào `profiles` (khác lối `answers.vote_count` của 0018):
-- ở đó buộc phải đếm sẵn vì `answer_reactions` chỉ cho đọc hàng của MÌNH, người khác không
-- tự đếm được. Ở đây select mở cho mọi người đã đăng nhập, nên `count(*)` với
-- `idx_follows_followee` là đủ — và không đẻ thêm trigger cùng một con số ở hai nơi để lệch.

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  -- Tự theo dõi mình là vô nghĩa và sẽ làm phồng số đếm của chính mình.
  constraint follows_no_self check (follower_id <> followee_id)
);

-- Đếm "người theo dõi" của một hồ sơ = quét theo followee. PK đã lo chiều follower
-- (đang theo dõi ai), chiều ngược lại cần index riêng.
create index if not exists idx_follows_followee on public.follows(followee_id);

alter table public.follows enable row level security;

-- Đọc: ai đã đăng nhập cũng đọc được. Quan hệ theo dõi là công khai — đó là thứ dựng nên
-- "đang theo dõi"/"gợi ý"/số người theo dõi. Giữ kín thì chính chủ cũng không đếm nổi.
drop policy if exists follows_read on public.follows;
create policy follows_read on public.follows
  for select using ((select auth.uid()) is not null);

-- Cặp này có ai chặn ai không — HAI CHIỀU.
--
-- PHẢI là security definer, và đây là lý do (đã dựng lại trên DB thật trước khi viết):
-- subquery trong policy chạy bằng QUYỀN NGƯỜI GỌI, nên `blocks` cũng bị RLS của nó lọc.
-- `blocks_self` (0017:263) là `for all using (blocker_id = auth.uid())` → người BỊ chặn
-- không nhìn thấy dòng chặn mình. Viết `not exists (select 1 from blocks ...)` thẳng trong
-- policy thì nhánh "họ chặn tôi" là CODE CHẾT: A bị B chặn, A đọc blocks ra 0 dòng,
-- `not exists` luôn đúng, A follow B ngon lành. Chiều duy nhất cần bảo vệ nạn nhân lại
-- chính là chiều hỏng.
--
-- Hàm định-nghĩa-sẵn chạy bằng quyền chủ sở hữu → nhìn được cả hai chiều, đúng như
-- `is_channel_member`/`is_admin` đã làm cho chính bài toán này.
--
-- KHÔNG sửa bằng cách nới `blocks_self` thành `blocked_id = auth.uid()`: làm thế là tiết lộ
-- cho người ta biết ai đã chặn mình — chặn im lặng mới là điểm của tính năng chặn.
--
-- Trả boolean, không trả danh sách: người gọi chỉ biết "có/không" cho đúng cặp họ đã hỏi,
-- không dò được ai chặn ai.
create or replace function public.is_blocked_pair(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b)
       or (blocker_id = b and blocked_id = a)
  );
$$;
revoke execute on function public.is_blocked_pair(uuid, uuid) from public, anon;
grant execute on function public.is_blocked_pair(uuid, uuid) to authenticated;

-- Theo dõi: chỉ nhân danh chính mình, và không theo dõi được người dính chặn (hai chiều —
-- mình chặn họ, hoặc họ chặn mình).
drop policy if exists follows_insert on public.follows;
create policy follows_insert on public.follows
  for insert with check (
    follower_id = (select auth.uid())
    and not public.is_blocked_pair(follower_id, followee_id)
  );

-- Bỏ theo dõi: chỉ hàng của mình.
drop policy if exists follows_delete on public.follows;
create policy follows_delete on public.follows
  for delete using (follower_id = (select auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- Chặn → cắt theo dõi HAI CHIỀU
-- ─────────────────────────────────────────────────────────────────────────────
-- Policy insert ở trên chỉ chặn follow MỚI. Không có trigger này thì follow CŨ sống sót:
-- chặn xong người kia vẫn nằm trong "người theo dõi" của mình và vẫn đếm vào số trên hồ sơ
-- — đúng thứ người dùng bấm Chặn để thoát khỏi. IG/X đều cắt sạch cả hai chiều.
--
-- Trigger chứ không để client xoá: client xoá thì cần đúng hai request luôn thành công.
-- Rớt mạng giữa chừng là còn lại quan hệ ma mà không ai biết để dọn.
create or replace function public.tg_block_removes_follows() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.follows
  where (follower_id = new.blocker_id and followee_id = new.blocked_id)
     or (follower_id = new.blocked_id and followee_id = new.blocker_id);
  return null;
end; $$;

-- `insert or update`, không chỉ insert: `blocks_self` là `for all` nên UPDATE được phép.
-- Chỉ bắt insert thì A chặn C rồi PATCH dòng đó thành B — `blocker_id` không đổi nên cả
-- `using` lẫn `with check` đều lọt, trigger không nổ, và follow A↔B sống sót một cú chặn.
-- Giao diện hiện không làm thế, nhưng anon key thì làm được.
drop trigger if exists trg_block_removes_follows on public.blocks;
create trigger trg_block_removes_follows after insert or update on public.blocks
  for each row execute function public.tg_block_removes_follows();

-- Bỏ chặn KHÔNG tự nối lại theo dõi: quan hệ đó đã bị cắt thật, muốn lại thì bấm lại.
-- Tự khôi phục là thay người dùng quyết định một việc họ đã cố ý làm.

notify pgrst, 'reload schema';
