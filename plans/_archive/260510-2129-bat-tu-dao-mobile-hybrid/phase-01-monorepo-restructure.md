---
title: Phase 1 · Monorepo restructure
status: completed
completedAt: 2026-05-11
commit: 08fc6cd
priority: critical
---

# Phase 1: Monorepo Restructure

## Overview

Restructure existing SPA (`@btd/web` Vite + React) into monorepo workspace supporting:
- Backend (CF Workers)
- React Native iOS app
- Shared utilities/types
- Shared UI components

## Key Insights

- Migrated from single-spa layout to pnpm workspaces
- Established naming convention: `@btd/*` scope
- Created workspace configuration with dependency hoisting
- Set up root-level build/deploy scripts

## Requirements

- Monorepo workspace support via pnpm
- Package naming with `@btd/` scope
- Separate build pipelines per package
- Root-level dependency management

## Related Code Files

Files modified:
- `package.json` (root workspace config)
- `.pnpmrc` (optional, for workspace tweaks)
- `pnpm-workspace.yaml` (workspace declaration)

Files created:
- `packages/web/` (Vite SPA)
- `packages/rn/` (React Native iOS)
- `packages/api/` (CF Workers backend)
- `packages/shared/` (utilities, types, UI)

## Status

✅ Completed. Monorepo structure now supports multi-package development with isolated builds and deployments.

## Success Criteria

- [x] Workspace bootstrapped with pnpm
- [x] `@btd/web`, `@btd/rn`, `@btd/api`, `@btd/shared` packages initialized
- [x] Root `package.json` scripts work (`pnpm run dev:web`, etc.)
- [x] CI/CD recognizes workspace structure

## Next Step

Phase 2: Backend API (CF Workers + Hono)
