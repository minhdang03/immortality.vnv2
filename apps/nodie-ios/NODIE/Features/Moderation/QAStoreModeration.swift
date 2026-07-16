import Foundation
import Supabase

/// Báo cáo + chặn (App Store guideline 1.2) — ghi vào `reports`/`blocks` (migration 0017/0021).
/// Nằm trên QAStore vì danh sách chặn quyết định nội dung Q&A được hiển thị;
/// tách store riêng sẽ phải đồng bộ hai nguồn sự thật cho cùng một bộ lọc.
extension QAStore {

    /// Lý do gửi lên server bằng rawValue tiếng Anh — admin đọc ổn định,
    /// không phụ thuộc ngôn ngữ máy người báo cáo.
    enum ReportReason: String, CaseIterable, Identifiable {
        case spam
        case harassment
        case inappropriate
        case other

        var id: String { rawValue }
    }

    /// Một mục có thể báo cáo/chặn — view truyền xuống, store không cần biết UI.
    struct ModerationTarget {
        enum Kind: String {
            case question, answer, reply
        }
        let kind: Kind
        let id: UUID
        let authorId: UUID?
        let authorName: String
    }

    /// RLS `blocks_self` chỉ trả hàng của mình — không cần eq(blocker_id).
    func loadBlockedIds() async {
        struct Row: Decodable { let blocked_id: UUID }
        do {
            let rows: [Row] = try await client.from("blocks")
                .select("blocked_id").execute().value
            blockedUserIds = Set(rows.map(\.blocked_id))
        } catch { /* thiếu danh sách chặn không được làm sập màn — lần refresh sau nạp lại */ }
    }

    func report(_ target: ModerationTarget, reason: ReportReason) async {
        guard let uid = currentUserId else {
            errorMessage = String(localized: "Cần đăng nhập.")
            return
        }
        struct NewReport: Encodable {
            let reporterId: UUID
            let targetType: String
            let targetId: UUID
            let reason: String
            enum CodingKeys: String, CodingKey {
                case reporterId = "reporter_id"
                case targetType = "target_type"
                case targetId = "target_id"
                case reason
            }
        }
        do {
            try await client.from("reports")
                .insert(NewReport(reporterId: uid, targetType: target.kind.rawValue,
                                  targetId: target.id, reason: reason.rawValue))
                .execute()
        } catch { errorMessage = ErrorText.localized(error) }
    }

    /// Chặn xong nội dung biến mất ngay: set cập nhật trước, accessor tự lọc.
    func block(userId: UUID) async {
        guard let uid = currentUserId else {
            errorMessage = String(localized: "Cần đăng nhập.")
            return
        }
        struct NewBlock: Encodable {
            let blockerId: UUID
            let blockedId: UUID
            enum CodingKeys: String, CodingKey {
                case blockerId = "blocker_id"
                case blockedId = "blocked_id"
            }
        }
        do {
            try await client.from("blocks")
                .insert(NewBlock(blockerId: uid, blockedId: userId))
                .execute()
            blockedUserIds.insert(userId)
            removeQuestions(by: userId)
        } catch { errorMessage = ErrorText.localized(error) }
    }

    func unblock(userId: UUID) async {
        do {
            try await client.from("blocks").delete()
                .eq("blocked_id", value: userId)
                .execute()
            blockedUserIds.remove(userId)
        } catch { errorMessage = ErrorText.localized(error) }
    }

    /// Hồ sơ những người đã chặn — cho màn quản lý. blocks trỏ auth.users (không phải
    /// profiles) nên PostgREST không nhúng được, đành hai query.
    func blockedProfiles() async -> [UserProfile] {
        await loadBlockedIds()
        let ids = Array(blockedUserIds)
        guard !ids.isEmpty else { return [] }
        do {
            return try await client.from("profiles")
                .select("id, role, display_name, bio")
                .in("id", values: ids)
                .execute().value
        } catch {
            errorMessage = ErrorText.localized(error)
            return []
        }
    }
}
