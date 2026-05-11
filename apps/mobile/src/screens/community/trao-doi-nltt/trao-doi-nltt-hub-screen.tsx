/**
 * TraoDoiNlttHubScreen — Phone 8 from mockup v3.
 *
 * 2 sections only (Section C "Khoá học cấu trúc" REMOVED per anh's feedback):
 *   Section A · Phiên đồng đẳng (free) — peer-led, anyone hosts
 *   Section B · Buổi 1-on-1 với Đăng (paid 2–5tr) — calendar + booking
 *
 * Anti-FOMO enforced:
 *   ✗ No "popular sessions" count
 *   ✗ No host follower count
 *   ✗ No engagement metrics
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, fontSizes, spacing, radii } from '../../../theme';
import { usePeerSessions } from '../../../hooks/use-peer-sessions';
import { useDangAvailability } from '../../../hooks/use-dang-availability';
import { PeerSessionCard } from '../../../components/trao-doi-nltt/peer-session-card';
import { DangAvailabilitySlotChip } from '../../../components/trao-doi-nltt/dang-availability-slot-chip';
import type { CommunityStackParamList } from '../../../types/navigation-types';
import type { PeerSession } from '../../../hooks/use-peer-sessions';
import type { DangAvailabilitySlot } from '../../../hooks/use-dang-availability';

type Nav = NativeStackNavigationProp<CommunityStackParamList>;

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={sectionStyles.header}>
      <View style={sectionStyles.headerText}>
        <Text style={sectionStyles.title}>{title}</Text>
        {subtitle ? (
          <Text style={sectionStyles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} accessibilityRole="button">
          <Text style={sectionStyles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
  },
  headerText: { flex: 1, gap: 2 },
  title: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    lineHeight: fontSizes.xs * 1.5,
  },
  action: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.sm,
    color: colors.gold,
  },
});

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );
}

function IconPeerSession({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Circle cx={9} cy={7} r={4} />
      <Path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <Path d="M21 21v-2a4 4 0 0 0-3-3.87" />
    </Svg>
  );
}

function IconCalendar({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </Svg>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function TraoDoiNlttHubScreen() {
  const navigation = useNavigation<Nav>();

  const peerSessionsQuery = usePeerSessions('upcoming');
  const dangAvailabilityQuery = useDangAvailability();

  const handlePeerSessionJoin = useCallback(
    (session: PeerSession) => {
      navigation.navigate('TraoDoiNlttPeerSessionDetail', { sessionId: session.id });
    },
    [navigation],
  );

  const handlePeerSessionCard = useCallback(
    (session: PeerSession) => {
      navigation.navigate('TraoDoiNlttPeerSessionDetail', { sessionId: session.id });
    },
    [navigation],
  );

  const handleSlotSelect = useCallback(
    (slot: DangAvailabilitySlot) => {
      navigation.navigate('TraoDoiNlttBook1on1', { slotId: slot.id });
    },
    [navigation],
  );

  const handleHostSession = useCallback(() => {
    // Navigate to create session screen (scope for Phase 10 extension)
    // For now alert — creation is via Book1on1 screen for Đăng sessions
    navigation.navigate('TraoDoiNlttBook1on1', { slotId: undefined });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen header */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Trao Đổi Năng Lượng Trí Tuệ</Text>
          <Text style={styles.screenSubtitle}>
            Học cùng nhau, không ai dạy ai — hoặc 1-on-1 sâu với Đăng.
          </Text>
        </View>

        {/* My bookings shortcut */}
        <TouchableOpacity
          style={styles.myBookingsChip}
          onPress={() => navigation.navigate('TraoDoiNlttMyBookings')}
          accessibilityRole="button"
          accessibilityLabel="Lịch đặt của tôi"
        >
          <Text style={styles.myBookingsChipText}>Lịch đặt của tôi →</Text>
        </TouchableOpacity>

        {/* ── Section A: Phiên đồng đẳng ─────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionIconRow}>
            <IconPeerSession color={colors.gold} />
            <SectionHeader
              title="Phiên đồng đẳng"
              subtitle="Ai cũng có thể host · Miễn phí"
              actionLabel="Host phiên"
              onAction={handleHostSession}
            />
          </View>

          {peerSessionsQuery.isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.goldDeep} size="small" />
            </View>
          )}

          {peerSessionsQuery.isError && (
            <EmptyState message="Không tải được danh sách phiên. Thử lại sau." />
          )}

          {!peerSessionsQuery.isLoading && !peerSessionsQuery.isError && (
            <View style={styles.cardList}>
              {(peerSessionsQuery.data ?? []).length === 0 ? (
                <EmptyState message="Chưa có phiên nào sắp diễn ra. Host phiên đầu tiên!" />
              ) : (
                (peerSessionsQuery.data ?? []).slice(0, 5).map((session) => (
                  <PeerSessionCard
                    key={session.id}
                    session={session}
                    onJoinPress={handlePeerSessionJoin}
                    onCardPress={handlePeerSessionCard}
                  />
                ))
              )}
            </View>
          )}
        </View>

        {/* ── Section B: 1-on-1 với Đăng ─────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionIconRow}>
            <IconCalendar color={colors.gold} />
            <SectionHeader
              title="Buổi 1-on-1 với Đăng"
              subtitle="Trả phí · 2–5 triệu · Đăng xác nhận giá"
              actionLabel="Xem tất cả slot"
              onAction={() => navigation.navigate('TraoDoiNlttBook1on1', { slotId: undefined })}
            />
          </View>

          {dangAvailabilityQuery.isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.goldDeep} size="small" />
            </View>
          )}

          {dangAvailabilityQuery.isError && (
            <EmptyState message="Không tải được lịch của Đăng. Thử lại sau." />
          )}

          {!dangAvailabilityQuery.isLoading && !dangAvailabilityQuery.isError && (
            <View style={styles.slotList}>
              {(dangAvailabilityQuery.data ?? []).length === 0 ? (
                <EmptyState message="Hiện tại chưa có slot trống. Đăng sẽ mở thêm sớm." />
              ) : (
                (dangAvailabilityQuery.data ?? []).slice(0, 3).map((slot) => (
                  <DangAvailabilitySlotChip
                    key={slot.id}
                    slot={slot}
                    selected={false}
                    onSelect={handleSlotSelect}
                  />
                ))
              )}
              {(dangAvailabilityQuery.data ?? []).length > 3 && (
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  onPress={() =>
                    navigation.navigate('TraoDoiNlttBook1on1', { slotId: undefined })
                  }
                  accessibilityRole="button"
                >
                  <Text style={styles.seeMoreText}>
                    Xem thêm {(dangAvailabilityQuery.data ?? []).length - 3} slot →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing[10] },

  screenHeader: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  screenTitle: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes['2xl'],
    color: colors.ink,
    letterSpacing: -0.6,
    lineHeight: fontSizes['2xl'] * 1.15,
  },
  screenSubtitle: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    marginTop: spacing[1],
    lineHeight: fontSizes.sm * 1.5,
  },

  myBookingsChip: {
    marginHorizontal: spacing[5],
    marginBottom: spacing[4],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.goldTint,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
  },
  myBookingsChipText: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.sm,
    color: colors.goldDeep,
  },

  section: {
    marginBottom: spacing[6],
  },
  sectionIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: spacing[5],
    paddingBottom: spacing[1],
    gap: spacing[2],
  },

  cardList: {
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  slotList: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },

  loadingRow: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },

  emptyState: {
    marginHorizontal: spacing[4],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: radii.md,
  },
  emptyStateText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: fontSizes.sm * 1.5,
  },

  seeMoreButton: {
    paddingVertical: spacing[2],
    alignItems: 'center',
  },
  seeMoreText: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.sm,
    color: colors.gold,
  },
});
