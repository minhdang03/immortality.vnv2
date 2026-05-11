/**
 * TuKhaiTriAiHoiNguocScreen — Phone 4 from mockup v3 (Pro-gated).
 *
 * On entry: checks Pro tier via useProTierSubscriptionStatus.
 *   - Not Pro → shows ProPaywallModal99k over the screen, navigates back on dismiss.
 *   - Pro → turn-based AI conversation via useAiStreamSseTurnBased.
 *
 * AI sends questions — user answers them. No partial streaming shown (turn-based).
 * Header shows ProTierBadgeDaysRemaining chip ("PRO · còn 17/30 ngày").
 *
 * Backend: POST /api/ai/ask (Phase 4, workers/notion/src/ai-ask-sse-handler.ts)
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, fontSizes, spacing } from '../../../theme';
import { useProTierSubscriptionStatus } from '../../../hooks/use-pro-tier-subscription-status';
import { useAiStreamSseTurnBased } from '../../../hooks/use-ai-stream-sse-turn-based';
import { ProTierBadgeDaysRemaining } from '../../../components/tu-khai-tri/pro-tier-badge-days-remaining';
import { ProPaywallModal99k } from '../../../components/tu-khai-tri/pro-paywall-modal-99k';
import { AiChatTurnBubbleMessage } from '../../../components/tu-khai-tri/ai-chat-turn-bubble-message';
import { AiChatTurnComposerInput } from '../../../components/tu-khai-tri/ai-chat-turn-composer-input';

function ResetIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.inkMuted} strokeWidth={2}>
      <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <Path d="M3 3v5h5" />
    </Svg>
  );
}

// Opening AI message shown when conversation is empty
const AI_OPENING_PROMPT =
  'Tôi sẽ không trả lời bạn. Tôi sẽ hỏi ngược lại.\n\n' +
  'Bắt đầu: Điều gì đang chiếm nhiều tâm trí bạn nhất lúc này?';

export function TuKhaiTriAiHoiNguocScreen() {
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);

  const { isPro, badgeLabel, isLoading: proLoading } = useProTierSubscriptionStatus();
  const { messages, isStreaming, error, send, reset } = useAiStreamSseTurnBased();

  const [paywallVisible, setPaywallVisible] = useState(false);

  // Show paywall as soon as we know user is not Pro
  useEffect(() => {
    if (!proLoading && !isPro) {
      setPaywallVisible(true);
    }
  }, [proLoading, isPro]);

  // Auto-scroll to bottom when messages change or streaming completes
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleDismissPaywall = () => {
    setPaywallVisible(false);
    navigation.goBack();
  };

  const handlePurchaseSuccess = () => {
    setPaywallVisible(false);
    // TanStack Query will refetch pro-tier-status automatically via invalidation
  };

  if (proLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator color={colors.gold} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Paywall — overlays screen when not Pro */}
      <ProPaywallModal99k
        visible={paywallVisible}
        onDismiss={handleDismissPaywall}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      {/* Screen header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>AI hỏi ngược</Text>
          <ProTierBadgeDaysRemaining badgeLabel={badgeLabel} />
        </View>
        <TouchableOpacity
          onPress={reset}
          style={styles.resetBtn}
          accessibilityRole="button"
          accessibilityLabel="Bắt đầu hội thoại mới"
        >
          <ResetIcon />
        </TouchableOpacity>
      </View>

      {/* Conversation — turn-based, no partial streaming */}
      <ScrollView
        ref={scrollRef}
        style={styles.conversation}
        contentContainerStyle={styles.conversationContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Opening AI prompt when conversation is fresh */}
        {messages.length === 0 && (
          <View style={styles.openingBubbleWrap}>
            <View style={styles.openingBubble}>
              <Text style={styles.openingText}>{AI_OPENING_PROMPT}</Text>
            </View>
          </View>
        )}

        {/* Completed turn messages */}
        {messages.map((msg) => (
          <AiChatTurnBubbleMessage key={msg.id} message={msg} />
        ))}

        {/* Streaming indicator — shown while waiting for complete AI turn */}
        {isStreaming && (
          <View style={styles.streamingRow}>
            <View style={styles.streamingBubble}>
              <ActivityIndicator size="small" color={colors.gold} />
              <Text style={styles.streamingHint}>AI đang suy nghĩ…</Text>
            </View>
          </View>
        )}

        {/* Error state */}
        {error != null && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Composer — sticky at bottom */}
      <AiChatTurnComposerInput onSend={send} isStreaming={isStreaming} />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loader: {
    marginTop: spacing[10],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  headerLeft: {
    gap: 6,
  },
  headerTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.base + 2,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  resetBtn: {
    padding: 8,
  },
  conversation: {
    flex: 1,
  },
  conversationContent: {
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  openingBubbleWrap: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
    alignItems: 'flex-start',
  },
  openingBubble: {
    maxWidth: '85%',
    backgroundColor: colors.goldTint,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  openingText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm + 1,
    color: colors.ink,
    lineHeight: (fontSizes.sm + 1) * 1.6,
    fontStyle: 'italic',
  },
  streamingRow: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
    alignItems: 'flex-start',
  },
  streamingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.goldTint,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  streamingHint: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs + 1,
    color: colors.inkMuted,
    fontStyle: 'italic',
  },
  errorBox: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs + 1,
    color: '#DC2626',
    lineHeight: (fontSizes.xs + 1) * 1.5,
  },
});
