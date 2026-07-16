import Foundation
import Supabase

/// Client Supabase dùng chung — cấu hình đọc từ Info.plist
/// (giá trị bơm vào lúc build từ `Config/Secrets.xcconfig`, xem `scripts/generate-secrets-xcconfig.sh`).
///
/// Chỉ dùng anon key. RLS là thứ bảo vệ dữ liệu, không phải sự bí mật của key.
/// service_role KHÔNG BAO GIỜ được có mặt trong app client.
enum SupabaseClientProvider {
    static let shared: SupabaseClient = {
        // Info.plist chỉ giữ HOST, không giữ URL đầy đủ: xcconfig coi "//" là mở comment
        // nên "https://host" bị cắt cụt thành "https:". Ghép scheme ở đây cho chắc.
        guard
            let host = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_HOST") as? String,
            !host.isEmpty,
            let url = URL(string: "https://\(host)"),
            let anonKey = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String,
            !anonKey.isEmpty
        else {
            // Fail fast lúc dev: thiếu config thì phải biết ngay, không để app chạy nửa vời
            // rồi lỗi mạng khó hiểu ở tận màn login.
            fatalError("""
                Thiếu SUPABASE_HOST / SUPABASE_ANON_KEY trong Info.plist.
                Chạy: ./scripts/generate-secrets-xcconfig.sh && xcodegen generate
                """)
        }
        return SupabaseClient(supabaseURL: url, supabaseKey: anonKey)
    }()
}
