/**
 * Integration-style unit tests for ChannelDurableObject logic.
 *
 * Tests the key server-enforced behaviors without a live Cloudflare account:
 *   - Slow-mode rejection (second message within slowModeSeconds rejected)
 *   - No slow-mode rejection when enough time has elapsed
 *   - Presence count broadcast on connect / disconnect
 *   - subscribe_since replay of recent buffer
 *   - Deduplication: same content within 5s silently dropped
 *   - Body size validation: >4KB rejected with error event
 *   - Empty body rejected with error event
 *   - Presence_count never contains user list
 *
 * Strategy: mock the DO state, Firestore client, and WebSocket to isolate
 * pure business logic in ChannelDurableObject without Workers runtime deps.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  type ServerEvent,
  MAX_BODY_BYTES,
} from "../src/ws-protocol.ts";

// ── Minimal mocks ─────────────────────────────────────────────────────────────

/**
 * MockWebSocket satisfies the Cloudflare Workers WebSocket interface
 * by providing all required stubs. Actual test assertions use the
 * `sent` and `closed` properties.
 *
 * The CF workers-types WebSocket has extra methods (serializeAttachment,
 * deserializeAttachment, accept, readyState, url, protocol, extensions).
 * We stub them all so strict type-checking passes.
 */
class MockWebSocket implements WebSocket {
  sent: ServerEvent[] = [];
  closed: { code: number; reason: string } | null = null;
  tags: string[] = [];

  // ── WebSocket required stubs ────────────────────────────────────────────
  readonly readyState: number = 1; // OPEN
  readonly url: string = "ws://test";
  readonly protocol: string = "bearer.test";
  readonly extensions: string = "";
  binaryType: "arraybuffer" | "blob" = "arraybuffer";

  accept(): void { /* no-op stub */ }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serializeAttachment(_attachment: any): void { /* no-op stub */ }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deserializeAttachment(): any { return null; }
  addEventListener(): void { /* no-op stub */ }
  removeEventListener(): void { /* no-op stub */ }
  dispatchEvent(): boolean { return true; }

  // ── Actual test-observable methods ──────────────────────────────────────
  send(data: string | ArrayBuffer | ArrayBufferView): void {
    const raw = typeof data === "string" ? data : new TextDecoder().decode(data as ArrayBuffer);
    this.sent.push(JSON.parse(raw) as ServerEvent);
  }

  close(code?: number, reason?: string): void {
    this.closed = { code: code ?? 1000, reason: reason ?? "" };
  }

  // ── Test helpers ─────────────────────────────────────────────────────────
  lastEvent(): ServerEvent | undefined {
    return this.sent[this.sent.length - 1];
  }

  eventsOfType<T extends ServerEvent["type"]>(type: T): ServerEvent[] {
    return this.sent.filter((e) => e.type === type);
  }
}

/** Minimal DurableObjectState mock. */
function makeMockState(sockets: MockWebSocket[] = []) {
  const storage = new Map<string, unknown>();
  let alarmTime: number | null = null;

  return {
    _sockets: sockets as WebSocket[],
    getWebSockets(): WebSocket[] {
      return this._sockets;
    },
    getTags(ws: WebSocket): string[] {
      return (ws as unknown as MockWebSocket).tags;
    },
    acceptWebSocket(ws: WebSocket, tags: string[]): void {
      (ws as unknown as MockWebSocket).tags = tags;
      this._sockets.push(ws);
    },
    storage: {
      async get<T>(key: string): Promise<T | undefined> {
        return storage.get(key) as T | undefined;
      },
      async put(key: string, value: unknown): Promise<void> {
        storage.set(key, value);
      },
      async getAlarm(): Promise<number | null> {
        return alarmTime;
      },
      async setAlarm(time: number): Promise<void> {
        alarmTime = time;
      },
    },
    waitUntil(p: Promise<unknown>): void {
      p.catch(() => {});
    },
  };
}

/** Minimal Env mock. */
const mockEnv = {
  CHANNEL: {} as DurableObjectNamespace,
  KV_JWKS: {} as KVNamespace,
  KV_CACHE: {} as KVNamespace,
  FIREBASE_PROJECT_ID: "test-project",
  FIREBASE_SERVICE_ACCOUNT_JSON: "{}",
  ENV: "development" as const,
  CORS_ORIGINS: "http://localhost:8081",
};

// ── Helpers to construct DO with injected deps ─────────────────────────────

async function buildDo(
  config = { slowModeSeconds: 60, ephemeralTtlHours: 24 },
  connectedSockets: MockWebSocket[] = []
) {
  const { ChannelDurableObject } = await import("../src/channel-durable-object.ts");
  const state = makeMockState(connectedSockets);
  await state.storage.put("channel:config", config);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doInstance = new ChannelDurableObject(state as any, mockEnv as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doInstance as any).channelId = "test-channel";
  return { doInstance, state };
}

/** Helper: register a MockWebSocket into a DO instance with a given uid. */
function registerSocket(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doInstance: any,
  state: ReturnType<typeof makeMockState>,
  ws: MockWebSocket,
  uid: string,
  nickname = "TestUser"
): void {
  state.acceptWebSocket(ws as unknown as WebSocket, [uid]);
  doInstance.socketMeta.set(ws, { uid, nickname, connectedAt: Date.now() });
}

// ── Mock Firestore client ─────────────────────────────────────────────────────

vi.mock("../src/firestore-rest-client.ts", () => ({
  createMessage: vi.fn().mockResolvedValue(undefined),
  deleteMessage: vi.fn().mockResolvedValue(undefined),
  getChannelConfig: vi.fn().mockResolvedValue({ slowModeSeconds: 60, ephemeralTtlHours: 24 }),
  updateMessagePromoted: vi.fn().mockResolvedValue(undefined),
}));

// ── Mock firebase-auth-verify ─────────────────────────────────────────────────

vi.mock("../src/firebase-auth-verify.ts", () => ({
  verifyFirebaseToken: vi.fn().mockResolvedValue({ uid: "uid-alice", email: "alice@test.com" }),
  extractTokenFromRequest: vi.fn().mockReturnValue("fake-token"),
  AuthError: class AuthError extends Error {
    constructor(msg: string) {
      super(msg);
      this.name = "AuthError";
    }
  },
}));

// ── Test suites ───────────────────────────────────────────────────────────────

describe("Slow-mode enforcement (server-authoritative)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows first message from a uid", async () => {
    const ws = new MockWebSocket();
    const { doInstance, state } = await buildDo({ slowModeSeconds: 60, ephemeralTtlHours: 24 });
    registerSocket(doInstance, state, ws, "uid-alice", "Alice");

    await doInstance.webSocketMessage(ws as unknown as WebSocket, JSON.stringify({ type: "send_message", body: "Hello" }));

    expect(ws.eventsOfType("rate_limit")).toHaveLength(0);
    const msgEvents = ws.eventsOfType("message");
    expect(msgEvents).toHaveLength(1);
    if (msgEvents[0].type === "message") {
      expect(msgEvents[0].payload.body).toBe("Hello");
      expect(msgEvents[0].payload.authorUid).toBe("uid-alice");
    }
  });

  it("rejects second message within slowModeSeconds with rate_limit", async () => {
    const ws = new MockWebSocket();
    const { doInstance, state } = await buildDo({ slowModeSeconds: 60, ephemeralTtlHours: 24 });
    registerSocket(doInstance, state, ws, "uid-alice", "Alice");

    await doInstance.webSocketMessage(ws as unknown as WebSocket, JSON.stringify({ type: "send_message", body: "First" }));
    await doInstance.webSocketMessage(ws as unknown as WebSocket, JSON.stringify({ type: "send_message", body: "Second" }));

    const rateEvents = ws.eventsOfType("rate_limit");
    expect(rateEvents).toHaveLength(1);
    if (rateEvents[0].type === "rate_limit") {
      expect(rateEvents[0].retryAfter).toBeGreaterThan(0);
      expect(rateEvents[0].retryAfter).toBeLessThanOrEqual(60);
    }
    // Second message must NOT be broadcast
    expect(ws.eventsOfType("message")).toHaveLength(1);
  });

  it("allows message after slowModeSeconds have elapsed", async () => {
    const ws = new MockWebSocket();
    const { doInstance, state } = await buildDo({ slowModeSeconds: 1, ephemeralTtlHours: 24 });
    registerSocket(doInstance, state, ws, "uid-alice", "Alice");
    // Backdate last message time by 2 seconds — beyond the 1s slow-mode window
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doInstance as any).slowModeMap.set("uid-alice", Date.now() - 2000);

    await doInstance.webSocketMessage(ws as unknown as WebSocket, JSON.stringify({ type: "send_message", body: "Later" }));

    expect(ws.eventsOfType("rate_limit")).toHaveLength(0);
    expect(ws.eventsOfType("message")).toHaveLength(1);
  });

  it("slow-mode is per-uid — different uids do not block each other", async () => {
    const wsAlice = new MockWebSocket();
    const wsBob = new MockWebSocket();
    const { doInstance, state } = await buildDo({ slowModeSeconds: 60, ephemeralTtlHours: 24 });
    registerSocket(doInstance, state, wsAlice, "uid-alice", "Alice");
    registerSocket(doInstance, state, wsBob, "uid-bob", "Bob");

    // Alice sends first
    await doInstance.webSocketMessage(wsAlice as unknown as WebSocket, JSON.stringify({ type: "send_message", body: "Alice msg" }));
    // Bob sends immediately after — must NOT be rate-limited by Alice's slot
    await doInstance.webSocketMessage(wsBob as unknown as WebSocket, JSON.stringify({ type: "send_message", body: "Bob msg" }));

    expect(wsBob.eventsOfType("rate_limit")).toHaveLength(0);
  });
});

describe("Presence count (anonymized)", () => {
  it("broadcasts presence_count as integer with no user list", async () => {
    const ws1 = new MockWebSocket();
    const ws2 = new MockWebSocket();
    const ws3 = new MockWebSocket();
    const { doInstance } = await buildDo(
      { slowModeSeconds: 60, ephemeralTtlHours: 24 },
      [ws1, ws2, ws3]
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doInstance as any).lastPresenceCount = -1; // force broadcast
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doInstance as any).broadcastPresence();

    for (const ws of [ws1, ws2, ws3]) {
      const events = ws.eventsOfType("presence_count");
      expect(events.length).toBeGreaterThanOrEqual(1);
      const last = events[events.length - 1];
      if (last.type === "presence_count") {
        expect(last.count).toBe(3);
        // Anti-pattern: must NOT include user identifiers
        expect((last as Record<string, unknown>).users).toBeUndefined();
        expect((last as Record<string, unknown>).uids).toBeUndefined();
        expect((last as Record<string, unknown>).nicknames).toBeUndefined();
      }
    }
  });

  it("does not re-broadcast if count unchanged", async () => {
    const ws = new MockWebSocket();
    const { doInstance } = await buildDo({ slowModeSeconds: 60, ephemeralTtlHours: 24 }, [ws]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doInstance as any).lastPresenceCount = 1; // matches socket count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doInstance as any).broadcastPresence();

    expect(ws.eventsOfType("presence_count")).toHaveLength(0);
  });
});

describe("subscribe_since replay buffer", () => {
  it("replays only messages after the given timestamp", async () => {
    const ws = new MockWebSocket();
    const { doInstance, state } = await buildDo({ slowModeSeconds: 60, ephemeralTtlHours: 24 });
    registerSocket(doInstance, state, ws, "uid-alice", "Alice");

    const now = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doInstance as any).recentMessages.push(
      { id: "m1", channelId: "test-channel", authorUid: "u1", authorNickname: "U1",
        body: "old", createdAt: now - 5000, expiresAt: now + 86400000 },
      { id: "m2", channelId: "test-channel", authorUid: "u1", authorNickname: "U1",
        body: "recent", createdAt: now - 1000, expiresAt: now + 86400000 }
    );

    await doInstance.webSocketMessage(
      ws as unknown as WebSocket,
      JSON.stringify({ type: "subscribe_since", timestamp: now - 3000 })
    );

    const msgEvents = ws.eventsOfType("message");
    expect(msgEvents).toHaveLength(1);
    if (msgEvents[0].type === "message") {
      expect(msgEvents[0].payload.id).toBe("m2");
    }
  });

  it("does not replay expired messages", async () => {
    const ws = new MockWebSocket();
    const { doInstance, state } = await buildDo({ slowModeSeconds: 60, ephemeralTtlHours: 24 });
    registerSocket(doInstance, state, ws, "uid-alice", "Alice");

    const now = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doInstance as any).recentMessages.push({
      id: "m-expired", channelId: "test-channel", authorUid: "u1", authorNickname: "U1",
      body: "expired", createdAt: now - 1000, expiresAt: now - 1, // already expired
    });

    await doInstance.webSocketMessage(
      ws as unknown as WebSocket,
      JSON.stringify({ type: "subscribe_since", timestamp: now - 5000 })
    );

    expect(ws.eventsOfType("message")).toHaveLength(0);
  });
});

describe("Message deduplication (idempotent retry)", () => {
  it("silently drops retry within DEDUP_WINDOW_MS with same content", async () => {
    const ws = new MockWebSocket();
    // slowModeSeconds=0 so slow-mode won't interfere; dedup should still block
    const { doInstance, state } = await buildDo({ slowModeSeconds: 0, ephemeralTtlHours: 24 });
    registerSocket(doInstance, state, ws, "uid-alice", "Alice");

    await doInstance.webSocketMessage(ws as unknown as WebSocket, JSON.stringify({ type: "send_message", body: "dup" }));
    const countAfterFirst = ws.eventsOfType("message").length;

    // Immediate retry with same body
    await doInstance.webSocketMessage(ws as unknown as WebSocket, JSON.stringify({ type: "send_message", body: "dup" }));

    expect(ws.eventsOfType("message").length).toBe(countAfterFirst);
    expect(ws.eventsOfType("rate_limit")).toHaveLength(0); // silent drop, not rate_limit
  });
});

describe("Body validation", () => {
  it("rejects body exceeding 4096 bytes with PAYLOAD_TOO_LARGE error", async () => {
    const ws = new MockWebSocket();
    const { doInstance, state } = await buildDo({ slowModeSeconds: 60, ephemeralTtlHours: 24 });
    registerSocket(doInstance, state, ws, "uid-alice", "Alice");

    const oversized = "x".repeat(MAX_BODY_BYTES + 1);
    await doInstance.webSocketMessage(
      ws as unknown as WebSocket,
      JSON.stringify({ type: "send_message", body: oversized })
    );

    const errors = ws.eventsOfType("error");
    expect(errors.length).toBeGreaterThanOrEqual(1);
    if (errors[0].type === "error") {
      expect(errors[0].code).toBe("PAYLOAD_TOO_LARGE");
    }
    expect(ws.eventsOfType("message")).toHaveLength(0);
  });

  it("rejects whitespace-only body with EMPTY_BODY error", async () => {
    const ws = new MockWebSocket();
    const { doInstance, state } = await buildDo({ slowModeSeconds: 60, ephemeralTtlHours: 24 });
    registerSocket(doInstance, state, ws, "uid-alice", "Alice");

    await doInstance.webSocketMessage(
      ws as unknown as WebSocket,
      JSON.stringify({ type: "send_message", body: "   " })
    );

    const errors = ws.eventsOfType("error");
    expect(errors.length).toBeGreaterThanOrEqual(1);
    if (errors[0].type === "error") {
      expect(errors[0].code).toBe("EMPTY_BODY");
    }
  });

  it("rejects malformed JSON with PARSE_ERROR", async () => {
    const ws = new MockWebSocket();
    const { doInstance, state } = await buildDo({ slowModeSeconds: 60, ephemeralTtlHours: 24 });
    registerSocket(doInstance, state, ws, "uid-alice", "Alice");

    await doInstance.webSocketMessage(ws as unknown as WebSocket, "this is not json");

    const errors = ws.eventsOfType("error");
    expect(errors.length).toBeGreaterThanOrEqual(1);
    if (errors[0].type === "error") {
      expect(errors[0].code).toBe("PARSE_ERROR");
    }
  });
});
