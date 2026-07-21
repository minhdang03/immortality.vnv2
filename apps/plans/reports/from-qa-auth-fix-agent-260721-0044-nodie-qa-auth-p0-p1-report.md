# NODIE Q&A + Auth batch fix — báo cáo

Không chạy `xcodebuild`/`xcodegen` (theo yêu cầu). Code viết đúng cú pháp Swift; build tập trung sau.
Không đụng thư mục Conversations. Không sửa migration/SQL.

## Đã sửa (file · dòng)

### 1. [P0] Đăng xuất/xoá TK không gỡ device_token → máy dùng chung đẩy push của người trước
- `Auth/AuthStore.swift`
  - Thêm `weak var pushManager: PushManager?` (~54) — wire ở RootView, không dựng singleton mới.
  - `signOut()` (~196): gọi `await pushManager?.removeToken()` **TRƯỚC** `client.auth.signOut()`
    (DELETE trên `device_tokens` cần session sống mới qua RLS).
  - `deleteAccount()` (~292): `removeToken()` TRƯỚC RPC `delete_account` (sau RPC thì auth.users mất).
- `NodieApp.swift` (~103): `auth.pushManager = push` trong `.onAppear` của RootView
  (PushManager do AppDelegate sở hữu, sống suốt đời app → weak ref an toàn).
- `removeToken()` giữ nguyên (đã đúng): grep xác nhận trước đây 0 caller.

### 2. [P1] `deleteAccount()` bỏ wipe disk cache
- `Auth/AuthStore.swift`: tách phần dọn thành `wipeLocalCaches()` (~226) dùng chung; gọi ở CẢ
  `signOut()` lẫn `deleteAccount()`. Dọn SignedURLCache/ChatImageCache/ChatFileDownloader/
  ChatDiskCache/QADiskCache như cũ.

### 3. [P1] Thiếu `@MainActor` → mutate UI state ngoài main
- `Auth/AuthStore.swift` (~12) + `Features/QA/QAStore.swift` (~11): thêm `@MainActor` cấp class,
  comment theo đúng mẫu FollowStore (SE-0338).
- Call-site: tất cả khởi tạo QAStore/AuthStore đều ở View/`#Preview` (đã MainActor) — không vỡ.
- Ghi chú: linter đã tự thêm `nonisolated(unsafe)` cho `authTask` để `deinit` cancel được — đúng, giữ.

### 4. [P1] Câu đã xoã "sống lại" ở tab Đã lưu (bẫy 0034)
- `Features/QA/QAStoreSaves.swift`
  - `savedQuestions()` (~74): embed `question:questions!inner(...)` + `.is("question.deleted_at", value: nil)`
    → inner join loại thẳng save trỏ tới câu đã xoá.
  - `myAnswers()` (~124): thêm `.is("question.deleted_at", value: nil)` **không** `!inner` — giữ dòng
    trả lời nhưng để embed null ⇒ `isOrphaned` hiện "Câu hỏi gốc đã xoá" (không drop dòng).
- Rà toàn bộ select QA: `fetchQuestions`/`loadQuestion`/`loadThread`(answers+replies)/`myQuestions`
  đã có filter từ trước. Chỗ duy nhất sót là 2 embed trên.

### 5. [P1] Double-tap ▲/☀ → count lệch / 409
- `Features/QA/QAStore.swift`: thêm `reactionsInFlight: Set<String>` (~43), guard theo khoá
  `"\(kind):\(targetId)"` + `defer` nhả trong `toggleReaction` (~372). Khoá kèm `kind` để ▲ và ☀
  trên cùng mục không chặn nhau. Optimistic UI giữ nguyên.

### 6. [P1] Swipe-to-delete là dead UI (ScrollView, không List)
- `Features/Profile/MyContentViews.swift`: đổi `.swipeActions` → `.contextMenu` (chạm giữ) ở
  `MyQuestionsView` (~123) và `MyAnswersView` (~196).
- **Chọn contextMenu, không đổi sang List**: List sẽ phá toàn bộ scaffold (divider/padding/bg tự vẽ,
  spinner/empty-state/`containerRelativeFrame`). contextMenu chạy trong ScrollView, 0 phá layout.
  Đánh đổi: khám phá kém hơn vuốt (phải chạm giữ). confirmationDialog + undo giữ nguyên.

### 8. [P2] Empty-state nói dối khi lỗi mạng
- `Features/Profile/MyContentViews.swift`: `MyContentScaffold` thêm `loadFailed` + `errorState`
  (icon wifi.slash + "Thử lại" gọi lại `onRefresh`). 3 view track `loadFailed = (fetched == nil)`.
- `Features/QA/QAStore.swift`: thêm `private(set) var questionsLoadFailed` (~14), set trong `loadQuestions`.
- `Features/QA/QuestionListView.swift`: `visible.isEmpty` → `questionsLoadFailed ? errorState : emptyState`,
  thêm `errorState` với nút Thử lại.

### 9. [P2] `flatReplies` không guard cycle → crash
- `Features/QA/QAStore.swift` `flatten()` (~267): thêm `visited: Set<UUID>`, chỉ đệ quy node chưa
  thăm (`visited.insert(r.id).inserted`). Dữ liệu vòng không còn tràn stack.

### 10. [P2] Sign-out offline làm user mắc kẹt
- `Auth/AuthStore.swift` `signOut()`: bỏ `run{}`, tự quản `isBusy`; `catch` rơi về
  `try? client.auth.signOut(scope: .local)` → luôn quên session local kể cả server hỏng.
  Thứ tự: removeToken (cần session sống) → signOut(global, fallback local) → wipeLocalCaches (luôn chạy).

## Bỏ qua — cần bạn xử lý

### 7. [P2] "Hay nhất" không bỏ đánh dấu được — CẦN SQL
- Client KHÔNG gọi sai: `QAStore.setBest` gọi RPC `set_best_answer` đúng, `BestToggleButton` truyền
  action đúng. Vấn đề ở **RPC chỉ SET, không UNSET** → bấm lại nút đang "Hay nhất" là no-op, nhãn
  "Bỏ đánh dấu Hay nhất" thành lời hứa suông.
- **Không tự chế đường vòng phía client** (theo yêu cầu). Đề xuất SQL: cho `set_best_answer` nhận
  cùng answer_id đang is_best → clear (`is_best = false`), tức toggle; vẫn kiểm caller là tác giả câu hỏi.
  Client sẽ chạy đúng ngay khi RPC biết unset (đang gọi vô điều kiện, hợp với toggle).

### Xoá reply cha làm mất reply con của người khác — QUYẾT ĐỊNH SẢN PHẨM
- Không tự làm (theo lưu ý). Hiện xoá mềm reply cha vẫn ẩn nhánh con trong `flatten` (con mồ côi
  parentId trỏ node đã ẩn → không render). Nếu muốn giữ nhánh con: cần mô hình tombstone kiểu
  Reddit/FB (giữ node cha dạng "[đã xoá]"). Chờ bạn chốt hướng trước khi đụng.

## Cần bạn verify bằng HTTP thật (bẫy PGRST đã ghi trong CLAUDE.md)
- Item 4: `.is("question.deleted_at", value: nil)` trên embed aliased. `savedQuestions` dùng `!inner`
  (kỳ vọng: drop hàng có câu đã xoá). `myAnswers` không inner (kỳ vọng: embed null → orphaned).
  Build xanh không chứng minh PostgREST đúng — cần test `question_saves`/`answers` bằng HTTP với
  tài khoản **role='user'** (admin short-circuit RLS). Chỉ 1 embed/query nên không lo PGRST201.

## Câu hỏi chưa giải quyết
- PostgREST: filter embed to-one **không** `!inner` có null-out embed cho hàng không khớp không, hay
  giữ nguyên? Nếu giữ nguyên thì `myAnswers` không cải thiện (nhưng cũng không hồi quy). Cần đo HTTP.
- `removeToken()` khi `pendingToken == nil` (mở app rồi đăng xuất mà Apple chưa trả token lần này):
  không xoá được hàng cũ trong DB của chính máy này. Chấp nhận theo scope hiện tại? (token cũ vẫn
  trỏ user vừa thoát cho tới khi APNs tự thải hoặc lần đăng nhập sau upsert đè). Cân nhắc lưu token
  bền hơn `pendingToken` (UserDefaults) nếu muốn chắc tay.

Status: DONE_WITH_CONCERNS
Summary: Sửa 9/10 mục (1,2,3,4,5,6,8,9,10) trong QAStore/AuthStore/PushManager-wiring/Profile-views;
mục 7 chặn ở SQL (RPC set-only) đã báo, không hack client.
Concerns/Blockers: Item 4 dùng embedded filter PostgREST — phải verify bằng HTTP thật (tài khoản
user, không admin) trước khi tin. Item 7 chờ SQL. Tombstone reply là quyết định sản phẩm, chưa làm.
