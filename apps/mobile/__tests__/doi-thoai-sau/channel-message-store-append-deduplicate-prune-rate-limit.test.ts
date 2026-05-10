/**
 * Tests: channel-message-store
 *   - appendMessage with dedup
 *   - pruneExpired removes expired messages
 *   - rate-limit setRateLimitRetryAfter / clearRateLimit
 *   - setPresence stores anonymized count — no user list
 *   - markPromoted updates message
 */
import { act } from 'react';
import { useChannelMessageStore } from '../../src/features/doi-thoai-sau/channel-message-store';

const CH = 'ch-test';

function makeMsg(id: string, expiresAt = Date.now() + 86_400_000) {
  return {
    id,
    channelId: CH,
    authorUid: `uid-${id}`,
    authorNickname: `Nick ${id}`,
    body: `Body ${id}`,
    createdAt: Date.now(),
    expiresAt,
  };
}

beforeEach(() => {
  useChannelMessageStore.setState({
    messagesByChannel: {},
    presenceByChannel: {},
    rateLimitRetryAfterMs: {},
  });
});

// ── appendMessage ─────────────────────────────────────────────────────────────

describe('appendMessage', () => {
  it('appends a new message', () => {
    act(() => { useChannelMessageStore.getState().appendMessage(CH, makeMsg('1')); });
    expect(useChannelMessageStore.getState().messagesByChannel[CH]).toHaveLength(1);
  });

  it('deduplicates by id', () => {
    const msg = makeMsg('dup');
    act(() => {
      useChannelMessageStore.getState().appendMessage(CH, msg);
      useChannelMessageStore.getState().appendMessage(CH, msg);
    });
    expect(useChannelMessageStore.getState().messagesByChannel[CH]).toHaveLength(1);
  });

  it('caps at 500 messages', () => {
    act(() => {
      for (let i = 0; i < 510; i++) {
        useChannelMessageStore.getState().appendMessage(CH, makeMsg(String(i)));
      }
    });
    expect(
      useChannelMessageStore.getState().messagesByChannel[CH].length,
    ).toBeLessThanOrEqual(500);
  });
});

// ── pruneExpired ──────────────────────────────────────────────────────────────

describe('pruneExpired', () => {
  it('removes messages past expiresAt, keeps live ones', () => {
    act(() => {
      useChannelMessageStore.getState().appendMessage(CH, makeMsg('live', Date.now() + 10_000));
      useChannelMessageStore.getState().appendMessage(CH, makeMsg('dead', Date.now() - 1_000));
      useChannelMessageStore.getState().pruneExpired(CH);
    });
    const msgs = useChannelMessageStore.getState().messagesByChannel[CH];
    expect(msgs.some((m) => m.id === 'live')).toBe(true);
    expect(msgs.every((m) => m.id !== 'dead')).toBe(true);
  });
});

// ── rate-limit ────────────────────────────────────────────────────────────────

describe('rate-limit', () => {
  it('setRateLimitRetryAfter converts seconds to future epoch ms', () => {
    const before = Date.now();
    act(() => { useChannelMessageStore.getState().setRateLimitRetryAfter(CH, 47); });
    const ms = useChannelMessageStore.getState().rateLimitRetryAfterMs[CH];
    expect(ms).toBeGreaterThanOrEqual(before + 47_000 - 10);
    expect(ms).toBeLessThanOrEqual(before + 47_000 + 200);
  });

  it('clearRateLimit sets to 0', () => {
    act(() => {
      useChannelMessageStore.getState().setRateLimitRetryAfter(CH, 60);
      useChannelMessageStore.getState().clearRateLimit(CH);
    });
    expect(useChannelMessageStore.getState().rateLimitRetryAfterMs[CH]).toBe(0);
  });
});

// ── setPresence — anti-pattern assertion ─────────────────────────────────────

describe('setPresence', () => {
  it('stores anonymized integer count — no user list field in store', () => {
    act(() => { useChannelMessageStore.getState().setPresence(CH, 9); });
    const state = useChannelMessageStore.getState();
    expect(state.presenceByChannel[CH]).toBe(9);

    // Anti-pattern: confirm no user-list leak
    const stateRecord = state as unknown as Record<string, unknown>;
    expect(stateRecord['userListByChannel']).toBeUndefined();
    expect(stateRecord['onlineUsers']).toBeUndefined();
    expect(stateRecord['userIdentities']).toBeUndefined();
  });
});

// ── markPromoted ──────────────────────────────────────────────────────────────

describe('markPromoted', () => {
  it('sets promotedToQuestionId on the target message', () => {
    act(() => {
      useChannelMessageStore.getState().appendMessage(CH, makeMsg('m1'));
      useChannelMessageStore.getState().markPromoted(CH, 'm1', 'q-xyz');
    });
    const msg = useChannelMessageStore.getState().messagesByChannel[CH].find(
      (m) => m.id === 'm1',
    );
    expect(msg?.promotedToQuestionId).toBe('q-xyz');
  });
});
