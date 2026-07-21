# Review batch fix audit NODIE — chat + QA/auth + migrations

Scope: diff chat = commits `350606c`+`3826e22` (main session commit giữa lúc review); diff QA/auth = working tree. Chỉ đọc, không sửa, không build, không chạm prod.

## Findings (nghi nhất → nhẹ nhất)

### P1-1 · `setBest` client mirror NGƯỢC với ngữ nghĩa toggle của 0048 — unset không bao giờ hiện được trên UI
- **File:** `apps/nodie-ios/NODIE/Features/QA/QAStore.swift:377-383` + `supabase/migrations/0048_set_best_answer_toggle.sql`
- 0048 đổi RPC thành toggle: gọi trên answer ĐANG là best ⇒ server **gỡ hết** is_best. Nhưng client sau khi RPC thành công vẫn chạy vô điều kiện:
  `answersByQuestion[questionId] = ...map { $0.settingBest($0.id == answerId) }` — luôn đánh dấu answer vừa bấm là best.
- **Kịch bản:** A đang "Hay nhất" (server+client khớp). Tác giả bấm "Bỏ đánh dấu Hay nhất" → server: is_best=false toàn bộ → client: A vẫn best ⇒ UI **không đổi gì** (nhìn như nút hỏng). Bấm lần 2 → server thấy already=false → SET lại best ⇒ server/UI lệch pha vĩnh viễn theo số lần bấm lẻ/chẵn; chỉ refetch thread mới lộ sự thật. `BestToggleButton(isBest: answer.isBest)` (AnswerCardView:202) đọc đúng cái mirror sai này.
- Gốc rễ: QA-agent chặn item 7 chờ SQL ("client hợp với toggle" — nhận định sai vì bỏ qua dòng 381); SQL-agent thêm toggle nhưng không ai sửa mirror. Hai report cộng lại tạo lỗ.
- **Fix:** đọc `is_best` hiện tại trước khi gọi; nếu answer đang best → sau RPC map tất cả về `settingBest(false)`; ngược lại giữ như cũ. (Hoặc RPC trả về trạng thái mới.)

### P1-2 · Guard `!isLoadingOlder` cho pill "N tin mới" là guard theo TIMING — nhiều khả năng vô hiệu
- **File:** `apps/nodie-ios/NODIE/Features/Conversations/ChatDetailView.swift:376` (guard) vs `:982-989` (loadOlder Task)
- Trình tự trong Task của `loadOlder`: `await store.loadMessages(...)` (mutate mảng bên trong) → `proxy.scrollTo` → `isLoadingOlder = false` — **toàn bộ phần sau await là một lát MainActor đồng bộ**, không có suspension. SwiftUI gom mutation + state change vào cùng một lượt render; khi `.onChange(of: messages.count)` chạy, nó đọc `isLoadingOlder` = giá trị CUỐI = `false` ⇒ guard thủng ⇒ `unseen += 50` (atBottom=false vì user đang ở đầu) ⇒ pill ma "50 tin mới" sau mỗi lần phân trang. (`ConversationStore` không @MainActor, Swift 5.9 mode — thứ tự job continuation vs render pass không có bảo đảm; kể cả kịch bản thuận lợi thì đây vẫn là guard dựa may rủi scheduler.)
- Cùng chỗ: `proxy.scrollTo(anchorId, anchor: .top)` (:985) gọi TRƯỚC khi 50 hàng prepend được layout trong LazyVStack — neo vị trí kiểu này không đáng tin, dễ nhảy màn (đúng câu hỏi trọng điểm 6).
- **Fix (cấu trúc, không timing):** trong `onChange`, phát hiện prepend bằng dữ kiện — vd giữ `@State lastFirstId`; nếu `messages.first?.id != lastFirstId` ⇒ là prepend, bỏ đếm + cập nhật mốc. Hoặc chỉ `unseen += 1` khi `messages.last?.id` đổi. **Cần chạy máy thật xác nhận** (kênh >50 tin, cuộn lên nạp trang, xem pill).

### P2-1 · `fetchNewMessages` với `serverCursor == nil` + đã có tin từ cache đĩa → nạp 50 tin CŨ NHẤT lịch sử và append vào đáy (regression so với code cũ)
- **File:** `ConversationStoreRealtime.swift:325-346`, `ConversationStore.swift:546-555`
- `after = serverCursor[channelId]`; nil ⇒ query KHÔNG có filter thời gian, `.order(ascending: true).limit(50)` = **50 tin cổ nhất của kênh**. `loadCachedMessages` KHÔNG seed cursor. Kịch bản: mở chat từ cache đĩa, `loadMessages` fail/chưa xong, socket re-subscribe hoặc foreground → `catchUp` → append 50 tin cổ (id không trùng cache 200 tin mới nhất) vào ĐÁY hội thoại, cursor kẹt ở quá khứ. Code cũ (`messagesByChannel...last?.createdAt`) dùng đuôi cache nên không dính.
- **Fix:** seed cursor trong `loadCachedMessages` (`advanceServerCursor(channelId, from: rows)` — rows đĩa là dữ liệu server), hoặc fallback `after ?? đuôi-server-row`, hoặc khi after==nil thì query descending limit 50 rồi reverse.

### P2-2 · `reachedOldest` không reset khi `loadWindow` thay mảng — jump tới tin ghim/tìm kiếm xong không cuộn lên được nữa
- **File:** `ChatDetailView.swift:122, 988` (set) — không có chỗ nào reset
- Kịch bản: user cuộn lên tới đáy lịch sử thật (`reachedOldest = true`) → bấm băng ghim / kết quả tìm kiếm → `loadWindow` thay mảng bằng cửa sổ GIỮA lịch sử → phía trên cửa sổ còn tin, nhưng `loadOlder` bị `reachedOldest` chặn vĩnh viễn trong đời view. **Fix:** reset `reachedOldest = false` ở mọi đường `loadWindow` thành công (`jumpTo`, nhánh pendingScrollTarget trong `.task`).

### P2-3 · `deleteAccount`: `removeToken()` TRƯỚC RPC — RPC fail thì user còn đăng nhập mà push chết
- **File:** `AuthStore.swift:316-327` + `0017_nodie_community.sql:110` (`device_tokens ... on delete cascade`)
- `device_tokens.user_id` có **ON DELETE CASCADE** → đường thành công của `delete_account` (xoá auth.users) server tự dọn token, `removeToken()` trước RPC là thừa. Còn đường THẤT BẠI (offline/lỗi): token đã bị xoá, `run{}` bắt lỗi → user vẫn đăng nhập nhưng không nhận push tới lần cold-launch sau (saveToken chỉ upsert lại khi didRegister). `wipeLocalCaches()` cũng chạy vô điều kiện sau RPC fail (vô hại nhưng cùng mùi). **Fix:** bỏ `removeToken()` khỏi `deleteAccount` (cascade lo rồi), hoặc chỉ gọi sau khi RPC thành công (lúc đó cũng chẳng cần). `signOut()` giữ nguyên thứ tự hiện tại — ở đó là ĐÚNG (local signOut luôn thành công).

### P2-4 · Deep-link offline: spinner inputBar vĩnh viễn, không có đường retry
- **File:** `ChatDetailView.swift:448, 1216`; `ConversationStore.swift:196`
- `hasSyncedChannels` chỉ set khi `loadChannels` THÀNH CÔNG. Deep-link/push mở thẳng chat lúc offline: `.task` gọi `loadChannels` một lần → fail → nhánh `else if !store.hasSyncedChannels` hiện `ProgressView` mãi. Mạng về cũng không tự lành: `catchUp` guard chính `hasSyncedChannels`, `.task` không chạy lại. Chỉ lành khi back ra list. Đúng hướng (hết banner 🔒 oan) nhưng đổi "kết tội sai" thành "chờ vô hạn". **Fix:** thêm nút/đường retry (vd `loadError` của store → hiện Thử lại), hoặc catchUp bỏ guard khi có `visibleChannelId` chưa sync.

### P2-5 · Xoá tin đang upload: còn khe đua đúng bằng thời gian bay của INSERT
- **File:** `ConversationStore.swift:823-829`
- Guard `!Task.isCancelled, pendingMedia != nil` đặt đúng NGAY trước INSERT (giữa guard và `.insert` chỉ có code đồng bộ) — tốt. Khe còn lại: cancel rơi vào lúc INSERT **đang bay** — HTTP đã tới server, row commit, client nhận CancellationError → catch return false, bong bóng đã gỡ, nhưng Realtime đẩy về ⇒ tin "sống lại"; nhánh delete đã đi đường local-only nên không có soft-delete server. Cửa sổ ~1 RTT, chấp nhận được, nhưng nên vá nốt: trong catch, nếu `Task.isCancelled` → bắn best-effort soft-delete theo `messageId` (idempotent, khớp 0 hàng thì thôi).

### P3 (ghi nhận, không chặn)
1. **Tin mới THẬT đến trong lúc phân trang bị nuốt khỏi đếm unseen** — guard `!isLoadingOlder` (nếu hoạt động) skip cả onChange chứa tin realtime đến cùng nhịp. Hiếm, tự lành ở tin kế.
2. **Keyset `gt`/`lt` trên `created_at` không tiebreak `id`** — hai tin cùng timestamp cắt ngang ranh giới trang/cursor thì sót. Xác suất thấp (mỗi INSERT một request → now() khác nhau; forward/album cũng insert từng tin). Pre-existing, không phải regression. Fix dài hạn: keyset (created_at,id).
3. **`loadMessages` đẩy cursor từ `older` (đã lọc block) còn `fetchNewMessages` từ `rows` thô** — đuôi trang toàn tin người bị chặn thì cursor lệch nhẹ → refetch thừa, tự hội tụ sau một lần fetchNewMessages. Vô hại.
4. **`questionsLoadFailed` dính vào search-empty** — `visible.isEmpty` (do search không khớp) + cờ fail còn sót từ lần refresh hỏng trước ⇒ hiện errorState thay vì "không có kết quả" (QuestionListView:23). Nhỏ.
5. **`serverCursor` là state mới ghi từ `loadMessages` (nonisolated, chạy off-main) và đọc/ghi từ `fetchNewMessages` (@MainActor)** — theo đúng pattern cross-isolation sẵn có của ConversationStore (Swift 5.9, không enforcement). Không phải regression mới nhưng thêm một biến vào vùng xám; khi nâng strict concurrency sẽ phải xử cả cụm.
6. **0048 không loại answer đã xoá mềm** khi set best — chỉ chạm được qua RPC trực tiếp, cosmetic.
7. **`removeToken` khi `pendingToken == nil`** (Apple chưa trả token phiên này) = no-op → hàng token cũ vẫn trỏ user vừa thoát tới khi có người login upsert đè. Agent đã tự khai; residual chấp nhận được, muốn chắc thì persist token vào UserDefaults.

## Các trọng điểm KIỂM QUA — không thấy lỗi
- **C2 catchUp/statusChange (ConversationStoreRealtime:98-106):** logic "bỏ lần đầu" đúng ở CẢ hai thứ tự (observer tạo sau `subscribe()`, AsyncValueSubject replay `.subscribed` đương nhiệm = lần đầu; nếu replay `.subscribing` thì `.subscribed` đầu tiên vẫn bị `sawSubscribed=false` nuốt). Suspend/resume: `resumeFromForeground` đập-xây lại channel + observer mới (state tươi) → không double catchUp. Hai catchUp chồng nhau (foreground + reconnect) an toàn nhờ dedup theo id trên MainActor. `advanceServerCursor` dùng `max` — monotonic thật, `loadWindow` giữa lịch sử không kéo lùi.
- **C1 uploadTasks:** `deleteMessage` nhánh pending → `discardMedia` (cancel trước khi quên Data) đúng; `deleteMessages` batch + `leave` cũng cancel; double-retry overlap được cửa thứ hai của guard (`pendingMedia == nil`) đỡ. `defer { uploadTasks[messageId] = nil }` đặt SAU guard uploadsInFlight nên early-return không nil nhầm handle của task đang chạy.
- **@MainActor QAStore/AuthStore:** mọi khởi tạo/call-site từ View/MainActor; `nonisolated(unsafe) authTask` chỉ để deinit cancel — đúng mẫu FollowStore; không thấy pattern block/semaphore nào gây deadlock. Build xanh trong Swift 5.9 đã bắt sai isolation ở call-site async.
- **removeToken trước signOut (Q4):** `removeToken` nuốt lỗi (`try?`) → không ném; offline vẫn đi tiếp `signOut` → fallback `.local` luôn quên session → không kẹt phiên; `wipeLocalCaches` chạy mọi đường. Đúng.
- **Q5 embed filter:** `MyAnswerRow.question: QuestionTitleRef?` và `Row.question: QuestionRow?` đều OPTIONAL → PostgREST null-out embed không làm vỡ decode cả list. `savedQuestions` !inner + filter, `myAnswers` non-inner + filter khớp semantics PostgREST tài liệu hoá. Còn thiếu: một cú HTTP test bằng tài khoản role='user' (chính agent xin) — chưa thấy bằng chứng đã chạy.
- **Q7 migration 0047:** client chỉ UPDATE messages qua `edit` (body, edited_at) và soft-delete (deleted_at) — không cột nào bị đóng băng; metadata/lang không khoá; pin đi qua RPC security-definer (current_user='postgres', guard bỏ qua). `channels_insert_dm` siết `created_by` không phá gì: client tạo DM/nhóm đều qua RPC `create_dm`/`create_group` (definer, vượt policy); write trực tiếp duy nhất lên `channels` là UPDATE title (policy khác). `create_dm` advisory lock theo cặp đối xứng — đúng, serialize đúng cặp.
- **MessageRow thêm `pinned_at/pinned_by` optional** → cache đĩa cũ thiếu key vẫn decode (decodeIfPresent). Mọi hàm `replacing*` đã chở pin theo — không rơi pin khi vá body/reactions.
- **inputBar 3-state, search-jump fallback, scenePhase dừng ghi âm:** logic đúng như mô tả; `.inactive` bỏ qua đúng; fallback search-jump rơi về đáy + errorMessage, hết màn trắng.

## Đề nghị hành động (ưu tiên)
1. Sửa `setBest` mirror theo toggle (P1-1) — 5 dòng, sửa xong nên thêm 1 UITest bấm-hai-lần.
2. Đổi guard pill sang phát hiện prepend cấu trúc + verify neo cuộn trên máy thật (P1-2).
3. Seed `serverCursor` từ cache đĩa hoặc fallback đuôi (P2-1); reset `reachedOldest` sau `loadWindow` (P2-2).
4. Bỏ `removeToken` khỏi `deleteAccount` (P2-3); thêm đường retry cho deep-link chưa sync (P2-4); soft-delete best-effort khi INSERT bị cancel (P2-5).
5. Chạy 1 cú HTTP test embed filter với tài khoản role='user' cho `savedQuestions`/`myAnswers` (việc còn nợ từ QA-agent).

## Câu hỏi chưa giải quyết
- Embed filter PostgREST (Q5) đã được verify bằng HTTP thật với user thường chưa? Task nói "backend đã verify trên prod" nhưng chỉ nêu trigger/RPC (fake JWT + rollback) — không thấy nhắc test embed.
- P1-2 cần một lần chạy máy thật để chốt guard có thủng thật không (phân tích chỉ ra không có bảo đảm thứ tự; hành vi thực phụ thuộc scheduler).
