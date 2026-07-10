-- 0013_content_extra_jsonb.sql
-- Sự cố cutover 260710: bảng content thiếu chỗ cho field per-type
-- (story: thread/highlights/lesson/tag; article: tag/topic/source; khaitri: tag/source)
-- → stories render "null", card mất hình/chip. Thay vì thêm N cột lẻ,
-- thêm 1 cột extra jsonb hứng mọi field ngoài schema chuẩn; adapter FE spread ra.
alter table public.content
  add column if not exists extra jsonb not null default '{}'::jsonb;

comment on column public.content.extra is
  'Field per-type ngoài schema phẳng (story: threadVi/En, highlightsVi/En, tag; article: tag, topic, source…). FE adapter spread trực tiếp.';
