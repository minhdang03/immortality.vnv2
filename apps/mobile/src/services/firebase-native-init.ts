/**
 * @react-native-firebase initialisation for the mobile app.
 * The native modules are auto-linked via the Expo config plugins in app.json.
 * GoogleService-Info.plist (iOS) and google-services.json (Android) must be
 * placed at apps/mobile/ before running `eas build`.
 *
 * This module is imported once at app boot (App.tsx) to ensure Firebase is
 * ready before any auth or Firestore calls.
 */
import firebase from '@react-native-firebase/app';

export function getFirebaseApp() {
  return firebase.app();
}
