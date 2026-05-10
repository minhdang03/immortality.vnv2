/**
 * Unit tests for ws-protocol.ts encode/decode helpers.
 * No Workers runtime needed — pure TS logic.
 */

import { describe, it, expect } from "vitest";
import {
  encodeEvent,
  decodeClientEvent,
  MAX_BODY_BYTES,
  RECENT_BUFFER_CAP,
  PRESENCE_INTERVAL_MS,
  DEDUP_WINDOW_MS,
  WS_CODE,
} from "../src/ws-protocol.ts";

describe("encodeEvent", () => {
  it("serializes a message event to JSON string", () => {
    const raw = encodeEvent({
      type: "message",
      payload: {
        id: "msg-1",
        channelId: "ch-1",
        authorUid: "uid-1",
        authorNickname: "Tester",
        body: "Hello",
        createdAt: 1000,
        expiresAt: 2000,
      },
    });
    const parsed = JSON.parse(raw);
    expect(parsed.type).toBe("message");
    expect(parsed.payload.body).toBe("Hello");
  });

  it("serializes a rate_limit event", () => {
    const raw = encodeEvent({ type: "rate_limit", retryAfter: 47 });
    const parsed = JSON.parse(raw);
    expect(parsed.type).toBe("rate_limit");
    expect(parsed.retryAfter).toBe(47);
  });

  it("serializes a presence_count event — no user list", () => {
    const raw = encodeEvent({ type: "presence_count", count: 3 });
    const parsed = JSON.parse(raw);
    expect(parsed.type).toBe("presence_count");
    expect(parsed.count).toBe(3);
    // Anti-pattern: must NOT contain user identifiers
    expect(parsed.users).toBeUndefined();
    expect(parsed.uids).toBeUndefined();
  });

  it("serializes a promoted event", () => {
    const raw = encodeEvent({ type: "promoted", messageId: "m1", questionId: "q1" });
    const parsed = JSON.parse(raw);
    expect(parsed.type).toBe("promoted");
    expect(parsed.messageId).toBe("m1");
    expect(parsed.questionId).toBe("q1");
  });
});

describe("decodeClientEvent", () => {
  it("parses a send_message event", () => {
    const result = decodeClientEvent(JSON.stringify({ type: "send_message", body: "Hi" }));
    expect(result).not.toBeNull();
    expect(result?.type).toBe("send_message");
    if (result?.type === "send_message") {
      expect(result.body).toBe("Hi");
    }
  });

  it("parses a subscribe_since event", () => {
    const result = decodeClientEvent(
      JSON.stringify({ type: "subscribe_since", timestamp: 1234567890 })
    );
    expect(result?.type).toBe("subscribe_since");
  });

  it("parses a ping event", () => {
    const result = decodeClientEvent(JSON.stringify({ type: "ping" }));
    expect(result?.type).toBe("ping");
  });

  it("returns null for malformed JSON", () => {
    expect(decodeClientEvent("not-json")).toBeNull();
  });

  it("returns null for JSON without type field", () => {
    expect(decodeClientEvent(JSON.stringify({ body: "missing type" }))).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(decodeClientEvent("")).toBeNull();
  });

  it("returns null for non-object JSON", () => {
    expect(decodeClientEvent("42")).toBeNull();
    expect(decodeClientEvent('"string"')).toBeNull();
    expect(decodeClientEvent("null")).toBeNull();
  });
});

describe("constants", () => {
  it("MAX_BODY_BYTES is 4096", () => {
    expect(MAX_BODY_BYTES).toBe(4096);
  });

  it("RECENT_BUFFER_CAP is 100", () => {
    expect(RECENT_BUFFER_CAP).toBe(100);
  });

  it("PRESENCE_INTERVAL_MS is 10 seconds", () => {
    expect(PRESENCE_INTERVAL_MS).toBe(10_000);
  });

  it("DEDUP_WINDOW_MS is 5 seconds", () => {
    expect(DEDUP_WINDOW_MS).toBe(5_000);
  });

  it("WS_CODE.UNAUTHORIZED is 4401", () => {
    expect(WS_CODE.UNAUTHORIZED).toBe(4401);
  });

  it("WS_CODE.SLOW_MODE is 4029", () => {
    expect(WS_CODE.SLOW_MODE).toBe(4029);
  });
});
