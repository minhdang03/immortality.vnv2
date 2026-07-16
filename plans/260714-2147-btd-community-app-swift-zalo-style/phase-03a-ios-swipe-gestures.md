# Phase 03a — Thao tác vuốt iOS (NavigationStack refactor)

**Status:** ✅ DONE · 2026-07-15 · 8/8 UI test pass, build sạch không warning
**Trigger:** Đăng: "chưa có các thao tác vuốt trên ios"

## Vấn đề

App hiện **zero gesture** — chỉ có `onTapGesture` bấm dòng. Detail chỉ thoát được bằng nút back.

Nguyên nhân gốc: quyết định điều hướng bằng enum thay `NavigationStack` (ghi ở `AppState.swift:5-7`) để kiểm soát ẩn/hiện tab bar → mất luôn `interactivePopGestureRecognizer` mà hệ thống cho miễn phí. Prototype là HTML nên không thể lộ lỗ hổng này.

**Quyết định (260715):** dùng `NavigationStack`. FB/IG/X đều dùng `UINavigationController` cho push/pop; không ai tự viết back gesture. Ẩn tab bar khi push = `hidesBottomBarWhenPushed`, là pattern chuẩn — không phải lý do né NavigationStack.

## Scope

**Trong scope** (Đăng chọn):
1. Vuốt cạnh trái để back — từ Chat chi tiết + Chi tiết câu hỏi
2. Swipe action trên dòng hội thoại — Đã đọc / Tắt thông báo / Rời khỏi
3. Kéo xuống làm mới — Hỏi đáp + Hội thoại

**Ngoài scope:** vuốt ngang đổi tab (Đăng không chọn); vuốt-để-trả-lời tin nhắn (prototype không có thread → YAGNI).

## Acceptance criteria — tất cả PASS

- [x] Vuốt cạnh trái ở Chat chi tiết → về Hội thoại · `testSwipeBackFromChatDetail`
- [x] Vuốt cạnh trái ở Chi tiết câu hỏi → về Hỏi đáp · `testSwipeBackFromQuestionDetail`
- [x] Nút back tròn vẫn chạy (bổ sung, không thay thế) · `testBackButtonPopsChatDetail` (test đối chứng)
- [x] Tab bar ẩn ở detail, hiện lại khi pop · `testTabBarHidesInDetailAndReturnsAfterSwipeBack`
- [x] Bấm item Hỏi đáp trong Bảng tin → nhảy tab Hỏi đáp + mở detail (`openQuestion` set `tab = .qa`)
- [x] Vuốt dòng → Đã đọc / Tắt thông báo / Rời khỏi · `testSwipeLeadingMarksAsRead`, `testSwipeTrailingMutesChannel`, `testSwipeTrailingLeavesConversation`
- [x] Kéo xuống làm mới · `testPullToRefreshKeepsListIntact`
- [x] Giao diện khớp prototype — so ảnh trước/sau, đã bắt + sửa 1 regression (xem dưới)
- [x] Build sạch không warning · 21 file / 2.115 dòng

## Kết quả — 2 điều đáng ghi

### 1. Giả thiết của tôi SAI, test bắt được
Tôi viết comment trong code: *"`.toolbar(.hidden, for: .navigationBar)` thì giữ gesture, chỉ `.navigationBarBackButtonHidden` mới giết"*. **Sai.** UI test fail ngay lần chạy đầu — SwiftUI tắt `interactivePopGestureRecognizer` khi nav bar ẩn, bất kể API nào.

Nếu chỉ build xong báo "done" thì đã giao app vuốt không ăn. Test đối chứng (nút back) pass trong khi test vuốt fail → chứng minh lỗi ở gesture, không phải methodology.

**Fix:** `InteractivePopGestureEnabler.swift` — `UIViewControllerRepresentable` với tới `UINavigationController` cha, trả lại `interactivePopGestureRecognizer.delegate`, cho phép gesture khi `viewControllers.count > 1`. Đây là cách các app lớn xử lý khi dùng nav bar tuỳ biến — gỡ cái chặn, không tự viết lại gesture.

### 2. Regression thị giác bị bắt bằng cách so ảnh
`List` + `listRowInsets(screenH)` + divider có sẵn `.padding(.horizontal, screenH)` → kẻ chia thụt gấp đôi (44pt thay vì 22pt). Chỉ lộ ra khi so ảnh trước/sau, không lộ qua test. Đã sửa + comment cảnh báo tại chỗ.

## Files

Sửa: `AppState.swift` (bỏ `screen` enum → `tab` + `qaPath`/`chatsPath`), `Shell/RootTabView.swift`, `Features/QA/QuestionListView.swift`, `Features/QA/QuestionDetailView.swift`, `Features/Conversations/ConversationListView.swift` (ScrollView+LazyVStack → List), `Features/Conversations/ConversationRowView.swift` (+ icon muted), `Features/Conversations/ChatDetailView.swift`, `project.yml` (+ target UI test)
Tạo: `Shell/InteractivePopGestureEnabler.swift`, `NODIEUITests/SwipeBackUITests.swift`, `NODIEUITests/SwipeActionsUITests.swift`

## Nợ kỹ thuật

- `markRead`/`toggleMute`/`leave` hiện là state cục bộ (`unreadOverrides`, `mutedChannels`, `leftChannels`). Phase wire → `channel_members.last_read_at` / `.muted_until` / xoá row.
- `refresh()` mới chỉ `sleep(600ms)` — khung để gắn refetch Supabase.
- Vuốt-ngang-đổi-tab: Đăng không chọn. Nếu sau này thêm, phải xử lý xung đột ưu tiên với vuốt-cạnh-back.

## Thiết kế

`AppState`: bỏ `screen: Screen`, thay bằng tab + path riêng mỗi tab (giống UINavigationController mỗi tab của FB/IG):

```swift
var tab: NodieTab = .feed
var qaPath: [String] = []      // questionId
var chatsPath: [String] = []   // chatId
var showsTabBar: Bool { currentPath.isEmpty }
```

`openQuestion(id)` → `tab = .qa; qaPath = [id]` (kể cả khi gọi từ Bảng tin — khớp prototype).

`RootTabView`: `NavigationStack(path:)` cho tab qa + conversations. Feed/Journey không có detail → không cần stack.

**Rủi ro đã biết:** ẩn nav bar có thể vô hiệu hoá swipe-back tuỳ API dùng. `.navigationBarBackButtonHidden(true)` giết gesture; `.toolbar(.hidden, for: .navigationBar)` thì giữ. **Phải verify bằng UI test thật, không tin lý thuyết.**

Swipe action cần `List` (không chạy trong `LazyVStack`) → `ConversationListView` chuyển ScrollView+LazyVStack → `List` với `.listStyle(.plain)` + `listRowSeparator/Background/Insets` để giữ nguyên visual.

## Files

Sửa: `AppState.swift`, `Shell/RootTabView.swift`, `Features/QA/QuestionListView.swift`, `Features/QA/QuestionDetailView.swift`, `Features/Conversations/ConversationListView.swift`, `Features/Conversations/ChatDetailView.swift`, `Features/Feed/FeedView.swift`, `project.yml`
Tạo: `NODIEUITests/SwipeBackUITests.swift`

## Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Ẩn nav bar giết swipe-back | UI test thật, không tin lý thuyết |
| `List` đổi visual (separator, inset, nền) | So ảnh trước/sau từng pixel |
| Regression điều hướng từ Bảng tin | Acceptance criteria có case này |
