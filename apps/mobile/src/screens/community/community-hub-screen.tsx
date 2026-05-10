/**
 * CommunityHubScreen — Phone 1 from redesign-mockup-ios-community-v3.html
 *
 * 5 không gian cards matching mockup exactly:
 *   1. Tự Khai Trí
 *   2. Đối thoại sâu
 *   3. Hỏi đáp · Forum Q&A
 *   4. Bay Cùng
 *   5. Trao Đổi Năng Lượng Trí Tuệ
 *
 * Anti-pattern checklist (enforced):
 *   ✗ No follower counts
 *   ✗ No online dots
 *   ✗ No like counts on people
 *   ✗ No tier badges on user profiles
 *   ✗ No engagement metrics
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, spacing, radii, fontSizes } from '../../theme';
import type { CommunityStackScreenProps } from '../../types/navigation-types';

type Nav = CommunityStackScreenProps<'CommunityHub'>['navigation'];

// ── Hub card data (mock — Phase 6+ wires to API) ─────────────────────────────

// Only routes that accept no required params can be navigated from hub cards
type HubRoute = 'CommunityHub' | 'TuKhaiTri' | 'DoiThoaiSau' | 'HoiDapForum' | 'BayCung' | 'TraoDoiNLTT';

interface HubCard {
  id: string;
  title: string;
  meta: React.ReactNode;
  route: HubRoute;
  icon: React.ReactNode;
}

function IconTuKhaiTri({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Path d="M12 2v8M12 14v8M2 12h8M14 12h8" />
      <Circle cx={12} cy={12} r={2} />
    </Svg>
  );
}

function IconDoiThoai({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

function IconHoiDap({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Circle cx={12} cy={12} r={10} />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <Circle cx={12} cy={17} r={0.5} fill={color} />
    </Svg>
  );
}

function IconBayCung({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Circle cx={12} cy={12} r={5} />
      <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </Svg>
  );
}

function IconTraoDoi({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Path d="M13 2L3 14h7l-1 8 11-12h-7z" />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.inkMuted} strokeWidth={2}>
      <Path d="m9 6 6 6-6 6" />
    </Svg>
  );
}

// ── Hub card component ────────────────────────────────────────────────────────

interface HubCardViewProps {
  card: HubCard;
  onPress: () => void;
}

function HubCardView({ card, onPress }: HubCardViewProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={card.title}
    >
      <View style={styles.cardGlyph}>{card.icon}</View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {card.meta}
        </Text>
      </View>
      <ChevronRight />
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function CommunityHubScreen() {
  const navigation = useNavigation<Nav>();

  const hubCards: HubCard[] = [
    {
      id: 'tu-khai-tri',
      title: 'Tự Khai Trí',
      meta: (
        <>
          <Text style={styles.metaBold}>12</Text>
          {' câu tự vấn · 47 hướng đi parallel'}
        </>
      ),
      route: 'TuKhaiTri',
      icon: <IconTuKhaiTri color={colors.gold} />,
    },
    {
      id: 'doi-thoai-sau',
      title: 'Đối thoại sâu',
      meta: (
        <>
          <Text style={styles.metaBold}>7</Text>
          {' kênh theo chủ đề · Tin nhắn tự ẩn · Slow-mode'}
        </>
      ),
      route: 'DoiThoaiSau',
      icon: <IconDoiThoai color={colors.gold} />,
    },
    {
      id: 'hoi-dap-forum',
      title: 'Hỏi đáp · Forum Q&A',
      meta: (
        <>
          <Text style={styles.metaBold}>34</Text>
          {' câu hỏi · Vote câu hay · Không follow người'}
        </>
      ),
      route: 'HoiDapForum',
      icon: <IconHoiDap color={colors.gold} />,
    },
    {
      id: 'bay-cung',
      title: 'Bay Cùng',
      meta: (
        <>
          <Text style={styles.metaBold}>12</Text>
          {' người đang bay cùng · Đăng đang luyện cấp 1'}
        </>
      ),
      route: 'BayCung',
      icon: <IconBayCung color={colors.gold} />,
    },
    {
      id: 'trao-doi-nltt',
      title: 'Trao Đổi Năng Lượng Trí Tuệ',
      meta: 'Phiên đồng đẳng tối nay · 1-on-1 với Đăng',
      route: 'TraoDoiNLTT',
      icon: <IconTraoDoi color={colors.gold} />,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.largeTitle}>Cộng đồng Bất Tử Đạo</Text>
        <Text style={styles.subtitle}>Mỗi người tự đi đường của mình.</Text>

        {/* 5 không gian cards */}
        <View style={styles.cardList}>
          {hubCards.map((card) => (
            <HubCardView
              key={card.id}
              card={card}
              onPress={() => navigation.navigate(card.route as never)}
            />
          ))}
        </View>

        {/* Free tier chip */}
        <View style={styles.tierChip}>
          <Text style={styles.tierText}>
            {'Đang dùng '}
            <Text style={styles.tierFreeLabel}>miễn phí</Text>
            {' · Lõi không khóa.  '}
            <Text style={styles.tierUpgradeLink}>Xem gói nâng cao →</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[10],
  },
  largeTitle: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes['2xl'],
    color: colors.ink,
    letterSpacing: -0.6,
    lineHeight: fontSizes['2xl'] * 1.15,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  subtitle: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
  },
  cardList: {
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    minHeight: 78,
    shadowColor: '#161310',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGlyph: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.goldTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.base,
    color: colors.ink,
    lineHeight: fontSizes.base * 1.3,
  },
  cardMeta: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    lineHeight: fontSizes.xs * 1.5,
  },
  metaBold: {
    fontFamily: typography.sansSemiBold,
    color: colors.goldDeep,
  },
  tierChip: {
    marginHorizontal: spacing[4],
    marginTop: spacing[6],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.goldTint,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.goldSoft,
  },
  tierText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.xs,
    color: colors.inkMuted,
    lineHeight: fontSizes.xs * 1.6,
  },
  tierFreeLabel: {
    fontFamily: typography.sansSemiBold,
    color: colors.mint,
  },
  tierUpgradeLink: {
    fontFamily: typography.sansMedium,
    color: colors.gold,
  },
});
