/**
 * ChannelDurableObject — one DO instance per btd_channels channelId.
 *
 * Responsibilities:
 *   - Accept WebSocket upgrades (Hibernation API — DO sleeps between messages)
 *   - Server-enforce slow-mode (reject early messages with rate_limit event)
 *   - Persist messages to Firestore via REST client
 *   - Broadcast messages to all connected sockets
 *   - Maintain anonymized presence_count (no user list ever)
 *   - Schedule DO alarms for ephemeral TTL message deletion
 *   - Replay recent messages buffer on reconnect (subscribe_since)
 *
 * Architecture note: DO is single-threaded per channel → no slow-mode race conditions.
 * Hibernation API: connections survive DO sleep → critical for slow chat (low msg rate).
 */

import {
  type ClientEvent,
  type ServerEvent,
  type WsMessage,
  WS_CODE,
  MAX_BODY_BYTES,
  RECENT_BUFFER_CAP,
  PRESENCE_INTERVAL_MS,
  DEDUP_WINDOW_MS,
  encodeEvent,
  decodeClientEvent,
} from "./ws-protocol.ts";
import {
  createMessage,
  deleteMessage,
  getChannelConfig,
  type MessageData,
} from "./firestore-rest-client.ts";
import { verifyFirebaseToken, AuthError } from "./firebase-auth-verify.ts";
import type { Env } from "./worker-env.d.ts";

// ── DO persistent storage keys ────────────────────────────────────────────────

const STORAGE_KEY_CONFIG = "channel:config";
const STORAGE_KEY_ALARM_MSGS = "alarm:msgs"; // Map<messageId, expiresAt>

// ── In-memory state (reset on cold start — intentional, best-effort) ──────────

interface SocketMeta {
  uid: string;
  nickname: string;
  connectedAt: number;
}

interface ChannelConfig {
  slowModeSeconds: number;
  ephemeralTtlHours: number;
}

// ── Main class ────────────────────────────────────────────────────────────────

export class ChannelDurableObject {
  private readonly state: DurableObjectState;
  private readonly env: Env;

  /** channelId extracted from request URL on first fetch. */
  private channelId = "";

  /** In-memory: uid → last message timestamp (epoch ms). Authoritative slow-mode store. */
  private readonly slowModeMap = new Map<string, number>();

  /** In-memory: socket → metadata. Rebuilt on DO wake from Hibernation tags. */
  private readonly socketMeta = new Map<WebSocket, SocketMeta>();

  /** Recent messages buffer — best-effort replay cap 100. Canonical store = Firestore. */
  private readonly recentMessages: WsMessage[] = [];

  /** Dedup map: clientMsgKey → timestamp (prevent retry duplicates within 5s). */
  private readonly dedupMap = new Map<string, number>();

  /** Channel config loaded from Firestore on first message after cold start. */
  private config: ChannelConfig | null = null;

  /** Last broadcasted presence count — avoid noisy repeat broadcasts. */
  private lastPresenceCount = -1;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  // ── Entry point — Worker routes WS upgrade here ─────────────────────────────

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Extract channelId from path: /ws/channels/:channelId
    const match = url.pathname.match(/^\/ws\/channels\/([^/]+)$/);
    if (!match) {
      return new Response("Not found", { status: 404 });
    }
    this.channelId = match[1];

    // Only accept WebSocket upgrades
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    // Verify auth BEFORE upgrade — reject 4401 if invalid
    let uid: string;
    let nickname: string;
    try {
      const verified = await verifyFirebaseToken(
        request,
        this.env.KV_JWKS,
        this.env.FIREBASE_PROJECT_ID
      );
      uid = verified.uid;
      // Nickname fetched from token display name or defaulted — caller should
      // pass nickname via profile lookup. For now use uid prefix as fallback.
      nickname = (verified.email?.split("@")[0] ?? uid.slice(0, 8));
    } catch (err) {
      if (err instanceof AuthError) {
        // Close with 4401 using a pair trick: upgrade then immediately close
        const { 0: client, 1: server } = new WebSocketPair();
        server.accept();
        server.close(WS_CODE.UNAUTHORIZED, "Unauthorized");
        return new Response(null, {
          status: 101,
          webSocket: client,
        });
      }
      return new Response("Internal error during auth", { status: 500 });
    }

    // Upgrade the connection using Hibernation API
    const { 0: client, 1: server } = new WebSocketPair();

    // Tag the socket with uid for recovery after hibernation
    this.state.acceptWebSocket(server, [uid]);

    // Track in-memory meta
    this.socketMeta.set(server, { uid, nickname, connectedAt: Date.now() });

    // Load config if not yet loaded
    await this.ensureConfig();

    // Broadcast updated presence count
    this.broadcastPresence();

    // Schedule presence alarm if not already set
    await this.schedulePresenceAlarm();

    // Respond with correct Sec-WebSocket-Protocol echo if token was in subprotocol
    const proto = request.headers.get("Sec-WebSocket-Protocol") ?? "";
    const responseHeaders: HeadersInit = {};
    if (proto.includes("bearer.")) {
      // Echo back only the non-token subprotocols (or none)
      const others = proto
        .split(",")
        .map((s) => s.trim())
        .filter((s) => !s.startsWith("bearer."));
      if (others.length > 0) {
        responseHeaders["Sec-WebSocket-Protocol"] = others.join(", ");
      }
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
      headers: responseHeaders,
    });
  }

  // ── Hibernation API handlers ──────────────────────────────────────────────

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const raw = typeof message === "string" ? message : new TextDecoder().decode(message);
    const event = decodeClientEvent(raw);

    if (!event) {
      ws.send(encodeEvent({ type: "error", code: "PARSE_ERROR", message: "Invalid JSON" }));
      return;
    }

    // Recover uid from Hibernation tags when socketMeta is cold
    const meta = this.getOrRecoverMeta(ws);
    if (!meta) {
      ws.close(WS_CODE.UNAUTHORIZED, "Session expired — reconnect");
      return;
    }

    switch (event.type) {
      case "send_message":
        await this.handleSendMessage(ws, meta, event);
        break;
      case "subscribe_since":
        this.handleSubscribeSince(ws, event.timestamp);
        break;
      case "ping":
        // Hibernation API keeps WS alive; ping is a no-op (pong implicit)
        break;
      default:
        // Unknown event type — ignore silently (forward compat)
        break;
    }
  }

  webSocketClose(ws: WebSocket, code: number, reason: string): void {
    this.socketMeta.delete(ws);
    this.broadcastPresence();
  }

  webSocketError(ws: WebSocket, error: unknown): void {
    this.socketMeta.delete(ws);
    this.broadcastPresence();
  }

  // ── Alarm handler — TTL deletion + presence ───────────────────────────────

  async alarm(): Promise<void> {
    const now = Date.now();

    // 1. Delete expired messages from Firestore
    const alarmMsgs = await this.loadAlarmMessages();
    const toDelete: string[] = [];

    for (const [messageId, expiresAt] of alarmMsgs.entries()) {
      if (now >= expiresAt) {
        try {
          await deleteMessage(
            messageId,
            this.env.FIREBASE_PROJECT_ID,
            this.env.FIREBASE_SERVICE_ACCOUNT_JSON
          );
        } catch {
          // Non-fatal — TTL cron sweeper in /workers/api also handles this
        }
        toDelete.push(messageId);
      }
    }

    if (toDelete.length > 0) {
      for (const id of toDelete) alarmMsgs.delete(id);
      await this.saveAlarmMessages(alarmMsgs);

      // Also evict from recent buffer
      this.evictExpiredFromBuffer(now);
    }

    // 2. Presence broadcast (every PRESENCE_INTERVAL_MS)
    const currentCount = this.state.getWebSockets().length;
    if (currentCount !== this.lastPresenceCount) {
      this.broadcastToAll({ type: "presence_count", count: currentCount });
      this.lastPresenceCount = currentCount;
    }

    // 3. Reschedule if there are still live sockets or pending expirations
    if (currentCount > 0 || alarmMsgs.size > 0) {
      await this.schedulePresenceAlarm();
    }
  }

  // ── send_message handler ──────────────────────────────────────────────────

  private async handleSendMessage(
    ws: WebSocket,
    meta: SocketMeta,
    event: Extract<ClientEvent, { type: "send_message" }>
  ): Promise<void> {
    const config = await this.ensureConfig();
    const now = Date.now();

    // Body size validation (4 KB hard limit)
    const bodyBytes = new TextEncoder().encode(event.body).length;
    if (bodyBytes > MAX_BODY_BYTES) {
      ws.send(
        encodeEvent({
          type: "error",
          code: "PAYLOAD_TOO_LARGE",
          message: `Message body exceeds ${MAX_BODY_BYTES} bytes`,
        })
      );
      return;
    }

    // Empty body check
    const trimmedBody = event.body.trim();
    if (!trimmedBody) {
      ws.send(encodeEvent({ type: "error", code: "EMPTY_BODY", message: "Message body is empty" }));
      return;
    }

    // Slow-mode check (server-authoritative)
    const lastMsgAt = this.slowModeMap.get(meta.uid) ?? 0;
    const elapsed = now - lastMsgAt;
    const slowMs = config.slowModeSeconds * 1000;

    if (lastMsgAt > 0 && elapsed < slowMs) {
      const retryAfter = Math.ceil((slowMs - elapsed) / 1000);
      ws.send(encodeEvent({ type: "rate_limit", retryAfter }));
      return; // NOT persisted, NOT broadcast
    }

    // Dedup check (retry within 5s with same content from same uid)
    const dedupKey = `${meta.uid}:${trimmedBody.slice(0, 64)}`;
    const lastDedupAt = this.dedupMap.get(dedupKey) ?? 0;
    if (now - lastDedupAt < DEDUP_WINDOW_MS) {
      // Silently drop duplicate
      return;
    }
    this.dedupMap.set(dedupKey, now);

    // Record slow-mode timestamp BEFORE async persist (DO is single-threaded)
    this.slowModeMap.set(meta.uid, now);

    // Build message
    const messageId = crypto.randomUUID();
    const expiresAt = now + config.ephemeralTtlHours * 3600 * 1000;

    const wsMsg: WsMessage = {
      id: messageId,
      channelId: this.channelId,
      authorUid: meta.uid,
      authorNickname: meta.nickname,
      body: trimmedBody,
      createdAt: now,
      expiresAt,
    };

    // Broadcast FIRST (low latency), then persist async
    this.broadcastToAll({ type: "message", payload: wsMsg });

    // Push to recent buffer (cap 100)
    this.recentMessages.push(wsMsg);
    if (this.recentMessages.length > RECENT_BUFFER_CAP) {
      this.recentMessages.shift();
    }

    // Persist to Firestore (fire-and-forget — non-blocking broadcast)
    const messageData: MessageData = {
      id: messageId,
      channelId: this.channelId,
      authorUid: meta.uid,
      authorNickname: meta.nickname,
      body: trimmedBody,
      createdAt: now,
      expiresAt,
    };

    // Use waitUntil to persist without blocking response
    this.state.waitUntil(
      this.persistMessageWithTtlAlarm(messageData)
    );
  }

  private async persistMessageWithTtlAlarm(data: MessageData): Promise<void> {
    try {
      await createMessage(
        data,
        this.env.FIREBASE_PROJECT_ID,
        this.env.FIREBASE_SERVICE_ACCOUNT_JSON
      );
    } catch {
      // Non-fatal — message already broadcast; Firestore failure is recoverable
      // TODO: Add structured logging when CF Workers logging is available
      return;
    }

    // Register message for TTL alarm deletion
    try {
      const alarmMsgs = await this.loadAlarmMessages();
      alarmMsgs.set(data.id, data.expiresAt);
      await this.saveAlarmMessages(alarmMsgs);

      // Schedule alarm at earliest expiry time
      const currentAlarm = await this.state.storage.getAlarm();
      if (currentAlarm === null || data.expiresAt < currentAlarm) {
        await this.state.storage.setAlarm(data.expiresAt);
      }
    } catch {
      // Non-fatal — TTL cron sweeper in /workers/api is the backstop
    }
  }

  // ── subscribe_since handler ───────────────────────────────────────────────

  private handleSubscribeSince(ws: WebSocket, since: number): void {
    const now = Date.now();
    const missed = this.recentMessages.filter(
      (m) => m.createdAt > since && m.expiresAt > now
    );
    for (const msg of missed) {
      ws.send(encodeEvent({ type: "message", payload: msg }));
    }
  }

  // ── Presence ──────────────────────────────────────────────────────────────

  private broadcastPresence(): void {
    const count = this.state.getWebSockets().length;
    if (count !== this.lastPresenceCount) {
      this.broadcastToAll({ type: "presence_count", count });
      this.lastPresenceCount = count;
    }
  }

  private async schedulePresenceAlarm(): Promise<void> {
    const currentAlarm = await this.state.storage.getAlarm();
    const nextAlarm = Date.now() + PRESENCE_INTERVAL_MS;
    // Only set if no alarm, or next presence interval is sooner than current alarm
    if (currentAlarm === null || nextAlarm < currentAlarm) {
      await this.state.storage.setAlarm(nextAlarm);
    }
  }

  // ── Broadcast helpers ─────────────────────────────────────────────────────

  private broadcastToAll(event: ServerEvent): void {
    const sockets = this.state.getWebSockets();
    const encoded = encodeEvent(event);
    for (const ws of sockets) {
      try {
        ws.send(encoded);
      } catch {
        // Socket closed between getWebSockets() and send — ignore
      }
    }
  }

  // ── Config loading ────────────────────────────────────────────────────────

  private async ensureConfig(): Promise<ChannelConfig> {
    if (this.config) return this.config;

    // Try DO persistent storage first (fast, avoids Firestore round-trip)
    const stored = await this.state.storage.get<ChannelConfig>(STORAGE_KEY_CONFIG);
    if (stored) {
      this.config = stored;
      return this.config;
    }

    // Fetch from Firestore
    const fetched = await getChannelConfig(
      this.channelId,
      this.env.FIREBASE_PROJECT_ID,
      this.env.FIREBASE_SERVICE_ACCOUNT_JSON
    );
    this.config = fetched;

    // Cache in DO storage (survives hibernation, cleared on explicit invalidation)
    await this.state.storage.put(STORAGE_KEY_CONFIG, fetched);
    return this.config;
  }

  // ── Alarm message registry ────────────────────────────────────────────────

  private async loadAlarmMessages(): Promise<Map<string, number>> {
    const stored = await this.state.storage.get<[string, number][]>(STORAGE_KEY_ALARM_MSGS);
    return new Map(stored ?? []);
  }

  private async saveAlarmMessages(msgs: Map<string, number>): Promise<void> {
    await this.state.storage.put(STORAGE_KEY_ALARM_MSGS, [...msgs.entries()]);
  }

  // ── Socket meta recovery after hibernation ────────────────────────────────

  /**
   * Recover SocketMeta from Hibernation API tags when in-memory map is cold.
   * Tags are set at acceptWebSocket time: [uid].
   */
  private getOrRecoverMeta(ws: WebSocket): SocketMeta | null {
    const cached = this.socketMeta.get(ws);
    if (cached) return cached;

    const tags = this.state.getTags(ws);
    if (!tags || tags.length === 0) return null;

    const uid = tags[0];
    const meta: SocketMeta = {
      uid,
      nickname: uid.slice(0, 8), // best-effort fallback after cold start
      connectedAt: Date.now(),
    };
    this.socketMeta.set(ws, meta);
    return meta;
  }

  // ── Buffer maintenance ────────────────────────────────────────────────────

  private evictExpiredFromBuffer(now: number): void {
    let i = 0;
    while (i < this.recentMessages.length && this.recentMessages[i].expiresAt <= now) {
      i++;
    }
    if (i > 0) this.recentMessages.splice(0, i);
  }
}
