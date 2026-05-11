/**
 * use-peer-sessions — hooks for Phiên đồng đẳng (free peer sessions).
 *
 * usePeerSessions(filter): list upcoming or past peer sessions
 * useCreatePeerSession(): mutation — anyone can create a session
 *
 * Anti-patterns enforced:
 *   ✗ No host follower count in session data
 *   ✗ No "popular sessions" engagement count
 *   ✗ registrationCount = who signed up (logistics), NOT engagement metric
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '../services/api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export type SessionFilter = 'upcoming' | 'past';

export interface PeerSessionHost {
  uid: string;
  nickname: string | null;
  photoUrl: string | null;
  // NOTE: NO follower count, NO post count, NO badge — anti-FOMO
}

export interface PeerSession {
  id: string;
  title: string;
  description: string | null;
  host: PeerSessionHost;
  scheduledAt: string; // ISO datetime
  durationMinutes: number;
  registrationCount: number; // who signed up (logistics only)
  isRegistered: boolean; // current user has joined
  roomId: string | null; // null until session starts
  status: 'scheduled' | 'live' | 'ended';
}

export interface CreatePeerSessionInput {
  title: string;
  description?: string;
  scheduledAt: string; // ISO datetime
  durationMinutes: number;
}

// ── Query keys ────────────────────────────────────────────────────────────────

const KEYS = {
  list: (filter: SessionFilter) => ['peer-sessions', filter] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function usePeerSessions(filter: SessionFilter = 'upcoming') {
  return useQuery<PeerSession[], Error>({
    queryKey: KEYS.list(filter),
    queryFn: async () => {
      try {
        return await apiClient.get<PeerSession[]>(
          `/api/peer-sessions?filter=${filter}`,
        );
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return [];
        throw err;
      }
    },
    staleTime: 60 * 1000, // 1 min
  });
}

export function useCreatePeerSession() {
  const queryClient = useQueryClient();

  return useMutation<PeerSession, Error, CreatePeerSessionInput>({
    mutationFn: (input) =>
      apiClient.post<PeerSession>('/api/peer-sessions', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peer-sessions'] });
    },
  });
}

export function useRegisterForSession() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { sessionId: string }>({
    mutationFn: ({ sessionId }) =>
      apiClient.post<void>(`/api/peer-sessions/${sessionId}/register`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peer-sessions'] });
    },
  });
}
