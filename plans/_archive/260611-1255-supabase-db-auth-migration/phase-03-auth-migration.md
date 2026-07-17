# Phase 03 — Auth Migration (Firebase Auth → Supabase Auth)

## Context Links
- Brainstorm §3 (2 auth planes), §7 (1-2d): ../reports/brainstorm-260611-1244-supabase-db-auth-migration-reading-analytics.md
- Current web auth init: ../../apps/web/src/firebase.js (`getAuth`)
- Current admin check: ../../CLAUDE.md (Security model — `auth != null`)
- Roles target: phase-01 `profiles.role`

## Overview
- **Priority:** P1 (blocks 04 admin writes, 05 human plane, 08)
- **Status:** pending
- **Description:** Move human authentication from Firebase Auth to Supabase Auth (email/password). Establish the role model via `profiles.role` + RLS (replacing the loose `auth != null` admin check). Agents do NOT use this plane (they use btd_ keys — phase-05).

## Key Insights
- Current "admin" = any logged-in Firebase user. New model = `profiles.role='admin'` checked in RLS → strictly better.
- Admin user count is tiny (Đăng + mods). User-migration strategy = **recreate admin accounts in Supabase Auth** (manual invite/reset), NOT bulk password export (Firebase password hashes are scrypt; Supabase import is possible but overkill for a handful of admins — YAGNI).
- App currently has NO public sign-up — only admin login. So there is no large end-user base to migrate. This drastically simplifies the auth phase.
- Supabase session (JWT in localStorage) replaces Firebase ID token. `clearAllCaches()` on sign-out (useFirestoreSWR.js:64) must be wired to Supabase `onAuthStateChange(SIGNED_OUT)`.

## Requirements
**Functional**
- Supabase Auth email/password login for admin(s) + mods.
- On first sign-in, ensure a `profiles` row exists (trigger or app-side upsert) with default role.
- Admin role grants write via RLS; non-admin = read-only.
- Sign-out clears local caches (parity with current behavior).
- Session restore on reload (supabase-js auto-persists).

**Non-functional**
- No public sign-up enabled (match current). Disable open sign-up in Supabase Auth settings.
- Role assignment is manual/admin-controlled (no self-promotion).

## Architecture
```
Admin browser ──email/pw──► Supabase Auth ──► JWT (auth.uid())
   onAuthStateChange → ensure profiles row → role read by RLS policies
   SIGNED_OUT → clearAllCaches()
Trigger: handle_new_user() inserts profiles(id, role='viewer') on auth.users insert
Admin promotion: UPDATE profiles SET role='admin' WHERE id=... (run once, by Đăng via SQL)
```
**Data flow:** credentials → Supabase Auth → JWT carries `sub`=user id → RLS policies join `profiles.role` to gate writes.

## Related Code Files
**Create**
- `apps/web/src/lib/supabase-client.js` (single supabase-js client — anon key; shared by phase-04 too)
- `apps/web/src/hooks/useAuth.js` (Supabase session + signIn/signOut + role) — replaces Firebase-auth usage
- `supabase/migrations/0009_profiles_trigger.sql` (`handle_new_user` trigger → profiles row)

**Modify**
- `apps/web/src/hooks/useUserRole.js` (read role from `profiles` via Supabase, not Firebase)
- `apps/web/src/hooks/useAdmins.js` (admin list from `profiles` where role='admin')
- Sign-out call site → wire `clearAllCaches()` to Supabase SIGNED_OUT
- `.env.example` (already has VITE_SUPABASE_* from phase-01)

**Delete** (deferred to phase-08 cutover — keep Firebase until then)
- `apps/web/src/firebase.js` `getAuth`/`auth` export (removed at cutover; analytics `logEvent` stays/moves)

## Implementation Steps
1. Enable Supabase Auth email/password; DISABLE public sign-ups in project settings.
2. Create admin account(s) in Supabase Auth (invite or admin-create); send Đăng a password reset to set credentials. (Coordinate per memory rule: collect credentials BEFORE any lockout-capable change.)
3. `0009_profiles_trigger.sql`: trigger on `auth.users` insert → `profiles(id, role default 'viewer')`. Then `UPDATE profiles SET role='admin'` for Đăng's id (run once).
4. Build `supabase-client.js` (createClient with URL + anon key, persistSession true).
5. Build `useAuth.js`: expose `user`, `role`, `signIn`, `signOut`; subscribe `onAuthStateChange`; on SIGNED_OUT call `clearAllCaches()`.
6. Rewrite `useUserRole.js` + `useAdmins.js` to read `profiles`.
7. Verify RLS: admin can write content, viewer cannot (smoke test with 2 accounts).
8. Keep Firebase Auth code in place but unused on the Supabase path (flag-gated with phase-04); full removal at phase-08.

## Todo List
- [ ] Enable Supabase Auth email/pw; disable public sign-up
- [ ] Create admin account(s) + set Đăng credentials (collect BEFORE cutover)
- [ ] `handle_new_user` trigger + one-time admin role grant
- [ ] `supabase-client.js` (anon)
- [ ] `useAuth.js` (session, role, signIn/signOut, cache clear on sign-out)
- [ ] Rewrite `useUserRole.js` + `useAdmins.js` to read profiles
- [ ] 2-account RLS smoke test (admin writes; viewer denied)

## Success Criteria
- Admin logs in via Supabase Auth; session persists across reload.
- `profiles.role='admin'` gates writes via RLS (viewer write denied with 403/empty).
- Sign-out clears caches (no stale admin data on shared device).
- Public sign-up disabled; no anon can create accounts.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Admin locked out (no Supabase creds before cutover) | Med | High | Create + verify admin login BEFORE phase-08; keep Firebase login live in parallel until verified |
| Role check gap lets viewer write | Low | High | RLS write policies all reference profiles.role; 2-account smoke test |
| Session token handling differs from Firebase (cache leak) | Low | Med | Wire clearAllCaches to SIGNED_OUT; test on shared device |

## Security Considerations
- Tighten admin from `auth != null` → explicit `role='admin'` (closes the known caveat in CLAUDE.md).
- No public sign-up until roles + RLS proven (prevents privilege-by-default).
- Per memory rule: agent identity is the btd_ key plane (phase-05), NOT a human admin role — do not grant agents Supabase Auth accounts.

## Next Steps
- Blocks phase-04 (admin write path), phase-05 (human plane separation), phase-08 (remove Firebase Auth).
- Depends on phase-01 (profiles table + RLS).
