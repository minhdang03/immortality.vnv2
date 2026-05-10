/**
 * slow-mode-amber-banner — slim amber info strip at top of channel thread.
 * Displays slow-mode interval + ephemeral TTL. Informational only —
 * server enforces the rate limit.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, fontSizes } from '../../../theme';

interface Props {
  slowModeSeconds: number;
  ephemeralTtlHours: number;
}

function formatInterval(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)} phút`;
}

export function SlowModeAmberBanner({ slowModeSeconds, ephemeralTtlHours }: Props) {
  return (
    <View style={styles.banner} accessibilityRole="text">
      <Text style={styles.text}>
        {'🕐 Slow-mode bật · Tin nhắn cách '}
        <Text style={styles.bold}>{formatInterval(slowModeSeconds)}</Text>
        {' · Tự ẩn sau '}
        <Text style={styles.bold}>{ephemeralTtlHours}h</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(176,134,66,0.12)',
    borderBottomWidth: 1,
    borderBottomColor: colors.goldSoft,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  text: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.goldDeep,
    lineHeight: fontSizes.xs * 1.5,
  },
  bold: {
    fontFamily: typography.sansSemiBold,
  },
});
