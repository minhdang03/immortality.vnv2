/**
 * home-stack-navigator.tsx
 * Stack for Home tab: HomeMain → KnowledgeBaseList → KnowledgeArticle (WebView)
 *                               → AudioKhaiTriList → AudioKhaiTriPlayer (native)
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, typography } from '../theme';
import { HomeScreen } from '../screens/home/home-screen';
import { KnowledgeBaseListScreen } from '../screens/knowledge/knowledge-base-list-screen';
import { KnowledgeArticleWebViewScreen } from '../screens/knowledge/knowledge-article-webview-screen';
import { AudioKhaiTriListScreen } from '../screens/audio-khai-tri/audio-khai-tri-list-screen';
import { AudioKhaiTriPlayerScreen } from '../screens/audio-khai-tri/audio-khai-tri-player-screen';
import type { HomeStackParamList } from '../types/navigation-types';

const Stack = createNativeStackNavigator<HomeStackParamList>();
const HEADER_OPTIONS = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.gold,
  headerTitleStyle: { fontFamily: typography.sansSemiBold, fontSize: 16, color: colors.ink },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
} as const;

export function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTIONS}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="KnowledgeBaseList" component={KnowledgeBaseListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="KnowledgeArticle" component={KnowledgeArticleWebViewScreen}
        options={({ route }) => ({ title: route.params.title })} />
      <Stack.Screen name="AudioKhaiTriList" component={AudioKhaiTriListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AudioKhaiTriPlayer" component={AudioKhaiTriPlayerScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
