-- 0002_content.sql — unified content table + slug redirects.
-- Merges Firestore `articles` + `khaitri` (+ story/teaching/practice) into ONE table,
-- distinguished by `type` (locked decision 2026-07-07). Routes /articles, /khaitri stay
-- as type-filtered views. id kept as TEXT = original Firestore doc id (no remap).

create table if not exists public.content (
  id            text primary key,                    -- Firestore doc id (canonical, preserved)
  type          text not null check (type in ('article','story','khaitri','teaching','practice')),
  status        text not null default 'draft' check (status in ('draft','published','archived')),

  -- bilingual fields
  vi_title      text,
  en_title      text,
  vi_summary    text,
  en_summary    text,
  vi_body       text,
  en_body       text,
  vi_slug       text,
  en_slug       text,

  -- khaitri-specific (Q&A). null for other types.
  vi_question   text,
  en_question   text,
  order_index   integer,                             -- khaitri numbered series (asc); null for others

  -- article/feed ordering
  content_date  timestamptz,                         -- article display date; khaitri uses order_index

  -- taxonomy (relational categories detailed in phase-07; topics migrate there)
  category_id   text,                                -- FK added in 0003 after categories exists

  -- agent + dedup
  source_ref    text,                                -- agent idempotency key (e.g. tiktok-<videoId>)
  content_hash  text,                                -- sha256 of canonical body for dedup
  created_by    text,                                -- agent_name or admin uid

  -- misc
  tags          jsonb not null default '[]'::jsonb,
  seo_meta      jsonb,
  thumbnail_url text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- source_ref unique only when present (agent idempotency; matches D1).
create unique index if not exists idx_content_source_ref
  on public.content(source_ref) where source_ref is not null;

-- slug unique per language only when present (drafts may lack slugs).
create unique index if not exists idx_content_vi_slug
  on public.content(vi_slug) where vi_slug is not null;
create unique index if not exists idx_content_en_slug
  on public.content(en_slug) where en_slug is not null;

create index if not exists idx_content_type_status on public.content(type, status);
create index if not exists idx_content_hash on public.content(content_hash);
create index if not exists idx_content_order on public.content(type, order_index)
  where order_index is not null;
create index if not exists idx_content_date on public.content(type, content_date desc)
  where content_date is not null;

-- keep updated_at fresh
create or replace function public.touch_updated_at()
  returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_content_touch on public.content;
create trigger trg_content_touch before update on public.content
  for each row execute function public.touch_updated_at();

-- Link/SEO preservation: old Firestore/khaitri slugs → content id.
-- khaitri slug historically `<order>-<title>`; redirects keep shared links + SEO alive.
create table if not exists public.slug_redirects (
  old_slug   text primary key,
  content_id text not null references public.content(id) on delete cascade,
  lang       text check (lang in ('vi','en')),
  created_at timestamptz not null default now()
);

create index if not exists idx_slug_redirects_content on public.slug_redirects(content_id);
