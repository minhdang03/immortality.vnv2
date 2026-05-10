/**
 * chat-composer-with-slow-mode-countdown — sticky bottom text input for channel thread.
 *
 * Rate-limited state (server-enforced):
 *   - Input disabled (editable=false)
 *   - Placeholder shows countdown "Đợi Xs nữa..."
 *   - Send button disabled
 *   - Countdown label below input row
 *
 * Anti-pattern: NO typing indicator emitted, NO draft sync.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radii, fontSizes } from '../../../theme';

interface Props {
  onSend: (body: string) => void;
  /** Epoch ms when slow-mode cooldown expires. 0 = not rate-limited. */
  rateLimitRetryAfterMs: number;
}

function formatCooldown(remainingMs: number): string {
  const s = Math.ceil(remainingMs / 1000);
  return `Đợi ${s}s nữa...`;
}

export function ChatComposerWithSlowModeCountdown({ onSend, rateLimitRetryAfterMs }: Props) {
  const [body, setBody] = useState('');
  const [cooldownMs, setCooldownMs] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const remaining = rateLimitRetryAfterMs - Date.now();
    if (remaining <= 0) {
      setCooldownMs(0);
      return;
    }

    setCooldownMs(remaining);
    intervalRef.current = setInterval(() => {
      const r = rateLimitRetryAfterMs - Date.now();
      if (r <= 0) {
        setCooldownMs(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setCooldownMs(r);
      }
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [rateLimitRetryAfterMs]);

  const isRateLimited = cooldownMs > 0;
  const canSend = !isRateLimited && body.trim().length > 0;

  function handleSend() {
    if (!canSend) return;
    onSend(body.trim());
    setBody('');
  }

  return (
    <View style={styles.container}>
      <View style={[styles.inputRow, isRateLimited && styles.inputRowDisabled]}>
        <TextInput
          style={styles.input}
          value={body}
          onChangeText={setBody}
          placeholder={isRateLimited ? formatCooldown(cooldownMs) : 'Nhắn gì đó...'}
          placeholderTextColor={isRateLimited ? colors.gold : colors.inkMuted}
          editable={!isRateLimited}
          multiline
          maxLength={4000}
          returnKeyType="default"
          onSubmitEditing={Platform.OS === 'ios' ? handleSend : undefined}
          accessibilityLabel="Ô nhập tin nhắn"
          accessibilityHint={isRateLimited ? formatCooldown(cooldownMs) : undefined}
        />

        <TouchableOpacity
          style={[styles.sendBtn, canSend ? styles.sendBtnActive : styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Gửi tin nhắn"
          accessibilityState={{ disabled: !canSend }}
        >
          <SendIcon active={canSend} />
        </TouchableOpacity>
      </View>

      {isRateLimited && (
        <Text style={styles.cooldownLabel}>{formatCooldown(cooldownMs)}</Text>
      )}
    </View>
  );
}

function SendIcon({ active }: { active: boolean }) {
  const stroke = active ? colors.gold : colors.inkMuted;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2}>
      <Path d="M22 2 11 13M22 2 15 22 11 13 2 9l20-7z" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingLeft: spacing[3],
    paddingRight: spacing[2],
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  inputRowDisabled: {
    borderColor: colors.goldSoft,
    backgroundColor: 'rgba(176,134,66,0.06)',
  },
  input: {
    flex: 1,
    fontFamily: typography.sans,
    fontSize: fontSizes.base,
    color: colors.ink,
    maxHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnActive: {
    backgroundColor: colors.goldTint,
  },
  sendBtnDisabled: {
    backgroundColor: 'transparent',
  },
  cooldownLabel: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs,
    color: colors.gold,
    textAlign: 'center',
    marginTop: spacing[1],
  },
});
