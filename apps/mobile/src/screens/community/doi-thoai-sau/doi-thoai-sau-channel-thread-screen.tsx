/**
 * doi-thoai-sau-channel-thread-screen — Phone 10 from mockup v3.
 *
 * Group chat thread:
 *   - SlowModeAmberBanner (top)
 *   - FlashList inverted — newest at bottom
 *   - Anonymized presence count in header ("9 người")
 *   - Sticky ChatComposerWithSlowModeCountdown (bottom)
 *   - ⓘ channel info modal
 *
 * Anti-pattern enforcement:
 *   ✗ NO typing indicator
 *   ✗ NO read receipts
 *   ✗ NO online dot
 *   ✗ NO user list (only anonymized count)
 *   ✗ NO special styling for any user including Đăng
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, spacing, radii, fontSizes } from '../../../theme';
import { useChannelWebsocket } from '../../../features/doi-thoai-sau/hooks/use-channel-websocket-with-slow-mode';
import {
  useChannelMessageStore,
  type ChannelMessage,
} from '../../../features/doi-thoai-sau/channel-message-store';
import { usePromoteMessageToForumQa } from '../../../features/doi-thoai-sau/hooks/use-promote-message-to-forum-qa';
import { useAuthStore } from '../../../stores/auth-store';
import { SlowModeAmberBanner } from '../../../features/doi-thoai-sau/components/slow-mode-amber-banner';
import { ChatMessageBubble } from '../../../features/doi-thoai-sau/components/chat-message-bubble';
import { ChatComposerWithSlowModeCountdown } from '../../../features/doi-thoai-sau/components/chat-composer-with-slow-mode-countdown';
import type { CommunityStackParamList } from '../../../types/navigation-types';

type ThreadRouteProp = RouteProp<CommunityStackParamList, 'DoiThoaiSauThread'>;

// ── Screen ────────────────────────────────────────────────────────────────────

export function DoiThoaiSauChannelThreadScreen() {
  const route = useRoute<ThreadRouteProp>();
  const navigation = useNavigation();
  const { channelId, channelSlug, slowModeSeconds, ephemeralTtlHours } = route.params;

  const currentUid = useAuthStore((s) => s.uid);
  const [infoVisible, setInfoVisible] = useState(false);

  const { sendMessage, rateLimitRetryAfterMs, presenceCount } =
    useChannelWebsocket(channelId);

  const messages = useChannelMessageStore(
    (s) => s.messagesByChannel[channelId] ?? [],
  );

  const promote = usePromoteMessageToForumQa(channelId);

  const handlePromote = useCallback(
    (messageId: string) => {
      promote.mutate(
        { messageId },
        {
          onSuccess: ({ questionId }) => {
            (navigation as { navigate: (screen: string, params?: object) => void }).navigate(
              'HoiDapForum',
              { prefillFromQuestionId: questionId },
            );
          },
        },
      );
    },
    [promote, navigation],
  );

  // Debounce presence count to avoid flicker on transient reconnects (500ms)
  const [displayPresence, setDisplayPresence] = useState(presenceCount);
  const presenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (presenceTimerRef.current) clearTimeout(presenceTimerRef.current);
    presenceTimerRef.current = setTimeout(() => setDisplayPresence(presenceCount), 500);
    return () => {
      if (presenceTimerRef.current) clearTimeout(presenceTimerRef.current);
    };
  }, [presenceCount]);

  // Set dynamic header
  useEffect(() => {
    navigation.setOptions({
      title: `#${channelSlug}`,
      headerRight: () => (
        <View style={headerStyles.right}>
          {displayPresence > 0 && (
            <Text style={headerStyles.presence}>{displayPresence} người</Text>
          )}
          <TouchableOpacity
            onPress={() => setInfoVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Thông tin kênh"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <InfoIcon />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, channelSlug, displayPresence]);

  const renderItem = useCallback(
    ({ item }: { item: ChannelMessage }) => (
      <ChatMessageBubble
        message={item}
        currentUid={currentUid}
        onPromote={handlePromote}
      />
    ),
    [currentUid, handlePromote],
  );

  // FlashList inverted — pass newest-first array
  const reversedMessages = [...messages].reverse();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <SlowModeAmberBanner
          slowModeSeconds={slowModeSeconds}
          ephemeralTtlHours={ephemeralTtlHours}
        />

        <FlashList
          data={reversedMessages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          inverted
          estimatedItemSize={72}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
        />

        <ChatComposerWithSlowModeCountdown
          onSend={sendMessage}
          rateLimitRetryAfterMs={rateLimitRetryAfterMs}
        />
      </KeyboardAvoidingView>

      <ChannelInfoModal
        visible={infoVisible}
        onClose={() => setInfoVisible(false)}
        channelSlug={channelSlug}
        slowModeSeconds={slowModeSeconds}
        ephemeralTtlHours={ephemeralTtlHours}
        presenceCount={displayPresence}
      />
    </SafeAreaView>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyText}>
        {'Im lặng cũng là một dạng đối thoại.\nBắt đầu khi anh thấy đúng lúc.'}
      </Text>
    </View>
  );
}

// ── Channel info modal ────────────────────────────────────────────────────────

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  channelSlug: string;
  slowModeSeconds: number;
  ephemeralTtlHours: number;
  presenceCount: number;
}

function ChannelInfoModal({
  visible,
  onClose,
  channelSlug,
  slowModeSeconds,
  ephemeralTtlHours,
  presenceCount,
}: InfoModalProps) {
  function formatSlow(s: number) {
    return s < 60 ? `${s}s mỗi tin` : `${Math.round(s / 60)} phút mỗi tin`;
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={modal.overlay} activeOpacity={1} onPress={onClose}>
        <View style={modal.sheet}>
          <View style={modal.handle} />
          <Text style={modal.title}>{'#'}{channelSlug}</Text>

          <View style={modal.row}>
            <Text style={modal.key}>Slow-mode</Text>
            <Text style={modal.val}>{formatSlow(slowModeSeconds)}</Text>
          </View>
          <View style={modal.row}>
            <Text style={modal.key}>Tin tự ẩn sau</Text>
            <Text style={modal.val}>{ephemeralTtlHours}h</Text>
          </View>
          <View style={modal.row}>
            <Text style={modal.key}>Đang ở đây</Text>
            {/* Anonymized count only — no user list */}
            <Text style={modal.val}>{presenceCount > 0 ? `${presenceCount} người` : '—'}</Text>
          </View>

          <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
            <Text style={modal.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function InfoIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke={colors.inkMuted} strokeWidth={1.8}>
      <Circle cx={12} cy={12} r={10} />
      <Path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
    </Svg>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  listContent: { paddingVertical: spacing[2] },
  emptyWrap: {
    flex: 1,
    padding: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    // Counter-rotate text to cancel FlashList inverted transform
    transform: [{ scaleY: -1 }],
  },
  emptyText: {
    fontFamily: typography.serifItalic,
    fontSize: fontSizes.md,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: fontSizes.md * 1.6,
  },
});

const headerStyles = StyleSheet.create({
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginRight: spacing[1],
  },
  presence: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
  },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(22,19,16,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing[6],
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.rule,
    alignSelf: 'center',
    marginBottom: spacing[2],
  },
  title: {
    fontFamily: typography.mono,
    fontSize: fontSizes.md,
    color: colors.ink,
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  key: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted },
  val: { fontFamily: typography.sansMedium, fontSize: fontSizes.sm, color: colors.ink },
  closeBtn: {
    marginTop: spacing[4],
    backgroundColor: colors.goldTint,
    borderRadius: radii.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.goldSoft,
  },
  closeBtnText: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.base,
    color: colors.goldDeep,
  },
});
