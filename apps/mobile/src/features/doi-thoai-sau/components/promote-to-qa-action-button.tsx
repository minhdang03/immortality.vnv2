/**
 * promote-to-qa-action-button — small action shown below a chat message bubble
 * after long-press. Triggers POST /api/messages/:id/promote via parent callback.
 * No special styling for any user — peer equality enforced.
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii, fontSizes } from '../../../theme';

interface Props {
  onPress: () => void;
}

export function PromoteToQaActionButton({ onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel="Chuyển tin nhắn này vào Forum Q&A"
    >
      <Text style={styles.label}>{'↗ chuyển vào Forum Q&A'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginTop: spacing[1],
    paddingVertical: 4,
    paddingHorizontal: spacing[2],
    backgroundColor: colors.goldTint,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    alignSelf: 'flex-end',
  },
  label: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.xs,
    color: colors.goldDeep,
  },
});
