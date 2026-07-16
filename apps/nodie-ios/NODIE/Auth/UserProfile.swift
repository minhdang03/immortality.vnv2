import Foundation

/// Một dòng `public.profiles` — khớp schema đang live (migration 0005_agent.sql).
///
/// `role` do trigger `handle_new_user` đặt mặc định 'user'; nâng lên 'admin' phải làm thủ công
/// bằng SQL. Client KHÔNG được tự sửa role — RLS chặn, và không có setter nào ở đây.
struct UserProfile: Codable, Identifiable, Equatable {
    let id: UUID
    let role: String
    var displayName: String?
    var bio: String?

    enum CodingKeys: String, CodingKey {
        case id
        case role
        case displayName = "display_name"
        case bio
    }

    /// Nhãn vai trò (đa ngữ qua String Catalog) — chỉ hiện khi khác 'user' để tránh phân tầng vô nghĩa.
    var roleLabel: String? {
        switch role {
        case "admin": return String(localized: "Quản trị viên")
        case "mod": return String(localized: "Điều hành viên")
        default: return nil
        }
    }

    /// Chữ cái đầu cho avatar. Rỗng → "?" thay vì crash.
    var initial: String {
        let source = displayName?.trimmingCharacters(in: .whitespaces) ?? ""
        return source.first.map { String($0).uppercased() } ?? "?"
    }
}

/// Payload cập nhật — chỉ những field user được phép sửa.
/// Cố tình KHÔNG có `role`: an toàn từ thiết kế, không chỉ dựa vào RLS.
struct ProfileUpdate: Encodable {
    let displayName: String?
    let bio: String?

    enum CodingKeys: String, CodingKey {
        case displayName = "display_name"
        case bio
    }
}
