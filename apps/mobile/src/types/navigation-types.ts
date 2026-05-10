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
  DoiThoaiSau: undefined;
  HoiDapForum: undefined;
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
