/**
 * app-webview-with-auth-bridge.tsx
 * Reusable WebView wrapper with Firebase auth token injection + native bridge.
 * - Injects window.__BTD_RN__=true and window.btdNative stub
 * - Passes Firebase ID token via localStorage (same-origin only)
 * - Blocks non-battudao.com navigation, opens externals in system browser
 * - Handles postMessage: audioPlay, audioPause, audioResume, audioSkip,
 *   requestIdTokenRefresh, openExternal, back, bridgeHandshake
 * - Loading + error states with retry
 * Security: originWhitelist + onShouldStartLoadWithRequest enforced.
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Linking, Platform,
} from 'react-native';
import WebView, { type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';
import { colors, typography, fontSizes, spacing } from '../../theme';
import { getIdToken } from '../../services/firebase-auth-service';
import { loadQueueAndPlay, pause, play, seekRelative } from '../../services/audio-player-service';
import type { KhaiTriAudioTrack } from '../../services/audio-player-service';

const ALLOWED_HOSTS = ['battudao.com', 'immortality.vn'];
const BRIDGE_VERSION = 1;

export interface AppWebViewProps {
  uri: string;
  extraInjectedJs?: string;
  onWebBack?: () => void;
  style?: React.ComponentProps<typeof View>['style'];
  testID?: string;
}

type WebMessage =
  | { type: 'audioPlay'; payload: KhaiTriAudioTrack & { queue?: KhaiTriAudioTrack[]; queueIndex?: number } }
  | { type: 'audioPause' }
  | { type: 'audioResume' }
  | { type: 'audioSkip'; payload: { seconds: number } }
  | { type: 'requestIdTokenRefresh' }
  | { type: 'openExternal'; payload: { url: string } }
  | { type: 'back' }
  | { type: 'bridgeHandshake'; payload: { bridgeVersion: number } };

function buildBridgeScript(idToken: string | null): string {
  return `
(function() {
  if (window.__BTD_RN__) return;
  window.__BTD_RN__ = true;
  window.__BTD_BRIDGE_VERSION__ = ${BRIDGE_VERSION};
  function post(type, payload) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload || null }));
  }
  ${idToken ? `try { localStorage.setItem('btd_auth_token', ${JSON.stringify(idToken)}); } catch(e) {}` : ''}
  window.btdNative = {
    getIdToken: function() { return ${idToken ? JSON.stringify(idToken) : 'null'}; },
    openExternal: function(url) { post('openExternal', { url: url }); },
    audioPlay: function(track) { post('audioPlay', track); },
    audioPause: function() { post('audioPause', null); },
    audioResume: function() { post('audioResume', null); },
    audioSkip: function(seconds) { post('audioSkip', { seconds: seconds }); },
    back: function() { post('back', null); },
    requestIdTokenRefresh: function() { post('requestIdTokenRefresh', null); },
    _callbacks: {},
    subscribe: function(event, cb) { this._callbacks[event] = cb; },
    _emit: function(event, data) { if (this._callbacks[event]) this._callbacks[event](data); },
  };
  post('bridgeHandshake', { bridgeVersion: ${BRIDGE_VERSION} });
})();
true;
`;
}

function isAllowedHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch { return false; }
}

export function AppWebView({ uri, extraInjectedJs, onWebBack, style, testID }: AppWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    getIdToken().then((token) => {
      if (!cancelled) { setIdToken(token); setTokenReady(true); }
    }).catch(() => { if (!cancelled) setTokenReady(true); });
    return () => { cancelled = true; };
  }, []);

  const injectedJs = [buildBridgeScript(idToken), extraInjectedJs ?? ''].filter(Boolean).join('\n');

  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    let msg: WebMessage;
    try { msg = JSON.parse(event.nativeEvent.data) as WebMessage; } catch { return; }
    switch (msg.type) {
      case 'bridgeHandshake': {
        if (msg.payload.bridgeVersion !== BRIDGE_VERSION)
          console.warn(`[BTD Bridge] version mismatch: RN=${BRIDGE_VERSION} web=${msg.payload.bridgeVersion}`);
        break;
      }
      case 'audioPlay': {
        const { queue, queueIndex, ...track } = msg.payload;
        await loadQueueAndPlay((queue ?? [track]) as KhaiTriAudioTrack[], queueIndex ?? 0).catch(console.error);
        break;
      }
      case 'audioPause': await pause().catch(console.error); break;
      case 'audioResume': await play().catch(console.error); break;
      case 'audioSkip': await seekRelative(msg.payload.seconds).catch(console.error); break;
      case 'requestIdTokenRefresh': {
        const fresh = await getIdToken().catch(() => null);
        if (fresh && webViewRef.current)
          webViewRef.current.injectJavaScript(`window.btdNative&&window.btdNative._emit('tokenRefresh',${JSON.stringify(fresh)});true;`);
        break;
      }
      case 'openExternal': {
        const { url } = msg.payload;
        if (await Linking.canOpenURL(url)) await Linking.openURL(url);
        break;
      }
      case 'back': onWebBack?.(); break;
    }
  }, [onWebBack]);

  const handleShouldStartLoad = useCallback((request: WebViewNavigation): boolean => {
    const { url } = request;
    if (url === 'about:blank' || url.startsWith('data:')) return true;
    if (isAllowedHost(url)) return true;
    Linking.canOpenURL(url).then((can) => { if (can) Linking.openURL(url); });
    return false;
  }, []);

  const handleRetry = useCallback(() => { setHasError(false); setIsLoading(true); webViewRef.current?.reload(); }, []);

  if (!tokenReady) return <View style={[styles.centered, style]}><ActivityIndicator color={colors.gold} size="large" /></View>;

  if (hasError) return (
    <View style={[styles.centered, style]}>
      <Text style={styles.errorTitle}>Không tải được trang</Text>
      <Text style={styles.errorSub}>{errorMessage || 'Kiểm tra kết nối mạng và thử lại.'}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.7}>
        <Text style={styles.retryLabel}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const embedUri = (() => {
    try { const u = new URL(uri); u.searchParams.set('embed', 'mobile'); return u.toString(); }
    catch { return uri; }
  })();

  return (
    <View style={[styles.container, style]} testID={testID}>
      <WebView
        ref={webViewRef}
        source={{ uri: embedUri }}
        originWhitelist={['https://battudao.com','https://*.battudao.com','https://immortality.vn','about:blank']}
        injectedJavaScriptBeforeContentLoaded={injectedJs}
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onLoadStart={() => { setIsLoading(true); setHasError(false); }}
        onLoadEnd={() => setIsLoading(false)}
        onError={(e) => { setIsLoading(false); setHasError(true); setErrorMessage(e.nativeEvent.description ?? ''); }}
        onHttpError={(e) => { if (e.nativeEvent.statusCode >= 500) { setIsLoading(false); setHasError(true); setErrorMessage(`Lỗi máy chủ ${e.nativeEvent.statusCode}`); } }}
        sharedCookiesEnabled={true}
        scalesPageToFit={false}
        applicationNameForUserAgent="BTD-Mobile/0.1"
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        allowsAirPlayForMediaPlayback={true}
        textInteractionEnabled={false}
        androidHardwareAccelerationDisabled={false}
        testID={testID ? `${testID}-inner` : undefined}
        style={styles.webview}
        startInLoadingState={Platform.OS === 'android'}
      />
      {isLoading && Platform.OS === 'ios' && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  webview: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing[6], gap: spacing[4] },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  errorTitle: { fontFamily: typography.sansBold, fontSize: fontSizes.lg, color: colors.ink, textAlign: 'center' },
  errorSub: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkMuted, textAlign: 'center', lineHeight: fontSizes.sm * 1.6 },
  retryBtn: { backgroundColor: colors.gold, borderRadius: 8, paddingVertical: spacing[3], paddingHorizontal: spacing[6], marginTop: spacing[2] },
  retryLabel: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.sm, color: '#fff' },
});
