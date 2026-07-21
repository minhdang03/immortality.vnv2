# Phase 03 — Swift FeatureFlagStore + đổi gate Q&A đọc flag

**Model:** **Opus (fast)** cho phần cơ khí (store fetch + đổi chữ ký hàm thuần), **review cuối bằng Fable** — vì gate đụng semantics phân quyền + phải giữ `QATabGateUITests` xanh (vùng dễ regress).

## Context Links
- `Shell/NodieTabBar.swift:21-34` — `visibleTabs(role:)` / `qaUnlocked(role:)` hàm thuần.
- `Shell/RootTabView.swift:9-34,95-99` — nơi giữ store (`@State qa/chat/follow`), boot `.task(id:auth.phase)`.
- `Shell/TabRestoration.swift:31` — gọi `visibleTabs(role:)`.
- `Features/Profile/ProfileView.swift:71` — gọi `qaUnlocked(role:)`.
- `NodieApp.swift:95` — pattern fetch-khi-signedIn.
- Phase 02 report — xác nhận app_config đọc được qua PostgREST.

## Overview
- **Priority:** P2. **Status:** pending (blocked by 02).
- Thêm `FeatureFlagStore` fetch flags lúc launch + cache in-memory (fallback default khi mạng chập). Đổi gate Q&A: `qaVisible = qa_public==true OR role∈{admin,mod} OR --uitest-show-qa`.

## Key Insights
- Gate hiện là **hàm thuần** `qaUnlocked(role:)`. Giữ thuần (dễ test) bằng cách **thêm tham số** `qaPublic: Bool = false` → `qaUnlocked(role:qaPublic:)`, `visibleTabs(role:qaPublic:)`. Cờ inject từ FeatureFlagStore ở call-site.
- Default `qaPublic=false` ⇒ **QATabGateUITests không cờ vẫn xanh** (user thường + flag off → ẩn; admin/mod → hiện; `--uitest-show-qa` → hiện). Không đổi hành vi test hiện có.
- FeatureFlagStore đặt **@State ở RootTabView** cạnh qa/chat/follow (cùng lý do: tab bar cần biết khi đứng tab khác). ProfileView nhận flag qua tham số/environment.

## Requirements
### Functional
- `FeatureFlagStore` (`@Observable`): `var qaPublic: Bool = false` (+ generic `flags: [String:Bool]` nếu cần); `func load() async` đọc `app_config` các key boolean; fallback giữ default khi lỗi/offline.
- Fetch tại signedIn (giống push): thêm nhánh trong `.task(id:auth.phase)` hoặc `.task` riêng của RootTabView.
- `visibleTabs`/`qaUnlocked` nhận `qaPublic` từ store.

### Non-functional
- File < 200 dòng. Không thêm dependency. Đọc qua `SupabaseClientProvider.shared` như store khác.
- `xcodegen generate` sau khi thêm file mới (bắt buộc).

## Architecture — data flow
```
signedIn ─► FeatureFlagStore.load()
             └─ GET app_config?key=in.(qa_public,...) (PostgREST, authed)
                ├─ OK   → qaPublic = value
                └─ lỗi  → giữ default (false)  ← fail-safe, không mở nhầm
RootTabView.visibleTabs ─► NodieTab.visibleTabs(role: auth.profile?.role, qaPublic: flags.qaPublic)
TabRestoration / ProfileView ─► cùng hàm, cùng cặp (role, qaPublic)
```

## Related Code Files
- Create: `Features/FeatureFlags/FeatureFlagStore.swift` (+ chạy `xcodegen generate`).
- Modify: `Shell/NodieTabBar.swift` (chữ ký + thân `qaUnlocked`/`visibleTabs`).
- Modify: `Shell/RootTabView.swift` (giữ store, load khi signedIn, truyền qaPublic).
- Modify: `Shell/TabRestoration.swift` (truyền qaPublic vào `visibleTabs`).
- Modify: `Features/Profile/ProfileView.swift` (truyền qaPublic vào `qaUnlocked`).

## Implementation Steps
1. Tạo `FeatureFlagStore` đọc app_config (map key→bool). Fallback default false.
2. Đổi `qaUnlocked(role:)` → `qaUnlocked(role:qaPublic:)`; giữ OR `--uitest-show-qa`. `visibleTabs(role:)` → `visibleTabs(role:qaPublic:)`.
   ```swift
   static func qaUnlocked(role: String?, qaPublic: Bool) -> Bool {
       qaPublic || role == "admin" || role == "mod"
           || ProcessInfo.processInfo.arguments.contains("--uitest-show-qa")
   }
   ```
3. RootTabView: `@State private var flags = FeatureFlagStore()`; load ở `.task(id:auth.phase)` khi `.signedIn`; `visibleTabs` truyền `flags.qaPublic`.
4. TabRestoration + ProfileView: truyền `qaPublic` (từ store, qua tham số hoặc environment). Cập nhật preview `#Preview` NodieTabBar dòng ~101 (đang gọi `visibleTabs(role:"admin")`).
5. `xcodegen generate` → build.

## Todo
- [x] FeatureFlagStore.swift + xcodegen generate
- [x] Đổi chữ ký qaUnlocked/visibleTabs (+ default an toàn ở call-site preview)
- [x] RootTabView giữ store + load signedIn + truyền qaPublic
- [x] TabRestoration + ProfileView truyền qaPublic
- [x] Sửa #Preview NodieTabBar cho khớp chữ ký mới
- [x] Build xanh

## Success Criteria
- Flag off + user thường → không thấy tab Q&A và không thấy khối "Đóng góp" ở Cá nhân.
- Flag on (đổi DB) → sau launch kế, user thường thấy Q&A (không cần release).
- admin/mod luôn thấy bất kể flag; `--uitest-show-qa` vẫn mở.
- `QATabGateUITests` (không cờ) vẫn pass.

## Risk Assessment
| Rủi ro | Khả năng | Tác động | Giảm thiểu |
|---|---|---|---|
| Đổi 1 call-site quên → build đỏ | Trung bình | Thấp | grep hết 3 call-site (RootTabView/TabRestoration/ProfileView) + preview |
| Flag load chậm → nháy tab lúc mở app | Trung bình | Thấp | default false; tab Q&A chỉ hiện khi có kết quả → không nháy hiện-rồi-ẩn (chỉ ẩn-rồi-hiện, chấp nhận được) |
| ProfileView khó lấy store (không ở env) | Trung bình | Thấp | Truyền qaPublic Bool xuống qua tham số thay vì cả store (KISS) |
| Regress QATabGateUITests | Thấp | Cao | default qaPublic=false giữ nguyên hành vi; Phase 05 chạy test chốt |

## Security Considerations
- Flag chỉ đổi HIỂN THỊ; RLS Supabase không đổi (đúng như comment gate hiện tại). Bật `qa_public` KHÔNG cấp quyền gì mới — user thường vốn đã có RLS Q&A.
- Fail-safe: lỗi load → ẩn (false), không mở nhầm feature chưa sẵn sàng.

## Next Steps
- Song song Phase 04. Hội tụ ở Phase 05 (build + UITest + review).

## Unresolved
- Q4: ProfileView nhận `qaPublic` qua environment object hay tham số? Đề xuất tham số Bool (ít khớp nối). Người thực thi chọn theo cây view thực tế.
