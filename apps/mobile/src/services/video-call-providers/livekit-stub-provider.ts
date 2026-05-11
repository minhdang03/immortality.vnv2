/**
 * livekit-stub-provider — LiveKit stub for VideoCallProvider interface.
 *
 * STUB: No real SDK installed. Returns placeholder URLs and logs usage.
 * To activate: `pnpm add @livekit/react-native` + implement real methods.
 * See README.md in this directory for integration notes.
 *
 * Note: LiveKit is self-hosted (or LiveKit Cloud). Requires own infra/server token.
 * Unlike Daily/Whereby, no SaaS account needed if self-hosted.
 */
import type { VideoCallProvider, CreateRoomResult } from '../video-call-service';

const STUB_BASE = 'https://placeholder.livekit.battudao.com';

export const liveKitProvider: VideoCallProvider = {
  name: 'livekit',

  async createRoom(bookingId: string): Promise<CreateRoomResult> {
    console.warn(
      '[video-call-service] LiveKit stub: createRoom called for booking',
      bookingId,
      '— real SDK not installed. Returning placeholder.',
    );
    const roomId = `btd-${bookingId}`;
    return {
      roomId,
      roomUrl: `${STUB_BASE}/rooms/${roomId}`,
    };
  },

  async getJoinLink(roomId: string, uid: string): Promise<string> {
    console.warn(
      '[video-call-service] LiveKit stub: getJoinLink called',
      { roomId, uid },
      '— returning placeholder URL. Real impl requires server-generated token.',
    );
    // Real impl: server generates JWT token for uid, client uses livekit-client SDK
    return `${STUB_BASE}/rooms/${roomId}?participant=${uid}`;
  },

  getEmbedUrl(_roomId: string): string | null {
    // LiveKit uses native SDK — no iframe embed. Opens in full-screen native view.
    return null;
  },
};
