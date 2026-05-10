/**
 * TopicChip — renders # truc-slug style topic tag in monospace font.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, fontSizes } from '../../theme';

export function TopicChip({ slug }: { slug: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.label}># {slug}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: 'rgba(22,19,16,0.04)', alignSelf: 'flex-start' },
  label: { fontFamily: typography.mono, fontSize: fontSizes.xs - 2, color: colors.inkSoft },
});
