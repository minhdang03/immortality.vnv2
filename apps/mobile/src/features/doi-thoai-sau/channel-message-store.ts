/**
 * channel-message-store — Zustand store for per-channel message cache.
 *
 * Anti-pattern enforcement:
 *   - NO typing indicator state
 *   - NO read receipt state
 *   - NO online/offline user state
 *   - presence_count is an anonymized integer only
 */
import { create } from 'zustand';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChannelMessage {
  id: string;
  channelId: string;
  authorUid: string;
  authorNickname: string;
  body: string;
  createdAt: number; // epoch ms
  expiresAt: number; // epoch ms
  promotedToQuestionId?: string;
}

interface ChannelState {
  /** Messages keyed by channelId, sorted oldest→newest */
  messagesByChannel: Record<string, ChannelMessage[]>;
  /** Anonymized presence count keyed by channelId — integer only, no user list */
  presenceByChannel: Record<string, number>;
  /** Slow-mode retry timestamp (epoch ms) keyed by channelId — 0 = not rate limited */
  rateLimitRetryAfterMs: Record<string, number>;

  appendMessage: (channelId: string, msg: ChannelMessage) => void;
  prependMessages: (channelId: string, msgs: ChannelMessage[]) => void;
  setPresence: (channelId: string, count: number) => void;
  setRateLimitRetryAfter: (channelId: string, retryAfterSeconds: number) => void;
  clearRateLimit: (channelId: string) => void;
  markPromoted: (channelId: string, messageId: string, questionId: string) => void;
  pruneExpired: (channelId: string) => void;
}

const MAX_CACHED_MESSAGES = 500;

export const useChannelMessageStore = create<ChannelState>((set) => ({
  messagesByChannel: {},
  presenceByChannel: {},
  rateLimitRetryAfterMs: {},

  appendMessage: (channelId, msg) =>
    set((state) => {
      const existing = state.messagesByChannel[channelId] ?? [];
      if (existing.some((m) => m.id === msg.id)) return state;
      const updated = [...existing, msg].slice(-MAX_CACHED_MESSAGES);
      return { messagesByChannel: { ...state.messagesByChannel, [channelId]: updated } };
    }),

  prependMessages: (channelId, msgs) =>
    set((state) => {
      const existing = state.messagesByChannel[channelId] ?? [];
      const existingIds = new Set(existing.map((m) => m.id));
      const novel = msgs.filter((m) => !existingIds.has(m.id));
      if (!novel.length) return state;
      const merged = [...novel, ...existing]
        .sort((a, b) => a.createdAt - b.createdAt)
        .slice(-MAX_CACHED_MESSAGES);
      return { messagesByChannel: { ...state.messagesByChannel, [channelId]: merged } };
    }),

  setPresence: (channelId, count) =>
    set((state) => ({
      presenceByChannel: { ...state.presenceByChannel, [channelId]: count },
    })),

  setRateLimitRetryAfter: (channelId, retryAfterSeconds) =>
    set((state) => ({
      rateLimitRetryAfterMs: {
        ...state.rateLimitRetryAfterMs,
        [channelId]: Date.now() + retryAfterSeconds * 1000,
      },
    })),

  clearRateLimit: (channelId) =>
    set((state) => ({
      rateLimitRetryAfterMs: { ...state.rateLimitRetryAfterMs, [channelId]: 0 },
    })),

  markPromoted: (channelId, messageId, questionId) =>
    set((state) => {
      const msgs = state.messagesByChannel[channelId] ?? [];
      const updated = msgs.map((m) =>
        m.id === messageId ? { ...m, promotedToQuestionId: questionId } : m,
      );
      return { messagesByChannel: { ...state.messagesByChannel, [channelId]: updated } };
    }),

  pruneExpired: (channelId) =>
    set((state) => {
      const now = Date.now();
      const msgs = state.messagesByChannel[channelId] ?? [];
      const live = msgs.filter((m) => m.expiresAt > now);
      if (live.length === msgs.length) return state;
      return { messagesByChannel: { ...state.messagesByChannel, [channelId]: live } };
    }),
}));
