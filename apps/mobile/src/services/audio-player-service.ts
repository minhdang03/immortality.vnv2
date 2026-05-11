/**
 * audio-player-service.ts
 * react-native-track-player setup + controls for Khai Tri audio lectures.
 * Background playback via UIBackgroundModes:audio (iOS) and RNTP foreground service (Android).
 * Audio files served from R2 — mock URLs used until CF account + bucket wired (Phase 2-4).
 */
import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
  RepeatMode,
  State,
  Event,
  type Track,
} from 'react-native-track-player';

export interface KhaiTriAudioTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  artworkUrl?: string;
  publishedAt: string;
}

/** Mock R2 base — replace with real bucket URL. Set EXPO_PUBLIC_R2_AUDIO_BASE_URL in prod. */
export const MOCK_R2_BASE = 'https://r2.battudao.com/audio';

export function toRNTPTrack(item: KhaiTriAudioTrack): Track {
  return {
    id: item.id,
    url: item.audioUrl,
    title: item.title,
    artist: item.artist,
    duration: item.duration,
    artwork: item.artworkUrl ?? require('../../assets/icon.png'),
  };
}

export async function setupTrackPlayer(): Promise<void> {
  try {
    await TrackPlayer.getActiveTrackIndex();
    return; // already set up
  } catch {
    // not yet set up — proceed
  }
  await TrackPlayer.setupPlayer({ maxCacheSize: 1024 * 10 });
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities: [
      Capability.Play, Capability.Pause, Capability.SkipToNext,
      Capability.SkipToPrevious, Capability.Stop, Capability.SeekTo,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
    progressUpdateEventInterval: 1,
  });
}

export async function loadQueueAndPlay(tracks: KhaiTriAudioTrack[], startIndex = 0): Promise<void> {
  await TrackPlayer.reset();
  await TrackPlayer.add(tracks.map(toRNTPTrack));
  await TrackPlayer.skip(startIndex);
  await TrackPlayer.play();
  await TrackPlayer.setRepeatMode(RepeatMode.Off);
}

export async function play(): Promise<void> { await TrackPlayer.play(); }
export async function pause(): Promise<void> { await TrackPlayer.pause(); }

export async function seekRelative(seconds: number): Promise<void> {
  const { position, duration } = await TrackPlayer.getProgress();
  await TrackPlayer.seekTo(Math.max(0, Math.min(position + seconds, duration)));
}

export async function seekTo(seconds: number): Promise<void> {
  await TrackPlayer.seekTo(seconds);
}

export async function setRate(rate: number): Promise<void> {
  await TrackPlayer.setRate(rate);
}

export async function getState(): Promise<State> {
  const { state } = await TrackPlayer.getPlaybackState();
  return state;
}

export async function PlaybackService(): Promise<void> {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, (e) => TrackPlayer.seekTo(e.position));
  TrackPlayer.addEventListener(Event.RemoteJumpForward, (e) => seekRelative(e.interval ?? 15));
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, (e) => seekRelative(-(e.interval ?? 15)));
}
