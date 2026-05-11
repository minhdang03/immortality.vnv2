/**
 * ProTierBadgeDaysRemaining — small mint chip showing "PRO · còn 17/30 ngày".
 * Renders nothing when user is not Pro (returns null).
 *
 * Used in: TuKhaiTriAiHoiNguocScreen header area.
 * Days calculation lives in useProTierSubscriptionStatus hook.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, fontSizes, radii } from '../../theme';

interface Props {
  badgeLabel: string; // e.g. "PRO · còn 17/30 ngày" — empty string = not Pro
}

export function ProTierBadgeDaysRemaining({ badgeLabel }: Props) {
  if (!badgeLabel) return null;

  return (
    <View style={styles.chip} accessibilityLabel={badgeLabel}>
      <Text style={styles.label}>{badgeLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mint,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs - 1,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
