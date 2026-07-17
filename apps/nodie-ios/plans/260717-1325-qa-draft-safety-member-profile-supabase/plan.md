---
title: "QA draft safety (#21,#22,#23,#27,#28,#29,#30,#31) + Hồ sơ thành viên thật (#25)"
description: "Vá 8 lỗi UX Hỏi đáp client-only, rồi nối MemberProfileView vào Supabase thật + bảng follows."
status: completed
priority: P2
effort: ~7h
branch: claude/immortality-mobile-hybrid
tags: [nodie, ios, swiftui, supabase, ux, qa, profile]
created: 2026-07-17
---

# Plan: 9 lỗi UX — draft safety Hỏi đáp + Hồ sơ thành viên thật

**Status: XONG HẲN (đóng 17/07 21:0x).** Nhóm A (01–04) xong 14:30 — build+test xanh. Nhóm B (05–06) cũng xong, **không phải do plan này làm**:

- **05 xong** — `0027` + `0028` ĐÃ apply prod. Đo bằng psql thật lúc đóng plan (không tin số thứ tự file):
  `to_regclass('public.public_profiles')`, `public.follows`, `public.message_reactions` đều trả non-null.
- **06 xong** — `MemberProfileView` đã chạy `public_profiles` thật + `FollowStore`/`ProfileStatsStore`
  (session khác giao qua plan `260717-1338` và `260717-1404` phase 04, đúng như phase 06 dặn: *dùng store họ viết, KHÔNG tự viết MemberStore*).

**Chốt phạm vi (Đăng):** #21·#22·#23·#25·#27·#28·#29·#30·#31.

## ĐỀ BÀI ĐÃ LỆCH THỰC TẾ — đọc trước khi code (đo 13:38 → 13:45)

1. **File cấm của đề bài GIỜ ĐÃ SẠCH** (`AppState · QAModels · QuestionListView · Conversations/* · Models/Conversation`) — session kia commit hết (`ac3a9db`/`402e9d0`). ⇒ **vẫn giữ lệnh cấm** (họ quay lại bất cứ lúc nào). Chỗ nóng giờ là **`Localizable.xcstrings`**.
2. **KHÔNG CÒN MIGRATION NÀO ĐỂ VIẾT** — `0028_nodie_follows.sql` họ đã commit (`5201a8b`) và **bản của họ tốt hơn** (chặn↔follow hai chiều + trigger cắt follow cũ — thứ plan này định ghi nợ); `created_at` đã có sẵn trong view (0027:35). ⇒ "0028 hay 0029" **MOOT**; phase 05 teo thành "Đăng apply prod". Chi tiết: [phase-05](phase-05-apply-migrations-prod.md).
3. **Số migration trôi 3 lần/1 giờ** ⇒ **không tin số, đối chiếu nội dung.**
4. ⚠️ **"Phần Swift của #25 vẫn trống" ĐÃ LỖI THỜI** (grep lúc 13:45). Sau đó session kia commit `FollowStore.swift` + `ProfileStatsStore(uid:)` → **phase 06 phải viết lại**, xem cuối file.

## Phases

**Luật thay bản đồ:** `git status --short` + `ls supabase/migrations/` **ngay trước** mỗi phase — cột "Rủi ro" là ảnh chụp 13:45, không phải lời hứa.

| # | Nội dung | File sở hữu | Rủi ro đụng (13:38) | Status |
|---|---|---|---|---|
| 01 | [#21+#22 draft không mất khi gửi fail](phase-01-draft-safety.md) | QAStore · QuestionDetailView · AnswerCardView · InlineReplyField | **TRUNG** — 4 file này plan 260717-1306 phase-02 cũng nhận, nhưng họ CHƯA code | ✅ **xong** — build+test xanh (verify cô lập) |
| 02 | [#23+#27 Huỷ hỏi lại + nói lý do disabled](phase-02-ask-question-guards.md) | AskQuestionView | THẤP — không ai đụng | ✅ **xong** — build+test xanh (verify cô lập) |
| 03 | [#28+#29 refreshable + dòng mồ côi](phase-03-my-content-refresh-orphan.md) | MyContentViews | **TRUNG** — 260717-1306 phase-02 cũng nhận | ✅ **xong** — build+test xanh (verify cô lập) |
| 04 | [#30+#31 giờ tự trôi + copy thân câu hỏi](phase-04-live-time-and-copy.md) | +NodieRelativeTimeText.swift · QuestionDetailView · AnswerCardView · AnswerReplyRow · MyContentViews | **TRUNG** — chồng file với 01+03 ⇒ chạy SAU cả hai | ✅ **xong** — build+test xanh (verify cô lập) |
| 05 | [Đăng apply 0027 + 0028 lên prod (KHÔNG viết SQL)](phase-05-apply-migrations-prod.md) | — (không file nào) | — **việc của Đăng, không phải code** | ✅ **xong** — verify prod bằng psql, cả 2 migration đã có mặt |
| 06 | [#25 Hồ sơ thành viên thật + follows](phase-06-member-profile-real.md) | MemberProfileView · FriendsView · RootTabView (**dùng `FollowStore`+`ProfileStatsStore` session kia đã viết — KHÔNG tự viết MemberStore**) | **CAO** — `RootTabView` là của 260717-1306 phase-03; **chặn bởi 0027+0028 apply prod** | ✅ **xong** — giao bởi plan `260717-1338` + `260717-1404` phase 04, không phải plan này |

## Nhóm A XONG (17/07 14:30) — kết quả đo được

- **Test 35/35 xanh** (`tester`, 14:16). Sau vòng review có vá thêm → build lại xanh trên bản sao cô lập.
- **`code-reviewer` bắt 1 lỗi thật DO CHÍNH PHASE 03 ĐẺ RA — đã vá.** `.refreshable` vừa thêm làm lộ ra `myQuestions()/savedQuestions()/myAnswers()` trả `[]` khi LỖI ⇒ kéo tay lúc rớt mạng = danh sách bị thay bằng *"Bạn chưa chiếu câu hỏi nào."* — app nói dối ngay cạnh alert lỗi, **đúng loại bệnh #21 đang chữa**. Vá: 3 hàm `[T]` → `[T]?` (`nil` = hỏng, `[]` = rỗng thật), `reload()` giữ danh sách cũ khi `nil`. ⇒ **`QAStoreSaves.swift` phát sinh ngoài 8 file dự kiến** — đã kiểm không ai giữ (260717-1306 tạo `QAStoreOwnContent.swift` riêng).
- **Tác dụng phụ do BUILD của phase này gây ra — đã vá.** `xcodebuild` chạy string extraction → đánh **15 key `stale`** (HEAD: 0). 13 trong đó là chuỗi ĐANG SỐNG bị oan: `EyebrowLabel` nhận `String` rồi mới `LocalizedStringKey(text)`, `NodieTabBar` dùng enum rawValue → extraction tĩnh không thấy. `stale` = lời mời Xcode xoá 13 chuỗi × 8 ngôn ngữ (`Bảng tin`, `Kênh`, `Nhóm`, `Theo dõi`, `Cài đặt`…). Vá: `extractionState: "manual"` — đúng pattern file này (44 key đã manual → nay 57). `'Sắp có'` + `'▶ Tin nhắn thoại'` chết thật (0 ref) → để `stale`.
- **Vá thêm theo review:** màn rỗng canh giữa bằng `containerRelativeFrame(.vertical)` (chiều cao cứng 320 làm chữ dính đỉnh ~190pt); a11y hint bám `titleTooShort` thay `!canAsk` (đang gửi thì mắng oan tiêu đề đã đủ dài); `guard !replySending` chống tái nhập; chặn đường mở ô reply khi đang gửi (không `.disabled` cả dòng — thế là khoá oan nút ☀).
- **Nợ:** `QuestionListView:162` vẫn đứng im (session kia giữ file). Key `'Bỏ'` một từ → nên thêm `comment` cho người dịch. `MyContentViews` vượt 200 dòng (205).

## ⚠️ Build CÂY THẬT đang đỏ — KHÔNG phải lỗi plan này

`ChatDetailView.swift:148` — `missing argument 'channel'` / `extra argument 'conversation'`. Session kia sửa `Models/Conversation.swift` (dirty) mà chưa cập nhật call site; bản thân `ChatDetailView.swift` sạch ở HEAD. Không file nào của plan này dính.

**Đã verify:** dựng bản sao ở `scratchpad/verify`, giữ 10 file của plan này + trả mọi file khác về HEAD → **BUILD SUCCEEDED**. Không đụng một dòng nào của họ trong cây thật. ⇒ Muốn build xanh trở lại thì phải chờ họ xong refactor Conversations, không phải chờ plan này.

## Dependencies

**Thứ tự bắt buộc: 01 → 02 → 03 → 04 → 05 → 06.** Nhóm A (01–04) client-only, ship ngay hôm nay. Nhóm B (05–06) chờ prod.

- **06 ⇐ 05 ⇐ Đăng apply `0027` + `0028`** — đổi Swift `profiles`→`public_profiles` TRƯỚC khi apply = PGRST200 (đã dính 1 lần ở 0020). **04 ⇐ 01, 03** (chồng file).
- Không phase nào sửa `QAModels.swift` → **#30 giải bằng TimelineView ở tầng VIEW** (✅ `relativeTime` là computed, chỉ cần ép view dựng lại). Không phase nào viết migration.

## Acceptance criteria

1. **#21+#22** Rớt mạng lúc gửi → chữ còn nguyên, báo lỗi, gửi lại được. Ô inline: đang gửi → spinner, bấm đúp ra **1** reply; có nút huỷ.
2. **#23+#27** Huỷ khi đã gõ → hỏi xác nhận (ô trống → đóng thẳng). Tiêu đề <7 ký tự **và đã gõ** → hiện lý do (ô trống → không mắng).
3. **#28+#29** 3 màn "Đóng góp của bạn" kéo-làm-mới được **kể cả lúc rỗng**; dòng mồ côi mờ + ghi chú. **#30+#31** Để màn chi tiết yên ≥60s → "2 phút trước" tự thành "3 phút trước"; giữ thân câu hỏi → "Sao chép".
4. **#25** Hồ sơ người khác: tên thật (không "Ẩn danh"), số liệu thật, follow ghi DB thật sống qua lần mở app; id không tồn tại → màn "không tìm thấy", KHÔNG trắng trơn. **Đo bằng 2 tài khoản** (1 tài khoản = admin = không thấy bug).
5. Build xanh; UITests đang xanh vẫn xanh; key mới đủ **9 ngôn ngữ**.

## Việc CHỈ ĐĂNG LÀM ĐƯỢC — cả 3 đều chặn phase 06

Hai file SQL **đã có sẵn trong repo**, chỉ cần bấm apply. Checklist psql: [phase-05](phase-05-apply-migrations-prod.md).

1. **Apply `0027_nodie_public_profiles_and_message_reactions.sql`** — thiếu nó thì tên người khác = **"Ẩn danh" toàn app** (latent: prod có đúng 1 user và user đó là admin → `or is_admin()` đang che). 2. **Apply `0028_nodie_follows.sql`**. 3. Gật/lắc **3 câu hỏi mở** cuối file.

## File plan này đổi → báo plan 260717-1306 rebase

Tất cả là **cộng thêm**, không đảo logic của họ. Họ CHƯA code phase-02 (file còn sạch 13:45) ⇒ ta làm trước, họ rebase.

| File | Ta đổi gì | Phase của họ |
|---|---|---|
| `QAStore` | `createAnswer`/`createReply` Void → **`Bool`** | 02 |
| `QuestionDetailView` · `AnswerCardView` · `AnswerReplyRow` · `MyContentViews` | giữ draft khi fail; +`replySending`; +`import UIKit`/contextMenu; bọc TimelineView; +`.refreshable`; dòng mồ côi mờ | 02 |
| `InlineReplyField` | +`isSending`, +`onCancel` (**đổi signature**) | — |
| `QAStoreSaves` | `myQuestions`/`savedQuestions`/`myAnswers` `[T]` → **`[T]?`** (nil = hỏng) — **phát sinh sau review**, họ KHÔNG nhận file này | — |
| `RootTabView` | +`MemberStore` | **03 — họ sở hữu file**, ai xong trước commit trước |
| migration | **không viết gì** | 02 tự chọn số trống (**0030+**; 0027/0028/0029 đã bị chiếm) |

## Rủi ro chung

- **`Localizable.xcstrings`** 10.877 dòng, session kia từng viết lại cả file → **edit đúng-chuỗi, cộng thêm**, không ghi đè. Conflict thì commit phase trước, thêm key sau.
- **`Text(cond ? "a" : "b")` không tra String Catalog** → tách `cond ? Text("a") : Text("b")`. Thêm file mới → `xcodegen generate` (chờ `project.yml` sạch). Build: `xcodebuild -project NODIE.xcodeproj -scheme NODIE -destination 'platform=iOS Simulator,name=iPhone 17' build` (máy KHÔNG có iPhone 16).

## Câu hỏi chưa chốt

1. ~~**Số migration 0028 hay 0029?**~~ → **MOOT** (không còn SQL để viết).
2. ~~**Nút "Nhắn tin"**~~ → **Đăng chốt 17/07: LÀM LUÔN DM.** ⚠️ Nặng hơn hẳn 3 câu kia: `ConversationStore` chưa có khái niệm DM (chỉ channel + join/leave), và vùng đó là `AppState`/`ChatDetailView`/`Conversation.swift` — **session kia đang refactor dở ngay lúc này** (build đỏ vì thế). ⇒ **Tách thành plan riêng, KHÔNG nhét vào phase 06.** Phải chờ họ xong Conversations.
3. ~~**7 trường không có trong DB**~~ → **Đăng chốt 17/07:**
   - `verified` + `level` → **XOÁ** (cấp 9 = xếp hạng người-với-người, phạm luật project; verified phải map `role` mà view 0027 cố ý không phơi).
   - `fields` ("Lĩnh vực đang theo") → **XOÁ khỏi hồ sơ** (không có bảng interests; suy từ topic thì đổi nghĩa).
   - `stats` · `join` → **THẬT, dùng `ProfileStatsStore(uid:)` session kia đã viết** (ngày tham gia · số câu hỏi · số trả lời · ☀ nhận được · người theo dõi).
   - `emoji`/`gradient` → `InitialAvatar`.
   - `posts` ("Hoạt động gần đây") → suy từ `questions`/`answers` của chính người đó.
   - `name`/`bio`/follow → `PublicProfile` + `FollowStore` (session kia đã viết).
4. ~~**Chat → hồ sơ gãy tạm**~~ → **Đăng chốt 17/07: chấp nhận gãy tạm, báo họ.** `ChatRoute.member(id)` bơm id mock → sau phase 06 rơi vào màn "không tìm thấy" (có chữ, không trắng trơn). Họ đang wire Chat sang Supabase, id sẽ thành UUID → tự liền.

## ⚠️ phase-06 PHẢI VIẾT LẠI trước khi code

Planner grep lúc 13:45 thấy "phần Swift của #25 vẫn trống" — **đã lỗi thời**. Session kia sau đó commit `FollowStore.swift` (+`PublicProfile`, `toggle`/`isFollowing`/`suggestions`/`search`) và `ProfileStatsStore(uid:)`. Plan `260717-1338-nodie-follows-and-member-stats` của họ ghi thẳng: *"BE cho P0 #2 + #3… Opus không có gì để wire ở FE"* ⇒ **đây là phân công, không phải va chạm**: BE + store của họ, FE `MemberProfileView` của ta.

⇒ Phase 06 **KHÔNG tạo `MemberStore.swift`** (trùng `FollowStore`), **KHÔNG đụng `ProfileStatsGrid.swift`** (của họ). Chỉ còn: `MemberProfileView` đọc `PublicProfile` + `ProfileStatsStore(uid:)` + `FollowStore`; nhánh `else` cho member không tồn tại; `ModerationMenu` gắn UUID thật; `FriendsView`/`RootTabView` đổi `MockData.people` → UUID thật.
