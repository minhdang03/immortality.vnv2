# Report: chat disk cache + realtime cấp store + thumbnail — code xong, kẹt gate

Plan: `plans/260719-0023-chat-disk-cache-store-realtime-image-thumbs/`

## Kết quả

Cả 3 phase CODE XONG, build xanh, code-review xong, fixes áp hết. Còn thiếu DUY NHẤT: gate
`run-uitest-gate.sh 3` — bị kill từ ngoài 3 lần liên tiếp (00:54 session limit; 2:34 và 2:47
nghi phiên Claude khác tranh máy, load vọt ~10). Đã dừng retry sau lần 3, chờ Đăng quyết.

## Đã làm

**Phase 1 — GRDB disk cache** (mới: `ChatDiskCache.swift`; sửa: project.yml + 6 file):
- SQLite (GRDB 7) tại Application Support, payload = JSON blob của ChannelRow/MessageRow,
  200 tin/kênh, exclude backup, wipe theo owner_uid + khi signOut.
- `warmFromDisk()` (RootTabView) vẽ danh sách + badge từ đĩa ngay khi mở app;
  `loadCachedMessages()` (ChatDetailView) hiện 50 tin trước khi mạng về. Server luôn thắng.
- `hasSyncedChannels` thay điều kiện `channels.isEmpty` ở ConversationListView.

**Phase 2 — Realtime cấp store** (`ConversationStoreRealtime.swift` viết lại):
- MỘT subscription postgres_changes INSERT toàn bảng messages, RLS/WALRUS lọc per-subscriber.
  Verify prod psql: publication có `messages` ✓; policy `messages_read` = public/feed + member ✓.
- handleIncoming: nổi kênh + badge + fetchNewMessages + markRead nếu đang mở kênh đó.
- scenePhase: về từ `.background` thật mới resubscribe + fetch bù (cờ `wasInBackground`).
- Bỏ hẳn per-channel subscribe/unsubscribe; ChatDetailView chỉ set `visibleChannelId`.

**Phase 3 — Thumbnail** (ChatMediaStorage/SignedURLCache/ChatRemoteImage/ChatDetailView):
- Bubble ký URL transform width=464 `resize:"contain"` quality=75; viewer giữ bản gốc.
- Đo prod thật: 1536×2048 754KB → 464×619 50KB (~15×). **Bẫy tìm ra khi đo: thiếu
  `resize:contain` thì Storage giữ nguyên chiều cao → 464×2048 méo.** Transform ĐANG BẬT trên prod.
- Cache key biến thể `#w464` ở cả SignedURLCache + ChatImageCache. Fallback per-ảnh
  (`useOriginal`), không cờ toàn phiên.

**Code-review (subagent) 9 findings — xử lý:**
- P1#1 stale index sau sort/await → tra theo id, chụp isMember trước await. FIXED
- P1#2 double-subscription cold start → gán guard TRƯỚC await + identity check + cold start
  chỉ mở qua `.task`. FIXED
- P1#3 mutation off-main → @MainActor cho 5 hàm realtime (tiền lệ uploadPending). FIXED
- P2#4 blocked sender bump badge → guard isBlocked đầu handleIncoming. FIXED
- P2#5 kill-switch transform toàn phiên đổ oan → bỏ cờ global, fallback per-request/per-ảnh. FIXED
- P2#6 đập socket khi kéo Notification Center → cờ wasInBackground. FIXED
- P3#8 clear() không đóng DB queue → đóng. FIXED
- P3#7 createdAt client-clock persist (tự lành khi mở chat) + P3#9 đĩa lưu bản đã lọc blocked
  từ fetchNewMessages (accessor vẫn lọc đọc) → CHẤP NHẬN, ghi chú trong plan.md.

## Còn lại

1. **Gate UITest 3/3** — máy đang bị phiên khác tranh; code sẵn sàng, chỉ cần chạy
   `./scripts/run-uitest-gate.sh 3` khi máy rảnh (load<8, không phiên nào khác build iOS).
2. Verify tay 2 tài khoản user trên 2 simulator (nghiệm thu phase 2: badge nhảy khi đứng ngoài,
   background 30s rồi quay lại thấy tin bù) — gate không phủ được kịch bản 2 máy.
3. Commit: CHƯA — working tree đang trộn thay đổi của phiên khác (QA/Friends/xcstrings...),
   cần Đăng chốt cách tách (commit riêng file chat? chờ phiên kia xong?).

## Đợt 2 (19/07 ~04:00–04:20, sau lệnh "bỏ gate đi cook tiếp")

**Phase 4 — reaction/sửa/xoá live:** 4 stream mới trên cùng channel `room:messages`
(UPDATE messages, INSERT/DELETE message_reactions), task đơn → mảng 5 task. Sửa/xoá của
người khác vá tại chỗ; reaction mutate local không round-trip (PK composite chở đủ dữ liệu
trong DELETE old_record — verify prod).

**Phase 5 — "Đã xem" DM:** migration 0041 (channel_members vào publication, đã áp prod) +
`dmPeerLastRead` nạp cùng chuyến resolveDMTitles + stream UPDATE channel_members. Nhãn
"Đã xem/Đã gửi" chỉ trên tin cuối của mình trong DM. i18n: 2 key splice tay × 8 ngôn ngữ
(build CLI không tự sync catalog — tái xác nhận bẫy 18/07).

**Review đợt 2 (9 findings):** P1 last_read_at theo đồng hồ máy người đọc → **migration 0042**
trigger ép `now()` (áp prod, verify thật: đẩy 2030 → clamp về now; side effect: 1 hàng
channel_members bị chạm khi test, badge user đó reset 0). P2 markRead khuếch đại event kênh
đông → throttle 10s (DM vẫn per-message). P2 rollback toggleReaction clobber reaction realtime
→ hoàn tác phẫu thuật trên trạng thái hiện tại. P2 resolveDMTitles ghi đè mốc tươi → merge max.
Chấp nhận có ghi chú: echo flicker toggle nhanh ON→OFF (~1 RTT, trạng thái cuối đúng), xoá tin
chưa đọc không trừ badge (tự lành lần loadChannels), tin cuối đang upload không mang nhãn.

## Đợt 3+4 (19/07 ~04:21–04:55, mandate "cook tiếp chuẩn IG/Messenger")

**Phase 6 — typing indicator:** MỚI ConversationStoreTyping.swift — Broadcast topic
`typing:{channelId}` (lần đầu dùng Broadcast; KHÔNG chạm DB), throttle gửi 3s, TTL nhận 5s,
tự tắt khi tin thật đến, payload kèm channel_id chống event kênh cũ dequeue muộn.
myDisplayName bơm từ AuthStore qua RootTabView. Nợ ghi: broadcast không RLS (topic đoán được
nếu biết channelId — chỉ lộ "ai đang gõ", chờ đợt private-channel Broadcast tổng).

**Phase 7 — hàng đợi offline:** send() fail vì .offline → bubble Ở LẠI "Đang chờ mạng…" (bấm
được = flush tay) + vào queue THỨ TỰ; flush khi: mạng về (NWPath), foreground resume, mở chat.
23505 = đã gửi. Xoá tin queued = xoá local + gỡ queue (không để flush gửi tin đã xoá); sửa/
reply/react trên tin queued bị chặn từ cửa. QueuedText giữ row để reattach sau loadMessages
replace (bug tự bắt trước khi review xác nhận).

**Phase 8:** ẩn reaction + typing của người bị chặn (quyết theo mandate chuẩn IG — đóng P2-4
đợt 2). Lọc một điểm ở accessor messages(for:), early-out khi chưa chặn ai (perf).

**Phase 9 — link preview:** MỚI ChatLinkPreviewCard.swift — LPMetadataProvider (timeout 8s),
cache actor cùng khuôn SignedURLCache (nhớ cả failed, chặn 80 entry), card tự vẽ theo tông
Nodie (không LPLinkView). URL http(s) đầu tiên, chỉ tin không media. Nợ ghi: fetch phía người
đọc → site thấy IP người đọc (tradeoff kiểu iMessage; sender-side metadata là bản sau).

**Phase 10 — vạch "Tin chưa đọc":** trước tin đầu tiên của người khác mới hơn me.lastReadAt,
chụp 1 lần trước markRead, guard badge local >0 chống vạch oan khi mốc kênh chưa refresh.

**Review đợt 3 (12 findings):** 3 P1 quanh vòng đời queue — xoá-vẫn-gửi (FIXED), queue kẹt khi
lỗi timeout xếp loại offline mà NWPath satisfied (FIXED: 3 trigger flush + tap label), bubble
queued bị loadMessages nuốt (FIXED trước khi review về). P2: typing task-cancel mồ côi (FIXED
guard isCancelled), typing thiếu channel_id (FIXED), accessor O(n²) (FIXED early-out),
react/reply tin queued FK nổ (FIXED chặn cửa). Chấp nhận: lastTypingSentAt toàn cục (chuyển
chat <3s nuốt 1 tín hiệu đầu), queue RAM-only mất khi kill app (nhất quán pendingMedia).

i18n: 6 key mới splice tay đủ 8 ngôn ngữ (build CLI không sync catalog — bẫy đã ghi memory).

## Đợt 5 (19/07 ~04:47 đêm + 12:26–12:45 trưa)

**Phase 11 — Chuyển tiếp tin:** menu "Chuyển tiếp" → ForwardMessageSheet (targets = canPost,
khoá double-tap, alert lỗi TẠI sheet — alert gốc cây nằm dưới sheet không bung được). Text đi
send() (hưởng offline queue); media `storage.copy` sang path kênh đích (policy 0024 đọc quyền
từ đường dẫn — verify policy text + copy end-to-end trên prod bằng HTTP). Policy xác nhận:
forward tin NGƯỜI KHÁC hợp lệ (path mới mang uid mình, SELECT nguồn chỉ cần membership).

**Phase 12 — Tìm kiếm tab Chat:** field custom + debounce 300ms; kênh lọc local, tin nhắn
ILIKE server (escape %/_/\\, limit 30, lọc blocked) — tìm được cả lịch sử ngoài cache. Ghi
nợ: `*` là wildcard PostgREST không escape được (comment tại chỗ); pg_trgm index khi messages
lớn; chưa jump-to-message.

**Phase 13 — Polish tốc độ (mandate "mượt như WhatsApp/Zalo"):** diệt O(n²) mỗi khung hình ở
ChatDetailView (mỗi row gọi lại accessor messages ~4 lượt × mỗi phím gõ) — chụp rows +
parentById dict + statusId một lần mỗi render; ảnh `byPreparingForDisplay()` decode off-main
trước khi cache (hết khựng khi cuộn tới ảnh mới).

**Review đợt 5 (DONE, không P0):** P1 forward lỗi câm vì alert dưới sheet → FIXED (alert cục
bộ + clearError). P2 forward offline vào kênh chưa mở đầu độc guard cache đĩa (mở kênh chỉ
thấy 1 dòng, mất lịch sử tạm) → FIXED (`hasOnlyLocalRows`). P2 search: empty-state nói dối
lúc đang tìm + kết quả cũ đè mới → FIXED (searchInFlight + cancel-check sau await). Reviewer
xác nhận phase 13 "logic bit-for-bit với bản cũ", không stale-UI. Chấp nhận: orphan file khi
copy-OK-insert-fail (triết lý sẵn có), sheet Huỷ khi đang bay vẫn gửi (Messenger cũng vậy).

## Đợt 6 (19/07 ~14:11–14:30) — lần đầu áp định tuyến Opus-gõ/Fable-review

**Phase 14 — dải phân cách ngày:** chip "Hôm nay/Hôm qua/12 thg 7" giữa các nhóm tin khác
ngày (code timeLabel đã giả định nó tồn tại nhưng chưa có). **Opus gõ** Swift (firstOfDayIds
O(n), dayDivider chip, formatter static), **Fable** review + splice 2 key i18n + build.

**Phase 15 — nút cuộn-xuống-đáy:** chevron.down tròn hiện khi cuộn lên mà không có tin mới
(giữ pill "N tin mới" khi có). **Opus gõ**, Fable review + splice "Xuống cuối" + build. Kèm
xoá comment xcstrings lỗi thời.

**Verify trước tiết kiệm 2 phase:** reply-swipe cho media THỰC RA đã chạy (replyDrag gắn trên
`bubble` bao cả media); 6 key bubble-menu đã có sẵn trong catalog. Không làm lại.

**Định tuyến chứng minh hiệu quả:** 2 phase spec-rõ Opus gõ sạch, không phải sửa code khi
review; Fable chỉ lo điều phối + i18n splice (vùng bẫy) + build + verify. Chi phí thấp hơn hẳn
đợt Fable-toàn-bộ, chất lượng không đổi. Xem memory feedback_model_routing_*.

## Đợt 7 (19/07 ~14:27–15:00) — 3 món lớn Fable

**Phase 16 — video:** Kind .video + posterPath. ChatVideoProcessor (PickedMovie Transferable
→ poster off-main qua AVAssetImageGenerator, áp preferredTransform cho video dọc). Dual upload
(poster piggyback pendingMedia, hỏng không chặn video). ChatVideoViewer (AVPlayer stream signed
URL). videoBubble poster+play+thời lượng. Forward copy CẢ poster + dựng media tường minh (fallback
replacingPath giữ poster cũ = thumbnail hỏng cho người đích — em tự bắt). Trần 25MB, không re-encode (nợ).

**Phase 17 — mention @:** popup gợi ý thành viên khi gõ @ cuối chuỗi, chèn @tên, render tô @tên
khớp member → link nodie://mention/{uid}, tap mở hồ sơ (route .member sẵn có). Phải tách
messageBubble() helper vì body làm type-checker SwiftUI timeout.

**Phase 18 — jump-to-message:** openChat(scrollTo:) + pendingScrollTarget. loadWindow keyset 2
chiều (pivot created_at, lte desc 25 + gt asc 25), guard chứa target, reattach pending. onChange
cuộn tới + flash 1.2s.

**Review đợt 7 (DONE, không P0) — xử hết:**
- P1 video đọc cả file vào RAM TRƯỚC check cỡ (OOM clip GB) → FIXED: check fileSize từ metadata
  trước Data(contentsOf:)/poster-gen.
- P2 mention khớp giữa từ (@Bo trong @Bobby → tap nhầm người) → FIXED: guard ranh giới từ sau match.
- P2 mention render cost kênh đông → FIXED: early-out `guard raw.contains("@")`.
- P2 loadWindow ghi đè cache đĩa "mới nhất" bằng lát giữa → FIXED: window chỉ sống RAM, không ghi đĩa.
- P2 scroll target phụ thuộc thứ tự onChange → FIXED: cờ jumpingToTarget chặn cuộn-đáy oan.
Chấp nhận (nợ ghi): temp file video local ≤25MB/lần tap (OS purge tmp); jump tin rất cũ không
load-newer trong phiên (mở lại kênh phục hồi); offline gửi video giữ videoData+posterData RAM.

## Unresolved questions

- **P2-4 (cần Đăng quyết):** người bị CHẶN thả reaction — hiện đếm vẫn nhảy live trên màn mình
  (lỗ chung cả đường load lẫn realtime, không riêng phase này). Chặn có nghĩa là ẩn cả reaction
  không? Nếu có: lọc một lần ở tầng hiển thị `reactionCounts` (truyền blockedUserIds vào), cả
  hai đường hưởng.
- Verify 2 tài khoản trên 2 simulator cho cả 5 phase (badge live, Đã xem đổi live) — chưa chạy
  được vì máy bị tranh; UITest gate đã BỎ theo lệnh Đăng.
- Commit: working tree vẫn trộn thay đổi phiên khác — chờ Đăng chốt cách tách.
