/**
 * App.tsx — root component for Bất Tử Đạo mobile app.
 *
 * Provider order (outermost → innermost):
 *   QueryClientProvider  → TanStack Query cache
 *   NavigationContainer  → React Navigation
 *   RootNavigator        → Auth gate + tab shell
 *
 * useFirebaseAuth() bootstraps anonymous sign-in and syncs to Zustand.
 * Font loading via useFonts() — app renders null until fonts ready.
 */
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_600SemiBold_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
} from '@expo-google-fonts/be-vietnam-pro';
import {
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { queryClient } from './src/lib/react-query-client';
import { RootNavigator } from './src/navigation/root-navigator';
import { useFirebaseAuth } from './src/hooks/use-firebase-auth';
import { colors } from './src/theme';

function AuthBootstrap() {
  // Runs anonymous sign-in on mount, syncs to Zustand auth-store
  useFirebaseAuth();
  return <RootNavigator />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_600SemiBold_Italic,
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
    JetBrainsMono_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <AuthBootstrap />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
