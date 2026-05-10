/**
 * channel-row-with-slow-mode-chip — single row in the channel browse list.
 * Shows: # slug (mono) + description + slow-mode chip + chevron.
 *
 * Anti-tier: NO skill-level label, NO "Beginner"/"Advanced" tag ever.
 *
 * Also exports TrucCollapsibleHeader for SectionList section headers.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radii, fontSizes } from '../../../theme';
import type { Channel } from '../hooks/use-channels-list-by-truc';

// ── Channel row ───────────────────────────────────────────────────────────────

interface ChannelRowProps {
  channel: Channel;
  onPress: () => void;
}

function formatSlowMode(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)}ph`;
}

export function ChannelRowWithSlowModeChip({ channel, onPress }: ChannelRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Kênh ${channel.name}, slow-mode ${formatSlowMode(channel.slowModeSeconds)}`}
    >
      <View style={styles.hashWrap}>
        <Text style={styles.hash}>#</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.slug} numberOfLines={1}>{channel.slug}</Text>
          <View style={styles.slowChip}>
            <Text style={styles.slowChipText}>
              {'Slow '}
              {formatSlowMode(channel.slowModeSeconds)}
            </Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={1}>
          {channel.description}
        </Text>
      </View>

      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none"
        stroke={colors.inkMuted} strokeWidth={2}>
        <Path d="m9 6 6 6-6 6" />
      </Svg>
    </TouchableOpacity>
  );
}

// ── Truc collapsible section header ──────────────────────────────────────────

interface TrucHeaderProps {
  label: string;
  collapsed: boolean;
  onToggle: () => void;
}

export function TrucCollapsibleHeader({ label, collapsed, onToggle }: TrucHeaderProps) {
  return (
    <TouchableOpacity
      style={headerStyles.row}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${collapsed ? 'Mở rộng' : 'Thu gọn'} ${label}`}
    >
      <Text style={headerStyles.arrow}>{collapsed ? '▶' : '▾'}</Text>
      <Text style={headerStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    gap: spacing[3],
  },
  hashWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.goldTint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  hash: {
    fontFamily: typography.mono,
    fontSize: fontSizes.md,
    color: colors.gold,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  slug: {
    fontFamily: typography.mono,
    fontSize: fontSizes.sm,
    color: colors.ink,
    flex: 1,
  },
  slowChip: {
    backgroundColor: 'rgba(176,134,66,0.12)',
    borderRadius: radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexShrink: 0,
  },
  slowChipText: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs,
    color: colors.goldDeep,
  },
  description: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    lineHeight: fontSizes.xs * 1.5,
  },
});

const headerStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    gap: spacing[2],
  },
  arrow: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    width: 12,
  },
  label: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
