# Wire ChatDetailView + NewMessageView → ConversationStore

**Phạm vi:** `ChatDetailView.swift`, `NewMessageView.swift`, `MemberProfileView.swift` (chỉ nút "Nhắn tin"). Store/backend đã xong từ trước, đây chỉ đổi nguồn dữ liệu tầng view.

## Đã làm

- `ChatDetailView`: `chatId: String` → `channelId: UUID`, thêm `store: ConversationStore`. Đọc `store.channel(id:)`/`store.messages(for:)` thay AppState mock. `.task` nạp tin + `subscribe(to:)` + `markRead(channelId:)`; `.onDisappear` gọi `unsubscribe(from:)`.
- Gửi tin: `sendDraft()` gọi `store.send(...)` async, **chỉ xoá draft + huỷ trích dẫn khi `ok == true`** (draft-safety, đúng luật màn Hỏi đáp).
- Reaction: `store.toggleReaction(...)`, tô đậm bằng `message.myReactions(uid: store.currentUserId)`, số đếm từ `message.reactionCounts`.
- Nhãn tên người gửi: dựng lại `senderLabel(at:)` — so `userId` liền trước, ẩn cho tin của mình.
- Nhãn "đã sửa": `message.isEdited`.
- **Nợ #15 (menu giữ-bong-bóng Sửa/Xoá)**: thêm `onEdit`/`onDelete` vào `MessageBubbleView`, chỉ non-nil khi là tin của mình. Sửa dùng `.alert` + `TextField` (đơn giản hơn dựng lại nguyên băng "Đang trả lời" cho thao tác hiếm dùng) gọi `store.edit(...)`. Xoá gọi `store.deleteMessage(...)` trực tiếp, không confirm dialog — đúng quy ước sẵn có của app (nút "Xoá cuộc trò chuyện" cũng không confirm).
- Menu ⋯: Tắt/Bật thông báo → `store.setMuted(...)`; Xoá cuộc trò chuyện → `store.leave(...)`.
- `NewMessageView`: thêm `store: ConversationStore`, chọn người → `store.openOrCreateDM(with:)` → `state.openChat(channelId)`.
- `MemberProfileView`: nút "Nhắn tin" gọi `store.openOrCreateDM(with:)` (dựng `ConversationStore()` tại chỗ — xem lý do ở mục Blocker bên dưới), không đụng gì khác trong file.
- Build: chỉ 1 lỗi còn lại, **không nằm trong 3 file được giao** (xem Blocker #1).

## Blockers / chưa nối thật — ĐỪNG GIẤU

1. **`RootTabView.swift:55` build đỏ — KHÔNG do 3 file của tôi, không sửa được (ngoài phạm vi).**
   `ChatRoute.member(UUID)` (AppState.swift, cấm sửa) gọi `MemberProfileView(state:, memberId: id)` với `id: UUID`, nhưng `MemberProfileView.memberId` vẫn là `String` (Mock) — lỗi type `UUID` → `String` tại RootTabView.swift dòng 55.
   Lỗi này **có sẵn từ trước** khi tôi bắt đầu (do `MemberProfileView.swift` lúc đó có lỗi khác ở dòng `openOrCreateDM`, che khuất lỗi type này qua cascading diagnostics của Swift). Sau khi tôi sửa xong lỗi `openOrCreateDM`, lỗi type này lộ ra — không phải tôi gây ra, chỉ là không còn gì che nó nữa.
   Đã xác nhận: `plans/260717-1325-.../phase-06-member-profile-real.md` dòng 45 **đã ghi sẵn đúng vấn đề này** ("⚠️ `ChatRoute.member(id)` vẫn bơm id mock... chat → hồ sơ sẽ rơi vào màn 'không tìm thấy' sau phase này") và liệt kê `RootTabView.swift` vào diện phải sửa của phase đó — nhưng phase 06 **"chưa bắt đầu"** (chặn bởi apply migration 0027/0028 prod).
   ⇒ Build sẽ **đỏ cho tới khi phase 06 chạy** và đổi `MemberProfileView.memberId` sang UUID (hoặc đổi cách RootTabView truyền). Không phải lỗi của tác vụ này.

2. **Menu "Xem hồ sơ" trong Chat bị disable tạm.** `ChannelRow` chỉ mang `channel_members` của CHÍNH MÌNH (RLS lọc `eq user_id`) — không có API lộ UUID người kia trong DM. Kể cả có, `MemberProfileView` vẫn nhận `String` (xem Blocker #1) nên chưa route được. Đã đổi thành `Button(...) {}.disabled(true)`, comment giải thích tại chỗ.

3. **Nút "Nhắn tin" (NewMessageView + MemberProfileView) hiện là DEAD CODE cho mọi người trong danh sách.** `MockData.people`/`Member.id` là slug (`"huong"`, `"hachi"`…), không phải UUID. Cả hai chỗ đều `guard UUID(uuidString: id) else { return }` — luôn `nil` với dữ liệu Mock hiện tại nên nút bấm không làm gì (không crash, không bịa id giả). Sẽ TỰ chạy được khi FollowStore/phase member-profile-real đổi nguồn người sang UUID thật — không cần sửa lại 2 chỗ này.
   Ở `MemberProfileView`, tôi dựng `ConversationStore()` MỚI tại chỗ bấm thay vì nhận qua tham số init — vì thêm tham số bắt buộc vào init sẽ vỡ compile ở `RootTabView.swift` (2 chỗ gọi `MemberProfileView(state:, memberId:)`, file cấm sửa). Trade-off: instance này không dùng chung `channels` đã nạp của `chat` store ở RootTabView, nên sau khi tạo DM xong, danh sách hội thoại có thể chưa thấy kênh mới ngay (phải đợi `ConversationListView` tự `loadChannels()` lại). Chấp nhận được vì đường này hiện là dead code; khi phase 06 nối UUID thật, nên đổi lại thành nhận `store` qua param.

4. **Ghi âm/đính kèm vẫn KHÔNG nối thật — đúng như dự đoán trong đề bài.**
   - Ghi âm: không có `AVAudioRecorder` thu âm thật → không có `Data` thật để gọi `store.sendMedia`. Nút gửi trong `recordingBar` đổi thành `state.cancelRec()` (huỷ, không giả vờ gửi).
   - Đính kèm: không có `PhotosPicker`/`DocumentPicker` thật → tương tự, nút trong `attachTray` đổi thành đóng khay (`state.toggleAttach()`), không gửi gì.
   - Cả hai đều có comment tại chỗ giải thích lý do + trỏ tới report này.

5. **Key i18n MỚI cần thêm vào `Localizable.xcstrings` (9 ngôn ngữ) — CHƯA có, KHÔNG tự sửa file đó (bị cấm):**
   - `"Sửa"` — nhãn menu sửa tin nhắn (`MessageBubbleView.bubbleMenu`)
   - `"Xoá"` — nhãn menu xoá tin nhắn (cùng chỗ)
   - `"Sửa tin nhắn"` — tiêu đề alert sửa tin (`ChatDetailView.body`)
   - `"(đã sửa)"` — nhãn cạnh giờ gửi khi `message.isEdited`
   Đã cân nhắc tái dùng chuỗi có sẵn (`"Xoá cuộc trò chuyện"`, `"Sửa hồ sơ"`) nhưng SAI NGHĨA nghiêm trọng (xoá cả cuộc trò chuyện thay vì 1 tin, sửa hồ sơ thay vì sửa tin) — dùng nhầm còn hại hơn để raw string tạm hiện tiếng Việt ở mọi ngôn ngữ. Chọn giữ 4 chuỗi mới, ghi rõ ở đây để phiên sở hữu `Localizable.xcstrings` thêm bản dịch.

## Build

`xcodebuild ... build` → 1 lỗi duy nhất, tại `RootTabView.swift:55` (Blocker #1, ngoài phạm vi/file cấm). Không còn lỗi/cảnh báo nào trong `ChatDetailView.swift`, `NewMessageView.swift`, `MemberProfileView.swift`.

## Câu hỏi chưa giải quyết

- Ai/khi nào sửa `RootTabView.swift:55`? Có phải đợi hẳn phase-06 (đang chặn bởi apply migration prod), hay cần một vá tạm (vd `ChatRoute.member` đổi lại `String`, hoặc `MemberProfileView` tạm nhận cả `UUID`) để build xanh sớm hơn?
- Menu "Xem hồ sơ" trong Chat — có cần API lộ UUID thành viên DM ngay bây giờ, hay để phase 06 gộp luôn?
