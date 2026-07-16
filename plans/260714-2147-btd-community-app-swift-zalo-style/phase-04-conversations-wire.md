# Phase 04 — Wire Hội thoại (chat thật + Realtime + unread + block/report)

**Status:** ⬜ chưa bắt đầu · P1 · ~4h
**Chặn bởi:** phase 01 (bảng chat phải tồn tại + có kênh seed). **Chặn:** 04b (push cần message insert thật).
**Trigger:** UI 6 màn đã dựng; `AppState` còn đọc `MockData` cho hội thoại (dòng 82/105/126/168).

## Context links

- [plan.md](plan.md) — quy tắc scale (keyset, denormalized, index composite, last_read_at)
- `apps/nodie-ios/NODIE/Features/QA/QAStore.swift` — **KHUÔN MẪU** cho `ConversationStore`
- `apps/nodie-ios/NODIE/AppState.swift` — dòng 82/105/126/168 dùng MockData; đích thay thế
- `apps/nodie-ios/NODIE/Features/Conversations/ConversationListView.swift`, `ConversationRowView.swift`, `ChatDetailView.swift`
- `apps/nodie-ios/NODIE/Models/Conversation.swift` — struct `Conversation` + `ChatMessage` hiện tại
- `supabase/migrations/0017_nodie_community.sql` — RLS chat + slow-mode + `is_broadcast`

## Overview

Thay MockData hội thoại bằng dữ liệu Supabase thật: danh sách kênh/DM sắp theo `last_message_at`, chat detail keyset-paginate, gửi tin thật, Supabase Realtime đẩy tin mới, unread qua `last_read_at`, block/report. `is_broadcast` client chỉ ẩn ô nhập — RLS đã chặn thật server-side.

## Key insights

- **`QAStore` là khuôn mẫu đã kiểm chứng** (sau phase 01): `@Observable`, DTO `Codable` với `CodingKeys` snake_case, `author:profiles(display_name)` nhúng, mutate cục bộ lạc quan, `ErrorText.vi(error)` dịch lỗi. `ConversationStore` **copy pattern này**, không phát minh kiến trúc mới (DRY).
- **`Conversation`/`ChatMessage` hiện tại là DTO cho prototype** (dùng `Color`, `emoji`, `avatarBg`, `id: String` kiểu "naobo"). Bảng thật dùng `uuid`, `kind`, `is_broadcast`, `last_message_at`. → Cần DTO mới khớp DB; **không nhồi field DB vào struct prototype** (nó gánh màu sắc/emoji UI).
- **`ErrorText.vi` đã xử lý `slow_mode`** (QAStore.swift:257) → dùng lại, chat gửi nhanh sẽ báo "chờ 2 giây" đúng tiếng Việt.
- **Unread không cần bảng read-state per-message** — `last_read_at` trên `channel_members` (quy tắc scale #4). Unread = `count(messages where created_at > last_read_at)`.
- **Realtime `postgres_changes` không scale quá vài trăm subscriber** (plan.md §Scale). Nhưng đây là quyết định **client-side đổi được sau** → v1 dùng `postgres_changes`, KHÔNG dựng Broadcast infra bây giờ (YAGNI). Ghi chú rõ để phase sau biết đòn bẩy.

## Requirements

**Chức năng**
1. Danh sách hội thoại: kênh user tham gia + kênh public, sắp theo `last_message_at desc`, lọc KÊNH/NHÓM/1-1, badge chưa đọc.
2. Chat detail: nạp 50 tin mới nhất (keyset), cuộn lên nạp thêm, gửi tin thật.
3. Realtime: tin mới của người khác hiện ra không cần refresh.
4. Unread: mở chat → cập nhật `last_read_at`; badge số chưa đọc đúng.
5. `is_broadcast`: kênh phát → ẩn ô nhập (RLS enforce thật, client chỉ ẩn UI).
6. Block: chặn user → không thấy tin của họ. Report: báo cáo tin/user → ghi `reports`.
7. Swipe action (đã có UI ở 03a): Đã đọc → `last_read_at=now()`; Tắt thông báo → `muted_until`; Rời khỏi → xoá `channel_members` row.
8. Pull-to-refresh → refetch thật (thay `sleep(600ms)` ở AppState:277).

**Phi chức năng**
- Keyset pagination, không OFFSET (quy tắc scale #2).
- Mutate lạc quan cho tin gửi đi (hiện ngay, không chờ round-trip).
- File < 200 dòng: tách `ConversationStore` khỏi view; store có thể chia `ConversationStore` (list) + phần chat trong cùng file nếu < 200 dòng, không thì tách `ChatMessageStore`.

## Architecture — luồng dữ liệu

```
ConversationListView ─┐
                      ├─ ConversationStore (@Observable, khuôn QAStore)
ChatDetailView ───────┘        │
                               ├─ loadChannels()   → channels + membership + unread
                               ├─ loadMessages(channelId, before: cursor)  → keyset 50
                               ├─ send(channelId, body)  → insert messages (lạc quan)
                               ├─ markRead / mute / leave → channel_members
                               ├─ block(userId) / report(target)
                               └─ subscribe(channelId)  → Realtime postgres_changes
                                        │ INSERT trên messages (RLS lọc theo subscriber)
                                        ↓ append vào messagesByChannel, lọc blocked

RLS (0017): messages_read (thành viên/public) · messages_insert (thành viên + không broadcast|mod)
            · slow-mode trigger 2s · members_self_update (last_read_at, mute)
```

**Đổi ở view:** `ConversationListView`/`ChatDetailView` nhận `ConversationStore` thay vì đọc `AppState.conversations`. `AppState` bỏ `messages`/`conversations`/`unreadOverrides`/`mutedChannels`/`leftChannels`/`send`/`refresh`/`markRead`/`toggleMute`/`leave` (chuyển sang store).

## Related code files

**Tạo:**
- `apps/nodie-ios/NODIE/Features/Conversations/ConversationStore.swift` — store (khuôn QAStore)
- `apps/nodie-ios/NODIE/Features/Conversations/ConversationModels.swift` — DTO khớp DB (`ChannelRow`, `MessageRow`, `NewMessage`, `NewReport`, `NewBlock`)
- `apps/nodie-ios/NODIEUITests/ConversationsWireUITests.swift`

**Sửa:**
- `apps/nodie-ios/NODIE/AppState.swift` — gỡ phần hội thoại mock (82/86-88/105-134/162-171/268-278)
- `apps/nodie-ios/NODIE/Shell/RootTabView.swift` — thêm `@State private var conversations = ConversationStore()`, truyền vào 2 view
- `apps/nodie-ios/NODIE/Features/Conversations/ConversationListView.swift` — đọc store
- `apps/nodie-ios/NODIE/Features/Conversations/ChatDetailView.swift` — đọc store, Realtime lifecycle, block/report menu (nút `ellipsis` header dòng 83 hiện chết)
- `apps/nodie-ios/NODIE/Features/Conversations/ConversationRowView.swift` — nhận DTO mới

**Không đụng:** `Models/Conversation.swift` giữ cho tới khi Feed/Journey cũng wire (chúng còn xài). Hoặc tách struct chat sang file mới, để `Conversation` prototype lại cho Feed. **Quyết định lúc code:** nếu chỉ Conversations view đổi thì DTO mới ở `ConversationModels.swift`, struct cũ chỉ còn Feed/Journey tham chiếu.

## Implementation steps

1. **DTO** (`ConversationModels.swift`): `ChannelRow(id, slug, title, kind, isBroadcast, lastMessageAt, unreadCount)`, `MessageRow(id, channelId, userId, body, createdAt, author: AuthorRef)`, payload `NewMessage`, `NewReport`, `NewBlock`. Dùng lại `AuthorRef`/`RelativeTime` từ `QAModels.swift` (DRY).
2. **`ConversationStore`** — copy khung QAStore:
   - `loadChannels()`: query `channels` (RLS lọc), join `channel_members` của mình lấy `last_read_at`/`muted_until`. Unread: query đếm riêng `messages` theo `channel_id` + `created_at > last_read_at`, hoặc RPC gộp (xem Rủi ro #4). V1 chấp nhận N+1 nếu ít kênh — **đo trước, tối ưu sau** (YAGNI).
   - `loadMessages(channelId, before:)`: `.lt("created_at", cursor).order(desc).limit(50)`, đảo lại để hiển thị.
   - `send(channelId, body)`: insert lạc quan; lỗi slow_mode → gỡ tin lạc quan + `ErrorText.vi`.
   - `markRead/mute/leave`: update/delete `channel_members`.
   - `block(userId)`: insert `blocks`; lọc `messagesByChannel` bỏ tin user đó ngay.
   - `report(targetType, targetId, reason)`: insert `reports`.
3. **Realtime** — `subscribe(channelId)`: `client.channel("room:\(id)").onPostgresChange(InsertAction.self, table: "messages", filter: "channel_id=eq.\(id)")`. `.onAppear` subscribe, `.onDisappear` unsubscribe. Tin của **chính mình** đã có (lạc quan) → khử trùng theo `message.id`. Tin từ user bị block → lọc bỏ.
4. **View**: `ConversationListView` render `store.channels`; `ChatDetailView` render `store.messages(for:)`, `.task { await store.loadMessages(...) ; await store.markRead(...) }`, `.onAppear/.onDisappear` cho subscription. Nút `ellipsis` (header dòng 83) → Menu: "Báo cáo", "Chặn người này" (chỉ DM).
5. **`is_broadcast`**: `store.canPost(channelId)` = `!channel.isBroadcast` (hoặc là mod). Giữ nhánh khoá ô nhập của `ChatDetailView` (dòng 123-132).
6. **Gỡ mock khỏi `AppState`**: xoá các member hội thoại; đảm bảo Feed/Journey không tham chiếu (đã kiểm: Feed dùng `MockData.attracted`, Journey dùng `MockData.projections` — độc lập).
7. **Build + test**: `xcodegen generate` + `xcodebuild … build`. UI test wire.

## Todo list

- [ ] `ConversationModels.swift` — DTO khớp DB, tái dùng AuthorRef/RelativeTime
- [ ] `ConversationStore.swift` — loadChannels/loadMessages/send/markRead/mute/leave/block/report
- [ ] Realtime subscribe/unsubscribe theo lifecycle + khử trùng + lọc blocked
- [ ] Sửa 3 view đọc store
- [ ] Menu Báo cáo/Chặn ở header ChatDetail
- [ ] Gỡ phần hội thoại mock khỏi AppState
- [ ] `xcodegen generate` + build sạch
- [ ] UI test: gửi tin → thấy · unread giảm khi mở · broadcast ẩn ô nhập · block giấu tin
- [ ] Đối chiếu psql: tin vào bảng, `last_message_at` cập nhật, `last_read_at` cập nhật

## Success criteria

- Danh sách hội thoại hiện **kênh seed thật** (không MockData), sắp theo `last_message_at`
- Gửi tin → `select … from messages order by created_at desc limit 1` khớp; `last_message_at` của channel cập nhật (trigger)
- Mở tài khoản thứ 2 (hoặc psql insert) gửi tin → Realtime đẩy về máy 1 **không refresh** · `testRealtimeDeliversIncoming` (hoặc verify tay có ghi lại)
- Mở chat có N chưa đọc → badge = N; mở xong → 0; `last_read_at` cập nhật trong DB
- Kênh `thongbao` (broadcast) → ô nhập bị khoá; **thử insert qua PostgREST bằng tài khoản thường bị RLS từ chối** (đối chiếu: không chỉ ẩn UI)
- Chặn user → tin của họ biến mất; `blocks` có row
- Báo cáo tin → `reports` có row `status='open'`
- Build sạch không warning; test cũ (auth/gesture/QA) không hỏng

## Risk assessment

| # | Rủi ro | Xác suất × Tác động | Giảm thiểu |
|---|---|---|---|
| 1 | **Slow-mode 2s phá test gửi nhanh.** Test gửi 2 tin liên tiếp cùng user/kênh → tin 2 bị `raise exception`. | Cao × Trung | Test chèn chờ > 2s giữa 2 lần gửi, HOẶC test mỗi lần 1 tin. Ghi rõ trong test tại sao có `sleep`. Không gỡ trigger. |
| 2 | **RLS default-deny + chưa join kênh = list rỗng.** User mới chỉ thấy kênh `public`; group/dm phải là thành viên. | Cao × Cao | Phase 01 seed đã cho admin vào kênh. Với user thường: cần luồng "tham gia kênh" (members_self_join cho phép self-join public). V1: hiện mọi kênh public + cho join; DM tạo khi cần. |
| 3 | **Realtime cần bật publication + RLS-on-realtime.** `postgres_changes` chỉ đẩy khi table nằm trong `supabase_realtime` publication VÀ RLS cho phép subscriber đọc. Chưa bật → subscribe im lặng không nhận gì. | Cao × Cao | Phase 01 hoặc đây: `alter publication supabase_realtime add table public.messages;`. Verify: `select * from pg_publication_tables where pubname='supabase_realtime';`. Đây là bước DB, không phải code Swift. |
| 4 | Đếm unread N+1 query (mỗi kênh 1 query) → chậm khi nhiều kênh | Trung × Trung | V1 ít kênh → chấp nhận. Đòn bẩy: RPC `unread_counts()` trả `(channel_id, count)` một lượt. Không làm sớm (YAGNI) — ghi nợ. |
| 5 | `postgres_changes` không scale > vài trăm subscriber (plan.md) | Thấp giờ × Cao sau | **Client-side, đổi được sau.** V1 dùng postgres_changes. Ghi chú lever = Realtime Broadcast. KHÔNG dựng bây giờ. |
| 6 | Realtime đẩy trùng tin của chính mình (đã có bản lạc quan) | Trung × Thấp | Khử trùng theo `message.id` khi append |
| 7 | Tin từ user bị block vẫn tới qua Realtime (RLS không biết block) | Trung × Trung | Lọc client-side theo `blocks` set; ghi nợ: enforce block ở `messages_read` policy (server) nếu cần chặt |
| 8 | Gỡ mock khỏi AppState làm hỏng Feed/Journey nếu chúng dùng chung | Thấp × Trung | Đã kiểm: Feed=`MockData.attracted`, Journey=`MockData.projections`, độc lập `conversations`/`messages`. An toàn. |

**Rollback:** Store + DTO là file mới; view đổi có thể revert bằng git (nhưng nodie-ios chưa track — commit trước khi lớn). AppState gỡ mock là thay đổi lớn nhất → commit riêng "wire conversations store" để revert gọn. Không đụng schema nên rollback không chạm DB.

## Security considerations

- **`is_broadcast` phải verify enforce ở RLS, không chỉ ẩn UI.** Test: đăng nhập tài khoản thường, gọi PostgREST insert vào kênh broadcast → phải nhận lỗi RLS. Đây là điểm plan.md cảnh báo ("ai cũng POST được qua API").
- **Block chỉ client-side ở v1** → user bị chặn vẫn có thể đọc tin mình qua API. Chấp nhận cho v1 (block = "tôi không muốn thấy"), ghi nợ nếu cần chặn hai chiều.
- DM (`kind='dm'`) chỉ 2 người — RLS `is_channel_member` lo. Verify: tài khoản thứ 3 không đọc được DM.
- Không log nội dung tin ra console ở Release.
- `report` không cho user đọc lại reports người khác (RLS `reports_admin_read`) — đúng.

## Next steps

Mở khoá phase 04b (APNs push — cần message insert thật để trigger push). Sau đó phase 05.

## Unresolved questions

1. **Luồng "tham gia kênh" cho user thường** chưa có UI. V1 tự động cho thấy + join mọi kênh public, hay có màn khám phá kênh? (Đăng chốt "chỉ admin tạo nhóm" nhưng chưa nói user *khám phá/join* thế nào.)
2. **Tạo DM 1-1**: nút soạn tin mới (`ConversationListView` dòng 87-95 hiện TODO) cần màn chọn người nhận → cần đọc danh sách user (bảng nào? `profiles` — RLS cho đọc display_name của người khác chưa?). Có thể tách thành phase riêng nếu phình.
3. **Realtime publication** bật ở phase 01 hay 04? Đề xuất phase 01 (cùng lúc áp schema) — nhưng cần Đăng/quyền DB owner xác nhận `alter publication` chạy được với `SUPABASE_DB_URL`.
4. Media trong DM (ảnh/audio — plan.md quyết định #2) **ngoài scope phase này**? Đề xuất có, để phase riêng (cần Storage/R2 + moderation). Xác nhận.
5. Gửi tin có cần chống gửi khi offline (queue + retry) không, hay báo lỗi mạng là đủ cho v1? Đề xuất: báo lỗi (`ErrorText.vi` đã có), không queue (YAGNI).
