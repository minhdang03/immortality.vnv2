# NODIE Full-Stack Completeness Audit — 260720

3 code-reviewer agents song song: Chat iOS, QA/Friends/Profile/Auth iOS, Supabase backend. Working-tree state (gồm perf changes chưa commit — đều sound). Advisory only, chưa sửa gì.

**Tổng: 5 P0 · 15 P1 · ~22 P2.** Nền code tốt hơn production Swift trung bình (optimistic/offline handling, rollback surgical, dedup client-ID, disk cache discipline) nhưng CHƯA hoàn thiện — 5 P0 phải vá trước khi mở rộng user / TestFlight kế tiếp.

## P0 (5)

| # | Mảng | Lỗi | Vị trí | Fix |
|---|---|---|---|---|
| B1 | Backend RLS | `members_self_update` không khoá cột `role` → user tự nâng mod: xoá tin người khác, post vào kênh thongbao (giả thông báo chính thức + push toàn kênh) | 0017:207-208 | BEFORE UPDATE trigger pin `role` (pattern 0032 `tg_profiles_guard_role`) |
| B2 | Backend RLS | Cùng policy không khoá `channel_id` → rebind membership chui vào DM/nhóm bất kỳ, bypass `create_dm` | 0017:207-208 | Cùng trigger, freeze `channel_id`/`user_id`; chỉ `last_read_at`/`muted_until` mutable |
| C1 | Chat iOS | Xoá tin khi media đang upload → task upload INSERT lại → tin "sống lại" và đến người nhận | ConversationStore.swift:920-946 | `deleteMessage` xử lý `pendingMedia`: cancel upload + discardMedia, không gọi server |
| C2 | Chat iOS | Rớt websocket khi app foreground (wifi→LTE, thang máy) → tin missed không bao giờ recover tới khi background/pull-refresh | ConversationStoreRealtime.swift:28-89 | Observe channel status; on re-`.subscribed` chạy catch-up như `resumeFromForeground` |
| Q1 | Auth/Push | `PushManager.removeToken()` 0 caller — sign-out xong device cũ vẫn nhận push nội dung tin nhắn (leak trên máy dùng chung) | PushManager.swift:123-126, AuthStore.swift:185-204 | Gọi `removeToken()` TRƯỚC `client.auth.signOut()` (RLS cần session sống) |

## P1 chọn lọc (15)

**Chat:** pagination cuộn-lên chưa nối dây (`loadMessages(before:)` 0 caller — không đọc được quá 50 tin!) · search-jump fail → màn hình trắng vĩnh viễn · deep-link vào DM trước khi channels load → hiện banner "🔒 admin-only" sai · background app giữa lúc ghi âm → mất voice note im lặng · catch-up cursor lấy từ optimistic row stamp giờ device → lệch giờ là skip tin peer.

**Backend:** `messages_update_own` cho sửa `channel_id`/`created_at` (future-date → badge unread kẹt vĩnh viễn toàn kênh) · `answers_update_own` không revoke cột → tự PATCH `vote_count=9999, is_best=true` · `create_dm` race → 2 kênh DM trùng cặp (fix: advisory lock 1 dòng) · `channels_insert_dm` policy thừa cho phép spam kênh orphan + giả `created_by`.

**QA/Auth:** `QAStore`/`AuthStore` thiếu `@MainActor` (mutate UI state off-main — SE-0338 trap FollowStore đã document) · câu hỏi mình đã xoá "sống lại" trong Đã lưu (bẫy 0034: embed thiếu filter `deleted_at`, đã đoán trước trong memory) · double-tap ▲/☀ không in-flight guard → count lệch hoặc alert 409 · swipe-to-delete trong "Của tôi" là dead UI (ScrollView không phải List) · xoá reply cha → con của NGƯỜI KHÁC biến mất vĩnh viễn (flatten không walk orphan; cần tombstone "đã xoá" kiểu Reddit/FB) · `deleteAccount()` bỏ qua bước wipe disk cache mà `signOut()` có.

## P2 đáng nhớ

Edge fn: `Promise.all` → 1 token hỏng giết cả batch (→ `allSettled`); chỉ 410 dọn token, thiếu `BadDeviceToken`; select cap 1000 rows → kênh lớn member sau không nhận push. `is_blocked_pair` cho probe quan hệ block người thứ 3. `nodie_unread_counts` unbounded → chậm ở ~1000 user. Ledger `_applied_migrations` đã vỡ kỷ luật (0041/0042 thiếu). `device_tokens` PK=token → đổi user cùng máy: đăng ký fail im lặng, push user cũ sang user mới. Chat: temp-file leak (video/voice), `messagesByChannel` unbounded, edit không optimistic, keyboard không pin bottom, search lỗi hiện như "không có kết quả". QA: "Hay nhất" không bỏ đánh dấu được (RPC chỉ set), empty-state nói dối khi lỗi mạng, flatten không guard cycle → crash, sign-out offline strand user.

## Điểm sáng đã verify

pg_net fail KHÔNG chặn insert tin · muted/blocked KHÔNG leak nội dung lên Apple · storage chat-media policy khớp messages RLS, bucket private · `delete_account` cascade đúng, "Ẩn danh" đúng design · index hot-path đủ · dedup duplicate-key client-ID sound · perf changes chưa commit (LazyVStack, flatReplies didSet, static DateFormatter, emitLocalSessionAsInitialSession) đều đúng.

## Thứ tự vá đề xuất

1. **Migration RLS pin-trigger** (B1+B2+messages+answers revoke — 1 file, pattern 0032). Model: Fable (vùng bẫy RLS-prod, dry-run rollback trước).
2. **iOS trust batch**: C1, Q1, C2. Fable review, Opus gõ được nếu có spec.
3. **Pagination cuộn-lên** + search-jump fallback + deep-link 3-state. Opus.
4. `create_dm` lock + drop `channels_insert_dm` + edge fn allSettled/BadDeviceToken. Opus, Fable verify migration.
5. P1 QA batch (@MainActor, 0034 embed, in-flight guard, tombstone reply). 
6. P2 hygiene trước mốc 1000 user (trùng lộ trình scale đã có).

## Unresolved questions

- `push-on-message` deploy có `verify_jwt` tắt không, shared secret có set trên prod? (backend agent không connect prod)
- APNs payload chứa body tin nhắn (ảnh hưởng mức độ Q1) — cần đọc index.ts xác nhận, backend agent ngụ ý có.
- supabase-swift có replay missed postgres_changes khi rejoin không — cần test device 2 phút (airplane mode 30s foreground) để chốt C2.
- Dynamic Type: bubble ảnh/voice fixed width 232 — cần device pass, không chấm tĩnh được.
- Bucket chat-media có size/MIME limit ở dashboard config không (policy không có).
