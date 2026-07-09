# Phase 01 — Supabase Project + Postgres Schema + RLS + FTS/pgvector

## Context Links
- Brainstorm §2, §5: ../reports/brainstorm-260611-1244-supabase-db-auth-migration-reading-analytics.md
- SP1 D1 schema (source of column shapes): ../../workers/api/migrations/0001_init.sql
- Firestore collections: ../../CLAUDE.md (Firestore Collections table)

## Overview
- **Priority:** P1 (foundation — blocks 02, 03, 04, 05)
- **Status:** pending
- **Description:** Provision Supabase Cloud (free tier), author the full Postgres schema as versioned SQL migrations, enable `pgvector` + `pg_trgm`, add `tsvector` FTS columns, and write RLS policies for the 2 auth planes (humans via Supabase Auth role; agents bypass via service_role in Worker).

## Key Insights
- 1 Postgres replaces SP1's 3 stores (Firestore canonical + D1 FTS + Vectorize). Drop cron reconcile entirely.
- Content unified by `type` column (article/story/khaitri/teaching/practice) — mirrors SP1 D1 `content` table so the Worker write path stays close to existing code.
- Old Firestore doc IDs are TEXT (auto-id strings). Keep PK as `id TEXT` (NOT uuid) to preserve IDs without remap — decision locked (keep+map old IDs).
- VI accent-insensitive search: use `unaccent()` + tsvector with a custom config, OR `pg_trgm` on unaccented columns. D1 used `remove_diacritics 2`; Postgres equivalent = `unaccent` extension.
- RLS default-deny. Public read = `status='published'` (or approved donations). Admin write gated on `profiles.role='admin'`. Agent writes NEVER hit RLS — they go through Worker service_role.

## Requirements
**Functional**
- Tables: `content`, `categories`, `content_categories`, `comments`, `donations`, `donation_contacts`, `contacts`, `profiles`, `translations`, `settings`, `teachings`/`practices` (or folded into `content`), `api_keys`, `agent_audit_log`, `reading_events`, `slug_redirects`.
- FTS: tsvector generated columns on content title/summary/body (VI+EN), GIN indexed, unaccented.
- pgvector: `content.embedding vector(768)` + ivfflat/hnsw index (nullable — backfilled later).
- RLS enabled on every table with explicit policies.

**Non-functional**
- Each migration file <200 lines; split by concern (`0001_extensions.sql`, `0002_content.sql`, `0003_taxonomy.sql`, `0004_engagement.sql`, `0005_agent.sql`, `0006_analytics.sql`, `0007_rls.sql`, `0008_fts_vector.sql`).
- Idempotent-ish (`create table if not exists`, `create extension if not exists`).
- Free-tier safe (no paid-only extensions).

## Architecture
```
Supabase Cloud project (free tier)
├── extensions: pgvector, unaccent, pg_trgm, pgcrypto
├── auth.users (managed by Supabase Auth — phase 03)
├── public.profiles (id → auth.users.id, role, display_name, bio)
├── public.content (id TEXT pk, type, status, vi_*, en_*, slug_vi, slug_en,
│                   category_id, source_ref, embedding, fts_vi, fts_en, ts...)
├── public.categories (id, parent_id, vi_name, en_name, slug, "order")
├── public.content_categories (content_id, category_id)  -- m:n optional
├── public.comments / donations / donation_contacts / contacts
├── public.api_keys / agent_audit_log              -- agent plane (phase 05)
├── public.reading_events                          -- micro analytics (phase 06)
├── public.slug_redirects (old_slug → content_id)  -- link/SEO preservation
└── RLS policies (default deny; published-read; admin-write; service_role bypass)
```
**Data flow:** SQL migrations applied via Supabase CLI (`supabase db push`) against the cloud project; schema is the contract all later phases code against.

## Related Code Files
**Create**
- `supabase/config.toml` (Supabase CLI project link)
- `supabase/migrations/0001_extensions.sql`
- `supabase/migrations/0002_content.sql`
- `supabase/migrations/0003_taxonomy.sql`
- `supabase/migrations/0004_engagement.sql`
- `supabase/migrations/0005_agent.sql`
- `supabase/migrations/0006_analytics.sql`
- `supabase/migrations/0007_rls.sql`
- `supabase/migrations/0008_fts_vector.sql`
- `supabase/seed.sql` (translations + settings defaults only; content comes from phase-02)
- `.env.example` additions: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (anon only; service_role NEVER in repo/env client)

**Modify** — none yet (data layer untouched until phase-04)
**Delete** — none

## Implementation Steps
1. Create Supabase Cloud project (free tier), region nearest to VN/AU users. Record project ref + URL + anon key; store service_role in a vault (NOT repo).
2. `supabase init` + link project; add `supabase/` to repo (migrations are code).
3. `0001_extensions.sql`: `create extension if not exists vector, unaccent, pg_trgm, pgcrypto`.
4. `0002_content.sql`: `content` table (id TEXT pk, type CHECK, status CHECK, bilingual cols, slug_vi/slug_en UNIQUE-where-not-null, category_id FK, source_ref, content_hash, created_at/updated_at, created_by). Indexes: type+status, slugs, content_hash.
5. `0003_taxonomy.sql`: `categories` (id, parent_id self-FK, vi_name, en_name, slug, "order"), `content_categories` join. (Detailed CRUD/migration = phase-07.)
6. `0004_engagement.sql`: `comments`, `donations`, `donation_contacts`, `contacts` — match current Firestore field shapes + status enums.
7. `0005_agent.sql`: `api_keys` (key_hash UNIQUE, agent_name, scopes, revoked_at, last_used_at), `agent_audit_log` — port from D1 0001_init.sql shapes.
8. `0006_analytics.sql`: `reading_events` (id, content_id FK, session_id, para_index, dwell_ms, reached_end, ts) + index on (content_id, para_index). (Consumer = phase-06.)
9. `0008_fts_vector.sql`: generated tsvector columns (e.g. `fts_vi tsvector generated always as (to_tsvector('simple', unaccent(coalesce(vi_title,'')||' '||coalesce(vi_body,'')))) stored`), GIN indexes; `embedding vector(768)` + hnsw index. Add `slug_redirects` here or in 0002.
10. `0007_rls.sql`: enable RLS all tables; policies — public SELECT on `content` where status='published'; categories/translations/settings public SELECT; comments public INSERT + SELECT where status visible; donations public INSERT (pending) + SELECT where status='approved'; profiles self-read + admin-read; admin-write policies referencing `(select role from profiles where id = auth.uid()) = 'admin'`; reading_events public INSERT only (no SELECT). service_role bypasses RLS by design.
11. `supabase db push`; verify in Studio; run `select * from pg_extension`.
12. Smoke-test RLS with anon key (published read works, draft hidden, write denied).

## Todo List
- [x] Provision Supabase Cloud project (free tier) + record refs — project `dzctvmrlsxwkcuidsqzk`, region ap-southeast-1 (Singapore)
- [x] Push `supabase/` migrations to cloud — applied via psql single-transaction (pooler); CLI `init`/config.toml optional (migrations are source of truth)
- [x] Write 8 migration files (<200 lines each) — done, all <100 lines
- [x] Enable extensions (vector, unaccent, pg_trgm, pgcrypto) — verified in local pgvector container
- [x] tsvector generated cols + GIN indexes (VI accent-insensitive verified) — "bat tu"→"Bất Tử" passes
- [x] pgvector column + hnsw index — `content.embedding vector(768)` + `idx_content_embedding`
- [x] RLS policies for all tables (default deny + published-read + admin-write) — 14/14 tables, anon-tested
- [x] `slug_redirects` table for link/SEO preservation
- [x] `supabase db push` + verify — **PUSHED TO CLOUD + verified** (2026-07-09): 14 tables, RLS 14/14, 4 extensions, VI FTS + anon RLS pass on real project.

**Validation (local Docker pgvector:pg16, then real cloud 2026-07-09):** all 8 migrations + seed apply clean; VI accent-insensitive FTS ("bat tu"→"Bất Tử", "tuyen tung"→"tuyến tùng"); anon sees published only, drafts hidden, content INSERT denied, donation_contacts PII read denied. **Fix applied:** `is_admin()` → `SECURITY DEFINER` + pinned `search_path` (was RLS-recursion/permission-deny footgun on `profiles`). Creds in gitignored `.env` (`SUPABASE_DB_URL`, secret key); Đăng should rotate secret key later (was in chat).

## Success Criteria
- `supabase db push` applies cleanly to cloud project.
- Anon key: SELECT on published content works; draft rows invisible; INSERT denied.
- VI unaccented FTS query returns correct rows ("bat tu" matches "Bất Tử").
- `embedding` column + vector index exist; nullable (no data yet).
- service_role can read/write everything (verified via SQL editor).

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| RLS misconfig leaks drafts/PII | Med | High | Default-deny first; explicit allow per table; anon smoke test before phase-04 |
| VI accent search wrong without unaccent in tsvector config | Med | Med | Test "bat tu"/"Bất Tử" parity in step 12; document config choice |
| Free-tier row/size caps hit during full content load | Low | Med | Estimate row counts in phase-02 dry-run; content body is small text |
| id TEXT vs uuid mismatch breaks FKs | Low | High | Standardize all content-referencing FKs as TEXT to match content.id |

## Security Considerations
- `service_role` key: store ONLY in Worker secret (phase-05) + local vault for migrations. NEVER in `.env`, repo, or any client bundle.
- `.env.example` exposes anon key only.
- `donation_contacts` (PII): RLS = no anon SELECT; admin-only read.
- RLS is the security boundary for the human plane — no table without an explicit policy.

## Next Steps
- Blocks phase-02 (import target), phase-03 (auth + role tables), phase-04 (client codes to this schema), phase-05 (agent tables + service_role).
