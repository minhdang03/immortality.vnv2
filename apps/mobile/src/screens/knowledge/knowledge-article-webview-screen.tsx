/**
 * knowledge-article-webview-screen.tsx
 * Single knowledge article via battudao.com/knowledge/:slug in AppWebView.
 * Route: HomeStack > KnowledgeArticle. Receives slug + title from navigation params.
 */
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { colors } from '../../theme';
import { AppWebView } from '../../components/webview/app-webview-with-auth-bridge';
import type { HomeStackParamList } from '../../types/navigation-types';

type KnowledgeArticleRoute = RouteProp<HomeStackParamList, 'KnowledgeArticle'>;
const BASE_URL = 'https://battudao.com/knowledge';
const HIDE_WEB_NAV_JS = `(function(){var s=document.createElement('style');s.textContent='nav,.bottom-nav,.site-footer,footer{display:none!important}';document.head.appendChild(s);})();true;`;

export function KnowledgeArticleWebViewScreen() {
  const navigation = useNavigation();
  const route = useRoute<KnowledgeArticleRoute>();
  const { slug } = route.params;
  const handleWebBack = useCallback(() => { if (navigation.canGoBack()) navigation.goBack(); }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppWebView
        uri={`${BASE_URL}/${encodeURIComponent(slug)}`}
        extraInjectedJs={HIDE_WEB_NAV_JS}
        onWebBack={handleWebBack}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  webview: { flex: 1 },
});
