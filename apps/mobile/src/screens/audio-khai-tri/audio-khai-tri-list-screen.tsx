/**
 * audio-khai-tri-list-screen.tsx
 * FlashList of Khai Tri audio lectures from Firestore btd_knowledge (mediaType=audio).
 * Tapping navigates to AudioKhaiTriPlayerScreen + starts native RNTP playback.
 * Audio files from R2. Mock URLs used during dev (Phase 2-4 pending CF account).
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import { colors, typography, fontSizes, spacing, radii } from '../../theme';
import type { HomeStackParamList } from '../../types/navigation-types';
import type { KhaiTriAudioTrack } from '../../services/audio-player-service';
import { MOCK_R2_BASE } from '../../services/audio-player-service';

const DANG_AVATAR = require('../../../assets/icon.png');

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}); }
  catch { return ''; }
}

interface AudioCardProps { item: KhaiTriAudioTrack; index: number; onPress: (item: KhaiTriAudioTrack, index: number) => void; }

function AudioCard({ item, index, onPress }: AudioCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item, index)} activeOpacity={0.7}
      accessible accessibilityLabel={`Nghe bài giảng: ${item.title}, thời lượng ${formatDuration(item.duration)}`}>
      <Image source={item.artworkUrl ? { uri: item.artworkUrl } : DANG_AVATAR} style={styles.artwork} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardArtist}>{item.artist}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaDuration}>{formatDuration(item.duration)}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaDate}>{formatDate(item.publishedAt)}</Text>
        </View>
      </View>
      <View style={styles.playIcon}><Text style={styles.playIconText}>▶</Text></View>
    </TouchableOpacity>
  );
}

async function fetchAudioTracks(): Promise<KhaiTriAudioTrack[]> {
  const snap = await firestore()
    .collection('btd_knowledge')
    .where('mediaType', '==', 'audio')
    .orderBy('publishedAt', 'desc')
    .limit(50)
    .get();
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title as string,
      artist: (data.artist as string | undefined) ?? 'Bất Tử Đạo',
      duration: (data.duration as number | undefined) ?? 0,
      audioUrl: (data.audioUrl as string | undefined) ?? `${MOCK_R2_BASE}/${doc.id}.mp3`,
      artworkUrl: data.artworkUrl as string | undefined,
      publishedAt: (data.publishedAt as { toDate?: () => Date } | null)?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    } satisfies KhaiTriAudioTrack;
  });
}

export function AudioKhaiTriListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [tracks, setTracks] = useState<KhaiTriAudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setTracks(await fetchAudioTracks());
      setError(null);
    } catch (e) {
      setError('Không thể tải bài giảng. Kiểm tra kết nối mạng.');
      console.error('[AudioKhaiTriListScreen]', e);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePress = useCallback((item: KhaiTriAudioTrack, index: number) => {
    navigation.navigate('AudioKhaiTriPlayer', { trackId: item.id, queueIndex: index, queue: tracks });
  }, [navigation, tracks]);

  const renderItem = useCallback(({ item, index }: { item: KhaiTriAudioTrack; index: number }) =>
    <AudioCard item={item} index={index} onPress={handlePress} />, [handlePress]);
  const keyExtractor = useCallback((item: KhaiTriAudioTrack) => item.id, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator color={colors.gold} size="large" /></View>;
  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={() => load()} activeOpacity={0.7}>
        <Text style={styles.retryLabel}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlashList
        data={tracks} renderItem={renderItem} keyExtractor={keyExtractor} estimatedItemSize={88}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.eyebrow}>BÀI GIẢNG</Text>
            <Text style={styles.headingTitle}>Âm thanh Khai Trí</Text>
            <Text style={styles.headingSubtitle}>Ghi âm bài giảng của Đăng — phát trong nền, điều khiển từ màn hình khóa</Text>
          </View>
        }
        ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>Chưa có bài giảng nào.</Text></View>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />}
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
  card: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing[4], marginVertical: spacing[2], backgroundColor: '#fff', borderRadius: radii.lg, padding: spacing[3], shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2, gap: spacing[3] },
  artwork: { width: 56, height: 56, borderRadius: radii.md, backgroundColor: colors.rule },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.sm, color: colors.ink, lineHeight: fontSizes.sm * 1.4 },
  cardArtist: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginTop: 2 },
  metaDuration: { fontFamily: typography.mono, fontSize: fontSizes.xs, color: colors.gold },
  metaDot: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted },
  metaDate: { fontFamily: typography.mono, fontSize: fontSizes.xs, color: colors.inkMuted },
  playIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  playIconText: { color: '#fff', fontSize: 14, marginLeft: 2 },
  errorText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted, textAlign: 'center' },
  emptyText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.gold, borderRadius: radii.md, paddingVertical: spacing[3], paddingHorizontal: spacing[6] },
  retryLabel: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.sm, color: '#fff' },
});
