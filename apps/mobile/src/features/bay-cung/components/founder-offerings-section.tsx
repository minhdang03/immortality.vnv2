/**
 * founder-offerings-section — paid 1-on-1 booking + course list.
 *
 * Rendered ONLY when profile.isFounder === true, BELOW all standard sections.
 * isFounder drives conditional render only — NO badge/border/styling anywhere.
 * Đăng's ProfileHeader is pixel-identical to any other user's ProfileHeader.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, fontSizes, spacing, radii, shadows } from '../../../theme';
import type { FounderOfferings, AvailableSlot, CourseOffering } from '../../../hooks/use-profile';

function OneOnOneSection({ offerings, onBookPress }: { offerings: NonNullable<FounderOfferings['oneOnOne']>; onBookPress?: () => void }) {
  return (
    <View style={styles.paidCard}>
      <View style={styles.paidHead}>
        <Text style={styles.paidTitle}>{offerings.title}</Text>
        <Text style={styles.paidPrice}>{offerings.priceLabelVnd}</Text>
      </View>
      <Text style={styles.paidBody}>{offerings.description}</Text>
      {offerings.availableSlots.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing[3] }} contentContainerStyle={{ gap: spacing[2] }}>
          {offerings.availableSlots.map((slot: AvailableSlot, idx: number) => (
            <View key={slot.datetime} style={[styles.chip, idx === 0 && styles.chipActive]}>
              <Text style={[styles.chipText, idx === 0 && styles.chipTextActive]}>{slot.label}</Text>
            </View>
          ))}
        </ScrollView>
      )}
      <TouchableOpacity style={styles.fillBtn} onPress={onBookPress} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Xem lịch trống và đặt buổi">
        <Text style={styles.fillBtnText}>Xem lịch trống &amp; đặt</Text>
      </TouchableOpacity>
    </View>
  );
}

function CourseMiniCard({ course }: { course: CourseOffering }) {
  const priceStr = course.priceVnd >= 1_000_000
    ? `${(course.priceVnd / 1_000_000).toFixed(1).replace('.0', '')} triệu`
    : `${(course.priceVnd / 1_000).toFixed(0)}K`;
  return (
    <View style={styles.courseMini}>
      <View style={styles.courseThumb}><Text style={styles.courseThumbLabel}>{course.thumbLabel}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.courseMeta}>{course.durationLabel}<Text style={styles.coursePrice}> · {priceStr}</Text></Text>
      </View>
    </View>
  );
}

interface FounderOfferingsSectionProps {
  offerings: FounderOfferings;
  onBookOneOnOne?: () => void;
}

export function FounderOfferingsSection({ offerings, onBookOneOnOne }: FounderOfferingsSectionProps) {
  const hasOneOnOne = !!offerings.oneOnOne;
  const hasCourses = offerings.courses.length > 0;
  if (!hasOneOnOne && !hasCourses) return null;

  return (
    <View>
      {hasOneOnOne && (
        <>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Đặt 1-on-1</Text>
            <View style={styles.paidPill}><Text style={styles.paidPillText}>PAID · 2-5 TR</Text></View>
          </View>
          <OneOnOneSection offerings={offerings.oneOnOne!} onBookPress={onBookOneOnOne} />
        </>
      )}
      {hasCourses && (
        <>
          <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Khóa học cấu trúc</Text></View>
          {offerings.courses.map((c) => <CourseMiniCard key={c.id} course={c} />)}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[5], paddingTop: spacing[2] + 2, paddingBottom: spacing[2] },
  sectionTitle: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.base, color: colors.ink },
  paidPill: { backgroundColor: colors.goldSoft, paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: radii.pill },
  paidPillText: { fontFamily: typography.mono, fontSize: fontSizes.xs - 1, color: colors.goldDeep, fontWeight: '600', letterSpacing: 0.5 },
  paidCard: { marginHorizontal: spacing[5], marginBottom: spacing[3], backgroundColor: colors.goldTint, borderWidth: 1, borderColor: colors.goldSoft, borderRadius: radii.md, padding: spacing[4], ...shadows.card },
  paidHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] },
  paidTitle: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.base, color: colors.ink },
  paidPrice: { fontFamily: typography.mono, fontSize: fontSizes.sm, color: colors.goldDeep, fontWeight: '600' },
  paidBody: { fontFamily: typography.sans, fontSize: fontSizes.xs + 1, color: colors.inkSoft, lineHeight: fontSizes.xs * 1.6, marginBottom: spacing[3] },
  chip: { paddingHorizontal: spacing[2], paddingVertical: 4, borderRadius: radii.xs, backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: colors.rule },
  chipActive: { backgroundColor: colors.goldSoft, borderColor: colors.goldSoft },
  chipText: { fontFamily: typography.mono, fontSize: fontSizes.xs, color: colors.inkSoft },
  chipTextActive: { color: colors.goldDeep, fontWeight: '600' },
  fillBtn: { backgroundColor: colors.goldDeep, borderRadius: radii.sm, paddingVertical: spacing[2] + 2, alignItems: 'center' },
  fillBtnText: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.sm, color: '#fdf6e6' },
  courseMini: { marginHorizontal: spacing[5], marginBottom: spacing[2] + 2, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.rule, borderRadius: radii.md, padding: spacing[3], flexDirection: 'row', alignItems: 'center', gap: spacing[3], ...shadows.card },
  courseThumb: { width: 56, height: 56, borderRadius: radii.sm, backgroundColor: colors.goldDeep, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  courseThumbLabel: { fontFamily: typography.mono, fontSize: fontSizes.xs, color: '#fdf6e6', fontWeight: '600' },
  courseTitle: { fontFamily: typography.serif, fontSize: fontSizes.base, color: colors.ink, lineHeight: fontSizes.base * 1.25 },
  courseMeta: { fontFamily: typography.mono, fontSize: fontSizes.xs, color: colors.inkMuted, marginTop: 4 },
  coursePrice: { color: colors.goldDeep, fontWeight: '600' },
});
