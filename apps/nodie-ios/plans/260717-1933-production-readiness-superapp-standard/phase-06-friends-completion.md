# Phase 06 — Friends hoàn chỉnh: following + loading/empty/search states

**Audit:** P1-04 (chỉ có "Gợi ý cho bạn", không có nơi quản lý người đã follow), P1-05 (không phân biệt đang tải / rỗng / lỗi) + medium (search không có "không tìm thấy", nút clear).
**Chuẩn:** IG — segmented Đang theo dõi/Gợi ý, skeleton khi tải, empty state có CTA, search có trạng thái rõ.
**Model:** Opus (fast) — `FollowStore` + RLS đã prod sẵn (plan 1404 phase 04), còn lại là UI states theo khuôn IG; việc cơ khí có spec.

## Context

- `FriendsView.swift` — comment code tự ghi nợ dữ liệu following. `FollowStore` đã wire (plan 1404 phase 04), `follows` table + RLS đã prod. `MemberProfileView` đã có follow/unfollow.
- QA/Profile đã có loading/error/empty tốt (audit khen) — copy pattern đó, không phát minh mới.

## Files

- Sửa: `FriendsView.swift`, `FollowStore` (thêm fetch following list nếu chưa có), `Localizable.xcstrings`

## Steps

1. **Section "Đang theo dõi":** query `follows` của mình join `public_profiles` → list trên cùng màn Friends (section hoặc segmented — chọn theo pattern UI hiện có của app, không thêm framework). Mỗi hàng: avatar, tên, bio 1 dòng, nút Bỏ theo dõi (confirm sheet — hành vi phá huỷ nhẹ). Tap hàng → MemberProfileView.
2. **Loading:** skeleton row kiểu QA (ẩn VoiceOver như QA đã làm). **Empty following:** "Bạn chưa theo dõi ai" + CTA cuộn xuống Gợi ý. **Empty gợi ý:** "Chưa có gợi ý mới". **Error:** message + nút Thử lại tại chỗ (không alert root — nối phase 07 taxonomy).
3. **Search states:** kết quả rỗng → "Không tìm thấy ai với '<query>'"; nút clear (×) trong field; spinner nhỏ khi đang query (debounce hiện có giữ nguyên).
4. **Đồng bộ trạng thái:** unfollow từ MemberProfileView → list following cập nhật (FollowStore là source of truth, view observe — kiểm đã đúng chưa).
5. i18n đủ 9 ngôn ngữ; a11y label cho nút clear/unfollow; hit target 44pt (khớp phase 05).

## Validation

- Account An follow Bình → tab Bạn bè thấy Bình trong Đang theo dõi; unfollow → biến mất, Gợi ý hiện lại Bình.
- Airplane mode → error state có Thử lại, bấm Thử lại khi có mạng → hồi phục.
- Search "zzzz" → empty state; clear → về mặc định.

## Đã làm 18/07 16:5x

- `FollowStore`: thêm `followingProfiles` (nạp mẻ 50 id qua `id=in.(...)`), `directory` làm nguồn
  chung → `suggestions`/`peoplePicker` thành computed (follow/unfollow tự cập nhật cả hai section),
  `isLoading`/`isSearching`/`loadError` (NodieErrorKind, lỗi NẠP vẽ tại chỗ — lỗi GHI vẫn alert gốc),
  toggle đổi `following`+`followingProfiles` cùng nhịp qua `applyOptimistic` (revert cùng đường);
  follow người ngoài danh bạ tại chỗ → tự nạp lại followingProfiles.
- `FriendsView`: 2 section Đang theo dõi/Gợi ý, skeleton `.redacted` dùng lại PersonRowView
  (a11y hidden + "Đang tải danh sách"), empty × 2 có CTA, error inline + Thử lại (chỉ khi
  `isRetryable`), search: spinner trong field + nút clear (×, a11y "Xoá tìm kiếm") + empty
  "Không tìm thấy ai với …"; unfollow qua confirmationDialog (cả từ kết quả tìm).
- `PersonRowView.swift` tách file riêng + `PublicProfile.placeholder`; nút follow nới hit area 44pt.
- i18n: 11 key × 8 ngôn ngữ splice tay vào xcstrings (`extractionState: manual` — xcodebuild
  KHÔNG tự trích, đo thật 18/07; gồm cả "Gợi ý cho bạn" trước giờ THIẾU trong catalog vì bẫy
  EyebrowLabel runtime-key). Diff xcstrings 583+/0−, format cũ nguyên vẹn.
- Verify: build xanh iPhone 17, app launch sống; query mới test HTTP thật bằng `an.nodie.test`
  (role=user) → 200, trả đúng hồ sơ người đang theo ("Bình Trần").
- CÒN (tay/gate): 3 mục Validation trên UI thật; cân nhắc FriendsUITests SAU khi 1933-04 land
  (không thêm test giữa lúc gate 3× đang tính).
