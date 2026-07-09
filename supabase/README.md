# Supabase — Bất Tử Đạo migration (phase-01)

Postgres schema as versioned migrations. Firestore stays LIVE until phase-08 cutover — these migrations only build the new Supabase side; they do NOT touch prod.

## Migrations (run in order)
| File | Builds |
|---|---|
| `0001_extensions.sql` | vector, unaccent, pg_trgm, pgcrypto + `immutable_unaccent()` |
| `0002_content.sql` | unified `content` table (article+khaitri+story+teaching+practice, by `type`) + `slug_redirects` |
| `0003_taxonomy.sql` | `categories` (parent-child) + `content_categories` + `translations` + `settings` |
| `0004_engagement.sql` | `comments`, `donations`, `donation_contacts`, `contacts` |
| `0005_agent.sql` | `profiles` (roles), `api_keys`, `agent_audit_log` + `is_admin()` |
| `0006_analytics.sql` | `reading_events` (per-paragraph) |
| `0007_rls.sql` | RLS: default-deny + published-read + admin-write; PII lockdown |
| `0008_fts_vector.sql` | VI/EN accent-insensitive tsvector (GIN) + `embedding vector(768)` (hnsw) + `search_content()` |

## Apply (needs Supabase project + creds — Đăng provides)
```bash
# 1. one-time
npm i -g supabase          # or: brew install supabase/tap/supabase
cd apps/immortality-vn
supabase init              # generates supabase/config.toml
supabase link --project-ref <PROJECT_REF>

# 2. push schema + seed
supabase db push
psql "$SUPABASE_DB_URL" -f supabase/seed.sql   # or supabase db reset for local

# 3. verify
#   - select * from pg_extension;   (vector, unaccent, pg_trgm, pgcrypto present)
#   - anon key: published content SELECT works; draft rows invisible; INSERT denied
#   - select * from search_content('bat tu');   → matches "Bất Tử" (accent-insensitive)
```

## Secrets
- `.env` (gitignored): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (anon only).
- `service_role`: NEVER in repo/.env/client. Worker secret (phase-05) + local vault for `db push` only.

## Key decisions baked in
- `content.id` = **TEXT** (original Firestore doc id, no remap — shared links/SEO preserved).
- `articles` + `khaitri` = one `content` table by `type`; `/articles` `/khaitri` stay type-filtered views; khaitri slug `<order>-<title>` resolves via `slug_redirects`.
- Agents bypass RLS via Worker `service_role`; humans gated by `profiles.role='admin'` (RLS).
