# Phase 05 — Captcha Turnstile end-to-end

**Mục:** C-04 (P0 vì TestFlight public link) · **Đợt B** · Ước lượng **1 ngày** · Status: ⬜
**Model:** Fable — đụng auth có khả năng **khoá sạch build cũ** + **vỡ auto-login UITests**; 2 câu hỏi mở chưa chốt. Loại lỗi "bật xong mới biết" — cần model tự nghi ngờ và verify từng nhánh (signup/signin/recover) bằng build thật.

## Điều kiện tiên quyết (CỨNG)

1. **Phase 01 đã deploy** — `https://battudao.com/turnstile-embed.html` trả 200 trên domain đã whitelist sitekey.
2. **Plan 1933 đã land** — đợt B đụng `LoginView` + `project.yml`; hai phiên cùng build = đua ghi `Localizable.xcstrings`.
3. **Đăng cấp:** Turnstile `sitekey` (app, qua `Config/Secrets.xcconfig`) + `secret` (Supabase Auth). **Chưa có thì không bắt đầu.**

## Context links

- Report: `...-beyond-ux-audit-appstore-ops-report.md` (C-04)
- Hợp đồng bridge native ↔ web: `apps/web/public/turnstile-embed.html` (phase 01) — `window.webkit.messageHandlers.turnstile.postMessage({kind, value})`, `kind ∈ {token, error, expired}`.
- Call site auth: `NODIE/Auth/AuthStore.swift` — `signIn` (130), `signUp` (145), `sendPasswordReset` (183), `autoLoginForUITestsIfRequested` (80).
- supabase-swift **v2.49.0** — chữ ký đã verify (plan.md): `signUp(...captchaToken:)`, `signIn(...captchaToken:)`, `resetPasswordForEmail(...captchaToken:)`.

## Sự thật đã đo (đừng đo lại)

- `security_captcha_enabled = False`, `security_captcha_provider = hcaptcha` (mặc định) — **phải đổi provider sang `turnstile`** khi bật, nếu không secret không khớp.
- **Turnstile KHÔNG có SDK native iOS** → WKWebView trỏ trang tĩnh thật (phase 01 đã làm), `loadHTMLString`+baseURL giả không qua domain-check.
- `disable_signup = False` — signup đang mở, đó là lý do captcha gấp.

## Overview

Bật Turnstile ở Supabase Auth là **server-side**: mọi request signup/signin/recover **không kèm** `captchaToken`
bị chặn ngay. Vì vậy client phải lấy token TRƯỚC ba hành động đó. Token lấy qua WKWebView nhúng `turnstile-embed.html`.

## ⚠️ Hai bẫy phải xử, không được lờ (câu hỏi mở #1, #2 của plan)

1. **Bật captcha khoá sạch build cũ.** Enable server-side → mọi build không gửi token bị chặn. Hôm nay chỉ Đăng
   có build → bật trước public link là an toàn. **Xác nhận số tester tại thời điểm chạy phase này**; nếu đã có
   tester ngoài → phải ép họ cập nhật build trước khi bật.
2. **Captcha làm vỡ auto-login UITests.** `autoLoginForUITestsIfRequested` (AuthStore:80) gọi thẳng `signIn`
   **không token**. Bật captcha server-side = auto-login chết = suite auth đỏ toàn bộ.
   **Cách xử (chốt ở đây):** đường DEBUG/UITest dùng **Turnstile test sitekey** `1x00000000000000000000BB` (luôn pass,
   invisible) và Supabase test secret tương ứng `1x0000000000000000000000000000000AA` — token test luôn hợp lệ,
   auto-login đi qua đúng provider mà không cần người bấm. **KHÔNG** tắt captcha riêng cho test (khác đường prod =
   test không còn chứng minh prod). Nếu CI đỏ vì mạng Cloudflare → cân nhắc project staging riêng (**chưa có** —
   cần Đăng quyết nếu chạm).

## Files

**Tạo**
- `NODIE/Auth/TurnstileWebView.swift` — `UIViewRepresentable` bọc WKWebView, `WKScriptMessageHandler` nhận `{kind,value}`, load `https://battudao.com/turnstile-embed.html?sitekey=<key>`.
- `NODIE/Auth/CaptchaCoordinator.swift` (hoặc gộp) — `func token() async throws -> String`: hiện sheet chứa TurnstileWebView, chờ `kind:token`, ném khi `error`, xin lại khi `expired`.

**Sửa**
- `NODIE/Auth/AuthStore.swift` — `signIn`/`signUp`/`sendPasswordReset` nhận `captchaToken`, truyền xuống SDK. `autoLoginForUITestsIfRequested` lấy token qua test sitekey.
- `NODIE/Auth/LoginView.swift` — trước khi gọi `signUp`/`signIn`, lấy token (hiện captcha nếu widget không invisible-pass).
- `NODIE/…/ForgotPassword*` — call site `sendPasswordReset`.
- `Config/Secrets.xcconfig` (qua `generate-secrets-xcconfig.sh`) + `.env` — thêm `TURNSTILE_SITEKEY`. **Đọc từ Info.plist như `SUPABASE_HOST`**, không hardcode.

**Xoá:** không

## Implementation steps

1. **Xác nhận prerequisite** (phase 01 deploy? 1933 land? Đăng cấp key/secret? số tester?). Thiếu bất kỳ → dừng, báo.
2. **`TurnstileWebView`:** WKWebView + `WKUserContentController.add(self, name: "turnstile")`; `didReceive message` decode `{kind, value}`; load URL thật với `?sitekey=` từ Info.plist. Xử `error`/`expired` theo hợp đồng.
3. **`CaptchaCoordinator.token()`:** trả token; với test sitekey invisible → token về gần như tức thì, không cần UI. Với key thật interactive → hiện sheet.
4. **AuthStore:** thêm `captchaToken` vào 3 lời gọi SDK. `autoLoginForUITestsIfRequested`: lấy token test trước khi `signIn`.
5. **LoginView / ForgotPassword:** lấy token trước hành động; lỗi captcha → thông báo tại chỗ (nối error taxonomy 1933 phase 07 nếu đã có).
6. **Bật ở Supabase (Đăng hoặc có secret):** `security_captcha_enabled=true`, `security_captcha_provider=turnstile`, dán secret. **Bật SAU khi build mới sẵn sàng** — thứ tự: build có token → test xanh → mới bật server.
7. `xcodegen generate` (file .swift mới) → build → **UITests auth xanh 3 lần liên tiếp**.

## Todo

- [ ] Xác nhận 3 prerequisite + số tester
- [ ] `TurnstileWebView` + message handler theo hợp đồng phase 01
- [ ] `CaptchaCoordinator.token()`
- [ ] 3 call site AuthStore nhận captchaToken
- [ ] LoginView + ForgotPassword lấy token trước hành động
- [ ] auto-login UITest dùng test sitekey
- [ ] `TURNSTILE_SITEKEY` vào xcconfig/Info.plist (không hardcode)
- [ ] Bật Supabase provider=turnstile + secret (đúng thứ tự)
- [ ] UITests auth xanh 3× liên tiếp

## Success criteria

1. Bật captcha ở Supabase xong: **đăng ký / đăng nhập / quên mật khẩu vẫn chạy** trên build mới.
2. UITests auth **xanh 3 lần liên tiếp** (không flaky vì token).
3. Thử signin bằng script KHÔNG kèm token → Supabase trả lỗi captcha (chứng minh server đã bật thật, không phải client giả vờ).
4. Widget hiện đúng trên màn đăng ký (hoặc invisible-pass với test key), không lỗi console web.

## Risks + rollback

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Bật captcha khoá tester đang có build cũ | **Cao** | Đếm tester trước; ép cập nhật; bật ngay trước public link |
| Auto-login UITest chết → suite đỏ toàn bộ | **Cao** | Test sitekey invisible-pass, cùng đường prod |
| Provider vẫn là hcaptcha → secret không khớp | Trung bình | Đổi `security_captcha_provider=turnstile` khi bật |
| Sitekey chưa whitelist `battudao.com` | Trung bình | Bước 8 phase 01 xong trước |
| CI đỏ vì mạng Cloudflare | Trung bình | Cân nhắc staging (chưa có — hỏi Đăng) |

**Rollback:** tắt `security_captcha_enabled` ở Supabase = mọi build (có/không token) chạy lại. Client giữ token vẫn tương thích (server bỏ qua khi tắt). Gỡ code captcha là bước hai, không gấp.

## Security

- **Secret KHÔNG vào app** — chỉ sitekey (public theo thiết kế Turnstile). Secret sống ở Supabase Auth.
- Không log token ra console prod.
- Test secret/sitekey là key TEST của Cloudflare (công khai, luôn pass) — an toàn để commit đường DEBUG; **không** dùng key thật cho test.

## Next

→ Sau phase này auth đã có bot protection cho public link. → Phase 07: xác nhận với Đăng đã bật captcha trước khi Submit; ghi vào Review Notes rằng app dùng Turnstile (reviewer không bị chặn vì có build kèm token).
