/**
 * doi-thoai-sau-browse-channels-screen — Phone 9 from mockup v3.
 *
 * Shows channels grouped by Trục (1/2/3 topic axis) with collapsible headers.
 * Anti-tier: NO skill-level filter, NO "Beginner"/"Advanced" grouping.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, fontSizes } from '../../../theme';
import {
  useChannelsGroupedByTruc,
  type Channel,
} from '../../../features/doi-thoai-sau/hooks/use-channels-list-by-truc';
import {
  ChannelRowWithSlowModeChip,
  TrucCollapsibleHeader,
} from '../../../features/doi-thoai-sau/components/channel-row-with-slow-mode-chip';
import type { CommunityStackScreenProps } from '../../../types/navigation-types';

type Nav = CommunityStackScreenProps<'DoiThoaiSau'>['navigation'];

// ── Screen ────────────────────────────────────────────────────────────────────

export function DoiThoaiSauBrowseChannelsScreen() {
  const navigation = useNavigation<Nav>();
  const { sections, isLoading, error } = useChannelsGroupedByTruc();
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  function toggleTruc(truc: number) {
    setCollapsed((prev) => ({ ...prev, [truc]: !prev[truc] }));
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>
          {'Không tải được danh sách kênh. Thử lại sau.'}
        </Text>
      </SafeAreaView>
    );
  }

  const sectionListData = sections.map((s) => ({
    truc: s.truc,
    label: s.label,
    data: collapsed[s.truc] ? ([] as Channel[]) : s.channels,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>{'Đối thoại sâu'}</Text>
        <Text style={styles.subtitle}>{'Chia theo trục, không theo trình độ'}</Text>
      </View>

      <SectionList<Channel>
        sections={sectionListData}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <TrucCollapsibleHeader
            label={section.label}
            collapsed={!!collapsed[section.truc]}
            onToggle={() => toggleTruc(section.truc)}
          />
        )}
        renderItem={({ item }) => (
          <ChannelRowWithSlowModeChip
            channel={item}
            onPress={() =>
              navigation.navigate('DoiThoaiSauThread', {
                channelId: item.id,
                channelSlug: item.slug,
                slowModeSeconds: item.slowModeSeconds,
                ephemeralTtlHours: item.ephemeralTtlHours,
              })
            }
          />
        )}
        ListEmptyComponent={<EmptyState />}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyText}>
        {'Im lặng cũng là một dạng đối thoại.\nBắt đầu khi anh thấy đúng lúc.'}
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  title: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes['2xl'],
    color: colors.ink,
    letterSpacing: -0.5,
    lineHeight: fontSizes['2xl'] * 1.15,
  },
  subtitle: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    marginTop: 3,
  },
  listContent: { paddingBottom: spacing[10] },
  emptyWrap: { padding: spacing[8], alignItems: 'center' },
  emptyText: {
    fontFamily: typography.serifItalic,
    fontSize: fontSizes.md,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: fontSizes.md * 1.6,
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    textAlign: 'center',
    paddingHorizontal: spacing[8],
  },
});
