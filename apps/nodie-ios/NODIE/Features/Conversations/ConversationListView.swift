import SwiftUI

/// Chat — kênh, nhóm và tin nhắn 1-1 trong một danh sách có lọc.
///
/// Dùng `List` chứ không `LazyVStack`: `.swipeActions` chỉ chạy trong List.
/// Toàn bộ style mặc định của List bị tắt để giữ nguyên thiết kế prototype.
struct ConversationListView: View {
    @Bindable var state: AppState
    @State private var filter: ConversationFilter = .all
    @State private var showNewMessage = false

    private var visible: [Conversation] {
        state.conversations.filter { filter.matches($0) }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            List {
                ForEach(visible) { conversation in
                    ConversationRowView(
                        conversation: conversation,
                        preview: preview(for: conversation),
                        isMuted: state.isMuted(conversation.id)
                    ) {
                        state.openChat(conversation.id)
                    }
                    .listRowInsets(EdgeInsets(top: 0, leading: NodieSpacing.screenH,
                                              bottom: 0, trailing: NodieSpacing.screenH))
                    .listRowBackground(NodieColors.bg)
                    .listRowSeparator(.hidden)
                    // KHÔNG thêm padding ngang ở đây — listRowInsets đã áp screenH rồi,
                    // cộng nữa là kẻ bị thụt gấp đôi (đã dính lỗi này một lần).
                    .overlay(alignment: .bottom) {
                        Divider().background(NodieColors.ruleLight)
                    }
                    .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                        Button(role: .destructive) {
                            state.leave(conversation.id)
                        } label: {
                            Label("Rời khỏi", systemImage: "rectangle.portrait.and.arrow.right")
                        }

                        Button {
                            state.toggleMute(conversation.id)
                        } label: {
                            Label(state.isMuted(conversation.id) ? "Bật lại" : "Tắt thông báo",
                                  systemImage: state.isMuted(conversation.id) ? "bell" : "bell.slash")
                        }
                        .tint(NodieColors.inkMuted)
                    }
                    .swipeActions(edge: .leading, allowsFullSwipe: true) {
                        Button {
                            state.markRead(conversation.id)
                        } label: {
                            Label("Đã đọc", systemImage: "envelope.open")
                        }
                        .tint(NodieColors.accent)
                    }
                }
            }
            .listStyle(.plain)
            .scrollContentBackground(.hidden)
            .background(NodieColors.bg)
            .refreshable { await state.refresh() }
        }
        .background(NodieColors.bg)
        // sheet được (khác màn Chiếu câu hỏi dùng fullScreenCover): chọn người là thao tác
        // một chạm, vuốt xuống đóng nhầm cũng không mất gì đang gõ dở.
        .sheet(isPresented: $showNewMessage) { NewMessageView(state: state) }
    }

    /// Preview = tin cuối, gắn tiền tố "Bạn: " hoặc tên rút gọn của người gửi.
    private func preview(for c: Conversation) -> String {
        guard let last = state.messages(for: c.id).last else { return "" }
        if last.isMine { return String(localized: "Bạn: \(last.text)") }
        if let who = last.who, let shortName = who.split(separator: " ").last {
            return "\(shortName): \(last.text)"
        }
        return last.text
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("Chat")
                    .font(NodieTypography.screenTitle)
                    .foregroundStyle(NodieColors.ink)
                Spacer()
                Button {
                    showNewMessage = true
                } label: {
                    Image(systemName: "square.and.pencil")
                        .font(.system(size: 15))
                        .foregroundStyle(NodieColors.cream)
                        .frame(width: 36, height: 36)
                        .background(Circle().fill(NodieColors.ink))
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Soạn tin nhắn mới")
            }

            FilterChipRow(options: ConversationFilter.allCases, selection: $filter)
                .padding(.top, 14)
                .padding(.bottom, 10)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
    }
}

#Preview {
    ConversationListView(state: AppState())
}
