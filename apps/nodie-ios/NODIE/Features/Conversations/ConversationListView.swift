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
    @State private var showNewGroup = false
    /// Nhóm vừa tạo — mở thẳng vào (giống openOrCreateDM). Đặt path sau khi sheet đóng.
    @State private var openGroupAfterCreate: UUID?

    /// Tìm kiếm (phase 12): kênh lọc local, tin nhắn hỏi server (ILIKE, debounce 300ms).
    @State private var searchText = ""
    @State private var searchHits: [ConversationStore.MessageSearchHit] = []
    /// Đang chờ server trả kết quả — chặn empty-state khẳng định "không có gì" trước khi
    /// server kịp nói.
    @State private var searchInFlight = false

    private var visible: [ChannelRow] {
        store.channels.filter { filter.matches($0) }
    }

    private var trimmedQuery: String {
        searchText.trimmingCharacters(in: .whitespacesAndNewlines)
    }
    private var isSearching: Bool { !trimmedQuery.isEmpty }
    private var channelMatches: [ChannelRow] {
        guard isSearching else { return [] }
        return store.channels.filter { $0.displayTitle.localizedCaseInsensitiveContains(trimmedQuery) }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            searchField

            ScrollViewReader { proxy in
            List {
                if isSearching {
                    searchSections
                } else {
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
                        // Một nút, hai chiều — theo trạng thái hiện tại của kênh, như Mail/
                        // Messenger. Bày cả "Đã đọc" lẫn "Chưa đọc" cùng lúc thì một trong hai
                        // luôn là nút vô nghĩa (đọc lại cái đã đọc).
                        if store.unread(for: channel.id) > 0 {
                            Button {
                                Task { await store.markRead(channelId: channel.id) }
                            } label: {
                                Label("Đã đọc", systemImage: "envelope.open")
                            }
                            .tint(NodieColors.accent)
                        } else {
                            Button {
                                Task { await store.markUnread(channelId: channel.id) }
                            } label: {
                                Label("Chưa đọc", systemImage: "envelope.badge")
                            }
                            .tint(NodieColors.accent)
                        }
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
            }
            .listStyle(.plain)
            .scrollContentBackground(.hidden)
            .background(NodieColors.bg)
            .refreshable { await store.loadChannels() }
            // Overlay thay vì if/else quanh List: giữ nguyên pull-to-refresh khi rỗng.
            // allowsHitTesting(false): chữ empty-state không được nuốt cú kéo refresh.
            // Lỗi nạp chỉ chặn màn khi CHƯA từng có kênh nào — cùng luật với FriendsView:
            // refresh hỏng lúc đã có dữ liệu thì giữ danh sách cũ, không đá người dùng ra.
            .overlay {
                if let error = store.loadError, store.channels.isEmpty {
                    errorState(error)
                } else if visible.isEmpty && !store.isLoading {
                    emptyState.allowsHitTesting(false)
                }
            }
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
        // Nạp một lần khi màn xuất hiện; quay lại tab không refetch — pull-to-refresh và
        // Realtime lo phần cập nhật. Điều kiện là `hasSyncedChannels` chứ KHÔNG phải
        // `channels.isEmpty`: cache đĩa (warmFromDisk) làm danh sách hết rỗng từ trước khi
        // mạng chạy, mà bản đĩa thì vẫn cần một lần sync server cho phiên này.
        .task { if !store.hasSyncedChannels { await store.loadChannels() } }
        // Debounce tìm tin nhắn: `.task(id:)` tự huỷ lượt cũ khi gõ tiếp — ngủ 300ms rồi mới
        // hỏi server, gõ nhanh không bắn một query mỗi phím. Kiểm cancel CẢ SAU await: lượt
        // cũ bị huỷ giữa chừng mà vẫn gán là kết quả cũ đè kết quả mới.
        .task(id: searchText) {
            let query = trimmedQuery
            guard query.count >= 2 else {
                searchHits = []
                searchInFlight = false
                return
            }
            searchInFlight = true
            try? await Task.sleep(for: .milliseconds(300))
            guard !Task.isCancelled else { return }
            let hits = await store.searchMessages(query)
            guard !Task.isCancelled else { return }
            searchHits = hits
            searchInFlight = false
        }
        // sheet được (khác màn Chiếu câu hỏi dùng fullScreenCover): chọn người là thao tác
        // một chạm, vuốt xuống đóng nhầm cũng không mất gì đang gõ dở.
        .sheet(isPresented: $showNewMessage) { NewMessageView(state: state, store: store, follow: follow) }
        .sheet(isPresented: $showNewGroup) {
            GroupComposeView(mode: .create, store: store, follow: follow) { title, memberIds in
                Task {
                    if let channelId = await store.createGroup(title: title, memberIds: memberIds) {
                        openGroupAfterCreate = channelId
                    }
                }
            }
        }
        .onChange(of: openGroupAfterCreate) { _, channelId in
            guard let channelId else { return }
            openGroupAfterCreate = nil
            state.openChat(channelId)
        }
    }

    /// Tắt thông báo tới bao giờ. Prototype không có màn chọn thời hạn nên chọn một mốc xa —
    /// "tắt" theo nghĩa người dùng hiểu là tắt hẳn cho tới khi bật lại.
    private static var muteHorizon: Date { Date(timeIntervalSinceNow: 60 * 60 * 24 * 365 * 10) }

    // MARK: - Tìm kiếm (phase 12)

    private var searchField: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(NodieColors.inkFaint)
            TextField("Tìm kênh, tin nhắn…", text: $searchText)
                .font(NodieTypography.body)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
            if !searchText.isEmpty {
                Button {
                    searchText = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(NodieColors.inkFaint)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Xoá từ khoá")
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 9)
        .background(RoundedRectangle(cornerRadius: 12).fill(NodieColors.surface))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(NodieColors.rule, lineWidth: 1))
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.bottom, 8)
    }

    /// Hai section kết quả: kênh (lọc local) + tin nhắn (server). Tap mở kênh — v1 mở ở
    /// đáy, chưa nhảy tới đúng tin (đã ghi trong phase 12).
    @ViewBuilder private var searchSections: some View {
        if !channelMatches.isEmpty {
            Section {
                ForEach(channelMatches) { channel in
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
                }
            } header: { searchHeader("Hội thoại") }
        }
        if !searchHits.isEmpty {
            Section {
                ForEach(searchHits) { hit in
                    Button {
                        // Mở kênh VÀ nhảy tới đúng tin (phase 18) — không chỉ mở ở đáy.
                        state.openChat(hit.channelId, scrollTo: hit.id)
                    } label: {
                        VStack(alignment: .leading, spacing: 3) {
                            HStack {
                                Text(store.channel(id: hit.channelId)?.displayTitle
                                     ?? String(localized: "Hội thoại"))
                                    .font(NodieTypography.chip.weight(.semibold))
                                    .foregroundStyle(NodieColors.ink)
                                Spacer()
                                Text(RelativeTime.format(hit.createdAt))
                                    .font(NodieTypography.tag)
                                    .foregroundStyle(NodieColors.inkFaint)
                            }
                            Text(hit.body ?? "")
                                .font(NodieTypography.body)
                                .foregroundStyle(NodieColors.inkMuted)
                                .lineLimit(2)
                                .multilineTextAlignment(.leading)
                        }
                        .padding(.vertical, 8)
                    }
                    .listRowInsets(EdgeInsets(top: 0, leading: NodieSpacing.screenH,
                                              bottom: 0, trailing: NodieSpacing.screenH))
                    .listRowBackground(NodieColors.bg)
                    .listRowSeparator(.hidden)
                    .overlay(alignment: .bottom) {
                        Divider().background(NodieColors.ruleLight)
                    }
                }
            } header: { searchHeader("Tin nhắn") }
        }
        if channelMatches.isEmpty && searchHits.isEmpty {
            Group {
                // <2 ký tự: tìm TIN NHẮN chưa chạy (task chờ đủ 2 ký tự) → chưa được khẳng
                // định "không có gì", chỉ mới lọc kênh xong. Đang chờ server cũng vậy.
                if searchInFlight || trimmedQuery.count < 2 {
                    ProgressView().tint(NodieColors.inkFaint)
                } else {
                    Text("Không tìm thấy gì.")
                        .font(NodieTypography.body)
                        .foregroundStyle(NodieColors.inkMuted)
                }
            }
            .frame(maxWidth: .infinity, alignment: .center)
            .padding(.top, NodieSpacing.xl)
            .listRowBackground(NodieColors.bg)
            .listRowSeparator(.hidden)
        }
    }

    private func searchHeader(_ title: LocalizedStringKey) -> some View {
        Text(title)
            .font(NodieTypography.tag.weight(.bold))
            .foregroundStyle(NodieColors.inkFaint)
            .textCase(.uppercase)
    }

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

    /// Lỗi vẽ tại chỗ, không alert gốc — cùng khuôn `FriendsView.errorState`.
    /// `NodieErrorKind` quyết có nên mời "Thử lại"; nút còn bị khoá thêm khi đang offline
    /// (mời thử lại lúc mất mạng là hứa suông).
    private func errorState(_ error: NodieErrorKind) -> some View {
        VStack(spacing: NodieSpacing.sm) {
            Image(systemName: error == .offline ? "wifi.slash" : "exclamationmark.triangle")
                .font(.system(size: 30)).foregroundStyle(NodieColors.inkFaint)
            Text(error.message)
                .font(NodieTypography.body).foregroundStyle(NodieColors.inkMuted)
                .multilineTextAlignment(.center)
            if error.isRetryable {
                Button {
                    Task { await store.loadChannels() }
                } label: {
                    Text("Thử lại")
                        .font(NodieTypography.chip.weight(.bold))
                        .foregroundStyle(NodieColors.onAccent)
                        .padding(.horizontal, NodieSpacing.lg)
                        .padding(.vertical, 9)
                        .background(Capsule().fill(NodieColors.accent))
                        .expandedHitArea(visual: 34)
                }
                .buttonStyle(.plain)
                .disabled(!NodieNetworkMonitor.shared.isOnline)
                .opacity(NodieNetworkMonitor.shared.isOnline ? 1 : 0.5)
            }
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(NodieColors.bg)
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
        case .video: return String(localized: "▶ Video")
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
                Menu {
                    Button {
                        showNewMessage = true
                    } label: {
                        Label("Tin nhắn mới", systemImage: "bubble.left")
                    }
                    Button {
                        showNewGroup = true
                    } label: {
                        Label("Tạo nhóm", systemImage: "person.3")
                    }
                } label: {
                    Image(systemName: "square.and.pencil")
                        .font(.system(size: 15))
                        .foregroundStyle(NodieColors.cream)
                        .frame(width: 36, height: 36)
                        .background(Circle().fill(NodieColors.ink))
                }
                .accessibilityLabel("Soạn tin nhắn hoặc tạo nhóm")
            }

            FilterChipRow(options: ConversationFilter.allCases, selection: $filter)
                .padding(.top, 14)
                .padding(.bottom, 10)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
    }
}
