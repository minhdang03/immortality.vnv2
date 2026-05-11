/**
 * audio-khai-tri-list-and-player-controls.test.tsx
 *
 * Tests: AudioKhaiTriListScreen + AudioKhaiTriPlayerScreen + audio-player-service
 *
 * NOTE on jest.mock hoisting: jest.mock() is hoisted before const declarations.
 * To reference variables inside the factory, we expose them via module-scoped
 * let vars assigned inside the factory, which runs after jest.mock hoisting.
 *
 * Covers:
 *   - List renders, empty state, error state, retry, navigation
 *   - Player title, controls, play/pause, speed cycle, queue load on mount
 *   - audio-player-service: setupTrackPlayer idempotent, loadQueueAndPlay, seekRelative clamp
 */

// ── react-native-track-player mock (factory-only, no external refs) ──────────

let _mockPlay: jest.Mock;
let _mockPause: jest.Mock;
let _mockReset: jest.Mock;
let _mockAdd: jest.Mock;
let _mockSkip: jest.Mock;
let _mockSeekTo: jest.Mock;
let _mockSetRate: jest.Mock;
let _mockSkipToNext: jest.Mock;
let _mockSkipToPrevious: jest.Mock;
let _mockGetProgress: jest.Mock;
let _mockGetActiveTrackIndex: jest.Mock;
let _mockSetupPlayer: jest.Mock;
let _mockUpdateOptions: jest.Mock;
let _mockSetRepeatMode: jest.Mock;
let _mockUsePlaybackState: jest.Mock;
let _mockUseProgress: jest.Mock;
let _mockUseActiveTrack: jest.Mock;

jest.mock('react-native-track-player', () => {
  _mockPlay = jest.fn().mockResolvedValue(undefined);
  _mockPause = jest.fn().mockResolvedValue(undefined);
  _mockReset = jest.fn().mockResolvedValue(undefined);
  _mockAdd = jest.fn().mockResolvedValue(undefined);
  _mockSkip = jest.fn().mockResolvedValue(undefined);
  _mockSeekTo = jest.fn().mockResolvedValue(undefined);
  _mockSetRate = jest.fn().mockResolvedValue(undefined);
  _mockSkipToNext = jest.fn().mockResolvedValue(undefined);
  _mockSkipToPrevious = jest.fn().mockResolvedValue(undefined);
  _mockGetProgress = jest.fn().mockResolvedValue({ position: 30, duration: 120 });
  _mockGetActiveTrackIndex = jest.fn().mockRejectedValue(new Error('not set up'));
  _mockSetupPlayer = jest.fn().mockResolvedValue(undefined);
  _mockUpdateOptions = jest.fn().mockResolvedValue(undefined);
  _mockSetRepeatMode = jest.fn().mockResolvedValue(undefined);
  _mockUsePlaybackState = jest.fn().mockReturnValue({ state: 'playing' });
  _mockUseProgress = jest.fn().mockReturnValue({ position: 30, duration: 120 });
  _mockUseActiveTrack = jest.fn().mockReturnValue({
    id: 'track-1', title: 'Bài giảng về vô thường', artist: 'Đăng', artwork: null,
  });

  return {
    __esModule: true,
    default: {
      play: (...args: unknown[]) => _mockPlay(...args),
      pause: (...args: unknown[]) => _mockPause(...args),
      reset: (...args: unknown[]) => _mockReset(...args),
      add: (...args: unknown[]) => _mockAdd(...args),
      skip: (...args: unknown[]) => _mockSkip(...args),
      seekTo: (...args: unknown[]) => _mockSeekTo(...args),
      setRate: (...args: unknown[]) => _mockSetRate(...args),
      skipToNext: (...args: unknown[]) => _mockSkipToNext(...args),
      skipToPrevious: (...args: unknown[]) => _mockSkipToPrevious(...args),
      getProgress: (...args: unknown[]) => _mockGetProgress(...args),
      getActiveTrackIndex: (...args: unknown[]) => _mockGetActiveTrackIndex(...args),
      setupPlayer: (...args: unknown[]) => _mockSetupPlayer(...args),
      updateOptions: (...args: unknown[]) => _mockUpdateOptions(...args),
      setRepeatMode: (...args: unknown[]) => _mockSetRepeatMode(...args),
      stop: jest.fn().mockResolvedValue(undefined),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      registerPlaybackService: jest.fn(),
    },
    usePlaybackState: (...args: unknown[]) => _mockUsePlaybackState(...args),
    useProgress: (...args: unknown[]) => _mockUseProgress(...args),
    useActiveTrack: (...args: unknown[]) => _mockUseActiveTrack(...args),
    State: {
      Playing: 'playing', Paused: 'paused', Buffering: 'buffering',
      Loading: 'loading', Stopped: 'stopped',
    },
    Capability: {
      Play: 'play', Pause: 'pause', SkipToNext: 'skipToNext',
      SkipToPrevious: 'skipToPrevious', Stop: 'stop', SeekTo: 'seekTo',
    },
    AppKilledPlaybackBehavior: { StopPlaybackAndRemoveNotification: 'stop' },
    RepeatMode: { Off: 0, Track: 1, Queue: 2 },
    Event: {
      RemotePlay: 'remote-play', RemotePause: 'remote-pause', RemoteStop: 'remote-stop',
      RemoteNext: 'remote-next', RemotePrevious: 'remote-previous',
      RemoteSeek: 'remote-seek', RemoteJumpForward: 'remote-jump-forward',
      RemoteJumpBackward: 'remote-jump-backward',
    },
  };
});

// ── Firestore mock ────────────────────────────────────────────────────────────

let _mockGet: jest.Mock;
let _mockWhere: jest.Mock;
let _mockOrderBy: jest.Mock;
let _mockLimit: jest.Mock;

jest.mock('@react-native-firebase/firestore', () => {
  _mockGet = jest.fn();
  _mockLimit = jest.fn().mockReturnValue({ get: (...a: unknown[]) => _mockGet(...a) });
  _mockOrderBy = jest.fn().mockReturnValue({ limit: (...a: unknown[]) => _mockLimit(...a) });
  _mockWhere = jest.fn().mockReturnValue({ orderBy: (...a: unknown[]) => _mockOrderBy(...a) });

  const mock = () => ({
    collection: jest.fn(() => ({ where: (...a: unknown[]) => _mockWhere(...a) })),
  });
  (mock as unknown as { FieldValue: unknown }).FieldValue = { serverTimestamp: jest.fn() };
  return { default: mock };
});

jest.mock('@react-native-firebase/app', () => ({ default: { app: () => ({}) } }));
jest.mock('@react-native-firebase/auth', () => {
  const m = () => ({ currentUser: null, onAuthStateChanged: jest.fn(() => jest.fn()) });
  (m as unknown as { EmailAuthProvider: unknown }).EmailAuthProvider = { credential: jest.fn() };
  return { default: m };
});

// ── Navigation mock ───────────────────────────────────────────────────────────

let _mockNavigate: jest.Mock;
let _mockGoBack: jest.Mock;

jest.mock('@react-navigation/native', () => {
  _mockNavigate = jest.fn();
  _mockGoBack = jest.fn();
  return {
    useNavigation: () => ({ navigate: (...a: unknown[]) => _mockNavigate(...a), goBack: (...a: unknown[]) => _mockGoBack(...a), canGoBack: () => true }),
    useRoute: () => ({
      params: {
        trackId: 'track-1',
        queueIndex: 0,
        queue: [
          { id: 'track-1', title: 'Bài giảng về vô thường', artist: 'Đăng', duration: 1800, audioUrl: 'https://r2.battudao.com/audio/track-1.mp3', publishedAt: '2024-01-15T00:00:00.000Z' },
          { id: 'track-2', title: 'Tĩnh tâm và thiền định', artist: 'Đăng', duration: 2400, audioUrl: 'https://r2.battudao.com/audio/track-2.mp3', publishedAt: '2024-01-20T00:00:00.000Z' },
        ],
      },
    }),
  };
});

jest.mock('@shopify/flash-list', () => {
  const { FlatList } = require('react-native');
  return { FlashList: FlatList };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { AudioKhaiTriListScreen } from '../src/screens/audio-khai-tri/audio-khai-tri-list-screen';
import { AudioKhaiTriPlayerScreen } from '../src/screens/audio-khai-tri/audio-khai-tri-player-screen';
import { setupTrackPlayer, loadQueueAndPlay, seekRelative } from '../src/services/audio-player-service';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const SAMPLE_DOCS = [
  {
    id: 'track-1',
    data: () => ({
      title: 'Bài giảng về vô thường', artist: 'Đăng', duration: 1800,
      audioUrl: 'https://r2.battudao.com/audio/track-1.mp3',
      publishedAt: { toDate: () => new Date('2024-01-15') }, mediaType: 'audio',
    }),
  },
  {
    id: 'track-2',
    data: () => ({
      title: 'Tĩnh tâm và thiền định', artist: 'Đăng', duration: 2400,
      audioUrl: 'https://r2.battudao.com/audio/track-2.mp3',
      publishedAt: { toDate: () => new Date('2024-01-20') }, mediaType: 'audio',
    }),
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  // Re-setup return values cleared by clearAllMocks
  _mockGetProgress.mockResolvedValue({ position: 30, duration: 120 });
  _mockGetActiveTrackIndex.mockRejectedValue(new Error('not set up'));
  _mockSetupPlayer.mockResolvedValue(undefined);
  _mockUpdateOptions.mockResolvedValue(undefined);
  _mockReset.mockResolvedValue(undefined);
  _mockAdd.mockResolvedValue(undefined);
  _mockSkip.mockResolvedValue(undefined);
  _mockPlay.mockResolvedValue(undefined);
  _mockPause.mockResolvedValue(undefined);
  _mockSeekTo.mockResolvedValue(undefined);
  _mockSetRate.mockResolvedValue(undefined);
  _mockSetRepeatMode.mockResolvedValue(undefined);
  _mockUsePlaybackState.mockReturnValue({ state: 'playing' });
  _mockUseProgress.mockReturnValue({ position: 30, duration: 120 });
  _mockUseActiveTrack.mockReturnValue({ id: 'track-1', title: 'Bài giảng về vô thường', artist: 'Đăng', artwork: null });
  // Re-wire Firestore chain
  _mockGet.mockResolvedValue({ docs: [] });
  _mockLimit.mockReturnValue({ get: (...a: unknown[]) => _mockGet(...a) });
  _mockOrderBy.mockReturnValue({ limit: (...a: unknown[]) => _mockLimit(...a) });
  _mockWhere.mockReturnValue({ orderBy: (...a: unknown[]) => _mockOrderBy(...a) });
});

// ── AudioKhaiTriListScreen ────────────────────────────────────────────────────

describe('AudioKhaiTriListScreen', () => {
  it('renders track titles after successful Firestore fetch', async () => {
    _mockGet.mockResolvedValueOnce({ docs: SAMPLE_DOCS });
    const { findByText } = render(<AudioKhaiTriListScreen />);
    await findByText('Bài giảng về vô thường');
    await findByText('Tĩnh tâm và thiền định');
  });

  it('formats duration as mm:ss (1800s → 30:00)', async () => {
    _mockGet.mockResolvedValueOnce({ docs: SAMPLE_DOCS });
    const { findByText } = render(<AudioKhaiTriListScreen />);
    await findByText('30:00');
  });

  it('shows empty state when no audio tracks returned', async () => {
    _mockGet.mockResolvedValueOnce({ docs: [] });
    const { findByText } = render(<AudioKhaiTriListScreen />);
    await findByText('Chưa có bài giảng nào.');
  });

  it('shows error state on Firestore failure', async () => {
    _mockGet.mockRejectedValueOnce(new Error('network error'));
    const { findByText } = render(<AudioKhaiTriListScreen />);
    await findByText('Không thể tải bài giảng. Kiểm tra kết nối mạng.');
    await findByText('Thử lại');
  });

  it('refetches and shows tracks after tapping Thử lại', async () => {
    _mockGet.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce({ docs: SAMPLE_DOCS });
    const { findByText } = render(<AudioKhaiTriListScreen />);
    const retryBtn = await findByText('Thử lại');
    fireEvent.press(retryBtn);
    await findByText('Bài giảng về vô thường');
  });

  it('navigates to AudioKhaiTriPlayer on track card press', async () => {
    _mockGet.mockResolvedValueOnce({ docs: SAMPLE_DOCS });
    const { findByText } = render(<AudioKhaiTriListScreen />);
    const card = await findByText('Bài giảng về vô thường');
    fireEvent.press(card);
    expect(_mockNavigate).toHaveBeenCalledWith('AudioKhaiTriPlayer', expect.objectContaining({ trackId: 'track-1', queueIndex: 0 }));
  });
});

// ── AudioKhaiTriPlayerScreen ──────────────────────────────────────────────────

describe('AudioKhaiTriPlayerScreen', () => {
  it('renders track title from useActiveTrack', async () => {
    const { findByText } = render(<AudioKhaiTriPlayerScreen />);
    await findByText('Bài giảng về vô thường');
  });

  it('renders artist name', async () => {
    const { findByText } = render(<AudioKhaiTriPlayerScreen />);
    await findByText('Đăng');
  });

  it('renders all 5 control buttons', async () => {
    const { findByLabelText } = render(<AudioKhaiTriPlayerScreen />);
    await findByLabelText('Tạm dừng');
    await findByLabelText('Lùi 15 giây');
    await findByLabelText('Tua 15 giây');
    await findByLabelText('Bài trước');
    await findByLabelText('Bài tiếp theo');
  });

  it('calls TrackPlayer.pause when play/pause button pressed while playing', async () => {
    const { findByLabelText } = render(<AudioKhaiTriPlayerScreen />);
    const btn = await findByLabelText('Tạm dừng');
    await act(async () => { fireEvent.press(btn); });
    expect(_mockPause).toHaveBeenCalled();
  });

  it('calls getProgress on skip-back press', async () => {
    const { findByLabelText } = render(<AudioKhaiTriPlayerScreen />);
    const btn = await findByLabelText('Lùi 15 giây');
    await act(async () => { fireEvent.press(btn); });
    expect(_mockGetProgress).toHaveBeenCalled();
  });

  it('cycles speed from 1.0 → 1.25 → 1.5 → 0.75', async () => {
    const { findByLabelText, getByLabelText } = render(<AudioKhaiTriPlayerScreen />);
    const btn1 = await findByLabelText(/Tốc độ phát: 1x/);
    await act(async () => { fireEvent.press(btn1); });
    expect(_mockSetRate).toHaveBeenLastCalledWith(1.25);
    const btn2 = getByLabelText(/Tốc độ phát: 1.25x/);
    await act(async () => { fireEvent.press(btn2); });
    expect(_mockSetRate).toHaveBeenLastCalledWith(1.5);
    const btn3 = getByLabelText(/Tốc độ phát: 1.5x/);
    await act(async () => { fireEvent.press(btn3); });
    expect(_mockSetRate).toHaveBeenLastCalledWith(0.75);
  });

  it('calls reset/add/skip/play on mount', async () => {
    render(<AudioKhaiTriPlayerScreen />);
    await waitFor(() => {
      expect(_mockReset).toHaveBeenCalled();
      expect(_mockAdd).toHaveBeenCalled();
      expect(_mockSkip).toHaveBeenCalledWith(0);
      expect(_mockPlay).toHaveBeenCalled();
    });
  });
});

// ── audio-player-service unit ─────────────────────────────────────────────────

describe('audio-player-service', () => {
  it('setupTrackPlayer calls setupPlayer on first call', async () => {
    _mockGetActiveTrackIndex.mockRejectedValueOnce(new Error('not set up'));
    await setupTrackPlayer();
    expect(_mockSetupPlayer).toHaveBeenCalled();
    expect(_mockUpdateOptions).toHaveBeenCalled();
  });

  it('setupTrackPlayer skips setup when already initialized', async () => {
    _mockGetActiveTrackIndex.mockResolvedValueOnce(0);
    await setupTrackPlayer();
    expect(_mockSetupPlayer).not.toHaveBeenCalled();
  });

  it('loadQueueAndPlay adds all tracks and skips to correct index', async () => {
    const tracks = [
      { id: 't1', title: 'T1', artist: 'A', duration: 60, audioUrl: 'https://r2/t1.mp3', publishedAt: '' },
      { id: 't2', title: 'T2', artist: 'A', duration: 90, audioUrl: 'https://r2/t2.mp3', publishedAt: '' },
    ];
    await loadQueueAndPlay(tracks, 1);
    expect(_mockReset).toHaveBeenCalled();
    expect(_mockAdd).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: 't1', url: 'https://r2/t1.mp3' }),
      expect.objectContaining({ id: 't2', url: 'https://r2/t2.mp3' }),
    ]));
    expect(_mockSkip).toHaveBeenCalledWith(1);
    expect(_mockPlay).toHaveBeenCalled();
  });

  it('seekRelative clamps to 0 when seeking before start', async () => {
    _mockGetProgress.mockResolvedValueOnce({ position: 5, duration: 120 });
    await seekRelative(-15);
    expect(_mockSeekTo).toHaveBeenCalledWith(0);
  });

  it('seekRelative clamps to duration when seeking past end', async () => {
    _mockGetProgress.mockResolvedValueOnce({ position: 115, duration: 120 });
    await seekRelative(15);
    expect(_mockSeekTo).toHaveBeenCalledWith(120);
  });

  it('seekRelative seeks to exact position for mid-track skip', async () => {
    _mockGetProgress.mockResolvedValueOnce({ position: 60, duration: 120 });
    await seekRelative(15);
    expect(_mockSeekTo).toHaveBeenCalledWith(75);
  });
});
