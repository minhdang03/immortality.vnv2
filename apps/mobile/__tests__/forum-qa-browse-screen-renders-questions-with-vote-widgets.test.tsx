/**
 * Tests: ForumQaBrowseScreen
 * 1. Renders 4+ question cards from MOCK_QUESTIONS
 * 2. Depth-tag filter chips present (🌱🌿🌳)
 * 3. Sort tabs present (Câu hỏi mới / Vote nhiều / Chưa giải / Của bạn)
 * 4. FAB "Đặt câu hỏi mới" present
 * 5. Anti-hierarchy: no follower count, no reputation, no follow button, no rank badge
 * 6. Depth tags appear on QUESTIONS — not as user-level labels
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Mocks ─────────────────────────────────────────────────────────────────────
// Firebase native modules must be mocked before ANY module that transitively
// imports firebase-auth-service (api-client → firebase-auth-service → @react-native-firebase/auth).

jest.mock('@react-native-firebase/app', () => ({ default: { app: () => ({}) } }));
jest.mock('@react-native-firebase/auth', () => {
  const mockAuth = () => ({
    currentUser: null,
    signInAnonymously: jest.fn(),
    onAuthStateChanged: jest.fn(() => jest.fn()),
  });
  mockAuth.EmailAuthProvider = { credential: jest.fn() };
  return { default: mockAuth };
});
jest.mock('@react-native-firebase/firestore', () => {
  const mockFirestore = () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ exists: false })),
        set: jest.fn(() => Promise.resolve()),
      })),
    })),
  });
  mockFirestore.FieldValue = { serverTimestamp: jest.fn() };
  return { default: mockFirestore };
});
jest.mock('../src/services/firebase-auth-service', () => ({
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
}));
jest.mock('../src/services/api-client', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(View, null, children),
    Path: () => null,
    Line: () => null,
    Polyline: () => null,
    Circle: () => null,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

// FlashList → plain ScrollView with rendered items for testability
jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { ScrollView } = require('react-native');
  return {
    FlashList: ({
      data,
      renderItem,
      ListEmptyComponent,
      ListFooterComponent,
    }: {
      data: unknown[];
      renderItem: (args: { item: unknown }) => React.ReactNode;
      ListEmptyComponent?: React.ComponentType | null;
      ListFooterComponent?: React.ComponentType | null;
    }) => {
      const items = data ?? [];
      return React.createElement(
        ScrollView,
        null,
        items.length === 0 && ListEmptyComponent
          ? React.createElement(ListEmptyComponent)
          : items.map((item, i) =>
              React.createElement(React.Fragment, { key: i }, renderItem({ item })),
            ),
        ListFooterComponent ? React.createElement(ListFooterComponent) : null,
      );
    },
  };
});

// Force dev-mock mode so no real API calls are made
jest.mock('../src/hooks/use-questions', () => {
  const original = jest.requireActual('../src/hooks/use-questions');
  const { MOCK_QUESTIONS } = original;
  return {
    ...original,
    useQuestions: () => ({
      data: { pages: [{ items: MOCK_QUESTIONS, nextCursor: null }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
    }),
  };
});

jest.mock('../src/hooks/use-vote-mutation', () => ({
  useVoteMutation: () => ({ mutate: jest.fn() }),
}));

jest.mock('../src/hooks/use-answers-mutation', () => ({
  useCreateQuestionMutation: () => ({ mutateAsync: jest.fn() }),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = makeQueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

import { ForumQaBrowseScreen } from '../src/screens/community/forum-qa/forum-qa-browse-screen';
import { MOCK_QUESTIONS } from '../src/hooks/use-questions';

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('ForumQaBrowseScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  it('renders 4 question cards from MOCK_QUESTIONS', () => {
    const { getAllByText } = render(
      <Wrapper><ForumQaBrowseScreen /></Wrapper>,
    );
    // Each question card shows the title — verify all 4 mock titles appear
    MOCK_QUESTIONS.forEach((q) => {
      // titles may be truncated but first 20 chars are distinctive
      expect(getAllByText(q.title).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders the screen header title "Hỏi đáp"', () => {
    const { getByText } = render(
      <Wrapper><ForumQaBrowseScreen /></Wrapper>,
    );
    expect(getByText('Hỏi đáp')).toBeTruthy();
  });

  it('renders subtitle with anti-FOMO copy', () => {
    const { getByText } = render(
      <Wrapper><ForumQaBrowseScreen /></Wrapper>,
    );
    expect(getByText(/Vấn đề/)).toBeTruthy();
  });

  it('renders all 4 sort tabs', () => {
    const { getByText } = render(
      <Wrapper><ForumQaBrowseScreen /></Wrapper>,
    );
    expect(getByText('Câu hỏi mới')).toBeTruthy();
    expect(getByText('Vote nhiều')).toBeTruthy();
    expect(getByText('Chưa giải')).toBeTruthy();
    expect(getByText('Của bạn')).toBeTruthy();
  });

  it('renders all depth-tag filter chips including 🌱🌿🌳', () => {
    const { getAllByText, getByText } = render(
      <Wrapper><ForumQaBrowseScreen /></Wrapper>,
    );
    expect(getByText('Tất cả')).toBeTruthy();
    // Multiple instances expected (filter chip + question cards both use emoji)
    expect(getAllByText(/🌱/).length).toBeGreaterThanOrEqual(1);
    expect(getAllByText(/🌿/).length).toBeGreaterThanOrEqual(1);
    expect(getAllByText(/🌳/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders FAB for composing a new question', () => {
    const { getByRole } = render(
      <Wrapper><ForumQaBrowseScreen /></Wrapper>,
    );
    const fab = getByRole('button', { name: 'Đặt câu hỏi mới' });
    expect(fab).toBeTruthy();
  });

  it('navigates to ForumQaDetail when a question card is pressed', () => {
    const { getByText } = render(
      <Wrapper><ForumQaBrowseScreen /></Wrapper>,
    );
    // Press the first question card via its title
    fireEvent.press(getByText(MOCK_QUESTIONS[0].title));
    expect(mockNavigate).toHaveBeenCalledWith('ForumQaDetail', {
      questionId: MOCK_QUESTIONS[0].id,
    });
  });

  // ── Anti-hierarchy assertions ──────────────────────────────────────────────

  it('contains no follower count, reputation score, or follow button', () => {
    const { queryByText } = render(
      <Wrapper><ForumQaBrowseScreen /></Wrapper>,
    );
    expect(queryByText(/follower/i)).toBeNull();
    expect(queryByText(/reputation/i)).toBeNull();
    expect(queryByText(/điểm uy tín/i)).toBeNull();
    expect(queryByText(/theo dõi/i)).toBeNull();
    expect(queryByText(/rank/i)).toBeNull();
    expect(queryByText(/level/i)).toBeNull();
  });

  it('shows author nicknames as plain peer text — no special Đăng badge', () => {
    const { getByText, queryByText } = render(
      <Wrapper><ForumQaBrowseScreen /></Wrapper>,
    );
    // Đăng's answer should appear as plain nickname, no founder/admin badge
    // (MOCK_QUESTIONS q1 is by Linh An, q3 by Thanh Phong — all plain text)
    expect(getByText(/Linh An/)).toBeTruthy();
    expect(queryByText(/founder/i)).toBeNull();
    expect(queryByText(/admin/i)).toBeNull();
    expect(queryByText(/creator/i)).toBeNull();
  });

  it('depth-tag chips are CONTENT filters — not user level selectors', () => {
    // The label copy must not say "của bạn", "trình độ", or "level"
    const { queryByText } = render(
      <Wrapper><ForumQaBrowseScreen /></Wrapper>,
    );
    // These user-level phrasings must NOT appear near the chips
    expect(queryByText(/trình độ của bạn/i)).toBeNull();
    expect(queryByText(/beginner/i)).toBeNull();
    expect(queryByText(/advanced user/i)).toBeNull();
  });
});

// ── DepthTagChip emoji test ────────────────────────────────────────────────────

import { DepthTagChip } from '../src/components/forum-qa/depth-tag-chip';

describe('DepthTagChip', () => {
  it('renders 🌱 for co-ban', () => {
    const { getByText } = render(<DepthTagChip depthTag="co-ban" />);
    expect(getByText(/🌱/)).toBeTruthy();
  });

  it('renders 🌿 for di-sau', () => {
    const { getByText } = render(<DepthTagChip depthTag="di-sau" />);
    expect(getByText(/🌿/)).toBeTruthy();
  });

  it('renders 🌳 for nang-cao', () => {
    const { getByText } = render(<DepthTagChip depthTag="nang-cao" />);
    expect(getByText(/🌳/)).toBeTruthy();
  });
});
