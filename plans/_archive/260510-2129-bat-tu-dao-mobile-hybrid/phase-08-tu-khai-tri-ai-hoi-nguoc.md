---
title: Phase 8 · Tự Khai Trí + AI hỏi ngược (Self-Inquiry + Reverse Questions)
status: completed
completedAt: 2026-05-11
commit: TBD
priority: high
---

# Phase 8: Tự Khai Trí + AI hỏi ngược

## Overview

Third content vertical: Self-inquiry practice where AI asks guiding questions to help user explore inner wisdom (Socratic method applied to spiritual practice).

## Key Insights

- AI role: guide, not answer-giver
- Prompt engineering: system prompt for Socratic questioning
- Session flow: user answer → AI follow-up question → loop
- Firestore: `self_inquiry_sessions`, `self_inquiry_reflections`
- Feature flag: `USE_STORE_KIT_IAP` (iOS in-app purchase deferred — see decisions.md)

## Requirements

- Inquiry session schema
- Prompt engineering for open-ended questions
- Session state management
- User reflection storage
- Analytics on inquiry depth

## Related Code Files

Files created:
- `packages/shared/types/inquiry.ts` (schema)
- `packages/api/src/routes/inquiry.ts` (endpoints)
- `packages/api/src/prompts/socratic-guide.ts` (prompt engineering)
- `packages/rn/screens/InquirySessionScreen.tsx`
- `packages/web/src/pages/SelfInquiryPage.jsx`
- Firestore migrations

## Status

✅ Completed. Self-inquiry vertical functional with AI-guided questioning.

**DONE_WITH_CONCERNS:** iOS IAP integration deferred via feature flag `USE_STORE_KIT_IAP` for later implementation. See `decisions.md`.

## Success Criteria

- [x] Inquiry schema designed
- [x] Session CRUD working
- [x] Socratic prompting functional
- [x] Question generation working
- [x] Reflection storage enabled
- [x] Mobile + web UIs tested
- [x] Feature flag in place

## Next Step

Phase 9: Bay Cùng + Phá Nô Lệ (Journey + Liberation)
