# Phase 05 — Database Hygiene

## Context Links

- Plan overview: [plan.md](plan.md)
- Brainstorm DB section: [../reports/brainstorm-260515-2130-febe-redesign.md](../reports/brainstorm-260515-2130-febe-redesign.md) — Section "Database hiện tại"
- Firestore rules: `firestore.rules` (231 lines, 17 collections + 1 nested)
- Web hooks: `apps/web/src/hooks/` (19 files, 49 query ops)
- Seed scripts: `scripts/*.{cjs,py}` (mix Node + Python)
- Firebase config: `firebase.json` (has `firestore.rules` block, but historical caveat in CLAUDE.md says manual deploy)

## Overview

- **Priority:** P1
- **Status:** pending
- **Duration:** Tuần 5 (5-7 ngày, can run parallel với Phase 1-4)
- **Owner:** Đăng

**Mục tiêu:** Fix 10 vấn đề Firestore hygiene (rules deploy, indexes version control, comments schema, validation, backup, TTL, PII, AI billing atomicity, seed consolidation). KHÔNG migrate DB — chỉ clean up existing Firestore.

## Key Insights

- Phase này độc lập với compute migration — có thể chạy song song bất kỳ phase nào sau Phase 1.
- 10 issues identified — em ưu tiên theo severity Critical → High → Medium → Low.
- KHÔNG touch Firestore rules siết admin claim TRONG phase này — đó là Phase 6 cùng cleanup. Phase 5 chỉ chuẩn bị (grant claim, test emulator).
- Indexes hiện đang manage qua Console UI — generate `firestore.indexes.json` từ live state via `firebase firestore:indexes`.

## Requirements

### Functional

- `firestore.indexes.json` checked into git, deployed via CI
- `firestore.rules` deploy wired vào CI (CLI `firebase deploy --only firestore:rules`)
- Comments schema canonical (1 location, not 2)
- Zod schemas validate 5 write-heavy collections before write
- Daily backup Firestore → R2 working
- TTL cleanup `_sync_logs` + `agent_log` (> 30 days)
- PII retention policy documented for `donation_contacts` + `contacts`
- `btd_ai_usage` atomic increment (no race)
- Seed scripts consolidated (1 toolchain)
- Admin custom claim infrastructure ready (don't flip rules yet — Phase 6)

### Non-functional

- Backup file size < 500MB (current data ~50MB estimated)
- Backup completion < 5 min daily
- Validation overhead < 50ms per write
- Zero data loss during schema migration

## Architecture

### Comments schema decision

**Current state (split):**
```
/articles/{articleId}/comments/{commentId}   (nested — used by some hooks)
/comments/{commentId}                         (top-level — used by other hooks)
```

**Decision:** consolidate to `/comments/{commentId}` top-level with field `articleId`.

**Rationale:**
- Easier admin moderation (query all comments by status across articles)
- Easier user "my comments" view
- Easier full-text search later
- Cost-neutral (Firestore charges per read regardless of nesting)

**Migration:** script reads all `articles/{id}/comments/{cid}` → writes to `/comments/{cid}` with `articleId` field → delete nested after verify.

### Backup architecture

```
Daily cron 0 4 * * * UTC (11:00 VN)
  │
  ▼
workers/notion (extend existing cron)
  │
  ├── For each collection: read all docs via Firestore REST
  ├── Export JSON: { "articles": [...], "stories": [...], ... }
  ├── Compress gzip
  ├── PUT R2: btd/backups/firestore/{YYYY-MM-DD}.json.gz
  └── Keep 30 days retention (auto-delete older)
```

## Related Code Files

### Modify
- `firebase.json` — confirm `firestore.rules` + `firestore.indexes` blocks
- `apps/web/src/hooks/useComments.js` — point to top-level `/comments` only
- `firestore.rules` — preserve current admin check (don't tighten yet)
- `apps/web/package.json` — optionally drop Python seed scripts từ CI
- `workers/notion/wrangler.toml` — add backup cron `0 4 * * *`

### Create
- `firestore.indexes.json` — generate from Console state
- `packages/shared/src/schemas/` — Zod schemas:
  - `article.schema.ts`
  - `comment.schema.ts`
  - `donation.schema.ts`
  - `contact.schema.ts`
  - `newsletter-signup.schema.ts`
- `scripts/migrate-comments-to-toplevel.cjs` — one-time migration
- `scripts/grant-admin-claim.cjs` — set custom claim for admin UIDs
- `scripts/cleanup-old-logs.cjs` — TTL cleanup runner (or Worker cron)
- `workers/notion/src/backup.ts` — daily Firestore → R2 backup
- `docs/firebase-snapshot.md` — schema + config exit-ramp doc
- `docs/pii-retention-policy.md` — donation_contacts + contacts retention rules

### Delete (after consolidation)
- Python seed scripts (`scripts/*.py`) — keep Node `.cjs` versions
- OR vice versa, anh decide which toolchain to retain

## Implementation Steps

### Day 1: Indexes + rules CI
1. `firebase firestore:indexes` → dump current indexes
2. Save output to `firestore.indexes.json`
3. Verify `firebase.json` has `"firestore": {"rules": "firestore.rules", "indexes": "firestore.indexes.json"}`
4. Add GitHub Action step:
   ```yaml
   - name: Deploy Firestore rules + indexes
     run: firebase deploy --only firestore:rules,firestore:indexes --token ${{ secrets.FIREBASE_TOKEN }}
   ```
5. Test: change a rule, push, verify CI deploys

### Day 2: Zod schemas
1. Create `packages/shared/src/schemas/` for 5 collections
2. Each schema: required fields, types, max lengths, regex (slugs, emails)
3. Update web hooks to validate before `addDoc` / `updateDoc`
4. Update Workers `/v1/*` routes to validate before Firestore write
5. Unit tests for each schema

### Day 3: Comments schema migration
1. Backup current state to R2 manually first
2. Run `scripts/migrate-comments-to-toplevel.cjs` (dry-run mode first)
3. Verify dry-run output — count matches
4. Real run — writes to `/comments/{id}`, doesn't delete nested yet
5. Update web hooks (`useComments.js`) to read from top-level only
6. Deploy web — verify works
7. After 7 days stable → delete nested `/articles/{id}/comments`

### Day 4: Backup cron
1. Extend `workers/notion` with backup module
2. Implement `workers/notion/src/backup.ts`:
   - Read each collection via Firestore REST
   - Serialize to JSON
   - gzip
   - PUT to R2 `btd/backups/firestore/{date}.json.gz`
3. Add cron trigger `0 4 * * *`
4. Test manual trigger → verify file in R2
5. Test restore procedure (read file, parse, can hypothetically re-import)

### Day 5: TTL cleanup
1. Create `workers/notion/src/cleanup-logs.ts` — runs weekly cron `0 5 * * 0`
2. Delete `_sync_logs` where `createdAt < now - 30d`
3. Delete `agent_log` where `timestamp < now - 30d`
4. Optionally: `btd_ai_usage` aggregate to monthly summary, delete raw daily after 90d

### Day 6: Admin claim infrastructure (NOT flipping rules)
1. Create `scripts/grant-admin-claim.cjs`:
   ```js
   admin.auth().setCustomUserClaims(uid, { admin: true })
   ```
2. Get anh's UID from Firebase Auth
3. Grant claim
4. Test on Firebase emulator: rules with `request.auth.token.admin == true` work
5. **DO NOT** deploy modified rules yet — that's Phase 6
6. Document procedure in `docs/admin-grant-procedure.md`

### Day 7: PII + seed consolidation
1. Audit `donation_contacts` schema — list PII fields (email, phone, realName)
2. Decision matrix:
   - Retention: forever? auto-delete after X months?
   - Encryption: plain (current) or app-level encrypt?
   - Export: GDPR-style endpoint (if user requests)?
   - Delete: admin tool to delete by donor request
3. Document in `docs/pii-retention-policy.md`
4. Pick Node OR Python for seeds — drop the other
5. Update `scripts/seed.sh` if needed

### Day 8: Atomic AI billing
1. Audit current `btd_ai_usage` write pattern (Phase 2 should have done this — verify)
2. Ensure all writes use `runTransaction` with read-then-write
3. Idempotency key prevents double-charge
4. Add monthly reconcile script comparing `btd_ai_usage` aggregate vs payment provider records

## Todo List

- [ ] `firestore.indexes.json` generated + committed
- [ ] CI deploys rules + indexes on push
- [ ] 5 Zod schemas created in `packages/shared/src/schemas/`
- [ ] Web hooks use Zod validate before write
- [ ] Workers `/v1/*` use Zod validate
- [ ] Comments migration script (dry-run + real)
- [ ] Comments hooks point to top-level only
- [ ] Daily backup Worker live, 3 backups verified in R2
- [ ] Restore procedure tested
- [ ] TTL cleanup script + weekly cron
- [ ] Admin custom claim infrastructure (script + tested on emulator)
- [ ] PII retention policy documented
- [ ] Seed scripts consolidated (1 toolchain)
- [ ] AI billing atomic transactions verified
- [ ] Monthly reconcile script

## Success Criteria

- [ ] All Firestore rules + indexes version controlled, CI-deployed
- [ ] 5 collections have schema validation at write site
- [ ] Comments unified to top-level, no orphan nested data
- [ ] 7 consecutive daily backups in R2
- [ ] `_sync_logs` + `agent_log` not growing unbounded
- [ ] Admin claim granted to anh's UID, ready for Phase 6 rule flip
- [ ] PII retention policy documented + reviewed
- [ ] No race condition in AI billing (audit 10 transactions)

## Risk Assessment

| # | Risk | Mitigation |
|---|---|---|
| P5-R1 | Comments migration script bug → data loss | Dry-run first, manual backup before real run, keep nested 7 days |
| P5-R2 | Zod validation breaks existing write flows | Roll out per-collection; warn-only mode first 24h, then enforce |
| P5-R3 | Backup script reads too much → Firestore daily quota exhausted | Run at 4am UTC (low traffic), single full read = ~50K reads — within free 50K/day |
| P5-R4 | Admin claim grant mistakes — wrong UID gets admin | Manual confirm UID with anh, log all grants, revocable via same script |
| P5-R5 | Schema migration drift — old data violates new schema | Validate on write only, not on read; backfill optional later |
| P5-R6 | Indexes diff between Console and committed file | One-time reconcile, then enforce CI as source of truth |

## Security Considerations

- Backup files in R2 contain ALL Firestore data including PII (donation_contacts) — bucket private, signed URL only for admin
- Encrypt backups at-rest? CF R2 encrypts at-rest by default
- Backup file naming includes date — easy to find for incident response
- Admin claim script audit-logged (write to `admins` collection with timestamp + granter UID)
- Validation prevents script-injected fields (vd: `isAdmin: true` slipped into article write)

## Next Steps

- **Blocks:** Phase 6 (rules tighten depends on admin claim grant + tested)
- **Unblocks:** Future migrations (Postgres etc.) have schema source of truth
- **Parallel:** Can run alongside Phase 1-4

## Open Questions

1. Comments canonical schema decision — top-level (em recommend) hay nested?
2. PII retention: indefinite hay X months auto-delete?
3. Seed scripts toolchain: Node `.cjs` (more files) hay Python `.py`?
4. Backup target R2 only hay external (Backblaze B2) for vendor-redundant?
5. Daily backup ok hay realtime (Firestore export-import API)?
6. Anh UID (Firebase Auth) để grant admin claim?
