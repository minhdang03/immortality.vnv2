/**
 * use-profile — TanStack Query hooks for Bay Cùng profiles.
 *
 * useMyProfile(): own profile (current auth user)
 * useProfile(uid): any user's profile by uid
 * useBayCungPeers(uid): mutual companions list
 * useFounderOfferings(uid): paid 1-on-1 + courses for isFounder profiles
 * useUpdateFocus(): PATCH /api/profiles/me/focus
 *
 * Anti-patterns: profile shape NEVER includes follower count, post count,
 * badge tier, or any engagement metric.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';
import { apiClient, ApiError } from '../services/api-client';

// ── Types ──────────────────────────────────────────────────────────────────

export type ChuNo =
  | 'thieu-hieu-biet'
  | 'ong-ba-lac-hau'
  | 'dinh-kien'
  | 'chu-no-giau-mat';

export interface CurrentFocus {
  chuNo: ChuNo;
  technique: string;
  capLuyenPct: number; // 0-100, stored as integer
}

export interface PathEntry {
  date: string; // ISO date string
  text: string; // 1-line technical update
}

export interface FullProfile {
  uid: string;
  nickname: string | null;
  photoUrl: string | null; // R2 CDN URL or null (falls back to GradientAvatar)
  currentFocus: CurrentFocus | null;
  pathTimeline: PathEntry[];
  thaiyangHoursMonth: number; // Thái Dương Quyền hours this month
  huongDiCount: number; // answers / parallel paths contributed
  isFounder: boolean; // drives paid-offerings section ONLY — never styling
  createdAt: string;
}

export type PeerSummary = {
  uid: string;
  nickname: string | null;
  photoUrl: string | null;
  currentFocusLabel: string | null; // "phá định kiến" or "cấp 1 · 47%"
};

export interface BayCungPeers {
  peers: PeerSummary[];
  totalCount: number; // only used internally, never shown publicly as badge
}

// ── Query keys ─────────────────────────────────────────────────────────────

const profileKey = (uid: string) => ['profile', uid] as const;
const peersKey = (uid: string) => ['profile-peers', uid] as const;

// ── useMyProfile ───────────────────────────────────────────────────────────

export function useMyProfile() {
  const uid = useAuthStore((s) => s.uid);

  return useQuery<FullProfile | null, Error>({
    queryKey: uid ? profileKey(uid) : ['profile', '__none__'],
    queryFn: async () => {
      if (!uid) return null;
      try {
        return await apiClient.get<FullProfile>(`/api/profiles/${uid}`);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
  });
}

// ── useProfile (any uid) ───────────────────────────────────────────────────

export function useProfile(uid: string | null) {
  return useQuery<FullProfile | null, Error>({
    queryKey: uid ? profileKey(uid) : ['profile', '__none__'],
    queryFn: async () => {
      if (!uid) return null;
      try {
        return await apiClient.get<FullProfile>(`/api/profiles/${uid}`);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
  });
}

// ── useBayCungPeers ────────────────────────────────────────────────────────

export function useBayCungPeers(uid: string | null) {
  return useQuery<BayCungPeers, Error>({
    queryKey: uid ? peersKey(uid) : ['profile-peers', '__none__'],
    queryFn: async () => {
      if (!uid) return { peers: [], totalCount: 0 };
      try {
        return await apiClient.get<BayCungPeers>(`/api/bay-cung/peers/${uid}`);
      } catch (err) {
        if (err instanceof ApiError && (err.status === 404 || err.status === 401)) {
          return { peers: [], totalCount: 0 };
        }
        throw err;
      }
    },
    enabled: !!uid,
    staleTime: 2 * 60 * 1000,
  });
}

// ── useUpdateFocus ─────────────────────────────────────────────────────────

export interface UpdateFocusPayload {
  chuNo: ChuNo;
  technique: string;
  capLuyenPct: number;
}

export function useUpdateFocus() {
  const qc = useQueryClient();
  const uid = useAuthStore((s) => s.uid);

  return useMutation<FullProfile, Error, UpdateFocusPayload>({
    mutationFn: (body) => apiClient.patch<FullProfile>('/api/profiles/me/focus', body),
    onSuccess: (updated) => {
      if (uid) qc.setQueryData(profileKey(uid), updated);
    },
  });
}

// ── useFounderOfferings ────────────────────────────────────────────────────
// For Đăng's profile: fetch paid 1-on-1 + courses.

export interface AvailableSlot {
  datetime: string; // ISO
  label: string; // "15.04 · 19h"
}

export interface OneOnOneOffering {
  title: string;
  priceLabelVnd: string; // "2-5 triệu"
  durationRange: string; // "60-180 phút"
  description: string;
  availableSlots: AvailableSlot[];
  bookingUrl: string;
}

export interface CourseOffering {
  id: string;
  title: string;
  priceVnd: number;
  durationLabel: string;
  thumbLabel: string; // e.g. "NLTT 01"
}

export interface FounderOfferings {
  oneOnOne: OneOnOneOffering | null;
  courses: CourseOffering[];
}

export function useFounderOfferings(founderUid: string | null) {
  return useQuery<FounderOfferings | null, Error>({
    queryKey: ['founder-offerings', founderUid],
    queryFn: async () => {
      if (!founderUid) return null;
      try {
        return await apiClient.get<FounderOfferings>(
          `/api/bay-cung/founder-offerings/${founderUid}`,
        );
      } catch (err) {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!founderUid,
    staleTime: 10 * 60 * 1000,
  });
}
