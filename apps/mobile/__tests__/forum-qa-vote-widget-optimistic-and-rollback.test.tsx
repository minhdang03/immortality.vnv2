/**
 * Tests: VoteUpWidget + useVoteMutation
 * 1. Optimistic +1 applied immediately on press
 * 2. Rollback restores previous count on API error
 * 3. hasVoted=true disables further presses (idempotency guard)
 * 4. 500ms cooldown prevents double-fire
 */
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(View, null, children),
    Path: () => null,
    Polyline: () => null,
    Line: () => null,
  };
});

// Mock apiClient — we control mutationFn behavior in individual tests
const mockPost = jest.fn();
jest.mock('../src/services/api-client', () => ({
  apiClient: { get: jest.fn(), post: mockPost, patch: jest.fn() },
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function Wrapper({ children, qc }: { children: React.ReactNode; qc: QueryClient }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

import { VoteUpWidget } from '../src/components/forum-qa/vote-up-widget';

// ── VoteUpWidget unit tests ────────────────────────────────────────────────────

describe('VoteUpWidget', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders vote count correctly', () => {
    const onVote = jest.fn();
    const { getByText } = render(
      <VoteUpWidget count={42} hasVoted={false} onVote={onVote} />,
    );
    expect(getByText('42')).toBeTruthy();
  });

  it('calls onVote when pressed and not already voted', () => {
    const onVote = jest.fn();
    const { getByRole } = render(
      <VoteUpWidget count={5} hasVoted={false} onVote={onVote} />,
    );
    const btn = getByRole('button');
    fireEvent.press(btn);
    expect(onVote).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onVote when hasVoted=true (idempotency guard)', () => {
    const onVote = jest.fn();
    const { getByRole } = render(
      <VoteUpWidget count={5} hasVoted={true} onVote={onVote} />,
    );
    const btn = getByRole('button');
    fireEvent.press(btn);
    expect(onVote).not.toHaveBeenCalled();
  });

  it('enforces 500ms cooldown — second press within 500ms is ignored', () => {
    const onVote = jest.fn();
    const { getByRole } = render(
      <VoteUpWidget count={5} hasVoted={false} onVote={onVote} />,
    );
    const btn = getByRole('button');
    fireEvent.press(btn);
    fireEvent.press(btn); // within cooldown window
    expect(onVote).toHaveBeenCalledTimes(1);
  });

  it('allows press after cooldown expires', () => {
    // Widget resets cooldown ref after 500ms — but hasVoted in the parent
    // would normally block. This tests the widget's raw cooldown only when
    // hasVoted stays false (simulate two distinct items sharing the widget).
    const onVote = jest.fn();
    const { getByRole } = render(
      <VoteUpWidget count={5} hasVoted={false} onVote={onVote} />,
    );
    const btn = getByRole('button');
    fireEvent.press(btn);
    act(() => { jest.advanceTimersByTime(600); });
    fireEvent.press(btn);
    // Both presses go through after cooldown
    expect(onVote).toHaveBeenCalledTimes(2);
  });
});

// ── Optimistic update + rollback integration test ─────────────────────────────

import type { Question, Answer } from '@btd/shared';

const QUESTION: Question = {
  id: 'q1',
  authorUid: 'uid-test',
  authorNickname: 'Test User',
  title: 'Test question',
  body: 'Test body',
  truc: 1,
  depthTag: 'co-ban',
  voteCount: 10,
  answerCount: 2,
  chosenAnswerId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const ANSWER: Answer = {
  id: 'a1',
  questionId: 'q1',
  authorUid: 'uid-other',
  authorNickname: 'Other User',
  body: 'Test answer',
  voteCount: 5,
  isChosen: false,
  createdAt: new Date().toISOString(),
};

describe('useVoteMutation — optimistic update and rollback', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it('applies optimistic +1 to question voteCount immediately', async () => {
    // Resolve slowly so we can see the optimistic state
    let resolvePost: (v: unknown) => void;
    mockPost.mockReturnValue(new Promise((res) => { resolvePost = res; }));

    const qc = makeQueryClient();
    qc.setQueryData(['question', 'q1'], { question: QUESTION, answers: [ANSWER] });

    // Import hook and use it directly via QueryClient
    const { useVoteMutation } = require('../src/hooks/use-vote-mutation');
    let mutate: ReturnType<typeof useVoteMutation>['mutate'];

    function HookCapture() {
      const m = useVoteMutation();
      mutate = m.mutate;
      return null;
    }

    render(<Wrapper qc={qc}><HookCapture /></Wrapper>);

    await act(async () => {
      mutate({ targetType: 'question', targetId: 'q1', questionId: 'q1' });
    });

    const optimistic = qc.getQueryData<{ question: Question }>(['question', 'q1']);
    expect(optimistic?.question.voteCount).toBe(11); // +1 applied

    // Settle the pending mutation
    resolvePost!({ newCount: 11 });
  });

  it('rolls back question voteCount on API error', async () => {
    mockPost.mockRejectedValue(new Error('Network error'));

    const qc = makeQueryClient();
    qc.setQueryData(['question', 'q1'], { question: QUESTION, answers: [ANSWER] });

    const { useVoteMutation } = require('../src/hooks/use-vote-mutation');
    let mutateAsync: ReturnType<typeof useVoteMutation>['mutateAsync'];

    function HookCapture() {
      const m = useVoteMutation();
      mutateAsync = m.mutateAsync;
      return null;
    }

    render(<Wrapper qc={qc}><HookCapture /></Wrapper>);

    await act(async () => {
      try {
        await mutateAsync({ targetType: 'question', targetId: 'q1', questionId: 'q1' });
      } catch {
        // expected
      }
    });

    const afterError = qc.getQueryData<{ question: Question }>(['question', 'q1']);
    // After rollback, voteCount should be back to original 10
    expect(afterError?.question.voteCount).toBe(10);
  });

  it('applies optimistic +1 to answer voteCount immediately', async () => {
    let resolvePost: (v: unknown) => void;
    mockPost.mockReturnValue(new Promise((res) => { resolvePost = res; }));

    const qc = makeQueryClient();
    qc.setQueryData(['question', 'q1'], { question: QUESTION, answers: [ANSWER] });

    const { useVoteMutation } = require('../src/hooks/use-vote-mutation');
    let mutate: ReturnType<typeof useVoteMutation>['mutate'];

    function HookCapture() {
      const m = useVoteMutation();
      mutate = m.mutate;
      return null;
    }

    render(<Wrapper qc={qc}><HookCapture /></Wrapper>);

    await act(async () => {
      mutate({ targetType: 'answer', targetId: 'a1', questionId: 'q1' });
    });

    const optimistic = qc.getQueryData<{ answers: Answer[] }>(['question', 'q1']);
    expect(optimistic?.answers[0].voteCount).toBe(6); // +1 applied

    resolvePost!({ newCount: 6 });
  });

  it('rolls back answer voteCount on API error', async () => {
    mockPost.mockRejectedValue(new Error('Network error'));

    const qc = makeQueryClient();
    qc.setQueryData(['question', 'q1'], { question: QUESTION, answers: [ANSWER] });

    const { useVoteMutation } = require('../src/hooks/use-vote-mutation');
    let mutateAsync: ReturnType<typeof useVoteMutation>['mutateAsync'];

    function HookCapture() {
      const m = useVoteMutation();
      mutateAsync = m.mutateAsync;
      return null;
    }

    render(<Wrapper qc={qc}><HookCapture /></Wrapper>);

    await act(async () => {
      try {
        await mutateAsync({ targetType: 'answer', targetId: 'a1', questionId: 'q1' });
      } catch {
        // expected
      }
    });

    const afterError = qc.getQueryData<{ answers: Answer[] }>(['question', 'q1']);
    expect(afterError?.answers[0].voteCount).toBe(5); // rolled back
  });
});
