/**
 * Booking1on1ConfirmModal — bottom sheet modal confirming 1-on-1 booking with Đăng.
 *
 * Shows: slot datetime + duration + price (or range) + payment CTA.
 * On confirm: calls useBook1on1Session mutation → payment intent → payment-service.
 *
 * Payment-service imported from Phase 8 (do not recreate).
 * If payment-service does not exist yet, falls back to alert stub.
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, typography, fontSizes, spacing, radii } from '../../theme';
import { useBook1on1Session } from '../../hooks/use-book-1on1-session';
import type { DangAvailabilitySlot } from '../../hooks/use-dang-availability';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSlotDatetime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Booking1on1ConfirmModalProps {
  visible: boolean;
  slot: DangAvailabilitySlot | null;
  onDismiss: () => void;
  onBookingSuccess: (bookingId: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Booking1on1ConfirmModal({
  visible,
  slot,
  onDismiss,
  onBookingSuccess,
}: Booking1on1ConfirmModalProps) {
  const bookMutation = useBook1on1Session();

  const handleConfirm = useCallback(async () => {
    if (!slot) return;

    try {
      const { booking, paymentClientSecret } = await bookMutation.mutateAsync({
        slotId: slot.id,
      });

      // Phase 8 payment-service integration.
      // Attempt dynamic import so this compiles even before Phase 8 ships.
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { openPaymentSheet } = require('../../services/payment-service');
        await openPaymentSheet(paymentClientSecret);
      } catch {
        // payment-service not yet available — stub alert for development
        Alert.alert(
          'Thanh toán (stub)',
          `Payment intent: ${paymentClientSecret.substring(0, 20)}...\n\nReal payment flow requires Phase 8 payment-service.`,
          [{ text: 'OK (stub confirm)', style: 'default' }],
        );
      }

      onBookingSuccess(booking.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      Alert.alert('Không thể đặt lịch', message, [{ text: 'Đóng' }]);
    }
  }, [slot, bookMutation, onBookingSuccess]);

  if (!slot) return null;

  const priceDisplay = slot.priceVnd
    ? `${(slot.priceVnd / 1_000_000).toFixed(0)} triệu VNĐ`
    : slot.priceRangeLabel;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouchable} onPress={onDismiss} />
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          <Text style={styles.sheetTitle}>Xác nhận đặt lịch 1-on-1</Text>

          {/* Slot detail */}
          <View style={styles.detailBlock}>
            <DetailRow label="Thời gian" value={formatSlotDatetime(slot.startsAt)} />
            <DetailRow label="Thời lượng" value={`${slot.durationMinutes} phút`} />
            {slot.topic ? (
              <DetailRow label="Chủ đề" value={slot.topic} />
            ) : null}
            <DetailRow label="Học phí" value={priceDisplay} accent />
          </View>

          {/* Price note */}
          <Text style={styles.priceNote}>
            Đăng xác nhận giá cuối cùng dựa trên nội dung buổi học.
            Phạm vi: 2–5 triệu VNĐ.
          </Text>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.confirmButton, bookMutation.isPending && styles.confirmButtonLoading]}
            onPress={handleConfirm}
            disabled={bookMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Xác nhận và thanh toán"
          >
            {bookMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.confirmButtonText}>Xác nhận & Thanh toán</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onDismiss}>
            <Text style={styles.cancelButtonText}>Huỷ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── DetailRow ─────────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={[detailStyles.value, accent && detailStyles.valueAccent]}>
        {value}
      </Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.goldSoft,
  },
  label: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    flex: 1,
  },
  value: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.sm,
    color: colors.ink,
    flex: 2,
    textAlign: 'right',
  },
  valueAccent: {
    color: colors.goldDeep,
    fontFamily: typography.sansBold,
  },
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    paddingTop: spacing[3],
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.goldSoft,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing[4],
  },
  sheetTitle: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
    marginBottom: spacing[4],
    letterSpacing: -0.3,
  },
  detailBlock: {
    marginBottom: spacing[3],
  },
  priceNote: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    lineHeight: fontSizes.xs * 1.6,
    marginBottom: spacing[5],
    fontStyle: 'italic',
  },
  confirmButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  confirmButtonLoading: {
    opacity: 0.7,
  },
  confirmButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.base,
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
  },
});
