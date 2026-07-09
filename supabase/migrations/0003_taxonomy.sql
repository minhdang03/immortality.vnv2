-- 0003_taxonomy.sql — relational categories (parent-child) + content link.
-- Replaces Firestore `topics`. Full CRUD/admin UI + topics→categories migration = phase-07.
-- Here: just the schema so content.category_id FK resolves.

create table if not exists public.categories (
  id         text primary key,                       -- keep old topic id where migrated (phase-07)
  parent_id  text references public.categories(id) on delete set null,
  vi_name    text not null,
  en_name    text,
  slug       text unique,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_categories_parent on public.categories(parent_id);

-- content.category_id → categories.id (added now that categories exists).
alter table public.content
  drop constraint if exists fk_content_category;
alter table public.content
  add constraint fk_content_category
  foreign key (category_id) references public.categories(id) on delete set null;

create index if not exists idx_content_category on public.content(category_id)
  where category_id is not null;

-- Optional m:n (a content in multiple categories). Primary category stays content.category_id.
create table if not exists public.content_categories (
  content_id  text not null references public.content(id) on delete cascade,
  category_id text not null references public.categories(id) on delete cascade,
  primary key (content_id, category_id)
);

create index if not exists idx_cc_category on public.content_categories(category_id);

-- Site config tables (public read, admin write). i18n strings + site settings.
create table if not exists public.translations (
  lang       text not null check (lang in ('vi','en')),
  key        text not null,
  value      text,
  primary key (lang, key)
);

create table if not exists public.settings (
  key        text primary key,                       -- theme, nav, home_cards, donation_channels, ...
  value      jsonb,
  updated_at timestamptz not null default now()
);
