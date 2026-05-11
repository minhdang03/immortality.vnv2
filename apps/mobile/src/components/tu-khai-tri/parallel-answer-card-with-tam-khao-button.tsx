/**
 * ParallelAnswerCardWithTamKhaoButton — single parallel answer card (Phone 3 layout).
 *
 * "Tham khảo" = save to personal library. NOT "đồng cảm", NOT a social vote.
 *
 * CRITICAL anti-hierarchy rules (verified by tests):
 *   - ALL authors use IDENTICAL card template — Đăng = peer, no exceptions
 *   - authorCurrentFocus = current practice state, NOT rank/badge
 *   - NO follower count on author
 *   - NO vote count on author
 *   - NO special styling for any author, including Đăng
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, fontSizes, radii, spacing } from '../../theme';
import type { SelfInquiryAnswer } from '../../hooks/use-self-inquiry-questions';

// ── Subcomponents ─────────────────────────────────────────────────────────

function AuthorAvatar({ nickname }: { nickname: string }) {
  const initial = nickname.charAt(0).toUpperCase();
  return (
    <View style={styles.avatar} accessibilityElementsHidden>
      <Text style={styles.avatarInitial}>{initial}</Text>
    </View>
  );
}

function BookmarkIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2}>
      <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────

interface Props {
  answer: SelfInquiryAnswer;
  onTamKhao: () => void;
  isSaved?: boolean;
}

export function ParallelAnswerCardWithTamKhaoButton({
  answer,
  onTamKhao,
  isSaved = false,
}: Props) {
  return (
    // Identical card style for ALL authors — Đăng = peer (assertion verified in tests)
    <View style={styles.card}>
      {/* Author row — identical template regardless of who the author is */}
      <View style={styles.authorRow}>
        <AuthorAvatar nickname={answer.authorNickname} />
        {/* Plain text name — no badge, no tier color, same for everyone */}
        <Text style={styles.authorName}>{answer.authorNickname}</Text>
        {/* currentFocus = practice state, NOT rank/badge — shown only if set */}
        {answer.authorCurrentFocus != null && (
          <Text style={styles.authorFocus} numberOfLines={1}>
            · {answer.authorCurrentFocus}
          </Text>
        )}
        {/* NO follower count, NO reputation score */}
      </View>

      {/* Answer body */}
      <Text style={styles.body}>{answer.body}</Text>

      {/* Footer: time + Tham khảo button */}
      <View style={styles.footer}>
        <Text style={styles.time}>{relTime(answer.createdAt)}</Text>

        {/* "Tham khảo" = save to library — outline button, NOT a social action */}
        <TouchableOpacity
          style={[styles.tamKhaoBtn, isSaved && styles.tamKhaoBtnSaved]}
          onPress={onTamKhao}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Lưu vào thư viện cá nhân"
        >
          <BookmarkIcon />
          <Text style={[styles.tamKhaoBtnText, isSaved && styles.tamKhaoBtnTextSaved]}>
            {isSaved ? 'Đã lưu' : 'Tham khảo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 60) return `${m}p trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h trước`;
  return `${Math.floor(h / 24)} ngày`;
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Identical structure for ALL users — enforced in tests
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    marginHorizontal: spacing[5],
    marginBottom: spacing[3],
    padding: 14,
    gap: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.goldTint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitial: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.xs - 1,
    color: colors.goldDeep,
  },
  // Same name style for Đăng as for any peer — no special treatment
  authorName: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  // currentFocus = practice state label, NOT a rank badge
  authorFocus: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    flex: 1,
  },
  body: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm + 1,
    color: colors.inkSoft,
    lineHeight: (fontSizes.sm + 1) * 1.55,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  time: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
  },
  // Outline button — NOT filled, NOT a social vote button
  tamKhaoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tamKhaoBtnSaved: {
    backgroundColor: colors.goldTint,
    borderColor: colors.goldDeep,
  },
  tamKhaoBtnText: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.xs,
    color: colors.gold,
  },
  tamKhaoBtnTextSaved: {
    color: colors.goldDeep,
  },
});
