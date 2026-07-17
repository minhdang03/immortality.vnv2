# Phase 02 — Sửa / xoá nội dung của mình (#15)

**Ưu tiên:** P1. **Status:** chưa bắt đầu. **Chốt:** soft delete + cho sửa.

## Context

- [plan.md](plan.md) — "Sự thật đã đo" (3)(4)(5).
- Backend **đã sẵn sàng trên prod, không cần migration cho phần hiển thị** (đo bằng psql).

## Backend — đã đo trên prod, đừng đo lại

```
questions_read      SELECT  (auth.uid() is not null) AND ((deleted_at IS NULL) OR is_admin())
answers_read        SELECT  ... nt
answer_replies_read SELECT  ... nt
questions_update_own / answers_update_own / answer_replies_update_own  UPDATE  author_id = auth.uid()
questions_delete_own / answers_delete_own / answer_replies_delete_own  DELETE  author_id = auth.uid() OR is_admin()
```

Cột `edited_at` + `deleted_at` có sẵn trên cả 3 bảng (0017 + 0018).

⇒ **Xoá mềm** = `update ... set deleted_at = now()`. **Sửa** = `update ... set body/title, edited_at = now()`.

### Hai điều đề bài nói sai / bỏ sót

1. **Đề bài lo "SELECT không lọc `deleted_at`, phải lọc client hoặc làm migration" — SAI.** RLS lọc sẵn từ 0019. Không cần migration, không cần lọc để *đúng*.
2. **Nhưng tài khoản test/Đăng có `role='admin'`** (đo: `profiles.role` của `NODIE_TEST_EMAIL` = `admin`) → `is_admin()` true → **họ VẪN thấy bài đã xoá mềm**. App không có màn kiểm duyệt nào để hiện chỗ đó ⇒ với admin nó chỉ là bài ma.
   ⇒ **Vẫn thêm `.is("deleted_at", value: nil)`** vào select của QAStore — lý do là *cho admin thấy giống người thường + cho test tất định*, KHÔNG phải vì RLS thiếu. Không cần thêm cột vào model (`.is()` là bộ lọc, không phải cột select).
3. **`answer_count` sẽ lệch.** Đo trên prod: trigger `trg_answers_count` chỉ chạy `INSERT DELETE`. Xoá mềm là UPDATE ⇒ không trừ ⇒ danh sách ghi "3 câu trả lời" mà mở ra thấy 2. → migration **0027**.

## File

| File | Trạng thái | Việc |
|---|---|---|
| `NODIE/Features/QA/QAStoreOwnContent.swift` | **TẠO** | update/soft-delete cho 3 loại |
| `NODIE/Features/QA/QAStore.swift` | SẠCH (**391 dòng — chỉ thêm bộ lọc, không thêm hàm**) | `.is("deleted_at", value: nil)` × 4 select |
| `NODIE/Features/Moderation/ModerationMenu.swift` | SẠCH | nội dung của mình → Sửa/Xoá thay vì ẩn tiệt |
| `NODIE/Features/QA/AnswerCardView.swift` | SẠCH | sheet sửa + nhãn "đã sửa" |
| `NODIE/Features/QA/AnswerReplyRow.swift` | SẠCH | nt |
| `NODIE/Features/QA/QuestionDetailView.swift` | SẠCH (đã vào `ac3a9db`) | ⋯ cho chính câu hỏi |
| `NODIE/Features/QA/QAModels.swift` | SẠCH | +`editedAt` vào 3 row + `NewEdit` payload |
| `NODIE/Features/Profile/MyContentViews.swift` | SẠCH | vuốt để xoá ở "Câu hỏi/Trả lời của tôi" |
| `supabase/migrations/0027_nodie_answer_count_soft_delete.sql` | **TẠO** | trigger đếm khi xoá mềm |
| `NODIE/Localizable.xcstrings` | SẠCH | key mới × 8 |

`QAStore.swift` đã 391 dòng (giới hạn 200) → **không nhét hàm mới vào đó**; theo đúng pattern `QAStoreSaves.swift` / `QAStoreModeration.swift`.

## Các bước

### 1. `QAModels.swift`

- `editedAt: Date?` (`case editedAt = "edited_at"`) vào `QuestionRow`, `AnswerRow`, `ReplyRow` + `var isEdited: Bool { editedAt != nil }`.
- Thêm `edited_at` vào 3 chuỗi select hằng trong `QAStore.swift` (`questionSelect`/`answerSelect`/`replySelect`).
  ⚠️ `QAStoreSaves.swift` dựng cùng shape `QuestionRow` — đã có chú thích ở `QAStore.swift:44`. Sửa select mà quên chỗ kia là **decode nổ**.
- ⚠️ Ba `init` của `AnswerRow`/`ReplyRow` trong extension `withVote`/`withLit`/`settingBest` (QAStore.swift:301–321) là memberwise → **thêm field là phải sửa hết**, nếu không sẽ lỗi biên dịch (tốt: trình biên dịch bắt hộ).
- Payload:
  ```swift
  struct EditBody: Encodable { let body: String; let editedAt: Date }   // edited_at
  struct EditQuestion: Encodable { let title: String; let body: String?; let editedAt: Date }
  struct SoftDelete: Encodable { let deletedAt: Date }                  // deleted_at
  ```

### 2. `QAStoreOwnContent.swift` (mới)

```swift
/// Sửa/xoá nội dung của CHÍNH MÌNH. Tách khỏi QAStore.swift (đã 391 dòng) theo đúng
/// pattern QAStoreSaves/QAStoreModeration.
///
/// Xoá là xoá MỀM (`deleted_at`), không DELETE thật: `answer_replies.answer_id` có
/// `on delete cascade` (0018:15) — xoá cứng một câu trả lời là cuốn theo reply của
/// người khác trong đó. Xoá bài mình không được phép xoá lời người ta.
extension QAStore {
    func isMine(_ authorId: UUID?) -> Bool { authorId != nil && authorId == currentUserId }
    func updateAnswer(_ id: UUID, in questionId: UUID, body: String) async
    func softDeleteAnswer(_ id: UUID, in questionId: UUID) async
    func updateReply(_ id: UUID, in answerId: UUID, body: String) async
    func softDeleteReply(_ id: UUID, in answerId: UUID) async
    func updateQuestion(_ id: UUID, title: String, body: String?) async
    func softDeleteQuestion(_ id: UUID) async
}
```

Mỗi hàm: guard `!body.trimmed.isEmpty` → `.update(...).eq("id", value: id).select(...).single()` → thay hàng trong cache cục bộ → lỗi thì `errorMessage = ErrorText.localized(error)` (RLS chặn → "Bạn không có quyền…" có sẵn).

Xoá xong phải **gỡ khỏi cache cục bộ** (`answersByQuestion`, `repliesByAnswer`, `questions`, `questionsById`, `savedQuestionIds`): với admin, refetch vẫn trả hàng về (RLS cho admin thấy) — bộ lọc `.is("deleted_at", value: nil)` ở bước 3 mới là thứ giữ nó biến mất luôn.

`softDeleteAnswer` gọi thêm `bumpAnswerCount(questionId, by: -1)` → **đang là `private`** (QAStore.swift:283) → nới thành `internal` (cùng module, khác file). Không mở `public`.

### 3. `QAStore.swift` — chỉ thêm bộ lọc

Thêm `.is("deleted_at", value: nil)` vào: `loadQuestions`, `loadQuestion`, `loadThread` (2 query: answers + replies). Và trong `QAStoreSaves.swift` nếu nó tự select `questions`.
Comment: *vì sao* = admin (`is_admin()` trong policy) vẫn thấy hàng đã xoá; app không có màn kiểm duyệt nên với họ đó chỉ là bài ma, và test chạy bằng tài khoản admin sẽ rung rinh.

### 4. `ModerationMenu.swift`

Hiện nó `if !isOwnContent` → **ẩn sạch ⋯ trên bài của mình** (:21). Đổi thành: bài mình → menu **Sửa / Xoá**; bài người khác → **Báo cáo / Chặn** (giữ nguyên).

```swift
var onEdit: (() -> Void)?          // nil = không cho sửa (vd: câu hỏi ở màn danh sách)
var onDelete: (() -> Void)?
```

Xoá → `confirmationDialog("Xoá câu trả lời?")` + nút đỏ "Xoá" + "Huỷ". Không xoá thẳng một chạm.
Giữ `accessibilityLabel` — đổi theo ngữ cảnh ("Báo cáo hoặc chặn" vs "Sửa hoặc xoá") để UITests phân biệt.

### 5. View

- `AnswerCardView` (đã có `qa` + `answer.authorId` + `qa.currentUserId` ⇒ **không cần đổi chữ ký, không kéo theo QuestionDetailView**): truyền `onEdit`/`onDelete` vào `ModerationMenu`; `@State editDraft`/`showEdit`; sheet sửa dùng lại `InlineReplyField` hoặc `TextField(axis:.vertical)`; nhãn `if answer.isEdited { Text("đã sửa") }` cạnh `relativeTime`.
- `AnswerReplyRow` — y hệt, `size: 13`.
- `QuestionDetailView` — ⋯ cho chính câu hỏi; xoá xong `dismiss()` (đứng lại màn của bài vừa xoá là màn ma).
- `MyContentViews` — `.swipeActions` xoá ở "Câu hỏi của tôi" / "Trả lời của tôi" (vuốt là chuẩn iOS cho danh sách; menu ⋯ là chuẩn cho card).

### 6. Migration `0027_nodie_answer_count_soft_delete.sql`

```sql
-- answer_count là cột denormalized, trigger cũ (0017) chỉ chạy INSERT/DELETE. Từ khi có
-- xoá mềm, "xoá" là UPDATE deleted_at ⇒ không nhánh nào chạy ⇒ danh sách ghi "3 câu trả
-- lời" mà mở ra chỉ có 2 (RLS đã giấu bài xoá). Đếm phải theo cái người ta THẤY.
create or replace function public.tg_answers_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.deleted_at is null then
      update public.questions set answer_count = answer_count + 1 where id = new.question_id;
    end if;
  elsif tg_op = 'DELETE' then
    if old.deleted_at is null then
      update public.questions set answer_count = greatest(answer_count - 1, 0) where id = old.question_id;
    end if;
  elsif tg_op = 'UPDATE' then
    -- chỉ nhịp CHUYỂN TRẠNG THÁI mới đếm; sửa body không đụng gì
    if old.deleted_at is null and new.deleted_at is not null then
      update public.questions set answer_count = greatest(answer_count - 1, 0) where id = new.question_id;
    elsif old.deleted_at is not null and new.deleted_at is null then
      update public.questions set answer_count = answer_count + 1 where id = new.question_id;
    end if;
  end if;
  return null;
end; $$;

drop trigger if exists trg_answers_count on public.answers;
create trigger trg_answers_count after insert or delete or update of deleted_at on public.answers
  for each row execute function public.tg_answers_count();
```

Em chỉ **viết file**; **Đăng tự apply** lên prod như 0017–0026.
Chưa apply → app vẫn chạy, chỉ đếm lệch sau khi xoá trả lời (không crash, không mất dữ liệu).

### 7. i18n

`Sửa` · `Xoá` · `Xoá câu hỏi?` · `Xoá câu trả lời?` · `Xoá phản hồi?` · `Không hiện với người khác nữa. Bạn vẫn xem lại được ở Cá nhân.` · `Lưu thay đổi` · `đã sửa` · `Sửa hoặc xoá` — đủ 8 ngôn ngữ.

## Test

- UITest `QAWireUITests` (`launchVietnamese()`, `--uitest-auto-login`): đặt câu hỏi mới → ⋯ → thấy **Sửa/Xoá** (không phải Báo cáo/Chặn) → Sửa → đổi chữ → thấy chữ mới + "đã sửa" → ⋯ → Xoá → xác nhận → bài biến mất.
  ⚠️ Test này **chỉ xanh khi đã có bộ lọc `.is("deleted_at")`** — tài khoản test là admin, RLS trả bài đã xoá về.
- Trên bài người khác: vẫn phải ra Báo cáo/Chặn, **không** có Sửa/Xoá.
- Sau migration 0027: xoá 1 trả lời → quay ra danh sách → số câu trả lời giảm 1.
- Build: `xcodegen generate && xcodebuild ... -destination '...,name=iPhone 17' build`.

## Rủi ro + rollback

| Rủi ro | Mức | Xử |
|---|---|---|
| Đổi select mà quên `QAStoreSaves.swift` → decode nổ lúc chạy | TRUNG | Chú thích sẵn ở QAStore.swift:44; grep `questionSelect` trước khi xong |
| Đăng chưa apply 0027 → đếm lệch | TRUNG | Không chặn ship; ghi vào plan.md; nhắc Đăng |
| Xoá câu hỏi đang có trả lời của người khác → ẩn luôn công sức họ | **CAO — chưa chốt** | Câu hỏi #2 ở plan.md, cần Đăng gật trước khi làm bước 5 phần QuestionDetailView |
| `MyAnswerRow.question` join tới câu hỏi đã xoá mềm → `isOrphaned` bật, hiện "Câu hỏi đã bị xoá" | THẤP | Đúng ý đồ sẵn có (QAModels.swift:116) — không sửa |

**Rollback:** gỡ `QAStoreOwnContent.swift` + trả `ModerationMenu` về `if !isOwnContent`. Migration 0027 thuận nghịch (chạy lại bản 0017 là về cũ). Hàng đã `deleted_at` không tự sống lại — nhưng chưa mất dữ liệu, `update ... set deleted_at = null` là khôi phục.

## Xong khi

1. Bài của mình (câu hỏi/trả lời/reply) sửa được, xoá được; bài người khác thì không.
2. Xoá xong biến mất ở mọi màn, **kể cả tài khoản admin**.
3. Sửa xong hiện "đã sửa" + `edited_at` có trong DB.
4. 0027 apply xong → `answer_count` khớp số bài thật thấy.
5. Build xanh, UITests hiện-xanh vẫn xanh, key mới đủ 8 ngôn ngữ.
