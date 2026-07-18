# Bất Tử Đạo / Immortality.vn — Project Guide

## Tổng quan

Platform song ngữ (VI/EN) về tâm linh — Bất Tử Đạo. **Monorepo pnpm workspaces** với:
- **Web:** Vite 5 + React 18 PWA → battudao.com (Vercel)
- **iOS:** `apps/nodie-ios` — SwiftUI **native**, không WebView, không RN
- **Android:** **CHƯA CÓ** — xem "Nền tảng" bên dưới trước khi hứa gì với ai
- **Backend:** Supabase (Postgres + Auth + Realtime + Storage) · Cloudflare Workers · Vercel functions (`api/`)

```
immortality-vn/  (pnpm monorepo root)
├── apps/
│   ├── web/              ← Vite + React 18 SPA + PWA  ← Vercel build cái này
│   └── nodie-ios/        ← NODIE, SwiftUI native (XcodeGen, không CocoaPods)
├── api/                  ← Vercel serverless functions (OG render, upload R2, agent CMS)
├── workers/
│   ├── api/              ← Hono REST API
│   ├── realtime/         ← Durable Objects WebSocket chat
│   └── notion/           ← Notion sync cron + Claude AI hỏi ngược
├── supabase/
│   ├── migrations/       ← NGUỒN SỰ THẬT của schema. Áp bằng psql TAY (xem dưới)
│   └── functions/        ← Edge Functions (push-on-message)
├── scripts/              ← Seed/migration + set-push-secrets.sh
├── functions/            ← Firebase Functions v2 (ogRenderer — legacy, còn deploy)
├── vercel.json           ← buildCommand: pnpm --filter @btd/web build
└── CLAUDE.md             ← FILE NÀY
```

**Main Stack:** Vite 5 + React 18 (web) · SwiftUI iOS 17 (NODIE) · Supabase · Cloudflare Workers · pnpm workspaces.

**Domain:** `https://battudao.com` (prod). Immortality.vn→EN, battudao.com→VI.

---

## Nền tảng — đọc trước khi tin bất kỳ tài liệu cũ nào

| Nền tảng | Trạng thái | Ghi chú |
|---|---|---|
| Web | ✅ sống | `apps/web` → battudao.com |
| iOS | ✅ sống | `apps/nodie-ios`, SwiftUI native |
| Android | ❌ **không tồn tại** | Không project, không gradle. **Chưa từng được dựng.** |

**Ba stack mobile đã GỠ HẲN (17/07/2026)** — đừng hồi sinh mà chưa hỏi Đăng:
- **Capacitor** (`ios/`, `capacitor.config.json`) — bỏ ~10 tuần trước.
- **Expo SDK 54 RN** (`apps/mobile`) — bỏ theo quyết định 2026-07-14: NODIE làm **native Swift/Kotlin kiểu Zalo**.
- **`packages/`** (firebase-config, shared, ui-tokens) — chỉ `apps/mobile` xài, chết theo.

Tài liệu/plan cũ nào còn tả "Expo 12 màn hình", "WebView cho content reuse", "EAS Build → Google Play"
là **mô tả một app đã bị xoá**. Lịch sử git giữ hết; cần thì lấy lại bằng tag.

**Android khi nào làm:** sau khi iOS 1.0 ổn. Dựng `apps/nodie-android` (Kotlin/Compose) — KHÔNG quay lại Expo/Capacitor.

---

## iOS — NODIE (apps/nodie-ios/)

SwiftUI native, iOS 17+. Dựng project bằng **XcodeGen** (`project.yml` là nguồn sự thật, `.xcodeproj`
sinh ra — thêm file mới phải chạy `xcodegen generate`). Không CocoaPods; phụ thuộc duy nhất là
supabase-swift qua SPM.

| Tab | Trạng thái |
|---|---|
| Hỏi đáp | ✅ Supabase thật — hỏi/đáp/reply lồng, ▲vote, ☀lit, "Hay nhất", sửa/xoá của mình |
| Chat | ✅ Supabase thật — kênh/DM, Realtime, ảnh/tệp/thoại, reply, reaction |
| Bạn bè | ✅ Supabase thật — `follows`, hồ sơ thành viên, tìm người |
| Cá nhân | ✅ Supabase thật — đóng góp của tôi, đã lưu, cài đặt |
| Bảng tin · Hành trình | 🚫 **rút khỏi tab bar** (`NodieTab.visibleTabs`) — còn chạy MockData, chưa có nguồn thật |

**Anti-pattern giữ nguyên:** không phân tầng người dùng (nhãn vai trò chỉ hiện với admin/mod),
không leaderboard giữa người với người. Metric nằm trên NỘI DUNG, không trên NGƯỜI.
Đăng = ngang hàng, không phải bề trên.

**Bẫy đã trả giá — đọc trước khi sửa iOS:**
- **Test bằng admin = không test gì.** 29 policy RLS có nhánh `or is_admin()`. Tài khoản admin ngắn
  mạch toàn bộ phân quyền và đã giấu 4 bug P0 (17/07). `NODIE_TEST_*` **phải** là tài khoản role='user'.
- **Build xanh không chứng minh gì về PostgREST.** Thêm embed thứ hai trỏ cùng một bảng → PGRST201,
  mọi dòng không tải được, mà Swift vẫn compile sạch. Đổi chuỗi `select` thì phải test bằng HTTP thật.
- **SourceKit trong editor hay báo bậy** "No such module 'Supabase'" / "Cannot find NodieColors" —
  nhiễu, chỉ tin `xcodebuild`.

**Deploy:** Archive → export → altool → TestFlight → App Store.

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

Pages hiện có: `home`, `articles`, `article/:slug`, `stories`, `khaitri`, `topic/:id`, `about`, `practice`, `contact`, `ungho`, `search`, `admin`, `privacy`, `terms` (2 trang pháp lý cho App Store — thêm 18/07, Terms phải khớp từng chữ `TermsOfUseView.swift` trong NODIE).

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

### Web (apps/web/) → battudao.com

**Vercel LÀ production.** (Tài liệu cũ ghi "Vercel: legacy, canonical = Firebase Hosting" — SAI, đã sửa
17/07. Đo bằng HTTP + Vercel API: battudao.com/immortality.vn đều là alias của deployment Vercel.)

| Cmd | Mô tả |
|---|---|
| `pnpm --filter @btd/web dev` | Vite dev, port 5173 |
| `pnpm --filter @btd/web build` | **Đúng lệnh Vercel chạy** → `apps/web/dist` |
| `pnpm install --no-frozen-lockfile` | Đúng lệnh install của Vercel |

**Deploy = push lên `main`.** Vercel tự build (Git integration, từ 17/07).
Trước đó deploy bằng `vercel --prod` TAY từ laptop — production không đến từ commit nào, không tái lập
được, không rollback được. Đừng quay lại kiểu đó.

**pnpm only.** Không `npm install` — `package-lock.json` ở root đã xoá (17/07) chính vì nó mời gọi
nhầm. Lock file duy nhất: `pnpm-lock.yaml`.

### iOS (apps/nodie-ios/)

| Cmd | Mô tả |
|---|---|
| `xcodegen generate` | **Bắt buộc sau khi thêm/xoá file** — không chạy thì build không thấy file mới |
| `./scripts/generate-secrets-xcconfig.sh` | Sinh `Config/Secrets.xcconfig` từ `.env` (gitignored) |
| `xcodebuild -project NODIE.xcodeproj -scheme NODIE -destination 'platform=iOS Simulator,name=iPhone 17' build` | Build |
| ... `test` | UITests — chạy bằng tài khoản THƯỜNG, xem `project.yml` |
| `scripts/run-uitest-gate.sh 3` | **Release gate**: full suite 3 lần liên tiếp, tự seed trước MỖI run (bắt buộc — vài test tiêu thụ trạng thái một lần). Máy phải nguội (load <8), không phiên nào khác đang build iOS. |

### Android

**Chưa tồn tại.** Không có lệnh nào. Xem mục "Nền tảng".

### Workers (workers/api, workers/realtime, workers/notion)

| Cmd | Mô tả |
|---|---|
| `pnpm -F @btd/workers-api run dev` | Wrangler dev, port 8787 |
| `pnpm -F @btd/workers-api run deploy` | Deploy to CF |
| `pnpm -F @btd/workers-realtime run dev` | Durable Objects dev |

### Supabase — migrations

**KHÔNG có `supabase_migrations.schema_migrations`.** CLI không theo dõi gì cả; migration áp bằng psql
TAY. ⇒ **Số thứ tự file không chứng minh nó đã chạy trên prod.** Muốn biết prod có gì thì hỏi prod:
```bash
psql "$SUPABASE_DB_URL" -c "select ... from pg_policies/pg_proc/pg_tables ..."
```
Luôn dry-run trong `begin; ... rollback;` trước khi `commit;`. Migration phải chạy lại được (idempotent).

**Firestore rules:** KHÔNG deploy bằng CLI. Phải paste vào Console.

---

## Service Worker (`public/sw.js`)

App có SW precache. Khi đổi assets có thể cần bump cache name. Convention hiện tại: `v1`, `v2`, … (xem commit `ef42e69 fix: bump SW cache name v1 → v2`). Nếu deploy mà user thấy stale UI → bump version.

---

## Architecture notes

### Layer 1 — UX
- **Web:** Vite + React SPA (PWA v3, manifest, FCM web push), lazy-loaded pages
- **Mobile:** SwiftUI **native** (NODIE, `apps/nodie-ios`) — KHÔNG WebView, KHÔNG RN.
  (Ba dòng cũ ở đây tả Expo RN + WebView + `packages/` shared — stack đã GỠ HẲN 17/07/2026,
  xem mục "Nền tảng" đầu file. Đừng thi công theo tài liệu tả stack đó.)

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
- Không commit `.env*`, không commit admin SDK key, **không commit mật khẩu tài khoản test**
  (đó là tài khoản THẬT trên prod, và đăng ký đang mở — dẫn tới `.env`, đừng chép giá trị).

### Git — trunk là `main`

- **`main` = trunk duy nhất, luôn deploy được.** Push lên `main` là ra thẳng battudao.com.
- Việc mới: cắt nhánh từ `main` → PR về `main`.
- Tài liệu cũ ghi "PR target: `claude/immortality-vite-react-ISIpv`" — **SAI, đã sửa 17/07**.
  Branch đó chết từ 09/05, kiến trúc khác hẳn (Vite ở root + Firebase, không có `apps/`).
  PR vào đó là PR vào một dự án không còn tồn tại.
- `claude/immortality-mobile-hybrid` là tên trunk **cũ** — tên mô tả chiến lược hybrid đã bị bỏ.
  Giữ tạm cho session đang chạy, sẽ xoá.

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
