# Phase 06 — Cleanup + Security Hardening

## Context Links

- Plan overview: [plan.md](plan.md)
- Phase 1-5 (all must be stable before this phase)
- Files to retire: `functions/`, `api/*.js` (Vercel), `vercel.json`, parts of `firebase.json`
- Firestore rules current state: `firestore.rules`
- Admin claim infrastructure: Phase 5 prepared
- Memory ref: `feedback_ask_before_destructive_security_changes` — collect credentials BEFORE lockout-capable changes

## Overview

- **Priority:** P0 (security) + P2 (cleanup)
- **Status:** pending (depends on Phase 1-5 stable 14+ days each)
- **Duration:** Tuần 5-6 (5-7 ngày)
- **Owner:** Đăng (anh MUST confirm before destructive ops)

**Mục tiêu:** Retire old infrastructure (Firebase Functions ogRenderer, Vercel project, Vercel `/api/*` source files, legacy `vercel.json`), tighten Firestore rules với admin custom claim, audit secrets, document final architecture in `docs/`.

**[CRITICAL]:** Per memory rule, anh MUST grant admin custom claim TRƯỚC khi flip rules. Phase 5 đã prep, Phase 6 chỉ execute flip after confirm.

## Key Insights

- Retire = delete. Once retired, recovery is "redeploy from git history" — keep git tags before deletion.
- Vercel project deletion ≠ Vercel `/api/*.js` source deletion. Project deletion stops auto-deploy; source delete cleans repo.
- Firestore rule tighten — must coordinate với grant claim. Race condition: rules deployed before claim = anh locked out.
- Security hardening can break things — every change side-by-side với rollback plan.

## Requirements

### Functional

- Firebase Functions deployment retired (no `ogRenderer`)
- Vercel project paused → deleted (after 14 days)
- `vercel.json` deleted from repo
- `api/*.js` source files deleted (Vercel serverless)
- `functions/` directory deleted (except keep `functions/spa.html` if Phase 3 incomplete)
- `firebase.json` cleaned (drop `functions` block, keep `firestore` block)
- Firestore rules tightened: `isAdmin()` checks `request.auth.token.admin == true` (not `auth != null`)
- All admin endpoints in Workers use same claim check
- Admin SDK key moved `src/` → `secrets/`
- All secrets rotated (touched anywhere in 3 months)
- CLAUDE.md updated to reflect new architecture
- `docs/system-architecture.md` + `docs/codebase-summary.md` updated

### Non-functional

- Zero downtime during retire (services already replaced)
- Rollback plan documented for each delete op
- Git tags before each major deletion: `pre-retire-firebase-functions`, `pre-retire-vercel`

## Architecture

### Final state diagram

```
PRODUCTION ARCHITECTURE (post Phase 6):

DNS
├── battudao.com → CF Pages
├── www.battudao.com → CF Pages (redirect to apex)
├── immortality.vn → CF Pages
├── api.battudao.com → Workers (workers/api)
└── rt.battudao.com → Workers (workers/realtime)

COMPUTE
├── CF Pages (web SPA)
└── CF Workers (3 services: api, realtime, notion-cron)

STATE
├── Firebase Auth (50K MAU free)
├── Firestore (20K writes/day free)
│   ├── Rules: enforced via CI deploy
│   ├── Indexes: version controlled
│   └── Backup: daily → R2
├── Firebase FCM (push)
└── R2 (media + backups, btd/ prefix)

CACHE
└── Cloudflare KV (JWKS, OG, rate-limit counters)

RETIRED:
✗ Firebase Hosting
✗ Firebase Functions (ogRenderer)
✗ Vercel project
✗ Vercel /api/*.js
```

### Firestore rules diff

```diff
- function isAdmin() {
-   return request.auth != null;
- }
+ function isAdmin() {
+   return request.auth != null && request.auth.token.admin == true;
+ }
```

All 21 `match` rules using `isAdmin()` inherit fix automatically.

## Related Code Files

### Modify
- `firestore.rules` — `isAdmin()` function body
- `firebase.json` — remove `"functions"` block, keep `"firestore"` block
- `apps/web/package.json` — remove `cp dist/index.html ../../functions/spa.html` from build script
- `CLAUDE.md` — update "Known caveats" section (mark fixed: admin loose, rules manual deploy, OG duplicate)
- `docs/system-architecture.md` — full rewrite to reflect new architecture
- `docs/codebase-summary.md` — update file inventory
- `.gitignore` — confirm `secrets/`, `.env*` still ignored

### Delete
- `functions/index.js`
- `functions/spa.html`
- `functions/package.json`, `functions/package-lock.json`
- `functions/node_modules/` (already gitignored)
- `functions/scripts/` (if exists)
- `api/og.js`
- `api/chat.js`
- `api/upload-file.js`
- `api/upload-from-url.js`
- `api/agent-spec.js` (if Vercel-specific)
- `api/articles/` (if Vercel-specific)
- `api/khaitri/` (if Vercel-specific)
- `api/_lib/` (Vercel-specific helpers)
- `vercel.json`
- `.vercel/` directory
- Python OR Node seed scripts (whichever dropped in Phase 5)

### Create
- `docs/system-architecture.md` (final post-redesign version)
- `docs/firebase-snapshot.md` (exit ramp doc)
- `docs/admin-grant-procedure.md` (already Phase 5, ensure committed)
- `docs/pii-retention-policy.md` (already Phase 5, ensure committed)
- `docs/secret-rotation-log.md` (audit trail)

### Move
- `apps/web/src/immortalityvn-firebase-adminsdk-*.json` → `secrets/` (gitignored)

## Implementation Steps

### Day 1: Pre-flight + Git tags
1. Verify Phase 1-5 all stable 14+ days
2. Run final sanity checks:
   - `api.battudao.com/og/article/test` works
   - Mobile RN dev client connects to new API
   - battudao.com on CF Pages 14 days no incident
   - Daily backup R2 has 7+ files
3. Git tags:
   ```bash
   git tag pre-retire-firebase-functions
   git tag pre-retire-vercel
   git tag pre-rules-tighten
   git push --tags
   ```

### Day 2: Admin claim verification
1. Confirm anh UID via Firebase Console
2. Verify custom claim `admin=true` set (from Phase 5)
3. Run on Firebase emulator:
   ```bash
   firebase emulators:start --only firestore
   # Test rule with anh's token + claim → should allow admin writes
   # Test rule WITHOUT claim → should deny
   ```
4. Test fail case: token without claim CANNOT write `articles`, `khaitri`, etc.

### Day 3: Rules tighten (CRITICAL — anh present)
1. **anh-present session** (per memory rule: ask before destructive security changes)
2. Modify `firestore.rules` `isAdmin()` function
3. Deploy to staging Firebase project first (if separate; if not, skip)
4. Test anh's login can still do admin ops (publish article, edit settings)
5. If staging ok → deploy production:
   ```bash
   firebase deploy --only firestore:rules
   ```
6. Immediately test anh's session — still admin? Test secondary user (no claim) — denied?
7. Watch error rate 30 min — any 403 spike = rollback

**Rollback procedure:**
```bash
git checkout pre-rules-tighten firestore.rules
firebase deploy --only firestore:rules
```

### Day 4: Retire Firebase Functions
1. Verify all crawler traffic going to Worker (CF Pages middleware handles it)
2. Check Firebase Functions logs 7 days — confirm < 1 req/day going through
3. Delete deployment:
   ```bash
   firebase functions:delete ogRenderer
   ```
4. Delete source files:
   ```bash
   rm -rf functions/
   ```
5. Edit `firebase.json` — remove `"functions"` block
6. Edit `apps/web/package.json` — drop `cp dist/index.html ../../functions/spa.html`
7. Commit + push
8. Verify build still works

### Day 5: Retire Vercel
1. Vercel Dashboard → Project Settings → Pause project (don't delete yet)
2. Wait 24h, ensure no traffic
3. Delete project
4. Remove source files:
   ```bash
   rm -rf api/
   rm vercel.json
   rm -rf .vercel/
   ```
5. Commit + push

### Day 6: Secret rotation + audit
1. List all secrets touched 3 months:
   - Firebase service account JSON
   - Firebase API key (web SDK)
   - Notion API key
   - Claude API key
   - Cloudflare API token
   - R2 access keys
   - SePay webhook secret (if exists)
   - Vercel project secrets (rotate then delete project)
2. For each: rotate via provider console, update wrangler secrets / CF Pages env / Firebase config
3. Log rotation in `docs/secret-rotation-log.md`
4. Audit `git log --all --full-history -- "*.env*"` — confirm no leak in history
5. Audit any commit with admin SDK JSON — if leaked in history, regenerate service account

### Day 7: Docs + CLAUDE.md
1. Update `docs/system-architecture.md`:
   - Remove "Firebase Hosting + Functions" sections
   - Remove "Vercel /api" sections
   - Add "Cloudflare Workers + Pages" full description
   - Update topology diagram
2. Update `docs/codebase-summary.md` — file tree
3. Update `CLAUDE.md`:
   - "Build & Deploy" section — drop Vercel, update Firebase commands
   - "Known caveats" — remove fixed items: admin loose, rules manual deploy, OG duplicate, admin SDK in src/
   - Add new caveat if any
4. Move `apps/web/src/immortalityvn-firebase-adminsdk-*.json` → `secrets/` (verify gitignored)
5. Final commit, merge `claude/immortality-mobile-hybrid` → main if pattern allows

## Todo List

- [ ] All Phase 1-5 verified stable 14+ days
- [ ] Git tags created (3 tags)
- [ ] Admin custom claim verified working on emulator
- [ ] **Rules tighten deployed (anh-present session)**
- [ ] Rules tighten verified — anh can admin, non-claim user cannot
- [ ] Firebase Functions deleted (deployment + source)
- [ ] `firebase.json` cleaned
- [ ] Build script no longer copies to `functions/spa.html`
- [ ] Vercel project paused 24h
- [ ] Vercel project deleted
- [ ] `api/` directory deleted
- [ ] `vercel.json` deleted
- [ ] All secrets rotated
- [ ] `docs/secret-rotation-log.md` written
- [ ] Admin SDK JSON moved `src/` → `secrets/`
- [ ] `docs/system-architecture.md` rewritten
- [ ] `docs/codebase-summary.md` updated
- [ ] CLAUDE.md updated
- [ ] Git history audit for leaked secrets
- [ ] Final cost report — actual $/month before/after

## Success Criteria

- [ ] 0 Firebase Functions deployed
- [ ] 0 Vercel projects
- [ ] 0 `api/*.js` files in repo
- [ ] Firestore admin ops blocked for non-claim users (test with 2nd account)
- [ ] All secrets rotated, log committed
- [ ] CLAUDE.md "Known caveats" section reduced from 10 → ≤3 items
- [ ] Final architecture matches plan.md "Stack đích" section 100%
- [ ] Cost report: confirm $0-5/month at current scale

## Risk Assessment

| # | Risk | Mitigation |
|---|---|---|
| P6-R1 | **Rules tighten locks anh out** | Memory rule: anh-present session, grant claim FIRST, test emulator, rollback procedure ready |
| P6-R2 | Delete Firebase Functions while traffic still routing → 404s | Verify 7 days < 1 req/day before delete; keep backup branch |
| P6-R3 | Delete Vercel while DNS still has TXT records | Audit DNS first; clean up Vercel TXT records before delete |
| P6-R4 | Secret rotation breaks live service | Rotate one at a time, verify after each; have old secret ready for 1h |
| P6-R5 | Git history has leaked secret → rotation doesn't help | If leaked, regenerate (Firebase = new service account; CF = new API token); old keys become decoy |
| P6-R6 | Admin SDK JSON deletion from `src/` breaks dev local | Document new location `secrets/`; update any script reading from old path |
| P6-R7 | `docs/system-architecture.md` rewrite misses something | Cross-reference plan.md + all 6 phase files; have anh review |
| P6-R8 | Rollback after deletes = restore from git tag | Tags pre-retire-* allow `git checkout <tag> -- functions/` |

## Security Considerations

- **Rules tighten = irreversible if claim system breaks** — emulator test mandatory
- **Secret rotation = make-or-break** — for each key, plan rollback BEFORE rotate
- **Service account JSON in git history** = compromise → MUST regenerate, not just rotate
- **Backup before deletes** — `git tag` + `git push --tags`
- Audit `npm audit` / `pnpm audit` post-cleanup for unused dependency vulns

## Next Steps

- **Final:** Plan complete after Phase 6
- **Post-redesign:** Mobile App Store submission
- **Post-redesign:** Public signup (now safe with tightened admin)
- **Future considerations:** D1/Postgres migration if Firestore costs trigger (currently 0/5 triggers)

## Open Questions

1. anh UID Firebase Auth — final confirm? (Phase 5 should have collected)
2. Has anh test admin operations từ 1 secondary account (no claim) to confirm deny works?
3. Có service nào ngoài Firebase/Vercel/CF cần rotate secret không? (vd: SePay, Stripe, Notion)
4. Sau Phase 6 anh muốn merge `claude/immortality-mobile-hybrid` → main hay tiếp tục branch dev?
5. Có cần "redesign retrospective" doc — lessons learned cho future redesigns không?

---

**[FINAL NOTE]** Phase 6 là phase nhạy cảm nhất — kết hợp delete + security tighten. Em sẽ:
- Không tự ý execute Day 3 (rules tighten) — chờ anh present session
- Không tự ý execute Day 4-5 (retire) — chờ anh "OK" sau verify
- Day 6 (secret rotate) — em làm với anh confirm danh sách
- Day 7 (docs) — em làm, anh review
