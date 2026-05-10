/**
 * useCurrentProfile — fetches the authenticated user's profile from
 * workers/api /api/profiles/:uid via TanStack Query.
 *
 * Falls back gracefully when API is unreachable (returns null data, no throw).
 * Workers/api is built in Phase 2; until then, the query will 404 and return null.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';
import { apiClient, ApiError } from '../services/api-client';

export interface ApiProfile {
  uid: string;
  nickname: string | null;
  isAnonymous: boolean;
  createdAt: string;
}

export function useCurrentProfile() {
  const uid = useAuthStore((s) => s.uid);

  return useQuery<ApiProfile | null>({
    queryKey: ['profile', uid],
    queryFn: async () => {
      if (!uid) return null;
      try {
        return await apiClient.get<ApiProfile>(`/api/profiles/${uid}`);
      } catch (err) {
        // 404 = profile not yet created on API side (Phase 2 not deployed)
        // Treat as null rather than error so UI doesn't break in Phase 5
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
  });
}
