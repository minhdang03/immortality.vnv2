/**
 * knowledge-base-list-screen.tsx
 * Lists knowledge base articles from Firestore btd_knowledge (Phase 4 Notion sync).
 * Taps open KnowledgeArticleWebViewScreen. mediaType filter: 'article' (all types shown).
 */
import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore, { type FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { colors, typography, fontSizes, spacing, radii } from '../../theme';
import type { HomeStackParamList } from '../../types/navigation-types';

export interface KnowledgeItem {
  id: string; title: string; summary: string; slug: string;
  mediaType: 'article' | 'audio' | 'video';
  publishedAt: FirebaseFirestoreTypes.Timestamp | null;
  audioUrl?: string; duration?: number; tags?: string[];
}

function mediaIcon(t: KnowledgeItem['mediaType']): string {
  if (t === 'audio') return '🎧';
  if (t === 'video') return '▶';
  return '📖';
}

function formatDate(ts: FirebaseFirestoreTypes.Timestamp | null): string {
  if (!ts) return '';
  return ts.toDate().toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'});
}

function KnowledgeCard({ item, onPress }: { item: KnowledgeItem; onPress: (i: KnowledgeItem) => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.mediaIcon}>{mediaIcon(item.mediaType)}</Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      {item.summary ? <Text style={styles.cardSummary} numberOfLines={3}>{item.summary}</Text> : null}
      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>{formatDate(item.publishedAt)}</Text>
        {item.tags?.slice(0,2).map((tag) => (
          <View key={tag} style={styles.tag}><Text style={styles.tagLabel}>{tag}</Text></View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export function KnowledgeBaseListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const snap = await firestore().collection('btd_knowledge').orderBy('publishedAt','desc').limit(20).get();
      setItems(snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<KnowledgeItem,'id'>) })));
      setError(null);
    } catch (e) {
      setError('Không thể tải nội dung. Kiểm tra kết nối mạng.');
      console.error('[KnowledgeBaseListScreen]', e);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handlePress = useCallback((item: KnowledgeItem) =>
    navigation.navigate('KnowledgeArticle', { slug: item.slug, title: item.title }), [navigation]);
  const renderItem = useCallback(({ item }: { item: KnowledgeItem }) =>
    <KnowledgeCard item={item} onPress={handlePress} />, [handlePress]);
  const keyExtractor = useCallback((item: KnowledgeItem) => item.id, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator color={colors.gold} size="large" /></View>;
  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={() => fetchItems()} activeOpacity={0.7}>
        <Text style={styles.retryLabel}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlashList
        data={items} renderItem={renderItem} keyExtractor={keyExtractor} estimatedItemSize={140}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.eyebrow}>KHAI MINH</Text>
            <Text style={styles.headingTitle}>Kho tri thức</Text>
            <Text style={styles.headingSubtitle}>Bài giảng, bài viết và âm thanh từ Bất Tử Đạo</Text>
          </View>
        }
        ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>Chưa có nội dung.</Text></View>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchItems(true)} tintColor={colors.gold} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6], gap: spacing[4], backgroundColor: colors.bg },
  listContent: { paddingBottom: spacing[10] },
  listHeader: { paddingHorizontal: spacing[5], paddingTop: spacing[6], paddingBottom: spacing[4], gap: spacing[1] },
  eyebrow: { fontFamily: typography.mono, fontSize: fontSizes.xs, color: colors.gold, letterSpacing: 3 },
  headingTitle: { fontFamily: typography.sansBold, fontSize: fontSizes['2xl'], color: colors.ink, letterSpacing: -0.3, marginTop: spacing[1] },
  headingSubtitle: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted, lineHeight: fontSizes.sm * 1.6 },
  card: { marginHorizontal: spacing[4], marginVertical: spacing[2], backgroundColor: '#fff', borderRadius: radii.lg, padding: spacing[4], shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2, gap: spacing[2] },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mediaIcon: { fontSize: fontSizes.lg },
  cardTitle: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.base, color: colors.ink, lineHeight: fontSizes.base * 1.4 },
  cardSummary: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted, lineHeight: fontSizes.sm * 1.6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap', marginTop: spacing[1] },
  cardDate: { fontFamily: typography.mono, fontSize: fontSizes.xs, color: colors.inkMuted },
  tag: { backgroundColor: colors.gold + '20', borderRadius: radii.pill, paddingVertical: 2, paddingHorizontal: spacing[2] },
  tagLabel: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.goldDeep },
  errorText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted, textAlign: 'center' },
  emptyText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.gold, borderRadius: radii.md, paddingVertical: spacing[3], paddingHorizontal: spacing[6] },
  retryLabel: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.sm, color: '#fff' },
});
