/**
 * ForumQaBrowseScreen — Phone 11: question list + depth-tag filter chips + sort tabs + FAB.
 * FlashList for virtualized scrolling (60fps target with 1000+ items).
 * Anti-FOMO: no follower count, no reputation score, no follow button.
 * Depth tags = CONTENT classification on questions, NEVER on users.
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import Svg, { Path, Line } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, fontSizes, radii, spacing } from '../../../theme';
import { useQuestions, type QuestionSort } from '../../../hooks/use-questions';
import { useVoteMutation } from '../../../hooks/use-vote-mutation';
import { useCreateQuestionMutation } from '../../../hooks/use-answers-mutation';
import { QuestionCardListItem } from '../../../components/forum-qa/question-card-list-item';
import { ComposeQuestionModal } from '../../../components/forum-qa/compose-question-modal';
import type { Question, DepthTag } from '@btd/shared';
import type { CommunityStackParamList } from '../../../types/navigation-types';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'HoiDapForum'>;

const SORT_TABS: { key: QuestionSort; label: string }[] = [
  { key: 'newest', label: 'Câu hỏi mới' },
  { key: 'top',    label: 'Vote nhiều' },
  { key: 'unsolved', label: 'Chưa giải' },
  { key: 'mine',   label: 'Của bạn' },
];

const DEPTH_CHIPS: { key: DepthTag | 'all'; label: string }[] = [
  { key: 'all',      label: 'Tất cả' },
  { key: 'co-ban',   label: '🌱 Cơ bản' },
  { key: 'di-sau',   label: '🌿 Đi sâu' },
  { key: 'nang-cao', label: '🌳 Nâng cao' },
];

// In-memory voted set (server is source of truth after reconcile)
const votedIds = new Set<string>();

export function ForumQaBrowseScreen() {
  const navigation = useNavigation<Nav>();
  const [sort, setSort] = useState<QuestionSort>('newest');
  const [depthFilter, setDepthFilter] = useState<DepthTag | 'all'>('all');
  const [composeVisible, setComposeVisible] = useState(false);
  const [, forceUpdate] = useState(0);

  const filter = useMemo(() => ({
    sort,
    depthTag: depthFilter === 'all' ? undefined : depthFilter,
  }), [sort, depthFilter]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useQuestions(filter);

  const voteMutation = useVoteMutation();
  const createMutation = useCreateQuestionMutation();

  const questions: Question[] = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const handleVote = useCallback((q: Question) => {
    if (votedIds.has(q.id)) return;
    votedIds.add(q.id);
    forceUpdate((n) => n + 1);
    voteMutation.mutate({ targetType: 'question', targetId: q.id, questionId: q.id });
  }, [voteMutation]);

  const handlePress = useCallback((q: Question) => {
    navigation.navigate('ForumQaDetail', { questionId: q.id });
  }, [navigation]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(({ item }: { item: Question }) => (
    <QuestionCardListItem
      question={item}
      hasVoted={votedIds.has(item.id)}
      onPress={() => handlePress(item)}
      onVote={() => handleVote(item)}
    />
  ), [handlePress, handleVote]);

  const keyExtractor = useCallback((item: Question) => item.id, []);

  const EmptyComponent = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {isError
            ? 'Không thể tải câu hỏi. Kiểm tra kết nối mạng.'
            : 'Chưa có câu hỏi nào trong trục này.\nBắt đầu một câu nhé.'}
        </Text>
      </View>
    );
  }, [isLoading, isError]);

  const FooterComponent = useCallback(() =>
    isFetchingNextPage ? <View style={styles.footer}><ActivityIndicator size="small" color={colors.gold} /></View> : null,
  [isFetchingNextPage]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}
          accessibilityRole="button" accessibilityLabel="Quay lại">
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth={2}>
            <Path d="m15 18-6-6 6-6" />
          </Svg>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Tìm kiếm">
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth={1.8}>
            <Path d="M21 21l-4.3-4.3M11 18A7 7 0 1 0 11 4a7 7 0 0 0 0 14z" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Large title */}
      <Text style={styles.title}>Hỏi đáp</Text>
      <Text style={styles.subtitle}>Vấn đề {'>'} Người.</Text>

      {/* Sort tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.sortScroll} contentContainerStyle={styles.sortRow}>
        {SORT_TABS.map((tab) => (
          <TouchableOpacity key={tab.key} onPress={() => setSort(tab.key)} style={styles.sortTab}
            accessibilityRole="tab" accessibilityState={{ selected: sort === tab.key }}>
            <Text style={[styles.sortText, sort === tab.key && styles.sortTextActive]}>{tab.label}</Text>
            {sort === tab.key && <View style={styles.sortIndicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Depth filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll} contentContainerStyle={styles.chipsRow}>
        {DEPTH_CHIPS.map((chip) => (
          <TouchableOpacity key={chip.key} onPress={() => setDepthFilter(chip.key)}
            style={[styles.chip, depthFilter === chip.key && styles.chipActive]}
            accessibilityRole="radio" accessibilityState={{ selected: depthFilter === chip.key }}>
            <Text style={[styles.chipText, depthFilter === chip.key && styles.chipTextActive]}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Question list */}
      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.gold} /></View>
      ) : (
        <FlashList
          data={questions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={140}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={EmptyComponent}
          ListFooterComponent={FooterComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setComposeVisible(true)}
        accessibilityRole="button" accessibilityLabel="Đặt câu hỏi mới">
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fdf6e6" strokeWidth={2.5}>
          <Line x1={12} y1={5} x2={12} y2={19} />
          <Line x1={5} y1={12} x2={19} y2={12} />
        </Svg>
      </TouchableOpacity>

      <ComposeQuestionModal
        visible={composeVisible}
        onClose={() => setComposeVisible(false)}
        onSubmit={async (d) => { await createMutation.mutateAsync(d); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[1], minHeight: 52 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  spacer: { flex: 1 },
  title: { fontFamily: typography.sansBold, fontSize: fontSizes['2xl'], color: colors.ink, letterSpacing: -0.6, lineHeight: fontSizes['2xl'] * 1.15, paddingHorizontal: spacing[5], paddingTop: 4, paddingBottom: 2 },
  subtitle: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted, paddingHorizontal: spacing[5], paddingBottom: spacing[3] },
  sortScroll: { flexGrow: 0 },
  sortRow: { flexDirection: 'row', gap: 18, paddingHorizontal: spacing[5], paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.rule },
  sortTab: { paddingVertical: 6, paddingBottom: 8, position: 'relative' },
  sortText: { fontFamily: typography.sansMedium, fontSize: fontSizes.xs + 1, color: colors.inkMuted },
  sortTextActive: { fontFamily: typography.sansSemiBold, color: colors.ink },
  sortIndicator: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: colors.goldDeep, borderRadius: 1 },
  chipsScroll: { flexGrow: 0 },
  chipsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing[5], paddingTop: 4, paddingBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.rule, flexShrink: 0 },
  chipActive: { backgroundColor: colors.goldTint, borderColor: colors.goldSoft },
  chipText: { fontFamily: typography.sansMedium, fontSize: fontSizes.xs + 1, color: colors.inkSoft },
  chipTextActive: { fontFamily: typography.sansSemiBold, color: colors.goldDeep },
  listContent: { paddingTop: spacing[3], paddingBottom: 120 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { paddingHorizontal: spacing[5], paddingTop: spacing[8], alignItems: 'center' },
  emptyText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted, textAlign: 'center', lineHeight: fontSizes.sm * 1.6 },
  footer: { padding: spacing[4], alignItems: 'center' },
  fab: {
    position: 'absolute', bottom: 96, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.goldDeep, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.gold, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 8,
  },
});
