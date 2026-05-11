/**
 * MyBookingCardWithCountdown — shows a confirmed 1-on-1 or peer session booking
 * with a countdown to start time and a join button when room is ready.
 *
 * Countdown refreshes every minute via interval.
 * Join button appears when roomId is set (room created by server).
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, fontSizes, spacing, radii } from '../../theme';
import { VideoCallJoinButton } from './video-call-join-button';
import type { AnyBooking, Booking1on1 } from '../../hooks/use-book-1on1-session';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getScheduledAt(booking: AnyBooking): string {
  return booking.type === '1on1' ? booking.startsAt : booking.scheduledAt;
}

function getRoomId(booking: AnyBooking): string | null {
  return booking.type === '1on1' ? booking.roomId : booking.joinUrl ?? null;
}

function formatCountdown(targetIso: string): string {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return 'Đang diễn ra';
  const totalMins = Math.floor(diff / 60_000);
  const days = Math.floor(totalMins / 1440);
  const hours = Math.floor((totalMins % 1440) / 60);
  const mins = totalMins % 60;
  if (days > 0) return `${days} ngày ${hours} giờ nữa`;
  if (hours > 0) return `${hours} giờ ${mins} phút nữa`;
  return `${mins} phút nữa`;
}

function formatDatetime(isoString: string): string {
  return new Date(isoString).toLocaleString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTitle(booking: AnyBooking): string {
  if (booking.type === '1on1') return '1-on-1 với Đăng';
  return booking.title;
}

function getStatusLabel(booking: AnyBooking): string {
  if (booking.type === '1on1') {
    const map: Record<string, string> = {
      pending_payment: 'Chờ thanh toán',
      confirmed: 'Đã xác nhận',
      cancelled: 'Đã huỷ',
      completed: 'Hoàn thành',
    };
    return map[booking.status] ?? booking.status;
  }
  const map: Record<string, string> = {
    registered: 'Đã đăng ký',
    attended: 'Đã tham gia',
    missed: 'Đã bỏ lỡ',
  };
  return map[booking.status] ?? booking.status;
}

// ── Props ─────────────────────────────────────────────────="────────────────────

interface MyBookingCardWithCountdownProps {
  booking: AnyBooking;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MyBookingCardWithCountdown({ booking }: MyBookingCardWithCountdownProps) {
  const scheduledAt = getScheduledAt(booking);
  const roomId = getRoomId(booking);
  const isUpcoming = new Date(scheduledAt) > new Date();

  const [countdown, setCountdown] = useState(() => formatCountdown(scheduledAt));

  useEffect(() => {
    if (!isUpcoming) return;
    const id = setInterval(() => {
      setCountdown(formatCountdown(scheduledAt));
    }, 60_000);
    return () => clearInterval(id);
  }, [scheduledAt, isUpcoming]);

  const isPaid1on1 = booking.type === '1on1';
  const statusLabel = getStatusLabel(booking);

  return (
    <View style={styles.card}>
      {/* Type badge */}
      <View style={[styles.typeBadge, isPaid1on1 && styles.typeBadge1on1]}>
        <Text style={styles.typeBadgeText}>
          {isPaid1on1 ? '1-on-1 · Trả phí' : 'Đồng đẳng · Miễn phí'}
        </Text>
      </View>

      {/* Title + status */}
      <Text style={styles.title}>{getTitle(booking)}</Text>
      <Text style={styles.status}>{statusLabel}</Text>

      {/* Datetime + countdown */}
      <View style={styles.timeRow}>
        <Text style={styles.datetime}>{formatDatetime(scheduledAt)}</Text>
        {isUpcoming && (
          <Text style={styles.countdown}>{countdown}</Text>
        )}
      </View>

      {/* Price (1-on-1 only) */}
      {isPaid1on1 && (booking as Booking1on1).priceRangeLabel ? (
        <Text style={styles.price}>
          {(booking as Booking1on1).priceRangeLabel}
        </Text>
      ) : null}

      {/* Join button — shown when room is ready */}
      {roomId && isUpcoming && (
        <View style={styles.joinRow}>
          <VideoCallJoinButton roomId={roomId} label="Vào phòng" />
        </View>
      )}
    </View>
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
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.goldTint,
    borderRadius: radii.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  typeBadge1on1: {
    backgroundColor: '#FEF3C7',
  },
  typeBadgeText: {
    fontFamily: typography.sansMedium,
    fontSize: 10,
    color: colors.goldDeep,
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.base,
    color: colors.ink,
  },
  status: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  datetime: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
  },
  countdown: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.sm,
    color: colors.goldDeep,
  },
  price: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.sm,
    color: colors.goldDeep,
  },
  joinRow: {
    marginTop: spacing[1],
  },
});
