/**
 * TuKhaiTriBrowseScreen — Phone 2 from mockup v3.
 *
 * Layout:
 *   - Header: title + subtitle
 *   - ProUpgradePromoCardBanner (only when not Pro — subtle AI entry point)
 *   - Depth-tag filter chips (on CONTENT, never on users)
 *   - FlashList of SelfInquiryQuestionCardWithDepthTag
 *
 * Tapping a question → TuKhaiTriParallelAnswers screen.
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, fontSizes, radii, spacing } from '../../../theme';
import {
  useSelfInquiryQuestions,
  type SelfInquiryQuestion,
  type SelfInquiryFilter,
} from '../../../hooks/use-self-inquiry-questions';
import { useProTierSubscriptionStatus } from '../../../hooks/use-pro-tier-subscription-status';
import { SelfInquiryQuestionCardWithDepthTag } from '../../../components/tu-khai-tri/self-inquiry-question-card-with-depth-tag';
import { ProUpgradePromoCardBanner } from '../../../components/tu-khai-tri/pro-upgrade-promo-card-banner';
import type { CommunityStackParamList } from '../../../types/navigation-types';
import type { DepthTag } from '@btd/shared';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'TuKhaiTri'>;

// ── Filter chips ──────────────────────────────────────────────────────────

const DEPTH_CHIPS: { key: DepthTag | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'co-ban', label: '🌱 Cơ bản' },
  { key: 'di-sau', label: '🌿 Đi sâu' },
  { key: 'nang-cao', label: '🌳 Nâng cao' },
];

// ── Screen ────────────────────────────────────────────────────────────────

export function TuKhaiTriBrowseScreen() {
  const navigation = useNavigation<Nav>();
  const [depthFilter, setDepthFilter] = useState<DepthTag | 'all'>('all');

  const filter = useMemo<SelfInquiryFilter>(
    () => ({ depthTag: depthFilter, sort: 'newest' }),
    [depthFilter],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useSelfInquiryQuestions(filter);

  const { isPro } = useProTierSubscriptionStatus();

  const questions = useMemo<SelfInquiryQuestion[]>(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const handleQuestionPress = (question: SelfInquiryQuestion) => {
    navigation.navigate('TuKhaiTriParallelAnswers', { questionId: question.id, questionContent: question.content });
  };

  const handleProPromoPress = () => {
    navigation.navigate('TuKhaiTriAiHoiNguoc');
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tự Khai Trí</Text>
        <Text style={styles.subtitle}>
          Câu tự vấn + hướng đi song song từ đồng đạo
        </Text>
      </View>

      {/* Depth filter chips — horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {DEPTH_CHIPS.map((chip) => (
          <TouchableOpacity
            key={chip.key}
            style={[styles.chip, depthFilter === chip.key && styles.chipActive]}
            onPress={() => setDepthFilter(chip.key)}
            accessibilityRole="button"
            accessibilityLabel={chip.label}
          >
            <Text style={[styles.chipText, depthFilter === chip.key && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Question list */}
      {isLoading ? (
        <ActivityIndicator color={colors.gold} style={styles.loader} />
      ) : isError ? (
        <Text style={styles.errorText}>Không thể tải câu tự vấn. Thử lại sau.</Text>
      ) : (
        <FlashList
          data={questions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SelfInquiryQuestionCardWithDepthTag
              question={item}
              onPress={() => handleQuestionPress(item)}
            />
          )}
          estimatedItemSize={110}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            !isPro ? (
              <ProUpgradePromoCardBanner onPress={handleProPromoPress} />
            ) : null
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={colors.gold} style={{ marginVertical: 16 }} />
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  title: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes['2xl'],
    color: colors.ink,
    letterSpacing: -0.6,
    lineHeight: fontSizes['2xl'] * 1.15,
  },
  subtitle: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    marginTop: 4,
  },
  chipScroll: {
    flexGrow: 0,
    marginBottom: spacing[3],
  },
  chipRow: {
    paddingHorizontal: spacing[5],
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldTint,
  },
  chipText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs + 1,
    color: colors.inkMuted,
  },
  chipTextActive: {
    color: colors.goldDeep,
    fontFamily: typography.sansSemiBold,
  },
  listContent: {
    paddingTop: spacing[2],
    paddingBottom: spacing[10],
  },
  loader: {
    marginTop: spacing[10],
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing[10],
    paddingHorizontal: spacing[6],
  },
});
