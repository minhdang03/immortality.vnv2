/**
 * main-tab-navigator.tsx
 * 5-tab bottom navigation. Phase 11: Articles + KhaiTri replaced with WebView screens.
 * Home tab now uses HomeStackNavigator (Knowledge + Audio sub-screens).
 */
import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, typography, fontSizes } from '../theme';
import { HomeStackNavigator } from './home-stack-navigator';
import { ArticlesWebViewScreen } from '../screens/articles/articles-webview-screen';
import { KhaiTriWebViewScreen } from '../screens/khaitri/khai-tri-webview-screen';
import { CommunityStackNavigator } from './community-stack-navigator';
import { ProfilePlaceholderScreen } from '../screens/profile/profile-placeholder-screen';
import { TabIcon } from '../components/ui/tab-icon';
import type { MainTabParamList } from '../types/navigation-types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 83 : 60;

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.goldDeep,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: {
          backgroundColor: 'rgba(248,243,234,0.95)',
          borderTopColor: colors.rule,
          borderTopWidth: 1,
          height: TAB_BAR_HEIGHT,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: typography.sansMedium, fontSize: fontSizes.xs, marginTop: 2 },
        tabBarIcon: ({ color, focused }) => <TabIcon routeName={route.name} color={color} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="Articles" component={ArticlesWebViewScreen} options={{ tabBarLabel: 'Bài viết' }} />
      <Tab.Screen name="KhaiTri" component={KhaiTriWebViewScreen} options={{ tabBarLabel: 'Khai Trí' }} />
      <Tab.Screen name="Community" component={CommunityStackNavigator} options={{ tabBarLabel: 'Cộng đồng' }} />
      <Tab.Screen name="Profile" component={ProfilePlaceholderScreen} options={{ tabBarLabel: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
}
