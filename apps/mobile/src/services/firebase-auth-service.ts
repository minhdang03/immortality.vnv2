/**
 * Firebase Auth service — anonymous-first auth flow.
 *
 * Strategy:
 * 1. On boot, check if a Firebase user already exists (persisted by native SDK).
 * 2. If no user → signInAnonymously() immediately, no prompt shown to user.
 * 3. UID is stable across restarts (Firebase persists anon sessions natively).
 * 4. Optional upgrade: linkWithCredential() keeps same UID when user adds email.
 *
 * ID tokens are NEVER logged. Redacted in all error messages.
 */
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export interface BtdUserProfile {
  uid: string;
  nickname: string | null;
  isAnonymous: boolean;
  createdAt: number;
}

/**
 * Sign in anonymously. Safe to call if already signed in — returns current user.
 * Throws only on network failure; caller should handle and retry.
 */
export async function signInAnonymously(): Promise<FirebaseAuthTypes.User> {
  const current = auth().currentUser;
  if (current) return current;

  const credential = await auth().signInAnonymously();
  return credential.user;
}

/**
 * Get the current Firebase ID token for API auth header.
 * Refreshes silently if expired. NEVER log the returned value.
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth().currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    // Token refresh failed — caller should treat as unauthenticated
    return null;
  }
}

/**
 * Subscribe to auth state changes. Returns unsubscribe function.
 */
export function onAuthStateChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void,
): () => void {
  return auth().onAuthStateChanged(callback);
}

/**
 * Save or update the user's nickname in Firestore btd_profiles.
 * Sets displayName on the Firebase Auth profile as well.
 */
export async function saveNickname(
  uid: string,
  nickname: string,
): Promise<void> {
  const trimmed = nickname.trim().slice(0, 40);
  if (!trimmed) throw new Error('Nickname cannot be empty');

  await Promise.all([
    firestore().collection('btd_profiles').doc(uid).set(
      { nickname: trimmed, updatedAt: firestore.FieldValue.serverTimestamp() },
      { merge: true },
    ),
    auth().currentUser?.updateProfile({ displayName: trimmed }),
  ]);
}

/**
 * Upgrade anonymous account to email/password while preserving UID.
 */
export async function upgradeToEmailPassword(
  email: string,
  password: string,
): Promise<void> {
  const user = auth().currentUser;
  if (!user) throw new Error('No authenticated user to upgrade');

  const credential = auth.EmailAuthProvider.credential(email, password);
  await user.linkWithCredential(credential);
}

/**
 * Fetch or create the user profile document from Firestore.
 * Returns null if Firestore is unreachable (offline mode).
 */
export async function fetchOrCreateProfile(
  uid: string,
  isAnonymous: boolean,
): Promise<BtdUserProfile | null> {
  try {
    const ref = firestore().collection('btd_profiles').doc(uid);
    const snap = await ref.get();

    if (snap.exists) {
      const data = snap.data() as Partial<BtdUserProfile>;
      return {
        uid,
        nickname: data.nickname ?? null,
        isAnonymous,
        createdAt: (data.createdAt as number) ?? Date.now(),
      };
    }

    // First launch — create profile stub
    const profile: BtdUserProfile = {
      uid,
      nickname: null,
      isAnonymous,
      createdAt: Date.now(),
    };
    await ref.set({
      ...profile,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return profile;
  } catch {
    // Network offline — return null, app continues in degraded mode
    return null;
  }
}
