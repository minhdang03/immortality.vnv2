/**
 * PeerSessionDetailScreen — full detail view for a peer session.
 *
 * Route: TraoDoiNlttPeerSessionDetail { sessionId: string }
 *
 * Shows: title, host info, description, datetime, registration count,
 * and Join button (VideoCallJoinButton) when session is live or room is ready.
 *
 * Anti-FOMO: no host follower count, no engagement metrics.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '../../../services/api-client';
import { GradientAvatar } from '../../../components/ui/gradient-avatar';
import { VideoCallJoinButton } from '../../../components/trao-doi-nltt/video-call-join-button';
import { colors, typography, fontSizes, spacing, radii } from '../../../theme';
import type { PeerSession } from '../../../hooks/use-peer-sessions';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDatetime(isoString: string): string {
  return new Date(isoString).toLocaleString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
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

// ── Screen ────────────────────────────────────────────────────────────────────

export function PeerSessionDetailScreen() {
  const route = useRoute();
  const { sessionId } = (route.params ?? {}) as { sessionId: string };

  const sessionQuery = useQuery<PeerSession, Error>({
    queryKey: ['peer-session', sessionId],
    queryFn: async () => {
      try {
        return await apiClient.get<PeerSession>(`/api/peer-sessions/${sessionId}`);
      } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new Error('Không tải được thông tin phiên');
      }
    },
    enabled: Boolean(sessionId),
    staleTime: 30 * 1000,
  });

  if (sessionQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.goldDeep} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (sessionQuery.isError || !sessionQuery.data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Không tải được phiên này.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const session = sessionQuery.data;
  const isLive = session.status === 'live';
  const isEnded = session.status === 'ended';
  const canJoin = !isEnded && session.roomId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Live badge */}
        {isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>ĐANG DIỄN RA</Text>
          </View>
        )}

        {/* Title */}
        <Text style={styles.title}>{session.title}</Text>

        {/* Host row — NO follower count (anti-FOMO) */}
        <View style={styles.hostRow}>
          <GradientAvatar uid={session.host.uid} size={40} />
          <View style={styles.hostInfo}>
            <Text style={styles.hostLabel}>Host</Text>
            <Text style={styles.hostName}>
              {session.host.nickname ?? 'Thành viên'}
            </Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.metaBlock}>
          <MetaRow label="Thời gian" value={formatDatetime(session.scheduledAt)} />
          <MetaRow label="Thời lượng" value={formatDuration(session.durationMinutes)} />
          <MetaRow
            label="Đã đăng ký"
            value={`${session.registrationCount} người`}
          />
          <MetaRow label="Trạng thái" value={statusLabel(session.status)} />
        </View>

        {/* Description */}
        {session.description ? (
          <View style={styles.descriptionBlock}>
            <Text style={styles.descriptionTitle}>Mô tả phiên</Text>
            <Text style={styles.descriptionText}>{session.description}</Text>
          </View>
        ) : null}

        {/* Join / ended */}
        {canJoin && session.roomId ? (
          <View style={styles.joinBlock}>
            <VideoCallJoinButton
              roomId={session.roomId}
              label={isLive ? 'Vào phiên ngay' : 'Vào phòng chờ'}
            />
          </View>
        ) : null}

        {isEnded && (
          <View style={styles.endedBlock}>
            <Text style={styles.endedText}>Phiên này đã kết thúc.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusLabel(status: PeerSession['status']): string {
  const map: Record<PeerSession['status'], string> = {
    scheduled: 'Sắp diễn ra',
    live: 'Đang diễn ra',
    ended: 'Đã kết thúc',
  };
  return map[status] ?? status;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={metaStyles.row}>
      <Text style={metaStyles.label}>{label}</Text>
      <Text style={metaStyles.value}>{value}</Text>
    </View>
  );
}

const metaStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.goldSoft,
  },
  label: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
  },
  value: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.sm,
    color: colors.ink,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing[3],
  },
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: spacing[5], paddingBottom: spacing[10], gap: spacing[4] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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

  title: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes.xl,
    color: colors.ink,
    letterSpacing: -0.4,
    lineHeight: fontSizes.xl * 1.3,
  },

  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing[3],
  },
  hostInfo: { gap: 2 },
  hostLabel: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
  },
  hostName: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.base,
    color: colors.ink,
  },

  metaBlock: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[1],
    paddingBottom: spacing[1],
  },

  descriptionBlock: {
    gap: spacing[2],
  },
  descriptionTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  descriptionText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    lineHeight: fontSizes.sm * 1.6,
  },

  joinBlock: { marginTop: spacing[2] },

  endedBlock: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing[4],
    alignItems: 'center',
  },
  endedText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
  },

  errorText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.base,
    color: colors.inkMuted,
  },
});
