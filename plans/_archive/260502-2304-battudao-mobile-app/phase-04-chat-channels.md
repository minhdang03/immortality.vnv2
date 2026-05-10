# Phase 04 — Chat with Channels (Discord-Style)

## Context Links
- Shared chat helpers from P02 (`shared/chat/messages.ts`, `shared/chat/channels.ts`, `shared/chat/categories.ts`)
- Auth context from P03
- Discord-style UX inspiration (sidebar with category-grouped channels)

## Overview
- **Priority**: P0 (THE CORE FEATURE — this is the MVP)
- **Status**: pending
- **Effort**: 4d
- Build channel browser (categories + channels grouped sidebar/list), channel screen with real-time messages, composer, basic moderation.

## Key Insights
- Discord pattern: server → categories → channels → messages. MVP = single implicit "Battudao server" so skip server level. Categories + channels + messages = 3 collections.
- Mobile UX: stack navigation (ChannelsList → Channel) is more native than drawer for MVP. Drawer can come later if user demand.
- Channels grouped by category in list — use `SectionList` with category header rows.
- Use Firestore `onSnapshot` for real-time messages. Pagination via `startAfter`.
- Typing indicator = ephemeral doc in subcollection `battudao_channels/{channelId}/typing/{uid}` with `expiresAt`.
- Message limit: load latest 50, infinite scroll up.
- Composer: handle keyboard avoidance via RN `KeyboardAvoidingView`.

## Functional Requirements
- **Categories**: admin-curated groupings (e.g., "🌙 Cộng đồng", "📜 Khai Trí", "💪 Thái Dương Quyền"). Seed in Firestore console for MVP.
- **Channels**: text channels within a category (e.g., "#chao-mung", "#tu-do"). Seed for MVP.
- Channels list screen shows categories as section headers + channels as rows under each.
- Tap channel → channel screen with message list (newest at bottom) + composer.
- Real-time: new messages appear without refresh.
- Long-press message → action sheet (Copy, Report, Delete-if-mine).
- Report → `reported: true` flag on message.
- Typing indicator (lightweight): "X đang gõ..." below composer.

## Architecture

### Data model
```
battudao_categories/{categoryId}
  ├ id           string
  ├ name         string  (e.g., "Cộng đồng")
  ├ icon         string  (emoji, e.g., "🌙")
  ├ order        number
  └ createdAt    Timestamp

battudao_channels/{channelId}
  ├ id           string
  ├ categoryId   string  (FK → battudao_categories)
  ├ name         string  (e.g., "tu-do")  — slug, no #
  ├ description  string
  ├ order        number  (within category)
  ├ isPublic     boolean
  └ createdAt    Timestamp

battudao_messages/{messageId}
  ├ id           string
  ├ channelId    string  (FK → battudao_channels)
  ├ authorId     string  (auth.uid)
  ├ authorName   string  (display name snapshot)
  ├ text         string
  ├ createdAt    Timestamp
  ├ reported     boolean
  └ deletedAt    Timestamp?
```

### Screen flow
```
┌──────────────────┐
│ channels-screen  │ ─tap channel→ ┌──────────────────┐
│ (SectionList)    │               │ channel-screen   │
│  Category 1      │               │  ├ message-list  │
│  ├ #chao-mung    │               │  ├ message-bubble│
│  └ #tu-do        │               │  ├ typing-       │
│  Category 2      │               │  │  indicator    │
│  └ #q-and-a      │               │  └ message-      │
└──────────────────┘               │     composer     │
                                   └──────────────────┘
```

### Send-message data flow
1. User types → `onSend(text)` debounce
2. `messages.sendMessage({ db, channelId, authorId, authorName, text })`
3. `addDoc(battudao_messages, { ...payload, createdAt: serverTimestamp() })`
4. Rules check: `request.resource.data.authorId == request.auth.uid` ✓
5. Listener fires → list re-renders

## Related Code Files

**Read:**
- P02 outputs: `shared/chat/messages.ts`, `shared/chat/channels.ts`, `shared/chat/categories.ts`, `shared/types/{message,channel,category}.ts`
- `shared/auth/auth-helpers.ts`

**Create:**
- `apps/immortality-vn/mobile/src/screens/channels/channels-screen.tsx` (SectionList of categories + channels)
- `apps/immortality-vn/mobile/src/screens/channels/channel-screen.tsx` (message view)
- `apps/immortality-vn/mobile/src/components/chat/message-list.tsx`
- `apps/immortality-vn/mobile/src/components/chat/message-bubble.tsx`
- `apps/immortality-vn/mobile/src/components/chat/message-composer.tsx`
- `apps/immortality-vn/mobile/src/components/chat/typing-indicator.tsx`
- `apps/immortality-vn/mobile/src/components/chat/message-action-sheet.tsx`
- `apps/immortality-vn/mobile/src/components/chat/category-header.tsx`
- `apps/immortality-vn/mobile/src/components/chat/channel-row.tsx`
- `apps/immortality-vn/mobile/src/hooks/use-channel-messages.ts` (subscribe + paginate)
- `apps/immortality-vn/mobile/src/hooks/use-channels-grouped.ts` (returns sections for SectionList)

**Modify:**
- `apps/immortality-vn/mobile/src/navigation/main-tabs.tsx` — wire Channels stack (List → Channel)
- Possibly extend shared:
  - `apps/immortality-vn/shared/chat/typing.ts`
  - `apps/immortality-vn/shared/chat/messages.ts` — add `reportMessage`, `deleteMessage`

## Implementation Steps
1. Seed Firestore manually:
   - 3 categories: "Cộng đồng" 🌙, "Khai Trí" 📜, "Thái Dương Quyền" 💪
   - ~6-8 channels across them (ex: chao-mung, tu-do, q-and-a, suy-ngam, tap-luyen, chia-se)
2. Implement `use-channels-grouped` hook: subscribe `battudao_categories` + `battudao_channels` ordered, return SectionList sections.
3. Build `channels-screen` with SectionList; `category-header` shows icon + name; `channel-row` shows `#name`.
4. Build `channel-screen` route taking `channelId` param + channel name in header.
5. Implement `use-channel-messages` subscribing latest 50 + pagination upward.
6. Build `message-list` (inverted FlatList).
7. Build `message-bubble` (own = right, gold-tinted; other = left, dark-card).
8. Build `message-composer` with `KeyboardAvoidingView` + send button.
9. Add typing indicator (write to `typing` subcoll on input, expire 5s; subscribe other typers).
10. Add long-press → action sheet (Copy/Report/Delete-if-mine).
11. Two-device real-time test.

## Todo
- [ ] Seed categories + channels in Firestore
- [ ] use-channels-grouped hook
- [ ] channels-screen (SectionList)
- [ ] category-header component
- [ ] channel-row component
- [ ] channel-screen + nav wiring
- [ ] use-channel-messages hook (subscribe + paginate)
- [ ] message-list component
- [ ] message-bubble component
- [ ] message-composer with keyboard handling
- [ ] typing-indicator
- [ ] message-action-sheet (copy/report/delete)
- [ ] Two-device real-time test

## Success Criteria
- Channels list shows categories as section headers, channels grouped beneath.
- Two devices in same channel see each other's messages within <1s.
- Pagination loads older messages without dups.
- Reporting flips `reported: true`.
- User deletes only own message; admin (`isAdmin()`) deletes any.
- No memory leaks on rapid channel enter/exit (verify listener unsubscribe).

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Spam from anon users | Med | Med | Rate-limit client (1 msg / 2s); server-side rate limit deferred to v2 |
| Message list jank with 50+ messages | Low | Low | `windowSize`, `removeClippedSubviews`, `getItemLayout` |
| Typing indicator floods writes | Med | Low | Throttle to 1 write per 3s per user |
| Listener leak on rapid nav | Med | Med | Cleanup via `useEffect` return |
| Categories/channels CRUD requires admin UI | Low | Low | MVP: Firestore console manual; v2: build admin tab in mobile or extend battudao.com web |

## Security
- Rules enforce `authorId == auth.uid` on create.
- Channels + categories are read-only for clients; admin (`isAdmin()`) creates via console for MVP.
- No client trust on `authorName` — UI optionally re-resolves from `battudao_users/{uid}`.
- Profanity/moderation: `reported` flag, manual review for MVP.

## Next Steps
- (Deferred to v2): livestream features build on top — chat overlay reuses `message-list` + `message-composer` against a livestream's chat subcollection.
