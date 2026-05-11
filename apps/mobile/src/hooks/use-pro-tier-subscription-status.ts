/**
 * useProTierSubscriptionStatus — reads current user's Pro tier state.
 *
 * Source of truth: user profile field `proExpiresAt` (ISO string or null).
 * Computed from that:
 *   - isPro: boolean (proExpiresAt exists and is in future)
 *   - daysRemaining: number (0 when expired/null)
 *   - totalDays: number (billing cycle length — always 30 for 99K/tháng plan)
 *
 * "Còn 17/30 ngày" badge calculation lives here.
 *
 * No backend round-trip: reads from TanStack Query cache via useMyProfile.
 * Refresh on app foreground via React Query's refetchOnWindowFocus.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';
import { apiClient, ApiError } from '../services/api-client';

export const PRO_PLAN_DAYS = 30; // 99K/tháng billing cycle

export interface ProTierStatus {
  isPro: boolean;
  daysRemaining: number;   // 0 when not Pro
  totalDays: number;       // always PRO_PLAN_DAYS (30)
  proExpiresAt: Date | null;
  badgeLabel: string;      // "PRO · còn 17/30 ngày" or "" when not Pro
  isLoading: boolean;
}

interface ProProfileResponse {
  proExpiresAt: string | null;
}

const IS_DEV_MOCK = typeof __DEV__ !== 'undefined' && __DEV__;

// In dev, simulate an active Pro subscription expiring in 17 days.
const MOCK_PRO_EXPIRES_AT: string = new Date(
  Date.now() + 17 * 24 * 60 * 60 * 1000,
).toISOString();

export function useProTierSubscriptionStatus(): ProTierStatus {
  const uid = useAuthStore((s) => s.uid);

  const { data, isLoading } = useQuery<ProProfileResponse | null, Error>({
    queryKey: ['pro-tier-status', uid],
    queryFn: async () => {
      if (!uid) return null;
      if (IS_DEV_MOCK) {
        // Return mocked Pro subscription for dev
        return { proExpiresAt: MOCK_PRO_EXPIRES_AT };
      }
      try {
        return await apiClient.get<ProProfileResponse>(`/api/profiles/${uid}/pro-status`);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          return { proExpiresAt: null };
        }
        throw err;
      }
    },
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo<ProTierStatus>(() => {
    const rawExpiry = data?.proExpiresAt ?? null;
    const proExpiresAt = rawExpiry ? new Date(rawExpiry) : null;
    const now = Date.now();

    const isPro = proExpiresAt !== null && proExpiresAt.getTime() > now;

    const daysRemaining = isPro
      ? Math.max(0, Math.ceil((proExpiresAt!.getTime() - now) / (24 * 60 * 60 * 1000)))
      : 0;

    const badgeLabel = isPro
      ? `PRO · còn ${daysRemaining}/${PRO_PLAN_DAYS} ngày`
      : '';

    return {
      isPro,
      daysRemaining,
      totalDays: PRO_PLAN_DAYS,
      proExpiresAt,
      badgeLabel,
      isLoading,
    };
  }, [data, isLoading]);
}
