---
title: "Home Energy Awakening Hero"
description: "Responsive video-based energy awakening for the homepage hero."
status: in-progress
priority: P1
branch: "claude/immortality-mobile-hybrid"
tags: [feature, frontend, video, performance, accessibility]
---

# Home Energy Awakening Hero

## Overview

Replace only the homepage hero visual. Preserve translated copy, settings, CTA labels, links, semantics, and navigation. Play one six-second awakening sequence, then hold its final frame.

## Architecture

- Keep `HomeEnergyHero` isolated from the Big Bang page.
- Select one native ratio per viewport: desktop 16:9, tablet/Fold 1:1, mobile 9:16.
- Prefer WebM with MP4 fallback and exact start/end WebP posters.
- Remove homepage canvas/GSAP duplication.
- Reduced motion renders only the end poster and requests no video.
- Media failure keeps the start poster, scrim, and CTA usable.

## Sequence

1. `0-1.2s`: stable cosmic field and chest pulse.
2. `1.2-3.2s`: energy travels through the body.
3. `3.2-4.8s`: radial burst stays locked to the anatomical chest.
4. `4.8-6s`: settle into the luminous final state; no loop.

## Files

- `apps/web/src/components/home/HomeEnergyHero.jsx`
- `apps/web/src/styles/home.css`
- `apps/web/public/landing/energy-hero/*`

## Phase

| Phase | Status |
|-------|--------|
| [Implement and validate](./phase-01-implement-and-validate.md) | In progress |

## Validation

- Compile: `pnpm run build:web`
- Browser: 1440×900, 768×1024, 390×844.
- Confirm correct source, `readyState=4`, no hero overflow, and usable CTA.
- Reduced motion: no `<video>` and no MP4/WebM request.
- Error path: poster/scrim/CTA remain.
- Console: no React/HomeEnergyHero warning.
