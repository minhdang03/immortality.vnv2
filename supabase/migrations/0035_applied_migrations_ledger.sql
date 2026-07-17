-- 0035_applied_migrations_ledger.sql — sổ migration ghi tay có kỷ luật.
--
-- Project này KHÔNG có supabase_migrations.schema_migrations: migration áp bằng psql TAY,
-- số thứ tự file không chứng minh nó đã chạy trên prod. Sổ này để prod TRẢ LỜI ĐƯỢC câu
-- "file nào đã chạy" thay vì phải dò pg_tables/pg_policies/pg_proc từng lần.
--
-- Kỷ luật từ 0035 trở đi: MỖI migration tự chèn dòng ghi sổ ở CUỐI file của chính nó
-- (on conflict do nothing — chạy lại không nhân đôi). Seed/dữ liệu KHÔNG ghi sổ, chỉ schema.

create table if not exists public._applied_migrations (
  filename   text primary key,
  applied_at timestamptz not null default now(),
  applied_by text not null default current_user,
  note       text
);

alter table public._applied_migrations enable row level security;

-- Chỉ admin đọc; KHÔNG có policy ghi — client không có đường sờ vào sổ,
-- chỉ psql (owner, RLS không áp) và service_role ghi được.
drop policy if exists applied_migrations_admin_read on public._applied_migrations;
create policy applied_migrations_admin_read on public._applied_migrations
  for select using (public.is_admin());

-- Backfill 0001..0034 — danh sách lấy từ `ls supabase/migrations/` (0010 chưa từng tồn tại).
-- KHÔNG ghi khống: object đại diện đã verify trên prod 18/07 bằng psql/HTTP thật —
-- trg_push_on_message (0026/0031), trg_answers_count (0033), follows (0028),
-- message_reactions + public_profiles (0027), chat-media E2E 2 account thường (0024),
-- create_dm chạy thật (0030), profiles_self_update verify 17/07 (0032), is_admin (0007),
-- is_channel_member (0017), tg_profiles_guard_role (0032).
insert into public._applied_migrations(filename, note)
select f, 'backfill 18/07 — áp tay trước khi có sổ; object đại diện đã verify prod'
from unnest(array[
  '0001_extensions.sql',
  '0002_content.sql',
  '0003_taxonomy.sql',
  '0004_engagement.sql',
  '0005_agent.sql',
  '0006_analytics.sql',
  '0007_rls.sql',
  '0008_fts_vector.sql',
  '0009_profiles_trigger.sql',
  '0011_reading_stats_rpc.sql',
  '0012_reading_stats_admin_guard.sql',
  '0013_content_extra_jsonb.sql',
  '0014_content_id_default.sql',
  '0015_content_source_ref_full_unique.sql',
  '0016_reading_stats_dwell_type_fix.sql',
  '0017_nodie_community.sql',
  '0018_nodie_qa_engagement.sql',
  '0019_nodie_rls_authed_only.sql',
  '0020_nodie_author_fk_to_profiles.sql',
  '0021_nodie_reply_report_and_delete_account.sql',
  '0022_nodie_question_saves.sql',
  '0023_nodie_messages_realtime.sql',
  '0024_nodie_chat_media.sql',
  '0025_nodie_channel_appearance.sql',
  '0026_nodie_push_on_message_trigger.sql',
  '0027_nodie_public_profiles_and_message_reactions.sql',
  '0028_nodie_follows.sql',
  '0029_nodie_device_token_env.sql',
  '0030_nodie_create_dm_rpc.sql',
  '0031_nodie_fix_push_trigger_net_schema.sql',
  '0032_nodie_profiles_self_update.sql',
  '0033_nodie_answer_count_soft_delete.sql',
  '0034_nodie_author_reads_own_deleted.sql'
]) f
on conflict (filename) do nothing;

insert into public._applied_migrations(filename)
values ('0035_applied_migrations_ledger.sql')
on conflict (filename) do nothing;
