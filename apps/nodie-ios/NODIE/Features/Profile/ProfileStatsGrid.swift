import SwiftUI
import Supabase

/// Mấy con số của một hồ sơ — đọc thẳng Supabase, KHÔNG có số mock.
///
/// Dùng cho CẢ hồ sơ mình lẫn hồ sơ người khác: `init()` là mình, `init(uid:)` là người
/// khác. Một store chứ không hai — cùng bốn con số, cùng cách đếm; tách ra là hai đường
/// đọc phải nuôi song song rồi lệch nhau.
///
/// Metric trên NGƯỜI được phép từ 16/07/2026 (handoff v4): hồ sơ hiện đủ đóng góp.
/// Vẫn không xếp hạng giữa người với người — đây là gương soi, không phải bảng đấu.
///
/// Store riêng chứ không nhét vào AuthStore: AuthStore lo phiên đăng nhập, hỏng nó là
/// user văng ra ngoài. Đếm hỏng thì cùng lắm mất mấy con số.
/// `@MainActor` vì SwiftUI đọc mấy biến này lúc dựng body trên main thread, còn `load()`
/// ghi chúng sau `await` — hàm async nonisolated KHÔNG kế thừa main actor (SE-0338), nên
/// không ghim thì đó là ghi/đọc song song thật sự. Chỉ phần gọi mạng chạy ngoài main.
@MainActor
@Observable
final class ProfileStatsStore {
    private(set) var daysJoined: Int?
    private(set) var questionCount: Int?
    private(set) var answerCount: Int?
    private(set) var litReceived: Int?
    /// Số người theo dõi hồ sơ này. Đếm thẳng `follows` chứ không đọc cột denorm —
    /// 0028 cố ý không denormalize, xem chú thích trong migration đó.
    private(set) var followerCount: Int?
    private(set) var isLoading = false

    /// Đã chạy xong ít nhất một lượt. Cờ RIÊNG chứ không suy ra từ `daysJoined != nil`:
    /// suy ra kiểu đó thì chỉ cần ô "ngày tham gia" lỗi là cả bốn ô mờ mãi, dù ba ô kia
    /// có số đàng hoàng.
    private(set) var didLoadOnce = false

    private let client = SupabaseClientProvider.shared

    /// Hồ sơ đang xem. `nil` = chính mình.
    ///
    /// Giữ nil chứ không chụp `currentUser?.id` lúc khởi tạo: store có thể được dựng trước
    /// khi phiên đăng nhập sẵn sàng, chụp sớm là ghim luôn một nil rồi không bao giờ nạp.
    private let targetId: UUID?

    init(uid: UUID? = nil) { self.targetId = uid }

    private var uid: UUID? { targetId ?? client.auth.currentUser?.id }

    var isLoaded: Bool { didLoadOnce }

    /// `.task` chạy lại mỗi lần màn hiện ra → xong rồi thì thôi, khỏi bắn lại 6 request.
    func load() async {
        guard let uid, !isLoading, !didLoadOnce else { return }
        isLoading = true
        // Bốn số độc lập nhau → chạy song song, chờ cả bốn. Nối tiếp là 4 lần RTT
        // xếp hàng cho một khối hiện cùng lúc.
        async let days = fetchDaysJoined(uid)
        async let questions = fetchCount(from: "questions", uid: uid)
        async let answers = fetchCount(from: "answers", uid: uid)
        async let lit = fetchLitReceived(uid)
        async let followers = fetchFollowerCount(uid)

        let results = await (days, questions, answers, lit, followers)

        // Màn đóng giữa chừng (user bấm sang màn khác) → request bị huỷ → cả bốn về nil.
        // Ghi đè bằng nil rồi bật `didLoadOnce` sẽ đóng băng "—" vĩnh viễn; bỏ qua để lượt
        // sau nạp lại từ đầu.
        guard !Task.isCancelled else { isLoading = false; return }

        daysJoined = results.0
        questionCount = results.1
        answerCount = results.2
        litReceived = results.3
        followerCount = results.4
        // CẢ NĂM cùng nil = không nạp được gì (mất mạng đúng lúc màn hiện ra), không phải
        // "một người chưa đóng góp gì". Bật didLoadOnce lúc đó là khoá vĩnh viễn: guard đầu
        // hàm biến load() thành no-op, redacted tắt, và bốn ô "—" đứng đó cho tới khi user
        // thoát hẳn màn rồi vào lại. Để nguyên cờ thì `.task` lượt sau nạp lại được.
        // Một phần nil vẫn tính là xong — ba số đúng còn hơn bắt chờ vì số thứ tư hỏng.
        let allFailed = results.0 == nil && results.1 == nil && results.2 == nil
            && results.3 == nil && results.4 == nil
        didLoadOnce = !allFailed
        isLoading = false
    }

    /// Số ngày kể từ `public_profiles.created_at`.
    ///
    /// Đọc VIEW chứ không bảng `profiles`: RLS của bảng là self-only (`profiles_self_read`,
    /// 0007), nên hồ sơ NGƯỜI KHÁC trả về rỗng và ô "ngày tham gia" hoá "—" — lỗi chỉ lộ khi
    /// có người thứ hai. View `public_profiles` (0027) chở đúng cột công khai và cho mọi
    /// người đã đăng nhập đọc, nên một đường dùng được cho cả mình lẫn người khác.
    ///
    /// Đọc thẳng ở đây thay vì thêm `createdAt` vào `UserProfile`: store này đã nói chuyện
    /// với Supabase rồi, mà `Auth/` đang có người sửa dở — không đụng vào cho khỏi đụng độ.
    private func fetchDaysJoined(_ uid: UUID) async -> Int? {
        struct Row: Decodable { let created_at: Date }
        do {
            let row: Row = try await client.from("public_profiles")
                .select("created_at").eq("id", value: uid).single()
                .execute().value
            // Theo NGÀY LỊCH, không phải 86400 giây: tham gia tối qua thì sáng nay là
            // "1 ngày", không phải "0".
            let days = Calendar.current.dateComponents([.day],
                                                       from: Calendar.current.startOfDay(for: row.created_at),
                                                       to: Calendar.current.startOfDay(for: Date())).day
            return max(days ?? 0, 0)
        } catch { return nil }
    }

    /// `head: true` — chỉ xin con số ở header, không kéo hàng nào về.
    ///
    /// Lọc `deleted_at` tại đây chứ không phó mặc RLS: policy 0019 cho admin ĐỌC cả hàng đã
    /// xoá mềm (`deleted_at is null or is_admin()`), mà admin cũng là người dùng có hồ sơ —
    /// nếu không lọc, số của chính admin sẽ phồng lên vì đếm cả bài đã xoá.
    private func fetchCount(from table: String, uid: UUID) async -> Int? {
        do {
            let response = try await client.from(table)
                .select("*", head: true, count: .exact)
                .eq("author_id", value: uid)
                .is("deleted_at", value: nil)
                .execute()
            return response.count
        } catch { return nil }
    }

    /// Tổng ☀ nhận được trên câu trả lời + reply của mình.
    ///
    /// Cộng ở client: đây là nội dung của MỘT người nên số hàng có giới hạn thực tế.
    /// Khi nào một người viết tới vài nghìn câu thì đổi sang RPC `sum()` phía server.
    private func fetchLitReceived(_ uid: UUID) async -> Int? {
        struct Row: Decodable { let lit_count: Int }
        do {
            async let answers: [Row] = client.from("answers")
                .select("lit_count").eq("author_id", value: uid)
                .is("deleted_at", value: nil).execute().value
            async let replies: [Row] = client.from("answer_replies")
                .select("lit_count").eq("author_id", value: uid)
                .is("deleted_at", value: nil).execute().value
            return try await (answers + replies).reduce(0) { $0 + $1.lit_count }
        } catch { return nil }
    }

    /// Bao nhiêu người theo dõi hồ sơ này.
    ///
    /// `head: true` — chỉ xin con số, không kéo hàng nào về. Quét theo `followee_id`,
    /// đúng chiều mà `idx_follows_followee` (0028) phục vụ.
    private func fetchFollowerCount(_ uid: UUID) async -> Int? {
        do {
            let response = try await client.from("follows")
                .select("*", head: true, count: .exact)
                .eq("followee_id", value: uid)
                .execute()
            return response.count
        } catch { return nil }
    }
}

/// Khối 2×2 dưới thẻ danh tính ở màn Cá nhân.
struct ProfileStatsGrid: View {
    @Bindable var stats: ProfileStatsStore

    var body: some View {
        NodieStatGrid(items: [
            .init(value: text(stats.daysJoined), label: String(localized: "ngày tham gia")),
            .init(value: text(stats.questionCount), label: String(localized: "câu hỏi đã đặt")),
            .init(value: text(stats.answerCount), label: String(localized: "trả lời đã viết")),
            .init(value: text(stats.litReceived), label: String(localized: "hạt ánh sáng nhận được")),
        ])
        .redacted(reason: stats.isLoaded ? [] : .placeholder)
        .task { await stats.load() }
    }

    /// Chưa nạp xong thì "—" (đã bị `.redacted` phủ mờ); nạp lỗi thì "—" đứng thật —
    /// thà không có số còn hơn hiện số 0 sai.
    private func text(_ value: Int?) -> String {
        value.map(String.init) ?? "—"
    }
}

#Preview {
    ProfileStatsGrid(stats: ProfileStatsStore())
        .padding(.horizontal, NodieSpacing.screenH)
}
