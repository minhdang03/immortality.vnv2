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
├── api/                  ← Vercel serverless functions (OG render, upload R2, chat 503, live geo)
├── workers/
│   └── api/              ← Hono, chỉ còn plane agent /v1 (realtime + notion đã XOÁ 21/07)
├── supabase/
│   ├── migrations/       ← NGUỒN SỰ THẬT của schema. Áp bằng psql TAY (xem dưới)
│   └── functions/        ← Edge Functions (push-on-message)
├── scripts/              ← Migration Firestore→Supabase + set-push-secrets.sh
├── vercel.json           ← buildCommand: pnpm --filter @btd/web build
└── CLAUDE.md             ← FILE NÀY
# (functions/ Firebase ogRenderer đã XOÁ 21/07 — OG giờ ở api/og.js)
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

**Nhóm chat (Đăng ĐẢO quyết định 20/07/2026):** user thường **tạo được nhóm** — mô hình
Telegram/Zalo. Người tạo là quản trị (`channels.created_by` + `channel_members.role='mod'`),
nhiều quản trị được, chuyển giao chủ nhóm được (migration 0043: RPC `create_group`,
`transfer_group_owner`). Kênh `public`/`feed` vẫn chỉ admin tạo. Tài liệu/memory cũ nào ghi
"chỉ admin tạo nhóm" là quyết định đã bị đảo.

**Bẫy đã trả giá — đọc trước khi sửa iOS:**
- **Test bằng admin = không test gì.** 29 policy RLS có nhánh `or is_admin()`. Tài khoản admin ngắn
  mạch toàn bộ phân quyền và đã giấu 4 bug P0 (17/07). `NODIE_TEST_*` **phải** là tài khoản role='user'.
- **Build xanh không chứng minh gì về PostgREST.** Thêm embed thứ hai trỏ cùng một bảng → PGRST201,
  mọi dòng không tải được, mà Swift vẫn compile sạch. Đổi chuỗi `select` thì phải test bằng HTTP thật.
- **SourceKit trong editor hay báo bậy** "No such module 'Supabase'" / "Cannot find NodieColors" —
  nhiễu, chỉ tin `xcodebuild`.

**Deploy:** Archive → export → altool → TestFlight → App Store.

---

## Backend

**FIREBASE ĐÃ GỠ HẲN (21/07/2026).** Web + iOS đều chạy Supabase (Postgres + Auth + Realtime +
Storage). Không còn Firestore, Firebase Auth, Firebase Hosting, FCM. Tài liệu/plan cũ nào tả
"Firestore collections", "Firebase Auth token", "ogRenderer Cloud Function" là **mô tả kiến trúc
đã bị xoá** — xem plan `apps/plans/260721-1355-firebase-to-supabase-full-cutover/` + memory
[[project_web_firebase_to_supabase_cutover]].

Đã xoá trong cutover: `workers/realtime` (Firebase WS — chưa từng deploy), `workers/notion`
(cron sync Notion→Firestore), `functions/` (ogRenderer), `firebase.json`, `.firebaserc`,
`firestore.rules`, plane Firebase trong `workers/api`.

### workers/api/ — agent plane (Hono, Cloudflare Workers)
- **Chỉ còn `/v1/*`** — cho agent (goclaw) publish content. Auth = API key `btd_<hex>` (SHA-256
  hash lookup trong `public.api_keys`), scope enforcement, audit log `agent_audit_log`, zod
  validation, CORS allowlist. service_role bypass RLS by design.
- **Media:** R2 (shared bucket, project key prefix).
- Plane Firebase cũ (`/api/profiles|questions|votes|comments` với Firebase token + Firestore)
  đã bị cắt — iOS dùng thẳng Supabase, không qua worker.

### api/ (Vercel serverless)
- `api/og.js` — OG meta cho crawler, đọc `public.content` (Supabase REST, anon key) theo
  slug/id, cache `s-maxage=3600`. Thay `ogRenderer` Firebase.
- `api/upload-file.js`, `api/upload-from-url.js` — upload R2, auth API key `btd_`, SSRF defense.
- `api/chat.js` — **tắt tạm (trả 503)** 21/07: GoClaw proxy không auth = lỗ đốt quota. Bật lại
  khi có auth + rate-limit.
- `api/live-location.js` — coarse geo cho tính năng `/live` (live-visitors).

### Realtime chat
Chat NODIE chạy **Supabase Realtime** (không còn Durable Objects). Push qua Edge Function
`push-on-message` (pg_net → APNs) — xem `scripts/set-push-secrets.sh` (nhớ `--no-verify-jwt`).

---

## Supabase — nguồn sự thật dữ liệu

| Key | Value |
|---|---|
| Project ref | `dzctvmrlsxwkcuidsqzk` |
| Analytics | GA4 giữ lại (gtag.js, id ở `VITE_FIREBASE_MEASUREMENT_ID`=`G-NZ6ZX0RN4L` — env cũ, chỉ dùng cho GA4) |

Auth = Supabase Auth (email/password). Role ở `public.profiles.role` ('user'/'mod'/'admin');
đổi role bằng RPC `set_user_role` (admin-only, 0051) — KHÔNG sửa cột `role` trực tiếp (trigger chặn).

### Bảng chính (public schema)

| Bảng | Mô tả | Đọc | Ghi |
|---|---|---|---|
| `content` | Bài viết/story/khaitri (phân loại bằng cột `type`) | published: public | admin / agent `/v1` |
| `categories`, `translations`, `settings` | taxonomy, i18n, site config | public | admin |
| `comments` | Bình luận | `status='visible'` | anon tạo (ép `status='pending'`, 0051), admin duyệt |
| `contacts` | Form liên hệ | admin | anon tạo |
| `donations` | Ủng hộ | `status='approved'` | anon tạo pending, admin duyệt |
| `donation_contacts` | PII donor | admin | anon tạo |
| `newsletter_signups` | Đăng ký nhận tin (0051) | admin | anon tạo (dedupe unique `lower(email)`) |
| `agent_audit_log` | Log agent `/v1` | admin (0051) | service_role |
| `profiles` / `public_profiles` | Hồ sơ — `profiles` self-only RLS, `public_profiles` view đọc cross-user | | |

### Security model (RLS)

- **RLS bật trên mọi bảng public**, default-deny. `is_admin()` (SECURITY DEFINER) đọc
  `profiles.role`. Migration là nguồn sự thật, áp bằng psql tay (xem mục Supabase migrations).
- **Bẫy đã trả giá:** query hồ sơ NGƯỜI KHÁC phải dùng `public_profiles` (view), không `profiles`
  (self-only) — nếu không user thường thấy rỗng còn admin ngắn mạch RLS nên giấu lỗi.
- **Anon insert KHÔNG chain `.select()`**: RETURNING đòi hàng qua SELECT policy, mà comments/
  donations/contacts rows không anon-readable → RLS violation dù insert được phép.
- Bảng anon-insert có flood guard (0051) + `tg_rate_limit` (0046, bảng NODIE).

---

## Routing & SEO

SPA routing tự code bằng History API trong `src/App.jsx`. Page registry: `src/config/pages.js` (single source of truth — thêm page mới chỉ cần thêm 1 entry).

Pages hiện có: `home`, `articles`, `article/:slug`, `stories`, `khaitri`, `topic/:id`, `about`, `practice`, `contact`, `ungho`, `search`, `live`, `admin`, `privacy`, `terms` (2 trang pháp lý cho App Store — thêm 18/07, Terms phải khớp từng chữ `TermsOfUseView.swift` trong NODIE).

### OG meta (`api/og.js` trên Vercel)

Crawler (Facebook, Twitter, Zalo, Telegram, WhatsApp, Slack, Discord, Google, Bing…) bị
`vercel.json` rewrite các route `/story/*`, `/khaitri/*`, `/article/*`, `/articles/:slug`, `/live`
→ `api/og.js`. Function query `public.content` (Supabase, anon key) theo slug → render full OG meta
HTML; non-crawler trả `apps/web/dist/index.html`. `slug_redirects` lo link cũ đổi slug.
(`ogRenderer` Firebase cũ đã xoá — nó chỉ chạy trên `*.firebaseapp.com`, mà prod là Vercel.)

---

## Environment Variables

`.env` ở root (gitignored). Vite expose vars có prefix `VITE_`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_FIREBASE_MEASUREMENT_ID=G-NZ6ZX0RN4L   # CHỈ còn dùng cho GA4 (gtag.js), không phải Firebase SDK
```

Server-side (Vercel functions / workers / scripts): `SUPABASE_DB_URL`, `SUPABASE_SECRET_KEY`
(service role), `SUPABASE_ACCESS_TOKEN`, `SUPABASE_JWKS_URL`. Không còn Firebase admin SDK key.

Các biến `VITE_FIREBASE_*` khác (API_KEY, AUTH_DOMAIN, PROJECT_ID…) đã hết tác dụng sau cutover
21/07 — có thể còn trong `.env` cũ nhưng code không đọc nữa (trừ MEASUREMENT_ID cho GA4).

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

### Workers (workers/api — chỉ còn plane agent /v1)

| Cmd | Mô tả |
|---|---|
| `pnpm -F @btd/api run dev` | Wrangler dev, port 8787 |
| `pnpm -F @btd/api run typecheck` | `tsc --noEmit` |
| `pnpm -F @btd/api run deploy` | Deploy to CF |

### Supabase — migrations

Migration áp bằng **psql TAY** (CLI không tự theo dõi). Có bảng ledger `public._applied_migrations`
(ghi tay khi commit) — nhưng **số thứ tự file vẫn không chứng minh đã chạy**; muốn chắc thì hỏi prod:
```bash
psql "$SUPABASE_DB_URL" -c "select ... from pg_policies/pg_proc/pg_tables ..."
psql "$SUPABASE_DB_URL" -c "select filename from public._applied_migrations order by filename"
```
Luôn dry-run trong `begin; ... rollback;` trước khi `commit;`. Migration phải chạy lại được (idempotent).
Sau khi apply, `insert into public._applied_migrations(filename, note) ... on conflict do nothing`.

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

### Layer 3 — Backend (Supabase-first sau cutover 21/07)
- **Data + Auth:** Supabase (Postgres + RLS + Auth + Realtime + Storage). Web + iOS đọc/ghi thẳng.
- **Agent plane:** Cloudflare Worker `/v1/*` (Hono) — goclaw publish content, API key `btd_`.
- **OG/upload:** Vercel functions (`api/og.js` đọc Supabase, `api/upload-*` → R2).
- **Push:** Supabase Edge Function `push-on-message` (pg_net → APNs).
- **Media:** R2 with project key prefix (shared bucket).

### Layer 4 — Source of Truth
- **Content:** Supabase `public.content` (phân loại bằng cột `type`).
- **AI content pipeline:** goclaw qua Telegram → `/v1/content` → Supabase (xem memory [[project_content_pipeline_via_goclaw_telegram]]).

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

1. **Supabase migrations áp bằng psql tay** — file tồn tại ≠ đã chạy trên prod. Hỏi prod bằng psql. Dry-run trong `begin; … rollback;` trước. Migration phải idempotent. (Xem mục Supabase migrations.)
2. **Admin role qua RPC** — đổi `profiles.role` bằng `set_user_role` (admin-only), không UPDATE cột trực tiếp (trigger `tg_profiles_guard_role` chặn; bản 0051 đã sửa nó non-secdef để psql bootstrap được admin đầu tiên).
3. **`/api/chat` tắt tạm** — trả 503 (đóng lỗ GoClaw proxy không auth). Bật lại cần auth + rate-limit.
4. **pnpm only** — never `npm install`. Lock file is `pnpm-lock.yaml`, not `package-lock.json`.
5. **iOS IAP deferred** — App Store in-app purchases not yet integrated; subscription payment via web/SePay for now.
6. **Video provider TBD** — audio transcriptions + video hosting not chosen; placeholder for future.
7. **PWA icons** — kiểm `public/manifest.json` trước khi submit store (caveat placeholder cũ có thể đã cũ — icons đã có ở `public/icons/`).
8. **Không staging / backup** — dev + UITest seed chạy thẳng prod Supabase (1 project). Free tier chưa chắc có PITR. Ưu tiên tách staging + backup trước khi user tăng (xem audit 21/07).
9. **iOS chat/push** — Supabase Realtime + Edge Function `push-on-message`. Redeploy function PHẢI kèm `--no-verify-jwt` (trigger chỉ gửi `x-push-secret`), thiếu là push chết im lặng.
