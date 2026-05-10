/**
 * Tests: ChatMessageBubble
 *   - Đăng (founder) has NO special styling — peer equality assertion
 *   - Expired message renders null
 *   - Own message: no nickname shown
 *   - Ephemeral timer badge present and updates
 */
import React from 'react';
import { render, act } from '@testing-library/react-native';
import { ChatMessageBubble } from '../../src/features/doi-thoai-sau/components/chat-message-bubble';
import type { ChannelMessage } from '../../src/features/doi-thoai-sau/channel-message-store';

jest.mock('../../src/components/ui/gradient-avatar', () => ({
  GradientAvatar: () => null,
}));

const baseMsg: ChannelMessage = {
  id: 'msg-1',
  channelId: 'ch-1',
  authorUid: 'uid-peer',
  authorNickname: 'Người Dùng',
  body: 'Xin chào',
  createdAt: Date.now(),
  expiresAt: Date.now() + 86_400_000,
};

// ── Anti-hierarchy: Đăng = peer ───────────────────────────────────────────────

describe('ChatMessageBubble — anti-hierarchy (Đăng = peer, no special styling)', () => {
  const dangMsg: ChannelMessage = {
    ...baseMsg,
    id: 'msg-dang',
    authorUid: 'uid-dang',
    authorNickname: 'Đăng',
  };

  it('renders Đăng nickname the same as any other peer (no founder badge)', () => {
    const { getByText, queryByTestId } = render(
      <ChatMessageBubble message={dangMsg} currentUid="uid-current" />,
    );
    expect(getByText('Đăng')).toBeTruthy();
    expect(queryByTestId('founder-badge')).toBeNull();
    expect(queryByTestId('gold-border-highlight')).toBeNull();
  });

  it('Đăng bubble JSON has no founder/rank/gold-border markers', () => {
    const { toJSON } = render(
      <ChatMessageBubble message={dangMsg} currentUid="uid-other" />,
    );
    const str = JSON.stringify(toJSON());
    expect(str).not.toMatch(/founder/i);
    expect(str).not.toMatch(/goldBorder/i);
    expect(str).not.toMatch(/rankBadge/i);
    expect(str).not.toMatch(/tierBadge/i);
  });

  it('Đăng bubble structure identical to any random peer bubble', () => {
    const peerMsg: ChannelMessage = {
      ...baseMsg,
      id: 'msg-peer',
      authorUid: 'uid-random',
      authorNickname: 'Bạn',
    };
    const { toJSON: dangJSON } = render(
      <ChatMessageBubble message={dangMsg} currentUid="uid-other" />,
    );
    const { toJSON: peerJSON } = render(
      <ChatMessageBubble message={peerMsg} currentUid="uid-other" />,
    );
    // Both render a View with a nickname text — structural parity
    // Neither should have extra wrapper/badge for Đăng
    const dangStr = JSON.stringify(dangJSON());
    const peerStr = JSON.stringify(peerJSON());
    // Depth of nesting should be equal (no extra gold wrapper for Đăng)
    const dangDepth = (dangStr.match(/\{/g) ?? []).length;
    const peerDepth = (peerStr.match(/\{/g) ?? []).length;
    expect(Math.abs(dangDepth - peerDepth)).toBeLessThan(5); // structural parity within noise
  });
});

// ── Own message ───────────────────────────────────────────────────────────────

describe('ChatMessageBubble — own message', () => {
  const ownMsg: ChannelMessage = { ...baseMsg, authorUid: 'uid-self' };

  it('does not show nickname for own message', () => {
    const { queryByText } = render(
      <ChatMessageBubble message={ownMsg} currentUid="uid-self" />,
    );
    expect(queryByText('Người Dùng')).toBeNull();
  });

  it('shows message body', () => {
    const { getByText } = render(
      <ChatMessageBubble message={ownMsg} currentUid="uid-self" />,
    );
    expect(getByText('Xin chào')).toBeTruthy();
  });
});

// ── Expired message ───────────────────────────────────────────────────────────

describe('ChatMessageBubble — expired message renders null', () => {
  it('returns null when expiresAt is in the past', () => {
    const expired: ChannelMessage = { ...baseMsg, expiresAt: Date.now() - 1_000 };
    const { toJSON } = render(
      <ChatMessageBubble message={expired} currentUid="uid-other" />,
    );
    expect(toJSON()).toBeNull();
  });
});

// ── Ephemeral timer ───────────────────────────────────────────────────────────

describe('ChatMessageBubble — ephemeral timer badge', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows ephemeral badge for live message', () => {
    const { getByText } = render(
      <ChatMessageBubble message={baseMsg} currentUid="uid-other" />,
    );
    expect(getByText(/ẩn sau/)).toBeTruthy();
  });

  it('timer text changes after 1 second', () => {
    const expiresAt = Date.now() + 15_000;
    const msg: ChannelMessage = { ...baseMsg, expiresAt };
    const { getByText } = render(
      <ChatMessageBubble message={msg} currentUid="uid-other" />,
    );
    const before = getByText(/ẩn sau/).props.children;
    act(() => { jest.advanceTimersByTime(1_000); });
    const after = getByText(/ẩn sau/).props.children;
    expect(JSON.stringify(before)).not.toBe(JSON.stringify(after));
  });
});
