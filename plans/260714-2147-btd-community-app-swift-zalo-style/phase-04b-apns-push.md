# Phase 04b — APNs push (đăng ký thiết bị + Edge Function gửi)

**Status:** ⬜ chưa bắt đầu · P1 · ~3h
**Chặn bởi:** phase 04 (cần message insert thật để trigger push). **Chặn:** không.
**Trigger:** plan.md §Backend — *"DM không push = DM chết."* Đăng đã có sẵn khoá `.p8` APNs.

## Context links

- [plan.md](plan.md) §Backend — push qua `device_tokens`
- [phase-04](phase-04-conversations-wire.md) — message insert là nguồn sự kiện push
- `supabase/migrations/0017_nodie_community.sql:109-116` — bảng `device_tokens(user_id, token, platform, updated_at)` **đã tồn tại** (sau phase 01)
- `apps/nodie-ios/project.yml` — target NODIE, `DEVELOPMENT_TEAM X6L54S9V87`, chưa có `.entitlements`
- `apps/nodie-ios/NODIE/Auth/AuthStore.swift` — nơi biết `auth.uid()` để gắn token

## Overview

Bật push cho tin nhắn: iOS xin quyền + đăng ký APNs → upsert token vào `device_tokens` → Supabase Edge Function ký JWT ES256 bằng `.p8`, gọi APNs HTTP/2 khi có tin mới. **Không** push cho tin của chính mình; tôn trọng `blocks` + `muted_until`.

## Key insights

- **`device_tokens` đã có sẵn** trong 0017 (áp ở phase 01) → không cần migration mới cho bảng. Có thể cần thêm cột nếu muốn tách APNs sandbox/production (xem Rủi ro #4).
- **Server-side đặt ở Supabase Edge Function** (Đăng chốt) — KHÔNG Vercel `api/`, KHÔNG `workers/api`. Lý do: NODIE độc lập; `workers/api` là plane agent BTD 3.0; Vercel off-limits. Edge Functions có `service_role` trong env sẵn.
- **Chưa có `.entitlements`** trong project → phải tạo + khai trong `project.yml` (`entitlements:` key của XcodeGen).
- **`aps-environment`** phải khớp môi trường build: `development` cho debug/TestFlight-dev, `production` cho App Store + TestFlight. TestFlight dùng **production** APNs → mismatch là lỗi im lặng kinh điển (Rủi ro #4).
- APNs auth key `.p8` = **token-based** (1 key cho mọi app của team, không hết hạn) → ký JWT ES256 `{iss: TeamID, iat}` + header `{kid: KeyID}`. supabase-swift không cần cho việc này — server (Deno Edge Function) tự ký bằng Web Crypto.

## Requirements

**Chức năng**
1. App xin quyền thông báo (`UNUserNotificationCenter`), đăng ký remote notifications.
2. Nhận APNs device token → upsert `device_tokens(user_id=auth.uid(), token, platform='ios')`.
3. Gỡ token khi đăng xuất (hoặc đánh dấu vô hiệu) → không push tới người đã logout.
4. Edge Function `push-on-message`: nhận sự kiện tin mới → tìm token người nhận → gửi APNs.
5. Kích hoạt: Database Webhook (hoặc trigger `pg_net`) trên `messages` INSERT → gọi Edge Function.
6. **Không** push cho tác giả tin; **bỏ qua** người có `blocks` với tác giả; **bỏ qua** member có `muted_until > now()`.
7. Payload: tiêu đề = tên kênh/người gửi, body = trích tin (DM có thể ẩn nội dung theo cài đặt — v1 hiện tên + trích).

**Phi chức năng**
- `.p8` / Key ID / Team ID chỉ trong Edge Function secrets — **không** trong app, không trong repo.
- Idempotent token upsert (primary key `token`).

## Architecture — luồng dữ liệu

```
iOS: xin quyền → registerForRemoteNotifications
     didRegisterForRemoteNotificationsWithDeviceToken(Data)
        → hex token → ConversationStore/PushManager.upsertToken()
        → device_tokens upsert (RLS device_tokens_self)

messages INSERT (phase 04)
     → Database Webhook / trigger pg_net POST
     → Edge Function `push-on-message` (service_role)
          1. đọc message + channel + members
          2. loại: tác giả, người mute, người block tác giả
          3. lấy device_tokens của người nhận còn lại
          4. ký JWT ES256 (.p8, KeyID, TeamID) — cache < 60 phút
          5. POST https://api.push.apple.com/3/device/{token}
             header apns-topic = com.battudao.nodie, apns-push-type=alert
          6. token 410 Unregistered → xoá device_tokens row
```

## Related code files

**Tạo (iOS):**
- `apps/nodie-ios/NODIE/Push/PushManager.swift` — xin quyền, đăng ký, upsert/remove token
- `apps/nodie-ios/NODIE/NODIE.entitlements` — `aps-environment`
- `apps/nodie-ios/NODIE/Push/AppDelegate.swift` — `UIApplicationDelegateAdaptor` bắt callback device token (SwiftUI App cần adaptor)

**Tạo (server):**
- `supabase/functions/push-on-message/index.ts` — Edge Function Deno
- `supabase/functions/push-on-message/apns.ts` — ký JWT ES256 + gửi APNs (tách < 200 dòng)

**Sửa:**
- `apps/nodie-ios/project.yml` — `entitlements:` trỏ `NODIE.entitlements`; `UIBackgroundModes: [remote-notification]` nếu cần; giữ `DEVELOPMENT_TEAM`
- `apps/nodie-ios/NODIE/NodieApp.swift` — `@UIApplicationDelegateAdaptor`, gọi `PushManager` sau đăng nhập
- `apps/nodie-ios/NODIE/Auth/AuthStore.swift` — `signOut()` gọi remove token trước khi xoá session
- (Có thể) `supabase/migrations/0019_device_tokens_env.sql` — thêm cột `apns_env` nếu cần tách sandbox/prod

## Implementation steps

1. **Entitlement + capability**: tạo `NODIE.entitlements` với `aps-environment` = `development` (Debug) / `production` (Release). XcodeGen: `entitlements:` per-config hoặc 1 file + build setting. Bật Push Notifications capability qua entitlement (không cần Xcode UI vì XcodeGen sinh project).
2. **AppDelegate adaptor**: SwiftUI `App` không có `didRegisterForRemoteNotifications…` → dùng `UIApplicationDelegateAdaptor`. Bắt token `Data` → hex string → chuyển cho `PushManager`.
3. **PushManager**: `requestAuthorization([.alert,.sound,.badge])`; `registerForRemoteNotifications()`; `upsertToken(hex)` → `client.from("device_tokens").upsert(NewToken(userId, token, platform:"ios"))`; `removeToken(hex)` khi logout.
4. **Gọi đúng lúc**: chỉ xin quyền **sau đăng nhập** (không hỏi ở màn login lạnh lẽo). Trong `NodieApp`/RootView `.task` khi `phase == .signedIn`.
5. **Edge Function `push-on-message`**:
   - Nhận payload webhook `{record: message}`.
   - Query `channel_members` của `channel_id`, join `device_tokens`, loại tác giả / `muted_until>now()` / có row `blocks(blocker=member, blocked=author)`.
   - Ký JWT ES256 bằng `.p8` (Deno `crypto.subtle` import PKCS8). Cache JWT (biến module, iat < 3000s).
   - Gửi HTTP/2 tới `api.push.apple.com` (prod) — env chọn theo Rủi ro #4.
   - `410` → `delete device_tokens where token=…`.
6. **Webhook**: Supabase Dashboard → Database Webhooks → `messages` INSERT → HTTP POST tới Edge Function URL (header service auth). HOẶC trigger SQL `pg_net`. Đề xuất Dashboard Webhook (đơn giản, đổi được).
7. **Secrets**: `supabase secrets set APNS_KEY_P8=… APNS_KEY_ID=… APNS_TEAM_ID=X6L54S9V87 APNS_TOPIC=com.battudao.nodie`.
8. **Deploy + test** trên **thiết bị thật** (Simulator không nhận APNs thật — xem Rủi ro #1).

## Todo list

- [ ] Lấy từ Đăng: đường dẫn `.p8`, **Key ID**, xác nhận **Team ID = X6L54S9V87**
- [ ] `NODIE.entitlements` + khai trong `project.yml` (aps-environment theo config)
- [ ] `AppDelegate.swift` adaptor bắt device token
- [ ] `PushManager.swift` — quyền, đăng ký, upsert/remove token
- [ ] Gọi xin quyền sau đăng nhập; remove token khi đăng xuất
- [ ] Edge Function `push-on-message` (index.ts + apns.ts)
- [ ] Database Webhook messages INSERT → Edge Function
- [ ] `supabase secrets set` các giá trị APNs
- [ ] Test thiết bị thật: tài khoản B gửi tin → thiết bị A nhận push
- [ ] Verify: KHÔNG push cho tác giả · người mute không nhận · người block không nhận
- [ ] Token 410 → row bị xoá

## Success criteria

- Thiết bị thật: đăng nhập → được hỏi quyền → chấp nhận → `device_tokens` có row với `user_id` đúng
- Tài khoản B gửi tin vào kênh A tham gia → **thiết bị A hiện banner push** (app nền)
- Tác giả **không** nhận push cho tin của chính mình
- Kênh A đã `muted_until` trong tương lai → A **không** nhận push
- A chặn B → A **không** nhận push tin của B
- Đăng xuất → `device_tokens` row bị gỡ → không còn push
- App Store build (production aps-environment) nhận push qua APNs production (verify qua TestFlight)

## Risk assessment

| # | Rủi ro | Xác suất × Tác động | Giảm thiểu |
|---|---|---|---|
| 1 | **Simulator không nhận APNs remote thật** (chỉ iOS 16+ hạn chế qua `.apns` file, không phải push thật) | Chắc chắn × Cao | Test push đầu-cuối **bắt buộc trên thiết bị thật**. UI test chỉ verify được luồng xin quyền + upsert token (mock APNs token). |
| 2 | **`aps-environment` sai vs build** — Debug=development, TestFlight/AppStore=production. Ký/gửi sai host (`api.sandbox.push.apple.com` vs `api.push.apple.com`) → `BadDeviceToken`, im lặng. | Cao × Cao | Entitlement per-config; Edge Function chọn host theo cột `apns_env` lưu cùng token (Rủi ro #4), KHÔNG đoán. TestFlight = production. |
| 3 | JWT ES256 ký sai (p8 PKCS8 import, `kid` header, `iss`/`iat`) → APNs `403 InvalidProviderToken` | Trung × Cao | Test Edge Function độc lập trước: gọi APNs với 1 token thật, đọc status. Cache JWT nhưng làm mới < 60 phút (APNs từ chối token > 1h). |
| 4 | **1 bảng token, 2 môi trường APNs.** Cùng thiết bị: build dev cho token sandbox, build prod cho token production — cùng `token` string khác env. Gửi nhầm host → fail. | Trung × Cao | Thêm cột `apns_env text` vào `device_tokens` (migration 0019), lưu env lúc đăng ký, Edge Function chọn host theo cột. Nhỏ, làm ngay. |
| 5 | Webhook `pg_net`/Dashboard fail im lặng → không push mà không báo | Trung × Trung | Edge Function log; test bằng insert tin thủ công qua psql rồi xem log function |
| 6 | Push lộ nội dung DM trên lock screen | Trung × Trung | v1: hiện tên + trích ngắn. Cân nhắc cài đặt "ẩn nội dung" sau (YAGNI giờ) |
| 7 | Xin quyền push ngay lúc mở app lần đầu (trước đăng nhập) → user từ chối, khó xin lại | Trung × Trung | Chỉ xin **sau đăng nhập**, khi user đã vào cộng đồng |
| 8 | `blocks`/`muted_until` join sai → push lọt người không nên nhận | Thấp × Trung | Unit-test truy vấn lọc trong Edge Function bằng dữ liệu seed |

**Rollback:** Push là tính năng cộng thêm — gỡ Webhook = ngừng push, app vẫn chạy. Entitlement/PushManager có thể để lại (vô hại nếu không đăng ký). Edge Function xoá độc lập. Không ảnh hưởng chat core.

## Security considerations

- **`.p8` / Key ID / Team ID chỉ trong Edge Function secrets.** Không app, không repo, không phase file. `.p8` rò = ai cũng push giả danh app.
- `device_tokens` RLS `device_tokens_self` → user chỉ ghi token của mình. Edge Function đọc bằng `service_role` (bypass RLS) — đúng vai.
- Edge Function endpoint phải xác thực caller là Webhook Supabase (header secret), không cho gọi tuỳ tiện → tránh spam push.
- Token 410 Unregistered phải xoá — token cũ tồn đọng là rác + rủi ro gửi nhầm.
- Không đưa nội dung tin nhạy cảm vào log Edge Function ở production.

## Next steps

Phase 05 (App Store readiness) — push đã xong là một mục tích cực cho review, nhưng không chặn 05.

## Unresolved questions

1. **Cần Đăng cung cấp:** đường dẫn file `.p8`, **Key ID** (10 ký tự), xác nhận **Team ID** (dự đoán `X6L54S9V87` theo `DEVELOPMENT_TEAM`, nhưng APNs Team ID có thể khác nếu key tạo dưới team khác).
2. Push provider: token-based (`.p8`, khuyến nghị) — xác nhận Đăng có `.p8` chứ không phải cert `.p12` cũ.
3. Tách sandbox/production: thêm cột `apns_env` (đề xuất) hay chạy 2 Edge Function? Đề xuất 1 function + cột env.
4. Kích hoạt qua Database Webhook (Dashboard) hay trigger `pg_net` (trong migration)? Đề xuất Webhook cho v1 (đổi/tắt dễ, không cần deploy DB).
5. Android (phase 09) dùng FCM — `device_tokens.platform='android'` đã lường; Edge Function v1 chỉ xử `ios`, thêm nhánh FCM sau. Xác nhận không cần FCM bây giờ.
6. Badge count (số chưa đọc trên icon app) có làm ở v1 không? Cần tính unread tổng lúc gửi push — đề xuất bỏ qua v1 (YAGNI), chỉ alert.
