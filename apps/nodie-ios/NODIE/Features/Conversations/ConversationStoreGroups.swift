import Foundation
import Supabase

/// Quản trị nhóm — tạo nhóm, thêm/xoá người, đổi tên, phong/gỡ quản trị, chuyển giao chủ.
///
/// Tách khỏi `ConversationStore.swift` (đã ~1050 dòng) theo đúng khuôn
/// `ConversationStoreRealtime`/`ConversationStoreTyping`.
///
/// **RLS + trigger phía server là thứ chặn thật** (migration 0043 + 0044):
/// - `create_group`/`transfer_group_owner` là RPC security definer — client KHÔNG lắp nổi
///   bằng vài request rời (cùng lý do `create_dm`: vào nhóm phải thấy nhóm, thấy nhóm phải
///   đã ở trong nhóm).
/// - Thêm/xoá người, đổi tên, đổi role đi thẳng bảng qua policy `*_by_mod` — nhưng trigger
///   `nodie_guard_member_role` (0044) mới là chốt chặn tự-phong, và
///   `tg_channels_guard_created_by` (0043) chặn cướp quyền chủ. Swift ở đây chỉ dựng request
///   đúng hình; sai quyền thì server bác, ta bắt lỗi và lùi lạc quan.
extension ConversationStore {

    // MARK: - Tạo nhóm

    /// Tạo nhóm với tên + danh sách người mời. RPC lọc im lặng người không tồn tại / bị chặn
    /// (xem 0043) — nhóm vẫn tạo với những người mời được, giống Telegram.
    /// Trả `channelId` để view vào thẳng nhóm vừa tạo.
    func createGroup(title: String, memberIds: [UUID]) async -> UUID? {
        guard currentUserId != nil else { errorMessage = String(localized: "Cần đăng nhập."); return nil }
        let clean = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty else { errorMessage = String(localized: "Nhóm cần có tên."); return nil }
        struct Params: Encodable {
            let title: String
            let memberIds: [UUID]
            enum CodingKeys: String, CodingKey {
                case title = "p_title"
                case memberIds = "p_member_ids"
            }
        }
        do {
            let channelId: UUID = try await client
                .rpc("create_group", params: Params(title: clean, memberIds: memberIds))
                .execute().value
            await loadChannels()
            return channelId
        } catch {
            errorMessage = ErrorText.localized(error)
            return nil
        }
    }

    // MARK: - Thành viên

    /// Thêm người vào nhóm (policy `members_add_by_mod` — chỉ quản trị). Bỏ qua người đã ở
    /// trong nhóm bằng `on conflict`-tương-đương: chèn trùng khoá → server bác, ta coi như xong.
    func addMembers(_ userIds: [UUID], to channelId: UUID) async {
        guard !userIds.isEmpty else { return }
        struct NewMember: Encodable {
            let channelId: UUID
            let userId: UUID
            let role: String = "member"
            enum CodingKeys: String, CodingKey {
                case channelId = "channel_id"
                case userId = "user_id"
                case role
            }
        }
        do {
            try await client.from("channel_members")
                .upsert(userIds.map { NewMember(channelId: channelId, userId: $0) },
                        onConflict: "channel_id,user_id", ignoreDuplicates: true)
                .execute()
            await loadChannels()
        } catch { errorMessage = ErrorText.localized(error) }
    }

    /// Xoá một người khỏi nhóm (policy `members_manage_by_mod_delete` — chỉ quản trị, và
    /// KHÔNG xoá được chủ nhóm; server ràng). Tự xoá mình KHÔNG đi đường này — đó là `leave`.
    func removeMember(_ userId: UUID, from channelId: UUID) async {
        do {
            try await client.from("channel_members").delete()
                .eq("channel_id", value: channelId).eq("user_id", value: userId)
                .execute()
        } catch { errorMessage = ErrorText.localized(error) }
    }

    /// Phong (`mod`) / gỡ (`member`) quản trị. Trigger `nodie_guard_member_role` (0044) bác
    /// nếu caller không phải quản trị nhóm — Swift chỉ dựng request, không tự quyết quyền.
    func setRole(_ role: String, for userId: UUID, in channelId: UUID) async {
        struct RoleUpdate: Encodable { let role: String }
        do {
            try await client.from("channel_members")
                .update(RoleUpdate(role: role))
                .eq("channel_id", value: channelId).eq("user_id", value: userId)
                .execute()
        } catch { errorMessage = ErrorText.localized(error) }
    }

    // MARK: - Nhóm

    /// Đổi tên nhóm (policy `channels_update_by_mod` — chỉ quản trị, chỉ `kind='group'`).
    /// Cập nhật lạc quan tại chỗ; hỏng thì lùi + báo.
    func renameGroup(_ channelId: UUID, to title: String) async {
        let clean = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty else { errorMessage = String(localized: "Nhóm cần có tên."); return }
        guard let index = channels.firstIndex(where: { $0.id == channelId }) else { return }
        let old = channels[index].title
        channels[index].title = clean
        struct TitleUpdate: Encodable { let title: String }
        do {
            try await client.from("channels")
                .update(TitleUpdate(title: clean)).eq("id", value: channelId).execute()
        } catch {
            // Re-find, KHÔNG dùng `index` cũ: Realtime (tin mới / đổi thành viên) gọi
            // loadChannels() thay+sort cả mảng trong lúc chờ await — index cũ trỏ nhầm kênh
            // hoặc out-of-range nếu mảng co lại.
            if let now = channels.firstIndex(where: { $0.id == channelId }) {
                channels[now].title = old
            }
            errorMessage = ErrorText.localized(error)
        }
    }

    /// Chuyển giao chủ nhóm — RPC (security definer) kiểm caller đang là chủ. Chủ cũ giữ
    /// `mod` (Telegram cũng vậy — chuyển giao không phải trục xuất). Xem 0043.
    func transferOwner(of channelId: UUID, to userId: UUID) async {
        struct Params: Encodable {
            let channelId: UUID
            let newOwner: UUID
            enum CodingKeys: String, CodingKey {
                case channelId = "p_channel_id"
                case newOwner = "p_new_owner"
            }
        }
        do {
            try await client
                .rpc("transfer_group_owner", params: Params(channelId: channelId, newOwner: userId))
                .execute()
            await loadChannels()
        } catch { errorMessage = ErrorText.localized(error) }
    }
}
