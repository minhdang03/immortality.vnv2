# Phase 01 — Deep link `nodie://` (#16) + Quên mật khẩu (#14)

**Ưu tiên:** P0 (#14 là lỗi nặng nhất: quên mật khẩu = mất tài khoản vĩnh viễn).
**Status:** chưa bắt đầu.
**Gộp #16 vào đây** vì #14 không chạy được nếu không có đường quay lại app.

## Context

- [plan.md](plan.md) — mục "Sự thật đã đo" (1) và (2) là gốc của mọi quyết định dưới đây.
- SDK: supabase-swift **2.49.0** (`Package.resolved`), checkout tại
  `~/Library/Developer/Xcode/DerivedData/NODIE-*/SourcePackages/checkouts/supabase-swift`.

## Phát hiện quyết định thiết kế (đã đọc mã SDK, không phỏng đoán)

`.passwordRecovery` **không bao giờ nổ** trong app này:

- `AuthClient.swift:986` — `emit(.passwordRecovery)` nằm **trong `handleImplicitGrantFlow`**, và chỉ ở đó.
- `Defaults.swift:32` — `defaultFlowType: AuthFlowType = .pkce`.
- `SupabaseClientProvider` dựng `SupabaseClient(supabaseURL:supabaseKey:)` → option mặc định → **PKCE**.
- PKCE: `session(from:)` → `handlePKCEFlow` → `exchangeCodeForSession` → **chỉ** `emit(.signedIn)` (`:726`).

⇒ Hai hệ quả bắt buộc:

1. **Không nghe event.** Tự đọc URL để biết ý định là "đặt lại mật khẩu".
2. **Đổi code xong là `phase = .signedIn`** (vòng `authStateChanges` sẵn có bắt `.signedIn` → `.signedIn`).
   LoginView bị gỡ khỏi cây ngay lúc đó ⇒ **sheet mật khẩu mới KHÔNG được đặt ở LoginView** (đề bài gợi ý thế — sai).
   Đặt ở `RootView` (NodieApp.swift): sống qua cả hai phase, một chỗ duy nhất (DRY).

**Không** đổi `flowType` sang `.implicit` để "cho event nổ": PKCE an toàn hơn, đổi là hạ cấp bảo mật toàn app cho tiện một màn.

## Yêu cầu

- Login có "Quên mật khẩu?" → nhập email → gửi link.
- Bấm link trong mail → app mở (kể cả app đã tắt hẳn) → màn đặt mật khẩu mới → xong → vào app.
- Link hỏng/hết hạn/mở nhầm máy → báo tiếng Việt, không treo, quay về Login được.
- Mail xác nhận đăng ký cũng quay về app (`nodie://email-confirmed`).

## File

| File | Trạng thái | Việc |
|---|---|---|
| `project.yml` | SẠCH (vừa commit `ac3a9db`) | +`CFBundleURLTypes` |
| `NODIE/NodieApp.swift` | SẠCH | +`.onOpenURL` +`.fullScreenCover` trên `RootView` |
| `NODIE/Auth/AuthStore.swift` | SẠCH | +3 hàm, +1 cờ |
| `NODIE/Auth/LoginView.swift` | SẠCH | +nút "Quên mật khẩu?" +sheet |
| `NODIE/Auth/PasswordRecoveryViews.swift` | **TẠO** | 2 màn, ~160 dòng |
| `NODIE/Localizable.xcstrings` | SẠCH nhưng họ hay đụng | +key mới × 8 ngôn ngữ |

## Các bước

### 1. `project.yml` — khai scheme

Edit **đúng chuỗi, cộng thêm** (không ghi đè cả file — họ vừa thêm 25 dòng push vào đây). Chèn dưới `ITSAppUsesNonExemptEncryption: false` trong `targets.NODIE.info.properties`:

```yaml
        # Supabase gọi lại app qua scheme này sau khi user bấm link trong mail
        # (đặt lại mật khẩu / xác nhận đăng ký). Custom scheme chứ không Universal Links:
        # không phải dựng apple-app-site-association trên battudao.com — đổi lại iOS chen
        # một nhịp hỏi "Mở trong NODIE?".
        CFBundleURLTypes:
          - CFBundleURLName: com.battudao.nodie
            CFBundleURLSchemes: [nodie]
```

`xcodegen generate` → mở `NODIE/Info.plist` xác nhận key có thật.

### 2. `AuthStore.swift`

```swift
/// Đang ở giữa luồng đặt lại mật khẩu (mở từ link trong mail).
///
/// Vì sao là cờ tự quản chứ không nghe `.passwordRecovery`: SDK CHỈ phát event đó ở nhánh
/// implicit flow (AuthClient.swift:986), mà app chạy PKCE (mặc định) → link recovery đi
/// đường exchangeCodeForSession, chỉ phát `.signedIn`. Nghe event = chờ thứ không tới.
private(set) var isRecoveringPassword = false
private(set) var didSendResetEmail = false
```

- `sendPasswordReset(email:)` → `run { try await client.auth.resetPasswordForEmail(email, redirectTo: Self.resetURL) }`, xong set `didSendResetEmail = true`.
- `handleOpenURL(_ url: URL) async`:
  ```swift
  // Đặt cờ TRƯỚC khi đổi code: exchange xong là authStateChanges bắn `.signedIn` ngay,
  // phase nhảy sang .signedIn và cây view đổi — lúc đó mới set là đã trễ một nhịp render.
  if url.host == "password-reset" { isRecoveringPassword = true }
  do { try await client.auth.session(from: url) }
  catch { errorMessage = Self.viMessage(for: error); isRecoveringPassword = false }
  ```
- `updatePassword(_ new: String)` → `run { _ = try await client.auth.update(user: UserAttributes(password: new)) }`; hết lỗi thì `isRecoveringPassword = false`.
  (`UserAttributes.password` có thật — Types.swift:647. `update(user:redirectTo:)` — AuthClient.swift:1271.)
- `cancelPasswordRecovery()` → `isRecoveringPassword = false`. **Không** signOut: link recovery đã là session hợp lệ, huỷ giữa chừng thì để họ ở trong app như vừa đăng nhập — đó đúng là mô hình của Supabase.
- `signUp(...)`: thêm `redirectTo: Self.confirmURL` để mail xác nhận cũng quay về app (`signUp(email:password:data:redirectTo:captchaToken:)` — AuthClient.swift:367).
- Hằng: `static let resetURL = URL(string: "nodie://password-reset")!`, `static let confirmURL = URL(string: "nodie://email-confirmed")!`.
- Thêm vào `viMessage(for:)`: bắt `pkce` / `code verifier` / `expired` / `invalid` → `"Link đã hết hạn hoặc mở trên máy khác. Gửi lại giúp mình nhé."`

### 3. `NodieApp.swift` — 2 modifier trên `ZStack` của `RootView`

```swift
// Bắt link ở ĐÂY chứ không ở LoginView: lúc iOS mở app từ link trong mail mà app đang
// tắt hẳn, phase còn là .restoring → LoginView chưa có trong cây → handler gắn ở đó
// không kịp đăng ký và URL rơi mất. RootView là thứ duy nhất luôn sống.
.onOpenURL { url in Task { await auth.handleOpenURL(url) } }
// Cover ở RootView vì đổi code xong phase nhảy .signedIn ngay (PKCE chỉ phát .signedIn)
// → LoginView bị gỡ. Đặt cover ở LoginView là nó biến mất cùng chủ.
.fullScreenCover(isPresented: Binding(
    get: { auth.isRecoveringPassword },
    set: { if !$0 { auth.cancelPasswordRecovery() } }
)) { NewPasswordSheet(auth: auth) }
```

Binding hai chiều thật, **không** `.constant` — RootTabView.swift:95 đã ghi lại vì sao (host kẹt lại nuốt chạm).

### 4. `PasswordRecoveryViews.swift` (mới)

- `ForgotPasswordSheet(auth:)` — ô Email, nút "Gửi link đặt lại", gửi xong đổi sang trạng thái "đã gửi" (dùng lại bố cục ✉️ của `EmailConfirmationView`), nút "Xong" đóng sheet.
- `NewPasswordSheet(auth:)` — ô mật khẩu mới (`.textContentType(.newPassword)`), enable khi ≥ 6 ký tự, nút "Lưu mật khẩu", hiện `auth.errorMessage`.
- Dùng token sẵn có (`NodieColors`, `NodieTypography`, `NodieSpacing`); mượn helper `field(...)` — **không** copy: nếu phải dùng ở 2 file thì tách helper dùng chung, đừng nhân bản (DRY).
- `accessibilityIdentifier` tiếng Việt cố định cho UITests bám.

### 5. `LoginView.swift`

Nút "Quên mật khẩu?" đặt dưới ô mật khẩu, **chỉ khi `!isSignUp`** → `.sheet(isPresented:) { ForgotPasswordSheet(auth: auth) }`.
Text tách nhánh, không ternary trong `Text`.

### 6. i18n

Key mới (key = literal VI, đủ 8 ngôn ngữ): `Quên mật khẩu?` · `Đặt lại mật khẩu` · `Nhập email của bạn, mình gửi link đặt lại.` · `Gửi link đặt lại` · `Mật khẩu mới` · `Đặt mật khẩu mới` · `Lưu mật khẩu` · `Xong` · `Link đã hết hạn hoặc mở trên máy khác. Gửi lại giúp mình nhé.`

## Việc của Đăng (chặn nghiệm thu, không code được)

**Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**, thêm đúng 2 dòng:

```
nodie://password-reset
nodie://email-confirmed
```

Thiếu → Supabase từ chối `redirect_to`, mail không về app được. Không có đường nào làm bằng psql/CLI.

## Test

- Thủ công (bắt buộc, vì cần hộp thư thật): Login → Quên mật khẩu → email thật → mở Mail trên máy/simulator → bấm link → Safari nhảy → "Mở trong NODIE?" → đặt mật khẩu mới → vào app → đăng xuất → đăng nhập bằng mật khẩu mới.
- Cold start: **tắt hẳn app** (vuốt khỏi app switcher) rồi mới bấm link — đây là ca `.onOpenURL` ở LoginView sẽ chết, phải xanh.
- Link hết hạn: bấm lại link cũ lần 2 → phải ra thông báo tiếng Việt, không treo.
- UITest (`AuthUITests`, `launchVietnamese()`): chỉ khẳng định nút "Quên mật khẩu?" có + sheet mở + gửi email rỗng thì nút tắt. **Không** test đầu-cuối: cần hộp thư, sẽ thành test rung rinh.
- Build: `xcodegen generate && xcodebuild ... -destination 'platform=iOS Simulator,name=iPhone 17' build`.

## Rủi ro + rollback

| Rủi ro | Mức | Xử |
|---|---|---|
| Session kia sửa `project.yml`/`NodieApp.swift` cùng lúc | THẤP (vừa commit, đang ở Chat/AppState) | `git status` trước khi sửa; edit đúng-chuỗi; xong thì commit ngay |
| Quên whitelist trên Dashboard | CAO (dễ quên nhất) | Nghiệm thu bằng mail thật, không "chắc là chạy" |
| PKCE: xin reset máy A, mở link máy B → không có code_verifier → exchange lỗi | TRUNG (bản chất PKCE) | Thông báo tiếng Việt rõ; không cố vá |
| `url.host` nil nếu link thành `nodie:password-reset` | THẤP | So cả `host` lẫn `path`; log ở DEBUG |

**Rollback:** gỡ 2 modifier ở `NodieApp.swift` + nút ở `LoginView` → về nguyên trạng. `CFBundleURLTypes` để lại vô hại.

## Xong khi

1. Đặt lại mật khẩu chạy thật đầu-cuối trên máy thật, cả lúc app đã tắt hẳn.
2. Link hỏng → tiếng Việt, không treo.
3. Mail xác nhận đăng ký mở thẳng app.
4. Build xanh, UITests hiện-xanh vẫn xanh, key mới đủ 8 ngôn ngữ.
