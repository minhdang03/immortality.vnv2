/**
 * use-book-1on1-session — booking flow hooks for 1-on-1 paid sessions with Đăng.
 *
 * useBook1on1Session(): mutation — pick slot → confirm → payment → room link
 * useMyBookings(): list own confirmed 1-on-1 bookings (upcoming + past)
 *
 * Flow:
 *   1. User picks slot from useDangAvailability()
 *   2. POST /api/bookings → server creates booking + payment intent
 *   3. Client opens payment sheet (from payment-service Phase 8)
 *   4. Server webhook confirms → booking.status = 'confirmed', roomId set
 *   5. useMyBookings() refetches → shows confirmed booking with join link
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '../services/api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export interface Booking1on1 {
  id: string;
  slotId: string;
  startsAt: string;        // ISO datetime
  durationMinutes: number;
  priceVnd: number;        // final price set by Đăng at slot creation
  priceRangeLabel: string; // "2–5 triệu" display
  status: BookingStatus;
  roomId: string | null;   // set once booking confirmed + room created
  joinUrl: string | null;  // video call join URL (from video-call-service)
  calendarInviteUrl: string | null;
  type: '1on1';
}

export interface PeerSessionBooking {
  id: string;
  sessionId: string;
  title: string;
  scheduledAt: string;
  status: 'registered' | 'attended' | 'missed';
  joinUrl: string | null;
  type: 'peer';
}

export type AnyBooking = Booking1on1 | PeerSessionBooking;

export interface Book1on1Input {
  slotId: string;
}

export interface Book1on1Response {
  booking: Booking1on1;
  /** Opaque payment intent client secret — passed to payment-service (Phase 8) */
  paymentClientSecret: string;
}

// ── Query keys ────────────────────────────────────────────────────────────────

const KEYS = {
  myBookings: ['my-bookings'] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * Initiates a 1-on-1 booking.
 * Returns booking + paymentClientSecret for Phase 8 payment-service.
 * Caller must complete payment flow; booking stays 'pending_payment' until webhook.
 */
export function useBook1on1Session() {
  const queryClient = useQueryClient();

  return useMutation<Book1on1Response, Error, Book1on1Input>({
    mutationFn: (input) =>
      apiClient.post<Book1on1Response>('/api/bookings/1on1', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.myBookings });
      queryClient.invalidateQueries({ queryKey: ['dang-availability'] });
    },
  });
}

/**
 * All bookings for current user — both 1-on-1 and peer sessions.
 * Filtered client-side into upcoming/past by caller.
 */
export function useMyBookings() {
  return useQuery<AnyBooking[], Error>({
    queryKey: KEYS.myBookings,
    queryFn: async () => {
      try {
        return await apiClient.get<AnyBooking[]>('/api/bookings/me');
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return [];
        throw err;
      }
    },
    staleTime: 30 * 1000, // 30s — bookings confirm via webhook, poll fresh
  });
}

// ── Filter helpers ─────────────────────────────────────────────────────────────

export function isUpcomingBooking(b: AnyBooking): boolean {
  const scheduledAt =
    b.type === '1on1' ? b.startsAt : b.scheduledAt;
  return new Date(scheduledAt) > new Date();
}

export function isPastBooking(b: AnyBooking): boolean {
  return !isUpcomingBooking(b);
}
