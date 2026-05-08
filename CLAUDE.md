# Bất Tử Đạo / Immortality.vn — Project Guide

## Tổng quan

Web app song ngữ (VI/EN) về tâm linh — Bất Tử Đạo. Vite + React 18 SPA, Firebase Firestore làm CMS, Cloud Functions render OG meta cho crawler, Capacitor wrap thành iOS app.

```
immortality-vn/
├── src/              ← Vite + React SPA (user + admin gộp 1 bundle)
├── functions/        ← Firebase Functions (ogRenderer — OG/Twitter card cho crawler)
├── api/              ← Vercel serverless OG endpoint (alt deploy target)
├── scripts/          ← Seed/migration scripts (Node + Python) cho Firestore
├── ios/              ← Capacitor iOS wrap (com.immortality.app)
├── public/           ← Static assets, favicon, sw.js, og-image
├── firebase.json     ← Hosting + functions config
├── firestore.rules   ← Security rules (KHÔNG auto-deploy — copy thủ công)
├── vercel.json       ← Vercel rewrites (alt host)
├── capacitor.config.json
└── CLAUDE.md         ← FILE NÀY
```

**Stack:** Vite 5 + React 18 (no SSR, no Next), Firebase 12 (Firestore + Auth + Analytics), Capacitor 8, Firebase Functions Node 20.

**Domain:** `https://battudao.com` (prod). Đang ở `immortality.vn` để switch ngôn ngữ mặc định EN.

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

| Cmd | Mô tả |
|---|---|
| `npm run dev` | Vite dev server, default port `5173` |
| `npm run build` | `vite build` → `dist/` + copy `dist/index.html` → `functions/spa.html` (cho ogRenderer) |
| `npm run preview` | Preview prod build |
| `firebase deploy --only hosting,functions` | Deploy chính |
| `firebase deploy --only functions:ogRenderer` | Chỉ deploy OG renderer |

**Firestore rules:** KHÔNG deploy bằng CLI (xem section trên). Phải paste vào Console.

**iOS:** `npx cap sync ios && npx cap open ios` → build qua Xcode.

**Vercel:** Có `vercel.json` cho alt deploy. Hiện chưa rõ là active production hay backup.

---

## Service Worker (`public/sw.js`)

App có SW precache. Khi đổi assets có thể cần bump cache name. Convention hiện tại: `v1`, `v2`, … (xem commit `ef42e69 fix: bump SW cache name v1 → v2`). Nếu deploy mà user thấy stale UI → bump version.

---

## Architecture notes

- **No backend service.** Web đọc/ghi Firestore trực tiếp (KHÔNG giống `fly0-app` có API layer). Tất cả business logic ở client + security rules.
- **Admin nằm chung bundle với user app** — `/admin` route render `<AdminPanel>` lazy-loaded. Auth check là `user != null` từ Firebase Auth.
- **Hooks pattern:** mỗi collection có 1 hook (`useArticles`, `useStories`, `useKhaiTri`, …) wrap quanh `useFirestoreSWR` + `useCRUD`. Đừng gọi Firestore trực tiếp trong components — dùng hooks.
- **i18n:** strings ở Firestore `translations/{lang}`, fallback static. Domain-based default lang: `immortality.vn` → EN, `battudao.com` → VI. User toggle lưu `localStorage.lang`.
- **Theme:** `useTheme(siteSettings?.defaultTheme)` — admin set default qua settings, user override lưu local.
- **Code-splitting:** mọi page `lazy()` import; Firebase + React tách chunk riêng (xem `vite.config.js`).

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
4. **Hai deploy target song song** (Firebase Hosting + Vercel) — clarify cái nào là canonical, tránh divergence trong `vercel.json` vs `firebase.json` rewrites.
