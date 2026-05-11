/**
 * Tests: ParallelAnswerCardWithTamKhaoButton — Đăng = peer assertion.
 *
 * Critical invariants:
 *   1. Card structure for Đăng is IDENTICAL to any other author (JSON structure equal)
 *   2. No "founder", "người sáng lập", "admin", or special text for Đăng
 *   3. NO follower count text anywhere on the card
 *   4. "Tham khảo" button present — "đồng cảm" text must NOT appear
 *   5. authorCurrentFocus shown as plain text (practice state), not a badge
 *   6. isSaved=true changes button label to "Đã lưu"
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Svg = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(View, null, children);
  return { __esModule: true, default: Svg, Path: () => null };
});

import { ParallelAnswerCardWithTamKhaoButton } from '../../src/components/tu-khai-tri/parallel-answer-card-with-tam-khao-button';
import type { SelfInquiryAnswer } from '../../src/hooks/use-self-inquiry-questions';

// ── Fixtures ──────────────────────────────────────────────────────────────

const PEER_ANSWER: SelfInquiryAnswer = {
  id: 'sa-peer',
  questionId: 'sq1',
  authorUid: 'uid-linh-an',
  authorNickname: 'Linh An',
  authorCurrentFocus: 'Đang luyện cấp 2 80%',
  body: 'Câu trả lời từ Linh An.',
  createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
};

// Đăng's answer — should render with IDENTICAL structure
const DANG_ANSWER: SelfInquiryAnswer = {
  id: 'sa-dang',
  questionId: 'sq1',
  authorUid: 'uid-dang',
  authorNickname: 'Đăng',
  authorCurrentFocus: 'Đang luyện cấp 1 68%',
  body: 'Câu trả lời từ Đăng.',
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

// ── Tests ─────────────────────────────────────────────────────────────────

describe('ParallelAnswerCardWithTamKhaoButton — Đăng = peer', () => {
  const noop = jest.fn();

  it('renders Đăng nickname as plain text', () => {
    const { getByText } = render(
      <ParallelAnswerCardWithTamKhaoButton answer={DANG_ANSWER} onTamKhao={noop} />,
    );
    expect(getByText('Đăng')).toBeTruthy();
  });

  it('renders peer nickname as plain text', () => {
    const { getByText } = render(
      <ParallelAnswerCardWithTamKhaoButton answer={PEER_ANSWER} onTamKhao={noop} />,
    );
    expect(getByText('Linh An')).toBeTruthy();
  });

  it('Đăng card structure is identical to peer card (no extra wrappers or styling)', () => {
    const { toJSON: dangJson } = render(
      <ParallelAnswerCardWithTamKhaoButton answer={DANG_ANSWER} onTamKhao={noop} />,
    );
    const { toJSON: peerJson } = render(
      <ParallelAnswerCardWithTamKhaoButton answer={PEER_ANSWER} onTamKhao={noop} />,
    );

    // Normalise all name/body/focus/time content so only structural differences surface
    const normalise = (json: ReturnType<typeof dangJson>) =>
      JSON.stringify(json)
        .replace(/Đăng/g, '__NAME__')
        .replace(/Linh An/g, '__NAME__')
        // Avatar initials
        .replace(/"children":\["[A-ZĐÁ-Ỵ]"\]/g, '"children":["__I__"]')
        // Body text
        .replace(/Câu trả lời từ [^"]+\./g, '__BODY__')
        // currentFocus — different text per user
        .replace(/Đang luyện cấp \d+ \d+%/g, '__FOCUS__')
        // Relative time will differ slightly between renders
        .replace(/\d+[ph] trước|\d+ ngày/g, '__TIME__')
        // createdAt ISO strings baked into relTime
        .replace(/\d{4}-\d{2}-\d{2}T[^"]+Z/g, '__DATE__');

    expect(normalise(dangJson())).toBe(normalise(peerJson()));
  });

  it('does NOT show "founder", "người sáng lập", or "admin" for Đăng', () => {
    const { queryByText } = render(
      <ParallelAnswerCardWithTamKhaoButton answer={DANG_ANSWER} onTamKhao={noop} />,
    );
    expect(queryByText(/founder/i)).toBeNull();
    expect(queryByText(/người sáng lập/i)).toBeNull();
    expect(queryByText(/admin/i)).toBeNull();
  });

  it('does NOT show follower count on any card', () => {
    const { queryByText: dangQuery } = render(
      <ParallelAnswerCardWithTamKhaoButton answer={DANG_ANSWER} onTamKhao={noop} />,
    );
    const { queryByText: peerQuery } = render(
      <ParallelAnswerCardWithTamKhaoButton answer={PEER_ANSWER} onTamKhao={noop} />,
    );
    expect(dangQuery(/follower/i)).toBeNull();
    expect(dangQuery(/người theo dõi/i)).toBeNull();
    expect(peerQuery(/follower/i)).toBeNull();
    expect(peerQuery(/người theo dõi/i)).toBeNull();
  });

  it('"Tham khảo" button is present — NOT "đồng cảm"', () => {
    const { getByLabelText, queryByText } = render(
      <ParallelAnswerCardWithTamKhaoButton answer={DANG_ANSWER} onTamKhao={noop} />,
    );
    expect(getByLabelText('Lưu vào thư viện cá nhân')).toBeTruthy();
    expect(queryByText(/đồng cảm/i)).toBeNull();
  });

  it('"Tham khảo" calls onTamKhao when pressed', () => {
    const onTamKhao = jest.fn();
    const { getByLabelText } = render(
      <ParallelAnswerCardWithTamKhaoButton answer={PEER_ANSWER} onTamKhao={onTamKhao} />,
    );
    fireEvent.press(getByLabelText('Lưu vào thư viện cá nhân'));
    expect(onTamKhao).toHaveBeenCalledTimes(1);
  });

  it('shows "Đã lưu" when isSaved=true', () => {
    const { getByText } = render(
      <ParallelAnswerCardWithTamKhaoButton answer={PEER_ANSWER} onTamKhao={noop} isSaved />,
    );
    expect(getByText('Đã lưu')).toBeTruthy();
  });

  it('shows "Tham khảo" when isSaved=false (default)', () => {
    const { getByText } = render(
      <ParallelAnswerCardWithTamKhaoButton answer={PEER_ANSWER} onTamKhao={noop} />,
    );
    expect(getByText('Tham khảo')).toBeTruthy();
  });

  it('authorCurrentFocus shown as plain text — NOT a badge element', () => {
    const { getByText } = render(
      <ParallelAnswerCardWithTamKhaoButton answer={DANG_ANSWER} onTamKhao={noop} />,
    );
    // Focus text contains the practice state
    const el = getByText(/Đang luyện cấp 1 68%/);
    expect(el).toBeTruthy();
    // Style is a flat StyleSheet object (not an array) — has color prop
    const style = el.props.style;
    const colorValue =
      Array.isArray(style)
        ? style.find((s: Record<string, unknown>) => s && typeof s.color === 'string')?.color
        : (style as Record<string, unknown>)?.color;
    expect(typeof colorValue).toBe('string');
  });

  it('renders null focus gracefully when authorCurrentFocus=null', () => {
    const answerNoFocus: SelfInquiryAnswer = { ...DANG_ANSWER, authorCurrentFocus: null };
    const { queryByText } = render(
      <ParallelAnswerCardWithTamKhaoButton answer={answerNoFocus} onTamKhao={noop} />,
    );
    // No crash and no "undefined" or "null" text shown
    expect(queryByText('null')).toBeNull();
    expect(queryByText('undefined')).toBeNull();
  });
});
