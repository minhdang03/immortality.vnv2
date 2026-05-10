/**
 * AnswerCardWithVote — answer card for detail screen (Phone 12).
 *
 * CRITICAL anti-hierarchy rules (verified by tests):
 *   - All authors use IDENTICAL card template — Đăng = peer, no exceptions
 *   - currentFocus = current practice state ("Đang luyện cấp X Y%"), NOT rank/badge
 *   - ĐƯỢC CHỌN badge = content marker on the ANSWER, not a user badge
 *   - NO follower count, NO reputation, NO follow button anywhere
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { colors, typography, fontSizes, radii, spacing } from '../../theme';
import { VoteUpWidget } from './vote-up-widget';
import type { Answer } from '@btd/shared';

interface Props {
  answer: Answer;
  hasVoted: boolean;
  onVote: () => void;
  authorCurrentFocus?: string;
}

function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}p trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h trước`;
  return `${Math.floor(h / 24)} ngày`;
}

export function AnswerCardWithVote({ answer, hasVoted, onVote, authorCurrentFocus }: Props) {
  return (
    <View style={[styles.card, answer.isChosen && styles.chosenCard]}>
      <VoteUpWidget count={answer.voteCount} hasVoted={hasVoted} onVote={onVote} />
      <View style={styles.content}>
        {answer.isChosen && (
          <View style={styles.badge}>
            <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={colors.goldDeep} strokeWidth={3}>
              <Polyline points="20 6 9 17 4 12" />
            </Svg>
            <Text style={styles.badgeText}>ĐƯỢC CHỌN</Text>
          </View>
        )}
        <Text style={styles.body}>{answer.body}</Text>
        <View style={styles.foot}>
          <View style={styles.authorRow}>
            {/* Avatar — identical gradient for ALL users, no tier color */}
            <View style={styles.avatar}>
              <Text style={styles.avatarInit}>{answer.authorNickname.charAt(0).toUpperCase()}</Text>
            </View>
            {/* Name — plain text, same style for Đăng as for any other user */}
            <Text style={styles.name}>{answer.authorNickname}</Text>
            {/* currentFocus = practice state, NOT level/rank badge */}
            {authorCurrentFocus ? <Text style={styles.focus}>· {authorCurrentFocus}</Text> : null}
          </View>
          <Text style={styles.time}>{relTime(answer.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing[5], marginBottom: spacing[3], padding: 14,
    backgroundColor: colors.surface, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.rule, flexDirection: 'row', gap: 12,
  },
  chosenCard: { borderColor: colors.goldSoft, backgroundColor: 'rgba(176,134,66,0.04)' },
  content: { flex: 1 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6,
    alignSelf: 'flex-start', backgroundColor: colors.goldSoft,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill,
  },
  badgeText: { fontFamily: typography.mono, fontSize: fontSizes.xs - 1, fontWeight: '600', color: colors.goldDeep, letterSpacing: 0.5 },
  body: { fontFamily: typography.sans, fontSize: fontSizes.sm + 1, color: colors.inkSoft, lineHeight: (fontSizes.sm + 1) * 1.55, marginBottom: 10 },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.rule },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  avatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.goldTint, alignItems: 'center', justifyContent: 'center' },
  avatarInit: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.xs - 1, color: colors.goldDeep },
  // Identical style for ALL users — no special treatment for Đăng or anyone
  name: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.xs + 1, color: colors.inkSoft },
  // currentFocus = what they are currently practising, NOT rank/level
  focus: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted, flexShrink: 1 },
  time: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted },
});
