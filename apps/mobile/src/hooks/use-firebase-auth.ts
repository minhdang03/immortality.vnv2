/**
 * useFirebaseAuth — bootstraps anonymous auth on mount, subscribes to
 * auth state changes, and syncs to Zustand auth-store.
 *
 * Call once at the root of the app (App.tsx). Do not call in leaf components.
 */
import { useEffect } from 'react';
import {
  signInAnonymously,
  onAuthStateChanged,
  fetchOrCreateProfile,
} from '../services/firebase-auth-service';
import { useAuthStore } from '../stores/auth-store';

export function useFirebaseAuth() {
  const { setUser, setHydrating, clearUser } = useAuthStore();

  useEffect(() => {
    setHydrating(true);

    // Subscribe first so we catch the anon sign-in result
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        const profile = await fetchOrCreateProfile(user.uid, user.isAnonymous);
        setUser(user.uid, profile?.nickname ?? null);
      } else {
        // No user — attempt anonymous sign-in
        try {
          await signInAnonymously();
          // onAuthStateChanged will fire again with the new user
        } catch {
          // Network failure — clear hydrating so app can show offline state
          clearUser();
        }
      }
    });

    return unsubscribe;
  }, [setUser, setHydrating, clearUser]);
}
