/**
 * use-dang-availability — queries Firestore `dang_availability` collection
 * for 1-on-1 booking slots with Đăng.
 *
 * Self-hosted calendar (NOT Calendly) per decisions.md.
 * Slots are created by Đăng via admin; users can book available ones.
 *
 * Schema (Firestore `dang_availability/{slotId}`):
 *   startsAt:       Timestamp
 *   durationMinutes: number
 *   priceVnd:       number | null  // null = Đăng sets per content (2-5tr range)
 *   status:         'available' | 'booked' | 'cancelled'
 *   topic:          string | null  // optional session topic hint
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '../services/api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export type SlotStatus = 'available' | 'booked' | 'cancelled';

export interface DangAvailabilitySlot {
  id: string;
  startsAt: string;        // ISO datetime from Firestore Timestamp
  durationMinutes: number;
  priceVnd: number | null; // null = Đăng decides per content at booking
  priceRangeLabel: string; // e.g. "2–5 triệu" — display only, computed server-side
  status: SlotStatus;
  topic: string | null;
}

// ── Query keys ────────────────────────────────────────────────────────────────

const KEYS = {
  available: ['dang-availability', 'available'] as const,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Returns only 'available' slots sorted by startsAt asc.
 * Stale after 2 min — slots change infrequently, but bookings must reflect fast.
 */
export function useDangAvailability() {
  return useQuery<DangAvailabilitySlot[], Error>({
    queryKey: KEYS.available,
    queryFn: async () => {
      try {
        return await apiClient.get<DangAvailabilitySlot[]>(
          '/api/dang-availability?status=available',
        );
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return [];
        throw err;
      }
    },
    staleTime: 2 * 60 * 1000,
  });
}
