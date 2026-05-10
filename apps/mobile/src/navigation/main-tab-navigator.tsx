/**
 * MainTabNavigator — 5-tab bottom navigation matching mockup tab bar.
 * Tab order: Trang chủ · Bài viết · Khai Trí · Cộng đồng · Hồ sơ
 *
 * Screens for tabs other than Community are placeholder stubs (filled in
 * Phases 6–11). Community tab hosts its own stack navigator.
 */
import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, typography, fontSizes } from '../theme';
import { HomeScreen } from '../screens/home/home-screen';
import { ArticlesPlaceholderScreen } from '../screens/articles/articles-placeholder-screen';
import { KhaiTriPlaceholderScreen } from '../screens/khaitri/khai-tri-placeholder-screen';
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
        tabBarLabelStyle: {
          fontFamily: typography.sansMedium,
          fontSize: fontSizes.xs,
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => (
          <TabIcon routeName={route.name} color={color} focused={focused} />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="Articles"
        component={ArticlesPlaceholderScreen}
        options={{ tabBarLabel: 'Bài viết' }}
      />
      <Tab.Screen
        name="KhaiTri"
        component={KhaiTriPlaceholderScreen}
        options={{ tabBarLabel: 'Khai Trí' }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityStackNavigator}
        options={{ tabBarLabel: 'Cộng đồng' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePlaceholderScreen}
        options={{ tabBarLabel: 'Hồ sơ' }}
      />
    </Tab.Navigator>
  );
}
