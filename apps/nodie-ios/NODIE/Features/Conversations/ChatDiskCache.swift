import Foundation
import GRDB

/// Cache đĩa cho chat (SQLite qua GRDB) — mở app là thấy lịch sử NGAY, mạng chỉ để sync
/// phần mới. Trước đây `ConversationStore` giữ mọi thứ trong RAM: mỗi lần mở lại app,
/// mở chat là màn trống chờ mạng cho thứ máy đã biết từ phiên trước.
///
/// **Cache, không phải nguồn sự thật.** Server luôn thắng: `loadChannels`/`loadMessages`
/// về tới là thay toàn bộ, đĩa chỉ vá khoảng trống lúc khởi động. Vì vậy mọi lỗi ở đây
/// đều nuốt im lặng — mất cache thì chat chạy y như trước khi có cache, không tệ hơn.
///
/// **Payload là JSON blob của chính `ChannelRow`/`MessageRow`** (đã Codable cho PostgREST),
/// KHÔNG map từng cột — thêm field vào model không phải sửa schema. Cột rời chỉ để
/// index/sort. Đổi shape không đọc được nữa thì bump `schemaVersion` → wipe: cache là
/// cache, không ai đi migrate nó.
///
/// `actor` vì `db`/`ownerUid` được prepare/clear từ nhiều Task; bản thân `DatabaseQueue`
/// đã serialize truy vấn, hàng rào ở đây chỉ cho phần trạng thái của actor.
actor ChatDiskCache {
    static let shared = ChatDiskCache()

    private var db: DatabaseQueue?
    private var ownerUid: UUID?
    /// Bump khi đổi shape payload/schema — mở ra thấy version lạ là wipe.
    private static let schemaVersion = "1"
    /// Giữ tối đa chừng này tin mỗi kênh — đủ cho vài trang cuộn ngược, không phải kho lưu trữ.
    private static let maxMessagesPerChannel = 200

    /// Tự nhất quán là đủ: mình encode mình decode, không đụng decoder của SDK.
    /// `.secondsSince1970` là Double nên giữ được phần lẻ giây — `createdAt` là con trỏ
    /// keyset pagination, làm tròn là lệch trang.
    private static let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.dateEncodingStrategy = .secondsSince1970
        return e
    }()
    private static let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .secondsSince1970
        return d
    }()

    // MARK: - Vòng đời

    /// Mở DB và bảo đảm nó thuộc về ĐÚNG người đang đăng nhập — cache của tài khoản trước
    /// phải bay sạch trước khi người mới dùng, không thì tin của người cũ lộ ra.
    func prepare(ownerUid uid: UUID) {
        if db != nil, ownerUid == uid { return }
        do {
            let dir = try FileManager.default.url(for: .applicationSupportDirectory,
                                                  in: .userDomainMask,
                                                  appropriateFor: nil, create: true)
            var fileURL = dir.appendingPathComponent("chat-cache.sqlite")
            let queue = try DatabaseQueue(path: fileURL.path)
            try queue.write { database in
                try database.execute(sql: """
                    CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);
                    CREATE TABLE IF NOT EXISTS channel_snapshot(
                        id TEXT PRIMARY KEY, sort_at REAL,
                        unread INTEGER NOT NULL DEFAULT 0, payload BLOB NOT NULL);
                    CREATE TABLE IF NOT EXISTS message_snapshot(
                        id TEXT PRIMARY KEY, channel_id TEXT NOT NULL,
                        created_at REAL NOT NULL, payload BLOB NOT NULL);
                    CREATE INDEX IF NOT EXISTS idx_msg_channel_time
                        ON message_snapshot(channel_id, created_at);
                    """)
                let stored: [String: String] = try Row
                    .fetchAll(database, sql: "SELECT key, value FROM meta")
                    .reduce(into: [:]) { $0[$1["key"]] = $1["value"] }
                if stored["schema_version"] != Self.schemaVersion || stored["owner_uid"] != uid.uuidString {
                    try Self.wipe(database)
                    try database.execute(
                        sql: "INSERT INTO meta(key, value) VALUES ('schema_version', ?), ('owner_uid', ?)",
                        arguments: [Self.schemaVersion, uid.uuidString])
                }
            }
            // Cache dựng lại được từ server — không có gì đáng chiếm chỗ trong backup iCloud.
            var values = URLResourceValues()
            values.isExcludedFromBackup = true
            try? fileURL.setResourceValues(values)
            db = queue
            ownerUid = uid
        } catch {
            // Không mở được (đĩa đầy, file hỏng) → chạy không cache, như trước khi có nó.
            db = nil
            ownerUid = nil
        }
    }

    /// Quên sạch — gọi khi đăng xuất, cùng chỗ với `SignedURLCache.clear()`.
    /// Đóng luôn queue: người kế tiếp đăng nhập sẽ `prepare` mở lại từ đầu — giữ hai queue
    /// cùng trỏ một file là mời SQLITE_BUSY vu vơ.
    func clear() {
        try? db?.write { try Self.wipe($0) }
        db = nil
        ownerUid = nil
    }

    private static func wipe(_ database: Database) throws {
        try database.execute(sql: """
            DELETE FROM channel_snapshot; DELETE FROM message_snapshot; DELETE FROM meta;
            """)
    }

    // MARK: - Đọc (lúc khởi động, trước khi mạng trả lời)

    func loadChannels() -> (channels: [ChannelRow], unread: [UUID: Int]) {
        guard let db else { return ([], [:]) }
        do {
            return try db.read { database in
                let rows = try Row.fetchAll(
                    database,
                    sql: "SELECT id, unread, payload FROM channel_snapshot ORDER BY sort_at DESC")
                var channels: [ChannelRow] = []
                var unread: [UUID: Int] = [:]
                for row in rows {
                    guard let channel = try? Self.decoder.decode(ChannelRow.self, from: row["payload"] as Data)
                    else { continue }
                    channels.append(channel)
                    if let id = UUID(uuidString: row["id"]) { unread[id] = row["unread"] }
                }
                return (channels, unread)
            }
        } catch { return ([], [:]) }
    }

    /// Tin gần nhất của một kênh, trả về cũ→mới — cùng thứ tự `messagesByChannel` đang giữ.
    func loadMessages(channelId: UUID, limit: Int = 50) -> [MessageRow] {
        guard let db else { return [] }
        do {
            return try db.read { database in
                let newestFirst = try Row.fetchAll(
                    database,
                    sql: "SELECT payload FROM message_snapshot WHERE channel_id = ? ORDER BY created_at DESC LIMIT ?",
                    arguments: [channelId.uuidString, limit])
                    .compactMap { try? Self.decoder.decode(MessageRow.self, from: $0["payload"] as Data) }
                return Array(newestFirst.reversed())
            }
        } catch { return [] }
    }

    // MARK: - Ghi (fire-and-forget từ ConversationStore, không chặn UI)

    /// Thay TOÀN BỘ danh sách kênh — kênh biến mất khỏi server thì tin của nó trên đĩa cũng đi theo.
    func saveChannels(_ channels: [ChannelRow], unread: [UUID: Int]) {
        guard let db else { return }
        try? db.write { database in
            try database.execute(sql: "DELETE FROM channel_snapshot")
            for channel in channels {
                guard let payload = try? Self.encoder.encode(channel) else { continue }
                try database.execute(
                    sql: "INSERT OR REPLACE INTO channel_snapshot(id, sort_at, unread, payload) VALUES (?, ?, ?, ?)",
                    arguments: [channel.id.uuidString, channel.lastMessageAt?.timeIntervalSince1970,
                                unread[channel.id] ?? 0, payload])
            }
            let ids = channels.map(\.id.uuidString)
            if ids.isEmpty {
                try database.execute(sql: "DELETE FROM message_snapshot")
            } else {
                let marks = Array(repeating: "?", count: ids.count).joined(separator: ",")
                try database.execute(
                    sql: "DELETE FROM message_snapshot WHERE channel_id NOT IN (\(marks))",
                    arguments: StatementArguments(ids))
            }
        }
    }

    func saveUnread(_ unread: [UUID: Int]) {
        guard let db else { return }
        try? db.write { database in
            // Kênh vắng mặt trong map = 0 — cùng luật "thay cả map" của loadUnreadCounts.
            try database.execute(sql: "UPDATE channel_snapshot SET unread = 0")
            for (id, count) in unread {
                try database.execute(sql: "UPDATE channel_snapshot SET unread = ? WHERE id = ?",
                                     arguments: [count, id.uuidString])
            }
        }
    }

    /// Trang đầu từ server — thay sạch kênh đó: tin đã xoá mềm trên server biến khỏi đĩa luôn.
    func replaceMessages(channelId: UUID, with rows: [MessageRow]) {
        guard let db else { return }
        try? db.write { database in
            try database.execute(sql: "DELETE FROM message_snapshot WHERE channel_id = ?",
                                 arguments: [channelId.uuidString])
            try Self.insert(rows, into: database)
        }
    }

    /// Chèn/ghi đè từng tin — trang cũ hơn, tin Realtime, tin mình vừa gửi được server nhận.
    func insertMessages(_ rows: [MessageRow]) {
        guard let db, !rows.isEmpty else { return }
        try? db.write { database in
            try Self.insert(rows, into: database)
            for channelId in Set(rows.map(\.channelId)) {
                try database.execute(sql: """
                    DELETE FROM message_snapshot WHERE channel_id = :ch AND id NOT IN (
                        SELECT id FROM message_snapshot WHERE channel_id = :ch
                        ORDER BY created_at DESC LIMIT \(Self.maxMessagesPerChannel))
                    """, arguments: ["ch": channelId.uuidString])
            }
        }
    }

    private static func insert(_ rows: [MessageRow], into database: Database) throws {
        for row in rows {
            guard let payload = try? encoder.encode(row) else { continue }
            try database.execute(
                sql: "INSERT OR REPLACE INTO message_snapshot(id, channel_id, created_at, payload) VALUES (?, ?, ?, ?)",
                arguments: [row.id.uuidString, row.channelId.uuidString,
                            row.createdAt.timeIntervalSince1970, payload])
        }
    }

    func deleteMessage(id: UUID) {
        try? db?.write {
            try $0.execute(sql: "DELETE FROM message_snapshot WHERE id = ?", arguments: [id.uuidString])
        }
    }

    func deleteChannel(id: UUID) {
        try? db?.write { database in
            try database.execute(sql: "DELETE FROM channel_snapshot WHERE id = ?", arguments: [id.uuidString])
            try database.execute(sql: "DELETE FROM message_snapshot WHERE channel_id = ?", arguments: [id.uuidString])
        }
    }
}
