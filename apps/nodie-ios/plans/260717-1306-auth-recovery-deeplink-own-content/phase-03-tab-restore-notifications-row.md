# Phase 03 — Khôi phục tab (#20) + hàng "Thông báo" nói thật (#17)

**Ưu tiên:** P2. **Status:** ✅ **XONG 17/07 18:4x** — commit `f304793`. Build xanh; AuthUITests 9/9 + ProfileContentUITests 4/4 xanh. #20 chờ Đăng nghiệm thu tay (xem §Lệch).

## Lệch so với kế hoạch (thực tế lúc thi công)

1. **`RootTabView` KHÔNG còn sạch** — kế hoạch ghi SẠCH, nhưng session kia đã wire chat thật + push vào đó. Xử: logic #20 để hết trong file mới `Shell/TabRestoration.swift`, `RootTabView` chỉ nhận **1 dòng** `.nodieRestoresTab(state: state)` → giảm tối đa nguy cơ bị đè. `AppState.swift` giữ đúng cam kết: **không sửa một dòng nào**.
2. **Chỗ đặt modifier ban đầu SAI** — đặt trước `.id(dynamicTypeSize)` thì mỗi lần user đổi cỡ chữ, cây dựng lại → `.task` chạy lại → kéo user về tab đã lưu (đang ở Chat, chỉnh cỡ chữ, bị ném về Hỏi đáp). Đã chuyển xuống **sau** `.id`.
3. **Thêm chặn tab đã ẩn** — máy cài bản cũ có thể còn lưu `Bảng tin`/`Hành trình`, hai tab đã rút khỏi `visibleTabs` vì còn chạy nội dung giả. Khôi phục mù = mở app thẳng vào màn đang cố ý giấu, tab bar không có nút nào sáng để chỉ đường ra. → `guard NodieTab.visibleTabs.contains(tab)`.
4. **`.nodieRestoresTab` KHÔNG commit kèm** — dòng gọi nằm trong `RootTabView.swift`, file đang giữ việc push chưa commit của session kia. Modifier đã commit; dòng gọi sẽ theo commit của họ.
5. **2 key i18n (`Đang bật`/`Đang tắt`) chưa commit** — `Localizable.xcstrings` đang mang 25 key + một lượt sắp xếp lại của session kia (diff 9.215 dòng). Không nuốt việc của họ vào commit của mình; key sẽ theo commit của họ.

⚠️ **`TouchTargetUITests` 2 test đỏ — KHÔNG phải do phase này**: `testChatControlsHitTargetsAndVietnameseLabels` + `testRowsAreRealButtons` đều tap `"Lab trường thọ #3"` = kênh **MockData**, mà session kia vừa wire chat sang Supabase thật (kênh thật: `naobo`/`thongbao`). Test của họ cũ so với chính việc họ đang làm. Cả 2 không chạm dòng nào của phase này.

## Context

- [plan.md](plan.md) · [phase-04-push-optout-blocked.md](phase-04-push-optout-blocked.md) (phần push thật, đang chặn).

## File

| File | Trạng thái | Việc |
|---|---|---|
| `NODIE/Shell/RootTabView.swift` | SẠCH | `@SceneStorage` nhớ tab |
| `NODIE/Features/Profile/ProfileSections.swift` | SẠCH | bỏ toggle giả, thay bằng hàng thật |
| `NODIE/AppState.swift` | ⛔ **SESSION KIA ĐANG SỬA — KHÔNG ĐỤNG** | — |
| `NODIE/Localizable.xcstrings` | SẠCH | +key × 8 |

## #20 — Khôi phục tab

`AppState.tab` là nguồn sự thật, nhưng `AppState.swift` **đang trong tay session kia** ⇒ làm trọn trong `RootTabView` (sạch), không đụng file họ. `@SceneStorage` vốn phải sống trong View chứ không nhét vào `@Observable` được, nên đây cũng là chỗ đúng về mặt kỹ thuật — không phải né tránh.

```swift
/// Nhớ tab qua lần giết app — người ta đang đọc dở tab Hỏi đáp, mở lại app mà rơi về
/// tab mặc định là mất chỗ. @SceneStorage do hệ thống giữ theo scene (đúng thứ iOS đã cho —
/// không tự dựng cơ chế lưu riêng).
///
/// Lưu rawValue: NodieTab: String với rawValue là chuỗi nguồn cố định ("Hỏi đáp"…),
/// KHÔNG dịch theo máy — user đổi ngôn ngữ không làm hỏng giá trị đã lưu.
@SceneStorage("selectedTab") private var storedTab: String?
```

- Khôi phục: `.task { if let raw = storedTab, let tab = NodieTab(rawValue: raw) { state.tab = tab } }` — `.task` chứ không `.onAppear` (chạy một lần lúc dựng, sau khi `state` đã có).
- Ghi: `.onChange(of: state.tab) { _, new in storedTab = new.rawValue }`.

**Chỉ nhớ tab, không nhớ ngăn xếp điều hướng** (KISS + YAGNI): `feedPath`/`friendsPath` là `NavigationPath` — muốn lưu phải `CodableRepresentation`, mà `FeedRoute`/`FriendsRoute`/`ChatRoute` chưa `Codable`. Đổi lấy việc mở lại app rơi đúng màn detail — chưa ai xin, không đáng nợ. (`qaPath: [String]` thì lưu được, nhưng nhớ 1 tab mà quên 4 tab là kiểu nửa vời khó hiểu hơn là không nhớ.)

Đụng `AppState` = 2 dòng **đọc/ghi `state.tab`** từ RootTabView — không sửa file họ.

## #17 — Toggle "Thông báo" giả

### Hiện trạng (đo)

`ProfileSections.swift:148` `@AppStorage("notificationsEnabled")` + Toggle `:158` — **không ai đọc biến này**. Bật/tắt xong không có gì xảy ra: nói dối người dùng.

### Vì sao KHÔNG nối thẳng vào PushManager ngay

`PushManager` (đã commit `ac3a9db`) có sẵn `removeToken()` và ghi `device_tokens` — nhìn thì đủ. Nhưng:

- `project.yml:34` — `CODE_SIGN_ENTITLEMENTS` **vẫn đang bị comment**; App ID `com.battudao.nodie` chưa có capability Push.
- ⇒ `registerForRemoteNotifications()` luôn rơi vào `didFailToRegister` ⇒ `pendingToken` mãi `nil` ⇒ `device_tokens` **rỗng** ⇒ `removeToken()` không có gì để xoá.

Nối bây giờ = **đổi một toggle giả lấy một toggle giả khác**, tốn thêm việc luồn `PushManager` qua 3 tầng view. Chặn thật nằm ở Apple Developer portal — việc của Đăng, không phải va chạm file. → [phase-04](phase-04-push-optout-blocked.md).

### Làm gì bây giờ (thật 100%, chỉ trong ProfileSections.swift)

Thay Toggle giả bằng **hàng trạng thái thật** đọc quyền hệ thống + mở thẳng cài đặt thông báo của app — đúng cách hàng "Ngôn ngữ" ngay dưới nó đang làm (`openSettingsURLString`, :171), và đúng cách app lớn làm khi chưa có kho tuỳ chọn riêng trên server:

```swift
/// Nguồn sự thật của "có thông báo hay không" là iOS, không phải một cờ trong app:
/// user tắt ở Cài đặt thì cờ nội bộ có bật cũng vô nghĩa. Đọc thẳng chỗ thật rồi đưa
/// người ta tới đúng đó — thay cho @AppStorage cũ không ai đọc.
@State private var pushStatus: UNAuthorizationStatus = .notDetermined
```

- `.task { pushStatus = await UNUserNotificationCenter.current().notificationSettings().authorizationStatus }`
- Hàng: `ProfileRow(icon: "bell", title: "Thông báo", trailing: Text(pushStatus == .authorized ? "Đang bật" : "Đang tắt"))` → mở `UIApplication.openNotificationSettingsURLString` (iOS 16+, target là 17 → dùng thẳng, không cần `#available`) — vào **đúng trang thông báo của app**, không phải trang gốc.
  ⚠️ `trailing` là `Text` → tách nhánh `cond ? Text("Đang bật") : Text("Đang tắt")`, **không** ternary trong `Text(...)` (String Catalog không tra được — LoginView.swift:49 đã ghi lại).
- Đọc lại trạng thái khi quay về app: `.onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification))` — user đổi ở Settings rồi quay lại phải thấy đúng.
- **Xoá** `@AppStorage("notificationsEnabled")`. Không ai đọc nó; để lại là để lại lời nói dối.

Đổi lại: chưa có "tắt push nhưng vẫn giữ quyền hệ thống" (opt-out phía server) — đó là phase-04.

## Test

- #20: mở app → sang tab Chat → **giết app** (vuốt khỏi app switcher) → mở lại → phải ở tab Chat. (Simulator: `xcrun simctl terminate` rồi `launch`.)
- #20 UITest (`launchVietnamese()`, `--uitest-bypass-auth`): `@SceneStorage` **không sống qua `app.terminate()` + `launch()` trong XCUITest** (mỗi lần launch là scene mới, state restoration của UITest không tất định) ⇒ **không viết UITest cho việc này**, nghiệm thu bằng tay. Viết test rung rinh còn hại hơn không có.
- #17: Cài đặt → tắt thông báo của NODIE → quay lại app → hàng phải đổi "Đang tắt"; bấm hàng → nhảy đúng trang thông báo của NODIE.
- `TouchTargetUITests` đang xanh phải giữ xanh (hàng mới vẫn ≥ 44pt: `ProfileRow` đã `padding(.vertical, 14)`).
- Build: `xcodegen generate && xcodebuild ... -destination '...,name=iPhone 17' build`.

## Rủi ro + rollback

| Rủi ro | Mức | Xử |
|---|---|---|
| Session kia đổi `AppState.tab`/`NodieTab` khi đang sửa | TRUNG | `git status` trước; chỉ đọc/ghi `state.tab`, không sửa file họ; xong commit ngay |
| `.task` khôi phục tab đè lên deep link muốn mở tab khác | THẤP (chưa có deep link nào chọn tab) | Nếu sau này có: link thắng, `.task` chỉ chạy khi `storedTab != nil` và chưa có ý định điều hướng |
| Bỏ toggle → Đăng tưởng mất tính năng | THẤP | Hàng vẫn ở đúng chỗ, còn nói đúng hơn trước |

**Rollback:** cả hai đều là sửa cục bộ trong 1 file, `git checkout` từng file là xong.

## Xong khi

1. Giết app mở lại → đúng tab cũ.
2. Hàng "Thông báo" phản ánh đúng quyền thật của iOS, bấm vào ra đúng trang; `@AppStorage("notificationsEnabled")` đã bị xoá khỏi mã.
3. `AppState.swift` **không có một dòng thay đổi nào**.
4. Build xanh, UITests hiện-xanh vẫn xanh, key mới đủ 8 ngôn ngữ.
