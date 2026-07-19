# Audit UX/UI NODIE iOS — production readiness

Ngày: 17/07/2026  
Phạm vi: toàn bộ app iOS SwiftUI đang hiển thị trong bản 1.0.0 (Auth, Hỏi đáp, Chat, Bạn bè, Cá nhân, moderation, push)  
Thiết bị kiểm: iPhone 17 Simulator, iOS 26.5, portrait, tiếng Việt  
Phương pháp: chạy build/test thật, đọc accessibility tree qua XCUITest, review SwiftUI + Supabase flow, đo contrast token. Không sửa code.

## Kết luận

**NO-GO cho production hiện tại. Điểm tổng: 5.8/10.**

Visual system có cá tính, code UI có nền tốt, nhiều flow Supabase đã chạy thật. Tuy nhiên Chat đang trưng ba affordance chưa hoạt động thật; accessibility chưa đạt; tab Bạn bè thiếu chức năng đã hứa; bộ UI test lẫn test thật và mock cũ nên release gate không xanh đáng tin.

## Release blockers

| ID | Mức | Vấn đề | Bằng chứng | Tác động | Hướng xử lý |
|---|---|---|---|---|---|
| P0-01 | Blocker | Ảnh/Máy ảnh/Tệp trong Chat chỉ đóng khay, không mở picker/upload | `ChatDetailView.attachTray`; comment `CHƯA nối thật` | Nút nhìn hoàn chỉnh nhưng bấm không làm gì | Nối PhotosPicker, camera, document picker, progress, retry, preview |
| P0-02 | Blocker | Ghi âm là UI giả: không AVAudioRecorder, waveform giả, gửi chỉ huỷ | `ChatDetailView.recordingBar` | Mất niềm tin; feature cốt lõi không dùng được | Thu audio thật, permission, timer, playback, upload, cancel/retry |
| P0-03 | Blocker | Media nhận về chỉ là gradient; voice không phát được; file không mở được | `MessageBubbleView.mediaBubble` / `bubbleText` | Chat media không hoàn chỉnh end-to-end | Thumbnail/cache, player, file metadata/open/share, lỗi tải |
| P0-04 | Blocker | “Xem hồ sơ/Thông tin nhóm” disable cứng | `ChatDetailView` menu | Dead affordance trong action menu | Wire route/profile/group info hoặc ẩn mục tới khi xong |
| P0-05 | Blocker | UI test suite không phản ánh implementation hiện tại | Chat/NewMessage tests vẫn bypass/mock id, app đã dùng Supabase UUID thật | Không có release regression gate đáng tin | Chuyển toàn suite sang account thường + seed thật; bỏ tên/id mock |

## Vấn đề ưu tiên cao

| ID | Mức | Vấn đề | Chi tiết |
|---|---|---|---|
| P1-01 | High | Contrast chữ nhỏ fail WCAG AA | `inkMuted` trên bg = **3.91:1**, `inkFaint` = **2.59:1**, `sunDim` trên trắng = **2.79:1**. Các token dùng nhiều cho meta/timestamp/action count dưới 18pt; yêu cầu 4.5:1 cho text, 3:1 cho glyph lớn. |
| P1-02 | High | Nhiều vùng chạm dưới 44×44pt | ☀, ▲, Trả lời, follow, Huỷ/Đổi/tag chip chưa dùng `expandedHitArea`; padding thực tế thường 26–32pt cao. Existing test chỉ kiểm avatar/back/attach/mic/send. |
| P1-03 | High | “AI tự nhận” không phải AI | `AskQuestionView.detectedTag` là regex keyword 5 nhóm nhưng UI nói “AI đọc câu hỏi”. Với app sức khoẻ, đây là vấn đề trust và phân loại sai. Đổi copy thành “Tự động gợi ý” hoặc dùng classifier thật + confidence/fallback. |
| P1-04 | High | Bạn bè thiếu “Đang theo dõi” | `FriendsView` chỉ render “Gợi ý cho bạn”; comment code ghi rõ nợ dữ liệu. User đã follow nhưng không có nơi quản lý danh sách. |
| P1-05 | High | Không có loading/empty rõ ràng ở Bạn bè | Khi request chậm/rỗng, màn chỉ còn heading “Gợi ý cho bạn”; khó phân biệt đang tải, không có người hay lỗi. |
| P1-06 | High | Error UX quá chung | Hai store đẩy alert tiêu đề “Lỗi” ở root. Không phân loại offline/auth/permission/server; recovery chủ yếu chỉ “OK”, thiếu Retry/context tại chỗ. |
| P1-07 | High | Chưa test accessibility ở cấu hình cực hạn | Có Dynamic Type scaling và Reduce Motion tốt, nhưng không có test largest accessibility size, VoiceOver traversal, Bold Text, Increase Contrast. Nhiều `lineLimit(1)` ở tên/bio/chat có nguy cơ truncate. |
| P1-08 | High | App sức khoẻ thiếu guardrail trong luồng nội dung | Disclaimer chỉ ở Điều khoản; màn hỏi/đáp không nhắc nội dung cộng đồng không thay thế tư vấn y khoa, không có escalation cho triệu chứng khẩn cấp. |

## Vấn đề trung bình

- Body/meta mặc định chủ yếu 10–13.5pt; dù có Dynamic Type, cỡ mặc định nhỏ hơn chuẩn đọc thoải mái cho nội dung dài.
- Tab label 9.5pt quá nhỏ. Glyph Unicode (`?`, `◧`, `◎`, `⌕`, `✉️`) thiếu nhất quán với SF Symbols và có thể tạo accessibility noise.
- Avatar chữ cái là nội dung trang trí nhưng chưa luôn `accessibilityHidden(true)`, có thể làm VoiceOver đọc lặp “M, Minh…”.
- App cố định Light Mode và portrait, chỉ target iPhone. Có thể là quyết định v1, nhưng phải ghi rõ phạm vi support; chưa đạt adaptive/dark-mode parity.
- Search Bạn bè debounce tốt nhưng không có trạng thái “không tìm thấy”, nút clear, recent search hoặc progress.
- Push foreground vẫn hiện banner ngay cả khi đang đứng trong đúng chat; code ghi nợ phase sau. Gây nhiễu trong hội thoại đang mở.
- Compose câu hỏi không autosave draft qua app termination; discard confirm chỉ bảo vệ thao tác Huỷ.
- Onboarding không có “khám phá trước khi đăng nhập”; tăng friction trước khi user thấy giá trị cộng đồng.
- Hidden Feed/Journey còn mock/client-side. Không được bật lại tab trong release nếu chưa wire Supabase và audit riêng.

## Điểm theo khu vực

| Khu vực | Điểm | Nhận xét |
|---|---:|---|
| Visual language | 8.0 | Editorial kem/mực/xanh khác biệt, spacing/token thống nhất |
| Navigation | 7.5 | 3 tab rõ, stack riêng, swipe-back/tab restore tốt |
| Auth/onboarding | 7.0 | Validation, reset password, session flow tốt; chưa preview giá trị |
| Hỏi đáp | 7.2 | Data thật, skeleton, nested reply, draft safety tốt; trust/a11y còn yếu |
| Chat | 3.5 | Text/reaction/reply tốt; media/voice/menu chưa production |
| Bạn bè/profile | 5.8 | Search/follow/profile thật; thiếu following/loading/empty |
| Accessibility | 4.5 | Có label/Reduce Motion/Dynamic Type nền tảng; contrast và hit target fail |
| Reliability/release gate | 3.8 | Build được; UI suite stale và có timeout/restart |

## Điểm tốt nên giữ

- Design token tập trung: `NodieColors`, `NodieTypography`, `NodieSpacing`; không rải hex bừa trong screen chính.
- Dynamic Type được scale theo `UIFontMetrics`; root rebuild giữ navigation/draft.
- `Reduce Motion` đã được tôn trọng ở recording và gesture animation.
- Skeleton Hỏi đáp ẩn khỏi VoiceOver, không đọc dữ liệu placeholder giả.
- Draft gửi lỗi được giữ lại; double-submit/in-flight state xử lý cẩn thận.
- Navigation theo tab, swipe-back, tab bar hide ở detail, tab restoration có tư duy production.
- Loading/error/empty của QA và Profile tốt hơn mức prototype.
- Supabase/RLS dùng account thường trong các test quan trọng; không dùng admin che lỗi quyền.
- Nút back/attach/mic/send/primary avatar đã có hit area 44pt và accessibility label rõ.

## Kết quả chạy thật

- Debug app compile thành công trên iPhone 17 Simulator, iOS 26.5.
- Chạy toàn bộ **35 XCUITest** trên code/worktree hiện tại: **11 pass, 24 fail, 0 skip**, xcodebuild exit 65. Result bundle: `/tmp/nodie-ux-audit.xcresult`.
- Quan sát trong run: Auth login/reset/error/session hoạt động; QA/Profile các flow dữ liệu thật chạy; Chat/NewMessage test mock cũ không còn tìm thấy dữ liệu/identifier sau khi store chuyển sang Supabase.
- Trong 24 failure có **15 test bị signal kill**; phần còn lại chủ yếu tìm tên/id mock cũ như `Lab trường thọ #3`, `Hà Chi`, `newMessagePerson-mai`, `12 tin chưa đọc`. Cần tách test infrastructure crash khỏi assertion stale, rồi chạy xanh lặp lại trước release.

## Thứ tự sửa đề xuất

1. Hoàn thiện hoặc ẩn toàn bộ media/voice/chat menu dead affordance.
2. Chuyển Chat/NewMessage/Swipe tests sang Supabase seed thật; làm suite xanh ổn định.
3. Fix contrast token và mở rộng hit area 44pt toàn app; thêm accessibility regression tests.
4. Hoàn thiện Friends: following + loading/empty/search states.
5. Sửa copy/classifier “AI tự nhận”; thêm medical safety copy/escalation.
6. Test ma trận: small phone, large phone, largest Dynamic Type, VoiceOver, Reduce Motion, offline/slow network, permission denied, real device.

## Definition of done để lên production

- Không còn control nhìn bấm được nhưng no-op/disabled vô lý.
- Chat media/voice chạy end-to-end hoặc bị ẩn khỏi release.
- 100% test release-critical chạy bằng session/RLS thật và xanh lặp lại 3 lần.
- Mọi touch target chính ≥44pt; contrast AA cho text/action.
- VoiceOver traversal và largest Dynamic Type qua toàn bộ màn chính.
- Có UX rõ cho loading/empty/error/offline/permission denied.
- Test ít nhất một iPhone nhỏ, một iPhone lớn và một thiết bị thật.

## Câu hỏi chưa giải quyết

- Light-only + portrait-only có phải phạm vi sản phẩm chính thức của v1 không?
- Media/voice phải ship trong 1.0 hay nên ẩn để release text chat trước?
- NODIE có định vị là cộng đồng sức khoẻ hay nội dung giáo dục tổng quát? Quyết định này chi phối disclaimer và moderation.
