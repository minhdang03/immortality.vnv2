# Phase 06 — #25: Hồ sơ thành viên chạy Supabase thật + follows

**Ưu tiên:** P1. **Status:** chưa bắt đầu. **CHẶN bởi:** Đăng apply `0027` **và** `0028` (xem [phase-05](phase-05-apply-migrations-prod.md)). **Đụng độ: CAO.**

⚠️ **Cập nhật 13:45 — DB đã có sẵn, chỉ thiếu Swift.** `0028_nodie_follows.sql` (session kia commit `5201a8b`) đã dựng bảng `follows` + RLS + **trigger cắt follow hai chiều khi Chặn**. `created_at` đã nằm trong view `public_profiles` (0027:35). Grep `follows|public_profiles|MemberStore` trong `NODIE/`: **0 kết quả** ⇒ toàn bộ phần Swift dưới đây vẫn phải làm, nhưng **schema thì đừng đụng**.

## Context

- `MemberProfileView.swift` (206 dòng) **mock 100%**: `state.member(id:)` → `AppState.swift:130` → `MockData.members[id]` (`MockData.swift:83`). Id kiểu `"huong"`, **không phải UUID**.
- `Member` (`Models/Person.swift:18`) có 11 trường. **DB chỉ có `display_name` + `bio` + `created_at`** (view `public_profiles`, 0027:35).
- Follow mock: `AppState.swift:92-93` `follows: Set<String>`, `:131 isFollowing`, `:136 toggleFollow`, `:133 followingList`, `:134 suggestList`.
- `MemberProfileView.swift:18` `if let member {` **không có nhánh else** → không tìm thấy = **màn trắng trơn**.
- ⚠️ **`AppState.swift` CẤM SỬA** ⇒ logic follow phải ra store mới.
- ✅ **Pattern có sẵn để copy: `ProfileStatsGrid.swift:1-137`** — `ProfileStatsStore` là `@MainActor @Observable`, dùng `SupabaseClientProvider.shared`, có sẵn `fetchCount(from:uid:)`, `fetchLitReceived(_:)`, `fetchDaysJoined(_:)`, và **comment đầu file đã ghi rõ metric-trên-người được phép từ 16/07 (handoff v4)**. Đây là tiền lệ, không phải phát minh mới.
- **Luật project:** thống kê trên hồ sơ ĐƯỢC; **xếp hạng giữa người với người thì KHÔNG**.

## §"7 trường" — 7 trường không có trong DB xử thế nào

| Trường | Phương án đề xuất | Trade-off |
|---|---|---|
| `join` | **Suy từ `created_at`** → "Tham gia 02.2025" | ✅ Cột **đã có sẵn** trong view 0027 — không cần làm gì thêm. Rẻ, thật. |
| `stats` | **Suy từ dữ liệu thật** — dùng lại đúng 4 truy vấn của `ProfileStatsStore` + ô "người theo dõi" từ `follows` | Đúng luật (metric trên hồ sơ OK). Tốn ~5 request/hồ sơ → chạy song song `async let` như `ProfileStatsStore.load()`. |
| `fields` | **Suy từ `distinct questions.topic`** của người đó (top 3–5 theo số lần) | Thật, không cần cột mới. NHƯNG nghĩa đổi: "Lĩnh vực **đang theo**" → phải đổi nhãn thành **"Lĩnh vực hay hỏi"**. Nói sai còn tệ hơn không nói. |
| `posts` | **Query `questions` của người đó** (`author_id = uid`, `deleted_at is null`, `order created_at desc limit 5`) → title + "☀ n · 2 giờ trước" | Chỉ câu hỏi, **không gộp câu trả lời**: `answers` không có tiêu đề, gộp vào phải kéo thêm tiêu đề câu hỏi cha (như `MyAnswerRow`) → đổi nhãn thành **"Câu hỏi gần đây"**. KISS. Gộp cả hai là việc vòng sau. |
| `emoji` + `gradient` | **Xoá → dùng `InitialAvatar`** (đã có sẵn, dùng khắp `AnswerCardView:72`, ProfileView) | Hồ sơ mất màu mè so với prototype. Nhưng: emoji/gradient **không có trong DB và không có nguồn nào sinh ra được**; thêm 2 cột cho trang trí là YAGNI. Phần còn lại của app (mọi surface chạy dữ liệu thật) đã dùng InitialAvatar → đây là chỗ *nhất quán*, không phải chỗ *xuống cấp*. **Phương án B nếu Đăng tiếc màu:** sinh gradient tất định từ hash UUID (không cột mới, mỗi người một màu ổn định). |
| `verified` (✦) | **Xoá** | Không có cột, và nguồn duy nhất khả dĩ là `profiles.role` — mà **0027 cấm phơi `role`** (lộ ai-là-admin). Muốn có huy hiệu thì phải có cột `verified` riêng + quy trình xét duyệt = sản phẩm mới, không phải sửa lỗi. |
| `level` ("… · cấp 9") | **Xoá** | Không có cột. Và "cấp 9" là **xếp hạng giữa người với người** → phạm luật project. Chỗ đó **thay bằng `bio`** (có thật trong DB, và đang bị header đẩy xuống dưới). |

⇒ **Cần Đăng gật cả bảng này trước khi code.**

## Requirements

1. Hồ sơ người khác hiện **tên thật** (không "Ẩn danh"), bio thật, số liệu thật.
2. Follow ghi DB thật, sống qua lần mở app.
3. Id không tồn tại / mạng hỏng → **màn "không tìm thấy"**, không trắng trơn.
4. `ModerationMenu` gắn được (cần `authorId: UUID?` thật) → báo cáo/chặn chạy trên hồ sơ.
5. Tab Bạn bè đổi sang UUID thật **cùng lúc** (xem "Dây chuyền").

## Dây chuyền — vì sao tab Bạn bè phải đổi cùng lúc

`FriendsView.swift:47` → `state.friendsPath.append(FriendsRoute.member(person.id))` với `person.id = "huong"`. Nếu `MemberProfileView` nhận UUID mà Bạn bè vẫn bơm `"huong"` → **mọi hồ sơ mở ra đều rỗng**. ⇒ `FriendsView` phải chuyển sang `MemberStore` **trong cùng phase này**. Không tách được.

- `FriendsView.swift` **không bị cấm** → sửa được.
- `AppState.followingList/suggestList/follows/isFollowing/toggleFollow` thành **code chết** — **để nguyên, KHÔNG xoá** (cấm sửa `AppState`). Ghi nợ dọn sau.
- ⚠️ **`ChatRoute.member(id)` (`RootTabView:52`) vẫn bơm id mock** — nguồn là `AppState.member(inChat:)` → `MockData.people`, mà `ChatDetailView` là của session kia. ⇒ **chat → hồ sơ sẽ rơi vào màn "không tìm thấy"** sau phase này. Xem plan.md câu hỏi #4.
- ⚠️ Nút **"Nhắn tin"** gọi `state.openOrCreateDM(with:)` — ở `AppState` (cấm), chạy `MockData`, và `ConversationStore` **chưa có khái niệm DM** (chỉ channels + join/leave, đã đo). Với UUID → **guard `person(id:)` trả nil → nút im lặng không làm gì**. ⇒ **Ẩn nút** ở phase này. Xem plan.md câu hỏi #2.

## Files

**Create:**
- `NODIE/Features/Friends/MemberStore.swift` (~130 dòng) — fetch hồ sơ + follow + đếm
- `NODIE/Features/Friends/MemberProfileSections.swift` (~90 dòng) — stats/fields/activity

**Modify:**
- `NODIE/Features/Friends/MemberProfileView.swift` (206 dòng → phải **giảm** dưới 200: cắt bớt 3 section sang file mới, bỏ emoji/gradient/verified/level)
- `NODIE/Features/Friends/FriendsView.swift`
- `NODIE/Shell/RootTabView.swift` ⚠️ **plan 260717-1306 phase-03 sở hữu file này**
- `NODIE/Localizable.xcstrings`

**KHÔNG đụng:** `AppState.swift` · `Models/Person.swift` (`Member`/`Person` còn `MockData` dùng) · `MockData.swift` · `ConversationStore.swift` · `ChatDetailView.swift`.

## Implementation

1. **`MemberStore.swift`** — copy hình dáng `ProfileStatsStore` (`@MainActor @Observable`, `SupabaseClientProvider.shared`):
   ```
   struct MemberProfileRow: Codable, Identifiable { id, display_name, bio, created_at }
   ```
   Đọc từ **`public_profiles`** (KHÔNG phải `profiles` — RLS self-only sẽ trả rỗng).
   - `func load(id: UUID) async` — `async let` song song: hồ sơ · đếm câu hỏi · đếm trả lời · ☀ nhận được · người theo dõi · `isFollowing` · topics · câu hỏi gần đây.
   - `private(set) var notFound = false` — **cờ RIÊNG**, không suy từ `row == nil` (cùng bài với `isResolving` ở `QuestionDetailView:11-13`: "chưa biết" ≠ "biết là không có").
   - `func toggleFollow(id: UUID) async -> Bool` — insert/delete `follows`, **optimistic** rồi hoàn nguyên nếu fail (nút follow phải nhạy).
     ⚠️ **Insert có thể bị RLS TỪ CHỐI hợp lệ**, không phải lỗi mạng: `follows_insert` của 0028 chặn follow người mình đã chặn / người đã chặn mình. ⇒ hoàn nguyên nút, **không** quăng alert lỗi kỹ thuật vào mặt người dùng.
     ⚠️ **Chặn ai đó → trigger `trg_block_removes_follows` XOÁ follow ở DB**, cả hai chiều. UI giữ `isFollowing = true` trong RAM sẽ **nói dối**. ⇒ sau khi `qa.block(userId:)` thành công, phải `await load(id:)` lại (hoặc set `isFollowing = false` tại chỗ). Đây là hệ quả trực tiếp của 0028 — **không phải chi tiết bỏ qua được**.
   - `func loadPeople() async` cho FriendsView: `public_profiles` trừ chính mình + `follows` của mình → tách "Đang theo dõi" / "Gợi ý".
   - Lọc `.is("deleted_at", value: nil)` ở mọi đếm — **lý do đã ghi ở `ProfileStatsGrid.swift:80-83`**: admin đọc được cả hàng xoá mềm, không lọc thì số của admin phồng lên.
2. **`MemberProfileSections.swift`** — `statsGrid` (dùng `NodieStatGrid` như `ProfileStatsGrid`, `.redacted` khi chưa nạp xong), `fields`, `activity`. Chuyển nguyên từ `MemberProfileView:126-180`, đổi nguồn dữ liệu.
3. **`MemberProfileView.swift`** — `let memberId: UUID` (không phải String):
   - Bỏ `@Bindable var state: AppState` → nhận `MemberStore`. **Đây là cách gỡ khỏi AppState mà không sửa AppState.**
   - `header`: `InitialAvatar` thay emoji/gradient; bỏ ✦ và `level`; `bio` lên chỗ cũ của level; `join` từ `created_at`.
   - Nút "Nhắn tin": **ẩn** (comment VÌ SAO: *`openOrCreateDM` còn chạy `MockData` với id kiểu "huong"; bơm UUID vào là nút chết im lặng. Ship nút không làm gì tệ hơn là không có nút. Mở lại khi Chat sang dữ liệu thật.*)
   - **Nhánh else** cho `notFound` — copy `QuestionDetailView.unavailableState:110-127` (`eye.slash` + 2 dòng chữ). Nhất quán với màn "không mở được câu hỏi".
   - Ba trạng thái: đang nạp (`ProgressView`) · có hồ sơ · không tìm thấy.
   - `ModerationMenu(target: .init(kind: .question ...))` ⚠️ — `ModerationTarget.kind` hiện chỉ có question/answer/reply. **Hồ sơ không phải nội dung.** ⇒ **Không gắn ModerationMenu vào hồ sơ ở phase này**; nút Chặn dùng thẳng `qa.block(userId:)` với UUID thật + `confirmationDialog` riêng. Thêm `kind: .profile` là đụng `QAStoreModeration` + `reports.target_type` check ở DB → **ghi nợ**, không gộp vào đây.
4. **`FriendsView.swift`** — `@Bindable var members: MemberStore` thay `state` cho phần danh sách; `PersonRowView` nhận `MemberProfileRow`; `friendsPath.append(FriendsRoute.member(row.id.uuidString))`.
   ⚠️ `FriendsRoute.member(String)` ở `AppState.swift:16-19` **giữ nguyên String** (cấm sửa AppState) → `RootTabView` parse `UUID(uuidString:)`, nil → cho `MemberProfileView` hiện "không tìm thấy". **Chính nhánh này cũng đỡ luôn ca chat→hồ sơ bơm id mock.**
   - Ô tìm kiếm (:88-100) hiện là trang trí. 0027 đã tạo sẵn index trgm cho `display_name`. **Không làm ở phase này** — ghi nợ, YAGNI cho tới khi có đủ người.
5. **`RootTabView.swift`** — `@State private var members = MemberStore()`; truyền xuống 2 call site (:52, :67).
6. Key mới × 9 ngôn ngữ: `"Không tìm thấy người này."`, `"Có thể tài khoản đã bị xoá."`, `"Lĩnh vực hay hỏi"`, `"Câu hỏi gần đây"`, `"người theo dõi"`, `"Tham gia \(month).\(year)"`.

## Todo

- [ ] **Đăng gật bảng §"7 trường" + ẩn nút Nhắn tin**
- [ ] **Đăng apply 0027 + 0028** (không có → dừng, mọi tên = "Ẩn danh")
- [ ] `MemberStore.swift` (đọc `public_profiles`, KHÔNG `profiles`)
- [ ] `toggleFollow` xử RLS-từ-chối ≠ lỗi mạng
- [ ] Chặn xong → nạp lại (trigger 0028 đã xoá follow dưới chân UI)
- [ ] `MemberProfileSections.swift`
- [ ] `MemberProfileView` → UUID + InitialAvatar + nhánh notFound + ẩn Nhắn tin, **< 200 dòng**
- [ ] `FriendsView` → MemberStore
- [ ] `RootTabView` → truyền MemberStore, parse UUID
- [ ] `xcodegen generate`
- [ ] 6 key × 9 ngôn ngữ
- [ ] Build xanh; UITests xanh
- [ ] Ghi nợ: chat→hồ sơ · nút Nhắn tin · tìm kiếm người · `kind: .profile` · dọn code chết ở AppState

## Success criteria

1. **Test bằng 2 tài khoản thật** (1 tài khoản không đủ — tài khoản test là `admin`, nhánh `or is_admin()` che mất bug): A mở hồ sơ B → **tên B**, không phải "Ẩn danh".
2. Số liệu khớp thực tế (đếm tay bằng psql).
3. A follow B → giết app → mở lại → vẫn "✓ Đang theo dõi". B thấy +1 người theo dõi.
4. Mở `FriendsRoute.member("huong")` (id rác) → màn "không tìm thấy", **không trắng, không quay vòng vĩnh viễn**.
5. Chặn từ hồ sơ chạy với UUID thật. **Chặn xong → nút follow tự về "＋ Theo dõi"** (khớp trigger 0028 đã xoá hàng), không kẹt ở "✓ Đang theo dõi".
6. A chặn B → A thử follow B → nút không dính, **không** hiện alert lỗi kỹ thuật.
7. Hồ sơ **không** có: ✦, "cấp 9", leaderboard, so sánh với người khác.

## Risks / Rollback

| Rủi ro | Mitigation |
|---|---|
| **Đổi Swift trước khi 0027 apply** → PGRST200 (đã dính ở 0020) | Thứ tự cứng: Đăng apply → xác minh bằng psql → mới sửa Swift. Ghi ở Todo. |
| `RootTabView` đụng plan 260717-1306 phase-03 | Ai xong trước commit trước; báo rebase. Sửa của ta ở đây nhỏ (thêm 1 `@State` + 2 tham số). |
| `MemberProfileView` vẫn > 200 dòng sau khi thêm | Bỏ 4 trường (emoji/gradient/verified/level) + cắt 3 section ra file mới → giảm ròng. Đo lại trước khi commit. |
| Chat → hồ sơ gãy (id mock) | Nhánh "không tìm thấy" đỡ. **Là hồi quy UX có ý thức** — plan.md câu hỏi #4. |
| 5 request/hồ sơ chậm | `async let` song song (như `ProfileStatsStore.load()`), `.redacted` trong lúc chờ. |
| Đếm ☀ cộng ở client | Cùng đánh đổi đã chấp nhận ở `ProfileStatsGrid:95-97` — nội dung của MỘT người thì số hàng có hạn. Đổi sang RPC khi có người viết vài nghìn câu. |

**Rollback:** revert commit Swift → về mock ngay (`MockData` còn nguyên, không xoá gì). Migration để lại vô hại (bảng thừa không ai đọc).
