/**
 * CommunityStackNavigator — Hub → individual community space screens.
 * Phase 7: DoiThoaiSau + DoiThoaiSauThread implemented.
 * Phase 9: BayCungProfile, BayCungEditProfile, PhaNoLe, ChuNoLog implemented.
 * Phases 8, 10–11 will replace remaining placeholder screens.
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
// Phase 9: Bay Cùng + Phá Nô Lệ screens
import { BayCungProfileScreen } from '../screens/community/bay-cung/bay-cung-profile-screen';
import { BayCungEditOwnProfileScreen } from '../screens/community/bay-cung/bay-cung-edit-own-profile-screen';
import { PhaNoLeFourMastersOverviewScreen } from '../screens/community/pha-no-le/pha-no-le-four-masters-overview-screen';
import { ChuNoEncryptedJournalLogScreen } from '../screens/community/pha-no-le/chu-no-encrypted-journal-log-screen';
import type { CommunityStackParamList } from '../types/navigation-types';

const CHU_NO_TITLES: Record<string, string> = {
  'thieu-hieu-biet': 'Thiếu hiểu biết',
  'ong-ba-lac-hau': 'Ông bà lạc hậu',
  'dinh-kien': 'Định kiến từ bé',
  'chu-no-giau-mat': 'Chủ nô giấu mặt',
};

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
      {/* Phase 9: Bay Cùng profile screens */}
      <Stack.Screen
        name="BayCungProfile"
        component={BayCungProfileScreen}
        options={{ title: 'Hồ sơ' }}
      />
      <Stack.Screen
        name="BayCungEditProfile"
        component={BayCungEditOwnProfileScreen}
        options={{ title: 'Chỉnh sửa hồ sơ' }}
      />
      {/* Phase 9: Phá Nô Lệ Trí Tuệ screens */}
      <Stack.Screen
        name="PhaNoLe"
        component={PhaNoLeFourMastersOverviewScreen}
        options={{ title: 'Phá Nô Lệ Trí Tuệ' }}
      />
      <Stack.Screen
        name="ChuNoLog"
        component={ChuNoEncryptedJournalLogScreen}
        options={({ route }) => ({
          title: CHU_NO_TITLES[route.params.chuNo] ?? 'Nhật ký',
        })}
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
