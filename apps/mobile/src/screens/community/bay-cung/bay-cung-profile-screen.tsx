/**
 * BayCungProfileScreen — unified profile view for own, peer, and Đăng's profile.
 *
 * Template is pixel-identical for all profiles.
 * FounderOfferingsSection appended ONLY when profile.isFounder === true.
 * No badge, no border ring, no special styling for any profile type.
 *
 * Route:
 *   BayCungProfile — { uid?: string }
 *   No uid → own profile (useMyProfile)
 *   uid present → peer profile (useProfile)
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../../stores/auth-store';
import { useMyProfile, useProfile, useBayCungPeers, useFounderOfferings } from '../../../hooks/use-profile';
import { ProfileHeader } from '../../../features/bay-cung/components/profile-header';
import { TechnicalStatsRow } from '../../../features/bay-cung/components/technical-stats-row';
import { PathTimeline } from '../../../features/bay-cung/components/path-timeline';
import { BayCungPeerList } from '../../../features/bay-cung/components/bay-cung-peer-list';
import { FounderOfferingsSection } from '../../../features/bay-cung/components/founder-offerings-section';
import { colors, typography, fontSizes, spacing } from '../../../theme';
import type { CommunityStackParamList } from '../../../types/navigation-types';

type Nav = NativeStackNavigationProp<CommunityStackParamList>;

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={styles.sectionTitle}>{children}</Text>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function BayCungProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const params = (route.params ?? {}) as { uid?: string };
  const myUid = useAuthStore((s) => s.uid);

  // uid present = peer profile; absent = own profile
  const isOwnProfile = !params.uid || params.uid === myUid;
  const targetUid = params.uid ?? myUid;

  const myProfileQuery = useMyProfile();
  const peerProfileQuery = useProfile(isOwnProfile ? null : (params.uid ?? null));

  const profileQuery = isOwnProfile ? myProfileQuery : peerProfileQuery;
  const profile = profileQuery.data;

  const peersQuery = useBayCungPeers(targetUid ?? null);
  const offeringsQuery = useFounderOfferings(
    profile?.isFounder ? (targetUid ?? null) : null,
  );

  const handleEditPress = useCallback(() => {
    navigation.navigate('BayCungEditProfile');
  }, [navigation]);

  const handlePeerMenuPress = useCallback(() => {
    Alert.alert('Tùy chọn', undefined, [
      { text: 'Bay Cùng người này', style: 'default' },
      { text: 'Hủy', style: 'cancel' },
    ]);
  }, []);

  const handlePeerPress = useCallback(
    (uid: string) => {
      navigation.navigate('BayCungProfile', { uid });
    },
    [navigation],
  );

  const handleSeeAllPeers = useCallback(() => {
    // Future: navigate to full peers list
  }, []);

  if (profileQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.goldDeep} />
      </View>
    );
  }

  if (profileQuery.isError || !profile) {
    return <ErrorState message="Không tải được hồ sơ. Thử lại sau." />;
  }

  const peers = peersQuery.data?.peers ?? [];
  const offerings = offeringsQuery.data;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + name + technical status */}
      <ProfileHeader
        profile={profile}
        onEditPress={isOwnProfile ? handleEditPress : undefined}
        showPeerMenu={!isOwnProfile}
        onPeerMenuPress={!isOwnProfile ? handlePeerMenuPress : undefined}
      />

      {/* 3-cell stats row */}
      <TechnicalStatsRow
        capLuyenPct={profile.currentFocus?.capLuyenPct ?? null}
        thaiyangHoursMonth={profile.thaiyangHoursMonth}
        huongDiCount={profile.huongDiCount}
      />

      {/* Vertical path timeline */}
      <SectionTitle>Đường đi</SectionTitle>
      <PathTimeline entries={profile.pathTimeline} />

      {/* Bay Cùng peers grid */}
      <SectionTitle>Bay Cùng</SectionTitle>
      <BayCungPeerList
        peers={peers}
        onPeerPress={handlePeerPress}
        onSeeAll={peers.length > 6 ? handleSeeAllPeers : undefined}
      />

      {/* Founder paid sections — ONLY when isFounder === true */}
      {profile.isFounder && offerings && (
        <FounderOfferingsSection offerings={offerings} />
      )}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  sectionTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: fontSizes.base,
    color: colors.ink,
    marginHorizontal: spacing[5],
    marginTop: spacing[2] + 2,
    marginBottom: spacing[2],
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    textAlign: 'center',
    paddingHorizontal: spacing[6],
  },
  bottomPad: { height: spacing[8] },
});
