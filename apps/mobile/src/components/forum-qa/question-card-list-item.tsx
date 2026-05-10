/**
 * QuestionCardListItem — browse list card (Phone 11 layout).
 * Left: VoteUpWidget. Right: title + excerpt + footer (depth tag, topic, answer count, author, time).
 * Anti-hierarchy: authorNickname = plain text, no badge for ANY user including Đăng.
 * Anti-FOMO: no follower count, no reputation score.
 */
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, typography, fontSizes, radii, spacing } from '../../theme';
import { VoteUpWidget } from './vote-up-widget';
import { DepthTagChip } from './depth-tag-chip';
import { TopicChip } from './topic-chip';
import type { Question } from '@btd/shared';

function trucToSlug(truc: 1 | 2 | 3): string {
  return { 1: 'truc-1-co-the', 2: 'truc-2-linh-hon', 3: 'truc-3-pha-no-le' }[truc] ?? `truc-${truc}`;
}

function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}p trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h trước`;
  return `${Math.floor(h / 24)} ngày`;
}

interface Props { question: Question; hasVoted: boolean; onPress: () => void; onVote: () => void; }

export function QuestionCardListItem({ question, hasVoted, onPress, onVote }: Props) {
  const ansText = question.answerCount > 0
    ? `✓ ${question.answerCount} trả lời${question.chosenAnswerId ? ' · 1 được chọn' : ' · chưa chọn'}`
    : 'Chưa có trả lời';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}
      accessibilityRole="button" accessibilityLabel={question.title}>
      <VoteUpWidget count={question.voteCount} hasVoted={hasVoted} onVote={onVote} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{question.title}</Text>
        <Text style={styles.excerpt} numberOfLines={2}>{question.body}</Text>
        <View style={styles.foot}>
          <DepthTagChip depthTag={question.depthTag} />
          <TopicChip slug={trucToSlug(question.truc)} />
          <Text style={styles.ansCount}>{ansText}</Text>
          <Text style={styles.sep}>·</Text>
          <Text style={styles.byText}>bởi <Text style={styles.byName}>{question.authorNickname}</Text></Text>
          <Text style={styles.sep}>·</Text>
          <Text style={styles.timeText}>{relTime(question.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing[5], marginBottom: spacing[3], padding: 14,
    backgroundColor: colors.surface, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.rule, flexDirection: 'row', gap: 12,
  },
  content: { flex: 1 },
  title: {
    fontFamily: typography.serif, fontSize: fontSizes.base + 2, fontWeight: '600',
    color: colors.ink, lineHeight: (fontSizes.base + 2) * 1.3, letterSpacing: -0.2, marginBottom: 4,
  },
  excerpt: {
    fontFamily: typography.sans, fontSize: fontSizes.xs + 1, color: colors.inkMuted,
    lineHeight: (fontSizes.xs + 1) * 1.45, marginBottom: 8,
  },
  foot: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  ansCount: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.goldDeep, fontWeight: '600' },
  sep: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted, opacity: 0.5 },
  byText: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted, fontStyle: 'italic' },
  byName: { fontStyle: 'normal', color: colors.inkSoft },
  timeText: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted },
});
