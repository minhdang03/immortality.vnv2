-- 0018_nodie_qa_engagement.sql — Q&A engagement (Đăng chốt handoff v4, 2026-07-16):
--   ▲ vote + ☀ lit + badge "Hay nhất" + reply lồng nhiều lớp (X/Reddit).
-- Phân biệt với "no engagement metrics on people": metric ở đây trên NỘI DUNG
-- (câu trả lời / reply), KHÔNG phải trên hồ sơ người dùng — được phép.
-- Đếm denormalized (cột + trigger), không COUNT lúc đọc.

-- Cột đếm + cờ Hay nhất trên answers.
alter table public.answers add column if not exists vote_count int not null default 0;
alter table public.answers add column if not exists lit_count  int not null default 0;
alter table public.answers add column if not exists is_best    boolean not null default false;

-- Reply lồng: parent_id trỏ reply khác (null = trả lời thẳng câu trả lời).
create table if not exists public.answer_replies (
  id         uuid primary key default gen_random_uuid(),
  answer_id  uuid not null references public.answers(id) on delete cascade,
  parent_id  uuid references public.answer_replies(id) on delete cascade,
  author_id  uuid references auth.users(id) on delete set null,
  body       text not null,
  lit_count  int not null default 0,
  created_at timestamptz not null default now(),
  edited_at  timestamptz,
  deleted_at timestamptz
);
create index if not exists idx_answer_replies_answer on public.answer_replies(answer_id, created_at);

-- Phản ứng người dùng: ▲ vote (chỉ answer) + ☀ lit (answer & reply). Toggle 1 lần/người/mục.
create table if not exists public.answer_reactions (
  user_id     uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('answer','reply')),
  target_id   uuid not null,
  kind        text not null check (kind in ('vote','lit')),
  created_at  timestamptz not null default now(),
  primary key (user_id, target_type, target_id, kind)
);

-- Trigger: giữ đếm denormalized khi thêm/xoá reaction.
create or replace function public.tg_answer_reaction_count() returns trigger
language plpgsql security definer set search_path = public as $$
declare delta int; r record;
begin
  if tg_op = 'INSERT' then delta := 1; r := new; else delta := -1; r := old; end if;
  if r.target_type = 'answer' then
    if r.kind = 'vote' then
      update public.answers set vote_count = greatest(vote_count + delta, 0) where id = r.target_id;
    else
      update public.answers set lit_count = greatest(lit_count + delta, 0) where id = r.target_id;
    end if;
  else
    update public.answer_replies set lit_count = greatest(lit_count + delta, 0) where id = r.target_id;
  end if;
  return null;
end; $$;
drop trigger if exists trg_answer_reaction_count on public.answer_reactions;
create trigger trg_answer_reaction_count after insert or delete on public.answer_reactions
  for each row execute function public.tg_answer_reaction_count();

-- "Hay nhất": chỉ tác giả CÂU HỎI được chọn, mỗi câu hỏi tối đa 1 (RPC, không cho sửa cột trực tiếp).
create or replace function public.set_best_answer(p_answer_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare q_id uuid; q_author uuid;
begin
  select a.question_id, q.author_id into q_id, q_author
    from public.answers a join public.questions q on q.id = a.question_id
    where a.id = p_answer_id;
  if q_id is null then raise exception 'answer not found'; end if;
  if q_author is null or q_author <> auth.uid() then
    raise exception 'chỉ tác giả câu hỏi được chọn Hay nhất' using errcode = 'insufficient_privilege';
  end if;
  update public.answers set is_best = (id = p_answer_id) where question_id = q_id;
end; $$;

-- RLS.
alter table public.answer_replies   enable row level security;
alter table public.answer_reactions enable row level security;

create policy answer_replies_read on public.answer_replies
  for select using (deleted_at is null or public.is_admin());
create policy answer_replies_insert on public.answer_replies
  for insert with check (author_id = auth.uid());
create policy answer_replies_update_own on public.answer_replies
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy answer_replies_delete_own on public.answer_replies
  for delete using (author_id = auth.uid() or public.is_admin());

-- Reaction: user tự quản của mình. Đếm đã denormalized nên client chỉ cần đọc reaction CỦA MÌNH
-- (biết đã vote/lit chưa) — không cần đọc reaction người khác.
create policy answer_reactions_self on public.answer_reactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
