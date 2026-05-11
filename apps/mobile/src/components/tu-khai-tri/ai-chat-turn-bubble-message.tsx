/**
 * AiChatTurnBubbleMessage — single turn bubble in the AI hỏi ngược conversation (Phone 4).
 *
 * AI messages: left-aligned, subtle ⚡ prefix, gold-tint background.
 * User messages: right-aligned, plain ink background.
 * Turn-based design: only complete messages are rendered (no partial streaming shown).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, fontSizes, radii, spacing } from '../../theme';
import type { AiChatMessage } from '../../hooks/use-ai-stream-sse-turn-based';

interface Props {
  message: AiChatMessage;
}

export function AiChatTurnBubbleMessage({ message }: Props) {
  const isAi = message.role === 'ai';

  return (
    <View style={[styles.row, isAi ? styles.rowAi : styles.rowUser]}>
      <View style={[styles.bubble, isAi ? styles.bubbleAi : styles.bubbleUser]}>
        {isAi && (
          <Text style={styles.aiPrefix} accessibilityElementsHidden>
            ⚡{' '}
          </Text>
        )}
        <Text style={[styles.body, isAi ? styles.bodyAi : styles.bodyUser]}>
          {isAi ? `⚡ ${message.content}` : message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  rowAi: {
    alignItems: 'flex-start',
  },
  rowUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleAi: {
    backgroundColor: colors.goldTint,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderBottomRightRadius: 4,
  },
  // aiPrefix is embedded in body text — this style is unused but kept for clarity
  aiPrefix: {
    display: 'none',
  },
  body: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm + 1,
    lineHeight: (fontSizes.sm + 1) * 1.6,
  },
  bodyAi: {
    color: colors.ink,
    fontStyle: 'italic',
  },
  bodyUser: {
    color: colors.inkSoft,
  },
});
