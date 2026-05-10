/**
 * OnboardingScreen — first-launch welcome screen.
 * Shown only when Firebase auth is not yet established.
 * Tapping "Bắt đầu" triggers anonymous sign-in (handled by useFirebaseAuth).
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/auth-store';
import { signInAnonymously } from '../../services/firebase-auth-service';
import { colors, typography, fontSizes, spacing, radii } from '../../theme';

export function OnboardingScreen() {
  const [loading, setLoading] = React.useState(false);
  const { isHydrating } = useAuthStore();

  async function handleStart() {
    setLoading(true);
    try {
      await signInAnonymously();
      // Auth state change triggers RootNavigator to switch to MainTabs
    } catch {
      // Network failure — show retry; do not crash
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>BẤT TỬ ĐẠO</Text>
          <Text style={styles.headline}>Nghiên cứu{'\n'}sự bất tử.</Text>
          <Text style={styles.sub}>
            Cộng đồng đồng đẳng. Không thầy, không tôn giáo.{'\n'}
            Mỗi người tự đi đường của mình.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btn, (loading || isHydrating) && styles.btnDisabled]}
            onPress={handleStart}
            disabled={loading || isHydrating}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Bắt đầu khám phá"
          >
            {loading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.btnText}>Bắt đầu →</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Không cần tạo tài khoản. Có thể thêm email sau.
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
    paddingHorizontal: spacing[6],
    justifyContent: 'space-between',
    paddingTop: spacing[16],
    paddingBottom: spacing[8],
  },
  hero: { gap: spacing[4] },
  eyebrow: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs,
    color: colors.gold,
    letterSpacing: 3,
  },
  headline: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes['3xl'],
    color: colors.ink,
    letterSpacing: -1,
    lineHeight: fontSizes['3xl'] * 1.1,
  },
  sub: {
    fontFamily: typography.sans,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
    lineHeight: fontSizes.base * 1.6,
  },
  footer: { gap: spacing[3] },
  btn: {
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.md,
    color: colors.surface,
  },
  disclaimer: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
