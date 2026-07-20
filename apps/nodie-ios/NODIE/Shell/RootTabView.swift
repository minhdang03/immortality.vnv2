import SwiftUI

/// Khung gốc — mỗi tab một NavigationStack riêng (pattern của FB/IG/X),
/// tab bar nổi đè lên trên và ẩn khi push vào detail.
struct RootTabView: View {
    @Bindable var auth: AuthStore
    /// Nguồn của "user vừa bấm push để vào kênh nào" — xem `.onChange` ở cuối body.
    let push: PushManager
    @State private var state = AppState()
    /// Hỏi đáp wire dữ liệu thật (Supabase) — store riêng, không kéo prototype ở AppState.
    @State private var qa = QAStore()
    /// Chat cũng vậy. Ở ĐÂY chứ không trong ConversationListView: tab bar cần `totalUnread`
    /// kể cả khi đang đứng ở tab khác, mà store của một màn thì chết theo màn đó.
    @State private var chat = ConversationStore()
    /// Theo dõi + hồ sơ thành viên. Ở ĐÂY vì cả FriendsView (tab Bạn bè) lẫn
    /// MemberProfileView (push từ tab Bạn bè LẪN từ trong Chat) đều cần cùng một trạng thái
    /// "đang theo ai" — hai instance riêng sẽ lệch nhau ngay khi follow ở màn này rồi mở
    /// màn kia.
    @State private var follow = FollowStore()
    /// Cờ tính năng (Supabase `app_config`). Ở ĐÂY vì tab bar cần biết Hỏi đáp có mở không
    /// kể cả khi đứng tab khác, và màn Cá nhân (push từ tab khác) cũng đọc cùng cờ.
    @State private var flags = FeatureFlagStore()

    /// Cỡ chữ hệ thống. Đọc ở đây để cả cây view dựng lại khi user đổi cỡ chữ —
    /// font trong NodieTypography là giá trị đã tính sẵn, không tự biết mình cũ.
    /// Không có chỗ nào đọc biến này thì SwiftUI bỏ qua việc dựng lại → chữ đứng im.
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    /// Cho Realtime chat: về foreground thì nối lại socket + fetch bù, xuống nền thì đóng.
    @Environment(\.scenePhase) private var scenePhase
    /// Đã từng xuống hẳn `.background` chưa — xem chú thích ở `.onChange(of: scenePhase)`.
    @State private var wasInBackground = false

    /// Tab bar theo role: Hỏi đáp tạm khoá, chỉ dev (admin/mod) thấy —
    /// xem chú thích ở `NodieTab.visibleTabs(role:)`.
    private var visibleTabs: [NodieTab] {
        NodieTab.visibleTabs(role: auth.profile?.role, qaPublic: flags.qaPublic)
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            NodieColors.bg.ignoresSafeArea()

            Group {
                switch state.tab {
                case .feed:
                    NavigationStack(path: $state.feedPath) {
                        FeedView(state: state, profileInitial: auth.profile?.initial ?? "?")
                            .nodieRootScreen()
                            .navigationDestination(for: FeedRoute.self) { route in
                                switch route {
                                case .profile:
                                    ProfileView(auth: auth, qa: qa, qaPublic: flags.qaPublic).nodieDetailScreen()
                                }
                            }
                    }
                case .qa:
                    NavigationStack(path: $state.qaPath) {
                        QuestionListView(state: state, qa: qa)
                            .nodieRootScreen()
                            .navigationDestination(for: String.self) { questionId in
                                QuestionDetailView(qa: qa, questionId: questionId)
                                    .nodieDetailScreen()
                            }
                    }
                case .conversations:
                    NavigationStack(path: $state.chatsPath) {
                        ConversationListView(state: state, store: chat, follow: follow)
                            .nodieRootScreen()
                            .navigationDestination(for: ChatRoute.self) { route in
                                switch route {
                                case .chat(let channelId):
                                    ChatDetailView(state: state, store: chat, channelId: channelId)
                                        .nodieDetailScreen()
                                case .member(let id):
                                    MemberProfileView(state: state, follow: follow, conversations: chat, memberId: id)
                                        .nodieDetailScreen()
                                case .groupInfo(let channelId):
                                    GroupInfoView(state: state, store: chat, follow: follow, channelId: channelId)
                                        .nodieDetailScreen()
                                }
                            }
                    }
                case .journey:
                    JourneyView(state: state)
                case .friends:
                    NavigationStack(path: $state.friendsPath) {
                        FriendsView(state: state, follow: follow, profileInitial: auth.profile?.initial ?? "?")
                            .nodieRootScreen()
                            .navigationDestination(for: FriendsRoute.self) { route in
                                switch route {
                                case .profile:
                                    ProfileView(auth: auth, qa: qa, qaPublic: flags.qaPublic).nodieDetailScreen()
                                case .member(let id):
                                    MemberProfileView(state: state, follow: follow, conversations: chat, memberId: id)
                                        .nodieDetailScreen()
                                }
                            }
                    }
                }
            }
            // Chừa chỗ cho tab bar nổi để nội dung cuối danh sách không bị che
            .padding(.bottom, state.showsTabBar ? 74 : 0)

            if state.showsTabBar {
                NodieTabBar(selection: state.tab, tabs: visibleTabs, unreadCount: chat.totalUnread) {
                    NodieHaptics.tap()
                    state.selectTab($0)
                }
            }
        }
        // Lỗi QAStore báo Ở ĐÂY, không ở từng màn.
        //
        // Trước kia alert nằm trong QuestionListView, mà RootTabView `switch state.tab` nên
        // tab nào không hiện thì màn đó KHÔNG tồn tại: lỗi sinh ra ở Cá nhân ("Đã lưu",
        // "Câu hỏi của tôi"…) không ai báo, danh sách rỗng trông y như "chưa có gì" — rồi
        // lúc user bấm sang tab Hỏi đáp, QuestionListView mới dựng và alert cũ nhảy ra ở
        // sai màn, sai lúc. Gốc cây luôn sống nên báo đúng một lần, ở bất kỳ tab nào.
        //
        // Binding hai chiều thật, KHÔNG `.constant`: với hằng số, SwiftUI không có đường
        // set về false nên tự nó không bao giờ đóng được alert — host của alert kẹt lại
        // như một lớp phủ vô hình nuốt sạch chạm của cả màn (app trông vẫn bình thường
        // nhưng bấm gì cũng không ăn). Đóng bằng cách nào cũng phải chảy về clearError().
        .alert("Lỗi", isPresented: Binding(
            get: { qa.errorMessage != nil },
            set: { if !$0 { qa.clearError() } }
        )) {
            Button("OK") { qa.clearError() }
        } message: { Text(qa.errorMessage ?? "") }
        // Lỗi FollowStore — cùng khuôn với alert qa ở trên, cùng lý do (gốc cây luôn sống,
        // binding hai chiều thật chứ không `.constant`). Alert riêng chứ không gộp chung
        // biến với `qa.errorMessage`: hai store độc lập, gộp lỗi sẽ phải bịa ra một enum
        // "lỗi của ai" chỉ để tách lại ngay sau đó.
        .alert("Lỗi", isPresented: Binding(
            get: { follow.errorMessage != nil },
            set: { if !$0 { follow.clearError() } }
        )) {
            Button("OK") { follow.clearError() }
        } message: { Text(follow.errorMessage ?? "") }
        // Lỗi ConversationStore — cùng khuôn hai alert trên.
        //
        // Thiếu nó thì `chat.errorMessage` là biến CHỈ GHI: store gán chuỗi lỗi rồi không ai
        // đọc. Chọn tệp 30MB → bị chặn đúng luật → màn hình không nhúc nhích, người dùng chọn
        // lại lần nữa, lại im. Lỗi từng bong bóng (ảnh upload hỏng) KHÔNG đi đường này —
        // chúng hiện ngay trên bong bóng kèm "Gửi lại"; đây chỉ dành cho lỗi không thuộc về
        // bong bóng nào (chặn quá cỡ, không đọc nổi tệp, không mở nổi tệp).
        .alert("Lỗi", isPresented: Binding(
            get: { chat.errorMessage != nil },
            set: { if !$0 { chat.clearError() } }
        )) {
            Button("OK") { chat.clearError() }
        } message: { Text(chat.errorMessage ?? "") }
        // "Đã xoá — Hoàn tác". Ở gốc cây, cùng lý do với alert ngay trên: xoá câu hỏi xong là
        // màn chi tiết bị pop, banner đặt trong màn đó chết theo trước khi ai kịp đọc.
        .nodieUndoBanner(qa: qa)
        // Hoàn tác xoá tin chat — gốc cây, cùng lý do với banner Q&A ở trên.
        .nodieChatUndoBanner(store: chat)
        // Đổi cỡ chữ → đổi identity → dựng lại toàn bộ cây với font mới.
        // `state` là @State của RootTabView nên nằm NGOÀI id: draft và path điều hướng
        // không mất khi user chỉnh cỡ chữ.
        .id(dynamicTypeSize)
        // Nhớ tab qua lần giết app (#20). Đặt SAU `.id(dynamicTypeSize)`: nằm trước thì mỗi
        // lần đổi cỡ chữ cây bị dựng lại, `.task` của modifier chạy lại và kéo user về tab
        // đã lưu — đang đứng ở Chat mà chỉnh cỡ chữ lại bị ném về Hỏi đáp.
        .nodieRestoresTab(state: state, role: auth.profile?.role, qaPublic: flags.qaPublic)
        // Không được đứng ở tab đã khoá. `initial: true` đỡ lúc mở app: default của
        // AppState là .qa mà user thường không có tab đó → đá về tab đầu tiên còn mở
        // (Chat) ngay nhịp dựng đầu. Khi profile về muộn hơn (role đổi nil → admin),
        // tab đang đứng vẫn hợp lệ nên không bị đá đi đâu — chỉ có thêm nút Hỏi đáp.
        .onChange(of: auth.profile?.role, initial: true) {
            if !visibleTabs.contains(state.tab), let fallback = visibleTabs.first {
                state.tab = fallback
            }
        }
        // Bấm push → mở đúng kênh.
        //
        // Phải có CẢ HAI, không bỏ cái nào:
        // `.task` cho lúc app đang TẮT HẲN — iOS giao cú bấm xong xuôi từ trước khi màn này
        // tồn tại, nên giá trị đã nằm sẵn ở đó và `.onChange` sẽ không bao giờ bắn.
        // `.onChange` cho lúc app đang chạy/nền — màn này đã sống, giá trị đổi sau.
        // Chỉ có `.onChange` là hỏng đúng đường vào phổ biến nhất của push.
        .task { consumePendingPush() }
        .onChange(of: push.pendingChannelId) { consumePendingPush() }
        // Vẽ danh sách kênh + badge tab Chat từ ĐĨA ngay khi app mở, trước khi mạng kịp trả
        // lời — ở gốc cây vì badge phải có mặt kể cả khi user chưa vào tab Chat.
        // Sync mạng vẫn do ConversationListView `.task` lo (điều kiện hasSyncedChannels).
        // Realtime cũng mở Ở ĐÂY: tin mới phải làm badge nhảy + kênh nổi lên đầu kể cả khi
        // đang đứng tab khác — subscription cấp màn chat thì rời màn là điếc.
        .task {
            // Tên mình cho payload typing (phase 06) — profile có thể về sau, onChange dưới bù.
            chat.myDisplayName = auth.profile?.displayName
            // Chữ cái đầu cho avatar ô trả lời Q&A — cùng lý do: store không giữ display_name.
            qa.currentUserInitial = auth.profile?.initial ?? "?"
            await chat.warmFromDisk()
            // Hỏi đáp cũng vẽ từ đĩa. SAU chat: badge tab Chat là thứ hiện ở mọi tab, còn
            // danh sách Hỏi đáp chỉ cần có mặt khi user đứng ở tab đó.
            await qa.warmFromDisk()
            await chat.startRealtime()
            // Cờ tính năng đọc MỘT lần ở đây: RootTabView chỉ tồn tại khi đã signedIn nên
            // `.task` này chạy đúng một lần lúc đăng nhập. Cuối chuỗi vì nó chỉ đổi hiển thị
            // tab, không cấp bách như badge/realtime; lỗi/offline giữ default (ẩn Q&A).
            await flags.load()
        }
        .onChange(of: auth.profile?.displayName) { _, name in
            chat.myDisplayName = name
            qa.currentUserInitial = auth.profile?.initial ?? "?"
        }
        // Socket không sống qua background. Về active: đập đi mở lại + fetch bù những gì
        // đến trong lúc vắng mặt — không có nhánh này thì tin đến khi app ở nền "mất tích"
        // trên màn cho tới lần kéo-refresh.
        //
        // Chỉ resume khi TRƯỚC ĐÓ thật sự xuống `.background` (cờ, vì đường về luôn là
        // background→inactive→active nên không đọc được từ `oldPhase`): kéo Notification
        // Center hay liếc app-switcher chỉ đi qua `.inactive` — đập socket + loadChannels
        // cho mỗi cú kéo là churn pin/mạng vô ích. Cold start cũng KHÔNG resume (cờ còn
        // false) — `.task` ở trên là đường mở duy nhất, khỏi đua nhau double-subscribe.
        .onChange(of: scenePhase) { _, phase in
            switch phase {
            case .background:
                wasInBackground = true
                Task { await chat.stopRealtime() }
            case .active:
                if wasInBackground {
                    wasInBackground = false
                    Task { await chat.resumeFromForeground() }
                }
            default: break
            }
        }
        // Cho PushManager biết chat nào đang HIỂN THỊ để willPresent nuốt banner của đúng
        // kênh đó (chuẩn WhatsApp — không réo hội thoại đang mở). `weak state`: push sống
        // đời app (AppDelegate giữ), state chết theo phiên đăng nhập — giữ mạnh là state cũ
        // không bao giờ được thả sau khi đăng xuất.
        .onAppear {
            push.visibleChannel = { [weak state] in
                guard let state, state.tab == .conversations,
                      case .chat(let id)? = state.chatsPath.last else { return nil }
                return id
            }
        }
        // Mạng về → gửi hàng đợi tin nhắn offline (phase 07). Ở gốc cây vì tin queued phải
        // đi kể cả khi người dùng đã rời màn chat sang tab khác.
        .onChange(of: NodieNetworkMonitor.shared.isOnline) { _, online in
            if online { Task { await chat.flushQueued() } }
        }
        // Banner offline Ở GỐC CÂY, MỘT lần cho cả app — không phải mỗi tab/màn tự mở
        // NWPathMonitor riêng (xem NodieNetworkMonitor). Modifier cuối cùng: bọc ngoài toàn
        // bộ cây đã có tab bar + alert, banner luôn nằm trên cùng bất kể đang ở tab nào.
        .nodieOfflineBanner()
    }

    /// Đọc RỒI xoá: không xoá thì quay lại tab Chat lần nào cũng bị ném vào kênh cũ,
    /// và cú bấm push từ tuần trước sống mãi.
    private func consumePendingPush() {
        guard let id = push.pendingChannelId else { return }
        push.pendingChannelId = nil
        state.openChat(id)
    }
}

#Preview {
    RootTabView(auth: AuthStore(), push: PushManager())
}
