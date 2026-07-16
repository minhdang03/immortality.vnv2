---
phase: 4
title: "mock-screens-port"
status: pending
effort: 2h
priority: medium
---

# Phase 4: mock-screens-port

## Context Links

- iOS Features: `apps/nodie-ios/NODIE/Features/{Feed,QA,Conversations,Journey,Profile}/`
- Models: `Question.swift`, `Conversation.swift`, `MockData.swift`
- Anti-metrics (parent plan): no engagement vanity on people; strip expert/best/vote UI if product already removed — **match current iOS**, not old mockup screenshots

## Overview

Port **structure + MockData** so Android shows same sample content as iOS. Fidelity: usable mock, not pixel-perfect. Navigation: list → detail for Q&A and chat.

## Requirements

| Screen | Minimum |
|--------|---------|
| Feed | Projection prompt card OR attracted list stub (match iOS FeedView state) |
| Q&A list | Questions from MockData; tap → detail |
| Q&A detail | Body + answers list |
| Conversations | List rows; tap → chat bubbles |
| Journey | Balance / timeline stub from iOS JourneyView |
| Profile | Placeholder + logout stub (no auth) |

**Models:** Kotlin data classes mirror iOS fields needed by UI (id, title, body, answers…). Drop pure-Swift Color avatar gradients → use Color ints or brush.

## Architecture

```
models/Question.kt Answer.kt Conversation.kt ChatMessage.kt …
models/MockData.kt          // port sample strings 1:1 from iOS MockData
features/qa/QuestionListScreen.kt QuestionDetailScreen.kt
features/conversations/…
features/feed/…
features/journey/…
features/profile/…
// Nav: Navigation-Compose nested graphs OR simple when+backStack — KISS preferred
```

## Implementation Steps

1. Port data models + MockData strings (Vietnamese content keep identical)
2. Q&A list + detail first (highest value for future wire)
3. Conversations list + detail bubbles
4. Feed + Journey simpler stubs OK if time-box
5. Profile minimal
6. Update `parity.md`: Android UI rows → 🔲 for screens done

## Constraints

- No network
- No new product features beyond iOS mock
- File size: split screens if >200 lines (project rule)

## Todo

- [ ] MockData port
- [ ] Q&A list+detail navigable
- [ ] Chat list+detail navigable
- [ ] Feed + Journey + Profile at least stub
- [ ] parity.md Android ticks

## Success Criteria

- [ ] User can open app → Hỏi đáp → question detail → back → Hội thoại → chat
- [ ] Sample titles match iOS MockData (spot-check 2 questions)
- [ ] parity.md reflects Android 🔲 UI

## Risks

| Risk | Mitigation |
|------|------------|
| Scope creep pixel polish | Time-box; tokens already set identity |
| iOS MockData huge | Port questions+conversations first; trim feed if needed |

## Next

Phase 5 — session rules + verify build
