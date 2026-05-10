/**
 * Tests: ProfileHeader renders identically for founder and non-founder profiles.
 *
 * Anti-patterns enforced — must NOT appear for any profile type:
 *  - "founder" text or badge
 *  - "follower" count
 *  - "bài viết" (post count)
 *  - any level/rank label
 *
 * Positive cases:
 *  - Name renders for both profiles
 *  - Technical status line matches expected format
 *  - Edit gear shows only when onEditPress provided
 *  - Peer menu icon shows only when showPeerMenu=true
 */
import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Svg = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(View, null, children);
  return {
    __esModule: true,
    default: Svg,
    Circle: () => null,
    Path: () => null,
    Line: () => null,
    Rect: () => null,
  };
});

import { ProfileHeader } from '../src/features/bay-cung/components/profile-header';
import type { FullProfile } from '../src/hooks/use-profile';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const BASE_PROFILE: FullProfile = {
  uid: 'uid-regular',
  nickname: 'Nguyễn Văn A',
  photoUrl: null,
  currentFocus: {
    chuNo: 'dinh-kien',
    technique: 'Thái Dương Quyền bài 3',
    capLuyenPct: 42,
  },
  pathTimeline: [],
  thaiyangHoursMonth: 5.5,
  huongDiCount: 3,
  isFounder: false,
  createdAt: '2024-01-01T00:00:00Z',
};

const FOUNDER_PROFILE: FullProfile = {
  ...BASE_PROFILE,
  uid: 'uid-founder',
  nickname: 'Đăng',
  isFounder: true,
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('ProfileHeader identical render for founder vs non-founder', () => {
  it('renders nickname for regular user', () => {
    const { getByText } = render(<ProfileHeader profile={BASE_PROFILE} />);
    expect(getByText('Nguyễn Văn A')).toBeTruthy();
  });

  it('renders nickname for founder', () => {
    const { getByText } = render(<ProfileHeader profile={FOUNDER_PROFILE} />);
    expect(getByText('Đăng')).toBeTruthy();
  });

  it('renders technical status line with correct format', () => {
    const { getByText } = render(<ProfileHeader profile={BASE_PROFILE} />);
    // Format: "Đang phá: <chuNoLabel> · Đang luyện: cấp 1 <pct>%"
    const el = getByText(/Đang phá:.*Đang luyện:/i);
    expect(el).toBeTruthy();
    expect(el.props.children).toMatch(/42%/);
  });

  it('status line contains technical chủ nô label (not raw slug)', () => {
    const { getByText } = render(<ProfileHeader profile={BASE_PROFILE} />);
    const el = getByText(/Đang phá:/i);
    // Should show Vietnamese label "định kiến", not the slug "dinh-kien"
    expect(el.props.children).toMatch(/định kiến/i);
    expect(el.props.children).not.toMatch(/dinh-kien/);
  });

  it('does NOT show "founder" label or text for founder profile', () => {
    const { queryByText } = render(<ProfileHeader profile={FOUNDER_PROFILE} />);
    expect(queryByText(/founder/i)).toBeNull();
    expect(queryByText(/người sáng lập/i)).toBeNull();
  });

  it('does NOT show follower count for any profile', () => {
    const { queryByText: queryRegular } = render(<ProfileHeader profile={BASE_PROFILE} />);
    const { queryByText: queryFounder } = render(<ProfileHeader profile={FOUNDER_PROFILE} />);
    expect(queryRegular(/follower/i)).toBeNull();
    expect(queryRegular(/người theo dõi/i)).toBeNull();
    expect(queryFounder(/follower/i)).toBeNull();
    expect(queryFounder(/người theo dõi/i)).toBeNull();
  });

  it('does NOT show post count (bài viết) for any profile', () => {
    const { queryByText: queryRegular } = render(<ProfileHeader profile={BASE_PROFILE} />);
    const { queryByText: queryFounder } = render(<ProfileHeader profile={FOUNDER_PROFILE} />);
    expect(queryRegular(/bài viết/i)).toBeNull();
    expect(queryFounder(/bài viết/i)).toBeNull();
  });

  it('does NOT show level or rank badge', () => {
    const { queryByText } = render(<ProfileHeader profile={FOUNDER_PROFILE} />);
    expect(queryByText(/\brank\b/i)).toBeNull();
    expect(queryByText(/lên cấp/i)).toBeNull();
    expect(queryByText(/huy hiệu/i)).toBeNull();
  });

  it('shows edit gear icon only when onEditPress provided', () => {
    const { queryByLabelText: withoutEdit } = render(
      <ProfileHeader profile={BASE_PROFILE} />,
    );
    expect(withoutEdit('Chỉnh sửa hồ sơ')).toBeNull();

    const { getByLabelText: withEdit } = render(
      <ProfileHeader profile={BASE_PROFILE} onEditPress={() => {}} />,
    );
    expect(withEdit('Chỉnh sửa hồ sơ')).toBeTruthy();
  });

  it('shows peer menu icon only when showPeerMenu=true and handler provided', () => {
    const { queryByLabelText: noPeerMenu } = render(
      <ProfileHeader profile={BASE_PROFILE} showPeerMenu={false} />,
    );
    expect(noPeerMenu('Tùy chọn')).toBeNull();

    const { getByLabelText: withPeerMenu } = render(
      <ProfileHeader profile={BASE_PROFILE} showPeerMenu onPeerMenuPress={() => {}} />,
    );
    expect(withPeerMenu('Tùy chọn')).toBeTruthy();
  });

  it('founder profile renders same structure as regular profile (no extra wrapper)', () => {
    const { toJSON: regularJson } = render(<ProfileHeader profile={BASE_PROFILE} />);
    const { toJSON: founderJson } = render(<ProfileHeader profile={FOUNDER_PROFILE} />);

    // Normalise all name/initial/pct content so only structural differences surface.
    // GradientAvatar renders first char of nickname as the avatar letter — replace that too.
    const normalise = (json: ReturnType<typeof regularJson>) =>
      JSON.stringify(json)
        .replace(/Nguyễn Văn A/g, '__NAME__')
        .replace(/Đăng/g, '__NAME__')
        // Avatar initial letters differ per profile — normalise any single-char text node
        .replace(/"children":\["[A-ZĐÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]"\]/gi, '"children":["__INITIAL__"]')
        .replace(/42/g, '__PCT__');

    expect(normalise(regularJson())).toBe(normalise(founderJson()));
  });
});
