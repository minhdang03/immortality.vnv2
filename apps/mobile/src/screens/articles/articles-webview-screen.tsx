/**
 * articles-webview-screen.tsx
 * Replaces Phase 5 placeholder — loads battudao.com/articles in AppWebView.
 * Read-only: no comment/admin routes accessible inside the WebView.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { AppWebView } from '../../components/webview/app-webview-with-auth-bridge';

const ARTICLES_URL = 'https://battudao.com/articles';
const HIDE_WEB_NAV_JS = `(function(){var s=document.createElement('style');s.textContent='nav,.bottom-nav,.site-footer,footer{display:none!important}';document.head.appendChild(s);})();true;`;

export function ArticlesWebViewScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppWebView uri={ARTICLES_URL} extraInjectedJs={HIDE_WEB_NAV_JS} style={styles.webview} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  webview: { flex: 1 },
});
