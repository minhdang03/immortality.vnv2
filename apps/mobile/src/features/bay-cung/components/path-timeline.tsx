/**
 * path-timeline — vertical list of dated technical path entries.
 * Each row = date + 1-line technical update. No emotional reflections.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, fontSizes, spacing, radii, shadows } from '../../../theme';
import type { PathEntry } from '../../../hooks/use-profile';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  } catch {
    return iso.slice(0, 5);
  }
}

export function PathTimeline({ entries }: { entries: PathEntry[] }) {
  if (entries.length === 0) {
    return (
      <View style={[styles.container, styles.empty]}>
        <Text style={styles.emptyText}>Chưa có mốc đường đi nào.</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {entries.map((entry, idx) => (
        <View key={`${entry.date}-${idx}`} style={[styles.row, idx === entries.length - 1 && styles.rowLast]}>
          <Text style={styles.date}>{formatDate(entry.date)}</Text>
          <Text style={styles.text}>{entry.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing[5], marginBottom: spacing[4],
    backgroundColor: colors.surface, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.rule,
    paddingHorizontal: spacing[4], paddingTop: spacing[1], paddingBottom: spacing[1],
    ...shadows.card,
  },
  empty: { paddingVertical: spacing[4], alignItems: 'center' },
  emptyText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted },
  row: {
    flexDirection: 'row', gap: spacing[3],
    paddingVertical: spacing[2] + 2,
    borderBottomWidth: 1, borderBottomColor: colors.rule,
  },
  rowLast: { borderBottomWidth: 0 },
  date: { fontFamily: typography.mono, fontSize: fontSizes.xs, color: colors.goldDeep, fontWeight: '600', width: 40, flexShrink: 0, paddingTop: 1 },
  text: { flex: 1, fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkSoft, lineHeight: fontSizes.sm * 1.45 },
});
