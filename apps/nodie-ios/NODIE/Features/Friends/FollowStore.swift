import Foundation
import Supabase

/// Một người trong danh bạ công khai — khớp view `public_profiles` (0027).
///
/// KHÔNG dùng `UserProfile` (Auth/): cái đó chở `role`, thứ view cố ý không phơi ra.
/// Trùng tên trường không có nghĩa là cùng một thứ.
struct PublicProfile: Codable, Identifiable, Hashable {
    let id: UUID
    let displayName: String?
    let bio: String?
    /// Lần cuối mở app (0052). nil = chưa từng (tài khoản cũ) hoặc không đọc cột này.
    var lastSeenAt: Date? = nil

    enum CodingKeys: String, CodingKey {
        case id
        case displayName = "display_name"
        case bio
        case lastSeenAt = "last_seen_at"
    }

    /// Tên hiển thị, có phương án dự phòng — hồ sơ chưa đặt tên vẫn phải gọi được là gì đó.
    var name: String { (displayName?.isEmpty == false ? displayName : nil) ?? String(localized: "Chưa đặt tên") }
}

/// Theo dõi người + tìm người. Chạy trên `follows` (0028) và `public_profiles` (0027).
///
/// Thay `AppState.follows: Set<String>` (mock trên MockData, khoá bằng id giả "hachi").
/// Khoá thật là `profiles.id` kiểu UUID — đó là lý do không tái dùng được state cũ.
///
/// `@MainActor` cùng lý do với ProfileStatsStore: SwiftUI đọc mấy biến này lúc dựng body,
/// còn hàm async ghi chúng sau `await` mà không kế thừa main actor (SE-0338).
@MainActor
@Observable
final class FollowStore {
    /// Những người MÌNH đang theo dõi. Set chứ không mảng: câu hỏi hay gặp nhất là
    /// "có theo người này không" — hỏi mảng là quét tuyến tính trên mỗi dòng danh sách.
    private(set) var following: Set<UUID> = []
    /// Hồ sơ (có tên/bio) của những người mình theo — nguồn cho section "Đang theo dõi".
    /// Tách khỏi `directory`: người mình theo có thể không lọt top-50 của danh bạ.
    private(set) var followingProfiles: [PublicProfile] = []
    /// 50 hồ sơ nạp một lần (order theo tên) — nguồn chung cho gợi ý lẫn picker.
    private var directory: [PublicProfile] = []
    /// Gợi ý = danh bạ trừ người đã theo. TÍNH chứ không chứa: follow/unfollow xong
    /// danh sách tự đổi theo `following`, không phải nhớ cập-nhật-kèm ở từng chỗ ghi.
    var suggestions: [PublicProfile] { directory.filter { !following.contains($0.id) } }
    /// MỌI người (trừ mình), người đang theo dõi xếp TRƯỚC — cho picker "Tin nhắn mới".
    /// Khác `suggestions` (đã trừ người mình theo): picker nhắn tin mà giấu đúng những
    /// người mình theo là ngược đời — IG/Zalo liệt kê người quen trước tiên.
    var peoplePicker: [PublicProfile] {
        directory.sorted { a, b in
            let fa = following.contains(a.id), fb = following.contains(b.id)
            return fa == fb ? a.name < b.name : fa
        }
    }
    private(set) var searchResults: [PublicProfile] = []
    private(set) var isLoading = false
    private(set) var isSearching = false
    /// Lỗi của lần NẠP màn hình — view vẽ tại chỗ (message + Thử lại nếu đáng),
    /// không bắn alert gốc như `errorMessage` (lỗi của thao tác ghi).
    private(set) var loadError: NodieErrorKind?
    private(set) var errorMessage: String?
    private(set) var didLoadOnce = false

    private let client = SupabaseClientProvider.shared
    private var uid: UUID? { client.auth.currentUser?.id }

    /// Những người đang có request theo dõi bay dở. Bấm nhanh hai lần lên cùng một người
    /// sẽ bắn INSERT rồi DELETE mà KHÔNG có gì bảo đảm thứ tự chúng tới Postgres — DELETE
    /// tới trước thì xoá 0 dòng và vẫn trả 204 (không lỗi, không revert), INSERT tới sau
    /// commit thật → giao diện nói "chưa theo" còn DB nói "đã theo".
    private var inFlight: Set<UUID> = []

    func isFollowing(_ id: UUID) -> Bool { following.contains(id) }

    // MARK: - Đọc

    /// Nạp danh sách mình đang theo dõi + gợi ý. Gọi khi mở tab Bạn bè.
    func load() async {
        guard let uid else { return }
        isLoading = true
        loadError = nil
        defer { isLoading = false }
        do {
            struct Row: Decodable { let followee_id: UUID }
            let rows: [Row] = try await client.from("follows")
                .select("followee_id").eq("follower_id", value: uid)
                .execute().value
            following = Set(rows.map(\.followee_id))
            try await loadDirectory(uid: uid)
            try await loadFollowingProfiles()
            didLoadOnce = true
        } catch { loadError = NodieErrorKind.of(error) }
    }

    /// Nạp hồ sơ những người mình theo. Cắt mẻ 50 id một: `.in` nhét cả trăm UUID vào
    /// query string là chạm giới hạn độ dài URL của PostgREST (cùng lý do `loadDirectory`
    /// không dùng `not.in`).
    private func loadFollowingProfiles() async throws {
        let ids = Array(following)
        var profiles: [PublicProfile] = []
        for start in stride(from: 0, to: ids.count, by: 50) {
            let chunk = Array(ids[start..<min(start + 50, ids.count)])
            let rows: [PublicProfile] = try await client.from("public_profiles")
                .select("id,display_name,bio")
                .in("id", values: chunk)
                .execute().value
            profiles += rows
        }
        followingProfiles = profiles.sorted { $0.name < $1.name }
    }

    /// Nạp danh bạ 50 người (trừ mình) — `suggestions`/`peoplePicker` tính từ đây.
    ///
    /// Lọc "chưa theo dõi" ở CLIENT chứ không `not.in.(...)` trong query: danh sách mình
    /// theo dõi có thể dài, mà nhét cả trăm UUID vào query string là chạm giới hạn độ dài URL
    /// của PostgREST. Nạp 50 rồi lọc là đủ cho một khung gợi ý.
    ///
    /// Người đã chặn KHÔNG cần lọc ở đây — `follows_insert` (0028) đã từ chối, và trigger
    /// `trg_block_removes_follows` đã cắt quan hệ cũ. Nhưng họ vẫn hiện trong gợi ý; đó là
    /// việc của bộ lọc chặn phía nội dung, không phải của store này.
    private func loadDirectory(uid: UUID) async throws {
        // `.order` là BẮT BUỘC khi có `.limit`: không order thì 50 dòng là bộ NGẪU NHIÊN
        // đổi theo plan của Postgres — người dùng biến mất khỏi picker không vì lý do gì.
        directory = try await client.from("public_profiles")
            .select("id,display_name,bio")
            .neq("id", value: uid)
            .order("display_name")
            .limit(50)
            .execute().value
    }

    // MARK: - Tìm người

    /// Tìm theo tên. Dựa `idx_profiles_display_name_trgm` (0027) — không có index đó thì
    /// ILIKE '%x%' quét toàn bảng.
    ///
    /// Chuỗi rỗng trả rỗng chứ không nạp cả bảng: ô tìm kiếm trống nghĩa là chưa hỏi gì.
    /// Gọi hàm này từ view thì nhớ debounce — mỗi phím một request là tự DDoS chính mình.
    func search(_ query: String) async {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines)
        searchToken &+= 1
        let token = searchToken
        guard !q.isEmpty else { searchResults = []; isSearching = false; return }
        guard let uid else { return }
        isSearching = true
        // Tắt spinner cũng phải qua token: câu hỏi cũ về muộn mà tắt spinner của câu mới
        // thì màn hình nói "xong rồi" trong khi request thật còn đang bay.
        defer { if token == searchToken { isSearching = false } }
        do {
            let rows: [PublicProfile] = try await client.from("public_profiles")
                .select("id,display_name,bio")
                .ilike("display_name", pattern: "%\(q)%")
                .neq("id", value: uid)
                .limit(20)
                .execute().value
            // Chỉ nhận nếu đây vẫn là câu hỏi mới nhất. Debounce chỉ thưa request lại chứ
            // không xếp thứ tự trả lời: gõ "an" rồi "ann", nếu "an" về sau thì màn hình
            // hiện kết quả của "an" dưới ô đang ghi "ann".
            guard token == searchToken else { return }
            searchResults = rows
        } catch {
            guard token == searchToken else { return }
            errorMessage = ErrorText.localized(error)
        }
    }

    /// Đếm câu hỏi tìm kiếm. `&+` để tràn số thì quay vòng chứ không sập.
    private var searchToken: UInt64 = 0

    // MARK: - Ghi

    /// Theo dõi / bỏ theo dõi.
    ///
    /// Đổi giao diện TRƯỚC rồi mới gọi mạng, hỏng thì trả lại: nút theo dõi phải phản hồi
    /// tức thì như FB/IG — chờ round-trip mới đổi nhãn là cảm giác app lag.
    /// Trả lại đúng trạng thái cũ chứ không toggle lần nữa: hai cú bấm nhanh chồng nhau thì
    /// toggle-ngược sẽ khôi phục nhầm.
    func toggle(_ id: UUID) async {
        guard let uid, id != uid else { return }   // tự theo dõi mình: `follows_no_self` cũng chặn
        // Một người, một request đang bay. Bỏ qua cú bấm thứ hai thay vì xếp hàng: người ta
        // bấm hai lần là bấm nhầm, không phải muốn đổi ý hai lần.
        guard !inFlight.contains(id) else { return }
        inFlight.insert(id)
        defer { inFlight.remove(id) }

        let wasFollowing = following.contains(id)
        // Hồ sơ nếu đã biết tại chỗ — để section "Đang theo dõi" đổi ngay cùng nhịp với nút.
        let knownProfile = followingProfiles.first { $0.id == id }
            ?? directory.first { $0.id == id }
            ?? searchResults.first { $0.id == id }
        applyOptimistic(id: id, profile: knownProfile, nowFollowing: !wasFollowing)

        do {
            if wasFollowing {
                try await client.from("follows").delete()
                    .eq("follower_id", value: uid).eq("followee_id", value: id)
                    .execute()
            } else {
                struct NewFollow: Encodable { let follower_id: UUID; let followee_id: UUID }
                // upsert chứ không insert: theo dõi phải là thao tác lặp-lại-vô-hại. Dòng đã
                // tồn tại (retry, hoặc state client lệch) thì `insert` ném 409 trùng khoá và
                // nút kẹt ở trạng thái sai mãi mãi — trong khi ý người dùng ("cho tôi theo
                // người này") đã được thoả sẵn rồi. DELETE vốn đã lặp-lại-vô-hại.
                try await client.from("follows")
                    .upsert(NewFollow(follower_id: uid, followee_id: id),
                            onConflict: "follower_id,followee_id",
                            ignoreDuplicates: true)
                    .execute()
            }
            // Theo dõi người ngoài danh bạ tại chỗ (vd mở hồ sơ từ Chat) → không có hồ sơ
            // để chèn optimistic, nạp lại danh sách cho section khỏi thiếu người.
            if !wasFollowing, knownProfile == nil { try? await loadFollowingProfiles() }
        } catch {
            // Trả lại đúng trạng thái trước cú bấm. Người bị chặn sẽ rơi vào đây —
            // `follows_insert` từ chối, nút bật lại, và thông báo nói vì sao.
            applyOptimistic(id: id, profile: knownProfile, nowFollowing: wasFollowing)
            errorMessage = ErrorText.localized(error)
        }
    }

    /// Đổi `following` + `followingProfiles` cùng một nhịp — dùng cho cả cú đổi lạc quan
    /// lẫn cú trả lại khi mạng hỏng, để hai nguồn không bao giờ lệch nhau.
    private func applyOptimistic(id: UUID, profile: PublicProfile?, nowFollowing: Bool) {
        if nowFollowing {
            following.insert(id)
            if let profile, !followingProfiles.contains(where: { $0.id == id }) {
                followingProfiles = (followingProfiles + [profile]).sorted { $0.name < $1.name }
            }
        } else {
            following.remove(id)
            followingProfiles.removeAll { $0.id == id }
        }
    }

    func clearError() { errorMessage = nil }
}
