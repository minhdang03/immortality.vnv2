/**
 * Book1on1WithDangCalendarScreen — calendar picker + slot selection + booking flow.
 *
 * Route: TraoDoiNlttBook1on1 { slotId?: string }
 * If slotId provided (from hub "tap chip"), pre-selects that slot.
 *
 * Flow: slot list → tap to select → Booking1on1ConfirmModal → payment → success.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, fontSizes, spacing } from '../../../theme';
import { useDangAvailability } from '../../../hooks/use-dang-availability';
import { DangAvailabilitySlotChip } from '../../../components/trao-doi-nltt/dang-availability-slot-chip';
import { Booking1on1ConfirmModal } from '../../../components/trao-doi-nltt/booking-1on1-confirm-modal';
import type { CommunityStackParamList } from '../../../types/navigation-types';
import type { DangAvailabilitySlot } from '../../../hooks/use-dang-availability';

type Nav = NativeStackNavigationProp<CommunityStackParamList>;

// ── Screen ────────────────────────────────────────────────────────────────────

export function Book1on1WithDangCalendarScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const params = (route.params ?? {}) as { slotId?: string };

  const slotsQuery = useDangAvailability();

  const [selectedSlot, setSelectedSlot] = useState<DangAvailabilitySlot | null>(
    () => {
      if (!params.slotId || !slotsQuery.data) return null;
      return slotsQuery.data.find((s) => s.id === params.slotId) ?? null;
    },
  );
  const [modalVisible, setModalVisible] = useState(false);

  const handleSlotSelect = useCallback(
    (slot: DangAvailabilitySlot) => {
      setSelectedSlot(slot);
      setModalVisible(true);
    },
    [],
  );

  const handleModalDismiss = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleBookingSuccess = useCallback(
    (bookingId: string) => {
      setModalVisible(false);
      // Navigate to MyBookings to show confirmed booking
      navigation.navigate('TraoDoiNlttMyBookings');
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Đặt lịch 1-on-1 với Đăng</Text>
        <Text style={styles.subtitle}>
          Chọn slot phù hợp. Học phí 2–5 triệu — Đăng xác nhận sau khi xem nội dung bạn muốn trao đổi.
        </Text>

        {slotsQuery.isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.goldDeep} size="small" />
            <Text style={styles.loadingText}>Đang tải lịch của Đăng…</Text>
          </View>
        )}

        {slotsQuery.isError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              Không tải được lịch. Vui lòng thử lại sau.
            </Text>
          </View>
        )}

        {!slotsQuery.isLoading && !slotsQuery.isError && (
          <>
            {(slotsQuery.data ?? []).length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  Hiện tại chưa có slot trống. Đăng sẽ mở thêm sớm.
                </Text>
              </View>
            ) : (
              <View style={styles.slotList}>
                {(slotsQuery.data ?? []).map((slot) => (
                  <DangAvailabilitySlotChip
                    key={slot.id}
                    slot={slot}
                    selected={selectedSlot?.id === slot.id}
                    onSelect={handleSlotSelect}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* How it works note */}
        <View style={styles.howItWorksBox}>
          <Text style={styles.howItWorksTitle}>Quy trình</Text>
          <Text style={styles.howItWorksText}>
            1. Chọn slot → xác nhận thông tin{'\n'}
            2. Thanh toán online (MoMo / thẻ){'\n'}
            3. Nhận link phòng video + calendar invite{'\n'}
            4. Gặp Đăng đúng giờ
          </Text>
        </View>
      </ScrollView>

      <Booking1on1ConfirmModal
        visible={modalVisible}
        slot={selectedSlot}
        onDismiss={handleModalDismiss}
        onBookingSuccess={handleBookingSuccess}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: spacing[5], paddingBottom: spacing[10], gap: spacing[4] },

  title: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes.xl,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    lineHeight: fontSizes.sm * 1.6,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
  },
  loadingText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
  },

  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: spacing[4],
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: '#B91C1C',
  },

  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing[5],
  },
  emptyText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: fontSizes.sm * 1.5,
  },

  slotList: { gap: spacing[2] },

  howItWorksBox: {
    marginTop: spacing[2],
    backgroundColor: colors.goldTint,
    borderRadius: 8,
    padding: spacing[4],
    gap: spacing[2],
  },
  howItWorksTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.sm,
    color: colors.goldDeep,
  },
  howItWorksText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    lineHeight: fontSizes.sm * 1.8,
  },
});
