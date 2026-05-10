/**
 * HomeScreen — Trang chủ tab (Phase 5 stub).
 * Will be wired to battudao.com web content via WebView in Phase 11.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, fontSizes, spacing } from '../../theme';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>TRANG CHỦ</Text>
        <Text style={styles.title}>Bất Tử Đạo</Text>
        <Text style={styles.sub}>Nội dung trang chủ sẽ ra mắt trong Phase 11.</Text>
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
    fontSize: fontSizes['2xl'],
    color: colors.ink,
    letterSpacing: -0.5,
  },
  sub: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: fontSizes.sm * 1.6,
  },
});
