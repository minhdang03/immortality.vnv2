# Phase 03 — Firebase Auth + Firestore Rules

## Context Links
- Firebase project `immortalityvn` (own — same as battudao.com web). Config in `apps/immortality-vn/.env`.
- Existing rules: `apps/immortality-vn/firestore.rules` (extend, don't replace)
- Shared auth helpers from P02

## Overview
- **Priority**: P1 (blocks P04, P05, P06)
- **Status**: pending
- **Effort**: 2d
- Implement login screens (email + Google + anonymous), session persistence via AsyncStorage, deploy additive Firestore rules for `battudao_*`.

## Key Insights
- Battudao mobile uses `immortalityvn` Firebase project (same as battudao.com web). Mobile + web share user accounts + data.
- Anonymous sign-in is allowed (low-friction entry to public chat) but role-gated for `battudao_users` write.
- Rules MUST be additive — modifying existing rules risks battudao.com web auth regression.
- Google sign-in on Expo: use `expo-auth-session` (Web client + iOS client OAuth IDs from Google Cloud).
- Future: when Fly0 has real users, evaluate Firebase project merge or custom-token auth bridge. Out of MVP scope.

## Functional Requirements
- Login screen: email/password fields, "Continue with Google", "Continue as Guest" (anonymous).
- Auto-sign-in on app launch if session persisted.
- Logout from profile screen.
- After auth, ensure `battudao_users/{uid}` doc exists with `displayName`, `avatar`, `role: 'user'`, `createdAt`.
- Firestore rules: published rules deny direct user-data write except own doc; messages writable by signed-in users; streams writable only by host; signals writable only by participants.

## Architecture

### Auth flow
```
[App start] → onAuthStateChanged
                ↓
        ┌───────┴───────┐
       No user          User
        ↓                ↓
   <Auth Stack>     ensure battudao_users doc
   LoginScreen      → <Main Tabs>
        ↓
   signIn (email | google | anon)
        ↓
   AsyncStorage persists token
        ↓
   onAuthStateChanged fires → Main Tabs
```

### Firestore rules (additive blocks to append)
```
match /battudao_users/{uid} {
  allow read: if request.auth != null;
  allow create, update: if request.auth.uid == uid;
}
match /battudao_categories/{categoryId} {
  allow read: if request.auth != null;
  allow write: if isAdmin();   // admin-curated only
}
match /battudao_channels/{channelId} {
  allow read: if request.auth != null;
  allow write: if isAdmin();   // admin-curated only
  // typing subcollection — ephemeral presence
  match /typing/{uid} {
    allow read: if request.auth != null;
    allow write: if request.auth.uid == uid;
  }
}
match /battudao_messages/{msgId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
                && request.resource.data.authorId == request.auth.uid;
  allow update, delete: if request.auth.uid == resource.data.authorId
                          || isAdmin();
}
match /battudao_streams/{streamId} {
  allow read: if request.auth != null;
  allow create, update: if request.auth.uid == request.resource.data.hostId;
  allow delete: if isAdmin();
}
match /battudao_signals/{signalId} {
  allow read, write: if request.auth != null
    && (request.resource.data.fromId == request.auth.uid
        || resource.data.toId == request.auth.uid);
}
match /battudao_reactions/{reactionId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == request.resource.data.userId;
}
```

## Related Code Files

**Read:**
- `apps/immortality-vn/firestore.rules` (current rules — battudao.com web)
- `apps/immortality-vn/shared/auth/auth-helpers.ts` (P02 output)

**Create:**
- `apps/immortality-vn/mobile/src/screens/auth/login-screen.tsx`
- `apps/immortality-vn/mobile/src/screens/auth/signup-screen.tsx`
- `apps/immortality-vn/mobile/src/services/auth-service.ts` (mobile-side wrapper, includes Google sign-in)
- `apps/immortality-vn/mobile/src/services/firebase-init.ts` (calls shared `initFirebase` with mobile config + AsyncStorage persistence)
- `apps/immortality-vn/mobile/src/context/auth-context.tsx` (React context exposing `user`, `loading`, `signIn`, `signOut`)
- `apps/immortality-vn/mobile/src/hooks/use-auth.ts`
- `apps/immortality-vn/mobile/src/services/ensure-user-doc.ts`
- `apps/immortality-vn/mobile/.env.example`

**Modify:**
- `apps/immortality-vn/mobile/App.tsx` — wrap with `<AuthProvider>`
- `apps/immortality-vn/mobile/src/navigation/root-navigator.tsx` — branch on auth state
- `apps/immortality-vn/firestore.rules` (canonical rules host for `immortalityvn` project — append `battudao_*` blocks)

**Rules ownership:** `immortalityvn` Firebase project's rules live in `apps/immortality-vn/firestore.rules`. Edit + deploy from `immortality-vn/` root via `firebase deploy --only firestore:rules`. No coordination with Fly0 needed (different Firebase project).

## Implementation Steps
1. Add Firebase config to `mobile/app.json` `extra` field (read via `expo-constants`). Use `immortalityvn` public keys (copy from `apps/immortality-vn/.env` `VITE_FIREBASE_*`).
2. Install `npm i @react-native-async-storage/async-storage expo-auth-session expo-crypto`.
3. Create `firebase-init.ts` calling shared `initFirebase` with `getReactNativePersistence(AsyncStorage)`.
4. Build `auth-context.tsx`: `useEffect` subscribes to `onAuthStateChanged`, exposes user state.
5. Build `auth-service.ts` wrapping shared helpers + Google OAuth (expo-auth-session + GoogleAuthProvider.credential).
6. Build login/signup screens — minimal form, vi-first labels.
7. Build `ensure-user-doc.ts` — on first auth event with new uid, create/merge `battudao_users/{uid}`.
8. Wire `root-navigator` to switch Auth stack vs Main tabs based on `user`.
9. Backup current rules: `cp apps/immortality-vn/firestore.rules apps/immortality-vn/firestore.rules.bak`. Append battudao blocks (use existing `isAdmin()` helper). Deploy: either paste contents into Firebase Console → Firestore → Rules tab (current method per rules file header), OR add `"firestore": { "rules": "firestore.rules" }` to `firebase.json` then `firebase deploy --only firestore:rules`.
10. Smoke-test: battudao.com web login still works; Battudao mobile signup creates user doc.

## Todo
- [ ] Add Firebase config to expo extra
- [ ] Install AsyncStorage + auth-session
- [ ] Implement firebase-init with persistence
- [ ] Implement auth-context + hook
- [ ] Implement auth-service (email + google + anon)
- [ ] Build login + signup screens
- [ ] Implement ensure-user-doc
- [ ] Wire root-navigator branching
- [ ] Backup current firestore.rules
- [ ] Append battudao rules + deploy
- [ ] Smoke-test battudao.com web still works
- [ ] Smoke-test Battudao signup + persisted session

## Success Criteria
- Email signup creates auth user + battudao_users doc.
- Google sign-in opens browser, returns to app, lands in Main tabs.
- Force-quit app + reopen → still signed in (persistence works).
- battudao.com web auth still works post-rules-deploy.
- Anonymous user CANNOT write to `battudao_users/{otherUid}`.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Rules deploy regresses battudao.com web | Low | High | Backup `firestore.rules.bak` + deploy at low-traffic hour + immediate web smoke test |
| Google OAuth redirect URI mismatch | Med | Med | Configure `battudao://` scheme + add to Google Cloud OAuth client |
| AsyncStorage clear via OS purge → silent logout | Low | Low | Acceptable; user re-logs in |
| Anonymous spam/abuse on chat | Med | Med | Display name `Khách-{xxxx}`; rate-limit messages in P04 |

## Security
- No service account keys in mobile bundle.
- Firebase web API key is public-by-design; rules enforce access.
- Auth tokens never logged.
- Rules tested via Firebase Emulator before deploy if time permits; otherwise manual production smoke test.
- Create `immortality-vn/firestore.rules.bak` snapshot before P03 deploy as rollback point.

## Next Steps
- P04, P05, P06 unblocked.
