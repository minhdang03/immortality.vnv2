# Phase 02 — Mobile API + Realtime (Durable Objects)

## Context Links

- Plan overview: [plan.md](plan.md)
- Phase 1 (foundation): [phase-01-foundation-api-og-consolidation.md](phase-01-foundation-api-og-consolidation.md)
- Workers realtime scaffold: `workers/realtime/`
- Workers API: `workers/api/` (post Phase 1)
- Current Vercel API endpoints: `api/chat.js`, `api/upload-file.js`, `api/upload-from-url.js`, `api/khaitri/`, `api/articles/`
- Mobile app: `apps/mobile/` (Expo SDK 54)
- Slow-mode chat design: see CLAUDE.md "workers/realtime" section + commit `efb46b9 feat(doi-thoai-sau)`

## Overview

- **Priority:** P0 (mobile launch blocker)
- **Status:** pending (depends on Phase 1)
- **Duration:** Tuần 2-3 (10-14 ngày, overlap với cuối Phase 1)
- **Owner:** Đăng

**Mục tiêu:** Mobile RN có 1 API endpoint canonical `api.battudao.com` cho tất cả non-realtime ops (upload, chat AI, profiles, Q&A, votes, comments) + 1 WebSocket endpoint `rt.battudao.com` cho realtime chat ephemeral. Port từ Vercel `/api/*` sang Workers, deploy Durable Objects.

## Key Insights

- Mobile RN hiện chưa rõ trỏ endpoint nào — commit `21b1bdc feat(tu-khai-tri,ai-hoi-nguoc)` có upload + AI flow mới chạy local. Phase 2 settle endpoint trước App Store submit.
- Vercel `/api/upload-file.js` và `/api/upload-from-url.js` đã có logic R2 upload — port logic 1-1, không re-design.
- Vercel `/api/chat.js` proxy Claude AI cho AI Hỏi Ngược — paid feature, cần audit billing reconcile.
- Durable Objects `workers/realtime/` đã scaffold WS slow-mode + TTL theo CLAUDE.md. Cần test rate limit thật.
- Mobile RN dùng `@react-native-firebase` Auth → token sign với Firebase service account → Worker verify qua JWKS standard. Không cần custom auth flow.

## Requirements

### Functional

**REST API (`api.battudao.com`):**
- `POST /v1/upload` — multipart/form-data → R2 với `btd/` prefix, return public URL
- `POST /v1/upload-from-url` — fetch external URL, mirror to R2
- `POST /v1/chat` — proxy Claude AI cho AI Hỏi Ngược (paid tier)
- `GET /v1/profiles/:uid` — read user profile
- `PATCH /v1/profiles/:uid` — update profile (auth required)
- `GET /v1/questions` — list with cursor pagination
- `POST /v1/questions` — create (auth required)
- `POST /v1/answers` — create answer (auth required)
- `POST /v1/votes` — upvote/downvote (auth required, rate-limited)
- `GET /v1/comments?articleId=` — list
- `POST /v1/comments` — create (rate-limited, anti-spam)

**Realtime (`rt.battudao.com`):**
- `GET /chat/:channelId` — WebSocket upgrade
- Protocol: JSON `{type: 'msg', text, anonId}` / `{type: 'presence', count}` / `{type: 'typing', anonId}`
- Slow-mode: 1 msg / 2 sec per anon ID per channel
- Idle TTL: 5 min no message → DO suspends, state cleared
- Max 50 concurrent users per channel

### Non-functional

- REST p95 latency < 100ms VN (Worker edge)
- WS connection setup < 500ms
- Slow-mode enforcement 100% accurate (no race condition)
- All endpoints auth-verified via JWKS (no plain token check)
- Paid endpoints (`/v1/chat`) check `btd_ai_flags` + increment `btd_ai_usage` atomically

## Architecture

```
MOBILE RN APP
  │
  ├── REST (HTTPS)
  │     │
  │     ▼
  │   api.battudao.com (Workers Hono)
  │     │
  │     ├── /v1/upload → R2 (S3 API, signed PUT)
  │     ├── /v1/chat → Claude API (with billing increment)
  │     ├── /v1/profiles → Firestore REST (auth-gated)
  │     ├── /v1/questions → Firestore REST
  │     ├── /v1/answers → Firestore REST
  │     ├── /v1/votes → Firestore REST (atomic counter)
  │     └── /v1/comments → Firestore REST
  │
  └── WebSocket (WSS)
        │
        ▼
      rt.battudao.com (Durable Objects)
        │
        └── /chat/:channelId
              │
              ├── DO instance per channel
              ├── In-memory state: connected users, msg history (last 50)
              ├── Slow-mode: KV-backed rate limit per anonId
              └── TTL 5min idle → DO hibernates
```

## Related Code Files

### Modify
- `workers/api/src/index.ts` — add all `/v1/*` routes
- `workers/realtime/wrangler.toml` — fill KV namespace IDs + DO binding
- `apps/mobile/.env` (or expo config) — set `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_RT_URL`
- `apps/mobile/src/lib/api.ts` (or equivalent) — point fetch to new endpoint

### Create
- `workers/api/src/routes/upload.ts` — R2 signed PUT logic
- `workers/api/src/routes/chat.ts` — Claude AI proxy + billing
- `workers/api/src/routes/profiles.ts`
- `workers/api/src/routes/questions.ts`
- `workers/api/src/routes/answers.ts`
- `workers/api/src/routes/votes.ts` — atomic counter
- `workers/api/src/routes/comments.ts`
- `workers/api/src/middleware/auth.ts` — JWKS verify wrapper
- `workers/api/src/middleware/rate-limit.ts` — KV-backed IP rate limit
- `workers/api/src/middleware/billing.ts` — paid feature gate
- `workers/realtime/src/index.ts` — DO entry point (if not done)
- `workers/realtime/src/chat-room.ts` — DO class implementing slow-mode
- `apps/mobile/src/lib/realtime-client.ts` — WS reconnect logic

### Reuse from Vercel (port, then delete in Phase 6)
- `api/upload-file.js` → `workers/api/src/routes/upload.ts`
- `api/upload-from-url.js` → `workers/api/src/routes/upload.ts` (combine endpoints)
- `api/chat.js` → `workers/api/src/routes/chat.ts`
- `api/khaitri/index.js` → check what it does, port if needed
- `api/articles/index.js` → check, port if needed

## Implementation Steps

### Day 1-2: Auth middleware + Firestore client
1. Create `workers/api/src/middleware/auth.ts`:
   - Extract `Authorization: Bearer <token>` header
   - Fetch JWKS from `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`
   - Cache JWKS in KV 6h
   - Verify token with `jose.jwtVerify`
   - Inject `c.set('uid', payload.user_id)` for downstream
2. Extend `workers/api/src/firestore/rest-client.ts` (Phase 1 created) — add write ops: `createDoc`, `updateDoc`, `deleteDoc`, `runTransaction`
3. Unit tests cho auth middleware (valid token, expired, invalid sig, missing)

### Day 3-4: Upload + R2
1. Add R2 binding trong `workers/api/wrangler.toml`:
   ```toml
   [[r2_buckets]]
   binding = "MEDIA"
   bucket_name = "btd-media"
   ```
2. Port `api/upload-file.js` logic — accept multipart, validate MIME type, generate key `btd/{userId}/{nanoid}.{ext}`, R2 PUT, return public URL
3. Port `api/upload-from-url.js` — fetch URL, validate size < 50MB, R2 PUT
4. Test 5 image types + 1 audio file (Khai Trí use case)

### Day 5-6: AI Hỏi Ngược chat
1. Port `api/chat.js` logic
2. Add billing middleware:
   - Check `btd_ai_flags/{uid}` doc — if `paid_until > now` → allow
   - Else → 402 Payment Required
3. Atomic increment `btd_ai_usage/{uid}` via Firestore `runTransaction`:
   ```ts
   { tokens_used: increment, last_used: serverTimestamp }
   ```
4. Idempotency key in header `Idempotency-Key` — KV store 24h, dedupe retries
5. Stream Claude response back to client (SSE)
6. Test paid flow + free user 402 + retry idempotency

### Day 7-9: Q&A + comments + votes
1. Port questions/answers/votes/comments logic
2. Votes need atomic counter — use Firestore `FieldValue.increment(1)` via REST
3. Rate limit `/v1/votes` to 30/min/IP via KV counter
4. Rate limit `/v1/comments` to 10/min/IP
5. Validate input với Zod schemas (Phase 5 will formalize)

### Day 10-11: Durable Objects realtime
1. Fill `workers/realtime/wrangler.toml`:
   ```toml
   [[durable_objects.bindings]]
   name = "CHAT_ROOM"
   class_name = "ChatRoom"
   
   [[migrations]]
   tag = "v1"
   new_classes = ["ChatRoom"]
   ```
2. Implement `workers/realtime/src/chat-room.ts`:
   - `fetch()` accepts WS upgrade
   - `webSocketMessage()` handles incoming
   - In-memory map `anonId → lastMsgTimestamp` for slow-mode
   - Broadcast to all sessions
   - 5min idle alarm → cleanup state
3. Custom domain `rt.battudao.com`
4. Test 10 concurrent WS connections + slow-mode

### Day 12-13: Mobile RN integration
1. Update `apps/mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=https://api.battudao.com
   EXPO_PUBLIC_RT_URL=wss://rt.battudao.com
   EXPO_PUBLIC_API_VERSION=v1
   ```
2. Create `apps/mobile/src/lib/api.ts` — typed fetch wrapper with auth header
3. Create `apps/mobile/src/lib/realtime-client.ts` — WS auto-reconnect, ping/pong
4. Update screens: Forum Q&A, Đối Thoại Sâu chat, AI Hỏi Ngược → point to new client
5. Test in Expo dev client physical device

### Day 14: Verify
1. End-to-end mobile flow: login → post question → answer → upvote → upload image
2. Chat: 2 devices join channel → send msg → verify both receive → slow-mode trigger after 2 msgs/sec
3. AI Hỏi Ngược: paid user flow + idempotency replay
4. Load test: 1000 req/min REST + 100 concurrent WS

## Todo List

- [ ] JWKS auth middleware + KV cache 6h
- [ ] Firestore REST client extended (writes, transactions)
- [ ] `/v1/upload` + `/v1/upload-from-url` ported, R2 binding live
- [ ] `/v1/chat` with billing + idempotency
- [ ] `/v1/profiles` GET + PATCH
- [ ] `/v1/questions` GET + POST
- [ ] `/v1/answers` POST
- [ ] `/v1/votes` POST with atomic increment + rate limit
- [ ] `/v1/comments` GET + POST with rate limit
- [ ] Durable Objects `ChatRoom` class deployed
- [ ] `rt.battudao.com` custom domain bound
- [ ] Slow-mode tested (1 msg/2 sec enforced)
- [ ] 5min idle TTL verified
- [ ] Mobile RN env updated
- [ ] Mobile API client typed wrapper
- [ ] Mobile WS reconnect logic
- [ ] End-to-end mobile flow tested on physical device
- [ ] Load test 1000 req/min + 100 WS

## Success Criteria

- [ ] Mobile RN dev client fully functional với new endpoints
- [ ] All 12 REST endpoints return correct status codes
- [ ] WS connection success rate > 99% in test (30 connect/disconnect cycles)
- [ ] Slow-mode 100% accurate (no message bypass)
- [ ] AI billing increments match Claude API token count (10-call audit)
- [ ] Idempotency dedupes correctly (replay 5x, charge once)
- [ ] p95 REST latency < 100ms VN measured via mobile

## Risk Assessment

| # | Risk | Mitigation |
|---|---|---|
| P2-R1 | Mobile cert-pin Firebase Hosting cert → break khi cutover | Confirm với anh trước Phase 2 deploy: mobile có cert-pin không? |
| P2-R2 | Durable Objects cost spike (chat heavy users) | Slow-mode hard limit, max 50 users/channel, monitor weekly |
| P2-R3 | AI billing race condition → over-charge | Firestore `runTransaction` atomic, idempotency key dedupe |
| P2-R4 | R2 upload large file (audio) timeout | Use signed PUT URL — client uploads directly to R2, Worker only sign |
| P2-R5 | WS reconnect storm on network flap | Exponential backoff client-side, max 5 retries |
| P2-R6 | Claude API rate limit hit during launch | Queue overflow → 429, mobile shows "đang bận, thử lại sau" |
| P2-R7 | Firestore reads scale linearly với mobile pull | KV cache hot reads (article list, profile) 60s TTL |

## Security Considerations

- All write endpoints require JWT verify
- Idempotency key prevent replay attacks on `/v1/chat`
- Rate limits per IP + per auth user (whichever stricter)
- R2 uploads validate MIME type whitelist (image/*, audio/mpeg, audio/wav, audio/mp4)
- File size cap 50MB
- CORS strict (mobile native scheme + web origin)
- No PII in logs (mask UID, email)
- Service account JWT for Firestore REST scoped to specific collections

## Next Steps

- **Blocks:** Phase 3 (web hosting) — không strict blocking nhưng nên Phase 2 stable trước khi DNS cutover
- **Unblocks:** Mobile App Store submission
- **Depends on:** Phase 1 stable (JWKS cache, Firestore REST client, deploy pipeline)

## Open Questions

1. Mobile cert-pin Firebase Hosting cert không? (Critical — block deploy nếu có)
2. AI Hỏi Ngược billing đang gắn với SePay hay Stripe? Cần webhook update `btd_ai_flags` từ provider nào?
3. Idempotency window 24h ok? Hay shorter (1h) để KV usage thấp?
4. Chat channels có cần persist 1 phần (vd: pinned message) hay 100% ephemeral?
5. Audio Khai Trí file size? Nếu > 50MB cần raise cap.
