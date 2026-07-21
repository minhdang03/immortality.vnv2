# Firebase → Supabase full cutover

Quyết định của Đăng 21/07: bỏ hẳn Firebase; migrate hết data; xoá code Firebase chết (kể cả workers/notion); chatbot TẮT tạm thời.

Trạng thái trước cutover: web đọc content/settings/translations/topics từ Supabase (flag `VITE_DATA_BACKEND=supabase` prod), auth web = Supabase, role = `profiles.role`. Còn trên Firestore: writes admin, comments, donations, contacts, newsletter, agent_log(cũ), analytics(firebase/analytics), FCM lib, og.js crawler, workers firebase plane.

## Phases

| # | Phase | Owner/Model | Status |
|---|---|---|---|
| 1 | DB migration 0051 + apply prod | Fable (main) — vùng bẫy RLS/prod | ✅ áp prod + 5 behavioral test đạt (role-clamp fix, pending-only, flood, dedupe, RPC). Chú ý: anon insert KHÔNG dùng `.select()` (RETURNING đòi SELECT policy) |
| 2 | Data migration Firestore→Supabase | Fable (main) | ✅ ĐÓNG — Đăng xác nhận 21/07 donations/contacts/newsletter/admins RỖNG, bỏ không migrate. Comments=0. Không cần SA key. Script giữ lại (`scripts/migrate-firestore-to-supabase.mjs`) phòng khi cần |
| 3 | Web cutover apps/web | Opus subagent (chết session-limit ở bước chót) + Fable làm nốt & review | ✅ zero firebase, mọi write→Supabase, anon insert KHÔNG .select(), RPC set_user_role, Header lang fix, chatbot OFF (CHATBOT_ENABLED=false). Build xanh, workers/api tsc xanh |
| 4 | api/ + repo cleanup | Opus subagent — cơ khí, Fable review og.js | ✅ og.js→Supabase (query verify prod OK, fallback cache hạ 300s), chat.js 503, xoá workers/realtime+notion+functions/+firebase configs, workers/api chỉ còn /v1. Fable dọn thêm: 19 scripts Firestore chết, vá --no-verify-jwt trong set-push-secrets.sh, CSP bỏ host firebase, backfill 1 slug khaitri |
| 5 | Verify: build, grep firebase=0, psql checks, review | Fable (main) | ✅ verify xong. ⚠ Commit/push CHỜ Đăng: tree đang lẫn việc song song (live-visitors, kim-cuong-distill, tiktok, nodie-ios) — App.jsx & og.js mang cả sửa của cutover LẪN live-visitors |

## Ownership (chống giẫm chân)
- Phase 3 agent: `apps/web/**` (kể cả ẩn ChatbotWidget), `apps/web/package.json`
- Phase 4 agent: `api/**`, `workers/**`, `functions/**` (xoá), root `firebase.json`/`.firebaserc`/`firestore.rules`, `vercel.json`, root `package.json`
- Fable: `supabase/migrations/**`, `scripts/**`, `.env`, prod psql, docs/CLAUDE.md cuối cùng

## Hợp đồng schema (agents code theo đây, không đoán)
- `comments`: insert anon `{content_id, author_name, body}` — `status` KHÔNG gửi (server ép 'pending'); đọc public = `status='visible'`; admin đọc/sửa hết.
- `newsletter_signups` (MỚI, 0051): `{id uuid default, email text unique not null, lang text, source text, created_at}`; anon insert; KHÔNG đọc từ client (dedupe = unique index, insert conflict → coi như thành công).
- `donations`: anon insert `{amount, channel, donor_name, message}` status mặc định 'pending'; public đọc approved; admin moderate. PII → `donation_contacts` {donation_id, real_name, email, phone} anon insert, admin-only đọc.
- `contacts`: anon insert {name, email, phone, message}; admin-only đọc.
- `agent_audit_log`: admin ĐỌC qua policy mới (0051).
- Roles: admin đổi `profiles.role` qua RPC `set_user_role(target uuid, new_role text)` (0051, admin-only).
- Analytics: GA4 qua gtag.js trực tiếp, id từ `VITE_GA_MEASUREMENT_ID` (fallback `VITE_FIREBASE_MEASUREMENT_ID`).

## Cần từ Đăng
- Firebase service-account JSON (Console → Project settings → Service accounts) để migrate collections admin-only (contacts, donation_contacts, newsletter, admins, donations pending). Collections public-read migrate được ngay bằng REST.

## Rollback
- Web: revert commit → Vercel redeploy bản cũ (Firestore data còn nguyên, không xoá).
- DB: migrations 0051-0052 additive + idempotent; không drop gì của NODIE.
