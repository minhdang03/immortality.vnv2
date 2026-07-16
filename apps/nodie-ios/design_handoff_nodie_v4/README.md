# Handoff: NODIE — cập nhật v4 (Bạn bè · Hỏi đáp phân luồng · Chat media/voice · thuật ngữ "chiếu sáng")

## Overview
Đây là bản **delta** giữa prototype `Aion Prototype v3.dc.html` (bản mới nhất trong Claude Design) và codebase SwiftUI hiện tại `nodie-ios/`. Codebase đã port sẵn từ v3 trước đó, cấu trúc gần như 1:1. Tài liệu này **chỉ mô tả những gì đã thay đổi ở vòng lặp mới** — cùng vị trí file Swift cần sửa/tạo — để Claude Code cập nhật trực tiếp.

Nếu cần đọc lại toàn cảnh, prototype đính kèm (`Aion Prototype v3.dc.html`) là nguồn chuẩn (source of truth) về giao diện & hành vi.

## About the Design Files
File `Aion Prototype v3.dc.html` là **design reference dựng bằng HTML** — thể hiện hình thức và hành vi mong muốn, KHÔNG phải code để copy. Nhiệm vụ là **tái hiện các thay đổi này trong app SwiftUI hiện có** (`nodie-ios/`, SwiftUI + Supabase), theo đúng pattern sẵn có: token màu ở `NodieColors`, typography ở `NodieTypography`, spacing ở `NodieSpacing`, mỗi tab một `NavigationStack` với path riêng trong `AppState`, dữ liệu mock ở `MockData`. Không đổi kiến trúc.

⚠️ Codebase dùng **Supabase** (không phải Firebase, không phải React/Vite). Mọi ghi chú "sẽ wire server" giữ nguyên tinh thần đó.

## Fidelity
**High-fidelity.** Màu, cỡ chữ, spacing, copy đều chốt. Tái hiện chính xác bằng token hiện có. Mọi hex/cỡ dưới đây trích trực tiếp từ prototype.

---

## Tổng hợp thay đổi (10 mục)

1. Điều hướng: ẩn tab **Bảng tin** + **Hành trình**, thêm tab **Bạn bè**; app mở vào Hỏi đáp.
2. Thuật ngữ: bỏ hết chữ **"phóng"** → **"chiếu sáng"** / trung tính.
3. Icon mặt trời **☀ màu vàng nắng**; đổi nhãn "Thắp sáng" → **"hạt ánh sáng"**.
4. Hỏi đáp: **trả lời phân luồng** kiểu X/Reddit (nested) + ô trả lời **inline** + **thả ánh sáng** cho câu trả lời & reply.
5. Màn hỏi: **AI tự nhận lĩnh vực**, nút **Huỷ** dạng button, đổi tên "Chiếu câu hỏi"/"Chiếu sáng", rút gọn placeholder.
6. Cá nhân: sửa nhãn "ngày tham gia", "bài đã học".
7. Đăng nhập: kiểu FB/IG/X nhanh, bỏ nút Apple.
8. **Bạn bè** (màn mới): Đang theo dõi / Gợi ý, follow inline, mở hồ sơ thành viên.
9. Chat: nút **⋯** thành menu; thêm gửi **media + voice**; bỏ chip lọc "1-1".
10. Ô nhập chuẩn iOS: nút gửi **44pt**, chừa **safe-area** đáy.

---

## 1 — Điều hướng & tab (`Shell/NodieTabBar.swift`, `Shell/RootTabView.swift`, `AppState.swift`)

**Hiện tại:** 4 tab `feed / qa / conversations / journey`, mở vào `.feed`.
**Đổi thành:** 3 tab hiển thị + màn Bạn bè mới. **Ẩn** (không xoá code) Bảng tin & Hành trình — tương lai mở lại.

`NodieTab` enum — thứ tự và nội dung tab bar mới:
- `qa` = "Hỏi đáp", glyph `?`
- `conversations` = "Chat" (đổi nhãn từ "Hội thoại"), glyph `◧`
- `friends` = "Bạn bè", glyph `◎` (case mới)

Giữ `feed` và `journey` trong enum nhưng **loại khỏi tab bar** (đừng lặp qua `allCases` cho tab bar; tạo mảng `visibleTabs = [.qa, .conversations, .friends]`). `RootTabView` vẫn giữ nhánh `.feed`/`.journey` để không vỡ, chỉ là không có nút vào.

`AppState`:
- `tab` mặc định `= .qa` (không còn `.feed`).
- Thêm `var friendsPath: [String] = []` (memberId) + `NavigationStack` cho tab friends trong `RootTabView`, `navigationDestination(for: String.self)` → `MemberProfileView`.
- `showsTabBar`: thêm `case .friends: return friendsPath.isEmpty`.
- Sau đăng nhập, root hiển thị `.qa`.

Nhãn "Chat" thay "Hội thoại" ở: `NodieTab.conversations.rawValue`, tiêu đề màn `ConversationListView` (screenTitle "Chat").

## 2 — Thuật ngữ "phóng" → "chiếu sáng" (toàn bộ chuỗi hiển thị)

Bỏ mọi chữ **"phóng"** trong copy người dùng thấy. Bảng thay:
- `QuestionListView` phụ đề: ~~"Đặt câu hỏi = một lần phóng ra…"~~ → **"Mỗi câu hỏi là một lần chiếu sáng — hỏi rõ để thu về câu trả lời đúng."**
- Nút tạo câu hỏi: ~~"＋ Phóng câu hỏi"~~ → **"＋ Chiếu câu hỏi"**.
- `QuestionDetailView.replyBar` placeholder: ~~"Phóng câu trả lời của bạn…"~~ → **"Viết câu trả lời của bạn…"**.
- Màn hỏi (ask) tiêu đề: **"Chiếu câu hỏi"**; nút gửi: **"Chiếu sáng"** (bỏ ☀ trên nút).
- `LoginView` phụ đề đăng ký: ~~"Phóng ra trước, rồi trí huệ mới chảy về."~~ → **"Nơi bạn chia sẻ tri thức và cùng nhau đi sâu."**
- Hồ sơ thành viên: mục ~~"Đã phóng ra gần đây"~~ → **"Hoạt động gần đây"**; nhãn thống kê ~~"bài đã phóng"~~ → **"lần chiếu sáng"**.
- Cấp bậc: ~~"Người Phóng Xạ"~~ → **"Người Toả Sáng"** (ở MockData profile + memberData).
- Compose (màn Bảng tin, đang ẩn — vẫn sửa để sạch): tiêu đề "Chia sẻ", nút "Đăng", placeholder/hint bỏ "phóng".
- Journey (đang ẩn): không bắt buộc, để nguyên khi nào mở lại thì làm.

## 3 — Icon mặt trời vàng + "hạt ánh sáng" (`NodieColors.swift`, các view có ☀)

Thêm token:
```swift
static let sun = Color(hex: 0xE8A200)      // vàng nắng — icon ☀ khi đã thắp
static let sunDim = Color(hex: 0xC69214)   // vàng trầm — trạng thái chưa thắp
```
Mọi glyph ☀ dùng như "thích/soi sáng" phải tô `sun` (đã thắp) / `sunDim` (chưa) — thay cho `gold`/`inkSoft` cũ.

Đổi nhãn tương tác: nhãn "Thắp sáng" ở màn chi tiết bài → **"hạt ánh sáng"** (vd `☀ 89 hạt ánh sáng`, ☀ tô `sun`/`sunDim` theo trạng thái).

## 4 — Hỏi đáp phân luồng (`Features/QA/QuestionDetailView.swift`, `AnswerCardView.swift`, `Models/Question.swift`, `AppState.swift`)

Đây là thay đổi lớn nhất. Câu trả lời giờ có **reply lồng nhiều lớp** + **thả ánh sáng** + **ô trả lời inline**.

**Model (`Question.swift`)** — thêm:
```swift
struct AnswerReply: Identifiable, Hashable {
    let id: String
    let parent: String?       // nil = trả lời trực tiếp câu trả lời; ngược lại = id reply cha
    let who: String
    let avatarFrom: Color
    let avatarTo: Color
    let time: String
    let text: String
    let litBase: Int          // số hạt ánh sáng seed
}
```
`Answer` thêm: `let litBase: Int` và `let replies: [AnswerReply]`.

**AppState** — thêm state tương tác:
- `var litItems: Set<String> = []` — id (answerId hoặc replyId) đã thả ánh sáng. `toggleLit(_:)`, `litCount(base:id:) = base + (litItems.contains(id) ? 1:0)`.
- `var replyTo: ReplyTarget? = nil` với `struct ReplyTarget: Equatable { let answerId: String; let parent: String?; let name: String }`.
- `var extraReplies: [String: [AnswerReply]] = [:]` khoá theo answerId.
- Action: `beginReply(answerId:parent:name:)`, `cancelReply()`, `sendReply()` (đọc chung draft trả lời; nếu `replyTo != nil` thì thêm vào `extraReplies[answerId]` với `parent`, ngược lại thêm câu trả lời mới).
- Duyệt reply theo **pre-order** để ra thứ tự hiển thị + độ sâu: `func flatReplies(for answerId:) -> [(reply: AnswerReply, depth: Int)]`. Indent = `min(depth,3) * 18pt` (border trái 2px màu `ruleLight`/`0xECE4D2`).

**AnswerCardView** — hàng hành động đổi từ 1 nút pill sang **hàng icon kiểu X/Reddit** (khoảng cách 20pt, cỡ 12.5):
- `☀ {litCount}` — tô `sun`/`sunDim`, đậm; tap = `toggleLit(answer.id)`.
- `▲ {voteCount}` — tô `accent` nếu đã vote, ngược lại `inkMuted` (`0x8A7A5C`); tap = `toggleVote`. (Bỏ chữ "Hữu ích", chỉ còn mũi tên + số — giống upvote.)
- `↩ Trả lời` — tô `inkMuted`; tap = `beginReply(answerId: answer.id, parent: nil, name: answer.who)`.

Dưới hàng action, nếu `replyTo?.answerId == answer.id && replyTo?.parent == nil` → hiện **ô trả lời inline** (avatar 26pt gradient vàng + TextField bo tròn + nút gửi tròn 34pt `accent` ↑, `.autoFocus`), placeholder `"Trả lời {who}…"`.

Sau đó render `flatReplies(for:)`: mỗi reply thụt lề trái theo `indent`, kẻ trái 2px, có avatar 24pt + tên + time; hàng action nhỏ (cỡ 11.5): `☀ {litCount}` + `↩ Trả lời` (tap = `beginReply(parent: reply.id, name: reply.who)`). Nếu `replyTo?.parent == reply.id` → ô trả lời inline ngay dưới reply đó.

**QuestionDetailView** — thanh trả lời đáy CHỈ hiện khi **không** đang reply inline (`state.replyTo == nil`): placeholder "Viết câu trả lời của bạn…", nút gửi tròn `accent` với ☀ (trắng). Khi `replyTo != nil` → ẩn thanh đáy (chỉ dùng ô inline). Ô inline và thanh đáy DÙNG CHUNG một draft trả lời.

Seed dữ liệu demo (MockData): câu trả lời hay nhất của `q1` (TS. Lan Hương) có sẵn ~3 reply lồng (Ngọc Mai → TS. Lan Hương → …) để thấy phân luồng. litBase gợi ý: q1a1=128, q1a2=24, q1a3=9, q2a1=96, q3a1=14.

## 5 — Màn "Chiếu câu hỏi" / AI tự nhận lĩnh vực (màn mới `Features/QA/AskQuestionView.swift`)

Prototype có màn soạn câu hỏi (chưa có trong Swift — cần tạo). Push từ nút "＋ Chiếu câu hỏi".
- Header: **nút "Huỷ" dạng button** (viền `chipBorder`, nền `surface`, bo capsule) bên trái · tiêu đề in hoa "CHIẾU CÂU HỎI" giữa · nút **"Chiếu sáng"** (nền `accent`, mờ khi chưa đủ điều kiện) phải.
- 2 ô nhập: tiêu đề (serif 17, placeholder ngắn **"Câu hỏi của bạn là gì?"**) + bối cảnh (sans 13.5, "Thêm bối cảnh… (không bắt buộc)").
- **AI tự nhận lĩnh vực** từ nội dung câu hỏi (không bắt user chọn trước). Prototype dùng regex keyword cho 5 lĩnh vực: Não bộ / Giấc ngủ / Y học trường thọ / Dinh dưỡng / Vũ trụ học. Khi nhận ra → hiện thẻ gợi ý ("AI đọc câu hỏi & xếp vào → {lĩnh vực}", nhãn "☀ AI tự nhận", ☀ tô `sun`) + nút **"Đổi"** để chọn tay (hiện hàng chip). Khi chưa gõ → dòng mờ "AI sẽ tự nhận lĩnh vực khi bạn gõ câu hỏi." (Bản thật: chỗ này cắm AI phân loại ngữ nghĩa — regex chỉ là tạm.)
- Gửi → tạo `Question` mới prepend, mở luôn màn chi tiết.
- Điều kiện gửi: tiêu đề > 6 ký tự.

## 6 — Nhãn hồ sơ cá nhân (`Features/Profile/ProfileSections.swift`)

- "ngày trên đạo trình" → **"ngày tham gia"**.
- "bài đã học xong" → **"bài đã học"** (bỏ "xong").

## 7 — Đăng nhập nhanh kiểu FB/IG/X (`Auth/LoginView.swift`)

Mục tiêu: tạo tài khoản nhanh nhất, giữ chân user. Prototype (bản HTML) rút gọn còn: 1 ô **"Số điện thoại hoặc email"** + nút **"Tiếp tục"** (nền cream, chữ mực) + nút **"Tiếp tục với Google"** (viền mờ, chữ G xanh `#4285F4`) + link "Khám phá trước khi đăng nhập →". **Bỏ nút Apple.**

⚠️ Lưu ý thực thi trên iOS/Supabase: Supabase hiện chỉ bật provider `email`. Nếu thêm social (Google) thì App Store guideline 4.8 có thể yêu cầu kèm Sign in with Apple. Giữ luồng email hiện tại làm nền; "Tiếp tục với Google" chỉ thêm khi đã cấu hình provider. Đừng bỏ email/password thật — chỉ đổi bố cục cho nhanh gọn theo prototype, và bỏ nút Apple (đang không có).

## 8 — Màn Bạn bè (mới) (`Features/Friends/FriendsView.swift` + `MemberProfileView.swift`, `Models/Person.swift`)

**FriendsView** (tab mới):
- Header: tiêu đề serif "Bạn bè" + avatar tròn tối chữ đầu (tap → `ProfileView` cá nhân).
- Ô tìm kiếm giả (pill `surface`, "Tìm người trong cộng đồng…") — trang trí.
- 2 section: **"Đang theo dõi"** (chỉ hiện nếu có) và **"Gợi ý cho bạn"**.
- Mỗi hàng: avatar 46pt (nền `person.bg`, emoji), tên (rowTitle) + sub (metaSm), nút follow pill bên phải. Tap hàng → `MemberProfileView`. Tap nút follow → toggle (không mở hồ sơ).

**Model `Person`**: `id, name, emoji, bg: Color, sub`. Danh sách 6 người: hachi, quan, mai, vu, huong (TS. Lan Hương), duc (BS. Minh Đức) — lấy nguyên từ `people` trong prototype.

**State follow** (`AppState`): `var follows: Set<String> = ["hachi","quan"]` (seed 2 người đã theo dõi). `toggleFollow(_:)`. `followingList` / `suggestList` lọc từ `Person` theo `follows`. Nút: đang theo dõi → nhãn "Đang theo dõi", nền trong suốt, viền `chipBorder`, chữ `inkSoft`; chưa → "＋ Theo dõi", nền `accent`, chữ trắng.

**MemberProfileView** (hồ sơ thành viên khác) — prototype đã có, nếu Swift chưa có thì tạo:
- Header tối (`ink`): back, avatar 72pt gradient, tên + dấu ✦ (verified, tô `accentLight`), cấp bậc (`goldOnDark`), ngày tham gia, bio.
- Nút **Theo dõi** (toggle, dùng chung `follows`) + **Nhắn tin** (mở/tạo DM → sang tab Chat).
- Lưới 2 cột 4 thống kê (bài/lần chiếu sáng, trả lời hay, người theo dõi, % AI đánh giá).
- Chip lĩnh vực đang theo.
- "Hoạt động gần đây" — list bài; meta có ☀ phải tô `sun`.

Dữ liệu `memberData` (6 người, đủ stats/bio/level/posts) lấy nguyên từ prototype.

## 9 — Chat: menu ⋯ + media/voice + bỏ lọc 1-1 (`Features/Conversations/ChatDetailView.swift`, `ConversationListView.swift`, `Models/Conversation.swift`, `AppState.swift`)

**Nút ⋯ (đang trơ)** → menu (Menu/confirmationDialog hoặc popover):
- "Xem hồ sơ" (DM) / "Thông tin nhóm" — DM thì mở `MemberProfileView`.
- "Tắt/Bật thông báo" — toggle `mutedChannels` (đã có `toggleMute`).
- "Xoá cuộc trò chuyện" (destructive) — dùng `leave(_:)` (đã có), pop về list.

**Gửi media + voice** — ô nhập mở rộng:
- Nút **＋** bên trái (tròn viền `chipBorder`) → mở **khay đính kèm**: 3 nút "Ảnh" / "Máy ảnh" / "Tệp" (card `surface`, icon glyph ▣ / ◉ / ▤). Chọn → chèn tin nhắn media.
- Bên phải: khi có chữ → nút gửi ↑; khi rỗng → nút **mic** (SVG/`Image(systemName:"mic")` hoặc glyph, nền `ink`). Tap mic → **thanh ghi âm**: chấm đỏ nhấp nháy (`pulseRing`), "Đang ghi âm…", waveform giả, "Huỷ" + nút gửi. Gửi → chèn tin nhắn thoại.

**Model `ChatMessage`** — thêm loại nội dung:
```swift
enum Kind: Hashable { case text, media(String), voice(String) }  // media: "photo"/"camera"/"file"; voice: "0:07"
```
hoặc giữ `text` + thêm `media: String?`, `voice: String?`. Render:
- Bong bóng thoại: `▶  Tin nhắn thoại · {dur}` (trong bubble thường).
- Bong bóng media: hộp 170×116 bo 16, gradient `linear-gradient(135deg,#E4D9BF,#B8A67E)`, nhãn "▣ Ảnh"/"Ảnh chụp"/"Tệp đính kèm" góc dưới, chữ trắng. Không dùng bubble text cho media.

**State** (`AppState`): `attachOpen: Bool`, `recording: Bool`, action `toggleAttach()`, `sendMedia(_ kind:)`, `startRec()`, `cancelRec()`, `sendVoice()` (thêm ChatMessage của mình với kind tương ứng, thời lượng random 0:03–0:08).

**Bỏ chip lọc "1-1"** ở `ConversationListView` (giữ Tất cả / Kênh / Nhóm). Trong `ConversationFilter` có thể giữ `.direct` nhưng đừng render chip đó; hoặc bỏ case `.direct`.

## 10 — Ô nhập chuẩn iOS (`ChatDetailView`, `QuestionDetailView`, màn chi tiết bài)

Mọi thanh nhập đáy:
- Nút gửi tròn **44×44pt** (đạt ngưỡng chạm tối thiểu; hiện đang 42).
- Padding đáy ~**26pt** để chừa Home Indicator (thay vì 14). SwiftUI: dùng `.padding(.bottom)` hợp lý hoặc bám safe area — mục tiêu là thanh không dính vạch home.
- Ô nhập padding dọc 12.

---

## Design Tokens (bổ sung, hex trích từ prototype)
- **Vàng nắng** (icon ☀ đã thắp): `#E8A200` — token mới `NodieColors.sun`.
- **Vàng trầm** (☀ chưa thắp): `#C69214` — token mới `NodieColors.sunDim`.
- Kẻ thụt reply: `#ECE4D2` (dùng `ruleLight`).
- Media bubble gradient: `#E4D9BF → #B8A67E`.
- Google "G": `#4285F4`.
- Còn lại dùng token sẵn có (`NodieColors`, `NodieTypography`, `NodieSpacing`) — không thêm màu ngoài hệ.

## State Management (tổng, thêm vào `AppState`)
`tab` mặc định `.qa`; `friendsPath`; `follows: Set<String>` (seed hachi, quan); `litItems: Set<String>`; `replyTo: ReplyTarget?`; `extraReplies`; `extraAnswers` (nếu chưa có); `attachOpen`, `recording`; state màn hỏi (askTitle/askBody/askTag/askTagManual). Mọi cái là mock client-side, chú thích rõ chỗ sẽ wire Supabase (votes, replies, follows, media upload, voice upload) như style comment hiện có.

## Assets
Không có ảnh/bitmap. Tất cả icon là glyph Unicode (`?`, `◧`, `◎`, `☀`, `▲`, `↩`, `▣`, `◉`, `▤`, `▶`, `＋`) hoặc SF Symbols (`arrow.left`, `arrow.up`, `ellipsis`, `mic`). Avatar = gradient + emoji. Giữ nguyên quy ước glyph để khớp prototype.

## Files
- `Aion Prototype v3.dc.html` — prototype nguồn (kèm trong thư mục này). Mở bằng trình duyệt để xem hành vi. Các thay đổi ở trên đều đã có trong file này.
- Codebase đích: `nodie-ios/` (SwiftUI). File cần đụng: `Shell/NodieTabBar.swift`, `Shell/RootTabView.swift`, `AppState.swift`, `Models/Question.swift`, `Models/Conversation.swift`, `Models/Person.swift` (mới), `Models/MockData.swift`, `Features/QA/*`, `Features/QA/AskQuestionView.swift` (mới), `Features/Friends/*` (mới), `Features/Conversations/ChatDetailView.swift` + `ConversationListView.swift`, `Features/Profile/ProfileSections.swift`, `Auth/LoginView.swift`, `DesignSystem/NodieColors.swift`.
