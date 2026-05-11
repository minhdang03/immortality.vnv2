/**
 * AiChatTurnComposerInput — text input + send button for AI hỏi ngược (Phone 4).
 *
 * Slow-mode hint shown below input: "Không timer. Hãy nghĩ kỹ trước khi trả lời."
 * Send disabled while isStreaming=true (turn-based — one turn at a time).
 * Auto-grows up to 5 lines then scrolls.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, fontSizes, radii, spacing } from '../../theme';

function SendIcon({ disabled }: { disabled: boolean }) {
  const stroke = disabled ? colors.inkMuted : colors.gold;
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2}>
      <Path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
    </Svg>
  );
}

interface Props {
  onSend: (text: string) => void;
  isStreaming: boolean;
}

export function AiChatTurnComposerInput({ onSend, isStreaming }: Props) {
  const [text, setText] = useState('');

  const canSend = text.trim().length > 0 && !isStreaming;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    const trimmed = text.trim();
    setText('');
    onSend(trimmed);
  }, [canSend, text, onSend]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Trả lời của bạn…"
            placeholderTextColor={colors.inkMuted}
            multiline
            maxLength={2000}
            numberOfLines={1}
            // grows up to ~5 lines via minHeight + scroll
            scrollEnabled
            editable={!isStreaming}
            returnKeyType="default"
            accessibilityLabel="Nhập câu trả lời"
          />
          <TouchableOpacity
            style={[styles.sendBtn, canSend && styles.sendBtnActive]}
            onPress={handleSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Gửi"
          >
            <SendIcon disabled={!canSend} />
          </TouchableOpacity>
        </View>

        {/* Slow-mode hint — always shown, no timer */}
        <Text style={styles.slowHint}>
          Không timer. Hãy nghĩ kỹ trước khi trả lời.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[5],
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontFamily: typography.sans,
    fontSize: fontSizes.sm + 1,
    color: colors.ink,
    lineHeight: (fontSizes.sm + 1) * 1.5,
    minHeight: 36,
    maxHeight: 120, // ~5 lines
    textAlignVertical: 'top',
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  sendBtnActive: {
    backgroundColor: colors.goldTint,
  },
  slowHint: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs - 1,
    color: colors.inkMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
