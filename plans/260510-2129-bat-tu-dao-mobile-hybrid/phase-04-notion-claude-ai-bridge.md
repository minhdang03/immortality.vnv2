---
title: Phase 4 · Notion + Claude AI bridge
status: completed
completedAt: 2026-05-11
commit: 1f95413
priority: high
---

# Phase 4: Notion + Claude AI Bridge

## Overview

Integrate Notion as content source for teachings/articles. Claude API generates AI responses for Q&A features.

## Key Insights

- Notion API for syncing block database to Firestore
- Claude API (via Anthropic SDK) for realtime responses
- Async background job for content sync
- Caching to minimize API calls

## Requirements

- Notion API credentials
- Claude API (goclaw or direct Anthropic)
- Content sync job (scheduled or webhook-triggered)
- Prompt engineering for dialogue contexts

## Related Code Files

Files created:
- `packages/api/src/integrations/notion-sync.ts` (Notion client)
- `packages/api/src/integrations/claude-bridge.ts` (Claude API wrapper)
- `packages/api/src/jobs/sync-notion-content.ts` (background sync)

## Status

✅ Completed. Notion syncing and Claude integration operational.

## Success Criteria

- [x] Notion database synced to Firestore
- [x] Claude API calls working
- [x] Response caching in place
- [x] Sync job scheduled
- [x] Error handling + retry logic

## Next Step

Phase 5: React Native scaffold
