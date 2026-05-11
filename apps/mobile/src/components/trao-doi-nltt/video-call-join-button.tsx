/**
 * VideoCallJoinButton — opens a video call join URL via Linking.
 *
 * Uses videoCallProvider.getJoinLink() to resolve the URL then opens
 * the system browser (or in-app browser if provider has embedUrl).
 * Handles loading state and errors gracefully.
 */
import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { colors, typography, fontSizes, spacing, radii } from '../../theme';
import { videoCallProvider } from '../../services/video-call-service';
import { useAuthStore } from '../../stores/auth-store';

// ── Props ─────────────────────────────────────────────────────────────────────

interface VideoCallJoinButtonProps {
  roomId: string;
  label?: string;
  compact?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VideoCallJoinButton({
  roomId,
  label = 'Vào phòng',
  compact = false,
}: VideoCallJoinButtonProps) {
  const uid = useAuthStore((s) => s.uid ?? 'guest');
  const [loading, setLoading] = useState(false);

  const handlePress = useCallback(async () => {
    setLoading(true);
    try {
      const joinUrl = await videoCallProvider.getJoinLink(roomId, uid);
      const canOpen = await Linking.canOpenURL(joinUrl);
      if (!canOpen) {
        throw new Error(`Không mở được URL: ${joinUrl}`);
      }
      await Linking.openURL(joinUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể mở phòng';
      Alert.alert('Lỗi kết nối', message, [{ text: 'Đóng' }]);
    } finally {
      setLoading(false);
    }
  }, [roomId, uid]);

  return (
    <TouchableOpacity
      style={[styles.button, compact && styles.buttonCompact]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.gold,
    borderRadius: radii.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonCompact: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  label: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.base,
    color: '#FFFFFF',
  },
  labelCompact: {
    fontSize: fontSizes.sm,
  },
});
