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

-- Theo dõi: chỉ nhân danh chính mình, và không theo dõi được người dính chặn (hai chiều —
-- mình chặn họ, hoặc họ chặn mình). Thiếu vế thứ hai thì kẻ bị chặn vẫn bám theo nạn nhân.
drop policy if exists follows_insert on public.follows;
create policy follows_insert on public.follows
  for insert with check (
    follower_id = (select auth.uid())
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = follower_id and b.blocked_id = followee_id)
         or (b.blocker_id = followee_id and b.blocked_id = follower_id)
    )
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

drop trigger if exists trg_block_removes_follows on public.blocks;
create trigger trg_block_removes_follows after insert on public.blocks
  for each row execute function public.tg_block_removes_follows();

-- Bỏ chặn KHÔNG tự nối lại theo dõi: quan hệ đó đã bị cắt thật, muốn lại thì bấm lại.
-- Tự khôi phục là thay người dùng quyết định một việc họ đã cố ý làm.

notify pgrst, 'reload schema';
