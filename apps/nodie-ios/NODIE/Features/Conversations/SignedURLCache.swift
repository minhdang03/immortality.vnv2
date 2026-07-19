import Foundation
import Supabase

/// Nhớ URL đã ký cho từng đường dẫn trong bucket `chat-media`.
///
/// Bucket private nên mỗi lần xem một ảnh là một lần gọi `createSignedURL` — cuộn qua lại
/// một cuộc trò chuyện 20 ảnh sẽ là 20 request mỗi lần cuộn nếu không nhớ gì. Cache này cắt
/// việc đó xuống còn một lần cho mỗi đường dẫn.
///
/// URL sống 1 giờ (`ChatMediaStorage.signedURL`), nhưng ở đây coi như chỉ sống **50 phút**:
/// URL hết hạn giữa lúc đang tải sẽ hỏng ảnh, mà 10 phút dư thì không tốn gì. Đây là biên
/// an toàn, không phải con số của server.
///
/// `actor` chứ không phải lớp thường: nhiều bong bóng cùng xuất hiện một lúc khi cuộn, mỗi
/// cái một Task. Không có hàng rào thì chúng vừa đọc vừa ghi `entries` cùng lúc.
actor SignedURLCache {
    static let shared = SignedURLCache()

    private struct Entry {
        let url: URL
        let signedAt: Date
    }

    /// Ký lại trước hạn thật (1h) 10 phút — xem chú thích đầu file.
    private static let lifetime: TimeInterval = 50 * 60

    private var entries: [String: Entry] = [:]
    /// Đường dẫn đang ký dở. Mười bong bóng cùng xin một ảnh (ví dụ ảnh đại diện lặp lại)
    /// thì chỉ một request đi ra, chín cái kia chờ chung kết quả.
    private var inFlight: [String: Task<URL?, Never>] = [:]

    /// URL xem được cho `path`, ký mới nếu chưa có hoặc đã cũ.
    ///
    /// `forceRefresh` dành cho lúc tải ảnh **thất bại**: URL có thể đã bị vô hiệu sớm hơn hạn
    /// (đổi quyền, file bị xoá rồi tạo lại). Chờ hết TTL mới ký lại thì người dùng nhìn khung
    /// hỏng suốt 50 phút — nên chỗ gọi bắt được lỗi tải phải xin ký lại ngay.
    ///
    /// `thumbWidth` là MỘT PHẦN của khoá cache: bản 464px và bản gốc của cùng một path là hai
    /// URL khác nhau (`/render/image/` vs `/object/`) — trộn chung khoá thì bubble và viewer
    /// tráo URL của nhau.
    func url(for path: String, client: SupabaseClient,
             thumbWidth: Int? = nil, forceRefresh: Bool = false) async -> URL? {
        let key = thumbWidth.map { "\(path)#w\($0)" } ?? path
        if forceRefresh {
            entries[key] = nil
        } else if let entry = entries[key],
                  Date().timeIntervalSince(entry.signedAt) < Self.lifetime {
            return entry.url
        }

        if let running = inFlight[key] { return await running.value }

        let task = Task<URL?, Never> {
            await ChatMediaStorage.signedURL(for: path, client: client, thumbWidth: thumbWidth)
        }
        inFlight[key] = task
        let url = await task.value
        inFlight[key] = nil

        if let url { entries[key] = Entry(url: url, signedAt: Date()) }
        return url
    }

    /// Quên sạch — gọi khi đăng xuất: URL đã ký của người vừa thoát không được dùng lại cho
    /// người đăng nhập sau.
    func clear() {
        entries.removeAll()
        inFlight.values.forEach { $0.cancel() }
        inFlight.removeAll()
    }
}
