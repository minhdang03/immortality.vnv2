/**
 * RootNavigator — top-level stack that switches between:
 * - Onboarding (first-launch welcome)
 * - MainTabs (authenticated app shell)
 *
 * Auth is always present (anonymous sign-in happens in background).
 * The navigator shows a splash-style loading view while Firebase hydrates.
 */
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/auth-store';
import { MainTabNavigator } from './main-tab-navigator';
import { OnboardingScreen } from '../screens/auth/onboarding-screen';
import { colors } from '../theme';
import type { RootStackParamList } from '../types/navigation-types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isHydrating, isAuthed } = useAuthStore();

  if (isHydrating) {
    return (
      <View
        style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthed ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
}
