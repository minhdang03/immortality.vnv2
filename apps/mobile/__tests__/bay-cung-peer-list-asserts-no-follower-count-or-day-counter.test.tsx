/**
 * Tests: BayCungPeerList and ChuNoCard anti-engagement assertions.
 *
 * Verified anti-patterns (must NOT appear):
 *  - "đã đồng hành X ngày" counter in peer list
 *  - follower count / "người theo dõi" in peer list
 *  - level/rank label ("cấp X" as a badge, "level", "rank") in ChuNoCard
 *  - "badge" text in either component
 *
 * Also verifies positive cases:
 *  - Peer names and current focus labels render
 *  - ChuNoCard renders title + prompt + community count
 *  - ChuNoCard shows log preview when provided
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

import { BayCungPeerList } from '../src/features/bay-cung/components/bay-cung-peer-list';
import { ChuNoCard } from '../src/features/pha-no-le/components/chu-no-card';
import type { PeerSummary } from '../src/hooks/use-profile';

// ── BayCungPeerList tests ─────────────────────────────────────────────────

const MOCK_PEERS: PeerSummary[] = [
  { uid: 'uid-1', nickname: 'Linh An', photoUrl: null, currentFocusLabel: 'phá định kiến' },
  { uid: 'uid-2', nickname: 'Thanh Phong', photoUrl: null, currentFocusLabel: 'cấp 1 · 38%' },
  { uid: 'uid-3', nickname: 'Bích Ngọc', photoUrl: null, currentFocusLabel: 'phá ông bà' },
];

describe('BayCungPeerList anti-engagement assertions', () => {
  it('renders peer names', () => {
    const { getByText } = render(
      <BayCungPeerList peers={MOCK_PEERS} />,
    );
    expect(getByText('Linh An')).toBeTruthy();
    expect(getByText('Thanh Phong')).toBeTruthy();
  });

  it('renders current focus labels', () => {
    const { getByText } = render(
      <BayCungPeerList peers={MOCK_PEERS} />,
    );
    expect(getByText('phá định kiến')).toBeTruthy();
    expect(getByText('cấp 1 · 38%')).toBeTruthy();
  });

  it('does NOT show "đã đồng hành X ngày" counter', () => {
    const { queryByText } = render(<BayCungPeerList peers={MOCK_PEERS} />);
    expect(queryByText(/đồng hành.*ngày/i)).toBeNull();
    expect(queryByText(/ngày đồng hành/i)).toBeNull();
    expect(queryByText(/days together/i)).toBeNull();
  });

  it('does NOT show follower count', () => {
    const { queryByText } = render(<BayCungPeerList peers={MOCK_PEERS} />);
    expect(queryByText(/follower/i)).toBeNull();
    expect(queryByText(/người theo dõi/i)).toBeNull();
    expect(queryByText(/theo dõi bạn/i)).toBeNull();
  });

  it('does NOT show years-followed metric', () => {
    const { queryByText } = render(<BayCungPeerList peers={MOCK_PEERS} />);
    expect(queryByText(/năm theo dõi/i)).toBeNull();
    expect(queryByText(/years followed/i)).toBeNull();
  });

  it('renders empty state when no peers', () => {
    const { getByText } = render(<BayCungPeerList peers={[]} />);
    expect(getByText(/chưa có ai/i)).toBeTruthy();
  });

  it('limits visible cards to 6 even when more peers provided', () => {
    const manyPeers: PeerSummary[] = Array.from({ length: 10 }, (_, i) => ({
      uid: `uid-${i}`,
      nickname: `User ${i}`,
      photoUrl: null,
      currentFocusLabel: null,
    }));
    const { queryAllByText } = render(
      <BayCungPeerList peers={manyPeers} onSeeAll={() => {}} />,
    );
    // Only 6 should be rendered (User 0–5), User 6–9 should NOT appear
    expect(queryAllByText(/User \d+/).length).toBe(6);
  });
});

// ── ChuNoCard tests ────────────────────────────────────────────────────────

describe('ChuNoCard anti-engagement assertions', () => {
  const noop = () => {};

  it('renders title and prompt for each chủ nô', () => {
    const { getByText } = render(
      <ChuNoCard
        chuNo="thieu-hieu-biet"
        lastLogPreview={null}
        communityCount={12}
        onPress={noop}
      />,
    );
    expect(getByText('Thiếu hiểu biết')).toBeTruthy();
    expect(getByText(/học được gì mới/i)).toBeTruthy();
  });

  it('renders community count as raw number without engagement framing', () => {
    const { getByText } = render(
      <ChuNoCard
        chuNo="ong-ba-lac-hau"
        lastLogPreview={null}
        communityCount={8}
        onPress={noop}
      />,
    );
    expect(getByText(/8 người cùng bay đang phá/i)).toBeTruthy();
  });

  it('does NOT show level or rank label', () => {
    const { queryByText } = render(
      <ChuNoCard
        chuNo="dinh-kien"
        lastLogPreview={null}
        communityCount={15}
        onPress={noop}
      />,
    );
    expect(queryByText(/\blevel\b/i)).toBeNull();
    expect(queryByText(/\brank\b/i)).toBeNull();
    // "cấp" as a label/badge — level-up language
    expect(queryByText(/lên cấp/i)).toBeNull();
    expect(queryByText(/huy hiệu/i)).toBeNull();
    expect(queryByText(/badge/i)).toBeNull();
  });

  it('renders last log preview when provided', () => {
    const preview = 'Phát hiện niềm tin sai về thành công.';
    const { getByText } = render(
      <ChuNoCard
        chuNo="dinh-kien"
        lastLogPreview={preview}
        communityCount={15}
        onPress={noop}
      />,
    );
    expect(getByText(new RegExp(preview.slice(0, 20)))).toBeTruthy();
  });

  it('does NOT render Đăng link for non-giấu-mặt chủ nô', () => {
    const { queryByText } = render(
      <ChuNoCard
        chuNo="thieu-hieu-biet"
        lastLogPreview={null}
        communityCount={5}
        dangKhaiTriUrl="https://battudao.com/test"
        onPress={noop}
        onDangLinkPress={noop}
      />,
    );
    // Link only shown for chu-no-giau-mat
    expect(queryByText(/Đăng vừa đăng bài/i)).toBeNull();
  });

  it('renders Đăng link for chủ nô giấu mặt without gold-halo class', () => {
    const { getByText } = render(
      <ChuNoCard
        chuNo="chu-no-giau-mat"
        lastLogPreview={null}
        communityCount={23}
        dangKhaiTriUrl="https://battudao.com/khai-tri/chu-no-giau-mat"
        onPress={noop}
        onDangLinkPress={noop}
      />,
    );
    const linkEl = getByText(/Đăng vừa đăng bài/i);
    expect(linkEl).toBeTruthy();
    // Style must NOT include gold border or special background
    const style = linkEl.props.style as any;
    if (Array.isArray(style)) {
      style.forEach((s: any) => {
        expect(s?.borderColor).toBeUndefined();
        expect(s?.borderWidth).toBeUndefined();
        expect(s?.backgroundColor).toBeUndefined();
      });
    }
  });
});
