/**
 * bay-cung-peer-list — 2-column grid of mutual companion mini-cards.
 *
 * Anti-patterns enforced:
 *  - NO "đã đồng hành X ngày" counter
 *  - NO follower count or mutual-day metric
 *  - NO years-followed metric
 *  - Peer state = technical focus label only
 *  - Max 6 visible; onSeeAll for full list
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GradientAvatar } from '../../../components/ui/gradient-avatar';
import { colors, typography, fontSizes, spacing, radii, shadows } from '../../../theme';
import type { PeerSummary } from '../../../hooks/use-profile';

const MAX_VISIBLE = 6;

function PeerCard({ peer, onPress }: { peer: PeerSummary; onPress?: (uid: string) => void }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(peer.uid)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Xem hồ sơ ${peer.nickname ?? 'thành viên'}`}
    >
      <GradientAvatar uid={peer.uid} nickname={peer.nickname} size={28} />
      <View style={styles.cardText}>
        <Text style={styles.name} numberOfLines={1}>{peer.nickname ?? 'Ẩn danh'}</Text>
        {peer.currentFocusLabel ? (
          <Text style={styles.state} numberOfLines={1}>{peer.currentFocusLabel}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

interface BayCungPeerListProps {
  peers: PeerSummary[];
  onPeerPress?: (uid: string) => void;
  onSeeAll?: () => void;
}

export function BayCungPeerList({ peers, onPeerPress, onSeeAll }: BayCungPeerListProps) {
  const visible = peers.slice(0, MAX_VISIBLE);

  if (visible.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Chưa có ai Bay Cùng.</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.grid}>
        {visible.map((peer) => (
          <PeerCard key={peer.uid} peer={peer} onPress={onPeerPress} />
        ))}
      </View>
      {peers.length > MAX_VISIBLE && onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAll}>
          <Text style={styles.seeAllText}>Xem tất cả →</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: spacing[5], marginBottom: spacing[4], gap: spacing[2] },
  card: {
    width: '48.5%', flexDirection: 'row', alignItems: 'center', gap: spacing[2] + 2,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.rule,
    borderRadius: radii.md, padding: spacing[2] + 2, ...shadows.card,
  },
  cardText: { flex: 1 },
  name: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.sm, color: colors.ink },
  state: { fontFamily: typography.sans, fontSize: 11, color: colors.inkMuted, marginTop: 1 },
  empty: { marginHorizontal: spacing[5], marginBottom: spacing[4], paddingVertical: spacing[4], alignItems: 'center' },
  emptyText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted },
  seeAll: { marginHorizontal: spacing[5], marginBottom: spacing[4], alignItems: 'flex-end' },
  seeAllText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.goldDeep, fontWeight: '500' },
});
