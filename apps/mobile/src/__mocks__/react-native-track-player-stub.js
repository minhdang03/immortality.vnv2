/**
 * react-native-track-player-stub.js
 *
 * Jest stub for react-native-track-player native module.
 * Required because RNTP depends on a native build that isn't available in Jest.
 * Tests that need specific mock behavior should override via jest.mock() in the test file.
 *
 * Mapped in jest.config.js moduleNameMapper:
 *   '^react-native-track-player$' -> this file
 */
'use strict';

const noop = () => Promise.resolve(undefined);
const noopSync = () => undefined;

const TrackPlayer = {
  setupPlayer: noop,
  updateOptions: noop,
  add: noop,
  reset: noop,
  play: noop,
  pause: noop,
  stop: noop,
  skip: noop,
  skipToNext: noop,
  skipToPrevious: noop,
  seekTo: noop,
  setRate: noop,
  setRepeatMode: noop,
  getActiveTrackIndex: noop,
  getProgress: () => Promise.resolve({ position: 0, duration: 0, buffered: 0 }),
  getPlaybackState: () => Promise.resolve({ state: 'none' }),
  addEventListener: () => ({ remove: noopSync }),
  registerPlaybackService: noopSync,
};

// Named exports
module.exports = {
  __esModule: true,
  default: TrackPlayer,
  usePlaybackState: () => ({ state: 'none' }),
  useProgress: () => ({ position: 0, duration: 0, buffered: 0 }),
  useActiveTrack: () => null,
  State: {
    None: 'none',
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    Buffering: 'buffering',
    Loading: 'loading',
    Error: 'error',
  },
  Capability: {
    Play: 'play',
    Pause: 'pause',
    Stop: 'stop',
    SeekTo: 'seekTo',
    SkipToNext: 'skipToNext',
    SkipToPrevious: 'skipToPrevious',
    JumpForward: 'jumpForward',
    JumpBackward: 'jumpBackward',
  },
  AppKilledPlaybackBehavior: {
    ContinuePlayback: 'continue',
    StopPlaybackAndRemoveNotification: 'stop',
    PausePlayback: 'pause',
  },
  RepeatMode: {
    Off: 0,
    Track: 1,
    Queue: 2,
  },
  Event: {
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteStop: 'remote-stop',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    RemoteSeek: 'remote-seek',
    RemoteJumpForward: 'remote-jump-forward',
    RemoteJumpBackward: 'remote-jump-backward',
    PlaybackState: 'playback-state',
    PlaybackError: 'playback-error',
    PlaybackActiveTrackChanged: 'playback-active-track-changed',
    PlaybackProgressUpdated: 'playback-progress-updated',
  },
};
