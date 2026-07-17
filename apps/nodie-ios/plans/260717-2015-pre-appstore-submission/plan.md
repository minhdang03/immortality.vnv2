---
title: "Pre-App Store submission — 14 gap ngoài UX"
description: "9 mục code được + 5 mục Đăng bấm console. Chia 2 đợt để không đua file với plan 1933."
status: pending
priority: P0
effort: 4 ngày
branch: claude/immortality-mobile-hybrid
tags: [appstore, observability, ops, captcha, seed]
created: 2026-07-17
source-report: apps/nodie-ios/plans/reports/production-gap-analysis-260717-1949-beyond-ux-audit-appstore-ops-report.md
---

# Pre-App Store submission

**Phạm vi:** 21 mục report − 4 chấp nhận rủi ro (B-04, C-05, C-06, D-04) − 3 thuộc plan 1933 (A-01, D-02, D-03) = **14 mục**.
**Phát hành:** TestFlight **public link** (Đăng chốt 20:20) ⇒ C-04 captcha là **P0**, không hoãn.

## Phases

| # | Phase | Mục | Đợt | Model | Ước lượng | Status |
|---|---|---|---|---|---|---|
| 01 | [Web: privacy + terms + trang nhúng captcha](phase-01-web-legal-pages.md) | A-02 (+hạ tầng C-04) | A | Opus (fast) | 0.5 ngày | ⬜ |
| 02 | [Supabase ops: sổ migration, log push hỏng, bảng sự kiện](phase-02-supabase-ops-ledger-logs.md) | C-02, B-03, B-02(SQL) | A | **Fable** | 0.5 ngày | ⬜ |
| 03 | [Seed kênh + nội dung mồi từ stories/khaitri](phase-03-seed-launch-content.md) | D-01 | A | **Fable** | 0.5 ngày | ⬜ |
| 04 | [MetricKit + đường ghi sự kiện](phase-04-metrickit-event-sink.md) | B-01, B-02(writer) | A | Opus (fast) | 0.5 ngày | ⬜ |
| 05 | [Captcha Turnstile end-to-end](phase-05-turnstile-captcha.md) | C-04 | B | **Fable** | 1 ngày | ⬜ |
| 06 | [Nội quy cộng đồng + link đăng ký + funnel events](phase-06-community-guidelines-funnel.md) | D-05, A-05(code), B-02(call-site) | B | Opus (fast) | 0.5 ngày | ⬜ |
| 07 | [Checklist bàn giao Đăng (console)](phase-07-handoff-checklist.md) | A-03, A-04, A-06, C-01, C-03 | — | — (Đăng bấm tay) | 0.5 ngày | ⬜ |

**Tư vấn model (ĐỀ XUẤT — chưa được Đăng chốt, khác 1404/1933):** Fable cho 02 (mutation prod DB tay, trigger — vùng bẫy pg_net/EXCEPTION đã trả giá), 03 (seed phải VISIBLE qua RLS với role='user', kiểm bằng HTTP thật — đúng loại lỗi im lặng), 05 (đụng auth có khả năng khoá sạch build cũ + vỡ auto-login UITests, 2 câu hỏi mở). Opus (fast) cho 01/04/06 — việc cơ khí có spec rõ, verify cục bộ.

## Hai đợt — vì sao

Một phiên KHÁC đang cook plan 1933 (đo 20:16). **Đợt A cấm đụng:** `ConversationStore.swift`, `ChatDetailView.swift`, `ConversationModels.swift`, `QAStore*.swift`, `project.yml`, `Info.plist`, `Localizable.xcstrings`, `UndoDeleteUITests.swift`.

- **Đợt A (01–04):** web + Supabase + file .swift MỚI không chuỗi UI. Chạy được ngay.
- **Đợt B (05–06):** **CHỜ plan 1933 land xong.** Lý do cứng: đụng `LoginView` + `project.yml`, và `SWIFT_EMIT_LOC_STRINGS: YES` khiến MỌI lần build ghi lại `Localizable.xcstrings` ⇒ hai phiên cùng build = đua ghi file.
- Đợt A vẫn phải build iOS ở phase 04 → **hẹn cửa sổ build khi phiên 1933 không đang build**.

## Dependencies

```
01 ──────────────┐
02 ──┬── 03      ├── 05 (cần 01 deploy + 1933 land)
     └── 04 ─────┘
                 └── 06 (cần 1933 land) ── 07 (A-06 cần UI đóng băng)
```

- 04 cần 02 (bảng `app_events` phải có trước khi client ghi).
- 03 cần **Đăng duyệt danh sách nội dung TRƯỚC khi ghi prod**.
- 05 cần Đăng cấp Turnstile `sitekey` + `secret`.
- 07: A-06 screenshots làm **cuối cùng**, sau 1933 phase 05 (đổi contrast token).

## Acceptance

1. `https://battudao.com/privacy` + `/terms` trả 200, nội dung khớp `TermsOfUseView` in-app.
2. `select count(*) from _applied_migrations` ≥ 34; mọi migration mới tự ghi sổ.
3. Push hỏng đẻ ra row trong `push_failures` (thử bằng token rác).
4. Crash mô phỏng (Xcode → Debug → Simulate MetricKit Payloads) đẻ ra row `app_events` kind=`crash_diagnostic`.
5. Tài khoản **role='user'** (KHÔNG phải admin) mở app thấy ≥2 kênh + ≥5 câu hỏi mồi — kiểm bằng HTTP thật, không phải build xanh.
6. Bật captcha ở Supabase xong: đăng ký/đăng nhập/quên mật khẩu vẫn chạy trên build mới; UITests auth xanh 3 lần liên tiếp.
7. Đăng đã điền: App Privacy labels, demo account (KHÔNG phải `an.nodie.test`), age rating, SMTP thật, screenshots.

## Quyết định đã chốt (Đăng, 17/07 20:20) — không hỏi lại

1. **Crash reporting = MetricKit** (`MXMetricManager`), zero dependency. Không Sentry.
2. **TestFlight public link** ⇒ captcha P0.
3. **Captcha = Cloudflare Turnstile.** Đăng cấp sitekey (app, qua `Config/Secrets.xcconfig`) + secret (Supabase Auth).
4. **Backup: giữ Supabase free, ghi nhận rủi ro** (C-03) — chỉ ghi docs, KHÔNG nâng tier.
5. **D-01 seed rút từ nội dung `type='khaitri'` sẵn có** (bảng `public.content`, không phải bảng riêng — xem phase 03); Đăng duyệt danh sách trước khi ghi prod.

## Sự thật đã đo (17/07 20:16) — đừng đo lại

- Project ref `dzctvmrlsxwkcuidsqzk`, ap-southeast-1, org plan **free** → không PITR, backup daily 7 ngày, tự pause sau 7 ngày không traffic.
- Auth: `rate_limit_email_sent = 2` (**2 mail/giờ** — report đoán 3-4 là SAI, tệ hơn), `mailer_autoconfirm = False`, `smtp_host = None`, `security_captcha_enabled = False`, `security_captcha_provider = hcaptcha`, `disable_signup = False`.
- Nội dung ĐÃ ở Supabase, **cùng DB với Q&A** ⇒ D-01 là SQL thuần, không cần cầu Firestore. ⚠️ **SỬA (đo psql 18/07 08:0x):** KHÔNG có bảng `stories`/`khaitri` — chỉ **một bảng hợp nhất `public.content`** với cột `type` (37 `story`, 17 `khaitri`, 20 `article`). `from stories` sẽ lỗi. 2 kênh public (`thongbao`, `naobo`) ĐÃ có sẵn. Chi tiết + SQL đúng: [phase-03](phase-03-seed-launch-content.md).
- Migration mới nhất trên đĩa `0034`. ⚠️ **Nhưng phase 02 đã nhận `0035`(sổ)·`0036`(push)·`0037`(app_events)** ⇒ phase 03 dùng **`0038`**, không phải `0035`. Luôn `ls supabase/migrations/` ngay trước khi viết.
- supabase-swift **v2.49.0** — đã verify chữ ký: `signUp(email:password:data:redirectTo:captchaToken:)`, `signIn(email:password:captchaToken:)`, `resetPasswordForEmail(_:redirectTo:captchaToken:)`.
- **Turnstile KHÔNG có SDK native iOS** → phải nhúng WKWebView trỏ trang tĩnh thật (nên phase 01 làm trang nhúng).
- `project.yml` dùng `sources: - NODIE` ⇒ file .swift mới tự vào target, chỉ cần `xcodegen generate`.
- **A-05 phần in-app ĐÃ XONG**: `LoginView.swift:149-159` đã có link Điều khoản ngay màn đăng ký. Report ghi "chỉ nằm trong Profile" là SAI. A-05 còn lại = age rating (console) + link Nội quy (phase 06).

## Câu hỏi chưa giải quyết

1. **Bật captcha khoá sạch build cũ.** Enable server-side là mọi build KHÔNG gửi `captchaToken` bị chặn signup/signin/recover. Hôm nay chỉ Đăng có build → làm trước public link là an toàn. Nếu đã có tester ngoài trước lúc bật → phải ép họ cập nhật. Xác nhận số tester tại thời điểm chạy phase 05.
2. **Captcha làm vỡ đường auto-login của UITests** (`AuthStore.autoLoginForUITestsIfRequested` gọi thẳng `signIn` không token). Phase 05 xử bằng cách cho đường DEBUG đi qua đúng provider token của production. Nếu CI đỏ vì mạng Cloudflare → cân nhắc chạy UITests auth trên project staging riêng (chưa có). Cần Đăng quyết nếu chạm.
3. **Sai lệch có chủ ý so với brief:** B-02 bị tách đôi — *writer* (`AppEventLogger`) kéo lên phase 04/đợt A vì B-01 MetricKit không có chỗ đổ payload thì vô dụng; chỉ *call-site* funnel ở lại đợt B. Nếu Đăng muốn giữ nguyên B-02 hoàn toàn ở đợt B → phase 04 chỉ còn os_log, crash chỉ xem được ở Xcode Organizer.
4. **Nội dung mồi**: rút từ `stories`/`khaitri` nhưng **đăng dưới tên ai?** Kế hoạch: tài khoản của Đăng (đúng nguyên tắc "Đăng = ngang hàng"). Xác nhận trước khi ghi prod.
