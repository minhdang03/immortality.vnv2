---
title: Phase 11 · WebView integration (Web components in RN)
status: completed
completedAt: 2026-05-11
commit: 7b15a70
priority: medium
---

# Phase 11: WebView Integration

## Overview

Embed web components (Vite SPA) inside React Native app via WebView. Enables code reuse between web and mobile for content-heavy pages.

## Key Insights

- `react-native-webview` for embedding
- Shared TypeScript types + components via monorepo
- Bridge between RN and WebView (postMessage API)
- Performance: lazy-load WebView pages, cache content
- Fallback: native RN screens for critical paths

## Requirements

- WebView setup + configuration
- Message bridge (RN ↔ WebView)
- Deep linking from WebView to RN
- Offline support
- Performance optimization

## Related Code Files

Files created:
- `packages/rn/screens/WebViewScreen.tsx` (WebView wrapper)
- `packages/rn/utils/webview-bridge.ts` (message bridge)
- `packages/web/src/components/WebViewHost.jsx` (detection)
- WebView security headers

## Status

✅ Completed. WebView integration functional with bidirectional messaging and deep linking.

## Success Criteria

- [x] WebView renders web content
- [x] Message bridge working (RN → Web)
- [x] Deep linking from WebView tested
- [x] Performance acceptable
- [x] Security headers in place
- [x] Offline caching enabled

## Next Step

Phase 12: Web PWA upgrade
