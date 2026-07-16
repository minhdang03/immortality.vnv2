# Bất Tử Đạo / Immortality.vn — Project Guide

## Tổng quan

Hybrid platform song ngữ (VI/EN) về tâm linh — Bất Tử Đạo. **Monorepo pnpm workspaces** (2026-05-10/11) với:
- **Web:** Vite 5 + React 18 PWA, Firebase Firestore CMS, Cloud Functions OG rendering
- **Mobile:** Expo SDK 54 React Native (iOS + Android), WebView cho content reuse
- **Backend:** Cloudflare Workers + Durable Objects (REST API + WebSocket chat)
- **Shared:** Common Firebase config, UI tokens, utilities (packages/)

```
immortality-vn/  (pnpm monorepo root — workspace setup)
├── apps/
│   ├── web/              ← Vite + React 18 SPA + PWA (swv3, manifest, FCM web push)
│   └── mobile/           ← Expo SDK 54 RN (12 screens, iOS + Android, WebView content)
├── workers/
│   ├── api/              ← Hono REST API (Firebase Auth, Firestore, profiles, Q&A, votes)
│   ├── realtime/         ← Durable Objects WebSocket chat (slow-mode, ephemeral TTL)
│   └── notion/           ← Notion sync cron + Claude AI hỏi ngược
├── packages/
│   ├── firebase-config/  ← Shared Firebase init (web + RN)
│   ├── shared/           ← Types, utils, hooks
│   └── ui-tokens/        ← Design tokens (colors, spacing, typography)
├── scripts/              ← Seed/migration (Node + Python) cho Firestore
├── functions/            ← Firebase Functions v2 (ogRenderer — legacy)
├── public/               ← Static assets (favicon, sw.js v3, og-image, manifest.json)
├── pnpm-workspace.yaml   ← Workspace definition
├── firebase.json         ← Hosting + functions config
├── firestore.rules       ← Security rules (KHÔNG auto-deploy)
├── vercel.json           ← Alt deploy target
└── CLAUDE.md             ← FILE NÀY
```

**Main Stack:** Vite 5 + React 18 (web), Expo 54 + RN 0.76 (mobile), Cloudflare Workers + Durable Objects (API), Firebase 12 (Firestore + Auth + Analytics), pnpm workspaces.

**Domain:** `https://battudao.com` (prod). Immortality.vn→EN, battudao.com→VI.

---

## Mobile App (apps/mobile/)

Expo SDK 54 React Native with 12 screens (iOS + Android). Anti-Buddhist UX (no tier segregation, no engagement metrics on people, Đăng = peer).

| Screen | Type | Features |
|---|---|---|
| Hub | Tab | Latest article, features, trending |
| Tự Khai Trí | Browse+Parallel | Content cards, filter by difficulty, parallel track UI |
| Tự Khai Trí AI | Interactive | Claude AI Q&A, context-aware suggestions |
| Đối thoại sâu | Browse+Thread | Question list, inline reply threads, read-all |
| Forum Q&A | Browse+Detail | Questions grid, detail page, vote system |
| Bay Cùng | Profile | User profile, activity, bio, follow (TBD) |
| Phá Nô Lệ | Modal/List | Self-liberation content, resources |
| Trao Đổi NLTT | Browse+Booking | Workshops, bookings, calendar integration |
| Knowledge Base | WebView | Embedded web articles (Firestore + rich text) |
| Practice Journal | Tab | Audio Khai Trí, journaling |
| Comments | Drawer | Inline comments on articles (async fetch) |
| AI Hỏi Ngược | Paid/Modal | 99K/tháng subscription, Claude-powered reflection |

**Tech:** Expo Router (file-based routing), @react-native-firebase (Firebase Auth + Firestore), Durable Objects WebSocket for chat, React Query for data, NativeWind for styling, expo-av for audio.

**WebView strategy:** Content (articles, teachings) rendered via WebView component pointing to `/article/:slug` on web app. Eliminates custom Swift/Kotlin; single source of truth for rich text.

**Deploy:** Apple TestFlight → App Store, Google Play Console (deferred: IAP framework TBD, video provider not chosen yet).

---

## Backend (workers/)

Cloudflare Workers + Durable Objects multi-workspace architecture.

### workers/api/ — REST API (Hono)
- **Endpoints:** Profiles (GET, PATCH), Questions (GET, POST), Answers (POST, DELETE), Votes (POST), Comments (GET, POST)
- **Auth:** Firebase Auth token validation, custom claims for admin/mods
- **Data:** Firestore REST client (no SDKs), R2 for media (shared bucket with project key prefix)
- **CORS:** Allow mobile + web origins, strict host check

### workers/realtime/ — WebSocket Chat (Durable Objects)
- **Protocol:** JSON messages, slow-mode (rate-limit 1msg/2sec), presence broadcast (anon user ID)
- **TTL:** 5-minute idle auto-close, no persistence (ephemeral chat only)
- **Use case:** Live "đối thoại sâu" threads, typing indicators, presence count

### workers/notion/ — Notion Sync + AI
- **Cron:** Daily sync from Notion database → Firestore articles + metadata
- **AI:** Claude API (skill btd-comment-facebook v0.2) — hỏi ngược on comments, auto-suggest responses
- **Flow:** Notion → Parse → Claude prompt → Firestore write

---

## Firebase

| Key | Value |
|---|---|
| Project ID | `immortalityvn` |
| Auth Domain | `immortalityvn.firebaseapp.com` |
| Storage Bucket | `immortalityvn.firebasestorage.app` |
| Messaging Sender ID | `204809901558` |
| App ID | `1:204809901558:web:169a7b3168a9d3d3a623d7` |
| Measurement ID | `G-NZ6ZX0RN4L` |

Services: **Firestore** (with IndexedDB persistent cache), **Auth** (Email/Password — admin login), **Analytics** (GA4).

### Firestore Collections

| Collection | Mô tả | Public read | Write |
|---|---|---|---|
| `articles` | Bài viết chính | ✅ | admin |
| `stories` | 37 câu chuyện | ✅ | admin |
| `khaitri` | Hỏi đáp Khai Trí | ✅ | admin |
| `topics` | Chủ đề/tags | ✅ | admin |
| `teachings` | Nội dung trang Giới Thiệu | ✅ | admin |
| `practices` | Thái Dương Quyền | ✅ | admin |
| `translations/{lang}` | i18n strings | ✅ | admin |
| `settings` | Site settings (theme, nav, home cards, donation channels…) | ✅ | admin |
| `comments` | Comments | ✅ | public create, admin update/delete |
| `contacts` | Form liên hệ | admin only read | public create |
| `donations` | Ủng hộ — chỉ `status='approved'` public-readable | ✅ approved only | public create pending, admin moderate |
| `donation_contacts` | PII của donor (email/phone/realName) | admin only | public create |

### Security model

- "Admin" hiện chỉ check `request.auth != null` — bất kỳ ai login Firebase Auth đều là admin (TODO: tighten bằng custom claims).
- `firestore.rules` **KHÔNG được auto-deploy**: `firebase.json` không có section `firestore`. Phải copy/paste thủ công vào Firebase Console → Firestore → Rules. Hoặc thêm `"firestore": { "rules": "firestore.rules" }` vào `firebase.json` để bật CLI deploy.

---

## Routing & SEO

SPA routing tự code bằng History API trong `src/App.jsx`. Page registry: `src/config/pages.js` (single source of truth — thêm page mới chỉ cần thêm 1 entry).

Pages hiện có: `home`, `articles`, `article/:slug`, `stories`, `khaitri`, `topic/:id`, `about`, `practice`, `contact`, `ungho`, `search`, `admin`.

### OG meta (Cloud Function `ogRenderer`)

Crawler (Facebook, Twitter, Zalo, Telegram, WhatsApp, Slack, Discord, Google, Bing…) bị `firebase.json` rewrite → `ogRenderer` function tại `functions/index.js`. Function fetch Firestore, render full OG meta HTML, trả non-crawler về `spa.html` (copy của `dist/index.html` lúc build — xem `npm run build` script).

Routes có OG render: `/article/**`, `/topic/**`, `/stories`, `/khaitri`, `/about`, `/practice`, `/articles`, `/contact`, `/search`.

`vercel.json` có alt setup dùng `/api/og` — dành cho khi host trên Vercel thay vì Firebase Hosting.

---

## Environment Variables

`.env` ở root (gitignored). Vite expose vars có prefix `VITE_`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=immortalityvn.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=immortalityvn
VITE_FIREBASE_STORAGE_BUCKET=immortalityvn.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=204809901558
VITE_FIREBASE_APP_ID=1:204809901558:web:169a7b3168a9d3d3a623d7
VITE_FIREBASE_MEASUREMENT_ID=G-NZ6ZX0RN4L
```

Admin SDK key (`*firebase-adminsdk*.json`) dùng cho scripts/seed — gitignored. Hiện có tại `src/immortalityvn-firebase-adminsdk-fbsvc-a75c1f4b0e.json` (đặt sai chỗ về mặt convention — nên ở `scripts/` chứ không trong `src/`, nhưng đã ignored nên không leak).

---

## Build & Deploy

### Web (apps/web/)

| Cmd | Mô tả |
|---|---|
| `pnpm run dev` | Vite dev, port 5173 |
| `pnpm run build` | `vite build` → `dist/` + copy → `functions/spa.html` (ogRenderer) |
| `pnpm run preview` | Preview prod build |
| `firebase deploy --only hosting,functions` | Deploy Firebase + functions |
| `firebase deploy --only functions:ogRenderer` | Deploy OG function only |

### Mobile (apps/mobile/)

| Cmd | Mô tả |
|---|---|
| `pnpm run dev` | Expo dev client (physical device/simulator) |
| `pnpm run build:ios` | EAS Build → TestFlight |
| `pnpm run build:android` | EAS Build → Google Play Console |
| `eas submit --platform ios` | Submit TestFlight → App Store |
| `eas submit --platform android` | Submit APK/AAB → Play Store |

### Workers (workers/api, workers/realtime, workers/notion)

| Cmd | Mô tả |
|---|---|
| `pnpm -F @btd/workers-api run dev` | Wrangler dev, port 8787 |
| `pnpm -F @btd/workers-api run deploy` | Deploy to CF |
| `pnpm -F @btd/workers-realtime run dev` | Durable Objects dev |

**Firestore rules:** KHÔNG deploy bằng CLI (xem section trên). Phải paste vào Console.

**Vercel:** Legacy — `vercel.json` cho backup. Canonical = Firebase Hosting.

---

## Service Worker (`public/sw.js`)

App có SW precache. Khi đổi assets có thể cần bump cache name. Convention hiện tại: `v1`, `v2`, … (xem commit `ef42e69 fix: bump SW cache name v1 → v2`). Nếu deploy mà user thấy stale UI → bump version.

---

## Architecture notes

### Layer 1 — UX
- **Web:** Vite + React SPA (PWA v3, manifest, FCM web push), lazy-loaded pages
- **Mobile:** Expo RN Router, WebView for articles/teachings (content reuse), native tabs
- **Shared:** UI tokens (colors, typography, spacing), Firebase config, utils
- **No custom Swift/Kotlin** — WebView eliminates platform-specific rich-text rendering

### Layer 2 — Content & Services
**Free tier (all platforms):**
- Hub (home feed), Tự Khai Trí (learning), Đối thoại sâu (Q&A threads), Forum Q&A, Bay Cùng (profiles), Phá Nô Lệ (resources), Trao Đổi NLTT (workshops), Knowledge base, Practice journal, Audio Khai Trí

**Paid tier (deferred):**
- AI Hỏi Ngược: 99K/tháng, Claude-powered reflection
- 1-on-1 with Đăng: 2-5tr (Khoá học deferred)

### Layer 3 — Backend
- **REST:** Cloudflare Workers (Hono), Firestore REST client (no JS SDK in Workers)
- **WebSocket:** Durable Objects ephemeral chat (5min idle TTL, no persistence)
- **Cron:** Notion sync + Claude AI hỏi ngược (daily)
- **Media:** R2 with project key prefix (shared bucket)
- **Auth:** Firebase Auth tokens → custom claims (admin, mod)

### Layer 4 — Source of Truth
- **Content:** Firestore collections (articles, teachings, Q&A)
- **Config:** Notion database (synced daily to Firestore)
- **AI:** Claude API (skill btd-comment-facebook v0.2)

**Anti-patterns rejected:**
- No Buddhist metaphor in UI (tone is peer-to-peer)
- No tier segregation visible (paid features don't demote free)
- ~~No engagement metrics on people~~ **Đảo 16/07/2026 (NODIE, theo design_handoff_nodie_v4):** hồ sơ thành viên hiện đủ thống kê — người theo dõi, % AI đánh giá, lần chiếu sáng, số bài. Vẫn không xếp hạng/leaderboard giữa người với người.
- Đăng = peer, not authority figure

---

## Quy ước

- Ngôn ngữ UI: VI + EN song ngữ.
- Plan tracking: `plans/YYMMDD-HHMM-kebab-name/` (xem `plans/` hiện có).
- Favicon: `public/favicon.*` — bắt buộc (rule từ workspace root).
- Git branch chính (PR target): `claude/immortality-vite-react-ISIpv` (xem git status đầu session).
- Không commit `.env*`, không commit admin SDK key.

---

## Known caveats

1. **Firestore rules không auto-deploy** — dễ quên update prod khi sửa `firestore.rules`. Cân nhắc thêm section `firestore` vào `firebase.json`.
2. **"Admin" check quá lỏng** — bất kỳ user nào login Firebase Auth đều có quyền write toàn bộ collections. Cần custom claim `admin=true` trước khi mở public sign-up.
3. **Admin SDK key trong `src/`** — không leak (gitignored) nhưng nên move sang `scripts/` cho đúng convention.
4. **pnpm only** — never `npm install`. Lock file is `pnpm-lock.yaml`, not `package-lock.json`.
5. **iOS IAP deferred** — App Store in-app purchases not yet integrated; subscription payment via web/SePay for now.
6. **Video provider TBD** — audio transcriptions + video hosting not chosen; placeholder for future.
7. **PWA icons placeholder** — `public/manifest.json` has stub icon paths; replace with actual before app store submission.
8. **Durable Objects costs** — realtime chat scales with users; test quota limits on production.
9. **Notion sync credentials** — Notion API key stored in Cloudflare env (not .env); ensure CF dashboard has correct key.
10. **WebView HTTPS only** — mobile WebView won't load http:// articles; dev environment must use https or localhost:3000.
