/**
 * ProPaywallModal99k — appears on AI hỏi ngược screen entry when user is not Pro.
 * Explains the feature, shows price 99K/tháng, two CTA paths:
 *   - SePay VietQR (default)
 *   - Stripe web checkout (alt)
 * On dismiss: navigates back to browse.
 */
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, fontSizes, radii, spacing } from '../../theme';
import { initiateProPurchase, pollPaymentStatus } from '../../services/payment-service';
import type { PaymentResult } from '../../services/payment-service';

// ── Icons ─────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.inkMuted} strokeWidth={2}>
      <Path d="M18 6 6 18M6 6l12 12" />
    </Svg>
  );
}

function LightningIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill={colors.gold} stroke={colors.goldDeep} strokeWidth={1.2}>
      <Path d="M13 2L3 14h7l-1 8 11-12h-7z" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.mint} strokeWidth={2.5}>
      <Path d="M20 6 9 17 4 12" />
    </Svg>
  );
}

// ── Feature bullets ───────────────────────────────────────────────────────

const FEATURE_BULLETS = [
  'AI hỏi ngược — câu hỏi từ AI, không phải đáp án sẵn',
  'Hội thoại turn-based: suy nghĩ kỹ trước khi trả lời',
  'Không timer. Không áp lực. Chỉ có chiều sâu.',
  'Lịch sử hội thoại lưu riêng tư — chỉ bạn thấy',
];

// ── Props ─────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onPurchaseSuccess: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export function ProPaywallModal99k({ visible, onDismiss, onPurchaseSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [pollStatus, setPollStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (method: 'sepay-vietqr' | 'stripe-web') => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await initiateProPurchase(method);
      setPaymentResult(result);

      // Start polling for confirmation
      const final = await pollPaymentStatus(result.paymentId, (status) => {
        setPollStatus(status);
      });

      if (final.status === 'confirmed') {
        onPurchaseSuccess();
      } else {
        setError('Thanh toán chưa được xác nhận. Vui lòng liên hệ hỗ trợ nếu đã chuyển khoản.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setError(msg);
    } finally {
      setIsLoading(false);
      setPollStatus(null);
    }
  };

  const handleDismiss = () => {
    if (isLoading) return; // don't dismiss during active payment
    setPaymentResult(null);
    setError(null);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDismiss}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Đóng"
            disabled={isLoading}
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <LightningIcon />
            </View>
            <Text style={styles.heroTitle}>AI hỏi ngược</Text>
            <Text style={styles.heroSub}>
              AI không trả lời bạn.{'\n'}AI hỏi ngược lại để bạn tự tìm ra.
            </Text>
          </View>

          {/* Feature bullets */}
          <View style={styles.bullets}>
            {FEATURE_BULLETS.map((text, i) => (
              <View key={i} style={styles.bulletRow}>
                <CheckIcon />
                <Text style={styles.bulletText}>{text}</Text>
              </View>
            ))}
          </View>

          {/* Price */}
          <View style={styles.priceBlock}>
            <Text style={styles.price}>99.000 ₫</Text>
            <Text style={styles.pricePer}>/tháng · hủy bất cứ lúc nào</Text>
          </View>

          {/* Error state */}
          {error != null && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* QR shown after init */}
          {paymentResult?.qrDataUri != null && pollStatus === 'pending' && (
            <View style={styles.qrBox}>
              <Text style={styles.qrLabel}>
                Quét mã VietQR để thanh toán {paymentResult.amountLabel}
              </Text>
              {/* QR image rendered via URI — Image component handles data URI */}
              {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
              {React.createElement(require('react-native').Image, {
                source: { uri: paymentResult.qrDataUri },
                style: styles.qrImage,
                resizeMode: 'contain',
                accessibilityLabel: 'Mã QR thanh toán',
              })}
              <Text style={styles.qrWaiting}>Đang chờ xác nhận thanh toán…</Text>
              <ActivityIndicator color={colors.gold} style={{ marginTop: 8 }} />
            </View>
          )}

          {/* CTAs */}
          {paymentResult == null && (
            <>
              {isLoading ? (
                <ActivityIndicator color={colors.gold} style={{ marginVertical: 24 }} />
              ) : (
                <View style={styles.ctaGroup}>
                  <TouchableOpacity
                    style={styles.ctaPrimary}
                    onPress={() => handlePurchase('sepay-vietqr')}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Đăng ký Pro qua VietQR"
                  >
                    <Text style={styles.ctaPrimaryText}>Đăng ký Pro · VietQR</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.ctaSecondary}
                    onPress={() => handlePurchase('stripe-web')}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel="Thanh toán qua Stripe"
                  >
                    <Text style={styles.ctaSecondaryText}>Thanh toán qua thẻ / Stripe</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          <Text style={styles.disclaimer}>
            Lõi nội dung Bất Tử Đạo không bao giờ bị khóa.{'\n'}
            Pro chỉ mở thêm tính năng AI tương tác.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  closeBtn: {
    padding: 8,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[10],
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    gap: 12,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.goldTint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.goldSoft,
  },
  heroTitle: {
    fontFamily: typography.serif,
    fontSize: fontSizes['2xl'],
    color: colors.ink,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontFamily: typography.sans,
    fontSize: fontSizes.base,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: fontSizes.base * 1.6,
  },
  bullets: {
    gap: 12,
    marginBottom: spacing[6],
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm + 1,
    color: colors.inkSoft,
    lineHeight: (fontSizes.sm + 1) * 1.5,
    flex: 1,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing[6],
  },
  price: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes['2xl'],
    color: colors.ink,
  },
  pricePer: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: radii.sm,
    padding: 12,
    marginBottom: spacing[4],
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: '#991B1B',
    lineHeight: fontSizes.sm * 1.5,
  },
  qrBox: {
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing[6],
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  qrLabel: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrWaiting: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    fontStyle: 'italic',
  },
  ctaGroup: {
    gap: 12,
    marginBottom: spacing[6],
  },
  ctaPrimary: {
    backgroundColor: colors.gold,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaPrimaryText: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.base,
    color: '#fff',
    letterSpacing: 0.2,
  },
  ctaSecondary: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaSecondaryText: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
  },
  disclaimer: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: fontSizes.xs * 1.7,
  },
});
