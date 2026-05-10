/**
 * ProfilePlaceholderScreen — Hồ sơ tab stub (Phase 9: full profile + settings).
 * Shows current UID for debugging during Phase 5 development.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/auth-store';
import { colors, typography, fontSizes, spacing } from '../../theme';

export function ProfilePlaceholderScreen() {
  const { uid, nickname, isAuthed } = useAuthStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>HỒ SƠ</Text>
        <Text style={styles.title}>Đang xây dựng</Text>
        <Text style={styles.sub}>Hồ sơ đầy đủ ra mắt trong Phase 9.</Text>

        {/* Debug info — remove before Phase 9 */}
        <View style={styles.debugBox}>
          <Text style={styles.debugLabel}>DEBUG (Phase 5)</Text>
          <Text style={styles.debugText}>Authed: {isAuthed ? 'yes' : 'no'}</Text>
          <Text style={styles.debugText}>
            UID: {uid ? `${uid.slice(0, 8)}…` : 'none'}
          </Text>
          <Text style={styles.debugText}>
            Nickname: {nickname ?? '(chưa đặt)'}
          </Text>
        </View>
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
  debugBox: {
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.goldTint,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    gap: 4,
    alignSelf: 'stretch',
  },
  debugLabel: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs,
    color: colors.gold,
    letterSpacing: 1.5,
    marginBottom: spacing[1],
  },
  debugText: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
});
