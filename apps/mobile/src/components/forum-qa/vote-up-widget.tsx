/**
 * VoteUpWidget — vertical ▲/count vote widget.
 * Vote up ONLY (no downvote). Idempotent: tap again no-op.
 * 500ms cooldown post-press prevents rapid-fire API calls.
 * Anti-FOMO: vote is on CONTENT, never on user profiles.
 */
import React, { useCallback, useRef, useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, fontSizes } from '../../theme';

interface VoteUpWidgetProps {
  count: number;
  hasVoted: boolean;
  onVote: () => void;
  disabled?: boolean;
}

export function VoteUpWidget({ count, hasVoted, onVote, disabled = false }: VoteUpWidgetProps) {
  const [cooldown, setCooldown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = useCallback(() => {
    if (cooldown || disabled || hasVoted) return;
    setCooldown(true);
    onVote();
    timerRef.current = setTimeout(() => setCooldown(false), 500);
  }, [cooldown, disabled, hasVoted, onVote]);

  React.useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const iconColor = hasVoted ? colors.goldDeep : colors.inkMuted;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || cooldown || hasVoted}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel={hasVoted ? 'Đã vote' : 'Vote up'}
        style={styles.btn}
      >
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={2.5}>
          <Path d="m6 15 6-6 6 6" />
        </Svg>
      </TouchableOpacity>
      <Text style={[styles.count, hasVoted && styles.countActive]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 2, width: 38 },
  btn: { width: 24, height: 22, alignItems: 'center', justifyContent: 'center' },
  count: { fontFamily: typography.mono, fontSize: fontSizes.sm, fontWeight: '600', color: colors.ink, lineHeight: 16 },
  countActive: { color: colors.goldDeep },
});
