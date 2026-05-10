/**
 * Tests: useChannelWebsocket hook (partysocket mocked)
 *   - Creates socket on mount, closes on unmount
 *   - Appends message to store on 'message' event
 *   - Sets rateLimitRetryAfterMs on 'rate_limit' event
 *   - Sets anonymized presence count on 'presence_count' event
 *   - Sends subscribe_since on reconnect (second open) after messages seen
 */
import { renderHook, act } from '@testing-library/react-native';
import { useChannelMessageStore } from '../../src/features/doi-thoai-sau/channel-message-store';

// ── Mock partysocket ──────────────────────────────────────────────────────────
// jest.mock is hoisted so the factory must be self-contained.
// partysocket uses ESM default export, so we provide __esModule + default.

type EventListener = (evt: { data?: string; code?: number }) => void;

interface MockSocket {
  readyState: number;
  sentMessages: string[];
  addEventListener: (event: string, cb: EventListener) => void;
  send: (data: string) => void;
  close: () => void;
  simulateOpen: () => void;
  simulateMessage: (payload: object) => void;
  simulateClose: (code?: number) => void;
}

let mockLastInstance: MockSocket | null = null;

jest.mock('partysocket', () => {
  class FakePartySocket {
    private listeners: Record<string, EventListener[]> = {};
    readyState: number = 1; // OPEN
    sentMessages: string[] = [];

    constructor() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (FakePartySocket as any)._last = this;
    }

    addEventListener(event: string, cb: EventListener) {
      this.listeners[event] = [...(this.listeners[event] ?? []), cb];
    }

    send(data: string) { this.sentMessages.push(data); }
    close() { this.readyState = 3; } // CLOSED

    simulateOpen() {
      this.listeners['open']?.forEach((cb) => cb({}));
    }
    simulateMessage(payload: object) {
      this.listeners['message']?.forEach((cb) =>
        cb({ data: JSON.stringify(payload) }),
      );
    }
    simulateClose(code = 1000) {
      this.listeners['close']?.forEach((cb) => cb({ code }));
    }
  }

  return { __esModule: true, default: FakePartySocket };
});

// ── Mock firebase-auth-service ────────────────────────────────────────────────

jest.mock('../../src/services/firebase-auth-service', () => ({
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
}));

// ── Import after mocks ────────────────────────────────────────────────────────

import { useChannelWebsocket } from '../../src/features/doi-thoai-sau/hooks/use-channel-websocket-with-slow-mode';
import PartySocket from 'partysocket';

const CH = 'ch-ws-test';

// Helper to get the last created mock socket
function getLastSocket(): MockSocket {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (PartySocket as unknown as { _last: MockSocket })._last;
}

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (PartySocket as unknown as { _last: unknown })._last = null;
  mockLastInstance = null;
  useChannelMessageStore.setState({
    messagesByChannel: {},
    presenceByChannel: {},
    rateLimitRetryAfterMs: {},
  });
});

// ── Connect / disconnect ──────────────────────────────────────────────────────

describe('useChannelWebsocket — connect / disconnect', () => {
  it('creates a PartySocket on mount', async () => {
    const { unmount } = renderHook(() => useChannelWebsocket(CH));
    await act(async () => {});
    expect(getLastSocket()).not.toBeNull();
    unmount();
  });

  it('closes socket on unmount', async () => {
    const { unmount } = renderHook(() => useChannelWebsocket(CH));
    await act(async () => {});
    const sock = getLastSocket();
    unmount();
    expect(sock.readyState).toBe(3); // WebSocket.CLOSED
  });
});

// ── message event ─────────────────────────────────────────────────────────────

describe('useChannelWebsocket — message event → store', () => {
  it('appends message to channel store', async () => {
    renderHook(() => useChannelWebsocket(CH));
    await act(async () => {});
    const sock = getLastSocket();

    act(() => {
      sock.simulateOpen();
      sock.simulateMessage({
        type: 'message',
        payload: {
          id: 'msg-ws-1',
          channelId: CH,
          authorUid: 'uid-a',
          authorNickname: 'Alpha',
          body: 'Hello channel',
          createdAt: Date.now(),
          expiresAt: Date.now() + 86_400_000,
        },
      });
    });

    const msgs = useChannelMessageStore.getState().messagesByChannel[CH];
    expect(msgs).toHaveLength(1);
    expect(msgs[0].body).toBe('Hello channel');
  });
});

// ── rate_limit event ──────────────────────────────────────────────────────────

describe('useChannelWebsocket — rate_limit event → countdown', () => {
  it('sets rateLimitRetryAfterMs when rate_limit received', async () => {
    renderHook(() => useChannelWebsocket(CH));
    await act(async () => {});
    const sock = getLastSocket();
    const before = Date.now();

    act(() => {
      sock.simulateOpen();
      sock.simulateMessage({ type: 'rate_limit', retryAfter: 47 });
    });

    const ms = useChannelMessageStore.getState().rateLimitRetryAfterMs[CH];
    expect(ms).toBeGreaterThanOrEqual(before + 47_000 - 50);
    expect(ms).toBeLessThanOrEqual(before + 47_000 + 500);
  });
});

// ── presence_count — anti-pattern assertion ───────────────────────────────────

describe('useChannelWebsocket — presence_count (anonymized integer only)', () => {
  it('stores count, exposes no user list', async () => {
    renderHook(() => useChannelWebsocket(CH));
    await act(async () => {});
    const sock = getLastSocket();

    act(() => {
      sock.simulateOpen();
      sock.simulateMessage({ type: 'presence_count', count: 9 });
    });

    const state = useChannelMessageStore.getState();
    expect(state.presenceByChannel[CH]).toBe(9);
    const s = state as unknown as Record<string, unknown>;
    expect(s['userListByChannel']).toBeUndefined();
    expect(s['onlineUsers']).toBeUndefined();
  });
});

// ── subscribe_since on reconnect ──────────────────────────────────────────────

describe('useChannelWebsocket — subscribe_since on reconnect after messages seen', () => {
  it('sends subscribe_since with lastSeenAt timestamp after reconnect', async () => {
    renderHook(() => useChannelWebsocket(CH));
    await act(async () => {});
    const sock = getLastSocket();
    const msgTime = Date.now();

    act(() => {
      sock.simulateOpen();
      sock.simulateMessage({
        type: 'message',
        payload: {
          id: 'msg-before-disc',
          channelId: CH,
          authorUid: 'uid-b',
          authorNickname: 'Beta',
          body: 'before disconnect',
          createdAt: msgTime,
          expiresAt: msgTime + 86_400_000,
        },
      });
    });

    const sentBefore = sock.sentMessages.length;

    act(() => {
      sock.simulateClose(1006);
      sock.simulateOpen(); // reconnect
    });

    const newMsgs = sock.sentMessages
      .slice(sentBefore)
      .map((s) => JSON.parse(s) as { type: string; timestamp?: number });

    const sub = newMsgs.find((m) => m.type === 'subscribe_since');
    expect(sub).toBeDefined();
    expect(sub?.timestamp).toBeGreaterThanOrEqual(msgTime);
  });
});
