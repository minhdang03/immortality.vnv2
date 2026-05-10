/**
 * PhaNoLeFourMastersOverviewScreen — displays 4 chủ nô cards for Phá Nô Lệ Trí Tuệ.
 *
 * Each card shows: icon + title + daily prompt + last log preview + community count.
 * Tapping a card navigates to ChuNoLog for that chủ nô.
 *
 * Reinstall warning: if no encryption key exists in SecureStore (fresh install or
 * reinstall after data loss), an Alert warns the user before they write their first entry.
 *
 * Anti-patterns: NO level/rank, NO badge, NO engagement framing.
 *
 * Route: PhaNoLe (no params)
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '../../../services/api-client';
import { hasEncryptionKey } from '../../../features/pha-no-le/lib/journal-crypto';
import { ChuNoCard } from '../../../features/pha-no-le/components/chu-no-card';
import { colors, typography, fontSizes, spacing } from '../../../theme';
import type { ChuNo } from '../../../hooks/use-profile';
import type { CommunityStackParamList } from '../../../types/navigation-types';

type Nav = NativeStackNavigationProp<CommunityStackParamList>;

// ── Types ──────────────────────────────────────────────────────────────────────

interface ChuNoSummary {
  chuNo: ChuNo;
  lastLogPreview: string | null; // already decrypted preview from server (public summary only)
  communityCount: number;
  dangKhaiTriUrl: string | null; // populated only for 'chu-no-giau-mat'
}

// ── ChuNoCardContainer — wraps ChuNoCard with per-chủ-nô query ──────────────
// Separate component so hooks are not called inside a .map()

interface ChuNoCardContainerProps {
  chuNo: ChuNo;
  summary: ChuNoSummary | undefined;
  onPress: (c: ChuNo) => void;
  onDangLinkPress?: () => void;
}

function ChuNoCardContainer({ chuNo, summary, onPress, onDangLinkPress }: ChuNoCardContainerProps) {
  return (
    <ChuNoCard
      chuNo={chuNo}
      lastLogPreview={summary?.lastLogPreview ?? null}
      communityCount={summary?.communityCount ?? 0}
      dangKhaiTriUrl={summary?.dangKhaiTriUrl ?? null}
      onPress={onPress}
      onDangLinkPress={chuNo === 'chu-no-giau-mat' ? onDangLinkPress : undefined}
    />
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────

const CHU_NO_ORDER: ChuNo[] = [
  'thieu-hieu-biet',
  'ong-ba-lac-hau',
  'dinh-kien',
  'chu-no-giau-mat',
];

export function PhaNoLeFourMastersOverviewScreen() {
  const navigation = useNavigation<Nav>();
  const reinstallWarningShown = useRef(false);

  // Check encryption key on mount — warn if missing (reinstall scenario)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hasKey = await hasEncryptionKey();
      if (!hasKey && !cancelled && !reinstallWarningShown.current) {
        reinstallWarningShown.current = true;
        Alert.alert(
          'Cảnh báo: Cài lại app',
          'Nhật ký được mã hoá trên thiết bị. Nếu bạn cài lại app, các entry cũ sẽ không giải mã được. Key mã hoá mới sẽ được tạo khi bạn viết entry đầu tiên.',
          [{ text: 'Đã hiểu', style: 'default' }],
        );
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch community summaries (last log previews are public/aggregated — NOT the user's own encrypted entries)
  const summariesQuery = useQuery<ChuNoSummary[], Error>({
    queryKey: ['pha-no-le-summaries'],
    queryFn: async () => {
      try {
        return await apiClient.get<ChuNoSummary[]>('/api/practice-logs/community-summaries');
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return [];
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const summariesMap = new Map<ChuNo, ChuNoSummary>(
    (summariesQuery.data ?? []).map((s) => [s.chuNo, s]),
  );

  const handleCardPress = (chuNo: ChuNo) => {
    navigation.navigate('ChuNoLog', { chuNo });
  };

  const handleDangLinkPress = () => {
    // Navigate to Đăng's Khai Trí writing — WebView or in-app browser
    // Actual URL comes from summariesMap for 'chu-no-giau-mat'
    const dangUrl = summariesMap.get('chu-no-giau-mat')?.dangKhaiTriUrl;
    if (dangUrl) {
      // Future: navigation.navigate('WebViewScreen', { url: dangUrl, title: 'Khai Trí' });
      // For now: open in system browser via Linking (handled by parent navigator if wired up)
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Phá Nô Lệ Trí Tuệ</Text>
      <Text style={styles.screenSubtitle}>
        Nhận diện và phá 4 chủ nô cản trở tư duy độc lập.
      </Text>

      {summariesQuery.isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.goldDeep} size="small" />
        </View>
      )}

      {CHU_NO_ORDER.map((chuNo) => (
        <ChuNoCardContainer
          key={chuNo}
          chuNo={chuNo}
          summary={summariesMap.get(chuNo)}
          onPress={handleCardPress}
          onDangLinkPress={handleDangLinkPress}
        />
      ))}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { paddingTop: spacing[4] },
  screenTitle: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes.xl,
    color: colors.ink,
    marginHorizontal: spacing[5],
    marginBottom: spacing[1],
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    marginHorizontal: spacing[5],
    marginBottom: spacing[4],
    lineHeight: fontSizes.sm * 1.5,
  },
  loadingRow: { alignItems: 'center', paddingVertical: spacing[3] },
  bottomPad: { height: spacing[8] },
});
