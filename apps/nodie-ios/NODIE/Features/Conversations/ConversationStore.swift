import Foundation
import Supabase
import UIKit   // UIImage — ảnh xem trước của đính kèm đang gửi (xem `PendingMedia.preview`)

/// Nguồn dữ liệu Hội thoại — đọc/ghi Supabase qua RLS (0017), Realtime bật ở 0023.
/// Cùng khuôn `QAStore`: @Observable, DTO snake_case, mutate lạc quan, `ErrorText.localized`.
@Observable
final class ConversationStore {
    /// Không `private(set)`: `private` trong Swift bó theo FILE, mà ConversationStoreRealtime.swift
    /// (extension ở file khác) phải nổi kênh lên đầu khi có tin mới — cùng lý do với
    /// `messagesByChannel` bên dưới.
    var channels: [ChannelRow] = []
    private(set) var isLoading = false
    var errorMessage: String?

    /// Lỗi của lần NẠP danh sách kênh — view vẽ tại chỗ (message + Thử lại nếu đáng), cùng
    /// khuôn `FollowStore.loadError`. KHÁC `errorMessage`: đây là lỗi DANH SÁCH (chặn cả màn
    /// khi chưa có dữ liệu), còn `errorMessage` là lỗi THAO TÁC lẻ bắn alert gốc.
    private(set) var loadError: NodieErrorKind?

    /// Lỗi của lần NẠP TIN một kênh cụ thể — khoá theo kênh vì user có thể mở nhiều kênh
    /// trong một phiên, mỗi kênh lỗi độc lập với nhau. Chỉ có ý nghĩa khi kênh đó CHƯA có tin
    /// nào (`messages(for:).isEmpty`); refresh hỏng khi đã có tin thì giữ tin cũ, không chặn màn.
    private(set) var messageLoadErrors: [UUID: NodieErrorKind] = [:]
    func loadError(for channelId: UUID) -> NodieErrorKind? { messageLoadErrors[channelId] }

    /// Đã đồng bộ danh sách kênh với SERVER trong phiên này chưa. Là điều kiện `.task` của
    /// ConversationListView: từ khi có cache đĩa, `channels` hết rỗng TRƯỚC cả khi mạng chạy,
    /// nên "channels.isEmpty" không còn nói lên được chuyện đã sync hay chưa.
    private(set) var hasSyncedChannels = false

    /// Đính kèm chưa lên tới nơi, khoá theo id của tin.
    ///
    /// Đây là thứ cho phép bong bóng hiện trước khi upload xong: `MessageRow` trong
    /// `messagesByChannel` chỉ có metadata (path rỗng), còn bytes thật nằm ở đây. View tra
    /// vào đây để biết vẽ ảnh trong máy hay tải từ bucket, và để biết tin đang lên hay đã hỏng.
    private(set) var pendingMedia: [UUID: PendingMedia] = [:]

    /// Đang upload dở, khoá theo id tin. Không suy từ `PendingMedia.phase` được: `phase` là
    /// thứ VIEW đọc để vẽ, còn đây là khoá chống chạy chồng. Bấm "Gửi lại" hai lần trong một
    /// khung hình sẽ đẻ ra hai lượt upload cùng một tin → hai tệp, một INSERT trùng khoá,
    /// và bong bóng kẹt "hỏng" vĩnh viễn cho một tin ĐÃ gửi được.
    private var uploadsInFlight: Set<UUID> = []

    /// Task upload đang chạy, khoá theo id tin. Giữ HANDLE để huỷ được thật: xoá một tin
    /// đang upload phải chặn INSERT (uploadPending kiểm `Task.isCancelled` ngay trước khi
    /// ghi tin). Không giữ handle thì `discardMedia` chỉ quên `Data` còn task vẫn chạy tiếp
    /// và INSERT một tin người dùng tưởng đã xoá — tin "sống lại" tới cả người nhận.
    private var uploadTasks: [UUID: Task<Void, Never>] = [:]

    struct PendingMedia {
        enum Phase { case uploading, failed }
        var phase: Phase
        /// Bytes gốc — giữ để "Gửi lại" không bắt chọn ảnh lần nữa. Chỉ sống trong bộ nhớ:
        /// đóng app lúc đang gửi thì mất, và mất là đúng — chưa có tin nào trên server cả.
        let data: Data
        /// Ảnh đã giải mã sẵn (nil với tệp/thoại).
        ///
        /// Giải mã MỘT LẦN lúc xếp hàng, không phải mỗi lần vẽ: `UIImage(data:)` trên ảnh
        /// 2048px tốn ~30ms, mà thân view chạy lại mỗi khi có tin mới / thả cảm xúc / Realtime
        /// ho một tiếng. Sáu ảnh đang gửi × mỗi lần vẽ = giật main thread thấy rõ.
        let preview: UIImage?
        let ext: String
        let contentType: String
        /// Metadata đã dựng sẵn, chỉ thiếu `path` (điền sau khi upload xong).
        let media: MessageMedia
        let channelId: UUID
        let caption: String
        let parentId: UUID?
        /// Chính bong bóng lạc quan. Giữ ở đây để dựng lại được sau khi `loadMessages` quét
        /// sạch mảng tin (nó thay bằng dữ liệu server, mà tin này chưa lên server).
        let row: MessageRow
        /// Chỉ VIDEO (phase 16): bytes poster + đuôi của nó — video cần upload HAI tệp
        /// (poster tải nhanh cho bong bóng + video thật). nil với ảnh/tệp/thoại.
        var posterData: Data? = nil
        var posterExt: String? = nil
    }

    /// Không `private(set)`: `private` trong Swift bó theo FILE, mà ConversationStoreRealtime.swift
    /// (extension ở file khác) phải append tin mới vào đây. Cùng lý do với `errorMessage` ở QAStore.
    var messagesByChannel: [UUID: [MessageRow]] = [:]
    /// Cũng không `private(set)` — Realtime (file khác) bump unread khi tin đến kênh đang đóng.
    var unreadByChannel: [UUID: Int] = [:]

    /// Mốc `created_at` SERVER mới nhất đã thấy cho mỗi kênh — con trỏ catch-up của
    /// `fetchNewMessages`. KHÔNG lấy từ đuôi `messagesByChannel`: bong bóng lạc quan của
    /// chính mình đóng dấu GIỜ MÁY (`send`/`sendMedia` dùng `Date()`), device lệch giờ vài
    /// giây thì `gt(created_at, đuôi)` nhảy QUA tin peer trong khoảng lệch. `created_at`
    /// server (DB đóng băng, client không sửa được) là nguồn thời gian tin cậy duy nhất.
    /// Không `private`: `fetchNewMessages` ở ConversationStoreRealtime.swift đọc/ghi nó.
    var serverCursor: [UUID: Date] = [:]

    /// Ghi nhận mốc server mới nhất từ một lô tin SERVER vừa nạp. `max` nên jump-to-message
    /// (nạp cửa sổ giữa lịch sử) không kéo con trỏ TỤT về quá khứ.
    func advanceServerCursor(_ channelId: UUID, from rows: [MessageRow]) {
        guard let newest = rows.map(\.createdAt).max() else { return }
        serverCursor[channelId] = max(serverCursor[channelId] ?? .distantPast, newest)
    }

    /// Người mình đã chặn — lọc ở accessor, giống QAStore.
    var blockedUserIds: Set<UUID> = []

    let client = SupabaseClientProvider.shared
    private var uid: UUID? { client.auth.currentUser?.id }
    var currentUserId: UUID? { uid }

    private static let channelSelect =
        "id,slug,title,kind,is_broadcast,last_message_at,emoji,avatar_hex,badge_hex,created_by,channel_members(role,last_read_at,muted_until)"
    /// Không `private`: ConversationStoreRealtime.swift (file khác) phải dựng CÙNG shape khi
    /// nạp lại tin Realtime vừa đẩy về. Hai bản select lệch nhau là decode nổ — cùng lý do
    /// với `QAStore.questionSelect`.
    ///
    /// `!messages_user_id_fkey` là BẮT BUỘC, không phải cho đẹp: từ lúc nhúng thêm
    /// `message_reactions`, có HAI đường từ `messages` sang `public_profiles` —
    /// `messages.user_id` (tác giả) và đường vòng qua `message_reactions.user_id` (người thả).
    /// PostgREST không đoán, nó trả PGRST201 và toàn bộ tin nhắn không tải được.
    /// Nêu đích danh FK để nói rõ: tác giả, không phải người thả.
    // `metadata` PHẢI có mặt: `MessageRow.metadata` là optional nên thiếu cột này thì decode
    // vẫn "thành công" — ảnh/thoại chỉ sống qua Realtime, mở lại chat là thành bong bóng rỗng.
    // Bug im lặng tuyệt đối, đã dính một lần (17/07).
    static let messageSelect =
        "id,channel_id,user_id,parent_id,body,created_at,edited_at,pinned_at,pinned_by,metadata,author:public_profiles!messages_user_id_fkey(display_name),reactions:message_reactions(kind,user_id)"

    /// Kênh Realtime TOÀN CỤC — một subscription cho cả bảng `messages` + `message_reactions`
    /// + `channel_members`, không phải mỗi khung chat một cái. Không `private`:
    /// ConversationStoreRealtime.swift (file khác) quản vòng đời.
    var globalRealtimeChannel: RealtimeChannelV2?
    /// Mỗi stream (tin mới/sửa-xoá/reaction/đã-đọc) một task lắng riêng.
    var globalRealtimeTasks: [Task<Void, Never>] = []
    /// `last_read_at` của NGƯỜI KIA trong từng DM — nguồn của nhãn "Đã xem" (quy tắc scale #4:
    /// không bảng read-state per-message; đã xem = tin cũ hơn mốc đọc của họ).
    var peerLastRead: [UUID: Date] = [:]

    /// `last_seen_at` của NGƯỜI KIA trong từng DM (0052) — nguồn của "đang hoạt động /
    /// hoạt động X phút trước" ở header DM. Khoá theo channelId (DM 1-1 nên một peer/kênh).
    /// Nạp cùng resolveDMTitles.
    var dmPeerLastSeen: [UUID: Date] = [:]

    /// Lần xoá tin vừa rồi, còn hoàn tác được (khuôn giống QAStore.pendingUndo). Giữ nguyên
    /// các MessageRow đã gỡ để khôi phục cục bộ không phải refetch — và chỉ chứa tin ĐÃ lên
    /// server (xoá mềm), không chứa tin hàng-đợi/đang-upload (chúng bị gỡ hẳn, không có gì
    /// trên server để `deleted_at = null`).
    var pendingUndo: PendingUndo?
    struct PendingUndo: Identifiable, Equatable {
        let id = UUID()
        let channelId: UUID
        let rows: [MessageRow]
    }
    /// Chat đang MỞ trên màn — tin đến kênh này không bump unread (markRead lo), tin đến kênh
    /// khác thì bump. ChatDetailView set khi vào màn, xoá khi rời.
    var visibleChannelId: UUID?
    /// Lần cuối ĐÃ GỬI markRead lên server, theo kênh — cho realtime throttle (kênh đông,
    /// mỗi tin một UPDATE `channel_members` là tự khuếch đại event 0041 cho cả kênh).
    var lastMarkReadSentAt: [UUID: Date] = [:]

    /// Tin văn bản gửi lúc MẤT MẠNG — bubble ở lại trạng thái chờ, mạng về tự gửi theo đúng
    /// thứ tự (chuẩn WhatsApp). Mảng chứ không dict: thứ tự gửi là một phần của lời hứa.
    /// RAM-only, cùng quyết định với `pendingMedia`: đóng app lúc chưa lên server thì mất,
    /// và mất là đúng — server chưa từng biết tin này tồn tại.
    struct QueuedText {
        let payload: NewMessage
        let channelId: UUID
        /// Chính bong bóng lạc quan — cùng vai trò với `PendingMedia.row`: loadMessages thay
        /// cả mảng thì reattachPendingRows dựng lại được, không thì mở lại chat lúc offline
        /// là bubble chờ mạng biến mất trong khi hàng đợi vẫn sẽ gửi nó.
        let row: MessageRow
    }
    private(set) var queuedTexts: [QueuedText] = []
    /// Chống hai flush chạy chồng khi mạng chớp liên tiếp — chồng là tin đôi hoặc lệch thứ tự.
    private var isFlushingQueue = false

    func isQueued(_ messageId: UUID) -> Bool {
        queuedTexts.contains { $0.payload.id == messageId }
    }

    // MARK: - Typing (phase 06 — ConversationStoreTyping.swift quản logic; stored props phải
    // nằm ở đây vì extension không chứa được stored property)

    var typingRealtimeChannel: RealtimeChannelV2?
    var typingListenTask: Task<Void, Never>?
    /// Kênh đang mở topic typing — cũng là guard cho stop(ifCurrent:) kiểu visibleChannelId.
    var typingTopicChannelId: UUID?
    /// Ai đang gõ trong kênh ĐANG MỞ: uid → (tên, hạn hiển thị). TTL vì broadcast không có
    /// sự kiện "đã ngừng gõ" đáng tin — người ta tắt app giữa chừng là chẳng ai báo.
    var typersInVisibleChannel: [UUID: (name: String, until: Date)] = [:]
    var lastTypingSentAt: Date = .distantPast
    /// Tên hiển thị của MÌNH cho payload typing — RootTabView bơm từ AuthStore (store này
    /// không giữ profile, và receiver thì chỉ có uid nên tên phải đi theo gói tin).
    var myDisplayName: String?

    // MARK: - Đọc

    /// Kênh mình đọc được (RLS lo: public/feed cho mọi người đã đăng nhập, group/dm chỉ thành viên).
    ///
    /// `channel_members` nhúng bị lọc về ĐÚNG HÀNG CỦA MÌNH bằng `eq("channel_members.user_id")`.
    /// Không lọc thì nhúng trả về mọi thành viên của kênh → `me` vớ phải `last_read_at` của
    /// người lạ và unread sai bét.
    func loadChannels() async {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return }
        isLoading = true; errorMessage = nil; loadError = nil
        do {
            let rows: [ChannelRow] = try await client.from("channels")
                .select(Self.channelSelect)
                .eq("channel_members.user_id", value: uid)
                .order("last_message_at", ascending: false, nullsFirst: false)
                .execute().value
            channels = rows
            // Danh sách HIỆN từ đây — tên DM và badge là trang trí vá vào sau, không được
            // bắt cả màn chờ chúng. Đo 18/07: kênh về sau 330ms mà spinner đứng ~3s vì
            // chuỗi cũ chờ đếm chưa đọc tuần tự xong mới tắt.
            isLoading = false
            hasSyncedChannels = true
            await resolveDMTitles()
            await loadUnreadCounts()
            // Chụp xuống đĩa SAU khi vá title DM + unread — bản cache phải là bản người dùng
            // đang thấy, để lần mở app sau không nhấp nháy "Hội thoại" → tên người.
            let snapshot = channels
            let counts = unreadByChannel
            Task { await ChatDiskCache.shared.saveChannels(snapshot, unread: counts) }
        } catch { loadError = NodieErrorKind.of(error) }
        isLoading = false
    }

    /// Đặt title cho các DM = tên NGƯỜI KIA — một query cho tất cả DM, không N+1.
    ///
    /// Không lưu vào DB: tên người thay đổi được, title tĩnh sẽ mốc; WhatsApp/Zalo cũng
    /// resolve lúc hiển thị. Cần FK `channel_members.user_id → profiles` (0039) để embed.
    /// Lỗi mạng thì rơi về "Hội thoại" — lần refresh sau thử lại, không chặn danh sách.
    private func resolveDMTitles() async {
        guard let uid else { return }
        let dmIds = channels.filter { $0.kind == "dm" }.map(\.id)
        guard !dmIds.isEmpty else { return }

        struct Row: Decodable {
            let channelId: UUID
            let lastReadAt: Date?
            let member: Name?
            struct Name: Decodable {
                let displayName: String?
                let lastSeenAt: Date?
                enum CodingKeys: String, CodingKey {
                    case displayName = "display_name"
                    case lastSeenAt = "last_seen_at"
                }
            }
            enum CodingKeys: String, CodingKey {
                case member
                case channelId = "channel_id"
                case lastReadAt = "last_read_at"
            }
        }
        do {
            let rows: [Row] = try await client.from("channel_members")
                .select("channel_id,last_read_at,member:public_profiles!channel_members_user_id_fkey(display_name,last_seen_at)")
                .in("channel_id", values: dmIds)
                .neq("user_id", value: uid)
                .execute().value
            let names = Dictionary(
                rows.compactMap { r in r.member?.displayName.map { (r.channelId, $0) } },
                uniquingKeysWith: { first, _ in first }
            )
            for i in channels.indices where channels[i].kind == "dm" {
                if let name = names[channels[i].id] { channels[i].title = name }
            }
            // Tiện chuyến: cùng query này chở luôn mốc đọc của người kia cho nhãn "Đã xem".
            // `max`: response này có thể đáp SAU một event realtime tươi hơn — mốc đọc chỉ
            // tiến chứ không lùi, đừng để dữ liệu cũ trên đường bay kéo nhãn tụt lại.
            for row in rows {
                if let ts = row.lastReadAt {
                    peerLastRead[row.channelId] = max(peerLastRead[row.channelId] ?? .distantPast, ts)
                }
                // Mốc "lần cuối thấy" của người kia — cho header DM (mục 9).
                if let seen = row.member?.lastSeenAt {
                    dmPeerLastSeen[row.channelId] = seen
                }
            }
        } catch { /* giữ title cũ */ }

    }

    /// Làm mới "lần cuối thấy" của người kia trong MỘT DM — gọi khi mở khung chat, để header
    /// đúng ngay cả khi loadChannels đã lâu. Một query nhỏ, lỗi nuốt im.
    func refreshDMPresence(channelId: UUID) async {
        guard let uid, channel(id: channelId)?.kind == "dm" else { return }
        struct Row: Decodable {
            let member: Member?
            struct Member: Decodable {
                let lastSeenAt: Date?
                enum CodingKeys: String, CodingKey { case lastSeenAt = "last_seen_at" }
            }
        }
        do {
            let rows: [Row] = try await client.from("channel_members")
                .select("member:public_profiles!channel_members_user_id_fkey(last_seen_at)")
                .eq("channel_id", value: channelId)
                .neq("user_id", value: uid)
                .execute().value
            if let seen = rows.first?.member?.lastSeenAt {
                dmPeerLastSeen[channelId] = seen
            }
        } catch { /* giữ mốc cũ */ }
    }

    /// Đập nhịp "tôi đang online" — cập nhật `profiles.last_seen_at` của MÌNH (0052). Gọi khi
    /// app vào foreground + định kỳ (RootTabView). Trigger `tg_profiles_guard_role` revert cột
    /// role nếu ai lén đổi kèm; đây chỉ đụng last_seen nên qua sạch. Lỗi nuốt im — trễ một
    /// nhịp online không đáng làm phiền ai.
    func heartbeat() async {
        guard let uid else { return }
        struct SeenUpdate: Encodable {
            let lastSeenAt: Date
            enum CodingKeys: String, CodingKey { case lastSeenAt = "last_seen_at" }
        }
        try? await client.from("profiles")
            .update(SeenUpdate(lastSeenAt: Date()))
            .eq("id", value: uid)
            .execute()
    }

    /// Đếm chưa đọc = `messages` mới hơn `last_read_at` (quy tắc scale #4: không bảng
    /// read-state per-message).
    ///
    /// MỘT RPC cho mọi kênh (`nodie_unread_counts`, 0040) — bản cũ đếm từng kênh TUẦN TỰ,
    /// 6 kênh ăn 1.5-2.5 giây (đo 18/07, chính là "app load chậm" Đăng báo). RPC chạy
    /// security INVOKER: đếm dưới đúng RLS của người gọi, không biết nhiều hơn chính họ.
    private func loadUnreadCounts() async {
        struct Row: Decodable {
            let channelId: UUID
            let unread: Int
            enum CodingKeys: String, CodingKey {
                case unread
                case channelId = "channel_id"
            }
        }
        do {
            let rows: [Row] = try await client.rpc("nodie_unread_counts").execute().value
            // Thay TOÀN BỘ map chứ không vá từng khoá: kênh vắng mặt trong kết quả nghĩa là
            // 0 chưa đọc — giữ số cũ là badge ma sống lại sau khi đã đọc trên máy khác.
            var counts: [UUID: Int] = [:]
            for row in rows { counts[row.channelId] = row.unread }
            unreadByChannel = counts
        } catch { /* thiếu badge không làm hỏng danh sách — lần refresh sau đếm lại */ }
    }

    /// 50 tin mới nhất, hoặc 50 tin trước `before` (keyset — KHÔNG offset, quy tắc scale #2).
    /// Trả về theo thứ tự cũ→mới để view append thẳng.
    ///
    /// Trả SỐ tin server lấy được — phân trang cuộn-lên dùng nó để biết đã chạm đáy lịch sử
    /// (0 tin) và ngừng gọi. `@discardableResult`: mọi caller cũ vẫn gọi như thường, không đổi.
    @discardableResult
    func loadMessages(channelId: UUID, before: Date? = nil) async -> Int {
        messageLoadErrors[channelId] = nil
        do {
            var query = client.from("messages")
                .select(Self.messageSelect)
                .eq("channel_id", value: channelId)
                .is("deleted_at", value: nil)
            if let before { query = query.lt("created_at", value: before) }

            let page: [MessageRow] = try await query
                .order("created_at", ascending: false)   // mới nhất trước để LIMIT cắt đúng đầu
                .limit(50)
                .execute().value

            let older = page.reversed().filter { !isBlocked($0.userId) }
            // Con trỏ catch-up bám thời gian SERVER, không bám bong bóng lạc quan (xem
            // `serverCursor`). Lô này là dữ liệu server thật nên đủ tư cách đẩy con trỏ.
            advanceServerCursor(channelId, from: older)
            if before == nil {
                messagesByChannel[channelId] = older
                // Trang đầu THAY cả mảng → nuốt luôn bong bóng đang upload. Trả chúng về.
                // Trang cũ hơn (`before != nil`) chỉ chèn vào đầu nên không đụng tới.
                reattachPendingRows(in: channelId)
                // Đĩa cũng thay sạch theo — tin đã xoá mềm trên server biến khỏi cache luôn.
                Task { await ChatDiskCache.shared.replaceMessages(channelId: channelId, with: older) }
            } else {
                messagesByChannel[channelId] = older + (messagesByChannel[channelId] ?? [])
                Task { await ChatDiskCache.shared.insertMessages(older) }
            }
            // Đếm theo lô SERVER thô (`page`), không theo `older` đã lọc chặn: một trang toàn
            // tin của người bị chặn vẫn nghĩa là "còn lịch sử phía trước", đừng kết luận hết.
            return page.count
        } catch {
            // Chỉ CHẶN màn khi kênh chưa có tin nào — refresh/phân trang hỏng lúc đã có tin
            // thì giữ nguyên tin cũ, không đá người dùng ra khỏi cuộc trò chuyện đang đọc dở.
            if messages(for: channelId).isEmpty { messageLoadErrors[channelId] = NodieErrorKind.of(error) }
            // Hỏng (thường là offline): trả -1 để phân trang KHÔNG nhầm là "hết lịch sử" mà
            // đóng cửa vĩnh viễn — 0 dành riêng cho "server nói không còn tin nào".
            return -1
        }
    }

    /// Nạp CỬA SỔ tin quanh một tin cụ thể — cho jump-to-message từ kết quả tìm kiếm
    /// (phase 18). Tin có thể nằm ngoài 50 tin đầu, nên không phân trang từ đáy lên tới nó
    /// (có thể hàng nghìn tin) mà hỏi thẳng quanh mốc `createdAt` của nó.
    ///
    /// Đã có sẵn tin trong RAM → thôi (đừng quét sạch cuộc trò chuyện đang mở). Trả `true`
    /// khi tin đã nằm trong mảng để view biết cuộn được.
    @MainActor
    @discardableResult
    func loadWindow(around messageId: UUID, channelId: UUID) async -> Bool {
        if messagesByChannel[channelId]?.contains(where: { $0.id == messageId }) == true { return true }
        do {
            // Mốc thời gian của chính tin đích — con trỏ keyset cho hai phía.
            struct Pivot: Decodable {
                let createdAt: Date
                enum CodingKeys: String, CodingKey { case createdAt = "created_at" }
            }
            let pivots: [Pivot] = try await client.from("messages")
                .select("created_at").eq("id", value: messageId).limit(1).execute().value
            guard let pivot = pivots.first?.createdAt else { return false }

            // ≤25 tin tính tới đích (gồm chính nó) + ≤25 tin sau nó — hai query keyset.
            async let beforePage: [MessageRow] = client.from("messages")
                .select(Self.messageSelect).eq("channel_id", value: channelId)
                .is("deleted_at", value: nil).lte("created_at", value: pivot)
                .order("created_at", ascending: false).limit(25).execute().value
            async let afterPage: [MessageRow] = client.from("messages")
                .select(Self.messageSelect).eq("channel_id", value: channelId)
                .is("deleted_at", value: nil).gt("created_at", value: pivot)
                .order("created_at", ascending: true).limit(25).execute().value

            let window = (try await beforePage).reversed() + (try await afterPage)
            let filtered = window.filter { !isBlocked($0.userId) }
            guard filtered.contains(where: { $0.id == messageId }) else { return false }
            messagesByChannel[channelId] = filtered
            // `max` bên trong: cửa sổ này có thể nằm GIỮA lịch sử (nhảy tới tin cũ), đừng để
            // nó kéo con trỏ catch-up tụt về sau đuôi thật.
            advanceServerCursor(channelId, from: filtered)
            reattachPendingRows(in: channelId)
            // KHÔNG ghi đĩa: cache đĩa (phase 01) giữ 200 tin MỚI NHẤT; đè bằng một lát cắt
            // giữa lịch sử thì lần mở nguội sau hiện nhầm khúc cũ ở vị trí "mới nhất" cho tới
            // khi loadMessages thay. Window chỉ sống trong RAM của phiên xem này.
            return true
        } catch { return false }
    }

    /// Chặn một người là ẩn TOÀN BỘ dấu vết của họ (chuẩn IG): cả tin LẪN reaction. Lọc một
    /// lần ở đây — đường load, realtime, disk cache cùng hưởng; dữ liệu thô giữ nguyên trong
    /// `messagesByChannel` nên bỏ chặn là thấy lại ngay, không cần refetch.
    func messages(for channelId: UUID) -> [MessageRow] {
        let rows = messagesByChannel[channelId] ?? []
        // Chưa chặn ai (đa số người dùng) → trả thẳng, không filter+map vô ích: accessor này
        // bị body của ChatDetailView gọi O(n) lần mỗi render, mỗi phím gõ một render.
        guard !blockedUserIds.isEmpty else { return rows }
        return rows
            .filter { !isBlocked($0.userId) }
            .map { row in
                guard let reactions = row.reactions,
                      reactions.contains(where: { blockedUserIds.contains($0.userId) })
                else { return row }
                return row.replacingReactions(reactions.filter { !blockedUserIds.contains($0.userId) })
            }
    }

    func channel(id: UUID) -> ChannelRow? { channels.first { $0.id == id } }

    /// Một kết quả tìm tin nhắn — select NHẸ, không embed author/reactions: màn kết quả chỉ
    /// cần snippet + đường vào kênh, kéo cả `messageSelect` cho 30 hit là phí.
    struct MessageSearchHit: Decodable, Identifiable, Hashable {
        let id: UUID
        let channelId: UUID
        let userId: UUID?
        let body: String?
        let createdAt: Date
        enum CodingKeys: String, CodingKey {
            case id, body
            case channelId = "channel_id"
            case userId = "user_id"
            case createdAt = "created_at"
        }
    }

    /// Tìm trong NỘI DUNG tin — server-side ILIKE, để với tới cả lịch sử ngoài 200 tin cache
    /// đĩa. RLS `messages_read` tự giới hạn về kênh mình đọc được — không dặn thêm gì.
    ///
    /// Escape `%`/`_`: chúng là wildcard của LIKE — người gõ "100%" đang tìm chuỗi "100%",
    /// không phải tiền tố "100". Dấu tiếng Việt phải gõ đúng (ILIKE không bỏ dấu) — nhược
    /// đã ghi trong phase 12.
    ///
    /// Giới hạn biết trước, không sửa được ở client: PostgREST dịch `*` thành `%` TRƯỚC khi
    /// tới Postgres, và escape `\*` cũng bị nó đổi thành `\%` (literal %) — gõ "2*3" sẽ tìm
    /// rộng như wildcard. Không crash, RLS vẫn chặn; muốn đúng tuyệt đối thì chuyển RPC/FTS
    /// (kèm nợ pg_trgm index khi messages lớn — xem phase 12).
    func searchMessages(_ query: String) async -> [MessageSearchHit] {
        let cleaned = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard cleaned.count >= 2 else { return [] }
        let escaped = cleaned
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "%", with: "\\%")
            .replacingOccurrences(of: "_", with: "\\_")
        do {
            let hits: [MessageSearchHit] = try await client.from("messages")
                .select("id,channel_id,user_id,body,created_at")
                .ilike("body", pattern: "%\(escaped)%")
                .is("deleted_at", value: nil)
                .order("created_at", ascending: false)
                .limit(30)
                .execute().value
            return hits.filter { !isBlocked($0.userId) }
        } catch { return [] }
    }

    /// Một thành viên của kênh, kèm tên hiển thị — cho "Xem hồ sơ" (DM) và Thông tin nhóm.
    struct ChannelMember: Identifiable, Hashable {
        let id: UUID
        let displayName: String
        /// 'member' | 'mod'. Cho GroupInfoView hiện nhãn quản trị + biết ai được phong/gỡ.
        var role: String = "member"
        /// Mốc đọc của người này — cho "Đã xem bởi ai" trong nhóm. members(of:) đã fetch sẵn.
        var lastReadAt: Date? = nil
        var isMod: Bool { role == "mod" }
    }

    /// Thành viên của kênh. RLS `members_read` cho mọi thành viên thấy nhau trong kênh
    /// của mình. Embed qua `channel_members_user_id_fkey` — FK phải trỏ `profiles` (0039),
    /// trỏ `auth.users` là PostgREST không lần được sang view `public_profiles`.
    func members(of channelId: UUID) async -> [ChannelMember] {
        struct Row: Decodable {
            let userId: UUID
            let role: String
            let lastReadAt: Date?
            let member: Name?
            struct Name: Decodable {
                let displayName: String?
                enum CodingKeys: String, CodingKey { case displayName = "display_name" }
            }
            enum CodingKeys: String, CodingKey {
                case member, role
                case userId = "user_id"
                case lastReadAt = "last_read_at"
            }
        }
        do {
            let rows: [Row] = try await client.from("channel_members")
                .select("user_id,role,last_read_at,member:public_profiles!channel_members_user_id_fkey(display_name)")
                .eq("channel_id", value: channelId)
                .execute().value
            // Tiện chuyến: mốc đọc XA NHẤT của người khác — nguồn của dấu ✓✓ trong nhóm.
            // DM đã có sẵn từ resolveDMTitles; đây là đường cho nhóm/kênh, nơi "đã xem"
            // nghĩa là ÍT NHẤT MỘT người khác đã đọc (không đếm đầu người — metric trên
            // NGƯỜI là thứ CLAUDE.md cấm).
            for row in rows where row.userId != uid {
                if let ts = row.lastReadAt {
                    peerLastRead[channelId] = max(peerLastRead[channelId] ?? .distantPast, ts)
                }
            }
            return rows.map {
                ChannelMember(id: $0.userId,
                              displayName: $0.member?.displayName ?? String(localized: "Ẩn danh"),
                              role: $0.role, lastReadAt: $0.lastReadAt)
            }
        } catch {
            errorMessage = String(localized: "Không tải được danh sách thành viên.")
            return []
        }
    }
    /// Trạng thái một tin CỦA MÌNH, cho dấu ✓/✓✓ dưới bong bóng.
    ///
    /// `nil` = không vẽ gì: tin của người khác, hoặc tin chưa rời máy (đang chờ mạng / đang
    /// tải lên) — hai trạng thái đó đã có nhãn riêng ("Đang chờ mạng…", lớp phủ upload),
    /// thêm dấu tick nữa là nói cùng một chuyện hai lần.
    ///
    /// "Đã xem" đọc từ `peerLastRead` — mốc đọc xa nhất của người khác trong kênh. Không có
    /// bảng read-state per-message (quy tắc scale #4): với 1000 người dùng, một hàng cho
    /// mỗi cặp (tin × người đọc) là bảng lớn nhất hệ thống, chỉ để vẽ một dấu tick.
    func deliveryState(for message: MessageRow) -> MessageDeliveryState? {
        guard message.userId == uid,
              !isQueued(message.id), pending(for: message.id) == nil else { return nil }
        if let read = peerLastRead[message.channelId], read >= message.createdAt { return .seen }
        return .sent
    }

    func unread(for channelId: UUID) -> Int { unreadByChannel[channelId] ?? 0 }

    /// Tổng chưa đọc cho badge tab Chat. Kênh đã tắt thông báo KHÔNG tính — user đã nói
    /// "đừng réo tôi về chỗ này" thì badge cũng phải im.
    var totalUnread: Int {
        channels.filter { !$0.isMuted }.reduce(0) { $0 + unread(for: $1.id) }
    }
    func isBlocked(_ userId: UUID?) -> Bool { userId.map(blockedUserIds.contains) ?? false }

    /// Ai trong NHÓM đã đọc tin này — "Đã xem bởi ai" (Zalo/Messenger). Lọc từ `members`
    /// (caller nạp bằng `members(of:)`), giữ người có `last_read_at >= createdAt`, TRỪ chính
    /// mình (mình đọc là hiển nhiên) và tác giả (không tự-xem tin mình).
    ///
    /// KHÔNG đếm-đầu-người-thành-điểm-số: chỉ liệt kê tên (anti-pattern CLAUDE.md — metric
    /// trên NỘI DUNG, không xếp hạng NGƯỜI). Số "N người đã xem" chỉ là độ dài danh sách,
    /// không phải điểm của ai.
    func seenBy(_ message: MessageRow, members: [ChannelMember]) -> [ChannelMember] {
        members.filter { m in
            m.id != currentUserId
                && m.id != message.userId
                && (m.lastReadAt.map { $0 >= message.createdAt } ?? false)
        }
    }

    /// Tin cũ nhất đang giữ — con trỏ để nạp trang trước đó.
    func oldestLoaded(in channelId: UUID) -> Date? { messagesByChannel[channelId]?.first?.createdAt }

    // MARK: - Cache đĩa (đọc lúc khởi động — ChatDiskCache là cache, server luôn thắng)

    /// Vẽ danh sách kênh + badge từ đĩa TRƯỚC khi mạng kịp trả lời. Gọi ở RootTabView để
    /// cold start có mặt ngay cả khi chưa vào tab Chat.
    func warmFromDisk() async {
        guard let uid else { return }
        await ChatDiskCache.shared.prepare(ownerUid: uid)
        guard channels.isEmpty else { return }
        let cached = await ChatDiskCache.shared.loadChannels()
        // Kiểm lại SAU await: mạng có thể đã về trong lúc đọc đĩa — bản server thắng.
        guard channels.isEmpty, !cached.channels.isEmpty else { return }
        channels = cached.channels
        unreadByChannel = cached.unread
    }

    /// Tin từ đĩa cho một kênh — CHỈ khi RAM chưa có gì; không clobber dữ liệu mới bằng đĩa cũ
    /// (nil = chưa từng nạp; mảng rỗng nghĩa là server đã nói "kênh trống", tôn trọng nó).
    /// RAM của kênh này đã có gì TỪ SERVER chưa. Mảng toàn bong bóng local (text chờ mạng /
    /// media đang upload — ví dụ forward offline vào kênh CHƯA TỪNG MỞ) vẫn tính là "chưa":
    /// coi chúng là dữ liệu thật thì cache đĩa bị bỏ qua và mở kênh chỉ thấy đúng một dòng
    /// vừa forward, cả lịch sử biến mất tới khi mạng về.
    private func hasOnlyLocalRows(_ channelId: UUID) -> Bool {
        guard let current = messagesByChannel[channelId] else { return true }
        return current.allSatisfy { isQueued($0.id) || pendingMedia[$0.id] != nil }
    }

    func loadCachedMessages(channelId: UUID) async {
        guard hasOnlyLocalRows(channelId) else { return }
        let rows = await ChatDiskCache.shared.loadMessages(channelId: channelId)
        // Kiểm lại SAU await — mạng có thể đã về trong lúc đọc đĩa, bản server thắng.
        guard hasOnlyLocalRows(channelId), !rows.isEmpty else { return }
        messagesByChannel[channelId] = rows
        // Seed con trỏ server từ chính cache (đây là tin server thật đã lưu, `created_at` là
        // giờ server). Thiếu bước này thì trước khi loadMessages kịp chạy (hoặc khi nó fail
        // offline), một tick Realtime gọi fetchNewMessages với con trỏ nil ⇒ nạp 50 tin CỔ
        // NHẤT dồn xuống đáy. `advanceServerCursor` lấy max nên không kéo con trỏ tụt.
        advanceServerCursor(channelId, from: rows)
        // Cùng bẫy với loadMessages trang đầu: thay cả mảng là nuốt bong bóng đang gửi —
        // reattach trả lại cả pendingMedia lẫn queuedTexts.
        reattachPendingRows(in: channelId)
    }

    // MARK: - Ghi

    /// Gửi tin. Hiện ngay (lạc quan) rồi mới đợi server; hỏng thì gỡ ra và báo lỗi.
    /// `id` sinh ở client để bản lạc quan và bản server là MỘT — Realtime đẩy về sẽ khử trùng
    /// đúng, không hiện hai lần.
    @discardableResult
    func send(channelId: UUID, body: String, parentId: UUID? = nil) async -> Bool {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return false }
        let text = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return false }

        let payload = NewMessage(id: UUID(), channelId: channelId, userId: uid,
                                 body: text, parentId: parentId)
        // Tác giả của bản lạc quan là CHÍNH MÌNH, nhưng để `author: nil` — view tự biết tin
        // của mình (so `userId` với `currentUserId`) nên không cần tên. Lần mở màn sau sẽ
        // nạp bản server có tên đầy đủ.
        let optimistic = MessageRow(id: payload.id, channelId: channelId, userId: uid,
                                    parentId: parentId, body: text, createdAt: Date(),
                                    editedAt: nil, author: nil, metadata: nil, reactions: [])
        messagesByChannel[channelId, default: []].append(optimistic)

        do {
            // Lấy `created_at` server về (một cột, rẻ) để vá vào bản lạc quan — không thì
            // dấu ✓✓ so mốc đọc-server với giờ-máy, lệch đồng hồ là "đã xem" sai (xem
            // `replacingCreatedAt`). Insert vẫn là một round-trip, chỉ thêm `select`.
            struct Inserted: Decodable {
                let createdAt: Date
                enum CodingKeys: String, CodingKey { case createdAt = "created_at" }
            }
            let row: Inserted = try await client.from("messages")
                .insert(payload).select("created_at").single().execute().value
            let confirmed = optimistic.replacingCreatedAt(row.createdAt)
            if let i = messagesByChannel[channelId]?.firstIndex(where: { $0.id == payload.id }) {
                messagesByChannel[channelId]?[i] = confirmed
            }
            // Server nhận rồi mới ghi đĩa — tin đang bay không được sống qua lần mở app sau.
            Task { await ChatDiskCache.shared.insertMessages([confirmed]) }
            return true
        } catch {
            // MẤT MẠNG: bubble Ở LẠI với trạng thái "chờ mạng", vào hàng đợi — flushQueued
            // gửi lại khi mạng về. Trả `true` để chỗ gọi xoá draft: tin đã "nằm trong máy"
            // như WhatsApp, bắt người dùng giữ draft + gửi lại tay mới là mất tin.
            // CHỈ offline đi đường này — lỗi thật (slow-mode, RLS) mà auto-retry là spam vô vọng.
            if NodieErrorKind.of(error) == .offline {
                queuedTexts.append(QueuedText(payload: payload, channelId: channelId, row: optimistic))
                return true
            }
            // Trigger slow-mode (2s/tin) cũng rơi vào đây — ErrorText dịch sẵn thành
            // "Chậm lại chút…", không phải lỗi kỹ thuật khó hiểu.
            messagesByChannel[channelId]?.removeAll { $0.id == payload.id }
            errorMessage = ErrorText.localized(error)
            return false
        }
    }

    /// Mạng về — gửi hàng đợi text theo THỨ TỰ, rồi tự retry các đính kèm hỏng.
    /// Gọi từ RootTabView khi `NodieNetworkMonitor.isOnline` chuyển true.
    @MainActor
    func flushQueued() async {
        guard !isFlushingQueue else { return }
        isFlushingQueue = true
        defer { isFlushingQueue = false }

        while let item = queuedTexts.first {
            do {
                // Lấy created_at server về vá vào bản lạc quan (như send()): tin xếp hàng lúc
                // offline giữ createdAt=Date() MÁY, mà ✓✓ và "Đã xem bởi" so nó với mốc đọc
                // server — lệch đồng hồ là đã-xem sai. nil khi trùng khoá (đã trên server,
                // giờ đúng về ở loadMessages sau).
                var serverCreatedAt: Date?
                do {
                    struct Inserted: Decodable {
                        let createdAt: Date
                        enum CodingKeys: String, CodingKey { case createdAt = "created_at" }
                    }
                    let inserted: Inserted = try await client.from("messages")
                        .insert(item.payload).select("created_at").single().execute().value
                    serverCreatedAt = inserted.createdAt
                } catch {
                    // Trùng khoá = đợt flush trước ĐÃ lên tới nơi mà response lạc giữa đường
                    // — coi như xong, đừng báo hỏng một tin người ta đã nhận (cùng bài học
                    // uploadPending).
                    guard Self.isDuplicateKey(error) else { throw error }
                }
                queuedTexts.removeFirst()
                if let i = messagesByChannel[item.channelId]?.firstIndex(where: { $0.id == item.payload.id }) {
                    if let serverCreatedAt {
                        messagesByChannel[item.channelId]![i] =
                            messagesByChannel[item.channelId]![i].replacingCreatedAt(serverCreatedAt)
                    }
                    let row = messagesByChannel[item.channelId]![i]
                    Task { await ChatDiskCache.shared.insertMessages([row]) }
                }
            } catch {
                // Vẫn offline (mạng chớp rồi tắt lại): giữ nguyên hàng đợi, chờ đợt sau.
                if NodieErrorKind.of(error) == .offline { return }
                // Lỗi thật: rơi về hành vi thường — gỡ bubble + báo, đi tiếp tin kế.
                queuedTexts.removeFirst()
                messagesByChannel[item.channelId]?.removeAll { $0.id == item.payload.id }
                errorMessage = ErrorText.localized(error)
            }
        }
        // Text xong tới đính kèm hỏng — cùng chuyến mạng về. uploadsInFlight chống chạy chồng.
        for (id, media) in pendingMedia where media.phase == .failed {
            Task { await self.retryMedia(messageId: id) }
        }
    }

    /// Gửi ảnh/tệp/thoại — bong bóng hiện NGAY từ dữ liệu trong máy, upload chạy nền.
    ///
    /// Vẫn giữ thứ tự upload-rồi-mới-ghi-tin ở tầng mạng: ghi tin trước rồi upload hỏng sẽ để
    /// lại một tin trỏ vào file không tồn tại, nằm đó vĩnh viễn. Ngược lại (upload xong mà ghi
    /// tin hỏng) chỉ để lại một file mồ côi, không ai thấy, dọn được sau.
    ///
    /// Điều ĐỔI so với bản trước: không bắt người gửi ngồi nhìn spinner vài giây rồi mới thấy
    /// bong bóng. Ảnh xuất hiện tức thì (vẽ từ `Data` local), upload chạy sau lưng — đúng cách
    /// IG/WhatsApp làm. Hỏng thì bong bóng Ở LẠI với trạng thái lỗi + nút Gửi lại, chứ không
    /// biến mất: bản trước gỡ luôn tin ra và người dùng mất cả ảnh vừa chọn.
    ///
    /// KHÔNG `async`: hàm này chỉ xếp hàng rồi trả về ngay, upload chạy trong Task nền. Nếu
    /// nó `await` cho tới lúc upload xong thì chỗ gọi phải chờ vài giây mới biết có nên xoá
    /// băng "Đang trả lời" hay không — mà bong bóng thì đã hiện từ mili-giây đầu. Trả về
    /// `false` = KHÔNG có bong bóng nào được tạo (chưa đăng nhập / quá cỡ), không phải "upload hỏng".
    @discardableResult
    func sendMedia(
        channelId: UUID,
        data: Data,
        kind: MessageMedia.Kind,
        ext: String,
        contentType: String,
        preview: UIImage? = nil,
        duration: Double? = nil,
        width: Int? = nil,
        height: Int? = nil,
        size: Int? = nil,
        name: String? = nil,
        waveform: [Float]? = nil,
        caption: String = "",
        parentId: UUID? = nil,
        posterData: Data? = nil,
        posterExt: String? = nil,
        albumId: UUID? = nil
    ) -> Bool {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return false }

        // Chặn quá cỡ TRƯỚC khi dựng bong bóng: hiện một tin rồi báo nó hỏng vì lý do biết
        // trước từ đầu là dắt người dùng đi một vòng vô ích.
        guard data.count <= ChatMediaStorage.maxBytes else {
            errorMessage = ChatMediaStorage.UploadError.tooLarge(data.count).localizedDescription
            return false
        }

        let id = UUID()
        // `path` rỗng: chưa upload nên chưa có. View biết tin này còn ở trong `pendingMedia`
        // thì vẽ từ `Data` local, không đụng tới path.
        let draft = MessageMedia(kind: kind, path: "", duration: duration, width: width,
                                 height: height, size: size, name: name, waveform: waveform,
                                 albumId: albumId)
        let optimistic = MessageRow(id: id, channelId: channelId, userId: uid,
                                    parentId: parentId, body: caption, createdAt: Date(),
                                    editedAt: nil, author: nil,
                                    metadata: MessageMetadata(media: draft), reactions: [])
        messagesByChannel[channelId, default: []].append(optimistic)
        pendingMedia[id] = PendingMedia(phase: .uploading, data: data, preview: preview, ext: ext,
                                        contentType: contentType, media: draft,
                                        channelId: channelId, caption: caption,
                                        parentId: parentId, row: optimistic,
                                        posterData: posterData, posterExt: posterExt)
        // Giữ handle để `discardMedia`/xoá-tin huỷ được task này TRƯỚC khi nó kịp INSERT.
        uploadTasks[id] = Task { await uploadPending(messageId: id) }
        return true
    }

    /// Chuyển tiếp một tin sang kênh khác (chuẩn Messenger).
    ///
    /// Text đi đường `send()` — hưởng luôn optimistic + hàng đợi offline. Media thì PHẢI
    /// `storage.copy` sang path của kênh đích trước: policy `chat-media` (0024) đọc quyền
    /// TỪ ĐƯỜNG DẪN `{channel_id}/{user_id}/…`, giữ path kênh nguồn là thành viên kênh đích
    /// bị chặn ngay lúc ký URL — ảnh forward thành khung hỏng với chính người nhận.
    /// Copy chạy server-side, không kéo bytes về máy.
    @MainActor
    @discardableResult
    func forward(_ message: MessageRow, to targetId: UUID) async -> Bool {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return false }

        guard let media = message.media, !media.path.isEmpty else {
            return await send(channelId: targetId, body: message.body ?? "")
        }

        let ext = (media.path as NSString).pathExtension
        let newPath = "\(targetId.uuidString)/\(uid.uuidString)/\(UUID().uuidString).\(ext)"
        do {
            _ = try await client.storage.from(ChatMediaStorage.bucket)
                .copy(from: media.path, to: newPath)
            // Video: poster CŨNG phải copy sang path kênh đích — giữ path kênh nguồn thì
            // người kênh đích ký URL poster bị policy 0024 chặn, thumbnail thành khung hỏng.
            // Poster hỏng không chặn video (`try?`), như lúc gửi mới.
            var newPosterPath: String?
            if let poster = media.posterPath, !poster.isEmpty {
                let pExt = (poster as NSString).pathExtension
                let dest = "\(targetId.uuidString)/\(uid.uuidString)/\(UUID().uuidString).\(pExt)"
                if (try? await client.storage.from(ChatMediaStorage.bucket)
                    .copy(from: poster, to: dest)) != nil {
                    newPosterPath = dest
                }
            }
            // Dựng media tường minh (KHÔNG `replacingPath`): fallback của nó giữ poster cũ
            // khi nil, mà forward cần poster đúng path mới HOẶC nil hẳn — path kênh nguồn để
            // lại là thumbnail hỏng cho người kênh đích.
            let forwarded = MessageMedia(kind: media.kind, path: newPath, duration: media.duration,
                                         width: media.width, height: media.height, size: media.size,
                                         name: media.name, waveform: media.waveform,
                                         posterPath: newPosterPath)
            let payload = NewMessage(id: UUID(), channelId: targetId, userId: uid,
                                     body: message.body ?? "",
                                     metadata: MessageMetadata(media: forwarded))
            try await client.from("messages").insert(payload).execute()
            // Kênh đích đang nạp trên màn → kéo tin mới về ngay; chưa nạp thì thôi —
            // realtime echo + lần mở sau tự lo. lastMessageAt/resort cũng do echo lo.
            if messagesByChannel[targetId] != nil {
                await fetchNewMessages(channelId: targetId)
            }
            return true
        } catch {
            errorMessage = ErrorText.localized(error)
            return false
        }
    }

    /// Trả lại những bong bóng đang gửi mà `loadMessages` vừa quét mất.
    ///
    /// `loadMessages` thay CẢ mảng bằng dữ liệu server (đúng — nó là nguồn sự thật), nhưng tin
    /// đang upload thì theo định nghĩa CHƯA có trên server. Không trả lại thì: mở chat → gửi
    /// ảnh → thoát ra → vào lại, bong bóng biến mất trong khi `pendingMedia` vẫn giữ bytes.
    /// Upload xong thì `firstIndex` không thấy dòng nào để gắn path; upload hỏng thì không còn
    /// bong bóng nào để bấm "Gửi lại" — ảnh mất im lặng và bytes kẹt lại tới khi thoát app.
    private func reattachPendingRows(in channelId: UUID) {
        let existing = Set((messagesByChannel[channelId] ?? []).map(\.id))
        // Cả đính kèm đang upload LẪN text đang chờ mạng — hai hàng đợi, cùng một luật:
        // chưa có trên server thì server không trả lại được, phải tự dựng lại từ RAM.
        let mediaRows = pendingMedia.values
            .filter { $0.channelId == channelId }
            .map(\.row)
        let queuedRows = queuedTexts
            .filter { $0.channelId == channelId }
            .map(\.row)
        let orphans = (mediaRows + queuedRows)
            .filter { !existing.contains($0.id) }
            .sorted { $0.createdAt < $1.createdAt }
        guard !orphans.isEmpty else { return }
        messagesByChannel[channelId, default: []] += orphans
    }

    /// Đưa một `PendingMedia` lên: upload → INSERT → gắn path thật vào bong bóng.
    /// Dùng chung cho lần gửi đầu và cho "Gửi lại", nên retry đi đúng một đường với gửi mới.
    ///
    /// `@MainActor` là BẮT BUỘC, không phải cho gọn: chọn 6 ảnh là 6 Task chạy song song, và
    /// vì `ConversationStore` không gắn actor nào nên chúng rơi xuống executor chung. Sáu
    /// luồng cùng ghi `messagesByChannel` (mảng, copy-on-write) và `pendingMedia` (từ điển)
    /// trong khi main thread đang đọc để vẽ = hỏng bộ nhớ thật sự, không phải "hơi race".
    /// Ghim phần THAY ĐỔI TRẠNG THÁI vào main; phần chờ mạng (`await`) vẫn nhả main như thường.
    @MainActor
    @discardableResult
    private func uploadPending(messageId: UUID) async -> Bool {
        guard let uid, let pending = pendingMedia[messageId] else { return false }
        guard !uploadsInFlight.contains(messageId) else { return false }
        uploadsInFlight.insert(messageId)
        defer { uploadsInFlight.remove(messageId) }
        // Quên handle khi task kết thúc (mọi đường ra) — không thì dict phình dần vì
        // handle của các upload ĐÃ xong. Trùng với discardMedia niling cũng vô hại.
        defer { uploadTasks[messageId] = nil }

        var working = pending
        working.phase = .uploading
        pendingMedia[messageId] = working

        do {
            let path = try await ChatMediaStorage.upload(
                pending.data, channelId: pending.channelId, userId: uid,
                ext: pending.ext, contentType: pending.contentType, client: client
            )
            // Video: upload thêm poster (ảnh tải nhanh cho bong bóng). Poster hỏng KHÔNG chặn
            // video — bong bóng vẫn phát được, chỉ mất thumbnail; nên `try?`.
            var posterPath: String?
            if let posterData = pending.posterData, let posterExt = pending.posterExt {
                posterPath = try? await ChatMediaStorage.upload(
                    posterData, channelId: pending.channelId, userId: uid,
                    ext: posterExt, contentType: "image/jpeg", client: client
                )
            }
            // Người dùng đã XOÁ tin trong lúc upload chạy → KHÔNG INSERT. Để tệp vừa lên
            // thành file mồ côi (dọn sau) còn hơn dựng lại một tin họ tưởng đã xoá. Kiểm cả
            // `Task.isCancelled` (discardMedia gọi `cancel()`) lẫn `pendingMedia` biến mất
            // (đường xoá hàng loạt quên `Data` trực tiếp) — hai cửa cùng nghĩa "đừng ghi".
            guard !Task.isCancelled, pendingMedia[messageId] != nil else { return false }
            let media = pending.media.replacingPath(path, posterPath: posterPath)
            let payload = NewMessage(id: messageId, channelId: pending.channelId, userId: uid,
                                     body: pending.caption, parentId: pending.parentId,
                                     metadata: MessageMetadata(media: media))
            // Giờ SERVER của tin — vá vào bản lạc quan để ✓✓ so cùng đồng hồ (như send text,
            // xem replacingCreatedAt). nil khi trùng khoá: tin đã có sẵn trên server, giờ
            // đúng của nó sẽ về ở lần loadMessages sau.
            var serverCreatedAt: Date?
            do {
                struct Inserted: Decodable {
                    let createdAt: Date
                    enum CodingKeys: String, CodingKey { case createdAt = "created_at" }
                }
                let row: Inserted = try await client.from("messages")
                    .insert(payload).select("created_at").single().execute().value
                serverCreatedAt = row.createdAt
            } catch {
                // Trùng khoá chính = tin NÀY đã nằm trên server rồi: lần trước INSERT xong
                // nhưng phản hồi lạc mất giữa đường, nên ta tưởng hỏng. Báo hỏng lần nữa là
                // dồn người dùng vào ngõ cụt — bấm Gửi lại bao nhiêu lần cũng trùng khoá,
                // bong bóng kẹt "hỏng" mãi cho một tin người kia ĐÃ nhận được.
                // `id` do client sinh nên trùng khoá chỉ có đúng một nghĩa đó.
                guard Self.isDuplicateKey(error) else { throw error }
            }

            // Xoá ập tới TRONG LÚC INSERT đang bay: guard ở trên đã qua nên tin ĐÃ commit lên
            // server, Realtime sẽ hồi sinh nó — đúng lỗi "tin sống lại" mà C1 đi vá. Kiểm lại
            // sau INSERT; bị huỷ thì xoá mềm ngay. `detached` để `cancel()` của chính task này
            // không giết luôn lệnh xoá dở.
            if Task.isCancelled || pendingMedia[messageId] == nil {
                let id = messageId
                Task.detached { [client] in
                    struct SoftDelete: Encodable {
                        let deletedAt: Date
                        enum CodingKeys: String, CodingKey { case deletedAt = "deleted_at" }
                    }
                    try? await client.from("messages")
                        .update(SoftDelete(deletedAt: Date()))
                        .eq("id", value: id)
                        .execute()
                }
                return false
            }

            // Gắn path thật vào chính bong bóng đang hiện, rồi mới bỏ khỏi `pendingMedia`:
            // làm ngược lại thì có một khoảnh khắc view không còn `Data` local mà cũng chưa
            // có path — bong bóng chớp thành khung trống.
            if let i = messagesByChannel[pending.channelId]?.firstIndex(where: { $0.id == messageId }) {
                var row = messagesByChannel[pending.channelId]![i].replacingMedia(media)
                if let serverCreatedAt { row = row.replacingCreatedAt(serverCreatedAt) }
                messagesByChannel[pending.channelId]![i] = row
            }
            pendingMedia[messageId] = nil
            // Đã lên server (INSERT xong hoặc trùng khoá = đã có) → giờ mới đáng ghi đĩa.
            var confirmed = pending.row.replacingMedia(media)
            if let serverCreatedAt { confirmed = confirmed.replacingCreatedAt(serverCreatedAt) }
            Task { await ChatDiskCache.shared.insertMessages([confirmed]) }
            return true
        } catch {
            // Bị HUỶ giữa chừng (người dùng xoá tin đang upload) → tin đã biến mất khỏi màn,
            // đừng dựng lại một pending "hỏng" cho tin không còn tồn tại (sẽ là bong bóng ma
            // giữ tới 25MB `Data`). Cùng nghĩa khi `pendingMedia` đã bị quên ở đường xoá khác.
            if Task.isCancelled || pendingMedia[messageId] == nil { return false }
            // KHÔNG gỡ tin ra và KHÔNG bắn `errorMessage`: lỗi thuộc về đúng một bong bóng,
            // nó tự hiện trạng thái hỏng + nút Gửi lại. Alert ở gốc màn cho một ảnh lỗi là
            // đúng thứ audit gọi là error UX tệ.
            working.phase = .failed
            pendingMedia[messageId] = working
            return false
        }
    }

    /// 23505 = unique_violation của Postgres. Khớp cả mã lẫn lời vì supabase-swift gói lỗi
    /// PostgREST vào nhiều kiểu và không lộ mã ổn định cho mọi đường.
    private static func isDuplicateKey(_ error: Error) -> Bool {
        let raw = "\(error)".lowercased()
        return raw.contains("23505") || raw.contains("duplicate key")
    }

    /// Gửi lại một đính kèm hỏng — `Data` gốc còn nằm trong `pendingMedia` nên không phải
    /// chọn ảnh lần nữa.
    func retryMedia(messageId: UUID) async {
        // Giữ handle như lần gửi đầu — retry cũng phải huỷ được nếu người dùng xoá tin
        // ngay khi nó đang gửi lại.
        let task = Task { _ = await uploadPending(messageId: messageId) }
        uploadTasks[messageId] = task
        await task.value
    }

    /// Bỏ hẳn một đính kèm hỏng (hoặc đang upload): huỷ task + gỡ bong bóng + quên `Data`.
    func discardMedia(messageId: UUID) {
        guard let pending = pendingMedia[messageId] else { return }
        // Huỷ TRƯỚC khi quên pending: task còn sống sẽ INSERT một tin vừa bị xoá ("tin sống
        // lại"). uploadPending kiểm `Task.isCancelled` ngay trước INSERT nên cancel là đủ chặn.
        uploadTasks[messageId]?.cancel()
        uploadTasks[messageId] = nil
        messagesByChannel[pending.channelId]?.removeAll { $0.id == messageId }
        pendingMedia[messageId] = nil
    }

    /// Ảnh/thoại đang gửi được vẽ từ đây, không phải từ bucket.
    func pending(for messageId: UUID) -> PendingMedia? { pendingMedia[messageId] }

    /// Thả/gỡ một loại trên tin (`message_reactions`, 0027). Bật-tắt: đang có thì gỡ.
    ///
    /// Mutate lạc quan rồi mới đợi server — thả reaction phải phản hồi tức thì, đợi round-trip
    /// thì cảm giác như app đơ. Hỏng thì trả lại đúng trạng thái cũ và báo lỗi.
    func toggleReaction(messageId: UUID, channelId: UUID, kind: ReactionKind) async {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return }
        guard let index = messagesByChannel[channelId]?.firstIndex(where: { $0.id == messageId })
        else { return }

        let before = messagesByChannel[channelId]![index]
        let mine = before.myReactions(uid: uid).contains(kind)
        var rows = before.reactions ?? []
        if mine {
            rows.removeAll { $0.userId == uid && $0.kind == kind.rawValue }
        } else {
            rows.append(MessageRow.ReactionRow(kind: kind.rawValue, userId: uid))
        }
        messagesByChannel[channelId]![index] = before.replacingReactions(rows)

        do {
            if mine {
                try await client.from("message_reactions").delete()
                    .eq("message_id", value: messageId)
                    .eq("user_id", value: uid)
                    .eq("kind", value: kind.rawValue)
                    .execute()
            } else {
                struct NewReaction: Encodable {
                    let messageId: UUID
                    let userId: UUID
                    let kind: String
                    enum CodingKeys: String, CodingKey {
                        case kind
                        case messageId = "message_id"
                        case userId = "user_id"
                    }
                }
                try await client.from("message_reactions")
                    .insert(NewReaction(messageId: messageId, userId: uid, kind: kind.rawValue))
                    .execute()
            }
        } catch {
            // Hoàn tác PHẪU THUẬT trên trạng thái HIỆN TẠI — chỉ đảo lại đúng hàng (mình, loại
            // này). Restore nguyên snapshot `before` thì nuốt mất reaction người KHÁC mà
            // realtime vừa vá vào dòng này trong lúc mình chờ mạng.
            if let i = messagesByChannel[channelId]?.firstIndex(where: { $0.id == messageId }) {
                let current = messagesByChannel[channelId]![i]
                var rows = current.reactions ?? []
                if mine {
                    // Gỡ hỏng → trả lại hàng của mình (nếu echo nào đó chưa trả sẵn).
                    if !rows.contains(where: { $0.userId == uid && $0.kind == kind.rawValue }) {
                        rows.append(MessageRow.ReactionRow(kind: kind.rawValue, userId: uid))
                    }
                } else {
                    // Thêm hỏng → gỡ hàng của mình.
                    rows.removeAll { $0.userId == uid && $0.kind == kind.rawValue }
                }
                messagesByChannel[channelId]![i] = current.replacingReactions(rows)
            }
            errorMessage = ErrorText.localized(error)
        }
    }

    /// Sửa tin của mình (`messages.edited_at`). RLS `messages_update_own` (0017) mới là thứ chặn thật.
    func edit(messageId: UUID, channelId: UUID, body: String) async {
        let text = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        struct EditPayload: Encodable {
            let body: String
            let editedAt: Date
            enum CodingKeys: String, CodingKey {
                case body
                case editedAt = "edited_at"
            }
        }
        do {
            try await client.from("messages")
                .update(EditPayload(body: text, editedAt: Date()))
                .eq("id", value: messageId)
                .execute()
            await loadMessages(channelId: channelId)
        } catch { errorMessage = ErrorText.localized(error) }
    }

    /// Xoá mềm tin của mình (`messages.deleted_at`) — mọi query đọc đã lọc `deleted_at is null`.
    /// Xoá mềm chứ không xoá cứng: tin bị trả lời/trích dẫn mà biến mất hẳn thì trích dẫn
    /// trỏ vào hư không.
    func deleteMessage(messageId: UUID, channelId: UUID) async {
        // Tin còn trong hàng đợi offline = server CHƯA TỪNG thấy nó — xoá là chuyện local:
        // gỡ khỏi queue + gỡ bubble, không gọi server. Thiếu nhánh này thì xoá xong mạng về
        // flush vẫn GỬI một tin người dùng tưởng đã xoá — lỗi mất lòng tin, WhatsApp không
        // bao giờ phạm.
        if isQueued(messageId) {
            queuedTexts.removeAll { $0.payload.id == messageId }
            messagesByChannel[channelId]?.removeAll { $0.id == messageId }
            return
        }
        // Tin đang UPLOAD media = server CHƯA có row (INSERT xảy ra SAU khi upload xong).
        // Xoá là chuyện local: huỷ task upload + gỡ bubble, KHÔNG gọi server. Thiếu nhánh
        // này thì soft-delete khớp 0 hàng (vô hại) nhưng task upload chạy tiếp và INSERT một
        // tin người dùng tưởng đã xoá — cùng bất biến với đường xoá hàng loạt bên dưới.
        if pendingMedia[messageId] != nil {
            discardMedia(messageId: messageId)
            return
        }
        struct SoftDelete: Encodable {
            let deletedAt: Date
            enum CodingKeys: String, CodingKey { case deletedAt = "deleted_at" }
        }
        let backup = messagesByChannel[channelId]
        let removed = backup?.first { $0.id == messageId }
        messagesByChannel[channelId]?.removeAll { $0.id == messageId }
        do {
            try await client.from("messages")
                .update(SoftDelete(deletedAt: Date()))
                .eq("id", value: messageId)
                .execute()
            Task { await ChatDiskCache.shared.deleteMessage(id: messageId) }
            if let removed { pendingUndo = PendingUndo(channelId: channelId, rows: [removed]) }
        } catch {
            messagesByChannel[channelId] = backup
            errorMessage = ErrorText.localized(error)
        }
    }

    /// Đánh dấu đã đọc — badge về 0 ngay, DB cập nhật sau.
    func markRead(channelId: UUID) async {
        guard let uid else { return }
        unreadByChannel[channelId] = 0
        lastMarkReadSentAt[channelId] = Date()
        // Đĩa theo RAM ngay — không thì đóng app rồi mở lại, badge ma của kênh vừa đọc sống dậy.
        let counts = unreadByChannel
        Task { await ChatDiskCache.shared.saveUnread(counts) }
        struct ReadUpdate: Encodable {
            let lastReadAt: Date
            enum CodingKeys: String, CodingKey { case lastReadAt = "last_read_at" }
        }
        do {
            try await client.from("channel_members")
                .update(ReadUpdate(lastReadAt: Date()))
                .eq("channel_id", value: channelId).eq("user_id", value: uid)
                .execute()
        } catch { /* badge cục bộ đã về 0; lần mở sau server sẽ đúng */ }
    }

    /// Xoá mềm NHIỀU tin một lượt (chế độ chọn nhiều — phase 03).
    ///
    /// MỘT lệnh `in(id, …)` chứ không lặp `deleteMessage`: 20 lần round-trip tuần tự là vài
    /// giây nhìn màn hình rụng dần từng tin một, và hỏng giữa chừng để lại trạng thái nửa vời
    /// khó giải thích. Một lệnh thì hoặc xoá hết hoặc không xoá gì.
    ///
    /// Chỉ tin CỦA MÌNH. Caller đã lọc (nút Xoá ẩn khi cụm chọn có tin người khác); RLS
    /// `messages_update_own` là lớp chắn thứ hai, nhưng nó LỌC IM LẶNG chứ không báo lỗi —
    /// tin của người khác lọt vào danh sách sẽ biến mất trên máy mình rồi hiện lại sau khi
    /// nạp lại. Đừng dựa vào RLS để phát hiện nhầm lẫn ở tầng trên.
    func deleteMessages(ids: [UUID], channelId: UUID) async {
        guard !ids.isEmpty else { return }

        // Tin CHƯA TỪNG lên server (còn trong hàng đợi offline / đang upload) là chuyện
        // LOCAL — gỡ khỏi queue, không gọi server. Cùng bất biến với `deleteMessage`: thiếu
        // nhánh này thì xoá xong mạng về, flush/upload vẫn gửi một tin người dùng tưởng đã
        // xoá. `update … in(id,…)` khớp 0 hàng nên KHÔNG báo lỗi — hỏng hoàn toàn im lặng.
        for id in ids where isQueued(id) {
            queuedTexts.removeAll { $0.payload.id == id }
        }
        // `discardMedia` chứ không chỉ quên `Data`: nó HUỶ task upload nữa. Quên `Data` một
        // mình để task chạy tiếp và INSERT một tin vừa xoá — đúng bug "tin sống lại".
        for id in ids where pendingMedia[id] != nil {
            discardMedia(messageId: id)
        }
        let serverIds = ids.filter { !isQueued($0) && pendingMedia[$0] == nil }

        let backup = messagesByChannel[channelId]
        // Giữ các hàng ĐÃ lên server để hoàn tác — chỉ chúng khôi phục được (deleted_at=null).
        let restorable = (backup ?? []).filter { serverIds.contains($0.id) }
        messagesByChannel[channelId]?.removeAll { ids.contains($0.id) }
        guard !serverIds.isEmpty else { return }
        do {
            try await client.from("messages")
                .update(SoftDelete(deletedAt: Date()))
                .in("id", values: serverIds)
                .execute()
            for id in serverIds {
                Task { await ChatDiskCache.shared.deleteMessage(id: id) }
            }
            if !restorable.isEmpty {
                pendingUndo = PendingUndo(channelId: channelId, rows: restorable)
            }
        } catch {
            messagesByChannel[channelId] = backup
            errorMessage = ErrorText.localized(error)
        }
    }

    /// Hoàn tác lần xoá vừa rồi — `deleted_at = null`. Rẻ vì xoá là xoá MỀM. Khôi phục cục
    /// bộ từ các hàng đã giữ (không refetch: không xáo vị trí cuộn, không mất tin cũ ngoài
    /// cửa sổ 50 tin). RLS `messages_read` cho tác giả đọc lại hàng đã xoá của mình, và
    /// `messages_update_own` cho update nó (không lọc deleted_at) — cùng nền với Q&A.
    func undoLastDelete() async {
        guard let undo = pendingUndo else { return }
        pendingUndo = nil  // xoá cờ TRƯỚC: bấm hai lần không gửi hai lệnh restore
        let ids = undo.rows.map(\.id)
        struct RestoreDeleted: Encodable {
            enum CodingKeys: String, CodingKey { case deletedAt = "deleted_at" }
            func encode(to encoder: Encoder) throws {
                var c = encoder.container(keyedBy: CodingKeys.self)
                // encodeNil, KHÔNG bỏ key: Optional tự sinh dùng encodeIfPresent → nil là bỏ
                // hẳn key, PostgREST nhận update rỗng và không đổi gì (cùng bẫy QAStoreUndo).
                try c.encodeNil(forKey: .deletedAt)
            }
        }
        do {
            try await client.from("messages")
                .update(RestoreDeleted()).in("id", values: ids).execute()
            // Chèn lại rồi sắp theo thời gian — giữ đúng chỗ cũ trong luồng.
            var list = messagesByChannel[undo.channelId] ?? []
            let present = Set(list.map(\.id))
            list.append(contentsOf: undo.rows.filter { !present.contains($0.id) })
            list.sort { $0.createdAt < $1.createdAt }
            messagesByChannel[undo.channelId] = list
            Task { await ChatDiskCache.shared.insertMessages(undo.rows) }
        } catch {
            errorMessage = ErrorText.localized(error)
        }
    }

    // MARK: - Ghim tin (phase 06)

    /// Tin đang ghim của một kênh — nguồn của băng ghim. Query RIÊNG, không lọc từ
    /// `messagesByChannel`: tin ghim có thể đã trôi khỏi 50 tin đang nạp, mà băng vẫn phải
    /// hiện nó. Mới ghim lên trước.
    func pinnedMessages(in channelId: UUID) async -> [MessageRow] {
        do {
            return try await client.from("messages")
                .select(Self.messageSelect)
                .eq("channel_id", value: channelId)
                .not("pinned_at", operator: .is, value: "null")
                .is("deleted_at", value: nil)
                .order("pinned_at", ascending: false)
                .execute().value
        } catch {
            errorMessage = ErrorText.localized(error)
            return []
        }
    }

    /// Ghim/gỡ ghim — RPC `set_pinned` (security definer, 0045). RPC tự kiểm caller là quản
    /// trị nhóm và trần 3 tin; Swift chỉ gọi và bắt lỗi (báo "tối đa 3 tin" nếu chạm trần).
    ///
    /// KHÔNG mutate lạc quan `pinned_at`: băng ghim đọc từ `pinnedMessages` (query riêng), và
    /// Realtime UPDATE messages sẽ vá `pinned_at` trên bong bóng. Trả `true` để view nạp lại băng.
    @discardableResult
    func setPinned(messageId: UUID, pinned: Bool) async -> Bool {
        struct Params: Encodable {
            let messageId: UUID
            let pinned: Bool
            enum CodingKeys: String, CodingKey {
                case messageId = "p_message_id"
                case pinned = "p_pinned"
            }
        }
        do {
            try await client.rpc("set_pinned", params: Params(messageId: messageId, pinned: pinned)).execute()
            return true
        } catch {
            errorMessage = ErrorText.localized(error)
            return false
        }
    }

    /// Đánh dấu CHƯA đọc — chiều ngược của `markRead`, để dành đọc lại sau.
    ///
    /// Không có cột "đã đánh dấu chưa đọc": số chưa đọc do `nodie_unread_counts` đếm tin có
    /// `created_at > last_read_at`. Nên đánh dấu chưa đọc = đẩy `last_read_at` LÙI về ngay
    /// trước tin mới nhất — đúng một tin lọt lại, badge hiện 1. Cùng cơ chế với mọi chỗ khác,
    /// không phải một nguồn sự thật thứ hai để rồi phải giữ đồng bộ.
    ///
    /// Kênh chưa có tin nào thì không có gì để chưa đọc — trả về luôn.
    func markUnread(channelId: UUID) async {
        guard let uid, let lastAt = channel(id: channelId)?.lastMessageAt else { return }
        // Lùi một mili giây: `>` chứ không `>=` nên phải đứng TRƯỚC tin đó, bằng nhau là đếm ra 0.
        let mark = lastAt.addingTimeInterval(-0.001)
        unreadByChannel[channelId] = max(unread(for: channelId), 1)
        // Xoá dấu throttle của markRead: không xoá thì lần mở kênh kế tiếp bị coi là "vừa
        // báo đọc rồi", và kênh kẹt ở trạng thái chưa đọc.
        lastMarkReadSentAt[channelId] = nil
        let counts = unreadByChannel
        Task { await ChatDiskCache.shared.saveUnread(counts) }
        struct ReadUpdate: Encodable {
            let lastReadAt: Date
            enum CodingKeys: String, CodingKey { case lastReadAt = "last_read_at" }
        }
        do {
            try await client.from("channel_members")
                .update(ReadUpdate(lastReadAt: mark))
                .eq("channel_id", value: channelId).eq("user_id", value: uid)
                .execute()
        } catch {
            // Ghi hỏng thì badge cục bộ đang nói dối — kéo nó về đúng bằng số của server.
            await loadUnreadCounts()
        }
    }

    /// Tắt thông báo tới `until` (nil = bật lại).
    func setMuted(channelId: UUID, until: Date?) async {
        guard let uid else { return }
        struct MuteUpdate: Encodable {
            let mutedUntil: Date?
            enum CodingKeys: String, CodingKey { case mutedUntil = "muted_until" }
        }
        do {
            try await client.from("channel_members")
                .update(MuteUpdate(mutedUntil: until))
                .eq("channel_id", value: channelId).eq("user_id", value: uid)
                .execute()
            await loadChannels()
        } catch { errorMessage = ErrorText.localized(error) }
    }

    /// Rời kênh — xoá hàng `channel_members` của mình (RLS `members_self_leave`).
    func leave(channelId: UUID) async {
        guard let uid else { return }
        do {
            try await client.from("channel_members").delete()
                .eq("channel_id", value: channelId).eq("user_id", value: uid)
                .execute()
            channels.removeAll { $0.id == channelId }
            messagesByChannel[channelId] = nil
            unreadByChannel[channelId] = nil
            serverCursor[channelId] = nil
            // Bỏ luôn đính kèm đang gửi của kênh vừa rời: policy Storage đòi còn là thành viên,
            // nên upload của chúng chắc chắn hỏng từ đây. Không dọn thì chúng nằm lại giữ
            // `Data` (tới 25MB/tệp) mà không còn màn nào hiện ra để bấm bỏ. Huỷ task upload
            // trước — nếu không nó vẫn chạy tới INSERT vào kênh mình vừa rời.
            for (id, media) in pendingMedia where media.channelId == channelId {
                uploadTasks[id]?.cancel()
                uploadTasks[id] = nil
            }
            pendingMedia = pendingMedia.filter { $0.value.channelId != channelId }
            // Text đang chờ mạng của kênh vừa rời cũng bỏ — cùng lý do với pendingMedia ở trên.
            queuedTexts.removeAll { $0.channelId == channelId }
            Task { await ChatDiskCache.shared.deleteChannel(id: channelId) }
        } catch { errorMessage = ErrorText.localized(error) }
    }

    /// Mở DM 1-1 với một người — trả `channelId` để view điều hướng vào.
    ///
    /// Gọi RPC `create_dm` (0030) chứ KHÔNG tự lắp bằng 3 request từ client. Không phải cho
    /// gọn: bằng RLS thì client KHÔNG lắp nổi. `channels_read` giấu kênh dm khỏi người chưa
    /// là thành viên, mà `members_self_join` lại phải đọc được kênh mới cho chèn — vào DM
    /// phải thấy DM, thấy DM phải đã ở trong DM. RPC (security definer) là đường ra duy nhất,
    /// và nó lo luôn dồn trùng + chặn block + nguyên tử. Xem đầu file 0030.
    func openOrCreateDM(with userId: UUID) async -> UUID? {
        guard uid != nil else { errorMessage = String(localized: "Cần đăng nhập."); return nil }
        struct Params: Encodable {
            let otherId: UUID
            enum CodingKeys: String, CodingKey { case otherId = "other_id" }
        }
        do {
            let channelId: UUID = try await client
                .rpc("create_dm", params: Params(otherId: userId))
                .execute().value
            await loadChannels()
            return channelId
        } catch {
            errorMessage = ErrorText.localized(error)
            return nil
        }
    }

    /// Tham gia kênh public (RLS `members_self_join` chỉ cho public/dm).
    func join(channelId: UUID) async {
        guard let uid else { return }
        struct NewMember: Encodable {
            let channelId: UUID
            let userId: UUID
            enum CodingKeys: String, CodingKey {
                case channelId = "channel_id"
                case userId = "user_id"
            }
        }
        do {
            try await client.from("channel_members")
                .insert(NewMember(channelId: channelId, userId: uid)).execute()
            await loadChannels()
        } catch { errorMessage = ErrorText.localized(error) }
    }

    func clearError() { errorMessage = nil }
}
