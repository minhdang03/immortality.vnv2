# Audit UX/UI production readiness — Web + NODIE iOS

Ngày: 18/07/2026 · Audit code hiện tại, gồm working tree chưa commit · Không sửa app code.

## Verdict

**NO-SHIP cho public production/App Store.** Web đang live và legal pages đã đủ đường dẫn, nhưng chưa đạt accessibility/keyboard production quality. iOS đã tiến rõ ở Chat media/voice, song còn blocker UGC moderation, release gate chưa chứng minh, accessibility/Friends/error UX chưa hoàn thiện.

Điều kiện tối thiểu để đổi verdict: Chat có Báo cáo/Chặn; full UITest trên user thường xanh 3 lần; a11y AA + touch target; Friends/loading/empty/error; destructive flows có confirm; signup có Terms/Nội quy; xác nhận matrix thiết bị thật.

## Top 10 blocker/gap cần xử lý trước ship

1. **BLOCKER · missing** — Chat UGC không có Báo cáo/Chặn (`ChatDetailView.swift:914`).
2. **BLOCKER · partial** — UITest đang được viết lại nhưng chưa có bằng chứng full suite xanh 3× (`plan.md:27`).
3. **HIGH · missing** — Chat xoá/rời hội thoại thực thi ngay, không confirm/undo (`ChatDetailView.swift:349`).
4. **HIGH · missing** — iOS contrast và touch target chưa qua gate; token cũ vẫn giữ (`NodieColors.swift:15`).
5. **HIGH · missing** — Friends thiếu following/loading/empty/no-results (`FriendsView.swift:30`).
6. **HIGH · partial** — offline/reconnect/pagination chat chưa có UX hoàn chỉnh (`ChatDetailView.swift:100`, `ConversationStore.swift:166`).
7. **HIGH · missing** — lỗi iOS vẫn dồn vào alert chung chỉ có OK (`RootTabView.swift:110`).
8. **HIGH · missing** — web navigation dùng button/clickable div thay link; keyboard/semantics hỏng (`Header.jsx:44`).
9. **HIGH · missing** — web forms thiếu label/name/autocomplete và focus-visible (`ContactPage.jsx:45`).
10. **HIGH · missing** — web không có skip link, `html lang` không đổi khi chuyển EN (`index.html:2`, `App.jsx:248`).

## Findings — iOS

| ID | Severity · status | Bằng chứng | User impact | Recommendation |
|---|---|---|---|---|
| IOS-01 | **BLOCKER · missing** | `apps/nodie-ios/NODIE/Features/Conversations/ChatDetailView.swift:914-950` — context menu của tin người khác chỉ có reaction/reply/copy; không report/block. | App chứa UGC/chat nhưng user không thể flag/chặn ngay tại bề mặt vi phạm; rủi ro App Review Guideline 1.2 và an toàn cộng đồng. | Thêm Báo cáo + Chặn cho tin người khác, confirm phù hợp, ghi `reports`, cập nhật blocklist và ẩn nội dung lập tức; UITest cả success/failure. |
| IOS-02 | **BLOCKER · partial** | `apps/nodie-ios/plans/260717-1933-production-readiness-superapp-standard/plan.md:27` còn Phase 04 ⬜; test code hiện đã chuyển sang Supabase thật tại `NODIEUITests/ChatDetailUITests.swift:12-16`, nhưng chưa có kết quả 3×. | Không có regression gate đáng tin cho RLS, chat, gesture, media, auth. Working tree chưa commit càng làm build phát hành không tái lập. | Seed idempotent → build sạch → chạy full suite user thường 3 lần liên tiếp; lưu `.xcresult`/commit SHA; không ship khi flaky/fail. |
| IOS-03 | **HIGH · missing** | `apps/nodie-ios/NODIE/Features/Conversations/ChatDetailView.swift:349-353` gọi `leave` rồi dismiss ngay từ destructive menu. `ConversationStore.swift:563-577` xoá membership/local state. | Một chạm nhầm làm mất cuộc trò chuyện/kênh khỏi danh sách; khác với account delete đã confirm đúng. | Thêm confirmation dialog, copy nói rõ DM vs group/channel; ưu tiên undo nếu backend cho phép. Chỉ dismiss sau server success. |
| IOS-04 | **HIGH · missing** | `apps/nodie-ios/NODIE/DesignSystem/NodieColors.swift:15-16,33` vẫn dùng `inkMuted #8A7A5C`, `inkFaint #A99A78`, `sunDim #C69214`; Phase a11y còn ⬜ tại `.../plan.md:28`. | Meta/timestamp/action nhỏ khó đọc; audit trước đo dưới AA. | Đổi token theo contrast đo trên mọi surface; lưu bảng ratio; kiểm Increase Contrast + Differentiate Without Color. |
| IOS-05 | **HIGH · partial** | `ChatDetailView.swift:986-1002` reaction chip chỉ padding 7×3; `FriendsView.swift:161-171` follow chip chỉ padding dọc 7; `TouchTargetUITests.swift:29-64` chỉ cover avatar/back/attach/mic/send. | Target nhỏ gây miss-tap, đặc biệt người lớn tuổi/motor impairment; test hiện cho cảm giác an toàn giả. | Áp min 44×44 cho mọi interactive control; mở rộng UITest theo inventory 170 `Button`, gồm reaction, follow, cancel/change, save, menu. |
| IOS-06 | **HIGH · missing** | `apps/nodie-ios/NODIE/Features/Friends/FriendsView.swift:5-11` tự ghi nợ following; `:30-49` luôn render một section, không loading/empty/error; `:52-69` không no-results. | Màn trống không phân biệt đang tải, hết gợi ý, không tìm thấy hay lỗi; user không quản lý người đang theo dõi. | Store nạp profiles đang follow; section riêng; ProgressView/empty/no-results/retry; clear-search; giữ optimistic follow nhưng disable đúng row in-flight. |
| IOS-07 | **HIGH · partial** | `apps/nodie-ios/NODIE/Shell/RootTabView.swift:110-138` ba alert cùng title “Lỗi”, action chỉ “OK”; dù `NodieErrorKind.swift:61-82` đã có taxonomy/retryability nhưng view chưa dùng. | User không biết offline/auth/permission/server và không có retry tại ngữ cảnh; alert có thể xuất hiện ở tab khác nguồn lỗi. | Render banner/inline state theo `NodieErrorKind`, Retry/Đăng nhập/Cài đặt theo loại; chỉ dùng alert cho lỗi modal thực sự. |
| IOS-08 | **HIGH · missing** | `apps/nodie-ios/NODIE/Features/QA/AskQuestionView.swift:9-11,27-45` classifier là regex tạm; UI vẫn nói “AI tự nhận”/“AI đọc” tại `:172-206`. | Tạo kỳ vọng sai, phân loại nhầm làm giảm trust. | Đổi copy thành “Tự động gợi ý theo từ khoá” ngay, hoặc triển khai classifier thật có confidence/fallback. |
| IOS-09 | **HIGH · partial** | Store hỗ trợ cursor `ConversationStore.swift:166-180`, nhưng `ChatDetailView.swift:100-160` không có trigger tải trang cũ. QA cố định 50 tại `QAStore.swift:64-76`. | Chat chỉ xem 50 tin mới nhất; QA chỉ 50 câu — lịch sử biến mất không lời giải thích. | Kéo tới top tải `before`; giữ vị trí scroll; QA infinite/load-more; loading/end/error state và test >1 page. |
| IOS-10 | **HIGH · partial** | `ChatDetailView.swift:188-196` subscribe theo task/onDisappear; không có `scenePhase`/foreground resubscribe. `ConversationStoreRealtime.swift:20-39` gọi lại cùng channel là no-op khi object còn tồn tại. | App nền lâu hoặc socket chết có thể đứng hình; user tưởng không có tin mới. Offline chỉ hiện alert sau lỗi. | Khi active: verify channel health, resubscribe + fetch delta; thêm explicit offline/reconnecting banner và pull-to-retry. |
| IOS-11 | **MEDIUM · missing** | `VoiceMessagePlayer.swift:57-88,141-166` nuốt download/play error và trả nil, không state lỗi/retry. | Bấm phát voice hỏng không có phản hồi; user không biết mạng lỗi hay file lỗi. | Expose per-message playback error, nút Thử lại; validate HTTP status/MIME; dọn temp/cache có giới hạn. |
| IOS-12 | **MEDIUM · missing** | `ChatDetailView.swift:693-695` bản ghi <1 giây bị bỏ im lặng. | Bấm gửi thấy thanh ghi biến mất nhưng không biết vì sao. | Haptic/toast “Tin thoại quá ngắn” và giữ affordance rõ; test boundary 0.9/1.0 giây. |
| IOS-13 | **MEDIUM · missing** | `LoginView.swift:60-132` form đăng ký không có checkbox/link Terms/Nội quy; plan còn ⬜ tại `2015.../plan.md:27`. | User tạo tài khoản UGC mà chưa thấy quy tắc/điều khoản; yếu cho trust và App Review. | Link Điều khoản, Quyền riêng tư, Nội quy ngay signup; copy đồng ý rõ, accessible, mở web/in-app. |
| IOS-14 | **MEDIUM · partial** | `project.yml:32,70,77` chốt iPhone-only/portrait/light; quyết định ghi trong plan `1933.../plan.md:62`, nhưng release gate/docs còn ⬜ `:31`. | Không phải bug nếu scope chủ đích, nhưng App Store screenshots/release notes/support phải khớp; keyboard/sheet vẫn cần test dưới system Dark. | Ghi phạm vi chính thức; test iPhone SE-size + large iPhone + real device; xác nhận system sheets/keyboard/permissions không lệch theme. |

## Findings — Web (Vercel Web Interface Guidelines)

| ID | Severity · status | Bằng chứng | User impact | Recommendation |
|---|---|---|---|---|
| WEB-01 | **HIGH · missing** | `apps/web/src/components/layout/Header.jsx:44-52,66-69,97-103` dùng clickable `div` và button để navigate; `BottomNav.jsx:10-16` tương tự. | Logo không keyboard-accessible; Cmd/Ctrl-click, middle-click, copy link, open new tab không hoạt động; semantics navigation sai. | Dùng `<a href>`/router Link, giữ URL thật và intercept SPA có điều kiện; logo là link có accessible name. |
| WEB-02 | **HIGH · missing** | `apps/web/index.html:2` hardcode `lang="vi"`; `App.jsx:57-69` đổi state/localStorage nhưng không cập nhật `document.documentElement.lang`. | Screen reader phát âm tiếng Anh bằng giọng Việt; dịch tự động/SEO locale sai. | Đồng bộ `html.lang` trong effect mỗi khi `lang` đổi; set `lang` cho đoạn trộn ngôn ngữ. |
| WEB-03 | **HIGH · missing** | `apps/web/src/App.jsx:235-248` vào thẳng header/main, không skip link; `<main>` không id/focus target. | Keyboard/screen-reader phải tab qua toàn nav trên mỗi route. | Thêm “Bỏ qua đến nội dung”, `#main-content`, focus main/h1 sau route change có quản lý, `scroll-margin-top`. |
| WEB-04 | **HIGH · missing** | `apps/web/src/pages/info/ContactPage.jsx:45-50` inputs chỉ placeholder, thiếu label/name/autocomplete; `SearchPage.jsx:29-35` search cũng không label/name. | Placeholder không thay label; password manager/assistive tech không hiểu trường; lỗi không trỏ trường. | `<label htmlFor>`, id/name, `autocomplete="name|email"`, search `type=search`; lỗi inline + `aria-describedby`, focus field lỗi đầu tiên. |
| WEB-05 | **HIGH · missing** | `apps/web/src/styles/pages/search-contact.css:6,25-27`, `pages/comments.css:16-18`, `components/cta-bands.css:51-55` xoá outline và chỉ đổi border ở `:focus`, không focus-visible ring chắc chắn. | Keyboard focus khó/không thấy, đặc biệt low contrast. | Không xoá outline hoặc thêm `:focus-visible` ring/offset đạt 3:1; dùng `:focus-within` cho compound form. |
| WEB-06 | **HIGH · missing** | `ContactPage.jsx:43-44`, `Comments.jsx:65-70`, `NewsletterBand.jsx:72-78` status async không có live region; copy loading dùng `...` tại `ContactPage.jsx:50`, `Comments.jsx:90`. | Screen reader không nghe success/error/loading; người dùng không biết submit xong. | `role=status`/`aria-live=polite`, `aria-busy`; dùng “Đang gửi…”/“Sending…”, giữ message đủ lâu và có next step. |
| WEB-07 | **HIGH · missing** | `StoryList.jsx:41-52` và `KhaiTriList.jsx:102-105` dùng `<div onClick>` cho item. | Không tab/Enter được, không semantics link, không open new tab. | Dùng `<a href>`/Link; nếu action thật thì `<button>`; giữ heading/title structure. |
| WEB-08 | **MEDIUM · missing** | `SearchPage.jsx:7-24`, `KhaiTriList.jsx:8-10`, `StoryList.jsx:4-22` giữ search/filter/pagination trong state, không URL. | Refresh/back/share làm mất trạng thái; analytics/deep link kém. | Sync `q`, `tag`, page/visible cursor vào query params; browser back khôi phục. |
| WEB-09 | **MEDIUM · partial** | Chỉ module năng lượng có reduce-motion; animation nền toàn site tại `base.css:116-165` và skeleton `animations.css:15-32` không có global reduced variant. | User bật Reduce Motion vẫn thấy pulse/float/shimmer/view transition liên tục. | Global `@media (prefers-reduced-motion: reduce)` dừng non-essential animation và smooth scroll/view transition. |
| WEB-10 | **MEDIUM · missing** | Nhiều `transition: all`, ví dụ `article-detail.css:79,97`, `header.css:87,111`, `home.css:186`; guideline cấm. | Animate layout/property ngoài ý muốn, jank và motion khó kiểm soát. | Liệt kê `color, background-color, border-color, opacity, transform`; chỉ animate compositor-friendly khi có thể. |
| WEB-11 | **MEDIUM · partial** | `Comments.jsx:43` hardcode `vi-VN` dù app có English; status/admin copy `:46,51-53,61,66,70` hardcode VI. | Trang English lẫn tiếng Việt và format ngày sai locale. | Dùng `Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US')`; đưa toàn copy vào catalog. |
| WEB-12 | **MEDIUM · missing** | `Comments.jsx:53` xoá bình luận trực tiếp; pattern destructive admin tương tự nhiều tab. | Miss-click xoá nội dung không confirm/undo. | Confirm modal có tên item hoặc undo window; disable while request; báo success/failure. |
| WEB-13 | **LOW · partial** | `ShareButtons.jsx:34-44` icon-only dùng `title`, SVG không `aria-hidden`; copied state không live. | Accessible name không nhất quán; VoiceOver có thể đọc SVG noise và không báo đã copy. | `aria-label`, SVG `aria-hidden`, copied message `aria-live=polite`. |

## Đã làm thật / không còn là gap

- **Chat media ảnh/camera/tệp:** picker, permission denied, optimistic upload, retry/discard, viewer/QuickLook đã có tại `ChatDetailView.swift:506-623`; prior audit P0-01/P0-03 phần media là **stale**.
- **Voice thật:** recorder AAC, waveform, interruption, player/cache/rate đã có tại `VoiceRecorder.swift:38-164`, `VoiceMessagePlayer.swift:46-166`; prior audit P0-02 là **stale**.
- **Dead menu hồ sơ/nhóm + suppress push:** `ChatDetailView.swift:328-347`, `RootTabView.swift:159-168`; prior audit P0-04 là **stale**.
- **Web privacy/terms:** routes tại `App.jsx:318-323`; plan ghi prod 200 tại `2015.../plan.md:22`.
- **i18n chat edit/delete:** comment `ChatDetailView.swift:880-882` nói key chưa có là **stale**; catalog đã có `(đã sửa)`, `Sửa`, `Xoá` tại `Localizable.xcstrings:31,11360,13873`.
- **Seed cold-start:** plan xác nhận 12 câu/4 persona + RLS user tại `2015.../plan.md:24`; không còn gap “prod chỉ 3 profile” của report cũ.

## Docs/status stale cần sửa để không điều phối sai

- `apps/nodie-ios/plans/260717-1404-ship-1.0-blockers/plan.md:61` vẫn ghi Chat views “đang làm”, trong khi 1933 phase 01–03 đã hoàn tất.
- `apps/nodie-ios/plans/260717-1933-production-readiness-superapp-standard/plan.md:4` vẫn `status: planned`, trái với `:24-26` đã ✅.
- `apps/nodie-ios/plans/260717-2015-pre-appstore-submission/plan.md:4` vẫn `pending`, dù `:22-24` đã hoàn tất.
- Phase ops ghi “✅” nhưng còn deploy edge function tay tại `phase-02-supabase-ops-ledger-logs.md:3,19-23`; trạng thái đúng nên là **partial** đến khi verify `push_failures` sống.

## Gate đề xuất

1. Fix IOS-01/03/04/05/06/07 và WEB-01…07.
2. Build web + axe/keyboard smoke ở VI/EN, mobile/desktop; test zoom 200%, reduced motion, dark/light.
3. Seed Supabase idempotent; full iOS UITest user thường 3× cùng commit; thêm moderation, pagination, offline/reconnect, largest Dynamic Type, VoiceOver.
4. Test iPhone nhỏ + lớn + thiết bị thật: camera/mic denied/allowed/interruption, Photos/Files, push foreground/background, slow/offline network.
5. Chỉ archive/upload App Store từ commit sạch đã qua gate; hoàn tất App Store metadata/privacy/demo account/SMTP/captcha theo plan 2015.

## Unresolved questions

1. “Xoá cuộc trò chuyện” ở DM là leave vĩnh viễn hay chỉ ẩn local? Copy/confirm phải theo semantics sản phẩm.
2. Public release là TestFlight public hay App Store ngay? Cả hai vẫn cần release gate; captcha/SMTP urgency khác nhau.
3. Web admin có nằm trong accessibility production scope hay chỉ internal tool? Findings form/destructive vẫn là rủi ro vận hành dù không public.

