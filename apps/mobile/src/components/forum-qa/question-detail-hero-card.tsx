/**
 * QuestionDetailHeroCard — gold-tint hero card for question detail screen (Phone 12).
 * Full title + body + depth/topic tags + vote widget. Matches fq-q-hero in mockup.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

interface Props { question: Question; hasVoted: boolean; onVote: () => void; }

export function QuestionDetailHeroCard({ question, hasVoted, onVote }: Props) {
  return (
    <View style={styles.hero}>
      <VoteUpWidget count={question.voteCount} hasVoted={hasVoted} onVote={onVote} />
      <View style={styles.content}>
        <Text style={styles.title}>{question.title}</Text>
        <Text style={styles.body}>{question.body}</Text>
        <View style={styles.foot}>
          <DepthTagChip depthTag={question.depthTag} />
          <TopicChip slug={trucToSlug(question.truc)} />
          <Text style={styles.sep}>·</Text>
          <Text style={styles.meta}>đăng {relTime(question.createdAt)} · {question.answerCount} trả lời</Text>
          <Text style={styles.sep}>·</Text>
          <Text style={styles.by}>bởi <Text style={styles.byName}>{question.authorNickname}</Text></Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: spacing[5], marginTop: 4, marginBottom: 14, padding: 14,
    backgroundColor: colors.goldTint, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.goldSoft, flexDirection: 'row', gap: 12,
  },
  content: { flex: 1 },
  title: {
    fontFamily: typography.serif, fontSize: fontSizes.md + 1, fontWeight: '600',
    color: colors.ink, lineHeight: (fontSizes.md + 1) * 1.25, letterSpacing: -0.2, marginBottom: 6,
  },
  body: {
    fontFamily: typography.sans, fontSize: fontSizes.sm + 1, color: colors.inkSoft,
    lineHeight: (fontSizes.sm + 1) * 1.55, marginBottom: 10,
  },
  foot: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  sep: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted, opacity: 0.5 },
  meta: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted },
  by: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted, fontStyle: 'italic' },
  byName: { fontStyle: 'normal', color: colors.inkSoft },
});
