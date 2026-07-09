# Phase 02 — Data Migration Scripts (Firestore → Postgres)

## Context Links
- Brainstorm §5, §7 (1-2d estimate): ../reports/brainstorm-260611-1244-supabase-db-auth-migration-reading-analytics.md
- Schema target: phase-01-supabase-schema-rls.md
- Admin SDK key location: ../../CLAUDE.md (Environment Variables — `src/*-firebase-adminsdk-*.json`)
- Existing seed/migration scripts: ../../scripts/

## Overview
- **Priority:** P1 (blocks 04, 07, 08)
- **Status:** pending
- **Description:** Build idempotent, dry-run-capable Node scripts that export each Firestore collection and import into Postgres, **preserving old doc IDs and slugs** and writing `slug_redirects` for any slug changes. Firestore stays the source of truth until cutover; this migration is re-runnable.

## Key Insights
- Decision locked: keep + map old IDs/slugs (don't break shared links/SEO). PK stays the Firestore doc id string.
- Idempotency via `upsert` on `id` (Postgres `insert ... on conflict (id) do update`). Re-running = converge, not duplicate.
- `serverTimestamp()` Firestore fields → ISO strings; null-safe defaults.
- Bilingual shape: Firestore docs nest `{ vi: {...}, en: {...} }` or flat fields (varies by collection — script must read actual shape per collection, not assume).
- Migration runs MULTIPLE times: initial bulk, then a final delta right before cutover (phase-08) to catch content added during the rewrite.

## Requirements
**Functional**
- One transform module per collection: articles, stories, khaitri, teachings, practices, topics (→ staged for phase-07), comments, donations, donation_contacts, contacts, translations, settings, btd_knowledge.
- `--dry-run` prints counts + sample rows + slug-collision report; writes nothing.
- `--collection <name>` to migrate one; default = all.
- `--since <iso>` delta mode for the pre-cutover top-up.
- Slug map: detect collisions; on change, write `slug_redirects(old_slug, content_id, type)`.
- Output a migration report: per-collection counts (source vs imported), skipped, errors.

**Non-functional**
- Use service_role (Postgres direct or supabase-js admin) — bypasses RLS.
- Each script file <200 lines; shared helpers in `scripts/migrate/_lib/`.
- No data loss: never DELETE in Firestore; import-only.

## Architecture
```
Firestore (admin SDK read)  ──►  transform per-collection  ──►  Postgres upsert (service_role)
                                       │
                                       ├─ id preserved (Firestore doc id = content.id)
                                       ├─ slug preserved; on change → slug_redirects
                                       └─ dry-run: counts + collisions, no writes
Re-runnable: insert ... on conflict (id) do update
Delta: --since <iso> top-up right before phase-08 cutover
```
**Data flow:** read collection → map fields to content/categories/comments/... rows → validate → upsert → record in report.

## Related Code Files
**Create**
- `scripts/migrate/export-firestore.mjs` (admin SDK read → JSON dump per collection, optional snapshot)
- `scripts/migrate/import-postgres.mjs` (orchestrator: --dry-run, --collection, --since)
- `scripts/migrate/_lib/supabase-admin.mjs` (service_role client)
- `scripts/migrate/_lib/slug-map.mjs` (collision detect + slug_redirects writer)
- `scripts/migrate/transforms/content-transform.mjs` (articles/stories/khaitri/teachings/practices → content)
- `scripts/migrate/transforms/engagement-transform.mjs` (comments/donations/donation_contacts/contacts)
- `scripts/migrate/transforms/config-transform.mjs` (translations/settings)
- `scripts/migrate/transforms/topics-stage.mjs` (topics → staged categories input for phase-07)
- `scripts/migrate/README.md` (run order, env, dry-run usage)

**Modify** — none (read-only on Firestore)
**Delete** — none

## Implementation Steps
1. Build `supabase-admin.mjs` using service_role (env var, never committed) + Firestore admin SDK init (reuse existing key path).
2. `export-firestore.mjs`: dump each collection to `scripts/migrate/.dump/<collection>.json` (gitignored) for inspect + offline transform.
3. Write `content-transform.mjs`: normalize each content type to the unified `content` row; preserve `id`; compute `content_hash`; map slugs; set `type`, `status` (default published for existing, since they're live).
4. Engagement + config transforms: map field-by-field; preserve doc ids; map statuses to CHECK enums.
5. `slug-map.mjs`: for each content row, if a canonical slug rule changes the slug, record old→new in `slug_redirects`.
6. `import-postgres.mjs`: orchestrate; `--dry-run` first prints per-collection counts + collisions; real run does `on conflict do update`.
7. Run full dry-run; review collision + count report with Đăng.
8. Run real import into Supabase; verify counts match source (± expected skips).
9. Build `--since` delta path; document running it in phase-08 just before cutover.
10. Add `scripts/migrate/.dump/` + service_role env to `.gitignore`.

## Todo List
- [ ] service_role + Firestore admin clients (`_lib/supabase-admin.mjs`)
- [ ] `export-firestore.mjs` per-collection dump
- [ ] content-transform (5 types → content, ids + slugs preserved)
- [ ] engagement-transform (comments/donations/contacts)
- [ ] config-transform (translations/settings)
- [ ] topics-stage (topics → categories input, handed to phase-07)
- [ ] slug-map + slug_redirects writer
- [ ] `import-postgres.mjs` with --dry-run / --collection / --since
- [ ] Full dry-run report reviewed; real import; counts verified
- [ ] `.gitignore` dump dir + service_role; README run order

## Success Criteria
- Dry-run prints accurate per-collection source vs target counts + zero unexpected collisions.
- Real import: every Firestore doc id present in Postgres with same id.
- Every existing slug resolves (direct or via slug_redirects).
- Re-running import is a no-op convergence (no duplicates, no errors).
- `--since` delta imports only docs changed after timestamp.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Heterogeneous Firestore shapes per collection break transform | High | Med | Read actual doc shape per collection; per-collection transform; dry-run sample output |
| Slug collisions silently overwrite content | Med | High | slug-map collision report blocks real run until reviewed |
| Content added during rewrite missed at cutover | High | High | `--since` delta top-up immediately before phase-08 cutover |
| Timestamp/format drift (serverTimestamp → ISO) | Med | Low | Centralized date coercion helper; null-safe defaults |
| PII (donation_contacts) imported then exposed | Low | High | RLS already locks it (phase-01); verify no anon SELECT post-import |

## Security Considerations
- service_role used only in these local scripts (and Worker later) — never in client.
- `.dump/` JSON contains PII (donation_contacts, contacts) → gitignored; delete after migration.
- No Firestore writes/deletes — rollback is trivial (Firestore untouched).

## Next Steps
- Blocks phase-04 (hooks read migrated data), phase-07 (topics→categories), phase-08 (delta top-up + parity).
- Depends on phase-01 (schema must exist).
