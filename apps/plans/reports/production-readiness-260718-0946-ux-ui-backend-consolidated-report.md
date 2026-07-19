# Production readiness — UX/UI + Backend + Release/Ops

Ngày: 18/07/2026 · Nguồn sự thật: code/config hiện tại, build/test mới, live HTTP production. Không sửa app code, không deploy, không ghi production.

## Executive verdict

**NO-GO cho public NODIE/App Store và NO-GO khi tuyên bố toàn bộ backend đã production-ready.**  
**Web battudao.com có thể tiếp tục vận hành như hiện trạng**, nhưng còn security-header + accessibility + test/CI gaps; chưa đạt release gate mới.

| Surface | Verdict | Lý do chính |
|---|---|---|
| Web Vercel | **RUN WITH HIGH RISKS** | Build xanh/live 200; thiếu security headers Vercel, web tests, keyboard/a11y chuẩn, CI gate |
| NODIE iOS | **NO-SHIP** | Chat UGC thiếu report/block; UITest gate hỏng và chưa xanh 3×; APNs archive/profile chưa đạt; a11y/error/Friends chưa đóng |
| Supabase cho NODIE | **NO-GO PUBLIC** | Captcha/SMTP/backup/alert console chưa xác minh; migration/seed còn thao tác tay; push E2E chưa chứng minh |
| Cloudflare Workers | **NO-SHIP AS A SET** | Production bindings/routes còn placeholder; deploy command/config không canonical |
| Vercel agent APIs | **LIMITED INTERNAL USE** | Auth/scope/SSRF tốt; thiếu timeout/stream cap/rate limits |

## Blockers phải đóng trước public release

1. **Sửa release gate thật sự fail khi test đỏ** — `nodie-ios/scripts/run-uitest-gate.sh:9-25` hiện luôn có thể exit 0; chạy full UITest user thường 3 lần, lưu `.xcresult` + commit SHA.
2. **Chat report/block** — `ChatDetailView.swift:914-950` chưa có, trong khi Terms cam kết; test RLS/moderation queue.
3. **Commit sạch + archive mới** — working tree chứa chat/store/UITest/seed; archive 16/07 stale và exported entitlement chưa có `aps-environment`.
4. **APNs end-to-end** — bật capability/profile mới, verify IPA `aps-environment=production`, TestFlight device nhận push.
5. **Public auth controls** — custom SMTP + confirm/reset deliverability; Turnstile E2E; dedicated App Review account.
6. **App Store Connect** — privacy labels, age rating, screenshots, review notes/demo credentials; privacy manifest/policy khớp telemetry.
7. **A11y/UX release gate iOS** — contrast AA, 44pt inventory, VoiceOver/Dynamic Type, Friends states, contextual error/retry, offline/reconnect/pagination, destructive confirm.
8. **Observability** — MetricKit/crash diagnostics, app events, push failure + Worker 5xx/cron alerts, named owner/escalation.
9. **Backend deploy inventory** — chốt service nào active; provision Worker IDs/routes/secrets; canonical deploy + staging/prod smoke.
10. **Backup/restore/rollback** — RPO/RTO, Supabase/Storage backup decision, restore drill, release rollback checklist.

## High-priority web gaps

- Vercel không nhận CSP/nosniff/frame/referrer/permissions headers đang chỉ ở Firebase config; live check 18/07 xác nhận `/`, `/privacy`, `/terms` trả 200 nhưng chỉ thấy HSTS trong nhóm policy chính.
- Navigation dùng button/clickable div thay link (`Header.jsx:44-103`, `StoryList.jsx:41-52`); forms thiếu labels/name/autocomplete (`ContactPage.jsx:45-50`); thiếu skip-link và dynamic `html lang`.
- Async form status thiếu live region; focus-visible không đủ; filter/search state không deep-link; reduced-motion chưa global.
- Không có web test script/CI; `vercel.json:2` install `--no-frozen-lockfile`, env không fail-fast.

## High-priority backend gaps

- Worker production config `REPLACE_WITH_*` và route comment; deploy docs/package/config lệch nhau.
- `upload-from-url` tải toàn response trước cap và không timeout; upload/agent plane không quota/rate limit.
- Push fan-out unbounded, error handling có thể abort batch; deployment + alert chưa chứng minh.
- Migration ledger có nhưng apply psql/seed tay; thiếu checksum/parity/rollback drill.
- Dual Firebase/Firestore và Supabase planes chưa có inventory source-of-truth/runbook rõ.

## Findings cũ đã được đóng hoặc stale

- Chat ảnh/camera/tệp và voice đã có implementation thật; dead profile/group menu và suppress-push đã nối.
- `/privacy` và `/terms` đã live 200 trên Vercel.
- Firestore admin đã role-based; `firebase.json` đã khai deploy rules — hai cảnh báo cũ không còn đúng.
- Cold-start seed đã có 12 câu/4 persona theo plan; không còn dùng số liệu “3 profile” cũ.
- iOS source hiện tại build simulator thành công; web Vite bundle build thành công.

## Verification evidence — 18/07/2026

- `xcodebuild ... build`: **BUILD SUCCEEDED**; warnings: deprecated realtime `subscribe()`, vài `try?` unused.
- `pnpm exec vite build`: **exit 0**, 224 modules; Firebase chunk 631.83 kB (gzip 147.48 kB), còn chunking warnings.
- Worker typecheck: API/realtime/notion **pass**.
- Worker tests: **83/83 pass** (API 12, realtime 29, notion 42). Realtime test runtime fallback `2024-12-30` trong khi config yêu cầu `2026-05-01`.
- Live Vercel: `/`, `/privacy`, `/terms` **HTTP 200**; SPA shell hợp lệ; security header gap được xác nhận.
- Không chạy full UITest vì suite seed/mutate dữ liệu thật; audit không có quyền ghi production.

## Thứ tự thực hiện đề xuất

1. Release gate + chat moderation + 3× real-data tests.
2. iOS a11y/error/Friends/offline matrix + device thật.
3. SMTP/Turnstile/APNs/MetricKit/alerts.
4. Commit sạch, CI/branch protection, archive/TestFlight mới.
5. ASC handoff + backup/restore drill.
6. Worker inventory/config/deploy smoke; harden upload/push.
7. Web a11y/security headers/tests, rồi mới gọi platform “production-ready”.

## Unresolved questions

1. Mục tiêu release kế tiếp là TestFlight invite-only, public TestFlight hay App Store public?
2. Worker nào đang nhận traffic thật; NODIE có phụ thuộc Worker nào ngoài Supabase không?
3. Apple App ID/profile, Supabase SMTP/captcha/tier và App Store Connect đã cấu hình tới đâu ngoài repo?
4. Ai là on-call tuần launch; RPO/RTO chấp nhận cho DB/chat media?

**Status:** DONE  
**Summary:** Audit kết luận NO-SHIP cho NODIE/public platform; web live có thể tiếp tục nhưng còn high-risk gaps.  
**Concerns/Blockers:** Console/portal state chưa được xác minh; full real-data UITest và device matrix chưa chạy.
