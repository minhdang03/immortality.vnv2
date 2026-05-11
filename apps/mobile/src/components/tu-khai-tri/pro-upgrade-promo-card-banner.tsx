/**
 * ProUpgradePromoCardBanner — gold-tint banner card shown at top of browse screen.
 * Subtle entry point to AI hỏi ngược Pro feature — 99K/tháng.
 * Only rendered when user is NOT Pro (caller checks isPro before rendering).
 */
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, fontSizes, radii, spacing } from '../../theme';

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.goldDeep} strokeWidth={2}>
      <Path d="m9 6 6 6-6 6" />
    </Svg>
  );
}

function LightningIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={colors.gold} stroke={colors.goldDeep} strokeWidth={1.5}>
      <Path d="M13 2L3 14h7l-1 8 11-12h-7z" />
    </Svg>
  );
}

interface Props {
  onPress: () => void;
}

export function ProUpgradePromoCardBanner({ onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Khám phá AI hỏi ngược Pro"
    >
      <View style={styles.iconWrap}>
        <LightningIcon />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>AI hỏi ngược</Text>
        <Text style={styles.sub}>99K/tháng · Câu hỏi từ AI, không phải đáp án</Text>
      </View>
      <ChevronRight />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldTint,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    marginHorizontal: spacing[5],
    marginBottom: spacing[4],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.sm + 1,
    color: colors.goldDeep,
  },
  sub: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
  },
});
