/**
 * chat-message-bubble — asymmetric chat bubble for channel thread.
 *
 * Own messages: gold-tint right-aligned.
 * Other messages: cream surface left-aligned, 28pt gradient avatar.
 *
 * Anti-pattern enforcement (MUST NOT violate):
 *   ✗ NO read receipt indicator
 *   ✗ NO online/offline dot
 *   ✗ NO delivery status
 *   ✗ NO special styling for Đăng (founder) — peer equality enforced by test
 *   ✗ NO tier badge or rank label
 *
 * Long-press own message → reveals PromoteToQaActionButton.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii, fontSizes } from '../../../theme';
import { GradientAvatar } from '../../../components/ui/gradient-avatar';
import { EphemeralTimerBadge } from './ephemeral-timer-badge';
import { PromoteToQaActionButton } from './promote-to-qa-action-button';
import type { ChannelMessage } from '../channel-message-store';

interface Props {
  message: ChannelMessage;
  currentUid: string | null;
  onPromote?: (messageId: string) => void;
}

export function ChatMessageBubble({ message, currentUid, onPromote }: Props) {
  const isOwn = message.authorUid === currentUid;
  const [showPromote, setShowPromote] = useState(false);

  // Expired messages render nothing (pruneExpired handles store; guard here for safety)
  if (message.expiresAt <= Date.now()) return null;

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      {!isOwn && (
        <View style={styles.avatarWrap}>
          <GradientAvatar uid={message.authorUid} nickname={message.authorNickname} size={28} />
        </View>
      )}

      <View style={[styles.bubbleWrap, isOwn ? styles.bubbleWrapOwn : styles.bubbleWrapOther]}>
        {!isOwn && (
          <Text style={styles.nickname} numberOfLines={1}>
            {message.authorNickname}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}
          onLongPress={() => isOwn && setShowPromote((v) => !v)}
          activeOpacity={0.85}
          accessibilityRole="text"
          accessibilityLabel={`${message.authorNickname}: ${message.body}`}
        >
          <Text style={[styles.body, isOwn ? styles.bodyOwn : styles.bodyOther]}>
            {message.body}
          </Text>
        </TouchableOpacity>

        <EphemeralTimerBadge expiresAt={message.expiresAt} />

        {isOwn && showPromote && onPromote && (
          <PromoteToQaActionButton
            onPress={() => {
              setShowPromote(false);
              onPromote(message.id);
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: spacing[1],
    paddingHorizontal: spacing[4],
    alignItems: 'flex-end',
  },
  rowOwn: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  avatarWrap: {
    marginRight: spacing[2],
    marginBottom: 4,
    flexShrink: 0,
  },
  bubbleWrap: { maxWidth: '75%' },
  bubbleWrapOwn: { alignItems: 'flex-end' },
  bubbleWrapOther: { alignItems: 'flex-start' },
  nickname: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    marginBottom: 3,
    marginLeft: 2,
  },
  bubble: {
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  bubbleOwn: {
    backgroundColor: colors.goldTint,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderBottomLeftRadius: 4,
  },
  body: {
    fontSize: fontSizes.base,
    lineHeight: fontSizes.base * 1.5,
  },
  bodyOwn: {
    fontFamily: typography.sans,
    color: colors.inkSoft,
  },
  bodyOther: {
    fontFamily: typography.sans,
    color: colors.ink,
  },
});
