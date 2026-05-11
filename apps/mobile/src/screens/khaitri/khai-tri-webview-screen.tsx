/**
 * khai-tri-webview-screen.tsx
 * Replaces Phase 5 placeholder — loads battudao.com/khaitri in AppWebView.
 * Read-only Q&A content. AI Socratic mirror is Phase 7 (native screen).
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { AppWebView } from '../../components/webview/app-webview-with-auth-bridge';

const KHAI_TRI_URL = 'https://battudao.com/khaitri';
const HIDE_WEB_NAV_JS = `(function(){var s=document.createElement('style');s.textContent='nav,.bottom-nav,.site-footer,footer{display:none!important}';document.head.appendChild(s);})();true;`;

export function KhaiTriWebViewScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppWebView uri={KHAI_TRI_URL} extraInjectedJs={HIDE_WEB_NAV_JS} style={styles.webview} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  webview: { flex: 1 },
});
