import Foundation
import Supabase

/// Đưa ảnh/thoại lên bucket `chat-media` và ký URL để xem lại.
///
/// Bucket PRIVATE: không có URL trần nào tải được, mỗi lần xem phải xin signed URL và
/// Storage kiểm policy (0024) trước khi ký. Vì vậy DB chỉ lưu ĐƯỜNG DẪN — lưu URL đã ký
/// vào `metadata` là lưu một thứ hết hạn sau một giờ.
///
/// Đường dẫn `{channel_id}/{user_id}/{uuid}.{ext}` KHÔNG phải để sắp file cho gọn: policy
/// đọc channel_id và user_id NGAY TỪ ĐƯỜNG DẪN để phân quyền (lúc upload thì tin nhắn chưa
/// tồn tại, không có gì để tra ngược). Đổi quy ước này là hỏng quyền.
enum ChatMediaStorage {
    static let bucket = "chat-media"

    /// Trần 25MB khớp `file_size_limit` của bucket. Chặn ở client để người dùng biết ngay,
    /// thay vì chờ upload xong mới nhận lỗi từ server.
    static let maxBytes = 25 * 1024 * 1024

    enum UploadError: LocalizedError {
        case tooLarge(Int)
        var errorDescription: String? {
            switch self {
            case .tooLarge(let bytes):
                let mb = Double(bytes) / 1_048_576
                return String(localized: "Tệp \(String(format: "%.1f", mb))MB — vượt giới hạn 25MB.")
            }
        }
    }

    /// Upload rồi trả về đường dẫn để nhét vào `metadata`.
    static func upload(
        _ data: Data,
        channelId: UUID,
        userId: UUID,
        ext: String,
        contentType: String,
        client: SupabaseClient
    ) async throws -> String {
        guard data.count <= maxBytes else { throw UploadError.tooLarge(data.count) }

        let path = "\(channelId.uuidString)/\(userId.uuidString)/\(UUID().uuidString).\(ext)"
        try await client.storage.from(bucket).upload(
            path,
            data: data,
            options: FileOptions(contentType: contentType, upsert: false)
        )
        return path
    }

    /// URL xem được, hạn 1 giờ. Ký thất bại (mất quyền / file đã xoá) → nil, view hiện
    /// khung hỏng thay vì làm sập cả màn chat.
    static func signedURL(for path: String, client: SupabaseClient) async -> URL? {
        try? await client.storage.from(bucket).createSignedURL(path: path, expiresIn: 3600)
    }
}
