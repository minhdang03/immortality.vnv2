# Audit toàn nền tảng — NODIE iOS · Web battudao.com · Backend — 21/07/2026

3 audit song song (iOS, backend, web), read-only. Backend đã verify trực tiếp prod DB (SELECT qua `SUPABASE_DB_URL`): đủ 51 migrations trong `_applied_migrations`, RLS bật trên mọi bảng public. Web/iOS audit từ source; trạng thái Firestore rules deploy trên prod CHƯA verify được (probe bị chặn).

## TL;DR

- **iOS NODIE**: hoàn thiện tốt nhất — không P0, 5 P1, ~18 P2. Tab sống 85–95%.
- **Web**: nhiều lỗi thật đang chạy — 2 P1 code bug confirmed + 1 P0-cần-verify (rules prod).
- **Backend**: rủi ro lớn nhất nằm ở **datastore split** (web đọc Supabase, ghi Firestore) + **/api/chat không auth** + **không staging/backup**.

## P0 — verify ngay (1 việc, 5 phút)

| # | Vấn đề | Chi tiết |
|---|---|---|
| P0-1 | **Firestore rules đang deploy trên prod là bản nào?** | Repo `firestore.rules` đã role-based (isAdmin qua `/admins/{uid}`), nhưng rules chỉ deploy bằng paste tay vào Console. Hai kịch bản loại trừ nhau: (a) rules CŨ còn sống → mọi user Firebase Auth có full write + đọc PII (`donation_contacts`, `contacts`) = P0 thật; (b) rules MỚI đã sống → newsletter signup đang **hỏng hoàn toàn** (dedupe query ở `NewsletterBand.jsx:43` cần read mà rules chặn → mọi signup fail). Mở Firebase Console → Firestore → Rules, so với repo. |

## P1 — sửa sớm (xếp theo impact)

### Nhóm 1: Datastore split web (nguồn lỗi im lặng lớn nhất)

1. **Admin panel web ghi Firestore, site đọc Supabase** — `useArticles.js:38-44`, `useStories.js`, `useCRUD.js`, `useSiteSettings.updateSettings`, `useTranslations`. Sửa bài/settings trên web admin **không hiện trên prod** (chỉ đường goclaw→`/v1/content`→Supabase là hiện). Hoặc re-point writes sang Supabase, hoặc khoá tab content trong admin kèm thông báo.
2. **OG crawler đọc Firestore** — `api/og.js:97-140` quét collections Firestore; nội dung publish sau cutover → share FB/Zalo/Telegram ra card mặc định/stale. Port sang `public.content` (query 1 dòng theo slug) + thêm `Cache-Control: s-maxage`.
3. **Dual-fetch + cache poisoning** — `useArticles/useStories/useSiteSettings/useKhaiTri`: CẢ Supabase fetch lẫn Firestore onSnapshot chạy bất kể flag, ghi CÙNG cache key (`cached_articles`…) → snapshot Firestore (stale) đè cache, phí gấp đôi network + billing đọc Firestore mỗi visitor. Gate nhánh không active (mẫu đúng có sẵn ở `useTranslations.js:28`, `useTopics.js:24`).

### Nhóm 2: Lỗ hổng đang mở

4. **`/api/chat` = LLM proxy không auth** (`api/chat.js`) — proxy GoClaw bằng key server, origin check chỉ set header CORS chứ không reject, không rate limit, không cap payload. Ai biết URL là đốt quota thoải mái. Fix: Supabase JWT hoặc tối thiểu per-IP rate limit + cap + Turnstile (đã có `turnstile-embed.html`).
5. **Trigger 0032 chặn luôn đường phong admin** — `tg_profiles_guard_role` là SECURITY DEFINER (confirmed prod), clamp `role` khi `not is_admin()`; `auth.uid()` NULL trong psql/service_role → `UPDATE profiles SET role='admin'` qua psql là **no-op im lặng**. Sẽ dính đúng lúc cần phong mod đầu tiên. Fix theo mẫu 0047 (`current_user='authenticated'`), verify behavioral.
6. **Push pipeline chết im lặng** — lỗi HTTP của chính pg_net call (401 sai secret, function chưa deploy, 5xx) chỉ nằm trong `net._http_response` (tự purge sau vài giờ), không vào `push_failures`. Kèm bẫy: `scripts/set-push-secrets.sh:53` ghi lệnh redeploy **thiếu `--no-verify-jwt`** — làm theo là push chết kiểu đúng như trên. Fix comment + pin config + heartbeat/daily check.

### Nhóm 3: Hạ tầng

7. **Không staging** — dev + UITest seed chạy thẳng trên prod Supabase (1 project cho tất cả), đã có 9 user thật. Đúng item #1 trong lộ trình scale.
8. **Không backup** — free tier, không PITR, không dump script. Sự cố DB đầu tiên = mất trắng.

### Nhóm 4: Web UX bugs (confirmed, sửa nhanh)

9. **Toggle ngôn ngữ không persist** — `Header.jsx:107` truyền updater function vào prop nhận string → localStorage lưu source code của function, reload là reset về default; analytics event rác. Sửa 1 dòng.
10. **Không có trang 404** — `/foobar` render trang trắng HTTP 200 (soft-404 cho crawler). Thêm NotFound + fallback branch trong `App.jsx`.

### Nhóm 5: iOS P1

11. **Danh sách chặn hiển thị rỗng vĩnh viễn với user thường** — `QAStoreModeration.swift:112-115` query `profiles` (RLS self-only) thay vì `public_profiles` → "Chưa chặn ai" dù đang chặn; account admin che lỗi (bẫy quen thuộc). Verify RLS prod rồi đổi sang `public_profiles`.
12. **Outbox chat chỉ nằm RAM** — `ConversationStore.swift:163,617,720`: bubble ghi "Đang chờ mạng…" ngụ ý bền, nhưng kill app là mất hết tin đang chờ. Persist vào ChatDiskCache hoặc đổi label.
13. **▲vote/☀lit không optimistic** — `QAStore.swift:404-416` chờ server mới update UI (ngược với comment trong code); `toggleSave` đã có mẫu đúng.
14. **9 chuỗi chat-media chưa dịch** — `Localizable.xcstrings`: "Gửi ảnh", "Lưu ảnh về máy", "Chưa đọc"… batch media mới ship 0/8 ngôn ngữ; user non-VI thấy tiếng Việt. (Kèm: 9 key bị đánh dấu `stale` oan đang SỐNG — đổi sang `manual` trước khi ai đó purge.)
15. **Picker "Tin nhắn mới" không có ô search** — `NewMessageView.swift:35` directory limit(50) alphabet; quá 50 user là không DM được người ngoài danh sách follow. Reuse `FollowStore.search`.

## P2 đáng chú ý (chọn lọc)

**iOS**: reconnect realtime chỉ fetch 1 trang 50 (kẹt gap); edit message reset scrollback; empty-state kênh trống; false-empty flash ở QuestionDetail; Q&A chưa pagination (nổ ở thread hot); `setBest` double-tap bắn RPC đôi; blocked-ids chỉ load qua tab QA; push permission hỏi ngay không priming screen; hotline khủng hoảng hardcode VN/AU; email validate chỉ `contains("@")`.

**Web**: sitemap không có URL bài viết nào (long-tail vô hình với Google); RSS button fake (blob in-memory, link hash cũ); hreflang vô nghĩa (3 giá trị cùng 1 URL); canonical dính query string; search chỉ tìm articles (JSON-LD hứa hơn thế) + crash nếu doc thiếu title; footer "iOS app"/"Android app" href="#"; UI admin-ish (duyệt comment, inline edit) hiện với mọi user đăng nhập (`isAdmin = !!user`); SW background-sync là stub chết; CSP mới Report-Only; rate limit comments chỉ localStorage.

**Backend**: mod nhóm flip được `is_broadcast`/squat `slug` (0043 with-check chỉ pin kind); bảng anon-write web (`comments` với `status='visible'`!, `contacts`, `donations`…) chưa có flood control server-side — thành spam surface ngày web cutover writes; `device_tokens`/`blocks`/`app_events` ngoài `tg_rate_limit`; không retention (pg_cron chưa cài, 500MB free tier); hard DELETE messages vẫn cho phép (mất audit trail); **workers/api còn deploy plane Firebase chết** (routes ghi Firestore không ai đọc); `wrangler.toml` toàn placeholder ID nhưng worker đang live (không tái lập được deploy — đúng bẫy vercel-tay cũ); cron khai báo không có handler; workers/realtime = dead code; workers/notion sync vào Firestore mà site đọc Supabase (**quyết định nghỉ hưu là của Đăng — SP3, không tự quyết**); Firebase ogRenderer chết trên Vercel (CLAUDE.md lỗi thời); không monitoring; moderation chỉ có bảng `reports`, không queue/dashboard; không email transactional.

**Điểm tốt đã verify (không cần đụng)**: upload endpoints hardened (SSRF defense đủ tầng); `/v1/content` agent plane chuẩn (hashed key, scope, audit, zod); web XSS-clean (zero dangerouslySetInnerHTML); secrets đúng chỗ; PWA core sound; iOS accessibility thật sự tốt (61 labels, WCAG AA tokens, Dynamic Type); auth iOS 95% (PKCE reset, session graceful); account deletion đúng chuẩn App Store.

## Độ hoàn thiện ước tính

| Mảng | % | Ghi chú |
|---|---|---|
| iOS Chat | ~93% | outbox persistence là gap chính |
| iOS Q&A (gated) | ~85% | reactions không optimistic, chưa pagination |
| iOS Bạn bè | ~88% | DM picker cap 50, không refresh |
| iOS Cá nhân | ~90% | blocked-list query sai bảng |
| iOS Auth | ~95% | |
| iOS Feed/Hành trình | 10–15% | mock, đã rút khỏi tab bar — đúng trạng thái |
| Web đọc nội dung | ~85% | dual-fetch poisoning kéo xuống |
| Web admin/ghi | ~40% | ghi vào datastore site không đọc |
| Backend NODIE (RLS/push/rate-limit) | ~85% | push observability + vài guard gap |
| Hạ tầng vận hành | ~25% | không staging/backup/monitoring/moderation queue |

## Thứ tự đề xuất

1. **Verify Firestore rules prod** (P0-1) — quyết định A3 hay lỗ write đang mở.
2. **Vá `/api/chat`** — lỗ đốt tiền đang mở công khai.
3. **Datastore split**: og.js → Supabase; gate dual-fetch; quyết số phận admin writes.
4. **Backup + tách staging** — trước khi user tăng.
5. **iOS batch P1** (5 items) — 1 phiên là xong: blocked-list, outbox, optimistic reactions, i18n batch, DM search.
6. **Web quick wins**: lang persist (1 dòng), 404 page, sitemap động.
7. **Trigger 0032 + push runbook** — trước lần cần phong mod / rotate secret tiếp theo.

## Unresolved questions

1. Firestore rules bản nào đang sống trên prod? (Console check — chưa probe được.)
2. Có sync Firestore→Supabase nào cho content không, hay goclaw là write path duy nhất được công nhận?
3. `push-on-message` có đang deploy với `--no-verify-jwt`? (`supabase functions list` / dashboard.)
4. Firebase Auth sign-up còn mở không? (quyết mức độ nguy hiểm của Firebase plane chết trong workers/api.)
5. Supabase đang free tier hay Pro (PITR)? — quyết độ khẩn của backup.
6. workers api/realtime/notion thực tế có đang deploy không (repo toàn placeholder, không kết luận được).

## Lưu ý minh bạch

Web-audit agent có thử probe REST không auth vào Firestore prod (kể cả `donation_contacts`) để kiểm tra rules — probe **bị permission chặn**, không có dữ liệu PII nào được đọc, nên trạng thái rules prod vẫn là câu hỏi mở (P0-1).
