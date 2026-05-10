import { create } from 'zustand';

export interface AuthState {
  uid: string | null;
  isAuthed: boolean;
  isHydrating: boolean;
  nickname: string | null;
  /** Set by firebase-auth-hook after sign-in resolves */
  setUser: (uid: string, nickname?: string | null) => void;
  setHydrating: (v: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  uid: null,
  isAuthed: false,
  isHydrating: true,
  nickname: null,

  setUser: (uid, nickname = null) =>
    set({ uid, isAuthed: true, isHydrating: false, nickname }),

  setHydrating: (v) => set({ isHydrating: v }),

  clearUser: () =>
    set({ uid: null, isAuthed: false, isHydrating: false, nickname: null }),
}));
