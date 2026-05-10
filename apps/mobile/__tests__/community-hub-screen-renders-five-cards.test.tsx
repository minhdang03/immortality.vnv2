/**
 * Tests: CommunityHubScreen renders all 5 không gian cards.
 */
import React from 'react';
import { render } from '@testing-library/react-native';

// Mock @react-native-firebase modules before importing screen
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

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(View, null, children),
    Path: () => null,
    Circle: () => null,
  };
});

import { CommunityHubScreen } from '../src/screens/community/community-hub-screen';

const EXPECTED_CARD_TITLES = [
  'Tự Khai Trí',
  'Đối thoại sâu',
  'Hỏi đáp · Forum Q&A',
  'Bay Cùng',
  'Trao Đổi Năng Lượng Trí Tuệ',
];

describe('CommunityHubScreen', () => {
  it('renders all 5 không gian cards', () => {
    const { getByText } = render(<CommunityHubScreen />);

    EXPECTED_CARD_TITLES.forEach((title) => {
      expect(getByText(title)).toBeTruthy();
    });
  });

  it('renders the screen header', () => {
    const { getByText } = render(<CommunityHubScreen />);
    expect(getByText('Cộng đồng Bất Tử Đạo')).toBeTruthy();
    expect(getByText('Mỗi người tự đi đường của mình.')).toBeTruthy();
  });

  it('renders the free tier chip', () => {
    const { getByText } = render(<CommunityHubScreen />);
    expect(getByText(/miễn phí/)).toBeTruthy();
  });

  it('contains no follower counts, badges, or online dots in rendered output', () => {
    const { queryByText } = render(<CommunityHubScreen />);
    // Anti-pattern assertions
    expect(queryByText(/follower/i)).toBeNull();
    expect(queryByText(/online/i)).toBeNull();
    expect(queryByText(/founder/i)).toBeNull();
    expect(queryByText(/badge/i)).toBeNull();
  });
});
