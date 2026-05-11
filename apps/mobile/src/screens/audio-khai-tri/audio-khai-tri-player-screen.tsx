/**
 * audio-khai-tri-player-screen.tsx
 * Full-screen native audio player with RNTP background playback + lock-screen controls.
 * Features: artwork, scrubber, play/pause, skip ±15s, prev/next, speed 0.75–1.5x.
 * Receives { trackId, queueIndex, queue } from AudioKhaiTriListScreen.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import TrackPlayer, { usePlaybackState, useProgress, useActiveTrack, State } from 'react-native-track-player';
import { colors, typography, fontSizes, spacing, radii } from '../../theme';
import { loadQueueAndPlay, play, pause, seekRelative, seekTo, setRate } from '../../services/audio-player-service';
import type { HomeStackParamList } from '../../types/navigation-types';

type PlayerRoute = RouteProp<HomeStackParamList, 'AudioKhaiTriPlayer'>;
const DANG_AVATAR = require('../../../assets/icon.png');
const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5] as const;
type SpeedOption = typeof SPEED_OPTIONS[number];

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
}

let _trackWidth = 0;

interface ScrubberProps { position: number; duration: number; onSeek: (s: number) => void; }
function Scrubber({ position, duration, onSeek }: ScrubberProps) {
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;
  return (
    <View style={sc.container}>
      <View style={sc.track}
        onTouchEnd={(e) => { if (_trackWidth > 0 && duration > 0) onSeek((Math.max(0,Math.min(e.nativeEvent.locationX/_trackWidth,1)))*duration); }}
        onLayout={(e) => { _trackWidth = e.nativeEvent.layout.width; }}>
        <View style={[sc.fill, { width: `${progress*100}%` as unknown as number }]} />
        <View style={[sc.thumb, { left: `${progress*100}%` as unknown as number }]} />
      </View>
      <View style={sc.labels}>
        <Text style={sc.time}>{formatTime(position)}</Text>
        <Text style={sc.time}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}
const sc = StyleSheet.create({
  container: { width: '100%', gap: spacing[2] },
  track: { height: 4, backgroundColor: colors.rule, borderRadius: 2, position: 'relative', justifyContent: 'center' },
  fill: { height: 4, backgroundColor: colors.gold, borderRadius: 2, position: 'absolute', left: 0, top: 0 },
  thumb: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.gold, position: 'absolute', top: -5, marginLeft: -7 },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontFamily: typography.mono, fontSize: fontSizes.xs, color: colors.inkMuted },
});

export function AudioKhaiTriPlayerScreen() {
  const navigation = useNavigation();
  const route = useRoute<PlayerRoute>();
  const { queueIndex, queue } = route.params;
  const [speed, setSpeedState] = useState<SpeedOption>(1.0);
  const [isInitializing, setIsInitializing] = useState(true);
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress(500);
  const activeTrack = useActiveTrack();
  const isPlaying = playbackState.state === State.Playing;
  const isBuffering = playbackState.state === State.Buffering || playbackState.state === State.Loading;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try { await loadQueueAndPlay(queue, queueIndex); }
      catch (e) { console.error('[AudioKhaiTriPlayerScreen]', e); }
      finally { if (!cancelled) setIsInitializing(false); }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayPause = useCallback(async () => {
    if (isPlaying) await pause().catch(console.error);
    else await play().catch(console.error);
  }, [isPlaying]);
  const handleSkipBack = useCallback(() => seekRelative(-15).catch(console.error), []);
  const handleSkipForward = useCallback(() => seekRelative(15).catch(console.error), []);
  const handlePrevTrack = useCallback(async () => { try { await TrackPlayer.skipToPrevious(); await TrackPlayer.play(); } catch {} }, []);
  const handleNextTrack = useCallback(async () => { try { await TrackPlayer.skipToNext(); await TrackPlayer.play(); } catch {} }, []);
  const handleSpeedCycle = useCallback(async () => {
    const next = SPEED_OPTIONS[(SPEED_OPTIONS.indexOf(speed) + 1) % SPEED_OPTIONS.length];
    setSpeedState(next);
    await setRate(next).catch(console.error);
  }, [speed]);
  const handleSeek = useCallback((s: number) => seekTo(s).catch(console.error), []);

  const artwork = activeTrack?.artwork;
  const title = activeTrack?.title ?? queue[queueIndex]?.title ?? '…';
  const artist = activeTrack?.artist ?? 'Bất Tử Đạo';

  if (isInitializing) return (
    <View style={s.centered}>
      <ActivityIndicator color={colors.gold} size="large" />
      <Text style={s.loadingText}>Đang tải bài giảng…</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safeArea} edges={['top','bottom']}>
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} accessibilityLabel="Quay lại">
        <Text style={s.backIcon}>‹</Text>
        <Text style={s.backLabel}>Danh sách</Text>
      </TouchableOpacity>
      <View style={s.artworkContainer}>
        <Image source={artwork ? { uri: artwork as string } : DANG_AVATAR} style={s.artwork} resizeMode="cover" />
      </View>
      <View style={s.info}>
        <Text style={s.trackTitle} numberOfLines={2}>{title}</Text>
        <Text style={s.trackArtist}>{artist}</Text>
      </View>
      <View style={s.scrubberWrapper}>
        <Scrubber position={position} duration={duration} onSeek={handleSeek} />
      </View>
      <View style={s.controls}>
        <TouchableOpacity style={s.secondaryBtn} onPress={handlePrevTrack} activeOpacity={0.6} accessibilityLabel="Bài trước">
          <Text style={s.secondaryIcon}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryBtn} onPress={handleSkipBack} activeOpacity={0.6} accessibilityLabel="Lùi 15 giây">
          <Text style={s.secondaryIcon}>−15</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.primaryBtn} onPress={handlePlayPause} activeOpacity={0.8}
          accessibilityLabel={isPlaying ? 'Tạm dừng' : 'Phát'} disabled={isBuffering}>
          {isBuffering ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.primaryIcon}>{isPlaying ? '⏸' : '▶'}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryBtn} onPress={handleSkipForward} activeOpacity={0.6} accessibilityLabel="Tua 15 giây">
          <Text style={s.secondaryIcon}>+15</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryBtn} onPress={handleNextTrack} activeOpacity={0.6} accessibilityLabel="Bài tiếp theo">
          <Text style={s.secondaryIcon}>⏭</Text>
        </TouchableOpacity>
      </View>
      <View style={s.speedRow}>
        <TouchableOpacity style={s.speedBtn} onPress={handleSpeedCycle} activeOpacity={0.7}
          accessibilityLabel={`Tốc độ phát: ${speed}x. Chạm để thay đổi`}>
          <Text style={s.speedLabel}>{speed}x</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', paddingHorizontal: spacing[6] },
  centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: spacing[4] },
  loadingText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted },
  backBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3], gap: spacing[1] },
  backIcon: { fontFamily: typography.sans, fontSize: fontSizes['2xl'], color: colors.gold, lineHeight: fontSizes['2xl'], marginTop: -2 },
  backLabel: { fontFamily: typography.sansMedium, fontSize: fontSizes.sm, color: colors.gold },
  artworkContainer: { marginTop: spacing[6], width: 240, height: 240, borderRadius: radii.xl, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  artwork: { width: '100%', height: '100%' },
  info: { marginTop: spacing[8], alignItems: 'center', gap: spacing[1], paddingHorizontal: spacing[4] },
  trackTitle: { fontFamily: typography.sansBold, fontSize: fontSizes.xl, color: colors.ink, textAlign: 'center', lineHeight: fontSizes.xl * 1.3 },
  trackArtist: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted },
  scrubberWrapper: { width: '100%', marginTop: spacing[8] },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing[8], gap: spacing[4] },
  primaryBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', shadowColor: colors.gold, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  primaryIcon: { fontSize: 28, color: '#fff', marginLeft: 3 },
  secondaryBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.rule, alignItems: 'center', justifyContent: 'center' },
  secondaryIcon: { fontFamily: typography.mono, fontSize: fontSizes.sm, color: colors.ink },
  speedRow: { marginTop: spacing[6], alignItems: 'center' },
  speedBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: radii.pill, paddingVertical: spacing[1], paddingHorizontal: spacing[4] },
  speedLabel: { fontFamily: typography.mono, fontSize: fontSizes.sm, color: colors.gold },
});
