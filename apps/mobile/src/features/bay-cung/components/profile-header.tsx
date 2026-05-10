/**
 * profile-header — avatar + name + technical status sub-line + optional edit gear.
 *
 * Anti-patterns enforced:
 *  - NO badge, border, or halo based on isFounder / any tier
 *  - NO follower count, post count, or achievement badge
 *  - Status line = technical state only ("Đang phá: X · Đang luyện: cấp 1 Y%")
 *
 * Used identically for own profile and Đăng's profile.
 * Paid sections are rendered OUTSIDE this component by the parent screen.
 */
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { GradientAvatar } from '../../../components/ui/gradient-avatar';
import { colors, typography, fontSizes, spacing } from '../../../theme';
import type { FullProfile } from '../../../hooks/use-profile';

const CHU_NO_LABELS: Record<string, string> = {
  'thieu-hieu-biet': 'thiếu hiểu biết',
  'ong-ba-lac-hau': 'ông bà lạc hậu',
  'dinh-kien': 'định kiến',
  'chu-no-giau-mat': 'chủ nô giấu mặt',
};

function buildStatusLine(profile: FullProfile): string {
  if (!profile.currentFocus) return '';
  const chuNoLabel = CHU_NO_LABELS[profile.currentFocus.chuNo] ?? profile.currentFocus.chuNo;
  const capLabel = `cấp 1 ${profile.currentFocus.capLuyenPct}%`;
  return `Đang phá: ${chuNoLabel} · Đang luyện: ${capLabel}`;
}

interface ProfileHeaderProps {
  profile: FullProfile;
  onEditPress?: () => void;
  showPeerMenu?: boolean;
  onPeerMenuPress?: () => void;
}

function GearIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth={1.8}>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
}

function ThreeDotsIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth={1.8}>
      <Circle cx={12} cy={12} r={1.5} fill={colors.ink} />
      <Circle cx={19} cy={12} r={1.5} fill={colors.ink} />
      <Circle cx={5} cy={12} r={1.5} fill={colors.ink} />
    </Svg>
  );
}

export function ProfileHeader({
  profile,
  onEditPress,
  showPeerMenu = false,
  onPeerMenuPress,
}: ProfileHeaderProps) {
  const statusLine = buildStatusLine(profile);

  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <View style={{ width: 40 }} />
        <View style={{ flex: 1 }} />
        {onEditPress && !showPeerMenu && (
          <TouchableOpacity
            onPress={onEditPress}
            style={styles.iconBtn}
            accessibilityLabel="Chỉnh sửa hồ sơ"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <GearIcon />
          </TouchableOpacity>
        )}
        {showPeerMenu && onPeerMenuPress && (
          <TouchableOpacity
            onPress={onPeerMenuPress}
            style={styles.iconBtn}
            accessibilityLabel="Tùy chọn"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ThreeDotsIcon />
          </TouchableOpacity>
        )}
      </View>

      {/* Avatar — photo or gradient fallback. NO border, NO badge. */}
      <View style={styles.avatarWrap}>
        {profile.photoUrl ? (
          <Image
            source={{ uri: profile.photoUrl }}
            style={styles.photo}
            accessibilityLabel={`Ảnh đại diện của ${profile.nickname ?? 'thành viên'}`}
          />
        ) : (
          <GradientAvatar uid={profile.uid} nickname={profile.nickname} size={96} />
        )}
      </View>

      {/* Name — plain text, no badge suffix */}
      <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
        {profile.nickname ?? 'Ẩn danh'}
      </Text>

      {/* Technical status — not emotional, not a level/rank label */}
      {statusLine !== '' && (
        <Text style={styles.status} numberOfLines={2}>
          {statusLine}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
  },
  iconRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    // NO border, NO shadow ring, NO badge wrapper
    marginBottom: spacing[3],
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.goldSoft,
  },
  name: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes.xl,
    color: colors.ink,
    letterSpacing: -0.3,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  status: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
});
