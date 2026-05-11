/**
 * PeerSessionCard — card for a single phiên đồng đẳng (free peer session).
 *
 * Shows: title + host avatar + datetime + registration count + Tham gia button.
 *
 * Anti-FOMO enforced:
 *   ✗ NO host follower count
 *   ✗ NO "trending" / "popular" label
 *   ✗ registrationCount = logistics (who signed up) NOT engagement metric
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { GradientAvatar } from '../ui/gradient-avatar';
import { colors, typography, fontSizes, spacing, radii } from '../../theme';
import type { PeerSession } from '../../hooks/use-peer-sessions';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSessionDatetime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString('vi-VN', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}g ${m}p` : `${h} giờ`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface PeerSessionCardProps {
  session: PeerSession;
  onJoinPress: (session: PeerSession) => void;
  onCardPress: (session: PeerSession) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PeerSessionCard({
  session,
  onJoinPress,
  onCardPress,
}: PeerSessionCardProps) {
  const isLive = session.status === 'live';
  const isEnded = session.status === 'ended';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onCardPress(session)}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={`Phiên ${session.title}`}
    >
      {/* Live badge */}
      {isLive && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
      )}

      {/* Host row */}
      <View style={styles.hostRow}>
        <GradientAvatar uid={session.host.uid} size={32} />
        <Text style={styles.hostName} numberOfLines={1}>
          {session.host.nickname ?? 'Thành viên'}
        </Text>
        {/* NOTE: no follower count here — anti-FOMO */}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {session.title}
      </Text>

      {/* Meta row: datetime + duration + registration count */}
      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          {formatSessionDatetime(session.scheduledAt)}
        </Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.meta}>{formatDuration(session.durationMinutes)}</Text>
        <Text style={styles.metaDot}>·</Text>
        {/* registrationCount = who signed up, shown for logistics (not FOMO) */}
        <Text style={styles.meta}>
          {session.registrationCount} người đã đăng ký
        </Text>
      </View>

      {/* CTA */}
      {!isEnded && (
        <TouchableOpacity
          style={[styles.joinButton, isLive && styles.joinButtonLive]}
          onPress={() => onJoinPress(session)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isLive ? 'Vào phiên ngay' : 'Tham gia'}
        >
          <Text style={styles.joinButtonText}>
            {isLive ? 'Vào phiên ngay' : 'Tham gia'}
          </Text>
        </TouchableOpacity>
      )}

      {isEnded && (
        <Text style={styles.endedLabel}>Đã kết thúc</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing[4],
    gap: spacing[2],
    shadowColor: '#161310',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EF4444',
    borderRadius: radii.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  liveBadgeText: {
    fontFamily: typography.sansBold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  hostName: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    flex: 1,
  },
  title: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.base,
    color: colors.ink,
    lineHeight: fontSizes.base * 1.4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  meta: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
  },
  metaDot: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
  },
  joinButton: {
    marginTop: spacing[1],
    backgroundColor: colors.gold,
    borderRadius: radii.md,
    paddingVertical: spacing[2],
    alignItems: 'center',
  },
  joinButtonLive: {
    backgroundColor: '#EF4444',
  },
  joinButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.sm,
    color: '#FFFFFF',
  },
  endedLabel: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    marginTop: spacing[1],
  },
});
