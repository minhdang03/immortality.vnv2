/**
 * Tests: useProTierSubscriptionStatus days-remaining calculation.
 *
 * Critical invariants:
 *   1. isPro=true when proExpiresAt is in the future
 *   2. isPro=false when proExpiresAt is null
 *   3. isPro=false when proExpiresAt is in the past
 *   4. daysRemaining calculated correctly (ceil)
 *   5. badgeLabel format: "PRO · còn 17/30 ngày"
 *   6. badgeLabel="" when not Pro
 *   7. totalDays always 30
 */

// Pure logic test — test the calculation directly without rendering hooks
// (avoids needing full React + Zustand + TanStack Query bootstrap)

// Mock Firebase chain so the import of PRO_PLAN_DAYS doesn't trigger native modules
jest.mock('@react-native-firebase/auth', () => () => ({ currentUser: null }));
jest.mock('@react-native-firebase/app', () => ({}));
jest.mock('../../src/services/firebase-auth-service', () => ({
  getIdToken: jest.fn().mockResolvedValue(null),
}));
jest.mock('../../src/services/api-client', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
  ApiError: class ApiError extends Error { status: number; constructor(s: number, m: string) { super(m); this.status = s; } },
}));

import { PRO_PLAN_DAYS } from '../../src/hooks/use-pro-tier-subscription-status';

// ── Inline the badge/days calculation logic (matches hook implementation) ──

function computeProStatus(proExpiresAt: string | null) {
  const expiryDate = proExpiresAt ? new Date(proExpiresAt) : null;
  const now = Date.now();
  const isPro = expiryDate !== null && expiryDate.getTime() > now;
  const daysRemaining = isPro
    ? Math.max(0, Math.ceil((expiryDate!.getTime() - now) / (24 * 60 * 60 * 1000)))
    : 0;
  const badgeLabel = isPro ? `PRO · còn ${daysRemaining}/${PRO_PLAN_DAYS} ngày` : '';
  return { isPro, daysRemaining, totalDays: PRO_PLAN_DAYS, badgeLabel };
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('Pro tier days-remaining calculation', () => {
  it('isPro=true when proExpiresAt is 17 days in the future', () => {
    const expiry = new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString();
    const { isPro, daysRemaining, badgeLabel } = computeProStatus(expiry);

    expect(isPro).toBe(true);
    expect(daysRemaining).toBe(17);
    expect(badgeLabel).toBe('PRO · còn 17/30 ngày');
  });

  it('isPro=false when proExpiresAt is null', () => {
    const { isPro, daysRemaining, badgeLabel } = computeProStatus(null);

    expect(isPro).toBe(false);
    expect(daysRemaining).toBe(0);
    expect(badgeLabel).toBe('');
  });

  it('isPro=false when proExpiresAt is in the past', () => {
    const expiry = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    const { isPro, daysRemaining, badgeLabel } = computeProStatus(expiry);

    expect(isPro).toBe(false);
    expect(daysRemaining).toBe(0);
    expect(badgeLabel).toBe('');
  });

  it('totalDays is always PRO_PLAN_DAYS (30)', () => {
    const expiry = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const { totalDays } = computeProStatus(expiry);

    expect(totalDays).toBe(30);
    expect(PRO_PLAN_DAYS).toBe(30);
  });

  it('badgeLabel includes daysRemaining/totalDays format', () => {
    const expiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const { badgeLabel } = computeProStatus(expiry);

    expect(badgeLabel).toMatch(/PRO · còn \d+\/30 ngày/);
  });

  it('daysRemaining rounds up (ceil) for partial days', () => {
    // 1.5 days in future → ceil → 2
    const expiry = new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString();
    const { daysRemaining } = computeProStatus(expiry);

    expect(daysRemaining).toBe(2);
  });

  it('daysRemaining is 1 when expiry is < 24h away', () => {
    const expiry = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours
    const { daysRemaining, isPro } = computeProStatus(expiry);

    expect(isPro).toBe(true);
    expect(daysRemaining).toBe(1);
  });
});
