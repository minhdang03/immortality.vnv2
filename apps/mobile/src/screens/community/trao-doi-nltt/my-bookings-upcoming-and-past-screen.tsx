/**
 * MyBookingsUpcomingAndPastScreen — lists user's confirmed 1-on-1 and peer session bookings.
 *
 * Route: TraoDoiNlttMyBookings (no params)
 *
 * Two tabs: Sắp diễn ra (upcoming) | Đã qua (past).
 * Each booking shown as MyBookingCardWithCountdown.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, fontSizes, spacing, radii } from '../../../theme';
import { useMyBookings, isUpcomingBooking, isPastBooking } from '../../../hooks/use-book-1on1-session';
import { MyBookingCardWithCountdown } from '../../../components/trao-doi-nltt/my-booking-card-with-countdown';

type TabKey = 'upcoming' | 'past';

// ── Tab bar ───────────────────────────────────────────────────────────────────

function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <View style={tabStyles.bar}>
      {(['upcoming', 'past'] as TabKey[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[tabStyles.tab, active === tab && tabStyles.tabActive]}
          onPress={() => onChange(tab)}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === tab }}
        >
          <Text style={[tabStyles.label, active === tab && tabStyles.labelActive]}>
            {tab === 'upcoming' ? 'Sắp diễn ra' : 'Đã qua'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    marginHorizontal: spacing[5],
    marginBottom: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  tabActive: {
    backgroundColor: colors.bg,
    shadowColor: '#161310',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontFamily: typography.sansMedium,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
  },
  labelActive: {
    color: colors.ink,
    fontFamily: typography.sansSemiBold,
  },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export function MyBookingsUpcomingAndPastScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const bookingsQuery = useMyBookings();

  const upcoming = (bookingsQuery.data ?? []).filter(isUpcomingBooking);
  const past = (bookingsQuery.data ?? []).filter(isPastBooking);
  const displayed = activeTab === 'upcoming' ? upcoming : past;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Lịch đặt của tôi</Text>

        <TabBar active={activeTab} onChange={setActiveTab} />

        {bookingsQuery.isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.goldDeep} size="small" />
          </View>
        )}

        {bookingsQuery.isError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              Không tải được lịch. Vui lòng thử lại sau.
            </Text>
          </View>
        )}

        {!bookingsQuery.isLoading && !bookingsQuery.isError && (
          <>
            {displayed.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  {activeTab === 'upcoming'
                    ? 'Chưa có lịch sắp tới. Đặt 1-on-1 hoặc tham gia phiên đồng đẳng!'
                    : 'Chưa có lịch đã qua.'}
                </Text>
              </View>
            ) : (
              <View style={styles.cardList}>
                {displayed.map((booking) => (
                  <MyBookingCardWithCountdown key={booking.id} booking={booking} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingTop: spacing[4], paddingBottom: spacing[10] },

  screenTitle: {
    fontFamily: typography.sansBold,
    fontSize: fontSizes.xl,
    color: colors.ink,
    letterSpacing: -0.4,
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },

  center: { alignItems: 'center', paddingVertical: spacing[6] },

  errorBox: {
    marginHorizontal: spacing[5],
    backgroundColor: '#FEE2E2',
    borderRadius: radii.md,
    padding: spacing[4],
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: '#B91C1C',
  },

  emptyBox: {
    marginHorizontal: spacing[5],
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing[5],
  },
  emptyText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: fontSizes.sm * 1.6,
  },

  cardList: {
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
});
