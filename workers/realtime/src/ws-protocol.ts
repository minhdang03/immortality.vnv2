/**
 * WebSocket protocol types for Bất Tử Đạo realtime chat.
 * Matches schema: docs/firestore-schema-btd-mobile.md §4 WebSocket protocol.
 *
 * Anti-pattern enforcement (spec § "Non-functional"):
 *   - Server NEVER emits typing indicators, read receipts, per-user online status.
 *   - presence_count is an anonymized integer — no user list ever transmitted.
 */

// ── Message shape (as broadcast to all subscribers) ──────────────────────────

export interface WsMessage {
  id: string;
  channelId: string;
  authorUid: string;
  authorNickname: string;
  body: string;
  createdAt: number; // epoch ms
  expiresAt: number; // epoch ms
  promotedToQuestionId?: string;
}

// ── Server → Client events ────────────────────────────────────────────────────

export type ServerEvent =
  | { type: "message"; payload: WsMessage }
  | { type: "rate_limit"; retryAfter: number } // seconds remaining
  | { type: "presence_count"; count: number }  // anonymized integer only
  | { type: "promoted"; messageId: string; questionId: string }
  | { type: "error"; code: string; message: string };

// ── Client → Server events ────────────────────────────────────────────────────

export type ClientEvent =
  | { type: "send_message"; body: string }           // body ≤ 4096 bytes
  | { type: "subscribe_since"; timestamp: number }   // request replay since epoch ms
  | { type: "ping" };                                // keep-alive (Hibernation handles otherwise)

// ── WS close codes ───────────────────────────────────────────────────────────

export const WS_CODE = {
  /** Unauthorized — token missing, expired, or invalid. */
  UNAUTHORIZED: 4401,
  /** Forbidden — valid token but insufficient access. */
  FORBIDDEN: 4403,
  /** Message body exceeds 4 KB hard limit. */
  PAYLOAD_TOO_LARGE: 4413,
  /** Slow-mode reject (4029 reserved by some draft specs). */
  SLOW_MODE: 4029,
} as const;

// ── Limits ───────────────────────────────────────────────────────────────────

/** Maximum message body size in bytes. */
export const MAX_BODY_BYTES = 4096;

/** Maximum number of recent messages held in DO in-memory buffer for replay. */
export const RECENT_BUFFER_CAP = 100;

/** Interval (ms) at which presence_count alarm fires. */
export const PRESENCE_INTERVAL_MS = 10_000;

/** Deduplication window (ms): same client retry within this window is ignored. */
export const DEDUP_WINDOW_MS = 5_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Serialize a ServerEvent for WS send. */
export function encodeEvent(event: ServerEvent): string {
  return JSON.stringify(event);
}

/** Parse a raw WS message string into a ClientEvent. Returns null on parse error. */
export function decodeClientEvent(raw: string): ClientEvent | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("type" in parsed) ||
      typeof (parsed as Record<string, unknown>).type !== "string"
    ) {
      return null;
    }
    return parsed as ClientEvent;
  } catch {
    return null;
  }
}
