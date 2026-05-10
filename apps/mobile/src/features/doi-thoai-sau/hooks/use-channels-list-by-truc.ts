/**
 * use-channels-list-by-truc — TanStack Query hook fetching all channels from
 * GET /api/channels, grouped by Trục (1/2/3 topic axis).
 *
 * Anti-tier: channels grouped by TRỤC (subject axis), NOT by skill level.
 * Never shows "Beginner" / "Advanced" groupings — topic only.
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/api-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Channel {
  id: string;
  slug: string;
  name: string;
  truc: 1 | 2 | 3;
  description: string;
  slowModeSeconds: number;
  ephemeralTtlHours: number;
  memberCount: number;
  lastMessageAt: number | null;
}

export interface ChannelsByTruc {
  truc: 1 | 2 | 3;
  label: string;
  channels: Channel[];
}

const TRUC_LABELS: Record<1 | 2 | 3, string> = {
  1: 'TRỤC 1 · CƠ THỂ VẬT LÝ',
  2: 'TRỤC 2 · TÂM LÝ & HÀNH VI',
  3: 'TRỤC 3 · TRI THỨC & NHẬN THỨC',
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useChannelsList() {
  return useQuery<Channel[]>({
    queryKey: ['channels'],
    queryFn: () => apiClient.get<Channel[]>('/api/channels'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useChannelsGroupedByTruc(): {
  sections: ChannelsByTruc[];
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useChannelsList();

  if (!data) {
    return { sections: [], isLoading, error: error as Error | null };
  }

  const map = new Map<1 | 2 | 3, Channel[]>();
  for (const ch of data) {
    const group = map.get(ch.truc) ?? [];
    group.push(ch);
    map.set(ch.truc, group);
  }

  const sections: ChannelsByTruc[] = ([1, 2, 3] as const)
    .filter((t) => map.has(t))
    .map((t) => ({
      truc: t,
      label: TRUC_LABELS[t],
      channels: map.get(t)!.sort((a, b) => a.slug.localeCompare(b.slug)),
    }));

  return { sections, isLoading: false, error: null };
}
