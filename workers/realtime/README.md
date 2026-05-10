# btd-realtime — Durable Objects WebSocket chat

WebSocket server for **Đối thoại sâu** channels. One Durable Object instance per `channelId`.

## Quick start

```bash
# Local dev (Miniflare DO emulation)
pnpm dev

# Type check
pnpm typecheck

# Tests
pnpm test
```

## Architecture

```
Mobile (partysocket) ──WSS──▶ Worker entry (worker-entry.ts)
                                  │
                            path match /ws/channels/:id
                                  │
                            env.CHANNEL.idFromName(channelId)
                                  │
                                  ▼
                        ChannelDurableObject (1 per channel)
                          ├── auth verify (before upgrade)
                          ├── slowModeMap: Map<uid, lastMsgAt>
                          ├── recentMessages: WsMessage[] (cap 100)
                          ├── DO alarm: TTL deletion + presence
                          └── Firestore REST: persist / delete
```

## Per-channel configuration

Channel config is read from Firestore `btd_channels/{channelId}` on first
message after a cold start, then cached in DO persistent storage.

| Field | Type | Default | Description |
|---|---|---|---|
| `slowModeSeconds` | number | 60 | Minimum seconds between messages per uid |
| `ephemeralTtlHours` | number | 24 | Message auto-delete TTL (12–48h) |

To update config for a live channel:
1. Update the Firestore doc via admin/service account.
2. The DO reads config on next cold start. For immediate effect, delete the
   DO storage key `channel:config` or redeploy (resets DO state).

## WebSocket protocol

### Handshake

Token via `Sec-WebSocket-Protocol: bearer.<FIREBASE_ID_TOKEN>`.
Do NOT use query string — avoids token leakage in proxy logs.

### Client → Server events

```jsonc
{ "type": "send_message", "body": "<string ≤4KB>" }
{ "type": "subscribe_since", "timestamp": <epoch_ms> }  // replay missed messages
{ "type": "ping" }                                       // keep-alive
```

### Server → Client events

```jsonc
{ "type": "message", "payload": { "id", "channelId", "authorUid", "authorNickname", "body", "createdAt", "expiresAt" } }
{ "type": "rate_limit", "retryAfter": <seconds> }        // slow-mode rejection
{ "type": "presence_count", "count": <integer> }         // anonymized, NO user list
{ "type": "promoted", "messageId", "questionId" }
{ "type": "error", "code", "message" }
```

### Close codes

| Code | Meaning |
|---|---|
| 4401 | Unauthorized (missing/expired/invalid token) |
| 4403 | Forbidden |
| 4413 | Payload too large (>4KB) |
| 4029 | Slow-mode (reserved) |

## Slow-mode

Enforced **server-side** — client cannot bypass by sending raw WS frames.

When rejected, the server responds with `{ type: "rate_limit", retryAfter: N }`.
The message is NOT persisted and NOT broadcast.

DO is single-threaded per channel → no race condition possible on `slowModeMap`.

## Ephemeral TTL

Messages expire at `createdAt + ephemeralTtlHours`. Two deletion mechanisms:

1. **DO alarm** — fires at `expiresAt`, calls Firestore REST DELETE.
2. **Cron sweeper** (in `workers/api`) — runs `*/5 * * * *`, batch-deletes
   all docs where `expiresAt < now`. Backstop for missed DO alarms.

Clients also filter expired messages client-side on render.

## Deploy (pending CF account)

```bash
# 1. Create KV namespaces
wrangler kv:namespace create KV_JWKS --config workers/realtime/wrangler.toml
wrangler kv:namespace create KV_CACHE --config workers/realtime/wrangler.toml
# → paste the returned IDs into wrangler.toml

# 2. Set secrets
wrangler secret put FIREBASE_PROJECT_ID --config workers/realtime/wrangler.toml
wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON --config workers/realtime/wrangler.toml

# 3. Deploy
pnpm deploy
# or: wrangler deploy --config workers/realtime/wrangler.toml

# 4. Test with wscat
wscat -c "wss://btd-realtime.<account>.workers.dev/ws/channels/test-channel" \
      -H "Sec-WebSocket-Protocol: bearer.<firebase-id-token>"
```

## Coordination with workers/api (Phase 2)

- **Separate wrangler.toml** — realtime has its own `workers/realtime/wrangler.toml`.
  The root `workers/wrangler.toml` is used by `workers/api` only.
- **Shared auth pattern** — both workers use the same Firebase JWKS verify logic
  (`jose` + KV cache). Code is intentionally duplicated (not shared package) to
  keep each worker independently deployable without a build step.
- **Firestore REST** — same REST + service account JWT pattern as Phase 2.
  Consider extracting `packages/shared/firestore-edge/` when a third worker needs it.
- **TTL cron sweeper** — lives in `workers/api` (not here), runs every 5 min,
  batch-deletes `btd_messages` where `expiresAt < now`. Backstop for DO alarms.
- **Promote-to-question** — `POST /api/messages/:id/promote` (in workers/api)
  creates `btd_questions` doc, then optionally calls the DO via internal HTTP
  to broadcast `{ type: "promoted", messageId, questionId }`.

## Anti-patterns (enforced, not just documented)

- Server NEVER emits typing indicators.
- Server NEVER emits read receipts.
- Server NEVER emits per-user online status.
- `presence_count` is an anonymized integer only — no user list, no nicknames.
