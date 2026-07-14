---
title: Phase 9 · Bay Cùng + Phá Nô Lệ (Journey + Liberation)
status: completed
completedAt: 2026-05-11
commit: 1df46ca
priority: high
---

# Phase 9: Bay Cùng + Phá Nô Lệ (Journey + Liberation)

## Overview

Fourth content vertical: Multi-step transformative journey ("Bay Cùng" = Journey Together) with obstacles and liberation ("Phá Nô Lệ" = Break Free).

## Key Insights

- Linear progression with branching paths
- Challenges/obstacles presented with AI-guided solutions
- Gamification: badges, progress milestones
- Firestore: `journey_paths`, `journey_milestones`, `journey_user_progress`
- Video content support (deferred — see Phase 10)

## Requirements

- Journey path schema (linear + branching)
- Milestone tracking
- Challenge system
- Badge/reward system
- Progress visualization

## Related Code Files

Files created:
- `packages/shared/types/journey.ts` (schema)
- `packages/api/src/routes/journey.ts` (endpoints)
- `packages/rn/screens/JourneyMapScreen.tsx`
- `packages/rn/screens/MilestoneDetailScreen.tsx`
- `packages/web/src/pages/JourneyPage.jsx`
- Firestore migrations

## Status

✅ Completed. Journey vertical functional with milestones, challenges, and progress tracking.

## Success Criteria

- [x] Path schema designed
- [x] Milestone CRUD working
- [x] Challenge generation functional
- [x] Badge system implemented
- [x] Progress visualization working
- [x] Mobile + web UIs tested

## Next Step

Phase 10: Trao Đổi NLTT + 1-on-1 booking (Energy Exchange + Mentorship Booking)
