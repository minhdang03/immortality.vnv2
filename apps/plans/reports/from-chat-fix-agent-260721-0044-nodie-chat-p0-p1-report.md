# NODIE chat P0/P1 fix — report

supabase-swift 2.49.0. Không chạy xcodebuild/xcodegen (phiên khác build). Code Swift đúng cú pháp, build tập trung sau.

## Đã sửa

### 1. [P0] Xoá tin khi media đang upload → tin "sống lại"
- `ConversationStore.swift`
  - Thêm `uploadTasks: [UUID: Task<Void,Never>]` (dòng ~49) — giữ handle upload để huỷ thật.
  - `sendMedia` (~698): lưu handle `uploadTasks[id] = Task {…}`.
  - `retryMedia` (~874): cũng lưu handle + await.
  - `uploadPending` (~810): guard `!Task.isCancelled, pendingMedia[messageId] != nil` NGAY TRƯỚC INSERT → task bị huỷ/đã xoá thì không ghi server (file thành mồ côi, chấp nhận). Catch (~842): nếu cancelled/pending đã mất thì KHÔNG dựng lại pending "hỏng" (tránh bong bóng ma giữ 25MB). Thêm `defer { uploadTasks[messageId] = nil }` chống phình dict.
  - `discardMedia` (~887): `uploadTasks[messageId]?.cancel()` TRƯỚC khi quên `Data` — đây là mấu chốt: bản cũ chỉ quên `Data`, task vẫn chạy tới INSERT.
  - `deleteMessage` (~940): thêm nhánh `pendingMedia[messageId] != nil → discardMedia + return` (song song nhánh `isQueued`). Đây là lỗi thiếu nhất quán audit chỉ ra.
  - `deleteMessages` (batch, ~1010): đổi `pendingMedia[id] = nil` → `discardMedia(messageId: id)` để cũng huỷ task (bản cũ cũng dính cùng bug — chỉ quên `Data`).
  - `leave` (~1192): huỷ upload task của kênh vừa rời trước khi lọc `pendingMedia`.

### 2. [P0] Rớt websocket foreground → mất tin
- `ConversationStoreRealtime.swift`
  - Tách catch-up của `resumeFromForeground` thành `catchUp()` (~149, `@MainActor`): loadChannels + fetchNewMessages(visible), guard `hasSyncedChannels`.
  - `resumeFromForeground` (~138) gọi `flushQueued` + `catchUp` (bỏ code lặp).
  - `startRealtime` (~98): thêm task quan sát `realtime.statusChange` (AsyncStream<RealtimeChannelStatus>). Mỗi lần về `.subscribed` mà KHÔNG phải lần đầu → `catchUp()`. Xác nhận từ source supabase 2.49.0: reconnect → `resetForReconnect` đưa `.subscribed`→`.unsubscribed`→rejoin→`.subscribed` lại; `AsyncValueSubject` replay giá trị hiện tại cho observer mới (nên `.subscribed` đương nhiệm = "lần đầu", bỏ qua). Dùng `if case .subscribed = status` (không phụ thuộc Equatable).

### 3. [P1] Pagination cuộn-lên
- `ConversationStore.swift`: `loadMessages` giờ `@discardableResult … -> Int` — trả số tin server (`page.count`), -1 khi lỗi, để phân trang biết đáy thật (0) vs lỗi (-1). **Đây là thay đổi public API duy nhất** (backward-compatible: caller cũ bỏ qua giá trị trả).
- `ChatDetailView.swift`: `@State didInitialLoad/isLoadingOlder/reachedOldest` (~118). Cảm biến `Color.clear` ĐẦU LazyVStack (~264) → `loadOlder(proxy)` khi cuộn tới đầu, chỉ sau `didInitialLoad` (set cuối `.task`, ~496) để layout mở màn không kích oan. `loadOlder` (~970) neo về `messages.first?.id`, `scrollTo(anchor:.top)` không animation → không nhảy màn; `fetched==0 → reachedOldest`; `-1` giữ cửa mở. `onChange(messages.count)` guard `!isLoadingOlder` (~376) để prepend không đếm nhầm "N tin mới".

### 4. [P1] Search-jump fail → màn trắng
- `ChatDetailView.swift` `.task` (~430): nhánh `loadWindow == false` giờ set `errorMessage` ngắn + rơi về `loadCachedMessages`+`loadMessages` (đáy hội thoại). Offline thì loadMessages tự dựng chatErrorState + Thử lại. Hết màn trắng câm.

### 5. [P1] Deep-link DM trước khi channels load → banner "🔒 admin" sai
- `ChatDetailView.swift`:
  - `.task` (~421): nếu `channel == nil && !hasSyncedChannels` → `await loadChannels()` (deep-link/push tự nạp, tránh kẹt loading vô hạn).
  - `inputBar` (~1165): 3 trạng thái — `if let channel { canPost ? composer : 🔒 } else if !hasSyncedChannels { ProgressView } else { "Không mở được cuộc trò chuyện này." }`. Chỉ từ chối khi đã sync và thật sự không thấy kênh.

### 6. [P1] Ghi âm dở, app xuống nền → mất voice
- `ChatDetailView.swift`: `@Environment(\.scenePhase)` + `.onChange(of: scenePhase)` (~498): `.background && state.recording → finishRecording()` (chốt + gửi qua đường lạc quan/queue, KHÔNG mất). Chỉ `.background` (bỏ `.inactive` thoáng qua).

### 7. [P1] Catch-up cursor lấy giờ device
- `ConversationStore.swift`: thêm `serverCursor: [UUID: Date]` (~91) + `advanceServerCursor(_:from:)` (max, không tụt). Đẩy con trỏ ở `loadMessages` (~304, từ `older`), `loadWindow` (~365, từ `filtered`). Xoá ở `leave`.
- `ConversationStoreRealtime.swift` `fetchNewMessages` (~325): `after = serverCursor[channelId]` thay `messagesByChannel…last?.createdAt`; đẩy con trỏ TRƯỚC lọc dedup (~340) để echo tin của chính mình vẫn tiến con trỏ, không fetch lại mãi. Nguồn thời gian giờ là `created_at` server, device lệch giờ không skip tin peer.

## Chỗ phải đoán API supabase-swift
- `RealtimeChannelV2.statusChange: AsyncStream<RealtimeChannelStatus>` và hành vi reconnect (`resetForReconnect` cycle status) — ĐÃ đọc source checkout (Sources/Realtime/{Types,RealtimeChannelV2,ChannelStateManager}.swift), không đoán. `AsyncValueSubject` replay current value cho observer mới: đọc AsyncValueSubject.swift:113 `continuation.yield(state.value)` — xác nhận `.subscribed` đương nhiệm được phát lại nên logic "bỏ qua lần đầu" đúng.

## Câu hỏi chưa giải quyết
- Item #6: chọn "chốt + gửi" khi background thay vì "giữ cho user quyết" (không có cơ chế draft voice). Nếu muốn hành vi giữ-lại-hỏi thì cần thêm state; báo để Đăng quyết.
- Item #3: một trang server toàn tin của người bị chặn (hiếm) vẫn tính `page.count>0` nên KHÔNG kết luận hết — đúng; nhưng nếu tất cả lịch sử còn lại đều bị chặn thì cuộn lên sẽ nạp trang rỗng-hiển-thị vài lần trước khi tới trang thật. Chấp nhận, không tối ưu thêm.
- Item #2: mỗi lần reconnect chạy `catchUp` (loadChannels + fetch). Mạng chập chờn nhiều lần → nhiều loadChannels. Không phải storm (chỉ theo transition `.subscribed`), nhưng nếu muốn debounce thì cần thêm mốc thời gian.

Status: DONE
Summary: Đã sửa cả 7 mục P0/P1 trong 3 file được giao (ConversationStore, ConversationStoreRealtime, ChatDetailView); public API đổi duy nhất là `loadMessages` trả `Int` (backward-compatible, @discardableResult).
Concerns/Blockers: Chưa build (theo yêu cầu — build tập trung). Một quyết định UX ở item #6 (chốt+gửi vs giữ-hỏi) nên xác nhận với Đăng.
