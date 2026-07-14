-- 0015_content_source_ref_full_unique.sql — make source_ref upsert-able.
-- idx_content_source_ref was a partial unique index (where source_ref is not null).
-- PostgREST upsert sends ON CONFLICT (source_ref) with no predicate, which cannot
-- infer a partial index → agent re-publish fails with duplicate-key instead of
-- updating. A full unique index keeps identical semantics (NULLS DISTINCT allows
-- unlimited null source_refs) and is inferable by ON CONFLICT.

drop index if exists public.idx_content_source_ref;
create unique index idx_content_source_ref on public.content(source_ref);
