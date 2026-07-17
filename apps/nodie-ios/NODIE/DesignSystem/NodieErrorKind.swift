import Foundation

/// Phân loại lỗi để màn hình biết phải LÀM GÌ, không chỉ nói gì.
///
/// Trước đây mọi lỗi đều rơi về một câu "Có lỗi xảy ra. Thử lại giúp mình nhé." bắn lên alert
/// ở gốc màn. Câu đó vô dụng ở cả hai đầu: người dùng không biết mình cần làm gì (bật mạng?
/// đăng nhập lại? chờ?), còn view không biết có nên hiện nút "Thử lại" hay không — mất mạng
/// thì thử lại có ích, mà hết quyền thì bấm bao nhiêu lần cũng vậy.
///
/// Mỗi nhánh trả lời đúng hai câu đó: `message` (nói gì) + `isRetryable` (có nên mời thử lại).
enum NodieErrorKind: Equatable {
    /// Không có mạng — thử lại KHI CÓ mạng thì được.
    case offline
    /// Phiên hết hạn / chưa đăng nhập → phải đưa về màn đăng nhập, thử lại vô nghĩa.
    case auth
    /// RLS chặn — đúng luật, không phải trục trặc. Thử lại cũng vẫn bị chặn.
    case permission
    /// Không còn nữa (đã xoá) — thử lại không làm nó sống lại.
    case notFound
    /// Trigger slow-mode 2s/tin. Chờ một nhịp là gửi được.
    case slowMode
    /// Lỗi phía server (5xx) — thường tự khỏi, mời thử lại.
    case server
    case unknown

    /// Đọc lỗi thô từ URLSession/PostgREST/Supabase.
    ///
    /// Khớp theo CHUỖI vì Supabase-swift gói lỗi PostgREST vào nhiều kiểu khác nhau và không
    /// lộ một mã ổn định nào cho mọi trường hợp. Xấu, nhưng thành thật: thứ duy nhất chắc
    /// chắn có là văn bản. Bắt `NSURLErrorDomain` trước — cái đó thì có mã tử tế.
    static func of(_ error: Error) -> NodieErrorKind {
        let ns = error as NSError
        if ns.domain == NSURLErrorDomain {
            switch ns.code {
            case NSURLErrorNotConnectedToInternet, NSURLErrorNetworkConnectionLost,
                 NSURLErrorTimedOut, NSURLErrorCannotConnectToHost, NSURLErrorDataNotAllowed:
                return .offline
            default:
                return .server
            }
        }

        let raw = "\(error)".lowercased()
        if raw.contains("slow_mode") { return .slowMode }
        if raw.contains("jwt") || raw.contains("expired") || raw.contains("not authenticated")
            || raw.contains("invalid_token") || raw.contains("401") {
            return .auth
        }
        if raw.contains("insufficient_privilege") || raw.contains("row-level security")
            || raw.contains("permission") || raw.contains("403") {
            return .permission
        }
        if raw.contains("pgrst116") || raw.contains("404") { return .notFound }
        if raw.contains("500") || raw.contains("502") || raw.contains("503") { return .server }
        return .unknown
    }

    /// Câu người đọc hiểu và biết phải làm gì tiếp.
    var message: String {
        switch self {
        case .offline:
            return String(localized: "Không có kết nối — thử lại khi có mạng nhé.")
        case .auth:
            return String(localized: "Phiên đăng nhập đã hết hạn. Đăng nhập lại giúp mình nhé.")
        case .permission:
            return String(localized: "Bạn không có quyền thực hiện thao tác này.")
        case .notFound:
            return String(localized: "Nội dung này không còn nữa.")
        case .slowMode:
            return String(localized: "Chậm lại chút — chờ 2 giây giữa các tin nhé.")
        case .server:
            return String(localized: "Máy chủ đang trục trặc. Thử lại sau một chút nhé.")
        case .unknown:
            return String(localized: "Có lỗi xảy ra. Thử lại giúp mình nhé.")
        }
    }

    /// Có mời "Thử lại" không. Hết quyền/hết phiên/đã xoá thì đừng mời — bấm mấy cũng thế,
    /// mời là hứa suông.
    var isRetryable: Bool {
        switch self {
        case .offline, .slowMode, .server, .unknown: return true
        case .auth, .permission, .notFound: return false
        }
    }

    /// Phiên hết hạn thì việc cần làm là ĐĂNG NHẬP LẠI, không phải thử lại.
    var needsReauth: Bool { self == .auth }
}
