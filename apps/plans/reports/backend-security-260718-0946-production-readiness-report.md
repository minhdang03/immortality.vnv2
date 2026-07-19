# Audit backend, data, security — production readiness

Ngày: 18/07/2026. Phạm vi: Vercel API, Cloudflare Workers, Supabase/Auth/RLS/Edge Function, Firestore. Audit code + config; không deploy/ghi production.

## Verdict

**NO-SHIP nếu coi toàn bộ backend trong repo là một release thống nhất.** NODIE hiện dùng Supabase và web đang chạy Vercel; Cloudflare Workers là plane riêng, config production chưa tái lập được. Vì vậy placeholder Workers không tự động chặn NODIE, nhưng chặn mọi tuyên bố rằng Workers API/realtime/notion đã production-ready.

## Accepted findings

| ID | Severity | Status | Evidence | Failure / impact | Recommendation |
|---|---|---|---|---|---|
| BE-01 | **BLOCKER** | missing | `workers/wrangler.toml:112-143`, `workers/notion/wrangler.toml:45-52`, `workers/realtime/wrangler.toml:53-68` còn `REPLACE_WITH_*`, route API comment | Deploy production fail binding hoặc worker không có route | Chốt inventory worker đang dùng; provision ID/route/secrets; dry-run + staging smoke + prod read-only smoke |
| BE-02 | **BLOCKER** | broken/stale | `workers/api/package.json:2,7-9` package là `@btd/api`, config lại ở `workers/wrangler.toml`; `CLAUDE.md:216-218` gọi workspace cũ | Operator deploy nhầm config/worker; không tái lập được release | Một script canonical có `--config` + `--env`; CI dry-run xác nhận worker name/bindings/routes |
| BE-03 | **BLOCKER** | external/unverified | `apps/nodie-ios/plans/260717-2015-pre-appstore-submission/plan.md:61-75` ghi signup mở, captcha off, SMTP mặc định 2 mail/giờ | Bot signup/spam; confirm/reset nghẽn khi public | Custom SMTP + deliverability test; Turnstile E2E rồi bật server; rate/abuse monitor |
| BE-04 | **HIGH** | partial | `api/upload-from-url.js:84,123-141` không timeout; gọi `arrayBuffer()` rồi mới so `MAX_BYTES` | API key bị lộ/abuse có thể tải response rất lớn hoặc treo function | AbortController timeout; precheck Content-Length; stream với byte cap; rate limit/quota |
| BE-05 | **HIGH** | missing | `api/upload-file.js:48-95`, `upload-from-url.js:96-170` có auth/scope nhưng không rate limit; Worker agent plane cũng không quota | Key hợp lệ bị lộ có thể tạo cost/storage/DB load lớn | Rate limit theo key/IP, daily quota, R2 object quota, revoke/runbook, alert spike |
| BE-06 | **HIGH** | partial | `supabase/functions/push-on-message/index.ts:78-181`: input/DB errors không kiểm đầy đủ; `Promise.all` toàn token; failure body ép JSON | Một response lỗi có thể abort batch; fan-out lớn gây resource spike; mất push khó thấy | Validate method/payload; check every Supabase error; bounded concurrency; parse APNs body defensively; idempotency + alert |
| BE-07 | **HIGH** | partial | `supabase/migrations/0035_applied_migrations_ledger.sql`; các file 0036/0037/0039 tự ghi, nhưng `CLAUDE.md:220-227` vẫn apply psql tay; thiếu 0038 | Ledger cải thiện nhưng không đảm bảo checksum/order/prod parity; rollback khó | Migration runner canonical, checksum ledger, disposable DB CI, pre/post schema assertions, seed ledger riêng |
| BE-08 | **HIGH** | missing | Production là Vercel (`CLAUDE.md:181-194`), nhưng security headers chỉ ở `firebase.json:59-82`; live response 18/07 chỉ thấy HSTS | Web production thiếu CSP, nosniff, frame/referrer/permissions policy | Đồng bộ headers vào `vercel.json`; HTTP assertion trong CI |
| BE-09 | **HIGH** | partial | Terms cam kết report/block; `ChatDetailView.swift:914-950` chỉ reaction/reply/copy; backend có `reports`/`blocks` cho QA | Chat UGC không có đường moderation tại bề mặt vi phạm; App Review/trust risk | Nối report message + block author; moderation queue/SLA; test RLS user thường |
| BE-10 | **HIGH** | accepted risk | `PrivacyPage.jsx:42-45` công khai media có thể còn sau account delete; không thấy cleanup job | Xóa tài khoản không xóa toàn bộ Storage; retention/privacy mismatch | Xác định retention; cron/Edge Function cleanup orphan; audit log không chứa PII |
| BE-11 | **MEDIUM** | partial | Web/legacy dùng Firebase/Firestore; NODIE dùng Supabase; Worker có cả Firebase legacy và Supabase agent plane (`workers/api/src/index.ts:68-85`) | Source-of-truth và incident ownership không rõ; dễ sửa/deploy sai plane | Inventory route→client→database; deprecate/label legacy; owner + runbook theo plane |

## Adversarial adjudication

- **Accept BE-04:** auth không loại resource exhaustion từ key hợp lệ/bị lộ; size check xảy ra sau allocation.
- **Accept BE-06:** `Promise.all` reject-fast và `await res.json()` trên body không JSON là failure path cụ thể.
- **Accept BE-08:** live Vercel headers đã đo; Firebase policy không áp lên canonical production.
- **Reject cảnh báo cũ “mọi Firebase user là admin”:** `firestore.rules:22-42` hiện role-based qua `/admins/{uid}`.
- **Reject cảnh báo cũ “Firestore rules không deploy bằng CLI”:** `firebase.json:89-91` đã khai `firestore.rules`.
- **Reject build web fail do copy `functions/spa.html`:** lỗi audit do sandbox không được ghi ngoài workspace; `vite build` riêng exit 0.
- **Defer Workers placeholders đối với NODIE:** blocker của Worker services, không chứng minh NODIE Supabase đang hỏng.

## Positive evidence

- 3 Worker typecheck xanh; API 12/12, realtime 29/29, notion 42/42 — **83/83 unit tests pass**.
- Vercel API key chỉ lưu hash, kiểm format/revocation/scope (`api/_lib/auth.js:32-63`).
- Upload URL chặn private/loopback/metadata IP và re-resolve mỗi redirect (`api/upload-from-url.js:41-93`).
- Upload binary có allowlist MIME/intent và cap request body (`api/upload-file.js:33-76`).
- Worker dùng `secureHeaders`, explicit methods và auth middleware; Firestore rules đã role-based.
- Supabase có RLS/migration ledger, `push_failures`, `app_events`; source push đã lọc mute/block và phân môi trường APNs.

## Unresolved questions

1. Worker nào đang thật sự nhận traffic production, route/version nào?
2. Captcha, SMTP, APNs secrets và Edge Function hiện đã cấu hình ngoài repo chưa?
3. Supabase tier/backup/PITR và RPO/RTO chấp nhận là gì?
4. Ai sở hữu on-call/alert cho Vercel, Workers, Supabase và push tuần launch?

**Status:** DONE  
**Summary:** Backend có nền auth/RLS/test tốt, nhưng deployment inventory/config, public-auth abuse controls, push reliability và ops chưa đủ production.  
**Concerns/Blockers:** Console state không được xác minh; không deploy hoặc ghi production.
