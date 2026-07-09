# Bất Tử Đạo Project Changelog

## [2026-07-08] /nang-luong Scroll Story v2 — Complete

### Fixed (bugs từ bản Codex)
- **Mobile lệch node/tia** — `object-fit: cover` crop hình nhưng overlay định vị theo % khung → thay bằng layer `.nl-art-fit` khoá đúng tỉ lệ artwork (cover tính bằng JS trong `use-step-camera.js`)
- **Explore mode bị đè** — rule mobile `.nl-art-col { position: absolute; inset: 0 }` không scope, leak vào `.nl-explore-grid` che mất nội dung → scope vào `.nl-stage`
- **Desktop lệch tia màn hình thấp/hẹp** — `.nl-art` fix height + max-width phá aspect-ratio → chuyển sang width-based `min(100%, (100dvh-96px)*2/3)` + aspect-ratio
- **Node 2-3-4 chồng số** — story mode chỉ hiện số ở node hiện tại; node đã qua = chấm sáng nhỏ; nudge vị trí tuyến tùng/yên vào trong đầu

### Added
- **10 hình cận cảnh per-step** (`public/nang-luong/steps/step-01..10.webp`, 768px, generate bằng Codex CLI cùng style artwork gốc) — crossfade trong card mỗi bước
- **Camera zoom mobile** — mỗi bước camera phóng vào tuyến đang sáng (`zoom` per-step trong data), node/tia counter-scale bằng `--cam-inv` để giữ kích thước
- **Bước 10 card đảo lên đỉnh** (`cardTop: true` + `focusY`) — nhường nửa dưới màn hình cho rễ sáng lan xuống lòng đất
- Card mobile bottom-sheet max-height 52dvh + tự cuộn; preload 10 hình khi scene vào viewport

### FX v2 (cosmic wow layer — cùng ngày)
- **Big bang intro**: flash + vòng nổ + sao bùng từ tâm khi vào trang (1.6s, chạy 1 lần)
- **Nền vũ trụ** `cosmic-backdrop.jsx`: 3 lớp sao parallax theo scroll, twinkle, sao vàng 18%, sao băng ngẫu nhiên, cuộn nhanh → sao kéo vệt hyperspace theo vận tốc
- **Nebula** trôi chậm (CSS radial, GPU) + god-rays xoay sau hero + title thở sáng
- **Sóng xung kích node**: mỗi bước kích hoạt bắn vòng lan + 14 tia lửa tại node (cả explore khi chạm)
- **Comet particles**: 5 hạt dẫn dòng có đuôi gradient dài
- **Ken-burns desktop**: artwork zoom 1→1.07 theo tiến trình (--story-p)
- **Card shine**: vệt sáng quét ngang card mỗi lần đổi bước
- **Finale**: vòng sóng vàng lan toả từ rễ (2 ring lệch pha) + reveal outro/mantra khi cuộn tới
- Perf: 61fps desktop viewport; reduced-motion tắt toàn bộ, vẽ sao tĩnh 1 frame

### v3 dark-cosmic + tinh gọn (cùng ngày, theo feedback Đăng)
- **Artwork vẽ lại toàn bộ (Codex CLI)**: master 1024x1536 + 10 hình bước, nền vũ trụ tối #0d1020 trùng background trang — hết cảnh "hình chữ nhật tách rời"; thêm mask tan mép trên .nl-art-img
- **Bỏ section Khám phá tự do** (ExploreMode.jsx + CSS + data ENERGY_OUTRO) và **bỏ outro Lợi ích/Lưu ý/mantra** — trang còn: big bang → hero → 10 bước → footer
- God-rays hero làm mềm (blur 14px, alpha 0.03, mask gắt) — hết sọc thô
- Card mobile gọn (media 92px, max-height 58dvh) — hết cắt chữ bước 2/3
- Căn lại toạ độ node 5-9 theo giải phẫu artwork mới

## [2026-05-11] Hybrid Mobile Bootstrap — Complete

### Major Changes
- **Monorepo restructure** — Flat project → pnpm workspaces (apps/web, apps/mobile, packages/, workers/)
- **Mobile app launch** — Expo SDK 54 React Native with 12 screens (iOS + Android)
- **Backend API** — Cloudflare Workers + Durable Objects multi-workspace architecture
- **PWA upgrade** — Service Worker v3, manifest.json, FCM web push support
- **Shared packages** — firebase-config, ui-tokens, shared utilities for code reuse

### Features Added

#### Mobile App (apps/mobile/)
- **Hub screen** — Feed of latest articles, features, trending topics
- **Tự Khai Trí** — Learning content with browse + parallel track UI
- **Tự Khai Trí AI** — Claude-powered Q&A and context-aware suggestions
- **Đối thoại sâu** — Question thread viewer with inline replies
- **Forum Q&A** — Questions grid, detail pages, vote system
- **Bay Cùng** — User profile screen with activity and bio
- **Phá Nô Lệ** — Self-liberation resources and content
- **Trao Đổi NLTT** — Workshop browsing and booking UI
- **Knowledge Base** — WebView embedded articles from Firestore
- **Practice Journal** — Audio playback and journaling interface
- **Comments** — Inline comment system on articles
- **AI Hỏi Ngược** — Paid feature modal (99K/tháng, deferred activation)

#### Web PWA Enhancements
- Service Worker v3 (improved caching strategy)
- manifest.json with app metadata and splash screens
- FCM web push notification support
- Offline fallback page
- Install banner UI

#### Backend Infrastructure
**workers/api/** — REST API (Hono framework)
- Profiles: GET, PATCH endpoints
- Questions: GET, POST endpoints with pagination
- Answers: POST, DELETE endpoints
- Votes: POST endpoint (question/answer voting)
- Comments: GET, POST endpoints
- Firebase Auth token validation
- Custom claims support (admin, mods)
- R2 media storage integration

**workers/realtime/** — WebSocket Chat (Durable Objects)
- Persistent connection for live chat
- Slow-mode rate limiting (1 message per 2 seconds)
- Ephemeral messages (5-minute idle TTL, no persistence)
- Anonymized user presence broadcast
- Typing indicators

**workers/notion/** — Content Sync + AI
- Daily cron job fetching Notion database
- Claude API integration (skill btd-comment-facebook v0.2)
- AI hỏi ngược feature (reflection suggestions)
- Automatic Firestore sync

#### Shared Packages
- **@btd/firebase-config** — Unified Firebase initialization (web + RN)
- **@btd/ui-tokens** — Design tokens (colors, spacing, typography)
- **@btd/shared** — Common types, hooks, utility functions

### Architecture Decisions
- **WebView strategy** — All Firestore-sourced content (articles, teachings) rendered via WebView component linking to web app routes. Eliminates custom Swift/Kotlin code; single source of truth.
- **pnpm workspaces** — Dependency management, shared packages, filtered builds (`pnpm -F @btd/workers-api run build`)
- **Cloudflare Workers** — REST API instead of Firebase Functions (lower latency, better DX)
- **Durable Objects** — Ephemeral chat (no persistence layer, fits "real-time only" use case)
- **Anti-Buddhist UX** — Rejected tiers visible in UI, no engagement metrics on people, Đăng as peer (not guru)

### Bug Fixes
- (None — greenfield release)

### Deprecations
- Firebase Capacitor iOS wrap (replaced with Expo)
- Vercel alt deployment (Firebase Hosting is canonical)

### Breaking Changes
- **Package manager change:** pnpm only; `npm install` will fail (lock file is `pnpm-lock.yaml`)
- **Monorepo structure:** Old flat layout no longer valid; must use workspace filters
- **Build commands:** Use `pnpm run` instead of `npm run` at root; use `pnpm -F {workspace} run` for per-workspace tasks

### Performance
- Mobile app initial load: <3sec on 4G (TBD after beta testing)
- Worker API response: <200ms p95 (TBD after load testing)
- WebSocket latency: <100ms (Durable Objects, TBD production)

### Tests
- **Total passing:** 150+ tests across all workspaces
  - Web: 40+ tests (React components, hooks, PWA)
  - Mobile: 60+ tests (screens, navigation, Firestore integration)
  - Workers: 30+ tests (API endpoints, auth, R2)
  - Shared: 20+ tests (utilities, types)
- **Coverage:** Core paths covered; UI coverage TBD in beta

### Known Issues
- **Video provider not chosen** — Placeholder for audio/video hosting decision
- **iOS IAP deferred** — Using SePay web payment instead of App Store In-App Purchases
- **PWA icons placeholder** — manifest.json has stub paths; requires brand assets
- **Durable Objects quota** — Realtime chat may hit free tier limits; pricing TBD
- **Notion API creds** — Must be stored in Cloudflare env secrets (not checked into git)

### Dependencies
- Expo SDK 54.0.0
- React Native 0.76.0
- Hono 4.x (Workers)
- Firebase SDK 12.x
- Cloudflare Workers + Durable Objects

### Documentation
- Updated CLAUDE.md with monorepo structure, mobile stack, workers architecture
- Created docs/development-roadmap.md (Phase 1 ✅, Phase 2-5 in planning)
- Created docs/project-changelog.md (this file)
- Created docs/system-architecture.md (4-layer architecture diagram)
- Created docs/code-standards.md (mobile + workers standards)

### Commits
See git log: 260510-2129 session (12 parallel agents)

### Next Steps
- **Phase 2 (2026-05-15):** Production deploy blockers
  - Cloudflare Workers deployment
  - Apple Developer Program + TestFlight setup
  - Google Play Console integration
  - SePay payment endpoint
  - Notion API credentials
  - Video provider selection
- **Phase 3 (2026-05-26):** Beta testing (50 users)
- **Phase 4 (2026-06-16):** App Store submission + public launch

---

## [2026-05-09] Home Mockup Alignment

### Changes
- Aligned home page carousel with Redesign Editorial Sacred v2 mockup
- Updated card spacing and typography
- Bug fixes on responsive layout

---

## [2026-05-08] Editorial Sacred Redesign

### Major Changes
- Redesigned article listing and detail pages (visual refresh)
- Improved content hierarchy
- Updated color palette and spacing

### New Files
- docs/redesign-mockup-editorial-sacred-v2.html
- docs/redesign-mockup-editorial-sacred.html (v1)

---

## [2026-05-03] Immortality Publisher Spec

### Major Changes
- Defined content publishing workflow
- Notion → Firestore sync specification
- OG image generation rules

---

## Versioning

This project follows semantic versioning for releases:
- **Major:** Breaking API changes, platform restructures (e.g., monorepo migration)
- **Minor:** New features, new screens, new API endpoints
- **Patch:** Bug fixes, performance improvements, documentation updates

Current working version: **2.0.0-beta** (post-monorepo restructure, pre-beta testing)

---

## Release Schedule

| Version | Phase | Estimated | Status |
|---|---|---|---|
| 2.0.0-beta | Hybrid bootstrap | 2026-05-11 | ✅ Released |
| 2.0.0-rc1 | Beta testing | 2026-06-01 | 🔄 Planned |
| 2.0.0 | Public launch | 2026-06-30 | ⏸️ Deferred |
| 2.1.0 | Paid features | 2026-07-30 | ⏸️ Deferred |
