/**
 * daily-co-stub-provider — Daily.co stub for VideoCallProvider interface.
 *
 * STUB: No real SDK installed. Returns placeholder URLs and logs usage.
 * To activate: `pnpm add @daily-co/daily-js` + implement real methods.
 * See README.md in this directory for integration notes.
 */
import type { VideoCallProvider, CreateRoomResult } from '../video-call-service';

const STUB_BASE = 'https://placeholder.daily.co';

export const dailyCoProvider: VideoCallProvider = {
  name: 'daily',

  async createRoom(bookingId: string): Promise<CreateRoomResult> {
    console.warn(
      '[video-call-service] Daily.co stub: createRoom called for booking',
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
      '[video-call-service] Daily.co stub: getJoinLink called',
      { roomId, uid },
      '— returning placeholder URL.',
    );
    return `${STUB_BASE}/${roomId}?uid=${uid}`;
  },

  getEmbedUrl(roomId: string): string | null {
    // Daily.co supports iframe embed — return embed URL pattern
    return `${STUB_BASE}/${roomId}?embed=1`;
  },
};
