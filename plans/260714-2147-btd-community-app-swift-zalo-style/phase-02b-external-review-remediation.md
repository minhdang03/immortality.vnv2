# Phase 02b — Xử lý review ngoài (Nhóm A) + backlog (Nhóm B)

**Status:** ✅ XONG 260715 (Nhóm A) · Executor: Opus 4.8 · 20/20 UI test pass (14 cũ + 6 mới)
**Nguồn:** review ngoài do Đăng dán vào; đã thẩm định từng điểm — 4/6 P0 đúng, #6 sai (reviewer đọc nhầm "Anti-pattern ĐÃ GỠ" = gỡ lệnh cấm, không phải gỡ badge).

## Bối cảnh cho executor (ĐỌC TRƯỚC KHI CODE)

- App: `apps/immortality-vn/apps/nodie-ios/` — SwiftUI iOS 17, XcodeGen (`xcodegen generate` sau khi sửa `project.yml`), supabase-swift.
- Spec UI = `Aion Prototype v3.dc.html` (claude.ai/design). **Pixel-parity là yêu cầu.**
- Build: `xcodebuild -project NODIE.xcodeproj -scheme NODIE -destination 'platform=iOS Simulator,name=iPhone 16 Pro' build`
- Test (14 UI test, PHẢI pass 100% trước và sau): thay `build` bằng `test`. Test auth gọi Supabase THẬT.
- Sau mỗi thay đổi UI: chụp `xcrun simctl io booted screenshot` so với ảnh cũ — đã 2 lần bắt regression bằng ảnh mà test bỏ lọt.

### GUARDRAILS — thứ KHÔNG được "sửa giúp"

1. **KHÔNG đổi Unicode glyph tab bar (✦ ? ◧ ◍) sang SF Symbols** — nguyên văn prototype, bản sắc thiết kế. Accessibility đã xử bằng label tiếng Việt.
2. **KHÔNG gỡ badge chuyên gia / "✓ Hay nhất" / đếm đã đọc / vote / streak** — Đăng duyệt giữ (260715).
3. **KHÔNG wire mock data sang Supabase** — đó là phase 03/04, không phải phase này.
4. **KHÔNG đụng design token màu/spacing** trong `NodieColors.swift`/`NodieSpacing`.
5. Mọi file Swift < 200 dòng; comment tiếng Việt theo phong cách hiện có.

## Nhóm A — làm trong phase này

### A1. Gỡ credential khỏi UI test (LÀM ĐẦU TIÊN — chặn trước commit)
- `NODIEUITests/AuthUITests.swift:12` đang hardcode email + mật khẩu thật.
- Sửa: đọc từ `ProcessInfo.processInfo.environment["NODIE_TEST_EMAIL"] / ["NODIE_TEST_PASSWORD"]` → truyền qua scheme: thêm vào `project.yml` scheme NODIE mục `test.environmentVariables` trỏ `$(NODIE_TEST_EMAIL)` (đặt trong `Config/Secrets.xcconfig` — đã gitignored, sinh bởi `scripts/generate-secrets-xcconfig.sh`; mở rộng script đọc thêm 2 biến từ `.env` gốc monorepo: thêm `NODIE_TEST_EMAIL`, `NODIE_TEST_PASSWORD` vào `.env` trước).
- Nếu env rỗng → `XCTSkip("Thiếu NODIE_TEST_* — bỏ qua test auth thật")`, KHÔNG fail.
- ⚠️ **Đổi mật khẩu account là việc của Đăng** (account này cũng là login admin battudao.com — đổi ảnh hưởng web). Executor chỉ gỡ khỏi code, KHÔNG tự đổi mật khẩu.

### A2. Dynamic Type
- `NODIE/DesignSystem/NodieTypography.swift` — mọi font đang `.system(size:)` cố định → không scale theo cỡ chữ hệ thống. Comment trong file nói "có Dynamic Type" là SAI, sửa luôn comment.
- Fix tập trung tại 2 hàm `serif()`/`sans()`: dùng `UIFontMetrics(forTextStyle:).scaledValue(for: size)` hoặc `Font.custom(_:size:relativeTo:)` tương đương hệ thống — mỗi cỡ map một `Font.TextStyle` hợp lý (34→largeTitle, 26→title1, 18-21→title3, 15-17→body, 12-14→footnote, <12→caption2).
- Verify: Simulator → Settings → Accessibility → Larger Text max → chữ PHẢI to lên; chụp ảnh cỡ mặc định so với ảnh cũ — layout cỡ mặc định KHÔNG đổi.

### A3. Draft riêng từng hội thoại + chat cuộn xuống khi mở
- `NODIE/AppState.swift`: `var draft: String` đang dùng CHUNG → chuyển chat còn nguyên draft cũ. Đổi thành `var drafts: [String: String]` theo chatId; cập nhật `ChatDetailView` binding (`$state.drafts[chatId, default: ""]` — cần binding helper) + `send(in:)`.
- `ChatDetailView`: hiện chỉ cuộn khi count đổi → thêm cuộn xuống tin cuối trong `.onAppear` (không animation).
- Test mới trong `SwipeActionsUITests` hoặc file mới: gõ draft ở chat A, back, mở chat B → ô nhập rỗng; quay lại A → draft còn.

### A4. Touch target 44pt + VoiceOver + Button-hoá row
- `NODIE/Components/NodieChips.swift` `CircleIconButton`: visual giữ 34×34 nhưng hit area 44×44 (`.frame(width: 44, height: 44).contentShape(Rectangle())` bọc ngoài) + thêm tham số `accessibilityLabel`, mặc định "Quay lại" cho arrow.left. Caller: `QuestionDetailView`, `ChatDetailView`, `ProfileView`.
- Nút gửi chat (42×42) → hit 44. Avatar Bảng tin (36) → hit 44.
- 3 chỗ row dùng `.onTapGesture` (`QuestionRowView`, `ConversationRowView`, `AttractedItemRow`) → bọc `Button { } label: { }` + `.buttonStyle(.plain)` — được highlight + VoiceOver trait chuẩn. ⚠️ `ConversationRowView` nằm trong `List` có `.swipeActions` — verify swipe vẫn chạy sau khi Button-hoá (test sẵn có phải pass).
- Verify: 14 test cũ pass nguyên; ảnh so khớp.

### A5. Ghi "Xoá tài khoản" vào plan (không code phase này)
- Sửa `plan.md` phase 05: thêm hạng mục bắt buộc **xoá tài khoản + toàn bộ dữ liệu trong app** — Apple guideline 5.1.1(v), app có sign-up mà thiếu là reject. Cần: nút trong Cá Nhân → confirm → gọi endpoint server-side (service_role, KHÔNG làm từ client) → xoá auth.users cascade profiles.

## Nhóm B — backlog, KHÔNG làm phase này (ghi vào plan đúng phase)

| Việc | Phase |
|---|---|
| Disable/ẩn nút chưa wire ("Phóng câu hỏi", filter, menu …, soạn hội thoại, "Xem dẫn chứng", ngôn ngữ) | 03/04 khi wire từng màn |
| Skeleton / empty / offline / retry / pagination | 03/04 |
| Tìm kiếm Hỏi đáp + Hội thoại | 03/04 |
| Chat: ảnh/audio, trạng thái gửi/thất bại, retry | 04 |
| Quên mật khẩu, resend email xác nhận | 05 |
| App icon, launch screen, privacy manifest, APNs entitlement, deep link | 05 |
| SF Symbols cho tab bar | ❌ TỪ CHỐI — trái prototype, Đăng chưa yêu cầu |

## Acceptance (Nhóm A)

- [x] Không còn chuỗi email/mật khẩu nào trong `NODIEUITests/` (grep sạch); test auth chạy khi có env, skip êm khi không. — verify cả 2 chiều: có env → `testSignInThenOpenProfileShowsRealData` PASS; xoá env → `Test skipped`, TEST SUCCEEDED.
- [x] Larger Text max → chữ to lên ở mọi màn; cỡ mặc định layout không đổi (so ảnh). — cỡ max: chữ to lên (đổi ngay khi user chỉnh, không cần mở lại app); cỡ mặc định: **0 pixel lệch** so ảnh gốc.
- [x] Draft không rò giữa các chat; mở chat thấy ngay tin mới nhất. — `ChatDetailUITests` 3 test; test cuộn đã verify là fail khi gỡ `.onAppear`.
- [x] Mọi control bấm được có hit area ≥ 44pt; VoiceOver đọc "Quay lại" thay vì "arrow.left"; row là Button thật. — `TouchTargetUITests`; đo được 35pt khi gỡ `expandedHitArea` → test có răng.
- [x] `plan.md` có hạng mục xoá tài khoản ở phase 05.
- [x] Build sạch không warning; **toàn bộ UI test pass**: 20/20 (14 cũ + 6 mới); ảnh Bảng tin khớp bản trước tuyệt đối.

## Lệch so với kế hoạch (có lý do, đo được)

1. **Không dùng `.caption2`** cho cỡ < 12 như plan ghi. Đo trên iOS 18: caption2 phình 3.69× còn footnote 2.89× → chữ 11.5 sẽ to HƠN chữ 13.5 ở cỡ max, lộn ngược thứ bậc. Mọi cỡ < 15 dùng footnote.
2. **Nhân theo tỉ lệ** thay vì gọi thẳng `scaledValue(for: size)` như plan gợi ý: scaledValue làm tròn cỡ lẻ NGAY Ở CỠ MẶC ĐỊNH (15.5 → 15.7, 8.5 → 8.7) → vi phạm chính acceptance "cỡ mặc định layout không đổi". Tỉ lệ ở cỡ mặc định = 1.0 tuyệt đối.
3. **Phải thêm `.id(dynamicTypeSize)` ở `RootTabView`** — ngoài phạm vi "chỉ sửa 2 hàm serif/sans" mà plan dự đoán. Không có chỗ nào đọc môi trường cỡ chữ thì SwiftUI không dựng lại cây view → chữ chỉ đổi khi mở lại app. Đã verify bằng ảnh: trước khi thêm, đổi cỡ chữ lúc app đang chạy = ảnh y hệt.
4. **Vùng bấm nới bằng `padding(+5)/contentShape/padding(-5)`**, không bọc `.frame(44)` như plan ghi: bọc frame thẳng đội layout lên 10pt → đẩy hàng xóm → ảnh đổi. Cách này giữ ảnh y nguyên.

## Unresolved

1. Đổi mật khẩu `mr.dang1305@gmail.com`: Đăng tự đổi (ảnh hưởng cả login web battudao.com) — thời điểm? Đổi xong nhớ sửa `NODIE_TEST_PASSWORD` trong `.env` gốc.
2. Nhãn "Sắp có" của 3 mục Cá Nhân: giữ tới phase 03 hay ẩn hẳn? — chưa đụng.
3. **Test auth flaky (có sẵn từ trước, không phải do phase này)**: chạy baseline đầu session được 12/14 — `testSessionPersistsAcrossRelaunch` + `testSignOutReturnsToLogin` fail; chạy lại từng test một thì pass. Nguyên nhân: `--uitest-reset-auth` gọi `signOut()` qua MẠNG, lỗi bị `try?` nuốt → app giữ session cũ → màn Login không hiện → test tưởng là hỏng. Chạy cuối 20/20 pass nhưng mầm flake còn đó. Cách sửa gọn: `signOut(scope: .local)` (xoá Keychain, không cần mạng). CHƯA LÀM — ngoài phạm vi Nhóm A.
4. **Cỡ chữ accessibility lớn nhất → layout chật/đè**: chữ to đúng nhưng avatar, badge, tab bar giữ kích thước cứng (guardrail 4 cấm đụng spacing token) nên nhãn tab bị cắt, chữ tràn card. Chấp nhận được ở phase này; muốn chỉnh phải mở guardrail spacing hoặc `.dynamicTypeSize(...accessibility1)` cho phần chrome.
