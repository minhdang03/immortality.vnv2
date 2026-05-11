/**
 * DangAvailabilitySlotChip — tappable chip showing a single available slot
 * for 1-on-1 với Đăng. Tap expands to show topic + price range.
 *
 * Used in Book1on1Screen's calendar-style list.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, typography, fontSizes, spacing, radii } from '../../theme';
import type { DangAvailabilitySlot } from '../../hooks/use-dang-availability';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSlotTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface DangAvailabilitySlotChipProps {
  slot: DangAvailabilitySlot;
  selected: boolean;
  onSelect: (slot: DangAvailabilitySlot) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DangAvailabilitySlotChip({
  slot,
  selected,
  onSelect,
}: DangAvailabilitySlotChipProps) {
  const [expanded, setExpanded] = useState(false);

  function handlePress() {
    setExpanded((prev) => !prev);
    onSelect(slot);
  }

  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={handlePress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Slot ${formatSlotTime(slot.startsAt)}`}
      accessibilityState={{ selected }}
    >
      {/* Collapsed: date + time */}
      <View style={styles.chipHeader}>
        <Text style={[styles.chipDatetime, selected && styles.chipDatetimeSelected]}>
          {formatSlotTime(slot.startsAt)}
        </Text>
        <Text style={[styles.chipDuration, selected && styles.chipDurationSelected]}>
          {slot.durationMinutes} phút
        </Text>
      </View>

      {/* Expanded: topic + price range */}
      {expanded && (
        <View style={styles.expandedSection}>
          {slot.topic ? (
            <Text style={styles.expandedTopic}>Chủ đề: {slot.topic}</Text>
          ) : null}
          <Text style={styles.expandedPrice}>
            {slot.priceVnd
              ? `${(slot.priceVnd / 1_000_000).toFixed(0)} triệu`
              : slot.priceRangeLabel}
            {' '}· Đăng xác nhận giá khi book
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    borderColor: colors.goldSoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.goldTint,
  },
  chipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipDatetime: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  chipDatetimeSelected: {
    color: colors.goldDeep,
  },
  chipDuration: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
  },
  chipDurationSelected: {
    color: colors.goldDeep,
  },
  expandedSection: {
    marginTop: spacing[2],
    gap: spacing[1],
  },
  expandedTopic: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    fontStyle: 'italic',
  },
  expandedPrice: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.sm,
    color: colors.goldDeep,
  },
});
