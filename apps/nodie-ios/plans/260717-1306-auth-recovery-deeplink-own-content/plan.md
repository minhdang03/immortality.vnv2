# Plan: Quên mật khẩu (#14) · Deep link `nodie://` (#16) · Sửa/xoá nội dung của mình (#15) · Khôi phục tab (#20) + hàng Thông báo (#17)

**Status:** chưa bắt đầu (17/07 13:06).
**Branch:** claude/immortality-mobile-hybrid
**Chốt phạm vi (Đăng 17/07):** #14 · #16 = custom scheme `nodie://` (KHÔNG universal links) · #15 = soft delete + cho sửa · #17 + #20.
**Ngoài phạm vi:** #18 banner offline · #19 dark mode (đã xong).

## Va chạm với session kia — BẢN ĐỒ ĐỀ BÀI ĐÃ CHẾT, VÀ BẢN ĐỒ NÀY CŨNG SẼ CHẾT

Session kia **commit `ac3a9db` lúc ~13:05** (giải phóng gần hết danh sách DIRTY của đề bài) rồi lan sang vùng mới. Đo 3 lần trong 10 phút, 3 kết quả khác nhau:

| File | Đề bài (13:06) | 13:08 | 13:1x |
|---|---|---|---|
| NodieApp.swift · Localizable.xcstrings · PushManager · entitlements · QuestionDetailView · Friends* | DIRTY | **SẠCH** (`ac3a9db`) | sạch |
| project.yml | DIRTY | **SẠCH** | **DIRTY lại** |
| AppState.swift | CLEAN | **DIRTY** | dirty |
| ChatDetailView · Models/Conversation | — | DIRTY | dirty |
| QAModels.swift · QuestionListView · ConversationListView | CLEAN | sạch | **DIRTY** |

⇒ **Không có bản đồ tĩnh nào dùng được.** Luật thay cho bản đồ:

1. `git status --short` **ngay trước** khi mở mỗi phase — cột "Rủi ro" dưới đây là ảnh chụp 13:1x, không phải lời hứa.
2. File họ đang giữ → **đợi họ commit**, đừng sửa song song. Hướng của họ: Chat/Conversations + AppState + Q&A models.
3. Mọi sửa trên file **dùng chung** (`project.yml`, `Localizable.xcstrings`, `QAModels.swift`) → **edit đúng-chuỗi, cộng thêm**, không bao giờ ghi đè cả file.
4. Xong phase nào **commit ngay** phase đó — đừng ôm cây làm việc bẩn lâu.

`Localizable.xcstrings` (họ vừa viết lại 10.877 dòng) và `project.yml` là hai chỗ dễ mất công nhất.

## Phases

| # | File | Nội dung | File sở hữu | Rủi ro đụng | Status |
|---|---|---|---|---|---|
| 01 | [phase-01-deep-link-password-reset.md](phase-01-deep-link-password-reset.md) | `nodie://` + Quên mật khẩu (#16 + #14) | project.yml · NodieApp.swift · Auth/* · +PasswordRecoveryViews.swift | THẤP | chưa |
| 02 | [phase-02-own-content-edit-delete.md](phase-02-own-content-edit-delete.md) | Sửa/xoá câu hỏi·trả lời·reply của mình (#15) | +QAStoreOwnContent.swift · ModerationMenu · AnswerCardView · AnswerReplyRow · QuestionDetailView · MyContentViews · +migration 0027 | THẤP | chưa |
| 03 | [phase-03-tab-restore-notifications-row.md](phase-03-tab-restore-notifications-row.md) | Khôi phục tab (#20) + hàng Thông báo thật (#17) | RootTabView.swift · ProfileSections.swift | TRUNG (AppState là của họ — KHÔNG đụng) | chưa |
| 04 | [phase-04-push-optout-blocked.md](phase-04-push-optout-blocked.md) | Tắt push thật (xoá `device_tokens`) | ProfileSections · PushManager · project.yml | — | **CHẶN** — chờ Đăng làm Apple Developer portal |

Phase 01→02→03 độc lập nhau, chạy tuần tự cho gọn. 04 chặn cứng, không phải vì file.

## Sự thật đã đo (ngược với đề bài — đọc trước khi code)

1. **`.passwordRecovery` KHÔNG BAO GIỜ nổ.** supabase-swift 2.49.0 chỉ `emit(.passwordRecovery)` ở đúng 1 chỗ: `handleImplicitGrantFlow` (AuthClient.swift:986). App chạy **PKCE** (`defaultFlowType = .pkce`, Defaults.swift:32; `SupabaseClientProvider` dùng option mặc định) → link recovery đi qua `exchangeCodeForSession` → chỉ `emit(.signedIn)` (:726). ⇒ **Không được nghe event**; phải tự đọc URL. Xem phase-01.
2. **Hệ quả: phase nhảy thẳng `.signedIn`** sau khi đổi code → LoginView biến mất → sheet mật khẩu mới **không thể** đặt ở LoginView. Đặt ở `RootView` (NodieApp.swift — giờ đã sạch).
3. **RLS đã lọc `deleted_at` sẵn** (đo bằng psql trên prod): `questions_read` / `answers_read` / `answer_replies_read` đều `auth.uid() is not null AND (deleted_at is null OR is_admin())`. ⇒ **KHÔNG cần migration, KHÔNG cần lọc client** như đề bài lo. "OPEN ISSUE" đó đã tự đóng.
4. **NHƯNG tài khoản test = `admin`** (đo: `profiles.role='admin'` cho `NODIE_TEST_EMAIL`) → `is_admin()` true → **Đăng và UITests VẪN THẤY bài đã xoá mềm**. ⇒ vẫn thêm `.is("deleted_at", value: nil)` vào select của QAStore — không phải vì RLS thiếu, mà để admin thấy đúng như người thường (app không có màn kiểm duyệt).
5. **`answer_count` sẽ lệch.** Trigger `trg_answers_count` chỉ chạy `INSERT DELETE` (đo trên prod) → xoá mềm là UPDATE ⇒ không trừ. Cần migration 0027. Xem phase-02.
6. **i18n hết nợ**: 169 key, đủ 8 ngôn ngữ (de/en/es/fr/ja/ko/ru/zh-Hans), sourceLanguage `vi`. Key mới phải điền đủ 8.

## Việc CHỈ ĐĂNG LÀM ĐƯỢC (không phải code, không phải psql)

1. **Supabase Dashboard → Auth → URL Configuration → Redirect URLs**: thêm `nodie://password-reset` và `nodie://email-confirmed`. Thiếu bước này thì link trong mail trả về lỗi `redirect_to not allowed` — #14 chết. (phase-01)
2. **Apply migration 0027** lên prod (như 0017–0026). Chưa apply thì `answer_count` lệch sau khi xoá trả lời. (phase-02)
3. **Apple Developer portal** (capability Push + profile + khoá APNs) → mới mở khoá phase-04.

## Acceptance criteria

1. Màn Login có "Quên mật khẩu?" → nhập email → nhận mail → bấm link → app mở → đặt mật khẩu mới → vào thẳng app. Link hỏng/hết hạn → báo tiếng Việt, không treo.
2. `nodie://` khai trong `CFBundleURLTypes`; mở app kể cả lúc app đã tắt hẳn (cold start).
3. Câu hỏi/trả lời/reply CỦA MÌNH có ⋯ → Sửa / Xoá. Xoá = `deleted_at = now()`, biến mất khỏi mọi màn (kể cả admin). Sửa ghi `edited_at`, UI hiện "đã sửa". Không thấy Sửa/Xoá trên nội dung người khác.
4. Giết app rồi mở lại → về đúng tab đang đứng.
5. Hàng "Thông báo" nói đúng sự thật (không còn toggle giả `@AppStorage` không ai đọc).
6. Build xanh; UITests hiện-xanh vẫn xanh; key mới đủ 8 ngôn ngữ.

## Ràng buộc

- File < 200 dòng → `QAStore.swift` đã **391 dòng**: mọi thứ của #15 vào file mới `QAStoreOwnContent.swift` (theo pattern `QAStoreSaves.swift` / `QAStoreModeration.swift`).
- Comment tiếng Việt, giải thích **VÌ SAO** chứ không phải cái gì.
- `Text(cond ? "a" : "b")` KHÔNG tra String Catalog → tách `cond ? Text("a") : Text("b")`.
- Test mới phải `app.launchVietnamese()` (không `launch()`).
- Thêm file mới → `xcodegen generate`.
- Build: `xcodebuild -project NODIE.xcodeproj -scheme NODIE -destination 'platform=iOS Simulator,name=iPhone 17' build` (máy này KHÔNG có iPhone 16).

## Câu hỏi chưa chốt

1. **`answer_count` lệch**: làm migration 0027 (đúng, nhưng thêm 1 migration chờ Đăng apply — 0022/0026 còn đang xếp hàng), hay chấp nhận đếm lệch tạm? Kế hoạch đang chọn **0027**.
2. **Xoá câu hỏi có `answers` của người khác** → xoá mềm câu hỏi là ẩn luôn công sức người khác. Cho xoá luôn, hay chặn khi đã có trả lời? Kế hoạch đang **cho xoá** (RLS đã cho phép) — cần Đăng gật.
3. **Sửa có giới hạn thời gian không?** (kiểu FB/X: sửa thoải mái + gắn nhãn "đã sửa"). Kế hoạch đang: **không giới hạn**, gắn nhãn.
