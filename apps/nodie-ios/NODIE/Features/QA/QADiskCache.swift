import Foundation
import GRDB

/// Cache đĩa cho Hỏi đáp — cùng khuôn `ChatDiskCache`, cùng lý do: mở app là thấy danh sách
/// NGAY, mạng chỉ để làm mới. Trước đó `QAStore` giữ tất cả trong RAM nên mỗi lần mở lại app
/// là sáu dòng khung xương chờ mạng cho thứ máy đã biết từ phiên trước.
///
/// **Cache, không phải nguồn sự thật.** `loadQuestions` về tới là thay toàn bộ; đĩa chỉ vá
/// khoảng trống lúc khởi động. Mọi lỗi ở đây đều nuốt im lặng — mất cache thì Hỏi đáp chạy
/// y như trước khi có cache, không tệ hơn.
///
/// **Chỉ lưu thứ ĐÃ LỌC.** `QAStore` ghi vào đây đúng mảng `questions` sau khi bỏ người đã
/// chặn, nên warm từ đĩa không cần chờ danh sách chặn — bất biến "không flash nội dung đã
/// chặn" giữ nguyên. Đổi lại: mọi chỗ làm `questions` thay đổi (chặn, sửa, xoá) phải ghi
/// lại, không thì lần mở sau bài đã gỡ sống dậy.
///
/// **Payload là JSON blob của chính `QuestionRow`** (đã Codable cho PostgREST) — thêm field
/// vào model không phải sửa schema. Cột rời chỉ để sort. Đổi shape không đọc được nữa thì
/// bump `schemaVersion` → wipe: cache là cache, không ai đi migrate nó.
///
/// File SQLite RIÊNG với chat: hai actor, hai vòng đời độc lập, không phải nghĩ về khoá chéo.
actor QADiskCache {
    static let shared = QADiskCache()

    private var db: DatabaseQueue?
    private var ownerUid: UUID?
    /// Bump khi đổi shape payload/schema — mở ra thấy version lạ là wipe.
    private static let schemaVersion = "1"
    /// Đúng bằng `limit` mặc định của `loadQuestions` — giữ nhiều hơn thì phần dư không bao
    /// giờ được mạng làm mới, càng để lâu càng lệch.
    static let maxQuestions = 50

    /// Tự nhất quán là đủ: mình encode mình decode, không đụng decoder của SDK.
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
    /// phải bay sạch trước khi người mới dùng.
    func prepare(ownerUid uid: UUID) {
        if db != nil, ownerUid == uid { return }
        do {
            let dir = try FileManager.default.url(for: .applicationSupportDirectory,
                                                  in: .userDomainMask,
                                                  appropriateFor: nil, create: true)
            var fileURL = dir.appendingPathComponent("qa-cache.sqlite")
            let queue = try DatabaseQueue(path: fileURL.path)
            try queue.write { database in
                try database.execute(sql: """
                    CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);
                    CREATE TABLE IF NOT EXISTS question_snapshot(
                        id TEXT PRIMARY KEY, created_at REAL NOT NULL, payload BLOB NOT NULL);
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

    /// Quên sạch — gọi khi đăng xuất, cùng chỗ với `ChatDiskCache.clear()`.
    /// Đóng luôn queue: người kế tiếp đăng nhập sẽ `prepare` mở lại từ đầu.
    func clear() {
        try? db?.write { try Self.wipe($0) }
        db = nil
        ownerUid = nil
    }

    private static func wipe(_ database: Database) throws {
        try database.execute(sql: "DELETE FROM question_snapshot; DELETE FROM meta;")
    }

    // MARK: - Đọc (lúc khởi động, trước khi mạng trả lời)

    /// Mới → cũ, cùng thứ tự `loadQuestions` đang trả về.
    func loadQuestions() -> [QuestionRow] {
        guard let db else { return [] }
        do {
            return try db.read { database in
                try Row.fetchAll(
                    database,
                    sql: "SELECT payload FROM question_snapshot ORDER BY created_at DESC")
                    .compactMap { try? Self.decoder.decode(QuestionRow.self, from: $0["payload"] as Data) }
            }
        } catch { return [] }
    }

    // MARK: - Ghi (fire-and-forget từ QAStore, không chặn UI)

    /// Thay TOÀN BỘ danh sách — câu hỏi biến mất khỏi `questions` (bị chặn, bị xoá) thì trên
    /// đĩa cũng đi theo. Truyền vào mảng ĐÃ LỌC người chặn (xem chú thích đầu file).
    func saveQuestions(_ rows: [QuestionRow]) {
        guard let db else { return }
        try? db.write { database in
            try database.execute(sql: "DELETE FROM question_snapshot")
            for row in rows.prefix(Self.maxQuestions) {
                guard let payload = try? Self.encoder.encode(row) else { continue }
                try database.execute(
                    sql: "INSERT OR REPLACE INTO question_snapshot(id, created_at, payload) VALUES (?, ?, ?)",
                    arguments: [row.id.uuidString, row.createdAt.timeIntervalSince1970, payload])
            }
        }
    }
}
