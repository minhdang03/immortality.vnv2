# Audit release / test / operations readiness — production

**Ngày:** 18/07/2026 09:46 AEST  
**Phạm vi:** web Vercel/PWA, iOS NODIE/App Store, Cloudflare Workers, Supabase/Firebase, CI/CD, test, monitoring, backup/rollback.  
**Cách làm:** đọc repo + plan hiện hành; chạy test/typecheck local an toàn. Không deploy, không seed, không ghi production.

## Verdict

**NO-SHIP production.** Web đang có thể tiếp tục vận hành như hiện trạng, nhưng **không mở public NODIE / không submit App Store / không coi backend Workers là production-ready**.

Lý do chặn: release gate iOS không fail khi test đỏ; suite 3 lần chưa chứng minh; working tree chứa code release-critical chưa commit; archive hiện có cũ và không mang entitlement APNs; không CI; Worker production config còn placeholder; crash/alert/captcha/SMTP/App Store metadata chưa hoàn tất.

## Release gate matrix

| Gate | Web | iOS | Backend / Ops | Kết luận |
|---|---:|---:|---:|---|
| Source reproducible từ commit sạch | ⚠️ Vercel nối `main`, nhưng install không frozen | ❌ working tree bẩn, archive cũ | ❌ deploy Worker rời rạc/thủ công | **FAIL** |
| Build/typecheck | ⚠️ không chạy build vì audit cấm ghi generated files; không CI chứng minh | ⚠️ archive export 16/07 thành công, không phải code hiện tại | ✅ 3 Worker typecheck xanh | **FAIL** |
| Automated tests | ❌ không có web test script/test files | ❌ phase 1933-04 pending; gate script sai | ✅ 83 unit tests xanh, phần lớn mock | **FAIL** |
| Real-data / RLS / E2E | — | ⚠️ có fixture thật, nhưng chưa xanh 3 lần | ⚠️ không có smoke test deploy/staging | **FAIL** |
| Store compliance | N/A | ❌ APNs, ASC labels/demo/age/screenshots/SMTP/captcha còn nợ | ⚠️ report/block chat chưa nối | **FAIL** |
| Secrets/env validation | ❌ không fail-fast | ⚠️ xcconfig generator có, portal/profile chưa đủ | ❌ placeholders + không preflight | **FAIL** |
| Observability/alerting | ⚠️ GA4, không release/error alert | ❌ không crash sink | ❌ logs rời rạc, không alert/runbook | **FAIL** |
| Backup/restore/rollback | ⚠️ Vercel commit deploy có rollback nền tảng, không runbook | ⚠️ app rollback qua version mới | ❌ Supabase free/no PITR, media không backup | **FAIL** |
| Legal/privacy/account deletion | ✅ web privacy/terms đã có | ⚠️ delete account có; privacy/ASC chưa đóng | ⚠️ orphan media được công khai nhưng chưa dọn | **PARTIAL** |
| PWA/offline/push | ⚠️ có SW/manifest/icons; chưa có test | N/A | ⚠️ FCM/APNs delivery chưa có monitor | **PARTIAL** |

## Findings — blockers

### R01 — P0 — release gate iOS không hề gate

- **Trạng thái:** **missing / broken**.
- **Bằng chứng:** `apps/nodie-ios/scripts/run-uitest-gate.sh:9` không bật `set -e`; `:16` khai `fails=0` nhưng không bao giờ tăng/đọc; `:20-22` pipe `xcodebuild` qua `grep|tail`; `:24-25` chỉ in lời nhắc “đọc các dòng”, luôn kết thúc thành công nếu shell chạy tới cuối.
- **Impact:** CI/người phát hành có thể nhận exit 0 dù một hoặc cả ba vòng test đỏ.
- **Khuyến nghị:** capture `PIPESTATUS[0]`/xcresult, fail ngay hoặc tổng hợp rồi `exit 1`; bắt đúng `Executed … 0 failures`; lưu `.xcresult`; test chính script bằng một test cố ý fail.

### R02 — P0 — code iOS release-critical chưa ở commit sạch, suite chưa chứng minh xanh 3 lần

- **Trạng thái:** **partial / in progress**.
- **Bằng chứng lệnh:** `git status --short` có 15 file tracked sửa + `run-uitest-gate.sh` untracked; gồm `ConversationStore.swift`, `ChatDetailView.swift`, 7 UITest files và seed thật. `apps/nodie-ios/plans/260717-1933-production-readiness-superapp-standard/plan.md:27-31` vẫn để phase 04–08 trống; acceptance `:49-52` yêu cầu test session/RLS thật 3 lần, device nhỏ+lớn+thiết bị thật.
- **Impact:** không truy ra binary từ commit nào; rollback/review không đáng tin; thay đổi test và fixture có thể che regression.
- **Khuyến nghị:** đóng phase 04 bằng gate đã sửa, 3 lần liên tiếp từ trạng thái seed xác định; code review diff; commit sạch; chạy device matrix trước archive.

### R03 — P0 — archive/IPA hiện có không đại diện code hiện tại và thiếu Push entitlement

- **Trạng thái:** **stale / blocked externally**.
- **Bằng chứng:** `build/NODIE.xcarchive/Info.plist` có CreationDate **16/07/2026**, trước các commit media/voice/legal và working-tree hiện tại. `build/export/DistributionSummary.plist` chứng minh export/signed IPA thành công nhưng entitlements chỉ có application identifier/team/get-task-allow/beta; **không có `aps-environment`**. Trong khi `project.yml:35,40-51` yêu cầu entitlement development/production.
- **Impact:** TestFlight/App Store build hiện tại không đăng ký remote notifications; push E2E không thể đạt dù code đúng.
- **Khuyến nghị:** bật Push Notifications trên App ID; tạo lại distribution profile `NODIE App Store`; archive code sạch; kiểm `aps-environment=production` trong exported IPA; thử APNs production tới thiết bị TestFlight.

### R04 — P0 — không có CI/CD quality gate trước push `main`

- **Trạng thái:** **missing**.
- **Bằng chứng lệnh:** `git ls-files '.github/*' '.github/**/*'` không trả file nào. `CLAUDE.md:192` nói push `main` tự deploy Vercel. Root `package.json:6-12` chỉ có dev/build/deploy, không `test`, `lint`, `typecheck`, release gate.
- **Impact:** commit chưa build/test có thể tự lên web production; Workers/iOS phụ thuộc thao tác laptop; không artifact provenance/approval.
- **Khuyến nghị:** PR-required CI: frozen install → web build/smoke → Worker typecheck+test → secret scan; branch protection; production deploy chỉ sau CI; iOS workflow riêng tạo signed artifact/TestFlight sau gate.

### R05 — P0 — Cloudflare Worker production configs chưa deploy được đầy đủ/tái lập

- **Trạng thái:** **missing / placeholder**.
- **Bằng chứng:** `workers/wrangler.toml:112-132` production KV/D1/R2 đều `REPLACE_WITH_*`; route production còn comment tại `:137-143`. Notion production KV placeholder `workers/notion/wrangler.toml:45-52`; realtime production KV placeholders `workers/realtime/wrangler.toml:53-68`.
- **Impact:** full API/realtime/notion deployment sẽ fail binding hoặc chạy thiếu resource; domain API chưa được bind bằng config.
- **Khuyến nghị:** provision resource IDs per env, route/custom domain, secrets inventory; `wrangler deploy --dry-run --env production` trong CI; smoke `/health`, authenticated route, WS connect, cron dry-run before promotion.

### R06 — P0 — deploy script API chỉ sai config và docs gọi sai workspace

- **Trạng thái:** **broken / stale**.
- **Bằng chứng:** package thật tên `@btd/api` (`workers/api/package.json:2`) và script `deploy` chỉ `wrangler deploy` (`:7-9`), nhưng config nằm `workers/wrangler.toml`, không nằm `workers/api/`; docs dùng package không tồn tại `@btd/workers-api` (`CLAUDE.md:216-218`). `workers/wrangler-minimal.toml:1-7` lại mô tả một lệnh tay khác, cố ý deploy legacy routes có thể lỗi runtime.
- **Impact:** operator dễ deploy nhầm config/worker hoặc tưởng deploy thành công trong khi route legacy chết.
- **Khuyến nghị:** một script canonical có `--config` và `--env`; bỏ tên workspace cũ; phân biệt `api-minimal` với `api-full` bằng worker name/route riêng; CI dry-run xác nhận.

### R07 — P0 — App Store/public beta còn các gate console + auth chưa đóng

- **Trạng thái:** **missing**.
- **Bằng chứng:** `apps/nodie-ios/plans/260717-2015-pre-appstore-submission/plan.md:25-28` còn MetricKit, Turnstile, community/funnel, checklist console; `:61-62` acceptance yêu cầu captcha auth/UITest 3 lần và ASC labels/demo/age/SMTP/screenshots. Đo đã ghi tại `:74-75`: Supabase free, email rate 2/h, `smtp_host=None`, captcha disabled, signup open.
- **Impact:** public link bị bot/spam; confirm/reset mail nghẽn; Apple review thiếu metadata/demo/privacy evidence.
- **Khuyến nghị:** hoàn thành phases 04–07; custom SMTP + deliverability test; Turnstile E2E trên build mới trước bật server; dedicated review account; fill ASC privacy/age/screenshots/review notes.

### R08 — P0 — không có crash diagnostics/production alert path

- **Trạng thái:** **missing**.
- **Bằng chứng:** grep source NODIE không có `MetricKit`, `MXMetricManager`, `AppEventLogger`, Sentry; plan phase 04 còn trống (`pre-appstore plan:25`). Realtime code tự ghi TODO structured logging (`workers/realtime/src/channel-durable-object.ts:362-363`). Không có workflow/alert config trong repo.
- **Impact:** crash, hang, push chết, cron lỗi hoặc WS persistence lỗi có thể kéo dài mà không ai biết.
- **Khuyến nghị:** MetricKit → `app_events` như plan; alert tối thiểu cho crash spike, `push_failures`, Notion `_sync_logs`, Worker 5xx/latency, Supabase auth/db; owner + escalation + weekly review.

### R09 — P0 — UGC chat chưa có report/block dù Terms cam kết có

- **Trạng thái:** **missing / compliance mismatch**.
- **Bằng chứng:** `TermsOfUseView.swift:26-27` và web `TermsPage.jsx:26-29` cam kết report/chặn ngay trong app. Grep `Features/Conversations` không có `ModerationMenu`; moderation hiện chỉ ở QA. `ConversationStore.swift:56,242` chỉ tải/filter blocked IDs.
- **Impact:** rủi ro reject App Review Guideline 1.2; cam kết pháp lý khác hành vi chat.
- **Khuyến nghị:** report message + block author từ bubble/profile; hide blocked content xuyên QA/chat; test user thường và review SLA/moderation queue trước submit.

## Findings — high/medium

### R10 — P1 — test backend xanh nhưng coverage production hẹp; web không có test

- **Trạng thái:** **partial**.
- **Bằng chứng lệnh 18/07:** API **12/12**, Notion **42/42**, realtime **29/29**; cả ba `tsc --noEmit` xanh. Nhưng test files API/Notion mock Firestore/Auth; không live staging smoke. `apps/web/package.json:6-9` chỉ dev/build/preview; `rg --files apps/web | rg '(test|spec)'` không có kết quả.
- **Impact:** env/binding/CORS/auth/token/SW/deploy errors không được bắt bởi unit tests.
- **Khuyến nghị:** giữ 83 test hiện có; thêm contract/integration staging, web route/legal/PWA smoke, Lighthouse/accessibility budget, prod post-deploy read-only smoke.

### R11 — P1 — Worker runtime test đang dùng compatibility date cũ hơn production config

- **Trạng thái:** **partial / drift**.
- **Bằng chứng lệnh:** realtime tests cảnh báo installed runtime chỉ hỗ trợ `2024-12-30`, trong khi `workers/realtime/wrangler.toml:3` yêu cầu `2026-05-01`; Vitest fallback.
- **Impact:** suite xanh không chứng minh hành vi runtime production date.
- **Khuyến nghị:** nâng Wrangler/Miniflare/Vitest pool đồng bộ; CI fail trên compatibility fallback.

### R12 — P1 — web deploy không hermetic và không validate env

- **Trạng thái:** **partial**.
- **Bằng chứng:** `vercel.json:2` dùng `pnpm install --no-frozen-lockfile`; `firebase.js:5-15` truyền thẳng env có thể undefined; Supabase chỉ `console.warn` khi thiếu (`src/lib/supabase-client.js:10-15`); VAPID thiếu chỉ báo runtime (`pwa-fcm-web-push-subscription.js:70-75`).
- **Impact:** lock có thể trôi ở build; deploy “xanh” nhưng Firebase/Supabase/push chết khi user mở.
- **Khuyến nghị:** `--frozen-lockfile`; prebuild schema kiểm required vars theo backend mode; fail build khi thiếu; smoke feature flag và push config.

### R13 — P1 — security headers nằm ở Firebase config nhưng production là Vercel

- **Trạng thái:** **missing on canonical deploy config**.
- **Bằng chứng:** `CLAUDE.md:181-194` xác nhận Vercel production. CSP/HSTS/frame/referrer headers chỉ ở `firebase.json:59-82`; `vercel.json:1-15` không có `headers`.
- **Impact:** production có thể thiếu CSP/HSTS/XFO/Permissions Policy dù repo tạo cảm giác đã có.
- **Khuyến nghị:** chuyển/đồng bộ headers sang Vercel, kiểm bằng HTTP trong CI; duy trì một nguồn policy.

### R14 — P1 — PWA có implementation nhưng chưa có release evidence; “background sync queue” chưa tồn tại

- **Trạng thái:** **partial / misleading**.
- **Bằng chứng:** SW/manifest/icons hợp lệ (`sw.js`, `manifest.json`, file thực 192/512/maskable). Nhưng `sw.js:196-210` chỉ phát message `SW_SYNC_REPLAY`; không có code lưu/replay mutation trong `pwa-install-prompt-manager.js`. SW registration nuốt lỗi `main.jsx:35-37`; manifest screenshots rỗng `manifest.json:33`.
- **Impact:** offline mutation claim không đúng; SW update/install failure vô hình; install quality chưa được test.
- **Khuyến nghị:** hoặc bỏ claim/background-sync dead code, hoặc triển khai queue thật; Playwright offline/update tests; log registration failure; Lighthouse/PWA install smoke trên production.

### R15 — P1 — web push token persistence có thể fail im lặng và không có delivery monitor

- **Trạng thái:** **partial**.
- **Bằng chứng:** `pwa-fcm-web-push-subscription.js:100-127` nuốt Firestore write error nhưng vẫn để flow tiếp tục; unsubscribe cũng nuốt lỗi `:135-150`; không có token rotation cleanup/delivery receipt/alert trong repo.
- **Impact:** UI có thể nói bật thông báo nhưng server không có token; token stale tích tụ; push chết không ai biết.
- **Khuyến nghị:** chỉ báo “enabled” sau persistence verified; structured error; token refresh/invalid-token cleanup; canary push định kỳ.

### R16 — P1 — backup/restore/rollback chưa thành quy trình kiểm chứng

- **Trạng thái:** **accepted risk, operationally missing**.
- **Bằng chứng:** plan ghi Supabase free/no PITR và media không backup (`pre-appstore plan:69,74`); privacy web thừa nhận orphan media `PrivacyPage.jsx:42-45`. Không có restore drill/runbook/backup verification trong code/docs vận hành.
- **Impact:** mất/corrupt DB hoặc Storage không đạt RPO/RTO; account deletion để file tồn tại; operator không biết phục hồi.
- **Khuyến nghị:** ghi RPO/RTO và owner; export định kỳ dữ liệu quan trọng; backup `chat-media` hoặc quyết định retention rõ; restore drill staging; Vercel/Worker/DB rollback checklist.

### R17 — P1 — migration đã có ledger nhưng vẫn là psql tay, sequence/seed dễ lệch

- **Trạng thái:** **improved but partial**.
- **Bằng chứng:** `0035_applied_migrations_ledger.sql` tạo ledger; `0036`, `0037`, `0039` tự ghi. Nhưng `CLAUDE.md:220-227` vẫn mô tả apply psql tay; repo nhảy `0037` → `0039`, còn seed launch nằm ngoài migration và đang modified.
- **Impact:** prod/repo drift, apply thiếu/thừa, rollback khó; số file không đủ chứng minh schema.
- **Khuyến nghị:** preflight đối chiếu checksum + ledger, transaction dry-run, explicit seed ledger riêng, migration CI trên DB disposable, post-apply schema assertions.

### R18 — P1 — privacy manifest/ASC phải cập nhật đồng bộ khi bật diagnostics

- **Trạng thái:** **partial / future mismatch**.
- **Bằng chứng:** `PrivacyInfo.xcprivacy:11-50` khai email/name/other user content; chưa khai Diagnostics/Device ID. Plan sẽ thêm MetricKit/app_events (`phase 04`) và ASC labels còn trống (`plan:25,28`).
- **Impact:** sau khi thêm crash telemetry, manifest/web policy/ASC labels có thể lệch; review rejection hoặc disclosure sai.
- **Khuyến nghị:** cùng commit/release cập nhật manifest + web privacy + ASC source-of-truth; không đưa PII vào diagnostic payload.

### R19 — P1 — tài liệu release chính lỗi thời và mâu thuẫn code

- **Trạng thái:** **stale**.
- **Bằng chứng:** `docs/store-submit-checklist.md:3,16-27,55-70` vẫn Capacitor/Android và bundle `com.immortality.app`; app thật `project.yml:31` là native Swift `com.battudao.nodie`. Roadmap vẫn Expo/EAS/Android (`development-roadmap.md:3-31,126`) dù stack đã xoá. CLAUDE lại còn nói Firestore rules paste tay (`:229`) trong khi `firebase.json:89-91` đã khai rules và `firestore.rules:3-5` nói deploy CLI.
- **Impact:** operator làm sai lệnh/bundle/store listing; checklist không thể dùng làm release sign-off.
- **Khuyến nghị:** thay checklist bằng NODIE-native source of truth; archive Android/Expo sections; docs generated/verified từ manifest/project configs; owner cập nhật sau mỗi release.

## Positive evidence

- Worker code hiện **typecheck xanh cả 3**, unit tests **83/83 xanh**.
- iOS đã từng archive/export signed IPA thành công; certificate/profile còn hạn tới 16/07/2027. Vấn đề là archive stale và profile thiếu push.
- `project.yml:17-18,31-35,44-51` quản lý version/bundle/signing tập trung; Privacy manifest, camera/micro strings, deep link và delete-account RPC đã có.
- Web legal pages đã land; plan ghi production `/privacy`, `/terms`, `/nodie-captcha` 200 (`pre-appstore plan:22`).
- Supabase có ledger + `push_failures` + `app_events` schema (`0035`–`0037`); push logging code có mặt trong Edge Function.
- Firestore rules hiện dùng role documents, không còn “mọi Firebase user là admin” (`firestore.rules:22-42`).
- PWA manifest/icons/offline shell/SW là file thật, không còn icon stub.

## Thứ tự đóng gate đề xuất

1. **Sửa release gate script**, chạy suite real-data 3 lần, iPhone nhỏ+lớn+device thật; đóng 1933 phase 04–08.
2. **Commit sạch + CI/branch protection** trước bất kỳ deploy/archive mới.
3. **Apple portal/APNs profile**, archive lại; verify exported entitlement + TestFlight push E2E.
4. **MetricKit/alerts + Turnstile + SMTP + chat report/block**.
5. **ASC handoff:** privacy labels, demo account, age rating, screenshots, review notes.
6. **Worker production config canonical:** IDs/secrets/routes, dry-run, staging smoke, prod read-only smoke.
7. **Backup/restore/rollback runbook + drill**, rồi mới mở public production.

## Unresolved questions

1. Apple Developer App ID đã bật Push chưa, hay profile 16/07 là profile trước capability?
2. Hiện có tester ngoài nào đang dùng build không captcha không? Quyết định thời điểm bật server-side captcha phụ thuộc việc ép update.
3. Cloudflare Workers nào thực sự đang phục vụ traffic production: minimal API, full API, realtime, notion? Repo không có inventory deployment/route/version.
4. Ai là on-call owner tuần launch, kênh alert nào, và RPO/RTO chấp nhận cho Supabase/Storage là bao nhiêu?
5. App Store Connect app record/demo account/labels đã tạo ngoài repo chưa? Repo chỉ chứng minh checklist còn trống.

**Status:** DONE  
**Summary:** Audit production release/ops hoàn tất. Verdict NO-SHIP; 9 blocker P0 và 10 finding P1, kèm release matrix và thứ tự đóng gate.  
**Concerns/Blockers:** Không xác minh được trạng thái console Apple/Cloudflare/Supabase ngoài repo; không deploy/seed/prod write theo phạm vi audit.
