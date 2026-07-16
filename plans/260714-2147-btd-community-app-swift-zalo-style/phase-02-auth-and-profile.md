# Phase 02 — Auth thật + màn Cá Nhân

**Status:** ✅ DONE · 2026-07-15 · 14/14 UI test pass (6 test auth gọi Supabase thật), build sạch không warning
**Trigger:** Đăng: "tab Cá Nhân (profile/cài đặt/đăng xuất)" → chọn "làm luôn auth thật trước"

## Quyết định (Đăng chốt 260715)

1. **KHÔNG thêm tab thứ 5.** Giữ 4 tab. Vào Cá Nhân qua **avatar "M"** góc header Bảng tin — prototype đã đặt sẵn (`FeedView.swift:32-36`), pattern của IG/X. Không lệch prototype.
2. **Nội dung:** Hồ sơ + Cài đặt + Đăng xuất, + Câu hỏi/trả lời của tôi, + Đã lưu.
   *Không chọn `ai_consent`* — xem "Cần chốt" bên dưới.
3. **Auth thật, không mock.**

## Scout — trạng thái Supabase thật (kiểm tra 260715)

| Phát hiện | Ảnh hưởng |
|---|---|
| `disable_signup: false` | Public sign-up ĐANG BẬT trên prod. Plan cũ ghi "no public sign-up" → **sai, đã sửa**. App cộng đồng thì bật là đúng. |
| `mailer_autoconfirm: false` | Đăng ký **bắt buộc xác nhận email** → flow cần state "kiểm tra hộp thư", không login thẳng sau signUp. |
| Chỉ provider `email` | Không có social login → **App Store KHÔNG bắt buộc Sign in with Apple** (guideline 4.8 chỉ áp khi có social khác). Bỏ qua, YAGNI. |
| Migration tới `0016` | Bảng mới phải từ `0017`. |
| **Chưa có `questions`/`answers`/`bookmarks`** | 2 mục "của tôi" + "Đã lưu" **chỉ mock được** ở phase này. |
| `profiles` đã live | `id`, `role`, `bio`, `display_name`, trigger `handle_new_user` tự tạo row role='user'. Hồ sơ thật được. |

## Scope

**Thật:** login/signup email+password, xác nhận email, session persist, đọc/sửa `profiles`, đăng xuất.
**Mock (có TODO rõ):** Câu hỏi/trả lời của tôi, Đã lưu — chờ schema phase 01.
**Ngoài scope:** Sign in with Apple, quên mật khẩu, đổi avatar ảnh (dùng chữ cái đầu), tab thứ 5.

## Acceptance criteria — PASS

- [x] Chưa đăng nhập → Login, không vào được app · `testSignedOutShowsLoginAndBlocksApp`
- [x] Đăng nhập thật → vào app · `testSignInThenOpenProfileShowsRealData`
- [x] Session sống qua relaunch (Keychain) · `testSessionPersistsAcrossRelaunch`
- [x] Avatar → push Cá Nhân, vuốt-back được, tab bar ẩn · `testSwipeBackFromProfileAndTabBarHides`
- [x] Cá Nhân hiện `display_name`+`role` THẬT từ `profiles` qua RLS self-read (assert `"mr.dang1305"` + `"Quản trị viên"`, không hardcode)
- [x] Đăng xuất → về Login, session sạch · `testSignOutReturnsToLogin`
- [x] Sai mật khẩu → lỗi tiếng Việt, không crash · `testWrongPasswordShowsVietnameseError`
- [x] Build sạch không warning; **14/14 test pass; 8 test cũ không hỏng**
- [ ] ~~Đăng ký email mới → "kiểm tra hộp thư"~~ — UI + logic đã có (`Phase.awaitingEmailConfirmation`), chưa test tự động vì cần hòm thư thật. **Cần Đăng thử tay.**
- [ ] ~~Sửa bio → lưu Supabase~~ — code có (`updateProfile`), chưa test tự động. **Cần Đăng thử tay.**

## Kết quả — 3 lỗi bị bắt, mỗi cái bằng một cách khác nhau

### 1. Config bị cắt cụt — test bắt
6 test auth fail hết lượt đầu: app kẹt, không ra nổi màn Login. Đào ra `Info.plist` có `SUPABASE_URL = "https:"`.
**Nguyên nhân: xcconfig coi `//` là mở comment** → `https://host` bị nuốt từ `//` trở đi. Script của tôi đã cố né bằng cách tách scheme/host nhưng `://` vẫn dính.
**Fix:** xcconfig chỉ giữ `SUPABASE_HOST`, Swift ghép `https://\(host)`. Lỗi này im lặng tuyệt đối — build xanh, chỉ chết lúc chạy.

### 2. Tab bar đè lên màn Cá Nhân — ẢNH bắt, test không
Thêm `feedPath` nhưng quên khai trong `showsTabBar` (vẫn ghi `case .feed: return true` = "feed không bao giờ có detail" — câu đó thành nói dối). 14 test vẫn xanh; chỉ nhìn ảnh mới thấy tab bar còn đó trong khi 2 màn detail khác đều ẩn.
**Fix:** khai `feedPath` + thêm assert vào test để không tái diễn.

### 3. Auth gate làm hỏng 8 test cũ — dự đoán được, đã xử
8 test gesture giả định vào thẳng app. Thêm `--uitest-bypass-auth` (DEBUG-only, launch-arg gated) cho chúng bỏ qua đăng nhập — chúng soi gesture, không soi auth. Test auth thì dùng `--uitest-reset-auth` + tài khoản thật, không mock.

## Quyết định kỹ thuật

- **Anon key ra khỏi git.** Ban đầu định nhét thẳng `project.yml` — sai, kể cả với key public-safe. Giờ: `Config/Secrets.xcconfig` (gitignored) sinh từ `.env` bằng `scripts/generate-secrets-xcconfig.sh`. Xác minh bằng `git check-ignore`.
- **`AuthStore` tách khỏi `AppState`** — auth có vòng đời khác state UI.
- **`authStateChanges` là nguồn sự thật duy nhất cho `phase`** — `signIn()` không tự set `.signedIn`, tránh hai nguồn sự thật.
- **`ProfileUpdate` cố tình không có `role`** — an toàn từ thiết kế, không chỉ dựa RLS.
- **Không tự làm session persist** — supabase-swift đã lo Keychain + refresh token (theo memory: không hand-roll thứ SDK đã cho).
- **Không Sign in with Apple** — Supabase chỉ bật provider `email`; không có social login nào khác nên App Store không bắt buộc (guideline 4.8). YAGNI.

## Files

Sửa: `project.yml` (+SPM Supabase, +configFiles, +Info.plist keys), `NODIE/NodieApp.swift` (+RootView gate), `NODIE/Shell/RootTabView.swift` (+auth, +feedPath stack), `NODIE/AppState.swift` (+feedPath, +FeedRoute, sửa showsTabBar), `NODIE/Features/Feed/FeedView.swift` (avatar → Button), `NODIEUITests/SwipeBackUITests.swift` + `SwipeActionsUITests.swift` (+bypass arg, sửa comment sai)
Tạo: `scripts/generate-secrets-xcconfig.sh`, `NODIE/Auth/{SupabaseClientProvider,AuthStore,UserProfile,LoginView}.swift`, `NODIE/Features/Profile/{ProfileView,ProfileSections}.swift`, `NODIEUITests/AuthUITests.swift`

## Nợ kỹ thuật

- "Câu hỏi của tôi" / "Trả lời của tôi" / "Đã lưu" → nhãn **"Sắp có"**, chưa có bảng (`questions`/`answers`/`bookmarks` chưa tồn tại; migration mới tới 0016). Wire ở phase 01+03.
- Cài đặt "Thông báo" mới là `@AppStorage`, chưa nối APNs. "Ngôn ngữ" mới là nhãn tĩnh.
- Chưa có "quên mật khẩu".
- Avatar mới là chữ cái đầu, chưa cho upload ảnh.

## Thiết kế

```
NodieApp
 └── RootView            ← gate: có session? RootTabView : LoginView
      ├── LoginView      ← email/pw, toggle đăng ký, state "kiểm tra hộp thư"
      └── RootTabView
           └── tab .feed → NavigationStack(path: feedPath)
                             FeedView (avatar "M" = Button → push .profile)
                             └── ProfileView
```

- `AuthStore` (@Observable): `session`, `profile`, `signIn`, `signUp`, `signOut`, `updateBio`. Tách khỏi `AppState` — auth là vòng đời khác, không trộn với state UI.
- `feedPath: [FeedRoute]` với `enum FeedRoute { case profile }` — Feed cần NavigationStack để push (hiện chưa có).
- Anon key + URL: **không phải secret** (RLS bảo vệ; đã public trong bundle web). Đặt trong Info.plist qua `project.yml`, đọc lúc chạy — cấu hình, không phải code.

## Files

Sửa: `project.yml` (+ supabase-swift SPM, + Info.plist keys), `NODIE/NodieApp.swift`, `NODIE/Shell/RootTabView.swift`, `NODIE/Features/Feed/FeedView.swift`
Tạo: `NODIE/Auth/AuthStore.swift`, `NODIE/Auth/LoginView.swift`, `NODIE/Auth/SupabaseClientProvider.swift`, `NODIE/Features/Profile/ProfileView.swift`, `NODIE/Features/Profile/ProfileSections.swift`, `NODIEUITests/AuthUITests.swift`

## Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| **Màn login không có trong prototype** — tôi tự thiết kế | Dùng đúng design token; báo Đăng review, có thể redesign trong Claude Design sau |
| UI test cần tài khoản thật → gọi mạng, chậm/giòn | Test auth tách riêng; test UI khác vẫn chạy độc lập |
| Session persist sai → user phải login lại mỗi lần | Test kill-and-relaunch thật |
| supabase-swift kéo nhiều dependency | Chỉ import `Auth` + `PostgREST`, không lấy nguyên gói |

## Cần chốt

- **`ai_consent`**: Đăng không chọn. Nhưng đang bật public sign-up + plan có `v_ai_corpus` lọc theo consent. Nếu bỏ qua bây giờ thì lúc bật AI corpus (phase 06) phải xin consent hồi tố cho toàn bộ user cũ — đắt và mất niềm tin. Đề xuất: thêm công tắc (mặc định TẮT) ngay từ giờ, rẻ hơn nhiều.
- Màn login tự thiết kế — Đăng có muốn design lại trong Claude Design không?
