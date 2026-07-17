# Phase 04 — Tắt push thật (phần còn lại của #17) · **ĐANG CHẶN**

**Status:** 🚫 CHẶN — không phải vì va chạm file, mà vì thiếu capability bên Apple.
**Không làm được ở đợt này.** Ghi ra đây để không ai tưởng #17 đã xong trọn vẹn.

## Việc còn thiếu

[phase-03](phase-03-tab-restore-notifications-row.md) đã bỏ toggle giả, thay bằng hàng trạng thái thật (đọc quyền iOS + mở đúng trang cài đặt). Cái **chưa** có:

> Tắt thông báo **từ trong app** mà vẫn giữ quyền hệ thống — tức opt-out phía server: xoá hàng `device_tokens` của **máy này** → server không đẩy push nữa; bật lại → đăng ký lại.

Đây mới là thứ FB/IG/Zalo làm (tuỳ chọn trong app, độc lập với quyền OS).

## Vì sao chặn (đã đo, không phỏng đoán)

| Mắt xích | Trạng thái |
|---|---|
| `PushManager.swift` (`ac3a9db`) — có sẵn `removeToken()`, upsert `device_tokens` | ✅ có |
| Bảng `device_tokens` (0017) — `user_id, token, platform, updated_at`, PK `token` | ✅ có |
| `project.yml:34` `CODE_SIGN_ENTITLEMENTS` | ❌ **đang comment** |
| App ID `com.battudao.nodie` có capability Push Notifications | ❌ chưa |
| Khoá APNs (`.p8` có tick APNs) | ❌ chưa (`AuthKey_AYLK6Z9A58.p8` là khoá **App Store Connect API** — ký JWT gọi APNs sẽ trả 403 `InvalidProviderToken`; ghi rõ ở `project.yml:44-46`) |

⇒ Hôm nay `registerForRemoteNotifications()` **luôn** rơi vào `didFailToRegister` → `pendingToken` mãi `nil` → `device_tokens` **rỗng** → `removeToken()` không có gì để xoá.
**Làm bây giờ = đổi toggle giả này lấy toggle giả khác**, chỉ khác là tốn thêm code luồn `PushManager` qua 3 tầng view.

Va chạm file **không** phải lý do: `PushManager.swift`, `NodieApp.swift`, `project.yml` đều đã sạch từ `ac3a9db`.

## Mở khoá bằng cách nào — việc của Đăng

Đúng thứ tự trong `project.yml:41-47`, thiếu bước nào cũng hỏng:

1. developer.apple.com → Identifiers → `com.battudao.nodie` → tick **Push Notifications**
2. Tạo **lại** profile "NODIE App Store" (profile cũ không tự mọc thêm capability)
3. Keys → khoá **MỚI** có tick "Apple Push Notifications service (APNs)" — **không** dùng lại `AuthKey_AYLK6Z9A58.p8`
4. Điền `APNS_KEY_ID` + `APNS_KEY_PATH` vào `.env`, bỏ comment `CODE_SIGN_ENTITLEMENTS` ở `project.yml:34`

Xong bước 4 thì phase này mới có nghĩa.

## Làm gì khi hết chặn

| File | Việc |
|---|---|
| `project.yml` | bỏ comment `CODE_SIGN_ENTITLEMENTS` |
| `NODIE/Features/Push/PushManager.swift` | `pendingToken` đang `private` → cần đường hỏi "máy này có token chưa"; `removeToken()` đang `guard let pendingToken` → sau khi tắt/bật lại phải đăng ký lại được |
| `NODIE/NodieApp.swift` | `.environment(appDelegate.push)` để khỏi luồn tay qua `RootTabView` → `ProfileView` → `ProfileSettingsSection` (3 tầng chỉ để mang 1 object) |
| `NODIE/Features/Profile/ProfileSections.swift` | Toggle thật: tắt → `await push.removeToken()`; bật → `await push.requestAuthorizationAndRegister()`. Quyền OS đang tắt → toggle không tự bật được, phải đẩy sang Cài đặt (giữ hàng của phase-03 cho ca đó) |
| `supabase/migrations/` | **Chưa cần.** `device_tokens` đủ dùng: không có hàng = không nhận push. Chỉ cần bảng `notification_prefs` nếu sau này muốn tách loại (DM / trả lời / nhắc) — YAGNI |

Ước lượng sau khi hết chặn: ~1 phase nhỏ, không có migration.

## Rủi ro cần nhớ cho lúc làm

| Rủi ro | Ghi chú |
|---|---|
| Token theo **máy**, không theo người | Tắt ở máy này không được tắt máy khác của họ. `removeToken()` xoá theo `token` (PK) — đúng; đừng bao giờ `delete().eq("user_id", uid)` (giết push mọi thiết bị) |
| Sandbox vs production | Build dev lấy token APNs sandbox, TestFlight/App Store là production — đẩy nhầm môi trường thì APNs trả `BadDeviceToken` cho token hoàn toàn hợp lệ (`project.yml:56-58`) |
| Tắt push rồi đăng xuất/đăng nhập lại | `saveTokenIfPending()` chạy lúc `.signedIn` (NodieApp.swift:58-62) sẽ **ghi token trở lại** → push tự bật lại sau lưng user. Phải nhớ ý muốn "đã tắt" ở đâu đó cục bộ và tôn trọng nó ở chỗ đăng ký |

## Xong khi (ngày nào đó)

1. Tắt trong app → máy này im, máy khác cùng tài khoản vẫn nhận.
2. Bật lại → đăng ký lại, nhận được push thật.
3. Đăng xuất/đăng nhập lại **không** tự bật lại push sau lưng user.
