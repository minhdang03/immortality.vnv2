# Audit UX/UI, khả năng đọc, analytics & AI agent — Bất Tử Đạo

Ngày: 2026-07-10  
Phạm vi: `battudao.com`, `apps/web`, analytics, admin CMS, agent APIs  
Phương pháp: source review + bundle production + Chrome headless desktop/mobile. Không đăng nhập, không mutation.

## Kết luận

| Hạng mục | Đánh giá | Kết luận |
|---|---:|---|
| Đọc bài mobile | 7/10 | Body tốt; metadata, toolbar, widget che chữ cần sửa |
| Đọc bài desktop | 6/10 | Cột đọc tốt; font bị thu nhỏ hơn mobile, semantic yếu |
| Màu dark mode | 8/10 | Text chính/phụ đạt tương phản |
| Màu light mode | 5/10 | Muted/gold nhỏ không đạt WCAG AA |
| Accessibility | 4/10 | Điều hướng button, focus menu ẩn, thiếu nhãn/focus/skip |
| Analytics production | 3/10 | GA4 macro có; micro-reading/dashboard chưa live |
| AI agent quản trị | 4/10 | Legacy API live; review/publish, audit, control plane chưa kín |

## P0 — cần sửa trước

1. **Mở URL bài viết trực tiếp bị kẹt skeleton.**
   - Production, phiên sạch: sau 10 giây vẫn `h1=null`, 36 skeleton.
   - Đi từ trang chủ vào bài thì tải được.
   - Logic ngừng retry khi Firestore vừa chuyển sang fresh: `apps/web/src/App.jsx:161-173`.
   - Ảnh hưởng: link share, SEO landing, AI agent preview, người đọc từ Facebook/Zalo.

2. **Light mode thiếu tương phản ở text nhỏ.**
   - `--ink-muted #8a8273` trên `#f8f3ea`: **3.44:1**; trên card trắng: **3.80:1**.
   - `--gold #b08642` trên `#f8f3ea`: **3.00:1**.
   - Chuẩn normal text: 4.5:1. Tokens: `apps/web/src/styles/base.css:63-77`.
   - Bị dùng ở ngày, thời gian đọc, nav, summary, breadcrumb, footer; thường chỉ 10–13px.
   - Gợi ý: muted `#756d60` (4.62:1), gold text `#8a672f` (4.68:1); giữ gold sáng cho nền/decoration.

3. **Mobile có UI che nội dung đọc.**
   - Chatbot FAB 52px nằm trên đoạn văn; ảnh production 390×844 xác nhận.
   - PWA install banner `z-index:900`, fixed bottom; bottom nav `z-index:100` → banner che navigation sau 30 giây.
   - Files: `styles/chatbot.css:2-15,83-88`; `pwa-install-and-push-ui.css:6-31`; `bottom-nav.css:2-15`.

4. **Menu mobile đóng nhưng vẫn focus được.**
   - `opacity:0` + `pointer-events:none` không loại controls khỏi keyboard/accessibility tree.
   - Production snapshot thấy toàn bộ menu ẩn vẫn là interactive elements.
   - Thiếu `inert`/`visibility`, focus trap, Escape, scroll lock, `aria-expanded`, `aria-controls`.
   - Files: `Header.jsx:51-70`; `overlay.css:2-15`.

5. **Analytics Supabase sẽ lộ aggregate nếu bật.**
   - 3 RPC là `SECURITY DEFINER`, grant cho toàn bộ `authenticated`, không check `is_admin()`.
   - `supabase/migrations/0011_reading_stats_rpc.sql:17-57,62-90,95-122`.
   - Admin UI fail-open: role lạ/`user` thấy mọi tab: `AdminPanel.jsx:98-102`.

6. **Luồng AI draft → human review → publish chưa tồn tại end-to-end.**
   - Prompt nói luôn tạo draft, nhưng APIs chấp nhận `published`.
   - Admin Article/Khai Trí không có status control; draft URL bị Firestore rules ẩn.
   - Agent có thể bypass prompt; human không có thao tác publish chuẩn.

## Khả năng đọc của user

### Điểm tốt

- Mobile article đo thực tế: body **19.2px**, line-height **34.56px**, cột **318px** — thoáng, dễ theo dòng.
- Cột đọc giới hạn 720–760px, line-height 1.8–1.85: `article-detail.css:101-111`, `responsive.css:68`.
- Font Vietnamese self-hosted; fallback Windows/Android đầy đủ: `main.jsx:5-15`, `base.css:38-41`.
- Điều chỉnh cỡ chữ 80–150%, lưu preference: `hooks/useFontSize.js`.
- Có reading time, progress, breadcrumb, related content, skeleton, image aspect ratio.

### Khó khăn

- Desktop/tablet body bị giảm từ 19.2px mobile xuống 16.8px/17.6px: `responsive.css:31,68` override component.
- Cormorant Garamond đẹp editorial nhưng nét mảnh; đọc dài tiếng Việt kém ổn định hơn Be Vietnam Pro, nhất là người lớn tuổi/màn hình chất lượng thấp.
- Body chỉ render `<p>`; không có H2/H3 thật. Screen reader và người đọc lướt khó nắm cấu trúc: `ArticleDetail.jsx:40-49`.
- TOC lấy “đoạn ngắn <120 ký tự” làm mục lục, không lấy heading; không anchor/deep-link: `ArticleDetail.jsx:11-35`.
- Title mobile chỉ 20px; metadata 11.52px. `2 phút đọc` dùng màu 3.44:1.
- Toolbar mobile wrap lệch: font controls trái, share buttons xuống dòng; copy button đứng riêng.
- Drop-cap rất lớn làm dòng đầu khó quét; chatbot che đúng vùng này.
- Header icon “user/admin” nổi bật với người đọc thường nhưng không rõ mục đích.
- Nav desktop ~13px; bottom-nav label ~9.9px; nhiều hit target dưới 44px.
- Language switch không cập nhật `html[lang]`; screen reader có thể phát âm sai English: `index.html:2`, `App.jsx:55-67`.
- Route change không chuyển focus/announce; thiếu skip link: `App.jsx:181,227`.
- Logo là clickable `<div>`; nav dùng button thay link; Cmd/Ctrl-click không hoạt động: `Header.jsx:16-24`.
- Hidden overlay, icon buttons, share status, forms còn thiếu aria/focus/labels.

## Màu sắc

| Theme | Pair | Ratio | Kết quả |
|---|---|---:|---|
| Dark | ink `#f5ede0` / bg `#14110d` | 16.20 | Pass |
| Dark | soft `#d6cdbc` / bg | 11.94 | Pass |
| Dark | muted `#8a8273` / bg | 4.95 | Pass sát |
| Dark | gold `#d4a76a` / bg | 8.55 | Pass |
| Light | ink `#161310` / bg `#f8f3ea` | 16.74 | Pass |
| Light | soft `#3d3833` / bg | 10.49 | Pass |
| Light | muted `#8a8273` / bg | 3.44 | Fail normal text |
| Light | gold `#b08642` / bg | 3.00 | Fail normal text |

Nhận định: palette vàng–kem phù hợp brand, không cần đổi style. Chỉ cần tách token **decorative gold** khỏi **gold-as-text**, và làm muted đậm hơn.

## Tracking & báo cáo nội dung đọc

### Production hiện có

- GA4/Firebase Analytics bật tự động khi idle: `firebase.js:24-65`.
- Events: page view, article view, navigation, search, language/theme, scroll depth, elapsed article time: `useAnalytics.js:7-106`.
- Production bundle có GA measurement config và Firestore path.

### Sai số GA4 hiện tại

- Scroll 25/50/75/100 có thể emit lặp nhiều lần; không giữ set milestone: `useAnalytics.js:45-65`.
- Reading time là wall-clock tới unmount, gồm tab ẩn/idle: `useAnalytics.js:70-79`.
- Scroll tính toàn document gồm related/comments/footer, không phải article body.
- Share helper tồn tại nhưng ShareButtons không gọi.
- Search term gửi nguyên văn; chưa có consent/opt-out/privacy page.

### Micro-reading đã code nhưng chưa live

- Source có IntersectionObserver theo paragraph: dwell, paragraph index, reached-end, session UUID.
- Chỉ chạy khi `VITE_DATA_BACKEND=supabase`; default/deploy hiện dùng Firestore.
- Admin source có comparison, completion, median dwell, paragraph bars; production bundle chưa chứa tab này.
- Flush fire-and-forget, không beacon/retry; lần hidden đầu khóa mọi event sau khi user quay lại.
- Anonymous insert `WITH CHECK(true)` cho phép spam/poison metrics; schema thiếu bounds/retention/dedup.
- “Median read time” hiện là median một paragraph event, không phải tổng active read time/session.

### Báo cáo nên có sau khi sửa nền tảng

1. Weekly editorial: article, unique reading sessions, active read time, true completion, 25/50/75/100.
2. Section drop-off: heading/section name, reached %, transition drop-off, median active dwell.
3. Discovery: source/referrer, search term đã chuẩn hóa/redact, card CTR → article completion.
4. Quality alerts: traffic cao + completion thấp; paragraph drop >20%; broken direct links.
5. Agent/content ops: draft age, review SLA, publish success, failures, revisions, rollback.
6. Filters/export: date, language, device, article/category, CSV; minimum sample threshold để bảo vệ privacy.

## AI agent quản trị website

### Đang hoạt động

- Legacy Vercel/Firebase API live: `GET /api/agent-spec` 200.
- `/api/articles`, `/api/khaitri`, media upload có auth, schema, allowlist; unauth create trả 401.
- `sourceRef` hỗ trợ dedup ở mức cơ bản; Khai Trí có validate/dry-run.

### Khó khăn/rủi ro

- Hai control plane: legacy Vercel/Firebase live; Worker/Supabase mới chưa reachable (`api.battudao.com` chưa DNS).
- Agent writes, admin reads/writes, audit logs đang chia giữa Firestore và Supabase.
- New Worker drafts không xuất hiện trong admin; admin Supabase chỉ đọc published nhưng editor vẫn write Firestore.
- Legacy và Worker payload khác nhau (nested camelCase vs flat snake_case).
- Audit mới ghi Postgres, admin log đọc Firestore; operations mới vô hình.
- Một broad write scope có thể publish/archive; thiếu `content:publish`, approval identity/time, revision, ETag, rollback.
- Delete hard; không confirm token/soft-delete/recovery.
- Worker idempotency/upsert có lỗi contract; thiếu tests cho agent routes, analytics, review workflow.
- Gia Hân orchestration hiện là prompt-only; không có persisted job state/resume/status.

## Roadmap khuyến nghị

### P0

1. Fix direct article deep-link retry; thêm regression test fresh browser.
2. Sửa light muted/gold tokens; audit contrast toàn site.
3. Không để overlay ẩn focus; thêm focus management/ARIA/skip link.
4. Dời/autohide chatbot khi đọc; PWA banner nằm trên bottom nav hoặc thay inline prompt.
5. Chọn **một** control plane; giữ legacy chính thức hoặc cutover Supabase atomically.
6. Server-enforce workflow `draft → in_review → published`; tách `content:publish`; admin có preview/status.
7. Fix analytics RPC admin guard trước khi bật Supabase; privacy/consent trước micro analytics.

### P1

1. Dùng body font dễ đọc hoặc cho user chọn Serif/Sans; desktop ≥18px.
2. Structured article sections H2/H3; TOC từ headings + anchors.
3. Touch targets ≥44px; visible focus; links đúng semantic; `html.lang` đồng bộ.
4. One-shot scroll milestones, active-time tracking, beacon/keepalive, event validation/rate limit/dedup.
5. Một append-only agent audit store + request ID + before/after + outcome; admin filter/export.
6. Agent keys: per-agent scopes, expiry, rotate/revoke, rate limit, last-used.

### P2

1. Dashboard weekly/scheduled report + CSV + retention trends.
2. OpenAPI/agent-spec unified, dry-run mọi mutation, idempotent retry trả lại original result.
3. Revision history, optimistic concurrency, soft-delete/restore, rollback.

## Unresolved questions

1. Production dài hạn chọn Firestore hay Supabase?
2. Có quyền GA4/Supabase để xác minh event volume và RPC thực tế không?
3. Nhóm độc giả chính có nhiều người 50+ không? Nếu có, ưu tiên font sans + 18–20px mặc định.
4. AI agent nào ngoài Gia Hân/goclaw đang dùng legacy payload?

