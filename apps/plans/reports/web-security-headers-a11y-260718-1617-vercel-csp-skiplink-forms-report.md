# Web security headers + a11y fixes — 18/07/2026 16:17

Nguồn: consolidated report 260718-0946, mục "High-priority web gaps". Chọn việc này vì cây file (web + vercel.json) tách biệt hoàn toàn với session đang chạy UITest gate 1933-04 + Turnstile 2015-05 (nodie-ios). Không đụng Swift source để không phá gate 3× của session kia.

## Đã làm

### 1. Security headers trên Vercel (`vercel.json`)
- **Enforce ngay:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (geo/mic/camera off), HSTS.
- **CSP ở chế độ `Content-Security-Policy-Report-Only`** — cố ý, để verify bằng console trước khi enforce. Policy đã build theo origin thật app gọi: googleapis/firebaseio (Firestore/Auth), googletagmanager + google-analytics (GA4 dynamic import), `*.supabase.co` https+wss, `*.r2.dev`, `*.workers.dev`, `images.weserv.nl`. Inline theme-bootstrap script whitelist bằng hash `sha256-OH6qtyrtBWGxfhQyBwOFYz3QqZ+Q5+iS1MlQXyIC+oo=` (tính từ `dist/index.html` sau build).
  - **Bẫy:** sửa inline script trong `apps/web/index.html` ⇒ hash đổi ⇒ phải tính lại (báo trong console vì đang report-only, không vỡ prod).
- **Cache headers** (trước chỉ có ở firebase.json, Vercel không nhận): `/assets/*` immutable 1 năm, `/sw.js` no-cache.

### 2. A11y web (`apps/web`)
- `App.jsx`: skip-link "Bỏ qua đến nội dung chính" (focusable đầu tiên, chỉ hiện khi focus) + `<main id="main">`; effect set `document.documentElement.lang` theo toggle VI/EN.
- `StoryList.jsx`: story item `div onClick` → `<button type="button">` (keyboard + SR access); arrow `›` aria-hidden. CSS reset UA button style trong `.story-item`.
- `ContactPage.jsx`: label sr-only + `name` + `autocomplete` cho 3 field; status sent/error bọc trong live region `aria-live="polite"` luôn render; error message chuyển sang i18n (`t.contactError` mới, VI+EN, thêm vào admin translation keys).
- `base.css`: utility `.sr-only`, `.skip-link`, global `prefers-reduced-motion: reduce` (tắt animation/transition + scroll-behavior auto).

### 3. Findings audit đã stale (không cần làm)
- `Header.jsx` "button/clickable div thay link" — đã fix ở commit `54353a8` (dùng `<a href>` + go()); audit chưa cập nhật.

## Verification
- `pnpm --filter @btd/web build` exit 0, 224 modules; `functions/spa.html` tự sync theo build script.
- `vercel.json` pass `python3 -m json.tool`.
- CSP hash tính từ dist thật sau build, không từ source.

## Việc còn lại (sau deploy)
1. Mở battudao.com, check console: nếu KHÔNG có CSP violation sau vài ngày dùng thật (admin panel, ủng hộ, search, PWA) → đổi `Content-Security-Policy-Report-Only` thành `Content-Security-Policy`.
2. `installCommand --no-frozen-lockfile` vẫn giữ nguyên — đổi sang frozen cần verify lockfile sync trước, ngoài scope lần này.
3. Web tests + CI gate: chưa có, vẫn là gap từ audit.

## Unresolved questions
1. Enforce CSP khi nào — Đăng muốn tự check console hay để em flip sau N ngày không violation?
2. `frame-ancestors 'none'` + XFO DENY chặn mọi embed battudao.com vào site khác — có use case embed nào cần giữ không (Zalo OA, FB iframe)?

**Status:** DONE
**Summary:** Vercel security+cache headers live (CSP report-only), 4 nhóm a11y fix cho web; build xanh.
**Concerns/Blockers:** CSP cần verify console trên prod trước khi enforce.
