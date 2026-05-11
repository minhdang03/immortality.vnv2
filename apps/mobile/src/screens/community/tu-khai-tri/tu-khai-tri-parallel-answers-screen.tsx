/**
 * TuKhaiTriParallelAnswersScreen — Phone 3 from mockup v3.
 *
 * Shows one câu tự vấn + N hướng đi (parallel answers) from peers.
 * Each answer: author (avatar + name + currentFocus) + body + "Tham khảo" button.
 *
 * CRITICAL anti-hierarchy rules (verified by tests):
 *   - Đăng = peer. Identical card style. No special styling.
 *   - NO follower count on any author
 *   - NO vote count on authors
 *   - "Tham khảo" = save to library, NOT "đồng cảm" / NOT a social vote
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useRoute } from '@react-navigation/native';
import { colors, typography, fontSizes, spacing, radii } from '../../../theme';
import {
  useSelfInquiryAnswers,
  useTamKhaoMutation,
  type SelfInquiryAnswer,
} from '../../../hooks/use-self-inquiry-questions';
import { ParallelAnswerCardWithTamKhaoButton } from '../../../components/tu-khai-tri/parallel-answer-card-with-tam-khao-button';
import type { CommunityStackScreenProps } from '../../../types/navigation-types';

type RouteProps = CommunityStackScreenProps<'TuKhaiTriParallelAnswers'>['route'];

// In-memory saved set — server reconciles on next query invalidation
const savedAnswerIds = new Set<string>();

export function TuKhaiTriParallelAnswersScreen() {
  const route = useRoute<RouteProps>();
  const { questionId, questionContent } = route.params;
  const [, forceUpdate] = useState(0);

  const { data: answers, isLoading, isError } = useSelfInquiryAnswers(questionId);
  const tamKhaoMutation = useTamKhaoMutation();

  const handleTamKhao = useCallback(
    (answer: SelfInquiryAnswer) => {
      if (savedAnswerIds.has(answer.id)) return;
      savedAnswerIds.add(answer.id);
      forceUpdate((n) => n + 1);
      tamKhaoMutation.mutate({ answerId: answer.id, questionId });
    },
    [tamKhaoMutation, questionId],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading ? (
        <ActivityIndicator color={colors.gold} style={styles.loader} />
      ) : isError ? (
        <Text style={styles.errorText}>Không thể tải hướng đi. Thử lại sau.</Text>
      ) : (
        <FlashList
          data={answers ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            // Đăng = peer: ParallelAnswerCardWithTamKhaoButton uses identical
            // card structure for ALL authors — assertion verified in tests.
            <ParallelAnswerCardWithTamKhaoButton
              answer={item}
              onTamKhao={() => handleTamKhao(item)}
              isSaved={savedAnswerIds.has(item.id)}
            />
          )}
          estimatedItemSize={160}
          ListHeaderComponent={
            <View style={styles.questionHero}>
              <Text style={styles.questionLabel}>Câu tự vấn</Text>
              <Text style={styles.questionContent}>{questionContent}</Text>
              <Text style={styles.answersLabel}>
                {answers?.length ?? 0} hướng đi từ đồng đạo
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Chưa có hướng đi nào. Bạn là người đầu tiên!
            </Text>
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
  listContent: {
    paddingBottom: spacing[10],
  },
  questionHero: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[5],
    gap: 8,
  },
  questionLabel: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs - 1,
    color: colors.inkMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  questionContent: {
    fontFamily: typography.serif,
    fontSize: fontSizes.lg,
    color: colors.ink,
    lineHeight: fontSizes.lg * 1.45,
    letterSpacing: -0.2,
  },
  answersLabel: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs + 1,
    color: colors.goldDeep,
    fontWeight: '600',
  },
  emptyText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing[8],
    paddingHorizontal: spacing[6],
    fontStyle: 'italic',
  },
});
