/**
 * GradientAvatar — generates a deterministic gold-palette gradient avatar
 * from a user UID + optional seed string. No photo required.
 *
 * Uses expo-linear-gradient. Gradient stops are derived by hashing UID so
 * each user gets a unique but consistent avatar without storing an image.
 *
 * Anti-pattern: NO tier indicators, NO badges, NO borders denoting rank.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '../../theme';

// Gold-range gradient palette pairs — all within brand palette
const GRADIENT_PAIRS: [string, string][] = [
  [colors.gold, colors.goldDeep],
  ['#c49a4a', '#8b6530'],
  ['#d4a85c', colors.gold],
  [colors.goldDeep, '#5a3d18'],
  ['#e0bc7a', '#b08642'],
];

function hashUid(uid: string): number {
  let h = 0;
  for (let i = 0; i < uid.length; i++) {
    h = (Math.imul(31, h) + uid.charCodeAt(i)) >>> 0;
  }
  return h;
}

function getInitial(nickname: string | null): string {
  if (!nickname) return '?';
  return nickname.trim().charAt(0).toUpperCase();
}

interface GradientAvatarProps {
  uid: string;
  nickname?: string | null;
  size?: number;
}

export function GradientAvatar({ uid, nickname = null, size = 36 }: GradientAvatarProps) {
  const hash = hashUid(uid);
  const [start, end] = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
  const fontSize = Math.round(size * 0.4);
  const borderRadius = size / 2;

  return (
    <LinearGradient
      colors={[start, end]}
      start={{ x: 0.15, y: 0.15 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { width: size, height: size, borderRadius }]}
    >
      <Text style={[styles.initial, { fontSize }]}>{getInitial(nickname)}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: typography.sansSemiBold,
    color: colors.surface,
    includeFontPadding: false,
  },
});
