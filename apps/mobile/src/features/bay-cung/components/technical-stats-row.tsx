/**
 * technical-stats-row — 3-cell grid of raw practice metrics.
 * Cells: % cấp 1 (30-day) · Thái Dương hours (month) · hướng đi count.
 * Anti-pattern: NO follower count, NO post count, NO "level X" label.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, fontSizes, spacing, radii, shadows } from '../../../theme';

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

interface TechnicalStatsRowProps {
  capLuyenPct: number | null;
  thaiyangHoursMonth: number;
  huongDiCount: number;
}

export function TechnicalStatsRow({ capLuyenPct, thaiyangHoursMonth, huongDiCount }: TechnicalStatsRowProps) {
  const capStr = capLuyenPct !== null ? `${capLuyenPct}%` : '—';
  const thaiyangStr = thaiyangHoursMonth > 0 ? `${thaiyangHoursMonth.toFixed(1)}h` : '—';

  return (
    <View style={styles.row}>
      <StatCell value={capStr} label="cấp 1 · 30 ngày" />
      <View style={styles.divider} />
      <StatCell value={thaiyangStr} label="Thái Dương · tháng" />
      <View style={styles.divider} />
      <StatCell value={String(huongDiCount)} label="hướng đi đóng góp" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: spacing[5],
    marginBottom: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    ...shadows.card,
  },
  cell: { flex: 1, paddingVertical: spacing[3], paddingHorizontal: spacing[2], alignItems: 'center' },
  divider: { width: 1, marginVertical: spacing[3], backgroundColor: colors.rule },
  value: { fontFamily: typography.mono, fontSize: fontSizes.md, color: colors.ink, letterSpacing: -0.3, marginBottom: 2 },
  label: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted, textAlign: 'center' },
});
