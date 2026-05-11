/**
 * SelfInquiryQuestionCardWithDepthTag — browse list item (Phone 2 layout).
 *
 * Shows: question content + depth-tag chip (on content, NOT user) + hướng đi count + chevron.
 *
 * Anti-patterns enforced:
 *   - Depth tag = CONTENT classification only, never a user-level indicator
 *   - No author attribution on questions (self-inquiry is collective)
 *   - No follower count, no vote count on users
 */
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, fontSizes, radii, spacing } from '../../theme';
import type { SelfInquiryQuestion } from '../../hooks/use-self-inquiry-questions';
import type { DepthTag } from '@btd/shared';

// ── Depth tag display map ─────────────────────────────────────────────────

const DEPTH_TAG_LABEL: Record<DepthTag, string> = {
  'co-ban': '🌱 Cơ bản',
  'di-sau': '🌿 Đi sâu',
  'nang-cao': '🌳 Nâng cao',
};

const DEPTH_TAG_COLOR: Record<DepthTag, string> = {
  'co-ban': colors.mint,
  'di-sau': colors.gold,
  'nang-cao': colors.goldDeep,
};

// ── Sub-components ────────────────────────────────────────────────────────

function DepthTagChip({ depthTag }: { depthTag: DepthTag }) {
  return (
    <View style={[styles.depthChip, { borderColor: DEPTH_TAG_COLOR[depthTag] }]}>
      <Text style={[styles.depthChipText, { color: DEPTH_TAG_COLOR[depthTag] }]}>
        {DEPTH_TAG_LABEL[depthTag]}
      </Text>
    </View>
  );
}

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.inkMuted} strokeWidth={2}>
      <Path d="m9 6 6 6-6 6" />
    </Svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────

interface Props {
  question: SelfInquiryQuestion;
  onPress: () => void;
}

export function SelfInquiryQuestionCardWithDepthTag({ question, onPress }: Props) {
  const hướngDiLabel =
    question.hướngDiCount === 0
      ? 'Chưa có hướng đi'
      : `${question.hướngDiCount} hướng đi`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={question.content}
    >
      <View style={styles.body}>
        {/* Depth tag on CONTENT — never on user */}
        <DepthTagChip depthTag={question.depthTag} />

        <Text style={styles.content} numberOfLines={3}>
          {question.content}
        </Text>

        <Text style={styles.hướngDiCount}>{hướngDiLabel}</Text>
      </View>

      <ChevronRight />
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    marginHorizontal: spacing[5],
    marginBottom: spacing[3],
    padding: 14,
    gap: 10,
  },
  body: {
    flex: 1,
    gap: 8,
  },
  depthChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  depthChipText: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs - 1,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  content: {
    fontFamily: typography.serif,
    fontSize: fontSizes.base,
    color: colors.ink,
    lineHeight: fontSizes.base * 1.45,
    letterSpacing: -0.1,
  },
  hướngDiCount: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.goldDeep,
    fontWeight: '600',
  },
});
