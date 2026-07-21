import Foundation
import Supabase

/// Cờ tính năng đọc từ bảng `public.app_config(key text, value jsonb)` trên Supabase.
///
/// Vì sao có store này: gate hiển thị (vd tab Hỏi đáp) trước đây gắn cứng vào
/// `profiles.role` — muốn mở feature cho user thường phải ra bản mới. Với `app_config`,
/// đổi một dòng DB là feature mở ở lần mở app kế tiếp, không cần release.
///
/// Chỉ đọc, không ghi. RLS cho authed đọc `app_config`. Cờ chỉ đổi HIỂN THỊ, KHÔNG cấp
/// quyền gì — quyền vẫn do RLS Supabase quyết. Bật `qa_public` không mở thêm cửa nào.
/// `@MainActor` cùng lý do AuthStore/FollowStore: SwiftUI đọc `qaPublic` lúc dựng body,
/// còn `load()` ghi nó sau `await` — không có annotation là ghi off-main (SE-0338).
@MainActor
@Observable
final class FeatureFlagStore {
    /// Hỏi đáp mở công khai cho user thường? Default false = fail-safe: lỗi/offline giữ
    /// đóng, không mở nhầm feature chưa sẵn sàng. Xem `NodieTab.qaUnlocked(role:qaPublic:)`.
    var qaPublic = false

    private let client = SupabaseClientProvider.shared

    /// Các key kiểu boolean cần đọc. Thêm cờ bool mới: thêm key vào đây + gán ở `load()`.
    /// Chỉ giữ key BOOL — một key non-bool sẽ làm cả mẻ decode hỏng, mọi cờ rơi về default.
    private static let boolKeys = ["qa_public"]

    /// Đọc một lần lúc signedIn (RootTabView gọi). Lỗi/offline → giữ nguyên default,
    /// KHÔNG throw ra UI: cờ hỏng không phải lỗi người dùng cần thấy, chỉ là feature đóng.
    func load() async {
        struct Row: Decodable { let key: String; let value: Bool }
        do {
            let rows: [Row] = try await client.from("app_config")
                .select("key,value")
                .in("key", values: Self.boolKeys)
                .execute().value
            let map = Dictionary(rows.map { ($0.key, $0.value) }, uniquingKeysWith: { _, last in last })
            qaPublic = map["qa_public"] ?? false
        } catch {
            // Fail-safe: giữ default (đóng). Nuốt lỗi có chủ đích — xem chú thích hàm.
        }
    }
}
