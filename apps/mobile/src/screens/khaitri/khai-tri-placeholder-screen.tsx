/**
 * KhaiTriPlaceholderScreen — Khai Trí tab stub (Phase 7: AI hỏi ngược + self-inquiry).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, fontSizes, spacing } from '../../theme';

export function KhaiTriPlaceholderScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>KHAI TRÍ</Text>
        <Text style={styles.title}>Đang xây dựng</Text>
        <Text style={styles.sub}>
          Tự Khai Trí + AI hỏi ngược (Socratic mirror) ra mắt trong Phase 7.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
    gap: spacing[3],
  },
  eyebrow: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs,
    color: colors.gold,
    letterSpacing: 3,
  },
  title: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes.xl,
    color: colors.ink,
  },
  sub: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: fontSizes.sm * 1.6,
  },
});
