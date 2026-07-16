import SwiftUI

/// Khung gốc — mỗi tab một NavigationStack riêng (pattern của FB/IG/X),
/// tab bar nổi đè lên trên và ẩn khi push vào detail.
struct RootTabView: View {
    @Bindable var auth: AuthStore
    @State private var state = AppState()
    /// Hỏi đáp wire dữ liệu thật (Supabase) — store riêng, không kéo prototype ở AppState.
    @State private var qa = QAStore()

    /// Cỡ chữ hệ thống. Đọc ở đây để cả cây view dựng lại khi user đổi cỡ chữ —
    /// font trong NodieTypography là giá trị đã tính sẵn, không tự biết mình cũ.
    /// Không có chỗ nào đọc biến này thì SwiftUI bỏ qua việc dựng lại → chữ đứng im.
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

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
                                    ProfileView(auth: auth, qa: qa).nodieDetailScreen()
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
                        ConversationListView(state: state)
                            .nodieRootScreen()
                            .navigationDestination(for: ChatRoute.self) { route in
                                switch route {
                                case .chat(let chatId):
                                    ChatDetailView(state: state, chatId: chatId)
                                        .nodieDetailScreen()
                                case .member(let id):
                                    MemberProfileView(state: state, memberId: id).nodieDetailScreen()
                                }
                            }
                    }
                case .journey:
                    JourneyView(state: state)
                case .friends:
                    NavigationStack(path: $state.friendsPath) {
                        FriendsView(state: state, profileInitial: auth.profile?.initial ?? "?")
                            .nodieRootScreen()
                            .navigationDestination(for: FriendsRoute.self) { route in
                                switch route {
                                case .profile:
                                    ProfileView(auth: auth, qa: qa).nodieDetailScreen()
                                case .member(let id):
                                    MemberProfileView(state: state, memberId: id).nodieDetailScreen()
                                }
                            }
                    }
                }
            }
            // Chừa chỗ cho tab bar nổi để nội dung cuối danh sách không bị che
            .padding(.bottom, state.showsTabBar ? 74 : 0)

            if state.showsTabBar {
                NodieTabBar(selection: state.tab, unreadCount: state.totalUnread) {
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
        // Đổi cỡ chữ → đổi identity → dựng lại toàn bộ cây với font mới.
        // `state` là @State của RootTabView nên nằm NGOÀI id: draft và path điều hướng
        // không mất khi user chỉnh cỡ chữ.
        .id(dynamicTypeSize)
    }
}

#Preview {
    RootTabView(auth: AuthStore())
}
