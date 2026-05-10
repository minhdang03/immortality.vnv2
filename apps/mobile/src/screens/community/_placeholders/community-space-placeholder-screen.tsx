/**
 * CommunitySpacePlaceholderScreen — stub for Phases 6–11.
 * Receives spaceName via route initialParams and displays it.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { colors, typography, fontSizes, spacing } from '../../../theme';

export function CommunitySpacePlaceholderScreen() {
  const route = useRoute();
  const spaceName = (route.params as { spaceName?: string })?.spaceName ?? 'Không gian';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Đang xây dựng</Text>
      <Text style={styles.name}>{spaceName}</Text>
      <Text style={styles.hint}>Sẽ ra mắt trong các phase tiếp theo.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  label: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing[2],
  },
  name: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes.xl,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  hint: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
