import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ── Root stack (Auth gate → Main) ────────────────────────────────────────────

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
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
  /** Đối thoại sâu — browse channels grouped by Trục (Phase 7) */
  DoiThoaiSau: undefined;
  /** Đối thoại sâu — individual channel thread with WS chat (Phase 7) */
  DoiThoaiSauThread: {
    channelId: string;
    channelSlug: string;
    slowModeSeconds: number;
    ephemeralTtlHours: number;
  };
  /** Forum Q&A browse — optionally highlight a promoted question (Phase 6) */
  HoiDapForum: { prefillFromQuestionId?: string } | undefined;
  /** Forum Q&A detail — single question with answers (Phase 6) */
  ForumQaDetail: { questionId: string };
  BayCung: undefined;
  TraoDoiNLTT: undefined;
};

// ── Typed screen prop helpers ─────────────────────────────────────────────────

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type CommunityStackScreenProps<T extends keyof CommunityStackParamList> =
  NativeStackScreenProps<CommunityStackParamList, T>;

// Augment react-navigation global types for useNavigation() inference
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
