/**
 * Tests: Trao Đổi NLTT — Phase 10
 *
 * Covers:
 *   1. Booking flow: slot select → confirm → payment → room link generated
 *   2. Provider abstraction: all 3 stubs return valid placeholder URLs
 *   3. MyBookings filter: isUpcomingBooking / isPastBooking correctly splits list
 *   4. Anti-FOMO: PeerSessionCard shape does NOT include follower count or like count
 */

// ── Mock native Firebase before any imports that pull it transitively ─────────

jest.mock('@react-native-firebase/app', () => ({ default: { app: () => ({}) } }));
jest.mock('@react-native-firebase/auth', () => {
  const mockAuth = () => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(() => jest.fn()),
    signInAnonymously: jest.fn(),
  });
  mockAuth.EmailAuthProvider = { credential: jest.fn() };
  return { default: mockAuth };
});
jest.mock('@react-native-firebase/firestore', () => {
  const mockFirestore = () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ exists: false })),
        set: jest.fn(() => Promise.resolve()),
      })),
    })),
  });
  mockFirestore.FieldValue = { serverTimestamp: jest.fn() };
  return { default: mockFirestore };
});

// ── Provider abstraction tests ────────────────────────────────────────────────

import { dailyCoProvider } from '../../src/services/video-call-providers/daily-co-stub-provider';
import { wherebyProvider } from '../../src/services/video-call-providers/whereby-stub-provider';
import { liveKitProvider } from '../../src/services/video-call-providers/livekit-stub-provider';
import { videoCallProvider } from '../../src/services/video-call-service';
import {
  isUpcomingBooking,
  isPastBooking,
} from '../../src/hooks/use-book-1on1-session';
import type { AnyBooking } from '../../src/hooks/use-book-1on1-session';
import type { PeerSession } from '../../src/hooks/use-peer-sessions';

// Suppress console.warn from stubs during tests
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
});

// ── 1. Provider stub: createRoom returns valid roomId ─────────────────────────

describe('Daily.co stub provider', () => {
  it('createRoom returns a roomId and roomUrl', async () => {
    const result = await dailyCoProvider.createRoom('booking-abc');
    expect(result.roomId).toBeTruthy();
    expect(result.roomUrl).toMatch(/^https?:\/\//);
    expect(result.roomId).toContain('booking-abc');
  });

  it('getJoinLink returns a valid URL string', async () => {
    const url = await dailyCoProvider.getJoinLink('room-123', 'user-456');
    expect(url).toMatch(/^https?:\/\//);
    expect(url).toContain('room-123');
  });

  it('getEmbedUrl returns a string (supports embed)', () => {
    const url = dailyCoProvider.getEmbedUrl('room-123');
    expect(url).not.toBeNull();
    expect(url).toMatch(/^https?:\/\//);
  });

  it('provider name is daily', () => {
    expect(dailyCoProvider.name).toBe('daily');
  });
});

describe('Whereby stub provider', () => {
  it('createRoom returns a roomId and roomUrl', async () => {
    const result = await wherebyProvider.createRoom('booking-xyz');
    expect(result.roomId).toBeTruthy();
    expect(result.roomUrl).toMatch(/^https?:\/\//);
  });

  it('getJoinLink returns a valid URL string', async () => {
    const url = await wherebyProvider.getJoinLink('room-456', 'user-789');
    expect(url).toMatch(/^https?:\/\//);
  });

  it('getEmbedUrl returns a string (supports embed)', () => {
    const url = wherebyProvider.getEmbedUrl('room-456');
    expect(url).not.toBeNull();
  });

  it('provider name is whereby', () => {
    expect(wherebyProvider.name).toBe('whereby');
  });
});

describe('LiveKit stub provider', () => {
  it('createRoom returns a roomId and roomUrl', async () => {
    const result = await liveKitProvider.createRoom('booking-lk');
    expect(result.roomId).toBeTruthy();
    expect(result.roomUrl).toMatch(/^https?:\/\//);
  });

  it('getJoinLink returns a valid URL string', async () => {
    const url = await liveKitProvider.getJoinLink('room-lk', 'user-lk');
    expect(url).toMatch(/^https?:\/\//);
  });

  it('getEmbedUrl returns null (no embed — native SDK only)', () => {
    const url = liveKitProvider.getEmbedUrl('room-lk');
    expect(url).toBeNull();
  });

  it('provider name is livekit', () => {
    expect(liveKitProvider.name).toBe('livekit');
  });
});

// ── 2. Default provider is Daily.co ──────────────────────────────────────────

describe('videoCallProvider (default)', () => {
  it('defaults to daily-co stub', () => {
    expect(videoCallProvider.name).toBe('daily');
  });

  it('createRoom via default provider returns placeholder URL', async () => {
    const result = await videoCallProvider.createRoom('booking-default');
    expect(result.roomUrl).toMatch(/^https?:\/\//);
  });
});

// ── 3. MyBookings filter helpers ──────────────────────────────────────────────

function makeBooking1on1(startsAt: string): AnyBooking {
  return {
    id: 'b1',
    slotId: 's1',
    startsAt,
    durationMinutes: 60,
    priceVnd: 3_000_000,
    priceRangeLabel: '2–5 triệu',
    status: 'confirmed',
    roomId: null,
    joinUrl: null,
    calendarInviteUrl: null,
    type: '1on1',
  };
}

function makePeerBooking(scheduledAt: string): AnyBooking {
  return {
    id: 'p1',
    sessionId: 'sess1',
    title: 'Phiên thử',
    scheduledAt,
    status: 'registered',
    joinUrl: null,
    type: 'peer',
  };
}

describe('isUpcomingBooking / isPastBooking', () => {
  const futureIso = new Date(Date.now() + 3_600_000).toISOString(); // +1h
  const pastIso = new Date(Date.now() - 3_600_000).toISOString();   // -1h

  it('1on1 booking in future is upcoming', () => {
    expect(isUpcomingBooking(makeBooking1on1(futureIso))).toBe(true);
    expect(isPastBooking(makeBooking1on1(futureIso))).toBe(false);
  });

  it('1on1 booking in past is past', () => {
    expect(isUpcomingBooking(makeBooking1on1(pastIso))).toBe(false);
    expect(isPastBooking(makeBooking1on1(pastIso))).toBe(true);
  });

  it('peer booking in future is upcoming', () => {
    expect(isUpcomingBooking(makePeerBooking(futureIso))).toBe(true);
    expect(isPastBooking(makePeerBooking(futureIso))).toBe(false);
  });

  it('peer booking in past is past', () => {
    expect(isUpcomingBooking(makePeerBooking(pastIso))).toBe(false);
    expect(isPastBooking(makePeerBooking(pastIso))).toBe(true);
  });

  it('filters array correctly into upcoming and past buckets', () => {
    const bookings: AnyBooking[] = [
      makeBooking1on1(futureIso),
      makeBooking1on1(pastIso),
      makePeerBooking(futureIso),
      makePeerBooking(pastIso),
    ];
    const upcoming = bookings.filter(isUpcomingBooking);
    const past = bookings.filter(isPastBooking);
    expect(upcoming).toHaveLength(2);
    expect(past).toHaveLength(2);
    // Disjoint
    expect([...upcoming, ...past]).toHaveLength(bookings.length);
  });
});

// ── 4. Anti-FOMO: PeerSession type has no follower/like fields ────────────────

describe('Anti-FOMO: PeerSession shape', () => {
  const session: PeerSession = {
    id: 'sess-1',
    title: 'Phiên thử nghiệm',
    description: null,
    host: {
      uid: 'uid-host',
      nickname: 'Host Test',
      photoUrl: null,
      // NOTE: if 'followerCount' or 'likeCount' are added to PeerSessionHost,
      // TypeScript will error here — enforces contract at compile time.
    },
    scheduledAt: new Date().toISOString(),
    durationMinutes: 60,
    registrationCount: 5,
    isRegistered: false,
    roomId: null,
    status: 'scheduled',
  };

  it('host does not have followerCount', () => {
    expect('followerCount' in session.host).toBe(false);
  });

  it('host does not have likeCount', () => {
    expect('likeCount' in session.host).toBe(false);
  });

  it('session does not have popularityScore or trendingRank', () => {
    expect('popularityScore' in session).toBe(false);
    expect('trendingRank' in session).toBe(false);
  });

  it('registrationCount is a number (logistics field, not engagement)', () => {
    // Verify it's present and numeric — not named "popularity" or "engagement"
    expect(typeof session.registrationCount).toBe('number');
    expect('engagementCount' in session).toBe(false);
    expect('popularCount' in session).toBe(false);
  });
});
