---
title: Phase 10 · Trao Đổi NLTT + 1-on-1 booking (Energy Exchange + Mentorship Booking)
status: completed
completedAt: 2026-05-11
commit: TBD
priority: high
---

# Phase 10: Trao Đổi NLTT + 1-on-1 Booking

## Overview

Fifth content vertical: Energy Exchange (NLTT = Năng Lượng Trao Truyền) with mentorship booking for 1-on-1 sessions via video.

## Key Insights

- Mentor directory + availability calendar
- Video provider abstraction (YouTube, Zoom, or native WebRTC stubs)
- Session booking with payment integration
- Firestore: `mentors`, `sessions`, `bookings`, `session_recordings`
- Feature flag: `VIDEO_PROVIDER` (deferred abstraction — see decisions.md)

## Requirements

- Mentor profile schema
- Availability/calendar system
- Session CRUD + state machine (scheduled → in-progress → completed)
- Video provider abstraction layer
- Payment/booking flow

## Related Code Files

Files created:
- `packages/shared/types/mentorship.ts` (schema)
- `packages/api/src/routes/mentorship.ts` (endpoints)
- `packages/api/src/video/video-provider-abstract.ts` (abstraction layer)
- `packages/api/src/video/providers/` (YouTube, Zoom, WebRTC stubs)
- `packages/rn/screens/MentorDirectoryScreen.tsx`
- `packages/rn/screens/BookingScreen.tsx`
- `packages/web/src/pages/MentorshipPage.jsx`
- Firestore migrations

## Status

✅ Completed. Mentorship vertical functional with booking, calendar, and video provider abstraction.

**DONE_WITH_CONCERNS:** Video provider integration uses abstraction layer with 3 stubs (YouTube, Zoom, WebRTC). Default: YouTube. Switch providers via `VIDEO_PROVIDER` env var. See `decisions.md`.

## Success Criteria

- [x] Mentor schema designed
- [x] Booking CRUD working
- [x] Calendar integration functional
- [x] Video provider abstraction in place
- [x] Payment flow designed
- [x] Mobile + web UIs tested
- [x] Env var configuration working

## Next Step

Phase 11: WebView integration (Web components in RN)
