/**
 * DepthTagChip — CONTENT classification tag. NEVER ascribed to a user.
 * co-ban → 🌱 Cơ bản (mint), di-sau → 🌿 Đi sâu (gold), nang-cao → 🌳 Nâng cao (purple)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, fontSizes } from '../../theme';
import type { DepthTag } from '@btd/shared';

const TAG_CONFIG: Record<DepthTag, { emoji: string; label: string; bg: string; color: string }> = {
  'co-ban':   { emoji: '🌱', label: 'Cơ bản',  bg: 'rgba(74,157,126,0.14)', color: colors.mint },
  'di-sau':   { emoji: '🌿', label: 'Đi sâu',  bg: colors.goldTint,         color: colors.goldDeep },
  'nang-cao': { emoji: '🌳', label: 'Nâng cao', bg: 'rgba(106,58,142,0.14)', color: '#6a3a8e' },
};

export function DepthTagChip({ depthTag }: { depthTag: DepthTag }) {
  const c = TAG_CONFIG[depthTag];
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }]}>
      <Text style={[styles.label, { color: c.color }]}>{c.emoji} {c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  label: { fontFamily: typography.sans, fontSize: fontSizes.xs - 1, fontWeight: '500' },
});
