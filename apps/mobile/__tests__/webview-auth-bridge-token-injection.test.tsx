/**
 * webview-auth-bridge-token-injection.test.tsx
 *
 * Tests that AppWebView correctly injects the Firebase ID token and bridge
 * script via injectedJavaScriptBeforeContentLoaded. Uses a View stub for
 * react-native-webview that stores the injected script in accessibilityHint
 * so tests can inspect it without a real browser environment.
 */

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(
      (props, ref) =>
        React.createElement(View, {
          testID: props.testID ?? 'webview',
          accessibilityHint: props.injectedJavaScriptBeforeContentLoaded,
          ref,
        }),
    ),
  };
});

jest.mock('@react-native-firebase/app', () => ({ default: { app: () => ({}) } }));
jest.mock('@react-native-firebase/auth', () => {
  const m = () => ({
    currentUser: { getIdToken: jest.fn().mockResolvedValue('test-token-xyz') },
    onAuthStateChanged: jest.fn(() => jest.fn()),
  });
  m.EmailAuthProvider = { credential: jest.fn() };
  return { default: m };
});
jest.mock('@react-native-firebase/firestore', () => {
  const m = () => ({ collection: jest.fn() });
  m.FieldValue = { serverTimestamp: jest.fn() };
  return { default: m };
});

jest.mock('../src/services/firebase-auth-service', () => ({
  getIdToken: jest.fn().mockResolvedValue('test-token-xyz'),
  signInAnonymously: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  saveNickname: jest.fn(),
  upgradeToEmailPassword: jest.fn(),
  fetchOrCreateProfile: jest.fn(),
}));

jest.mock('../src/services/audio-player-service', () => ({
  loadQueueAndPlay: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(undefined),
  play: jest.fn().mockResolvedValue(undefined),
  seekRelative: jest.fn().mockResolvedValue(undefined),
  MOCK_R2_BASE: 'https://r2.battudao.com/audio',
}));

jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn().mockResolvedValue(true),
}));

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AppWebView } from '../src/components/webview/app-webview-with-auth-bridge';

const BRIDGE_MARKERS = [
  'window.__BTD_RN__ = true',
  'window.btdNative',
  'window.ReactNativeWebView.postMessage',
  'bridgeHandshake',
];

describe('AppWebView — auth bridge injection', () => {
  it('renders without crashing for a battudao.com URL', async () => {
    const { getByTestId } = render(
      <AppWebView uri="https://battudao.com/articles" testID="wv" />,
    );
    await waitFor(() => expect(getByTestId('wv')).toBeTruthy());
  });

  it('injects bridge script containing all required markers', async () => {
    const { getByTestId } = render(
      <AppWebView uri="https://battudao.com/articles" testID="wv2" />,
    );
    const el = await waitFor(() => getByTestId('wv2'));
    const injected = el.props.accessibilityHint ?? '';
    for (const marker of BRIDGE_MARKERS) {
      expect(injected).toContain(marker);
    }
  });

  it('embeds the id token in localStorage.setItem call', async () => {
    const { getByTestId } = render(
      <AppWebView uri="https://battudao.com/articles" testID="wv3" />,
    );
    const el = await waitFor(() => getByTestId('wv3'));
    const injected = el.props.accessibilityHint ?? '';
    expect(injected).toContain('test-token-xyz');
    expect(injected).toContain("localStorage.setItem('btd_auth_token'");
  });

  it('produces safe script when token is null — no localStorage call with null', async () => {
    const svc = require('../src/services/firebase-auth-service');
    svc.getIdToken.mockResolvedValueOnce(null);

    const { getByTestId } = render(
      <AppWebView uri="https://battudao.com/articles" testID="wv4" />,
    );
    const el = await waitFor(() => getByTestId('wv4'));
    const injected = el.props.accessibilityHint ?? '';
    expect(injected).not.toContain("localStorage.setItem('btd_auth_token', null");
    expect(injected).toContain('window.__BTD_RN__');
  });

  it('renders without crashing for URLs with existing query params', async () => {
    const { getByTestId } = render(
      <AppWebView uri="https://battudao.com/khaitri?foo=bar" testID="wv5" />,
    );
    await waitFor(() => expect(getByTestId('wv5')).toBeTruthy());
  });
});
