import { create } from 'zustand';

export interface UiState {
  /** Show nickname-prompt bottom sheet before first post/vote */
  showNicknamePrompt: boolean;
  /** Global loading overlay for auth operations */
  authLoading: boolean;
  setShowNicknamePrompt: (v: boolean) => void;
  setAuthLoading: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  showNicknamePrompt: false,
  authLoading: false,
  setShowNicknamePrompt: (v) => set({ showNicknamePrompt: v }),
  setAuthLoading: (v) => set({ authLoading: v }),
}));
