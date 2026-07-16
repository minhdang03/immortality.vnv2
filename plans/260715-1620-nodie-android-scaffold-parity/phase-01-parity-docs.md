---
phase: 1
title: "parity-docs"
status: pending
effort: 30m
priority: high
---

# Phase 1: parity-docs

## Context

- Brainstorm decision: Approach C — **1 file only**
- Report: `plans/reports/brainstorm-260715-1619-nodie-docs-parity.md`

## Overview

Tạo `docs/nodie/parity.md` — bộ nhớ solo dual-platform. Gộp bảng + Pending other OS + Contract bullets. Không tách 3 file.

## Requirements

- Path: `docs/nodie/parity.md`
- Seed rows cho Auth, Q&A list/detail/vote, Chat list/RT, Push, Feed UI, Journey UI, Profile
- Status legend: ✅ done · 🔲 partial/UI-only · ⬜ not started · — N/A
- Phản ánh thực tế iOS hiện tại: UI 6 màn, wire chưa xong → nhiều 🔲 iOS
- Android cột toàn ⬜ (trước phase 2–4)

## Implementation Steps

1. `mkdir -p docs/nodie`
2. Viết `parity.md` với:
   - Rule 2 dòng đầu: session start đọc / session end tick 1–5 dòng
   - Bảng matrix
   - `## Pending other OS` (empty hoặc seed từ iOS swipe 03a nếu muốn port sau)
   - `## Contract` bullets ngắn (keyset pagination, soft delete messages, is_broadcast RLS, device_tokens platform) — copy ý từ parent plan, không OpenAPI
3. Không tạo `CROSS-PLATFORM-LOG.md` / `api-contract.md` riêng

## Todo

- [ ] Create `docs/nodie/parity.md`
- [ ] Seed matrix accurate vs iOS today
- [ ] Contract bullets ≥5 lines useful for future wire

## Success Criteria

- [ ] File exists in git path `docs/nodie/parity.md`
- [ ] Agent reading only this file knows iOS is UI-ahead, Android empty
- [ ] <120 lines total

## Risks

| Risk | Mitigation |
|------|------------|
| Over-document | Cap length; no screenshots dump |
| Stale after scaffold | Phase 5 forces tick Android rows to 🔲 UI |

## Next

Phase 2 — Android project scaffold
