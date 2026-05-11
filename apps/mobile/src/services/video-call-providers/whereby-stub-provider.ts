/**
 * whereby-stub-provider — Whereby stub for VideoCallProvider interface.
 *
 * STUB: No real SDK installed. Returns placeholder URLs and logs usage.
 * To activate: `pnpm add @whereby.com/browser-sdk` + implement real methods.
 * See README.md in this directory for integration notes.
 */
import type { VideoCallProvider, CreateRoomResult } from '../video-call-service';

const STUB_BASE = 'https://placeholder.whereby.com';

export const wherebyProvider: VideoCallProvider = {
  name: 'whereby',

  async createRoom(bookingId: string): Promise<CreateRoomResult> {
    console.warn(
      '[video-call-service] Whereby stub: createRoom called for booking',
      bookingId,
      '— real SDK not installed. Returning placeholder.',
    );
    const roomId = `btd-${bookingId}`;
    return {
      roomId,
      roomUrl: `${STUB_BASE}/${roomId}`,
    };
  },

  async getJoinLink(roomId: string, uid: string): Promise<string> {
    console.warn(
      '[video-call-service] Whereby stub: getJoinLink called',
      { roomId, uid },
      '— returning placeholder URL.',
    );
    // Whereby uses meeting links — uid appended as displayName hint
    return `${STUB_BASE}/${roomId}?displayName=${uid}`;
  },

  getEmbedUrl(roomId: string): string | null {
    // Whereby supports iframe embed natively
    return `${STUB_BASE}/${roomId}?embed`;
  },
};
