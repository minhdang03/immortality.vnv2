/**
 * use-channel-websocket-with-slow-mode — partysocket WebSocket hook for a
 * single channel. Handles:
 *   - Auto-connect / disconnect on mount / unmount
 *   - Exponential backoff reconnect (partysocket built-in)
 *   - Firebase ID token in Sec-WebSocket-Protocol header
 *   - subscribe_since replay on reconnect
 *   - rate_limit → rateLimitRetryAfterMs countdown (server-enforced, client display only)
 *   - presence_count: anonymized integer, NEVER a user list
 *
 * Anti-pattern enforcement:
 *   - NO typing indicator
 *   - NO read receipt
 *   - NO per-user online status
 *
 * WS protocol types are inlined here (mirrors workers/realtime/src/ws-protocol.ts)
 * to avoid cross-workspace relative imports outside tsconfig paths.
 */
import { useEffect, useRef, useCallback } from 'react';
import PartySocket from 'partysocket';
import { getIdToken } from '../../../services/firebase-auth-service';
import {
  useChannelMessageStore,
  type ChannelMessage,
} from '../channel-message-store';

// ── WS protocol types (mirrored from workers/realtime/src/ws-protocol.ts) ────
// Kept inline to avoid cross-workspace relative imports outside tsconfig paths.

interface WsMessagePayload {
  id: string;
  channelId: string;
  authorUid: string;
  authorNickname: string;
  body: string;
  createdAt: number;
  expiresAt: number;
  promotedToQuestionId?: string;
}

type ServerEvent =
  | { type: 'message'; payload: WsMessagePayload }
  | { type: 'rate_limit'; retryAfter: number }
  | { type: 'presence_count'; count: number }
  | { type: 'promoted'; messageId: string; questionId: string }
  | { type: 'error'; code: string; message: string };

type ClientEvent =
  | { type: 'send_message'; body: string }
  | { type: 'subscribe_since'; timestamp: number }
  | { type: 'ping' };

const WS_UNAUTHORIZED_CODE = 4401;
const WS_OPEN = 1; // WebSocket.OPEN — use literal to avoid ReferenceError in Jest (no DOM)

// ── Constants ─────────────────────────────────────────────────────────────────

const WS_HOST = (process.env.EXPO_PUBLIC_REALTIME_URL ?? 'wss://api.battudao.com').replace(
  /^wss?:\/\//,
  '',
);

// ── Public interface ──────────────────────────────────────────────────────────

export interface UseChannelWsReturn {
  /** Send a chat message body. Server enforces slow-mode; may return rate_limit. */
  sendMessage: (body: string) => void;
  /** Epoch ms when slow-mode cooldown expires. 0 = not rate-limited. */
  rateLimitRetryAfterMs: number;
  /** Anonymized participant count — integer only, no identity info. */
  presenceCount: number;
  /** Whether socket is currently connected. */
  isConnected: boolean;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useChannelWebsocket(channelId: string): UseChannelWsReturn {
  const socketRef = useRef<InstanceType<typeof PartySocket> | null>(null);
  const lastSeenAtRef = useRef<number>(0);
  const isConnectedRef = useRef(false);

  const appendMessage = useChannelMessageStore((s) => s.appendMessage);
  const setPresence = useChannelMessageStore((s) => s.setPresence);
  const setRateLimitRetryAfter = useChannelMessageStore((s) => s.setRateLimitRetryAfter);
  const markPromoted = useChannelMessageStore((s) => s.markPromoted);
  const pruneExpired = useChannelMessageStore((s) => s.pruneExpired);

  const rateLimitRetryAfterMs = useChannelMessageStore(
    (s) => s.rateLimitRetryAfterMs[channelId] ?? 0,
  );
  const presenceCount = useChannelMessageStore(
    (s) => s.presenceByChannel[channelId] ?? 0,
  );

  const handleEvent = useCallback(
    (raw: string) => {
      let event: ServerEvent;
      try {
        event = JSON.parse(raw) as ServerEvent;
      } catch {
        return;
      }

      switch (event.type) {
        case 'message': {
          const msg: ChannelMessage = {
            id: event.payload.id,
            channelId: event.payload.channelId,
            authorUid: event.payload.authorUid,
            authorNickname: event.payload.authorNickname,
            body: event.payload.body,
            createdAt: event.payload.createdAt,
            expiresAt: event.payload.expiresAt,
            promotedToQuestionId: event.payload.promotedToQuestionId,
          };
          appendMessage(channelId, msg);
          lastSeenAtRef.current = Math.max(lastSeenAtRef.current, msg.createdAt);
          break;
        }
        case 'rate_limit':
          setRateLimitRetryAfter(channelId, event.retryAfter);
          break;
        case 'presence_count':
          // Anonymized integer only — NEVER expose user list
          setPresence(channelId, event.count);
          break;
        case 'promoted':
          markPromoted(channelId, event.messageId, event.questionId);
          break;
        case 'error':
          // Log code only, never token or PII
          console.warn('[WS] server error:', event.code, event.message);
          break;
      }
    },
    [channelId, appendMessage, setPresence, setRateLimitRetryAfter, markPromoted],
  );

  const sendClientEvent = useCallback((event: ClientEvent) => {
    const sock = socketRef.current;
    if (!sock || sock.readyState !== WS_OPEN) return;
    sock.send(JSON.stringify(event));
  }, []);

  const sendMessage = useCallback(
    (body: string) => {
      if (!body.trim()) return;
      sendClientEvent({ type: 'send_message', body: body.slice(0, 4096) });
    },
    [sendClientEvent],
  );

  useEffect(() => {
    let mounted = true;

    async function connect() {
      const token = await getIdToken();
      if (!mounted) return;

      // Token in Sec-WebSocket-Protocol (NOT query string — avoids proxy logging).
      const protocols: string[] = token ? [`bearer.${token}`] : [];

      const sock = new PartySocket({
        host: WS_HOST,
        room: channelId,
        path: `ws/channels/${channelId}`,
        // Exponential backoff: 250ms → max 8s
        minReconnectionDelay: 250,
        maxReconnectionDelay: 8_000,
        reconnectionDelayGrowFactor: 2,
        ...(protocols.length > 0 ? { protocols } : {}),
      });

      socketRef.current = sock;

      sock.addEventListener('open', () => {
        isConnectedRef.current = true;
        // Replay messages missed during disconnect
        if (lastSeenAtRef.current > 0) {
          sendClientEvent({ type: 'subscribe_since', timestamp: lastSeenAtRef.current });
        }
        pruneExpired(channelId);
      });

      sock.addEventListener('message', (evt: MessageEvent) => {
        if (typeof evt.data === 'string') handleEvent(evt.data);
      });

      sock.addEventListener('close', (evt: CloseEvent) => {
        isConnectedRef.current = false;
        if (evt.code === WS_UNAUTHORIZED_CODE) {
          console.warn('[WS] unauthorized — closing without reconnect');
          sock.close();
        }
      });

      sock.addEventListener('error', () => {
        isConnectedRef.current = false;
      });
    }

    connect().catch((err: unknown) => {
      console.warn('[WS] connect error:', (err as Error)?.message ?? 'unknown');
    });

    return () => {
      mounted = false;
      socketRef.current?.close();
      socketRef.current = null;
      isConnectedRef.current = false;
    };
  }, [channelId, handleEvent, sendClientEvent, pruneExpired]);

  return {
    sendMessage,
    rateLimitRetryAfterMs,
    presenceCount,
    isConnected: isConnectedRef.current,
  };
}
