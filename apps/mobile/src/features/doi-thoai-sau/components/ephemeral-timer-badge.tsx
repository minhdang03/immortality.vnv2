/**
 * ephemeral-timer-badge — shows remaining time before a message auto-hides.
 * Updates every second via setInterval.
 * Opacity fades linearly as expiresAt approaches.
 */
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, typography, fontSizes } from '../../../theme';

interface Props {
  expiresAt: number; // epoch ms
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'đã ẩn';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `ẩn sau ${h}h ${m}p`;
  if (m > 0) return `ẩn sau ${m}p ${s}s`;
  return `ẩn sau ${s}s`;
}

export function EphemeralTimerBadge({ expiresAt }: Props) {
  const [remainingMs, setRemainingMs] = useState(() => expiresAt - Date.now());

  useEffect(() => {
    const tick = () => setRemainingMs(expiresAt - Date.now());
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  // Fade: full when >1h remaining, 0.3 floor as it approaches 0
  const totalTtl = 24 * 60 * 60 * 1000;
  const ratio = Math.max(0, Math.min(1, remainingMs / totalTtl));
  const opacity = 0.3 + ratio * 0.7;

  return (
    <Text
      style={[styles.badge, { opacity }]}
      accessibilityLabel={formatRemaining(remainingMs)}
    >
      {'🌙 '}
      {formatRemaining(remainingMs)}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    marginTop: 3,
  },
});
