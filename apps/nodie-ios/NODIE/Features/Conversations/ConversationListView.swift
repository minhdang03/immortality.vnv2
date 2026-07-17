import SwiftUI

/// Chat — kênh, nhóm và tin nhắn 1-1 trong một danh sách có lọc.
///
/// Dùng `List` chứ không `LazyVStack`: `.swipeActions` chỉ chạy trong List.
/// Toàn bộ style mặc định của List bị tắt để giữ nguyên thiết kế prototype.
///
/// Dữ liệu đến từ `ConversationStore` (Supabase thật). `state` chỉ còn để điều hướng
/// (`chatsPath`) và bắt nhịp cuộn-lên-đầu — không giữ nội dung hội thoại nữa.
struct ConversationListView: View {
    @Bindable var state: AppState
    let store: ConversationStore
    /// Chỉ để chuyển tiếp xuống NewMessageView (chọn người để nhắn) — màn danh sách
    /// không tự dùng.
    let follow: FollowStore
    @State private var filter: ConversationFilter = .all
    @State private var showNewMessage = false

    private var visible: [ChannelRow] {
        store.channels.filter { filter.matches($0) }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            ScrollViewReader { proxy in
            List {
                ForEach(visible) { channel in
                    ConversationRowView(
                        channel: channel,
                        preview: preview(for: channel),
                        unread: store.unread(for: channel.id),
                        isMuted: channel.isMuted
                    ) {
                        state.openChat(channel.id)
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
                            Task { await store.leave(channelId: channel.id) }
                        } label: {
                            Label("Rời khỏi", systemImage: "rectangle.portrait.and.arrow.right")
                        }

                        Button {
                            Task { await store.setMuted(channelId: channel.id,
                                                        until: channel.isMuted ? nil : Self.muteHorizon) }
                        } label: {
                            Label(channel.isMuted ? String(localized: "Bật lại") : String(localized: "Tắt thông báo"),
                                  systemImage: channel.isMuted ? "bell" : "bell.slash")
                        }
                        .tint(NodieColors.inkMuted)
                    }
                    .swipeActions(edge: .leading, allowsFullSwipe: true) {
                        Button {
                            Task { await store.markRead(channelId: channel.id) }
                        } label: {
                            Label("Đã đọc", systemImage: "envelope.open")
                        }
                        .tint(NodieColors.accent)
                    }
                    // Cùng ba việc của hai cụm vuốt trên, mở bằng cách giữ. Vuốt là cử chỉ
                    // GIẤU: không có gì trên màn hình nói nó tồn tại. Ai không biết vuốt —
                    // hoặc dùng VoiceOver/Switch Control — vẫn phải tới được ba việc đó.
                    .contextMenu {
                        Button {
                            Task { await store.markRead(channelId: channel.id) }
                        } label: {
                            Label("Đã đọc", systemImage: "envelope.open")
                        }

                        Button {
                            Task { await store.setMuted(channelId: channel.id,
                                                        until: channel.isMuted ? nil : Self.muteHorizon) }
                        } label: {
                            Label(channel.isMuted ? String(localized: "Bật lại") : String(localized: "Tắt thông báo"),
                                  systemImage: channel.isMuted ? "bell" : "bell.slash")
                        }

                        Button(role: .destructive) {
                            Task { await store.leave(channelId: channel.id) }
                        } label: {
                            Label("Rời khỏi", systemImage: "rectangle.portrait.and.arrow.right")
                        }
                    }
                }
            }
            .listStyle(.plain)
            .scrollContentBackground(.hidden)
            .background(NodieColors.bg)
            .refreshable { await store.loadChannels() }
            // Overlay thay vì if/else quanh List: giữ nguyên pull-to-refresh khi rỗng.
            // allowsHitTesting(false): chữ empty-state không được nuốt cú kéo refresh.
            .overlay { if visible.isEmpty && !store.isLoading { emptyState.allowsHitTesting(false) } }
            // Chạm lại tab khi đã ở root → cuộn lên đầu — cùng hành vi với QA/Bạn bè.
            // Neo vào dòng đầu (row đã có id từ ForEach Identifiable), không cần .id("top").
            .onChange(of: state.rootScrollTick) {
                if let first = visible.first {
                    withAnimation(.easeOut(duration: 0.25)) { proxy.scrollTo(first.id, anchor: .top) }
                }
            }
            }
        }
        .background(NodieColors.bg)
        // Nạp một lần khi màn xuất hiện. `channels.isEmpty` để quay lại tab không refetch —
        // pull-to-refresh và Realtime lo phần cập nhật.
        .task { if store.channels.isEmpty { await store.loadChannels() } }
        // sheet được (khác màn Chiếu câu hỏi dùng fullScreenCover): chọn người là thao tác
        // một chạm, vuốt xuống đóng nhầm cũng không mất gì đang gõ dở.
        .sheet(isPresented: $showNewMessage) { NewMessageView(state: state, store: store, follow: follow) }
    }

    /// Tắt thông báo tới bao giờ. Prototype không có màn chọn thời hạn nên chọn một mốc xa —
    /// "tắt" theo nghĩa người dùng hiểu là tắt hẳn cho tới khi bật lại.
    private static var muteHorizon: Date { Date(timeIntervalSinceNow: 60 * 60 * 24 * 365 * 10) }

    /// Xoá/rời hết, hoặc bộ lọc không khớp cuộc nào — màn trống trơn thì user
    /// không phân biệt được "không có gì" với "đang tải".
    private var emptyState: some View {
        VStack(spacing: NodieSpacing.sm) {
            Image(systemName: "bubble.left.and.bubble.right")
                .font(.system(size: 30))
                .foregroundStyle(NodieColors.inkFaint)
            (filter == .all ? Text("Chưa có cuộc trò chuyện nào.")
                            : Text("Không có cuộc nào trong mục này."))
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.inkMuted)
            Text("Bấm ✎ góc trên để bắt đầu.")
                .font(NodieTypography.metaSm)
                .foregroundStyle(NodieColors.inkFaint)
        }
    }

    /// Preview = tin cuối, gắn tiền tố "Bạn: " hoặc tên rút gọn của người gửi.
    private func preview(for channel: ChannelRow) -> String {
        guard let last = store.messages(for: channel.id).last else { return "" }
        let text = last.body?.isEmpty == false ? last.body! : (last.media.map(Self.mediaLabel) ?? "")
        if last.userId == store.currentUserId { return String(localized: "Bạn: \(text)") }
        if let shortName = last.author?.name.split(separator: " ").last {
            return "\(shortName): \(text)"
        }
        return text
    }

    /// Ảnh/thoại không có chữ để trích — mượn nhãn của chúng, vì preview rỗng thì dòng
    /// hội thoại trông như chưa có tin nào.
    private static func mediaLabel(_ media: MessageMedia) -> String {
        switch media.kind {
        case .photo: return String(localized: "▣ Ảnh")
        case .file:  return String(localized: "▤ Tệp đính kèm")
        case .voice: return String(localized: "▶ Tin nhắn thoại")
        }
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
