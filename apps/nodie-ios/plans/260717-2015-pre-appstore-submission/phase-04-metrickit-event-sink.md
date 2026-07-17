# Phase 04 — MetricKit + đường ghi sự kiện (AppEventLogger)

**Mục:** B-01 (P0 crash reporting) · B-02 phần writer (P1) · **Đợt A** · Ước lượng **0.5 ngày** · Status: ⬜
**Model:** Opus (fast) — boilerplate MetricKit + một writer mỏng vào bảng đã có schema; spec rõ, verify bằng Simulate MetricKit Payloads + đọc row.

## Context links

- Report: `...-beyond-ux-audit-appstore-ops-report.md` (B-01, B-02)
- **Phụ thuộc phase 02:** bảng `app_events` (`0037_app_events.sql`) phải áp prod TRƯỚC — client ghi vào đó.
- Quyết định đã chốt (plan.md): **Crash reporting = MetricKit** (`MXMetricManager`), zero dependency. **Không Sentry.**
- App entry: `NODIE/NodieApp.swift` (`@main` + `AppDelegate`) · client: `NODIE/Auth/SupabaseClientProvider.swift` (`.shared`)

## Hợp đồng bảng `app_events` (từ phase 02 — KHỚP ĐÚNG, đừng khai lại)

```
app_events(id, user_id default auth.uid(), kind text, payload jsonb, created_at)
  RLS: insert cho `authenticated` với check (user_id = auth.uid()); select chỉ admin.
  payload có check pg_column_size < 64000.
```

⇒ Hệ quả cứng cho client:
- **Chỉ ghi được khi đã đăng nhập** (RLS `authenticated` + `user_id=auth.uid()`). Sự kiện lúc chưa đăng nhập: đệm lại hoặc bỏ — **đừng cố ghi, sẽ 401/RLS fail**.
- **Payload phải nhỏ.** Crash diagnostic của MetricKit có thể vài chục KB → cắt/tóm trước khi ghi, không đổ nguyên `MXDiagnosticPayload.jsonRepresentation()` (dễ vượt 64KB → bị check chặn, mất cả row).

## Overview

Hôm nay app **mù 100% sau khi ship**: crash trên máy user = không bao giờ biết. Bật MetricKit (Apple-native,
zero-dep): nhận `MXDiagnosticPayload` (crash/hang/CPU) + `MXMetricPayload`, tóm gọn, đổ vào `app_events`.
Kèm một `AppEventLogger` mỏng để phase 06 (funnel) có sẵn đường ghi — **phase này chỉ dựng writer + crash sink, KHÔNG rải call-site funnel** (đó là phase 06/đợt B).

## Key insights

- **MetricKit giao payload lúc mở app kế tiếp**, không realtime. Đăng ký subscriber ở `didFinishLaunching` (AppDelegate đã có sẵn) để không lỡ payload đang chờ.
- **`MXMetricManager.add(subscriber)` phải giữ subscriber sống** — nếu là biến cục bộ, ARC thả, callback không bao giờ chạy. Giữ trong AppDelegate (đã sống suốt vòng đời app).
- **Ghi `app_events` không được chặn UI và không được ném.** Log hỏng là chuyện nền — `try?`, nuốt lỗi, cùng lắm `os_log`. Đúng tinh thần 0031 (observability không được làm vỡ luồng chính).
- **Simulator ghi crash được**: Xcode → Debug → Simulate MetricKit Payloads (không cần máy thật cho acceptance #4).
- **App Privacy:** `app_events` chứa `kind` + payload tóm tắt, **không** tracking cross-app, **không** IDFA. Phase 07 khai vào ASC là "Diagnostics" / "App Functionality" — không cần ATT. Đừng nhét thông tin định danh vào payload.

## Files

**Tạo**
- `NODIE/Observability/AppEventLogger.swift` — actor/struct mỏng: `log(kind:payload:)` → insert `app_events`, best-effort.
- `NODIE/Observability/MetricKitSubscriber.swift` — `MXMetricManagerSubscriber`, nhận payload → tóm gọn → `AppEventLogger`.

**Sửa**
- `NODIE/NodieApp.swift` — `AppDelegate.didFinishLaunching`: `MXMetricManager.shared.add(subscriber)`; giữ `subscriber` làm property.

**Xoá:** không

> `project.yml` dùng `sources: - NODIE` ⇒ file .swift mới tự vào target sau `xcodegen generate`. **KHÔNG sửa `project.yml`** (file nóng đợt A) — chỉ chạy `xcodegen generate`.

## Implementation steps

1. **`AppEventLogger.swift`:**
   - `func log(kind: String, payload: [String: Any] = [:])` — dựng `[String: AnyJSON]`/`JSONObject` hợp `supabase-swift`, `try? await SupabaseClientProvider.shared.from("app_events").insert([...])`.
   - Bỏ qua khi chưa có session: kiểm `auth.currentSession != nil` trước khi ghi (tránh RLS fail ồn ào). Không session → `os_log` debug rồi return.
   - **Chốt kích thước:** nếu payload serialize > ~50KB → cắt field dài nhất / thay bằng `{"truncated": true, "bytes": N}`. Không để bảng nuốt payload khổng lồ.
2. **`MetricKitSubscriber.swift`:**
   - `final class MetricKitSubscriber: NSObject, MXMetricManagerSubscriber`.
   - `didReceive(_ payloads: [MXDiagnosticPayload])`: mỗi payload → tóm `crashDiagnostics`/`hangDiagnostics`/`cpuExceptionDiagnostics` thành dict nhỏ (loại, `terminationReason`, `virtualMemoryRegion`, `callStackTree` **rút gọn** hoặc chỉ top frames) → `AppEventLogger.log(kind: "crash_diagnostic", payload:)`. Mỗi loại một `kind`: `crash_diagnostic`, `hang_diagnostic`, `cpu_exception`.
   - `didReceive(_ payloads: [MXMetricPayload])`: tuỳ chọn — tóm vài metric (launch time, memory) → `kind: "metric_daily"`. **YAGNI**: nếu chưa dùng thì để tối thiểu, đừng đổ nguyên payload.
3. **`NodieApp.swift`:** trong `AppDelegate` thêm `let metricSubscriber = MetricKitSubscriber()`; trong `didFinishLaunching` gọi `MXMetricManager.shared.add(metricSubscriber)`. **Không đổi gì khác** trong file này (nó là file nóng — chạm tối thiểu, một dòng thêm property + một dòng add).
4. `xcodegen generate` (bắt buộc, file .swift mới) — **hẹn cửa sổ build tránh đua phiên 1933** (xem plan.md: `SWIFT_EMIT_LOC_STRINGS: YES` khiến mọi build ghi lại `Localizable.xcstrings`). Build khi phiên kia không đang build.
5. Build: `xcodebuild -project NODIE.xcodeproj -scheme NODIE -destination 'platform=iOS Simulator,name=iPhone 17' build`.

## Todo

- [ ] `AppEventLogger.swift` — writer best-effort, guard session, cắt payload lớn
- [ ] `MetricKitSubscriber.swift` — 3 kind diagnostic, tóm gọn payload
- [ ] `NodieApp.swift` — add subscriber ở didFinishLaunching (chạm tối thiểu)
- [ ] `xcodegen generate` (hẹn cửa sổ build)
- [ ] Build xanh simulator
- [ ] Simulate MetricKit Payloads → verify row `app_events`

## Success criteria

1. Build xanh trên simulator.
2. **Crash sink:** Xcode → Debug → Simulate MetricKit Payloads (khi đã đăng nhập bằng tài khoản role='user') → xuất hiện ≥1 row `app_events` với `kind='crash_diagnostic'`. Kiểm bằng admin:
   ```sql
   select kind, created_at, pg_column_size(payload) from public.app_events order by created_at desc limit 5;
   ```
3. `pg_column_size(payload)` mọi row < 64000 (không dính check).
4. Ghi khi **chưa đăng nhập** không làm app crash/log ầm ĩ — chỉ bỏ qua êm.
5. App chạy bình thường, không thêm lag lúc mở (subscriber đăng ký là O(1)).

## Risks + rollback

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Subscriber bị ARC thả → callback không chạy | Trung bình | Giữ làm property của AppDelegate (sống suốt đời app) |
| Payload crash > 64KB → check chặn, mất row | Trung bình | Tóm gọn + cắt ở AppEventLogger trước khi ghi |
| Ghi lúc chưa đăng nhập → RLS 401 ồn ào | Trung bình | Guard `currentSession != nil` |
| Build đua `Localizable.xcstrings` với phiên 1933 | Cao | Hẹn cửa sổ build; file này không sửa chuỗi UI nào |
| Đổi `project.yml`/`Info.plist` (file nóng đợt A) | Cao | KHÔNG chạm — chỉ `xcodegen generate` |

**Rollback:** gỡ 2 file mới + revert 2 dòng trong `NodieApp.swift` + `xcodegen generate`. Không migration, không dữ liệu prod thay đổi (bảng `app_events` do phase 02 tạo, độc lập).

## Security

- Client chỉ dùng anon key (đã đúng qua `SupabaseClientProvider`). Không service_role.
- Payload **không chứa PII/định danh** — chỉ loại crash + stack rút gọn. Giữ App Privacy sạch: đây là Diagnostics, không phải tracking.

## Next

→ Phase 06 (đợt B) dùng `AppEventLogger.log(kind:)` sẵn ở đây để rải funnel events (đăng ký/đăng nhập/đăng bài). → Phase 07 khai App Privacy label "Diagnostics" theo đúng những gì `app_events` thật sự chứa.
