---
phase: 1
title: "Implement and validate"
status: in-progress
priority: P1
effort: "4-6h"
dependencies: []
---

# Phase 1: Implement and validate

## Overview

Integrate the responsive video hero, then verify media selection, accessibility, performance, and fallback behavior.

## Requirements

- Functional: preserve copy/settings/CTA; select native desktop/tablet/mobile media and settle once.
- Non-functional: poster-first, responsive, reduced-motion safe, no coupling to the Big Bang page.

## Related Code Files

- Create: `apps/web/src/components/home/HomeEnergyHero.jsx`
- Modify: `apps/web/src/pages/core/HomePage.jsx`
- Modify: `apps/web/src/styles/home.css`

## Implementation Steps

1. Render poster-first video markup with WebM/MP4 sources and error fallback.
2. Select native responsive assets and react to viewport/reduced-motion changes.
3. Add namespaced scrims and responsive content placement without CLS.
4. Run build, browser matrix, CTA, reduced-motion, error and console checks.

## Success Criteria

- [x] Six-second energy-awakening sequence feels explosive, then calm.
- [x] Existing copy, settings, CTA labels/links, semantics unchanged.
- [x] Desktop/tablet/mobile/reduced-motion and error states pass.
- [ ] Final code review passes.

## Risk Assessment

Primary risks: text contrast during flash, mobile transfer size, autoplay restrictions, and destructive cropping. Mitigate with scrims, native ratios, muted inline playback, and exact poster fallback.
