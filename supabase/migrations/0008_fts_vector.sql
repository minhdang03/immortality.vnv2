-- 0008_fts_vector.sql — VI/EN full-text search + semantic embedding on content.
-- VI accent-insensitive via immutable_unaccent (0001). tsvector generated + GIN.
-- pgvector column nullable; backfilled later (phase-06/agent). Runs after 0007 (RLS on
-- columns unaffected — altering table to add generated cols is fine post-RLS).

-- Generated tsvector columns (STORED) — accent-insensitive over title+summary+body per language.
alter table public.content
  add column if not exists fts_vi tsvector
  generated always as (
    to_tsvector('simple',
      public.immutable_unaccent(
        coalesce(vi_title,'')   || ' ' ||
        coalesce(vi_summary,'') || ' ' ||
        coalesce(vi_question,'')|| ' ' ||
        coalesce(vi_body,'')
      )
    )
  ) stored;

alter table public.content
  add column if not exists fts_en tsvector
  generated always as (
    to_tsvector('simple',
      public.immutable_unaccent(
        coalesce(en_title,'')   || ' ' ||
        coalesce(en_summary,'') || ' ' ||
        coalesce(en_question,'')|| ' ' ||
        coalesce(en_body,'')
      )
    )
  ) stored;

create index if not exists idx_content_fts_vi on public.content using gin (fts_vi);
create index if not exists idx_content_fts_en on public.content using gin (fts_en);

-- Semantic embedding (768-dim). Nullable; backfilled asynchronously. hnsw for ANN.
alter table public.content
  add column if not exists embedding vector(768);

create index if not exists idx_content_embedding
  on public.content using hnsw (embedding vector_cosine_ops);

-- Convenience: search helper. Callers pass raw VI/EN query; unaccent applied to match.
-- websearch_to_tsquery gives forgiving query parsing ("bat tu" → bat & tu).
create or replace function public.search_content(q text, lang text default 'vi')
  returns setof public.content
  language sql stable as $$
  select c.* from public.content c
  where c.status = 'published'
    and case when lang = 'en'
      then c.fts_en @@ websearch_to_tsquery('simple', public.immutable_unaccent(q))
      else c.fts_vi @@ websearch_to_tsquery('simple', public.immutable_unaccent(q))
    end;
$$;
