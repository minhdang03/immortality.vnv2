-- 0001_extensions.sql — Postgres extensions for Bất Tử Đạo Supabase.
-- Free-tier safe (all bundled with Supabase Cloud).
--
-- vector    : pgvector — semantic search (content.embedding), backfilled later.
-- unaccent  : VI accent-insensitive FTS ("bat tu" matches "Bất Tử"). Replaces D1 remove_diacritics=2.
-- pg_trgm   : trigram fuzzy match (fallback / slug similarity).
-- pgcrypto  : gen_random_uuid(), digest() for hashing where needed.

create extension if not exists vector;
create extension if not exists unaccent;
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- Immutable wrapper so unaccent() can be used in generated (STORED) tsvector columns.
-- Plain unaccent() is STABLE, not IMMUTABLE, so Postgres rejects it in generated columns.
-- This wrapper pins the 'unaccent' dictionary and is marked IMMUTABLE (safe: dictionary is fixed).
create or replace function public.immutable_unaccent(text)
  returns text
  language sql
  immutable
  parallel safe
  strict
as $$
  select public.unaccent('public.unaccent', $1);
$$;
