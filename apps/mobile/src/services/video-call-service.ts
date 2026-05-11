/**
 * video-call-service — provider abstraction for video calls.
 *
 * DECISION DEFERRED: anh chưa chọn Daily.co vs Whereby vs LiveKit.
 * Default: daily-co stub (returns placeholder URLs, logs usage).
 * Real SDK install deferred — see video-call-providers/README.md.
 *
 * To switch provider: change `videoCallProvider` export below.
 * Each provider stub implements VideoCallProvider interface.
 */
import { dailyCoProvider } from './video-call-providers/daily-co-stub-provider';
import { wherebyProvider } from './video-call-providers/whereby-stub-provider';
import { liveKitProvider } from './video-call-providers/livekit-stub-provider';

// ── Interface ──────────────────────────────────────────────────────────────────

export type VideoCallProviderName = 'daily' | 'whereby' | 'livekit';

export interface CreateRoomResult {
  roomId: string;
  /** Provider-specific room URL — used for host link */
  roomUrl: string;
}

export interface VideoCallProvider {
  name: VideoCallProviderName;
  /**
   * Creates a new video room for the given bookingId.
   * Called server-side after booking confirmed; stub returns placeholder.
   */
  createRoom(bookingId: string): Promise<CreateRoomResult>;
  /**
   * Returns a join link for a participant.
   * uid is used to generate participant token where applicable.
   */
  getJoinLink(roomId: string, uid: string): Promise<string>;
  /**
   * Returns an embed URL for in-app WebView rendering (if provider supports).
   * Returns null if provider does not support embed (open native browser instead).
   */
  getEmbedUrl(roomId: string): string | null;
}

// ── Active provider ───────────────────────────────────────────────────────────

/**
 * Change this to wherebyProvider or liveKitProvider once anh decides.
 * All providers satisfy VideoCallProvider interface — swap is one line.
 */
export const videoCallProvider: VideoCallProvider = dailyCoProvider;

// Re-export stubs so tests can import individually
export { dailyCoProvider, wherebyProvider, liveKitProvider };
