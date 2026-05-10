/**
 * ForumQaDetailScreen — Phone 12: question hero + voted answers + sticky reply composer.
 * Chosen answer shown first with gold ĐƯỢC CHỌN badge (content marker, not user badge).
 * Long-press own question's answer → Alert → PATCH chosen-answer (author-only, server 403 otherwise).
 * Anti-hierarchy: ALL answer cards use identical template — Đăng = peer, no exceptions.
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, fontSizes, radii, spacing } from '../../../theme';
import { useQuestion } from '../../../hooks/use-questions';
import { useVoteMutation } from '../../../hooks/use-vote-mutation';
import { useCreateAnswerMutation, useChooseAnswerMutation } from '../../../hooks/use-answers-mutation';
import { QuestionDetailHeroCard } from '../../../components/forum-qa/question-detail-hero-card';
import { AnswerCardWithVote } from '../../../components/forum-qa/answer-card-with-vote';
import { useAuthStore } from '../../../stores/auth-store';
import type { Answer } from '@btd/shared';
import type { CommunityStackScreenProps } from '../../../types/navigation-types';

type RouteProps = CommunityStackScreenProps<'ForumQaDetail'>['route'];

// In-memory voted sets (server reconciles on settle)
const votedAnswerIds = new Set<string>();

// Phase 9 will wire real profile lookup; mock focus for dev
const MOCK_FOCUS: Record<string, string> = {
  'Linh An':     'Đang luyện cấp 2 80%',
  'Đăng':        'Đang luyện cấp 1 68%',
  'Bích Ngọc':   'Đang luyện cấp 2 35%',
  'Thanh Phong': 'Đang luyện cấp 2 60%',
};

export function ForumQaDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { questionId } = route.params;
  const currentUid = useAuthStore((s) => s.uid);

  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [answerSort, setAnswerSort] = useState<'top' | 'newest'>('top');
  const [, forceUpdate] = useState(0);

  const { data, isLoading, isError } = useQuestion(questionId);
  const voteMutation = useVoteMutation();
  const createAnswerMutation = useCreateAnswerMutation();
  const chooseAnswerMutation = useChooseAnswerMutation();

  const question = data?.question;
  const isAuthor = question?.authorUid === currentUid;

  const answers: Answer[] = useMemo(() => {
    if (!data?.answers) return [];
    return [...data.answers].sort((a, b) => {
      if (a.isChosen && !b.isChosen) return -1;
      if (!a.isChosen && b.isChosen) return 1;
      return answerSort === 'top'
        ? b.voteCount - a.voteCount
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [data?.answers, answerSort]);

  const handleVoteQuestion = useCallback(() => {
    if (!question || votedAnswerIds.has(`q:${question.id}`)) return;
    votedAnswerIds.add(`q:${question.id}`);
    forceUpdate((n) => n + 1);
    voteMutation.mutate({ targetType: 'question', targetId: question.id, questionId: question.id });
  }, [question, voteMutation]);

  const handleVoteAnswer = useCallback((answer: Answer) => {
    if (votedAnswerIds.has(answer.id)) return;
    votedAnswerIds.add(answer.id);
    forceUpdate((n) => n + 1);
    voteMutation.mutate({ targetType: 'answer', targetId: answer.id, questionId });
  }, [voteMutation, questionId]);

  const handleLongPressAnswer = useCallback((answer: Answer) => {
    if (!isAuthor || answer.isChosen) return;
    Alert.alert(
      'Đánh dấu câu trả lời này?',
      'Câu trả lời sẽ được đánh dấu là ĐƯỢC CHỌN. Chỉ tác giả câu hỏi mới làm được điều này.',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Đánh dấu', onPress: () => chooseAnswerMutation.mutate({ questionId, answerId: answer.id }) },
      ],
    );
  }, [isAuthor, questionId, chooseAnswerMutation]);

  const handleSubmitReply = useCallback(async () => {
    const trimmed = replyText.trim();
    if (trimmed.length < 10) return;
    setSubmittingReply(true);
    try {
      await createAnswerMutation.mutateAsync({ questionId, body: trimmed });
      setReplyText('');
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi trả lời. Thử lại sau.');
    } finally {
      setSubmittingReply(false);
    }
  }, [replyText, questionId, createAnswerMutation]);

  const renderAnswer = useCallback(({ item }: { item: Answer }) => (
    <TouchableOpacity onLongPress={() => handleLongPressAnswer(item)} delayLongPress={500} activeOpacity={1}>
      <AnswerCardWithVote
        answer={item}
        hasVoted={votedAnswerIds.has(item.id)}
        onVote={() => handleVoteAnswer(item)}
        authorCurrentFocus={MOCK_FOCUS[item.authorNickname]}
      />
    </TouchableOpacity>
  ), [handleLongPressAnswer, handleVoteAnswer]);

  const ListHeader = useCallback(() => {
    if (!question) return null;
    return (
      <>
        <QuestionDetailHeroCard
          question={question}
          hasVoted={votedAnswerIds.has(`q:${question.id}`)}
          onVote={handleVoteQuestion}
        />
        <View style={styles.divider}>
          <Text style={styles.ansCount}>{answers.length} trả lời</Text>
          <TouchableOpacity onPress={() => setAnswerSort((s) => s === 'top' ? 'newest' : 'top')}>
            <Text style={styles.sortDropdown}>{answerSort === 'top' ? 'Vote nhiều ▾' : 'Mới nhất ▾'}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }, [question, answers.length, answerSort, handleVoteQuestion]);

  if (isLoading) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator size="large" color={colors.gold} /></View></SafeAreaView>;
  }
  if (isError || !question) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><Text style={styles.errText}>Không thể tải câu hỏi. Thử lại sau.</Text></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Nav bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}
            accessibilityRole="button" accessibilityLabel="Quay lại">
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth={2}>
              <Path d="m15 18-6-6 6-6" />
            </Svg>
          </TouchableOpacity>
          <View style={styles.spacer} />
          <TouchableOpacity style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Thêm tuỳ chọn">
            <Svg width={22} height={22} viewBox="0 0 24 24" fill={colors.ink}>
              <Circle cx={12} cy={5} r={1.5} />
              <Circle cx={12} cy={12} r={1.5} />
              <Circle cx={12} cy={19} r={1.5} />
            </Svg>
          </TouchableOpacity>
        </View>

        <FlashList
          data={answers}
          renderItem={renderAnswer}
          keyExtractor={(item) => item.id}
          estimatedItemSize={200}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Chưa có trả lời nào. Bạn là người đầu tiên?</Text>
            </View>
          }
        />

        {/* Sticky reply composer */}
        <View style={styles.replyBar}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{currentUid ? 'B' : '?'}</Text>
          </View>
          <TextInput
            style={styles.replyInput}
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Trả lời câu hỏi này..."
            placeholderTextColor={colors.inkMuted}
            multiline
            maxLength={4096}
            accessibilityLabel="Viết câu trả lời"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (replyText.trim().length < 10 || submittingReply) && styles.sendBtnDisabled]}
            onPress={handleSubmitReply}
            disabled={replyText.trim().length < 10 || submittingReply}
            accessibilityRole="button" accessibilityLabel="Gửi trả lời"
          >
            {submittingReply
              ? <ActivityIndicator size="small" color="#fdf6e6" />
              : <Svg width={14} height={14} viewBox="0 0 24 24" fill="#fdf6e6"><Path d="m4 4 16 8-16 8 4-8z" /></Svg>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[1], minHeight: 52 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  spacer: { flex: 1 },
  listContent: { paddingBottom: 24 },
  divider: { marginHorizontal: spacing[5], marginBottom: spacing[2], paddingBottom: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.rule, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  ansCount: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.sm + 1, color: colors.ink },
  sortDropdown: { fontFamily: typography.sansMedium, fontSize: fontSizes.xs + 1, color: colors.goldDeep },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted, textAlign: 'center' },
  empty: { paddingHorizontal: spacing[5], paddingTop: spacing[6], alignItems: 'center' },
  emptyText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted, textAlign: 'center', lineHeight: fontSizes.sm * 1.6 },
  replyBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing[4], paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: 'rgba(248,243,234,0.96)',
    borderTopWidth: 1, borderTopColor: colors.rule,
  },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.goldTint, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.xs, color: colors.goldDeep },
  replyInput: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.rule, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8, fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.ink, maxHeight: 80 },
  sendBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.goldDeep, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sendBtnDisabled: { opacity: 0.35 },
});
