/**
 * home-screen.tsx
 * Trang chủ hub — Knowledge Base + Audio Khai Tri entry cards.
 * Lives inside HomeStackNavigator. Phase 11 replaces Phase 5 placeholder.
 */
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, fontSizes, spacing, radii } from '../../theme';
import type { HomeStackParamList } from '../../types/navigation-types';

interface HubCard {
  id: string; eyebrow: string; title: string; subtitle: string;
  icon: string; accentColor: string; route: 'KnowledgeBaseList' | 'AudioKhaiTriList';
}

const HUB_CARDS: HubCard[] = [
  { id: 'knowledge', eyebrow: 'KHAI MINH', title: 'Kho tri thức',
    subtitle: 'Bài viết & tài liệu từ Bất Tử Đạo', icon: '📖',
    accentColor: colors.gold, route: 'KnowledgeBaseList' },
  { id: 'audio', eyebrow: 'BÀI GIẢNG', title: 'Âm thanh Khai Trí',
    subtitle: 'Nghe bài giảng của Đăng — phát trong nền', icon: '🎧',
    accentColor: '#7C6FAD', route: 'AudioKhaiTriList' },
];

function HubCardView({ card, onPress }: { card: HubCard; onPress: (r: HubCard['route']) => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(card.route)} activeOpacity={0.75}
      accessible accessibilityLabel={`${card.title}: ${card.subtitle}`} accessibilityRole="button">
      <View style={[styles.cardAccent, { backgroundColor: card.accentColor + '18' }]}>
        <Text style={styles.cardIcon}>{card.icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardEyebrow, { color: card.accentColor }]}>{card.eyebrow}</Text>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>{card.subtitle}</Text>
      </View>
      <Text style={[styles.cardChevron, { color: card.accentColor }]}>›</Text>
    </TouchableOpacity>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const handleCardPress = useCallback((route: HubCard['route']) => {
    if (route === 'KnowledgeBaseList') navigation.navigate('KnowledgeBaseList');
    else if (route === 'AudioKhaiTriList') navigation.navigate('AudioKhaiTriList');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>TRANG CHỦ</Text>
          <Text style={styles.heading}>Bất Tử Đạo</Text>
          <Text style={styles.tagline}>Con đường hướng tới sự thức tỉnh và tự do nội tâm</Text>
        </View>
        <Text style={styles.sectionLabel}>Khám phá nội dung</Text>
        <View style={styles.cards}>
          {HUB_CARDS.map((card) => <HubCardView key={card.id} card={card} onPress={handleCardPress} />)}
        </View>
        <View style={styles.webHint}>
          <Text style={styles.webHintText}>
            Truy cập đầy đủ tại <Text style={styles.webHintLink}>battudao.com</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: spacing[12] },
  header: { paddingHorizontal: spacing[5], paddingTop: spacing[8], paddingBottom: spacing[6], gap: spacing[2] },
  eyebrow: { fontFamily: typography.mono, fontSize: fontSizes.xs, color: colors.gold, letterSpacing: 3 },
  heading: { fontFamily: typography.sansBold, fontSize: fontSizes['3xl'], color: colors.ink, letterSpacing: -0.5 },
  tagline: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted, lineHeight: fontSizes.sm * 1.6 },
  sectionLabel: { fontFamily: typography.mono, fontSize: fontSizes.xs, color: colors.inkMuted, letterSpacing: 2, paddingHorizontal: spacing[5], marginBottom: spacing[3] },
  cards: { paddingHorizontal: spacing[4], gap: spacing[3] },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radii.xl, padding: spacing[4], gap: spacing[4], shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  cardAccent: { width: 52, height: 52, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' },
  cardIcon: { fontSize: 24 },
  cardBody: { flex: 1, gap: 2 },
  cardEyebrow: { fontFamily: typography.mono, fontSize: fontSizes.xs, letterSpacing: 2 },
  cardTitle: { fontFamily: typography.sansBold, fontSize: fontSizes.base, color: colors.ink },
  cardSubtitle: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted, lineHeight: fontSizes.xs * 1.5 },
  cardChevron: { fontSize: fontSizes['2xl'], lineHeight: fontSizes['2xl'], marginTop: -2 },
  webHint: { marginTop: spacing[8], alignItems: 'center', paddingHorizontal: spacing[6] },
  webHintText: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted, textAlign: 'center' },
  webHintLink: { fontFamily: typography.sansMedium, color: colors.gold },
});
