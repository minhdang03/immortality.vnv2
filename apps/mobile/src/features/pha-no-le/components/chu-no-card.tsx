/**
 * chu-no-card — card for one of 4 chủ nô in Phá Nô Lệ Trí Tuệ.
 *
 * Each card: icon + title + prompt + last log preview + community count + chevron.
 * "Chủ nô giấu mặt" optionally shows a normal text link to Đăng's Khai Trí writing —
 * NO gold halo, no special border, just plain colored text.
 *
 * Anti-patterns: NO level/rank label, NO badge, NO engagement framing on count.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Rect, Path, Circle, Line } from 'react-native-svg';
import { colors, typography, fontSizes, spacing, radii, shadows } from '../../../theme';
import type { ChuNo } from '../../../hooks/use-profile';

// ── Icons ───────────────────────────────────────────────────────────────────

function LockIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.goldDeep} strokeWidth={1.8}>
      <Rect x={3} y={11} width={18} height={11} rx={2} /><Path d="M7 11V7a5 5 0 0 1 10 0" /><Line x1={12} y1={15} x2={12} y2={18} />
    </Svg>
  );
}
function FamilyIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgb(106,58,142)" strokeWidth={1.8}>
      <Circle cx={9} cy={7} r={4} /><Circle cx={17} cy={11} r={3} /><Path d="M3 21v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" />
    </Svg>
  );
}
function GlobeIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.mint} strokeWidth={1.8}>
      <Circle cx={12} cy={12} r={9} /><Path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </Svg>
  );
}
function ShieldIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgb(142,58,74)" strokeWidth={1.8}>
      <Path d="M12 2L2 7v6c0 5 3.5 9 10 11 6.5-2 10-6 10-11V7z" />
    </Svg>
  );
}
function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.inkMuted} strokeWidth={2}>
      <Path d="m9 6 6 6-6 6" />
    </Svg>
  );
}

// ── Config ───────────────────────────────────────────────────────────────────

interface ChuNoConfig {
  title: string;
  prompt: string;
  toneColor: string;
  icon: React.ReactNode;
  dangKhaiTriLabel?: string;
}

const CHU_NO_CONFIGS: Record<ChuNo, ChuNoConfig> = {
  'thieu-hieu-biet': { title: 'Thiếu hiểu biết', prompt: 'Hôm nay học được gì mới mà phá 1 quan niệm cũ?', toneColor: 'rgba(176,134,66,0.10)', icon: <LockIcon /> },
  'ong-ba-lac-hau': { title: 'Ông bà lạc hậu', prompt: 'Định kiến gia truyền nào cần xét lại?', toneColor: 'rgba(106,58,142,0.08)', icon: <FamilyIcon /> },
  'dinh-kien': { title: 'Định kiến từ bé', prompt: 'Niềm tin nào formed lúc 5–15 tuổi mà tôi chưa từng xét?', toneColor: 'rgba(74,157,126,0.08)', icon: <GlobeIcon /> },
  'chu-no-giau-mat': { title: 'Chủ nô giấu mặt', prompt: 'Tôn giáo, gurus, MLM coach — ai đang xài não tôi?', toneColor: 'rgba(142,58,74,0.08)', icon: <ShieldIcon />, dangKhaiTriLabel: 'Đăng vừa đăng bài liên quan →' },
};

// ── ChuNoCard ─────────────────────────────────────────────────────────────────

interface ChuNoCardProps {
  chuNo: ChuNo;
  lastLogPreview: string | null;
  communityCount: number;
  dangKhaiTriUrl?: string | null;
  onPress: (chuNo: ChuNo) => void;
  onDangLinkPress?: () => void;
}

export function ChuNoCard({ chuNo, lastLogPreview, communityCount, dangKhaiTriUrl, onPress, onDangLinkPress }: ChuNoCardProps) {
  const config = CHU_NO_CONFIGS[chuNo];
  const showDangLink = chuNo === 'chu-no-giau-mat' && !!dangKhaiTriUrl && !!onDangLinkPress;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: config.toneColor }]}
      onPress={() => onPress(chuNo)}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={`${config.title} — mở nhật ký`}
    >
      <View style={styles.head}>
        <View style={styles.iconWrap}>{config.icon}</View>
        <Text style={styles.title}>{config.title}</Text>
        <ChevronRight />
      </View>
      <Text style={styles.prompt}>{config.prompt}</Text>
      {lastLogPreview ? (
        <View style={styles.logPreview}>
          <Text style={styles.logText} numberOfLines={3}>"{lastLogPreview}"</Text>
        </View>
      ) : null}
      <View style={styles.foot}>
        <Text style={styles.communityCount}>{communityCount} người cùng bay đang phá</Text>
        {showDangLink && (
          <TouchableOpacity onPress={onDangLinkPress} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} accessibilityRole="link" accessibilityLabel={config.dangKhaiTriLabel}>
            {/* Plain text link — NO gold halo, NO special border */}
            <Text style={styles.dangLink}>{config.dangKhaiTriLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing[5], marginBottom: spacing[3], borderRadius: radii.lg, borderWidth: 1, borderColor: colors.rule, padding: spacing[4], ...shadows.card, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] + 2, marginBottom: spacing[2] },
  iconWrap: { width: 32, height: 32, borderRadius: radii.sm, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { flex: 1, fontFamily: typography.sansBold, fontSize: fontSizes.base, color: colors.ink, letterSpacing: -0.2 },
  prompt: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted, marginBottom: spacing[2], lineHeight: fontSizes.sm * 1.45 },
  logPreview: { backgroundColor: colors.bg, borderRadius: radii.xs, padding: spacing[2] + 2, marginBottom: spacing[2] + 2 },
  logText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkSoft, lineHeight: fontSizes.sm * 1.5 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing[2] },
  communityCount: { fontFamily: typography.mono, fontSize: fontSizes.xs, color: colors.inkMuted },
  // Plain link — no gold halo
  dangLink: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.goldDeep, fontWeight: '500' },
});
