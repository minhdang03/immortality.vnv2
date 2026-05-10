/**
 * CommunityStackNavigator — Hub → individual community space screens.
 * Phases 6–11 will replace placeholder screens with real implementations.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, typography } from '../theme';
import { CommunityHubScreen } from '../screens/community/community-hub-screen';
import { CommunitySpacePlaceholderScreen } from '../screens/community/_placeholders/community-space-placeholder-screen';
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
      <Stack.Screen
        name="DoiThoaiSau"
        component={CommunitySpacePlaceholderScreen}
        options={{ title: 'Đối thoại sâu' }}
        initialParams={{ spaceName: 'Đối thoại sâu' } as never}
      />
      <Stack.Screen
        name="HoiDapForum"
        component={CommunitySpacePlaceholderScreen}
        options={{ title: 'Hỏi đáp · Forum Q&A' }}
        initialParams={{ spaceName: 'Hỏi đáp · Forum Q&A' } as never}
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
