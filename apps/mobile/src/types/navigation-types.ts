import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { KhaiTriAudioTrack } from '../services/audio-player-service';
import type { ChuNo } from '../hooks/use-profile';

// ── Root stack (Auth gate → Main) ────────────────────────────────────────────

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
};

// ── Home stack (Home tab → nested screens) ───────────────────────────────────

export type HomeStackParamList = {
  HomeMain: undefined;
  KnowledgeBaseList: undefined;
  KnowledgeArticle: { slug: string; title: string };
  AudioKhaiTriList: undefined;
  AudioKhaiTriPlayer: {
    trackId: string;
    queueIndex: number;
    queue: KhaiTriAudioTrack[];
  };
};

// ── Bottom tab navigator ──────────────────────────────────────────────────────

export type MainTabParamList = {
  Home: undefined;
  Articles: undefined;
  KhaiTri: undefined;
  Community: undefined;
  Profile: undefined;
};

// ── Community stack (Hub → sub-screens) ──────────────────────────────────────

export type CommunityStackParamList = {
  CommunityHub: undefined;
  TuKhaiTri: undefined;
  /** Đối thoại sâu — browse channels by Trục (Phase 7) */
  DoiThoaiSau: undefined;
  /** Đối thoại sâu — individual channel thread (Phase 7) */
  DoiThoaiSauThread: {
    channelId: string;
    channelSlug: string;
    slowModeSeconds: number;
    ephemeralTtlHours: number;
  };
  /** Forum Q&A browse — optionally prefill from promoted message (Phase 6) */
  HoiDapForum: { prefillFromQuestionId?: string } | undefined;
  /** Forum Q&A detail — single question with answers (Phase 6) */
  ForumQaDetail: { questionId: string };
  BayCung: undefined;
  /** Bay Cùng profile — own (no uid) or peer (uid present) (Phase 9) */
  BayCungProfile: { uid?: string } | undefined;
  /** Edit own Bay Cùng profile: nickname, photo, focus (Phase 9) */
  BayCungEditProfile: undefined;
  /** Phá Nô Lệ Trí Tuệ — 4 chủ nô overview (Phase 9) */
  PhaNoLe: undefined;
  /** Encrypted journal for one chủ nô (Phase 9) */
  ChuNoLog: { chuNo: ChuNo };
  TraoDoiNLTT: undefined;
};

// ── Typed screen prop helpers ─────────────────────────────────────────────────

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type CommunityStackScreenProps<T extends keyof CommunityStackParamList> =
  NativeStackScreenProps<CommunityStackParamList, T>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, T>;

// Augment react-navigation global types for useNavigation() inference
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
