/**
 * CommunityStackNavigator — Hub → individual community space screens.
 * Phase 7: DoiThoaiSau + DoiThoaiSauThread implemented.
 * Phases 6, 8–11 will replace remaining placeholder screens.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, typography } from '../theme';
import { CommunityHubScreen } from '../screens/community/community-hub-screen';
import { CommunitySpacePlaceholderScreen } from '../screens/community/_placeholders/community-space-placeholder-screen';
import { DoiThoaiSauBrowseChannelsScreen } from '../screens/community/doi-thoai-sau/doi-thoai-sau-browse-channels-screen';
import { DoiThoaiSauChannelThreadScreen } from '../screens/community/doi-thoai-sau/doi-thoai-sau-channel-thread-screen';
import { ForumQaBrowseScreen } from '../screens/community/forum-qa/forum-qa-browse-screen';
import { ForumQaDetailScreen } from '../screens/community/forum-qa/forum-qa-detail-screen';
import type { CommunityStackParamList } from '../types/navigation-types';

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export function CommunityStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.ink,
        headerTitleStyle: {
          fontFamily: typography.sansSemiBold,
          fontSize: 16,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="CommunityHub"
        component={CommunityHubScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TuKhaiTri"
        component={CommunitySpacePlaceholderScreen}
        options={{ title: 'Tự Khai Trí' }}
        initialParams={{ spaceName: 'Tự Khai Trí' } as never}
      />
      {/* Phase 7: real Đối thoại sâu screens */}
      <Stack.Screen
        name="DoiThoaiSau"
        component={DoiThoaiSauBrowseChannelsScreen}
        options={{ title: 'Đối thoại sâu' }}
      />
      <Stack.Screen
        name="DoiThoaiSauThread"
        component={DoiThoaiSauChannelThreadScreen}
        options={{ title: '' }} // title set dynamically via navigation.setOptions
      />
      {/* Phase 6: Forum Q&A screens */}
      <Stack.Screen
        name="HoiDapForum"
        component={ForumQaBrowseScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForumQaDetail"
        component={ForumQaDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BayCung"
        component={CommunitySpacePlaceholderScreen}
        options={{ title: 'Bay Cùng' }}
        initialParams={{ spaceName: 'Bay Cùng' } as never}
      />
      <Stack.Screen
        name="TraoDoiNLTT"
        component={CommunitySpacePlaceholderScreen}
        options={{ title: 'Trao Đổi Năng Lượng Trí Tuệ' }}
        initialParams={{ spaceName: 'Trao Đổi Năng Lượng Trí Tuệ' } as never}
      />
    </Stack.Navigator>
  );
}
