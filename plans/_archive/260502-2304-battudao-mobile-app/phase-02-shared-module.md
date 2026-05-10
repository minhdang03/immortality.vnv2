# Phase 02 — Shared Module (Types + Firebase + Helpers)

## Context Links
- Existing Vite web Firebase: `apps/immortality-vn/src/firebase.js`
- Fly0 Firebase pattern: `apps/fly0-app/cms/lib/firebase.ts` (admin) + `apps/fly0-app/src/services/`
- Goal: framework-agnostic TS module reusable by Vite web (future) + Expo mobile (now)

## Overview
- **Priority**: P1 (blocks P03, P04, P05, P06)
- **Status**: pending
- **Effort**: 1.5d
- Create `apps/immortality-vn/shared/` — pure TS, NO React, NO Expo, NO DOM. Types + Firebase init wrapper + Firestore helpers + auth helpers.

## Key Insights
- Use Firebase JS SDK v12 (works in browser + RN with right shim).
- `getReactNativePersistence` requires `@react-native-async-storage/async-storage` — pass auth init from caller, not from shared. Caller (mobile) provides persistence; web omits it.
- Avoid bundling: `shared/` exports TS source; mobile imports via relative path or `tsconfig` paths. NO build step (KISS).
- Strict separation: shared is "data + logic", mobile is "UI + platform".

## Functional Requirements
- TypeScript types for all `battudao_*` entities (User, Room, Message, Stream, Signal, Reaction).
- Firebase initialization helper (caller passes config + persistence).
- Firestore CRUD helpers for chat (sendMessage, listenMessages, listRooms).
- Firestore helpers for livestream signaling (writeSdp, listenSignals, writeIce).
- Auth helpers (signInEmail, signInGoogle, signOut, onAuthChange) — caller provides auth instance.

## Architecture
```
shared/
├── package.json           # name "@battudao/shared", main "index.ts", private
├── tsconfig.json          # strict, target ES2020
├── index.ts               # re-export public surface
├── types/
│   ├── user.ts
│   ├── room.ts
│   ├── message.ts
│   ├── stream.ts
│   ├── signal.ts
│   └── reaction.ts
├── firebase/
│   ├── init.ts            # initFirebase(config, options) → { app, db, auth }
│   └── config-shape.ts    # FirebaseConfig type
├── chat/
│   ├── messages.ts        # sendMessage, listenMessages
│   └── rooms.ts           # listRooms, getRoom, createRoom (admin only via rules)
├── livestream/
│   ├── streams.ts         # createStream, listenActiveStreams, endStream
│   └── signaling.ts       # writeOffer/Answer, listenSignals, writeIceCandidate
├── auth/
│   └── auth-helpers.ts    # signInEmail, signInGoogle, signOut, onAuthChange
└── utils/
    └── time.ts            # serverTimestamp wrapper, formatRelative
```

### Public type sketch
```ts
// types/message.ts
export type Message = {
  id: string;
  roomId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: number;        // ms epoch
  edited?: boolean;
  reported?: boolean;
};

// types/stream.ts
export type Stream = {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  status: 'live' | 'ended';
  startedAt: number;
  endedAt?: number;
  viewerCount: number;
  thumbnailUrl?: string;
};

// types/signal.ts (one doc per peer connection direction)
export type Signal = {
  id: string;               // streamId__peerId__direction
  streamId: string;
  fromId: string;
  toId: string;
  type: 'offer' | 'answer' | 'ice';
  payload: string;          // JSON-stringified SDP or ICE candidate
  createdAt: number;
};
```

### Data flow
```
mobile/App.tsx → initFirebase(config, { persistence: AsyncStorage })
                ↓
            { app, db, auth }
                ↓
   shared/chat/messages.ts ← uses passed db
   shared/auth/auth-helpers.ts ← uses passed auth
```

## Related Code Files

**Read for reference:**
- `apps/immortality-vn/src/firebase.js` (existing config — extract values for `mobile/.env`)
- `apps/fly0-app/CLAUDE.md` (firebase project info)

**Create:**
- `apps/immortality-vn/shared/package.json`
- `apps/immortality-vn/shared/tsconfig.json`
- `apps/immortality-vn/shared/index.ts`
- `apps/immortality-vn/shared/types/user.ts`
- `apps/immortality-vn/shared/types/room.ts`
- `apps/immortality-vn/shared/types/message.ts`
- `apps/immortality-vn/shared/types/stream.ts`
- `apps/immortality-vn/shared/types/signal.ts`
- `apps/immortality-vn/shared/types/reaction.ts`
- `apps/immortality-vn/shared/firebase/init.ts`
- `apps/immortality-vn/shared/firebase/config-shape.ts`
- `apps/immortality-vn/shared/chat/messages.ts`
- `apps/immortality-vn/shared/chat/rooms.ts`
- `apps/immortality-vn/shared/livestream/streams.ts`
- `apps/immortality-vn/shared/livestream/signaling.ts`
- `apps/immortality-vn/shared/auth/auth-helpers.ts`
- `apps/immortality-vn/shared/utils/time.ts`

**Modify:**
- `apps/immortality-vn/mobile/tsconfig.json` — add `paths: { "@shared/*": ["../shared/*"] }`
- `apps/immortality-vn/mobile/metro.config.js` — add `watchFolders: ['../shared']` + `nodeModulesPaths` to resolve shared.

## Implementation Steps
1. `mkdir -p apps/immortality-vn/shared/{types,firebase,chat,livestream,auth,utils}`
2. Define types (one file per entity, ≤30 lines each).
3. Implement `firebase/init.ts`: `initFirebase(config, opts?: { authPersistence? })` returning `{ app, db, auth }`. Caller passes RN persistence.
4. Implement chat helpers using `collection`, `query`, `orderBy`, `onSnapshot`, `addDoc`.
5. Implement signaling helpers using same primitives, with TTL-friendly `expiresAt` field.
6. Implement auth helpers thin-wrapping `signInWithEmailAndPassword`, `signInAnonymously`, `onAuthStateChanged`. Google sign-in stays in mobile (uses native flow).
7. Configure metro to resolve `../shared` (since outside mobile/).
8. Smoke test: import a type from `@shared/types/message` in mobile and ensure TS compiles.

## Todo
- [ ] Scaffold shared/ folders
- [ ] Define 6 entity types
- [ ] Implement firebase init wrapper
- [ ] Implement chat helpers
- [ ] Implement signaling helpers
- [ ] Implement auth helpers
- [ ] Wire metro + tsconfig path alias in mobile
- [ ] Verify import works from mobile

## Success Criteria
- `import { Message } from '@shared/types/message'` works in mobile/.
- `npx tsc --noEmit` passes in both `mobile/` and `shared/`.
- Zero React/RN/DOM imports in `shared/`.
- All helpers receive `db` or `auth` as parameter — no module-level singletons.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Metro can't resolve path outside mobile/ | Med | Med | Use `watchFolders` + `extraNodeModules` config; documented Expo pattern |
| Vite later struggles with same shared/ | Low | Low | Pure TS, no platform code → Vite handles natively |
| Firebase v12 RN persistence API changes | Low | Med | Pin version in mobile package.json; adapter pattern isolates change |

## Security
- No secrets in `shared/`. Config is passed by caller (caller reads from env).
- Auth helpers never log tokens.
- Firestore ops respect rules (rules deployed in P03).

## Next Steps
- P03 consumes auth helpers.
- P04 consumes chat helpers.
- P05/P06 consume livestream helpers.
