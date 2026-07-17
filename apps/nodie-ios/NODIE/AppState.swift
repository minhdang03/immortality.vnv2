import SwiftUI

/// Trạng thái toàn app — port từ `state` + `renderVals()` của prototype.
///
/// Điều hướng: mỗi tab có NavigationStack + path riêng, giống UINavigationController
/// mỗi tab của FB/IG/X. Đổi lấy edge-swipe-back miễn phí từ hệ thống — không tự viết.
/// Tab bar ẩn khi path không rỗng (tương đương `hidesBottomBarWhenPushed` bên UIKit).
/// Đích push được từ tab Bảng tin. Enum thay vì String để không đụng
/// `navigationDestination(for: String.self)` của các tab khác.
enum FeedRoute: Hashable {
    case profile
}

/// Đích push được từ tab Bạn bè. Enum vì tab này push hai thứ khác nhau:
/// hồ sơ người khác và hồ sơ của chính mình (avatar góc header).
///
/// `UUID` chứ không `String`: từ phase "Bạn bè + hồ sơ thành viên" (17/07), người trong
/// danh sách là `PublicProfile` (FollowStore, khoá `profiles.id` thật), không còn slug
/// Mock kiểu "huong". Khớp `ChatRoute.member(UUID)` bên dưới.
enum FriendsRoute: Hashable {
    case profile
    case member(UUID)
}

/// Đích push được từ tab Chat. Enum vì từ trong khung chat còn mở được hồ sơ người đang
/// nhắn (menu ⋯ → "Xem hồ sơ") — và back phải quay về đúng khung chat đó, không nhảy tab.
///
/// `UUID` chứ không `String`: hai id này giờ là khoá chính thật của `channels` / `profiles`
/// bên Supabase, không còn là chuỗi tự đặt kiểu "naobo" của prototype.
enum ChatRoute: Hashable {
    case chat(UUID)
    case member(UUID)
}

@Observable
final class AppState {
    var tab: NodieTab = .qa

    /// Path riêng mỗi tab.
    ///
    /// Bảng tin + Bạn bè dùng `NavigationPath` (không kiểu) vì hai stack đó cùng push màn
    /// Cá nhân, mà từ Cá nhân còn push tiếp `ProfileRoute` — một mảng `[FeedRoute]` chỉ
    /// chứa được đúng FeedRoute, gặp giá trị kiểu khác thì NavigationLink im lặng không
    /// làm gì (không lỗi, không push — dòng chết). Hai tab còn lại chỉ push một kiểu nên
    /// giữ mảng có kiểu cho gọn.
    var feedPath = NavigationPath()
    var qaPath: [String] = []      // questionId
    var chatsPath: [ChatRoute] = []
    var friendsPath = NavigationPath()

    // Soạn thảo
    /// Draft RIÊNG từng hội thoại, khoá theo channelId. Dùng chung một biến thì gõ dở ở
    /// chat A rồi mở chat B sẽ thấy chữ của A — mỗi khung chat phải giữ chữ của nó.
    ///
    /// Draft ở ĐÂY chứ không trong ChatDetailView: view bị dựng lại mỗi lần đổi cỡ chữ
    /// (`.id(dynamicTypeSize)` ở RootTabView) và bị huỷ khi pop — `@State` sẽ mất chữ.
    var drafts: [UUID: String] = [:]
    var projectionDraft = ""
    var projectionText = ""
    var hasProjected = false

    /// Vote cục bộ theo `Answer.id`. Server sẽ là bảng `votes` (user_id, answer_id).
    var votedAnswers: Set<String> = []

    // MARK: - Hỏi đáp phân luồng
    // Tất cả mock client-side. Server sẽ là: `lit` (user_id, target_id),
    // `answer_replies` (parent_id), `answers` — xem chú thích từng chỗ.

    /// Id đã thả ánh sáng — chung cho cả `Answer.id` lẫn `AnswerReply.id`
    /// (hai loại id không đụng nhau). Server: bảng `lit` (user_id, target_id).
    var litItems: Set<String> = []

    /// Đang soạn trả lời cho ai. `nil` = gõ ở thanh đáy → tạo câu trả lời mới.
    var replyTo: ReplyTarget?

    /// Reply user vừa gửi trong phiên này, khoá theo answerId. Server: INSERT `answer_replies`.
    var extraReplies: [String: [AnswerReply]] = [:]

    /// Câu trả lời user vừa gửi trong phiên này, khoá theo questionId. Server: INSERT `answers`.
    var extraAnswers: [String: [Answer]] = [:]

    /// Draft DÙNG CHUNG giữa thanh đáy và ô inline: tại một thời điểm chỉ một trong hai
    /// hiện ra (xem `replyTo`), nên gõ dở ở ô này rồi bấm "Trả lời" chỗ khác thì chữ
    /// đi theo — đúng như prototype (`aDraft`).
    var answerDraft = ""

    struct ReplyTarget: Equatable {
        let answerId: String
        /// nil = trả lời thẳng câu trả lời; ngược lại = id reply cha.
        let parent: String?
        let name: String
    }

    // Màn "Chiếu câu hỏi" giữ draft trong chính `AskQuestionView` và ghi thẳng Supabase
    // qua `QAStore` — không có state ở đây.

    // Nội dung hội thoại KHÔNG còn ở đây — `ConversationStore` giữ, đọc thẳng Supabase.
    // Trước kia `messages`/`conversations`/`unreadOverrides`/`mutedChannels`/`leftChannels`
    // là mock client-side; giờ chúng là `messages` / `channels` / `channel_members.last_read_at`
    // / `.muted_until` thật. AppState chỉ còn giữ thứ THUỘC VỀ MÀN HÌNH: điều hướng, draft,
    // khay đính kèm, trạng thái ghi âm.

    // MARK: - Bạn bè
    //
    // Follow/danh sách giờ chạy `FollowStore` thật (bảng `follows`, 0028) — xem
    // `Features/Friends/FollowStore.swift`. `follows`/`isFollowing`/`toggleFollow`/
    // `followingList`/`suggestList` đã xoá khỏi đây; store đứng ở RootTabView, truyền
    // xuống FriendsView + MemberProfileView.

    // MARK: - Chat: đính kèm & ghi âm

    /// Khay "Ảnh / Máy ảnh / Tệp" đang mở.
    var attachOpen = false
    /// Đang ghi âm — thanh ghi âm thay chỗ ô nhập.
    var recording = false

    // MARK: - Dẫn xuất

    /// Detail chiếm trọn màn — ẩn tab bar (prototype: `showTabs`).
    /// Quy tắc của app: push detail nào cũng ẩn tab bar. Tab nào có path thì phải
    /// khai ở đây, nếu không tab bar sẽ đè lên màn detail (đã dính với feedPath một lần).
    var showsTabBar: Bool {
        switch tab {
        case .feed: return feedPath.isEmpty
        case .qa: return qaPath.isEmpty
        case .conversations: return chatsPath.isEmpty
        case .journey: return true   // Hành trình chưa có màn detail nào
        case .friends: return friendsPath.isEmpty
        }
    }

    // MARK: - Bạn bè (dẫn xuất)
    //
    // Giữ lại — không ai gọi nữa sau khi Bạn bè chuyển sang FollowStore, nhưng
    // `MockData.people`/`.members` vẫn còn sống (rollback an toàn) nên để hai hàm này
    // đứng chờ, không xoá.

    func person(id: String) -> Person? { MockData.people.first { $0.id == id } }
    func member(id: String) -> Member? { MockData.members[id] }

    func question(id: String) -> Question {
        MockData.questions.first { $0.id == id } ?? MockData.questions[0]
    }

    // MARK: - Điều hướng

    /// Tăng mỗi lần chạm lại tab đang đứng ở root — root view ĐANG HIỆN nghe qua
    /// `onChange` để cuộn lên đầu. Một biến chung cho mọi tab là đủ: chỉ đúng một
    /// root view được dựng tại một thời điểm, các tab khác không nghe thấy tick.
    var rootScrollTick = 0

    /// Chạm tab — chuẩn FB/IG/X: tab khác thì chuyển; tab đang đứng mà có path
    /// thì pop về root; đã ở root thì cuộn lên đầu.
    func selectTab(_ selected: NodieTab) {
        guard selected == tab else {
            tab = selected
            return
        }
        // feedPath/friendsPath là NavigationPath (không gán `[]` được) — pop bằng removeLast.
        switch tab {
        case .feed:
            feedPath.isEmpty ? (rootScrollTick += 1) : feedPath.removeLast(feedPath.count)
        case .qa:
            qaPath.isEmpty ? (rootScrollTick += 1) : (qaPath = [])
        case .conversations:
            chatsPath.isEmpty ? (rootScrollTick += 1) : (chatsPath = [])
        case .journey:
            rootScrollTick += 1
        case .friends:
            friendsPath.isEmpty ? (rootScrollTick += 1) : friendsPath.removeLast(friendsPath.count)
        }
    }

    /// Mở câu hỏi — luôn nhảy sang tab Hỏi đáp, kể cả khi gọi từ Bảng tin
    /// (khớp `tabHome` của prototype: qaDetail sáng tab 'qa').
    func openQuestion(_ id: String) {
        tab = .qa
        qaPath = [id]
    }

    func openChat(_ id: UUID) {
        tab = .conversations
        chatsPath = [.chat(id)]
    }

    // MARK: - Hành động

    func draft(in channelId: UUID) -> String { drafts[channelId] ?? "" }

    // MARK: - Chat: trả lời

    /// Tin đang được trả lời, theo từng chat — bỏ dở ở chat này không xoá trích dẫn ở chat kia.
    /// Chỉ giữ Ý ĐỊNH trả lời (id tin nào); nội dung tin nằm ở `ConversationStore`.
    var replyingTo: [UUID: UUID] = [:]

    func startReply(to messageId: UUID, in channelId: UUID) {
        NodieHaptics.tap()
        replyingTo[channelId] = messageId
    }

    func cancelReply(in channelId: UUID) { replyingTo[channelId] = nil }

    // MARK: - Chat: đính kèm & ghi âm

    func toggleAttach() { attachOpen.toggle() }

    /// Mở thanh ghi âm. Đóng khay đính kèm — hai thứ tranh cùng một chỗ dưới ô nhập.
    func startRec() {
        NodieHaptics.action()
        recording = true
        attachOpen = false
    }

    func cancelRec() { recording = false }

    func project() {
        let t = projectionDraft.trimmingCharacters(in: .whitespacesAndNewlines)
        projectionText = t.isEmpty ? "Trí nhớ dài hạn được củng cố lúc ngủ như thế nào?" : t
        hasProjected = true
    }

    func reproject() {
        projectionDraft = projectionText
        hasProjected = false
    }

    func toggleVote(_ answerId: String) {
        if votedAnswers.contains(answerId) {
            votedAnswers.remove(answerId)
        } else {
            votedAnswers.insert(answerId)
        }
    }

    func voteCount(for answer: Answer) -> Int {
        answer.votes + (votedAnswers.contains(answer.id) ? 1 : 0)
    }

    // MARK: - Hỏi đáp phân luồng

    /// Câu trả lời gốc + câu user vừa gửi trong phiên này.
    func answers(for questionId: String) -> [Answer] {
        question(id: questionId).answers + (extraAnswers[questionId] ?? [])
    }

    func isLit(_ id: String) -> Bool { litItems.contains(id) }

    func toggleLit(_ id: String) {
        if litItems.contains(id) { litItems.remove(id) } else { litItems.insert(id) }
    }

    func litCount(base: Int, id: String) -> Int {
        base + (litItems.contains(id) ? 1 : 0)
    }

    func beginReply(answerId: String, parent: String?, name: String) {
        replyTo = ReplyTarget(answerId: answerId, parent: parent, name: name)
    }

    func cancelReply() { replyTo = nil }

    /// Reply của một câu trả lời, đã duỗi thành thứ tự hiển thị kèm độ sâu.
    ///
    /// Duyệt **pre-order**: con nằm ngay dưới cha thay vì gom cuối danh sách —
    /// đó là thứ tự người đọc mong đợi ở luồng lồng nhau kiểu X/Reddit.
    /// Nhận cả `Answer` chứ không chỉ id vì reply gốc nằm trong chính nó
    /// (`answer.replies`), khỏi phải quét ngược MockData để tìm lại.
    func flatReplies(for answer: Answer) -> [(reply: AnswerReply, depth: Int)] {
        let all = answer.replies + (extraReplies[answer.id] ?? [])
        var out: [(reply: AnswerReply, depth: Int)] = []

        func walk(parent: String?, depth: Int) {
            for r in all where r.parent == parent {
                out.append((r, depth))
                walk(parent: r.id, depth: depth + 1)
            }
        }
        walk(parent: nil, depth: 0)
        return out
    }

    /// Gửi nội dung trong `answerDraft`: reply nếu đang nhắm ai đó, ngược lại là
    /// câu trả lời mới cho câu hỏi.
    func sendAnswer(in questionId: String) {
        let text = answerDraft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        answerDraft = ""

        if let target = replyTo {
            replyTo = nil
            extraReplies[target.answerId, default: []].append(
                AnswerReply(id: "ur-\(UUID().uuidString)", parent: target.parent, who: Self.myName,
                            avatarFrom: MyAvatar.from, avatarTo: MyAvatar.to,
                            time: "vừa xong", text: text, litBase: 0)
            )
            return
        }

        extraAnswers[questionId, default: []].append(
            Answer(id: "ua-\(UUID().uuidString)", who: Self.myName, role: "", time: "vừa xong",
                   isBest: false, votes: 0, avatarFrom: MyAvatar.from, avatarTo: MyAvatar.to,
                   text: text, litBase: 0, replies: [])
        )
    }

    /// Tên hiển thị tạm — sẽ lấy từ `AuthStore.profile.displayName` ở phase wire.
    private static let myName = "Minh Nguyễn"

    // Đã đọc / tắt thông báo / rời kênh giờ là `ConversationStore.markRead·setMuted·leave`
    // (ghi thẳng `channel_members`). Không còn bản mock ở đây.
}
