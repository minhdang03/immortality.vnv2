import PhotosUI          // PhotosPicker + PhotosPickerItem
import SwiftUI
import UIKit             // UIPasteboard — SwiftUI không re-export
import UniformTypeIdentifiers   // UTType.item cho fileImporter

/// Xem trước ngắn cho một `MessageRow` — dùng ở băng "Đang trả lời …", trích dẫn trong
/// bong bóng, và chính bong bóng tin thoại (chưa phát được thì nó chỉ là một dòng chữ).
///
/// Extension ở ĐÂY chứ không trong ConversationModels.swift: file đó chỉ biết những gì DB
/// có (xem chú thích đầu file đó), còn "tóm tắt để hiện" là quyết định của tầng view.
extension MessageRow {
    var previewText: String {
        guard let media else { return body ?? "" }
        switch media.kind {
        case .photo: return "▣ " + String(localized: "Ảnh")
        case .file: return "▤ " + String(localized: "Tệp đính kèm")
        case .voice:
            let duration = media.durationLabel.map { " · \($0)" } ?? ""
            return "▶ " + String(localized: "Tin nhắn thoại") + duration
        }
    }
}

/// Chat chi tiết — bong bóng tin nhắn + ô nhập, hoặc khoá nếu là kênh phát một chiều.
/// Thoát bằng nút back tròn HOẶC vuốt cạnh trái (NavigationStack lo).
struct ChatDetailView: View {
    @Bindable var state: AppState
    let store: ConversationStore
    let channelId: UUID

    @Environment(\.dismiss) private var dismiss
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @FocusState private var inputFocused: Bool

    /// Đang ở sát đáy hay không — quyết định tin mới được cuộn tới hay chỉ báo bằng nút.
    /// Mặc định `true`: mở chat là đang ở đáy (xem `.onAppear` bên dưới).
    @State private var atBottom = true
    /// Số tin đến trong lúc đang đọc ngược lên. 0 = không hiện nút.
    @State private var unseen = 0
    /// Tin đang sửa (nợ plan 1306 #15) — non-nil mở hộp thoại sửa. Alert đơn giản hơn dựng
    /// lại nguyên băng "Đang trả lời" cho một thao tác hiếm dùng.
    @State private var editingMessage: MessageRow?
    @State private var editText = ""

    // MARK: - Đính kèm

    /// Ảnh đang chọn từ thư viện. `PhotosPicker` trả `PhotosPickerItem` (mã tham chiếu), phải
    /// `loadTransferable` mới ra bytes — xem `sendPickedPhotos`.
    @State private var photoItems: [PhotosPickerItem] = []
    @State private var photosPresented = false
    @State private var cameraPresented = false
    @State private var filePresented = false
    /// Quyền máy ảnh đã bị từ chối — mở sheet chỉ đường ra Cài đặt.
    @State private var cameraDenied = false
    /// Ảnh đang xem toàn màn.
    @State private var viewingPhoto: ChatPhotoSource?
    /// Tệp đã tải về thư mục tạm, sẵn sàng cho QuickLook.
    @State private var previewingFile: URL?
    /// Đang tải tệp về để mở — chặn chạm hai lần vào cùng một bong bóng.
    @State private var openingFile = false

    // MARK: - Thoại

    /// Một recorder cho mỗi màn chat: nó cầm AVAudioSession, và hai màn cùng ghi là vô nghĩa.
    @State private var recorder = VoiceRecorder()
    /// Quyền mic đã bị từ chối — sheet chỉ đường ra Cài đặt.
    @State private var micDenied = false
    /// Player dùng CHUNG cả app: phát tin mới thì tin cũ phải im.
    private var player: VoiceMessagePlayer { .shared }

    /// Mốc đáy để cuộn tới. Cuộn vào MỐC chứ không vào tin cuối: tin cuối có thể cao
    /// (ảnh, trích dẫn, hàng cảm xúc) và `anchor: .bottom` của nó vẫn hụt mất phần đệm dưới.
    private static let bottomAnchor = "bottomAnchor"
    /// "Tắt thông báo" không có màn chọn thời hạn — chọn một mốc xa, đồng bộ với
    /// ConversationListView (mỗi file giữ hằng số riêng, tránh kéo thêm phụ thuộc chéo).
    private static var muteHorizon: Date { Date(timeIntervalSinceNow: 60 * 60 * 24 * 365 * 10) }

    private var channel: ChannelRow? { store.channel(id: channelId) }
    private var messages: [MessageRow] { store.messages(for: channelId) }
    private var hasDraft: Bool {
        !state.draft(in: channelId).trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    /// Tôn trọng Giảm chuyển động: `withAnimation(nil)` là nhảy thẳng, không phải đứng im.
    private var motion: Animation? { reduceMotion ? nil : .easeOut(duration: 0.2) }

    /// Draft của riêng chat này. Viết tay vì `$state.drafts[channelId]` cho Binding<String?>,
    /// còn TextField cần Binding<String>.
    private var draft: Binding<String> {
        Binding(
            get: { state.draft(in: channelId) },
            set: { state.drafts[channelId] = $0 }
        )
    }

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(Array(messages.enumerated()), id: \.element.id) { index, message in
                            let isMine = message.userId == store.currentUserId
                            let target = replyTarget(of: message)
                            // Sửa/xoá chỉ có ý nghĩa với tin CỦA MÌNH — nil ẩn hẳn mục khỏi
                            // menu thay vì hiện rồi disable.
                            //
                            // Khai kiểu RÕ RÀNG và tách khỏi lời gọi: `isMine ? { … } : nil`
                            // viết thẳng trong tham số thì Swift không suy ra nổi
                            // `(() -> Void)?` từ (closure literal, nil) — nó bỏ cuộc và đổ
                            // lỗi "ambiguous use of 'init'" lên tận `ScrollView` ở trên,
                            // cách chỗ sai 40 dòng.
                            let onEdit: (() -> Void)? = isMine ? {
                                editText = message.body ?? ""
                                editingMessage = message
                            } : nil
                            let onDelete: (() -> Void)? = isMine ? {
                                Task { await store.deleteMessage(messageId: message.id, channelId: channelId) }
                            } : nil

                            MessageBubbleView(
                                message: message,
                                isMine: isMine,
                                senderLabel: senderLabel(at: index),
                                replyTarget: target,
                                replyTargetIsMine: target?.userId == store.currentUserId,
                                myReactions: message.myReactions(uid: store.currentUserId),
                                reduceMotion: reduceMotion,
                                pending: store.pending(for: message.id),
                                recordingActive: state.recording,
                                onReply: { state.startReply(to: message.id, in: channelId) },
                                onReact: { kind in
                                    Task { await store.toggleReaction(messageId: message.id, channelId: channelId, kind: kind) }
                                },
                                onTapReplyQuote: { parentId in
                                    withAnimation(motion) { proxy.scrollTo(parentId, anchor: .center) }
                                },
                                onEdit: onEdit,
                                onDelete: onDelete,
                                onRetryMedia: { Task { await store.retryMedia(messageId: message.id) } },
                                onDiscardMedia: { store.discardMedia(messageId: message.id) },
                                onOpenMedia: { media in open(media, of: message) }
                            )
                            .padding(.top, index > 0 ? 10 : 0)
                            .id(message.id)
                        }

                        // Mốc đáy kiêm cảm biến "đang ở đáy". LazyVStack chỉ dựng nó khi cuộn
                        // tới gần cuối, nên onAppear/onDisappear CHÍNH LÀ tín hiệu gần-đáy —
                        // không phải đo contentOffset thủ công (onScrollGeometryChange là iOS 18,
                        // app này còn đỡ iOS 17).
                        Color.clear
                            .frame(height: 1)
                            .id(Self.bottomAnchor)
                            .onAppear { atBottom = true; unseen = 0 }
                            .onDisappear { atBottom = false }
                    }
                    .padding(.horizontal, 18)
                    .padding(.vertical, 14)
                }
                // Kéo xuống là bàn phím hạ theo ngón tay — chuẩn iMessage/Messenger.
                .scrollDismissesKeyboard(.interactively)
                .onChange(of: messages.count) { old, new in
                    guard let last = messages.last else { return }
                    // Đang ở đáy → theo tin mới. Đang đọc ngược lên → ĐỨNG YÊN, chỉ đếm.
                    // Giật màn hình của người đang đọc là cách nhanh nhất làm họ mất chỗ.
                    // Ngoại lệ: tin của CHÍNH MÌNH luôn kéo xuống — bấm gửi là đã tỏ ý muốn thấy nó.
                    if atBottom || last.userId == store.currentUserId {
                        withAnimation(motion) { proxy.scrollTo(Self.bottomAnchor, anchor: .bottom) }
                    } else if new > old {
                        withAnimation(motion) { unseen += new - old }
                    }
                }
                .onAppear {
                    // Mở chat phải thấy NGAY tin mới nhất, không phải tự cuộn xuống.
                    // Không animation: đây là vị trí xuất phát, không phải chuyển động.
                    proxy.scrollTo(Self.bottomAnchor, anchor: .bottom)
                }
                .overlay(alignment: .bottom) { newMessagesPill(proxy) }
            }

            inputBar
        }
        .background(NodieColors.bg)
        // Nạp tin, mở Realtime, đánh dấu đã đọc — theo đúng thứ tự: có tin rồi mới nghe tin
        // mới, đọc tin rồi mới báo đã đọc.
        .task {
            await store.loadMessages(channelId: channelId)
            await store.subscribe(to: channelId)
            await store.markRead(channelId: channelId)
        }
        // Đóng kênh Realtime khi rời màn — không đóng thì rò subscription (xem
        // ConversationStoreRealtime.swift).
        .onDisappear {
            Task { await store.unsubscribe(from: channelId) }
            // Rời màn thì im: giọng nói vẫn phát khi người ta đã sang chỗ khác là hành vi
            // không ai muốn. Đang ghi dở mà thoát → huỷ, đừng để recorder giữ mic lại.
            player.stop()
            if state.recording { cancelRecording() }
        }
        .sheet(isPresented: $micDenied) {
            PermissionDeniedSheet(
                title: "Cần quyền micro",
                message: "Bật quyền micro trong Cài đặt để ghi và gửi tin nhắn thoại."
            )
        }
        .alert("Sửa tin nhắn", isPresented: Binding(
            get: { editingMessage != nil },
            set: { if !$0 { editingMessage = nil } }
        )) {
            TextField("Nhắn tin…", text: $editText)
            Button("Huỷ", role: .cancel) { editingMessage = nil }
            Button("Lưu") {
                guard let target = editingMessage else { return }
                let channelId = channelId
                Task {
                    await store.edit(messageId: target.id, channelId: channelId, body: editText)
                    editingMessage = nil
                }
            }
        }
        .modifier(ChatMediaFlows(
            photoItems: $photoItems,
            photosPresented: $photosPresented,
            cameraPresented: $cameraPresented,
            filePresented: $filePresented,
            cameraDenied: $cameraDenied,
            viewingPhoto: $viewingPhoto,
            previewingFile: $previewingFile,
            onPickedPhotos: { items in await sendPickedPhotos(items) },
            onCaptured: { image in
                guard let encoded = await Task.detached(priority: .userInitiated, operation: {
                    ChatImageProcessor.encode(image)
                }).value else { return }
                sendPhoto(encoded)
            },
            onPickedFile: { result in await sendPickedFile(result) }
        ))
    }

    /// Tin mà `message` đang trả lời — nil nếu không trả lời ai, hoặc tin gốc đã trôi khỏi
    /// khoảng đã nạp (nạp 50 tin/lượt). Trôi mất thì bong bóng chỉ mất phần trích dẫn,
    /// không phải hiện một ô rỗng khó hiểu.
    private func replyTarget(of message: MessageRow) -> MessageRow? {
        guard let parentId = message.parentId else { return nil }
        return messages.first { $0.id == parentId }
    }

    /// Nhãn tên người gửi phía trên bong bóng — chỉ hiện ở tin ĐẦU của một chuỗi cùng người,
    /// và không hiện cho tin của chính mình (đã đủ biết là mình qua căn lề phải).
    private func senderLabel(at index: Int) -> String? {
        let message = messages[index]
        guard message.userId != store.currentUserId else { return nil }
        if index > 0, messages[index - 1].userId == message.userId { return nil }
        return message.authorName
    }

    /// "↓ N tin mới" — hợp đồng đổi lại việc KHÔNG giật màn hình: không kéo người đọc đi,
    /// nhưng cũng không giấu chuyện có tin đến.
    @ViewBuilder
    private func newMessagesPill(_ proxy: ScrollViewProxy) -> some View {
        if unseen > 0 {
            Button {
                withAnimation(motion) { proxy.scrollTo(Self.bottomAnchor, anchor: .bottom) }
                unseen = 0
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: "arrow.down")
                        .font(.system(size: 11, weight: .bold))
                    // KHÔNG `inflect:` — automatic grammar agreement của Apple không phủ
                    // tiếng Nga, mà tiếng Nga có 3 dạng số nhiều (1 сообщение / 2 сообщения /
                    // 5 сообщений). Khai plural variation trong catalog mới đúng cho cả 9 thứ tiếng.
                    Text("\(unseen) tin mới")
                        .font(NodieTypography.tag.weight(.semibold))
                }
                .foregroundStyle(NodieColors.cream)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Capsule().fill(NodieColors.ink))
                .shadow(color: .black.opacity(0.18), radius: 8, y: 2)
            }
            .buttonStyle(.plain)
            .padding(.bottom, 10)
            .accessibilityIdentifier("newMessagesPill")
            .transition(reduceMotion ? .opacity : .move(edge: .bottom).combined(with: .opacity))
        }
    }

    private var header: some View {
        HStack(spacing: NodieSpacing.md) {
            CircleIconButton(systemName: "arrow.left") { dismiss() }

            if let channel {
                ConversationAvatar(channel: channel, size: 40, fontSize: 18)
                VStack(alignment: .leading, spacing: 1) {
                    Text(channel.displayTitle)
                        .font(NodieTypography.chatName)
                        .foregroundStyle(NodieColors.ink)
                        .lineLimit(1)
                    // DM không có nhãn (đã đủ biết "là ai" qua tên) — chỉ kênh/nhóm mới hiện.
                    if let kindLabel = channel.kindLabel {
                        Text(kindLabel)
                            .font(NodieTypography.metaSm)
                            .foregroundStyle(NodieColors.inkMuted)
                            .lineLimit(1)
                    }
                }
            }

            Spacer(minLength: NodieSpacing.sm)

            chatMenu
        }
        .padding(.horizontal, 18)
        .padding(.top, NodieSpacing.screenTop)
        .padding(.bottom, NodieSpacing.md)
        .background(NodieColors.bg)
        .overlay(alignment: .bottom) { Divider().background(NodieColors.rule) }
    }

    /// Menu ⋯ — hồ sơ/thông tin, tắt thông báo, xoá.
    private var chatMenu: some View {
        Menu {
            if channel?.kind == "dm" {
                // Tìm người kia qua `members(of:)` (RLS `members_read` cho thành viên thấy
                // nhau) rồi push hồ sơ — back quay về đúng khung chat này.
                Button("Xem hồ sơ") {
                    Task {
                        let members = await store.members(of: channelId)
                        guard let peer = members.first(where: { $0.id != store.currentUserId })
                        else { return }
                        state.chatsPath.append(ChatRoute.member(peer.id))
                    }
                }
            } else {
                Button("Thông tin nhóm") {
                    state.chatsPath.append(ChatRoute.groupInfo(channelId))
                }
            }
            Button(channel?.isMuted == true ? String(localized: "Bật thông báo") : String(localized: "Tắt thông báo")) {
                Task { await store.setMuted(channelId: channelId, until: channel?.isMuted == true ? nil : Self.muteHorizon) }
            }
            Button("Xoá cuộc trò chuyện", role: .destructive) {
                Task {
                    await store.leave(channelId: channelId)
                    dismiss()
                }
            }
        } label: {
            Image(systemName: "ellipsis")
                .font(.system(size: 16))
                .foregroundStyle(NodieColors.inkMuted)
                .expandedHitArea(visual: 24)
        }
        .accessibilityLabel("Tuỳ chọn hội thoại")
    }

    @ViewBuilder
    private var inputBar: some View {
        VStack(spacing: 0) {
            if channel?.canPost == true {
                if state.recording {
                    recordingBar
                } else {
                    if let targetId = state.replyingTo[channelId],
                       let target = messages.first(where: { $0.id == targetId }) {
                        replyBanner(target).padding(.bottom, NodieSpacing.sm)
                    }
                    if state.attachOpen { attachTray.padding(.bottom, NodieSpacing.md) }
                    composeRow
                }
            } else {
                // Kênh phát: client chỉ ẩn ô nhập — chặn thật phải ở RLS.
                (Text("🔒 Chỉ quản trị viên có thể đăng trong kênh này · ")
                    .foregroundColor(NodieColors.inkMuted)
                 + Text("Bật thông báo").foregroundColor(NodieColors.purple).bold())
                    .font(NodieTypography.meta)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, NodieSpacing.sm)
            }
        }
        .padding(.horizontal, 14)
        .padding(.top, 10)
        // 26 chứ không 14: chừa Home Indicator để thanh nhập không dính vạch home.
        .padding(.bottom, 26)
        .background(NodieColors.bg)
        .overlay(alignment: .top) { Divider().background(NodieColors.rule) }
    }

    /// Băng "Đang trả lời …" trên ô nhập — cùng chỗ, cùng hình với Zalo/Messenger/WhatsApp.
    /// Vạch dọc bên trái là thứ nối nó về trích dẫn trong bong bóng sau khi gửi.
    private func replyBanner(_ target: MessageRow) -> some View {
        let targetIsMine = target.userId == store.currentUserId
        return HStack(spacing: 10) {
            RoundedRectangle(cornerRadius: 1.5)
                .fill(NodieColors.accent)
                .frame(width: 3)

            VStack(alignment: .leading, spacing: 2) {
                Text(targetIsMine ? String(localized: "Đang trả lời chính mình")
                                  : String(localized: "Đang trả lời \(target.authorName)"))
                    .font(NodieTypography.tag.weight(.semibold))
                    .foregroundStyle(NodieColors.accent)
                Text(target.previewText)
                    .font(NodieTypography.metaSm)
                    .foregroundStyle(NodieColors.inkMuted)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Button { state.cancelReply(in: channelId) } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundStyle(NodieColors.inkFaint)
                    .expandedHitArea(visual: 22)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Huỷ trả lời")
            .accessibilityIdentifier("cancelReply")
        }
        .padding(.leading, 10)
        .padding(.trailing, 12)
        .padding(.vertical, 8)
        .frame(height: 46)
        .background(RoundedRectangle(cornerRadius: 12).fill(NodieColors.surface))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(NodieColors.rule, lineWidth: 1))
    }

    /// Gửi draft hiện tại. Chỉ xoá chữ + huỷ trích dẫn KHI server xác nhận — gửi fail phải
    /// giữ nguyên cả hai để user thử lại, cùng luật draft-safety với màn Hỏi đáp.
    private func sendDraft() {
        let text = draft.wrappedValue
        let parentId = state.replyingTo[channelId]
        Task {
            let ok = await store.send(channelId: channelId, body: text, parentId: parentId)
            if ok {
                state.drafts[channelId] = ""
                state.replyingTo[channelId] = nil
            }
        }
    }

    private var composeRow: some View {
        HStack(spacing: 10) {
            Button { state.toggleAttach() } label: {
                Text("＋")
                    .font(.system(size: 22, weight: .light))
                    .foregroundStyle(NodieColors.inkSoft)
                    .frame(width: 40, height: 40)
                    .background(Circle().stroke(NodieColors.chipBorder, lineWidth: 1))
                    .expandedHitArea(visual: 40)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Đính kèm")

            TextField("Nhắn tin…", text: draft)
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.ink)
                .focused($inputFocused)
                .submitLabel(.send)
                .onSubmit { sendDraft() }
                .padding(.horizontal, NodieSpacing.lg)
                .padding(.vertical, 12)
                .background(Capsule().fill(NodieColors.surface))
                .overlay(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))

            // Có chữ thì gửi, chưa gõ gì thì ghi âm — cùng một chỗ, như FB/IG/Zalo.
            if hasDraft {
                Button { sendDraft() } label: {
                    Image(systemName: "arrow.up")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(width: 44, height: 44)
                        .background(Circle().fill(NodieColors.accent))
                        .expandedHitArea(visual: 44)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Gửi")
                // Bàn phím tiếng Việt vẽ phím Enter là "Gửi" (do `.submitLabel(.send)` ở trên),
                // trùng đúng nhãn nút này → UITest tìm theo nhãn sẽ thấy HAI nút. Định danh
                // không dịch và bàn phím không có nó, nên test bám vào đây cho chắc.
                .accessibilityIdentifier("sendMessage")
            } else {
                Button { Task { await startRecording() } } label: {
                    Image(systemName: "mic")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(NodieColors.cream)
                        .frame(width: 44, height: 44)
                        .background(Circle().fill(NodieColors.ink))
                        .expandedHitArea(visual: 44)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Ghi âm")
                .accessibilityIdentifier("recordVoice")
            }
        }
    }

    private var attachTray: some View {
        HStack(spacing: 10) {
            ForEach(MediaKind.allCases) { kind in
                Button {
                    Task { await tapAttach(kind) }
                } label: {
                    VStack(spacing: 6) {
                        Text(kind.glyph).font(.system(size: 20))
                        Text(kind.trayLabel)
                            .font(NodieTypography.tag)
                            .foregroundStyle(NodieColors.inkSoft)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, NodieSpacing.md)
                    .background(RoundedRectangle(cornerRadius: 14).fill(NodieColors.surface))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(NodieColors.rule, lineWidth: 1))
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("attach-\(kind.rawValue)")
            }
        }
        .padding(.horizontal, 2)
    }

    /// Khay đính kèm: đóng khay rồi mới mở picker. Để khay mở dưới sheet thì lúc đóng sheet
    /// nó còn nằm đó chắn mất ô nhập.
    private func tapAttach(_ kind: MediaKind) async {
        state.attachOpen = false
        switch kind {
        case .photo:
            photosPresented = true
        case .camera:
            // Hỏi quyền NGAY LÚC BẤM — không hỏi lúc mở app. Đã từ chối thì iOS không hiện
            // hộp thoại nào nữa, nên phải tự nói và chỉ đường ra Cài đặt.
            switch await CameraPermission.request() {
            case .granted: cameraPresented = true
            case .denied: cameraDenied = true
            }
        case .file:
            filePresented = true
        }
    }

    /// Ảnh từ thư viện: lấy bytes → thu nhỏ → gửi. Mỗi ảnh một tin, như IG/WhatsApp.
    ///
    /// Thu nhỏ chạy ngoài main thread (`Task.detached`): sáu ảnh 4000px vẽ lại trên main
    /// thread là màn hình đứng hình mấy giây.
    private func sendPickedPhotos(_ items: [PhotosPickerItem]) async {
        for item in items {
            guard let raw = try? await item.loadTransferable(type: Data.self) else { continue }
            guard let encoded = await Task.detached(priority: .userInitiated, operation: {
                ChatImageProcessor.encode(data: raw)
            }).value else { continue }
            sendPhoto(encoded)
        }
    }

    private func sendPhoto(_ encoded: ChatImageProcessor.Encoded) {
        let queued = store.sendMedia(
            channelId: channelId, data: encoded.data, kind: .photo,
            ext: "jpg", contentType: "image/jpeg", preview: encoded.image,
            width: encoded.width, height: encoded.height, size: encoded.data.count,
            parentId: state.replyingTo[channelId]
        )
        // Bong bóng đã hiện và đã mang `parentId` — băng "Đang trả lời" xong việc, gỡ ngay
        // chứ không đợi upload. Upload hỏng thì "Gửi lại" dùng lại `parentId` trong pending,
        // không cần băng còn trên màn.
        if queued { state.replyingTo[channelId] = nil }
    }

    /// Tệp từ Files. `fileImporter` trả URL có bảo vệ phạm vi — phải xin quyền đọc rồi trả lại,
    /// không thì đọc ra rỗng.
    private func sendPickedFile(_ result: Result<URL, any Error>) async {
        guard case .success(let url) = result else { return }
        guard url.startAccessingSecurityScopedResource() else {
            store.errorMessage = String(localized: "Không đọc được tệp này.")
            return
        }
        defer { url.stopAccessingSecurityScopedResource() }

        guard let data = try? Data(contentsOf: url) else {
            store.errorMessage = String(localized: "Không đọc được tệp này.")
            return
        }
        let queued = store.sendMedia(
            channelId: channelId, data: data, kind: .file,
            ext: url.pathExtension.isEmpty ? "dat" : url.pathExtension,
            contentType: UTType(filenameExtension: url.pathExtension)?.preferredMIMEType
                ?? "application/octet-stream",
            size: data.count, name: url.lastPathComponent,
            parentId: state.replyingTo[channelId]
        )
        if queued { state.replyingTo[channelId] = nil }
    }

    /// Chạm vào bong bóng: ảnh → xem toàn màn; tệp → tải về rồi mở QuickLook.
    private func open(_ media: MessageMedia, of message: MessageRow) {
        switch media.kind {
        case .photo:
            // Ảnh đang gửi vẫn xem được — bytes nằm sẵn trong máy, không phải chờ upload.
            if let pending = store.pending(for: message.id) {
                viewingPhoto = .local(pending.data)
            } else {
                viewingPhoto = .remote(path: media.path)
            }
        case .file:
            guard !openingFile else { return }
            openingFile = true
            Task {
                previewingFile = await ChatFileDownloader.localURL(for: media.path, name: media.name)
                if previewingFile == nil {
                    store.errorMessage = String(localized: "Không mở được tệp này.")
                }
                openingFile = false
            }
        case .voice:
            break
        }
    }

    private var recordingBar: some View {
        HStack(spacing: NodieSpacing.md) {
            RecordingDot()

            // Đồng hồ của chính recorder, không phải Timer tự cộng — số này phải khớp độ dài
            // tệp gửi đi.
            Text(Self.clock(recorder.elapsed))
                .font(NodieTypography.bodySm.weight(.medium).monospacedDigit())
                .foregroundStyle(NodieColors.inkSoft)
                .fixedSize()

            LiveWaveform(levels: recorder.levels)
                .frame(height: 16)
                .frame(maxWidth: .infinity)
                .accessibilityHidden(true)

            Button("Huỷ") { cancelRecording() }
                .font(NodieTypography.bodySm)
                .foregroundStyle(NodieColors.inkFaint)
                .buttonStyle(.plain)
                .expandedHitArea(visual: 44)

            Button {
                finishRecording()
            } label: {
                Image(systemName: "arrow.up")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 38, height: 38)
                    .background(Circle().fill(NodieColors.accent))
                    .expandedHitArea(visual: 44)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Gửi tin nhắn thoại")
            .accessibilityIdentifier("sendVoice")
        }
        .padding(.horizontal, NodieSpacing.lg)
        .padding(.vertical, 9)
        .background(Capsule().fill(NodieColors.surface))
        .overlay(Capsule().stroke(NodieColors.recBorder, lineWidth: 1))
    }

    /// "0:07" — cùng cách đọc với `MessageMedia.durationLabel`.
    private static func clock(_ seconds: TimeInterval) -> String {
        let total = Int(seconds)
        return String(format: "%d:%02d", total / 60, total % 60)
    }

    /// Bấm mic: xin quyền (lần đầu) rồi bắt đầu ghi.
    private func startRecording() async {
        guard await VoiceRecorder.requestPermission() else {
            micDenied = true
            return
        }
        // Đang phát thoại thì DỪNG trước khi ghi (chuẩn WhatsApp): không dừng thì tiếng phát
        // ra loa bị mic thu ngược vào bản ghi, và hai bên giành nhau audio session.
        player.stop()
        do {
            try recorder.start()
            state.startRec()
        } catch {
            store.errorMessage = error.localizedDescription
        }
    }

    /// Thả tay / bấm gửi: dừng ghi rồi đẩy đi qua đúng đường của ảnh (lạc quan + gửi lại).
    private func finishRecording() {
        state.cancelRec()                    // đóng thanh ghi ngay, đừng để nó đứng đó lúc gửi
        guard let take = recorder.finish() else { return }   // <1s = bấm nhầm, bỏ im lặng
        let queued = store.sendMedia(
            channelId: channelId, data: take.data, kind: .voice,
            ext: "m4a", contentType: "audio/mp4",
            duration: take.duration, waveform: take.waveform,
            parentId: state.replyingTo[channelId]
        )
        if queued { state.replyingTo[channelId] = nil }
    }

    private func cancelRecording() {
        recorder.cancel()
        state.cancelRec()
    }
}

/// Waveform vẽ từ biên độ THẬT của recorder — mỗi vạch một mẫu, mới nhất ở bên phải.
///
/// Chỉ giữ đoạn đuôi vừa với bề ngang: ghi hai phút là 2400 mẫu, vẽ hết thì mỗi vạch mảnh
/// hơn một điểm ảnh và thành một vệt xám. Kiểu chạy-ngang này giống WhatsApp/Zalo.
struct LiveWaveform: View {
    let levels: [Float]

    var body: some View {
        Canvas { context, size in
            let barWidth: CGFloat = 2
            let gap: CGFloat = 3
            let capacity = max(1, Int(size.width / (barWidth + gap)))
            let tail = levels.suffix(capacity)
            var x = size.width - CGFloat(tail.count) * (barWidth + gap)

            for level in tail {
                // Sàn 2pt: im lặng vẫn phải thấy một vạch, không thì waveform mất tiêu
                // giữa hai câu nói và trông như đã ngừng ghi.
                let height = max(2, CGFloat(level) * size.height)
                let rect = CGRect(x: x, y: (size.height - height) / 2,
                                  width: barWidth, height: height)
                context.fill(Path(roundedRect: rect, cornerRadius: 1), with: .color(NodieColors.rec))
                x += barWidth + gap
            }
        }
    }
}

/// Waveform tĩnh của tin đã ghi — vẽ từ ~50 mẫu trong metadata, tô đậm phần đã nghe.
///
/// Tap để tua (chỉ khi tin này đang cầm player). Tap chứ KHÔNG drag: bong bóng đã có cử chỉ
/// kéo-để-trả-lời, gắn thêm DragGesture ở đây là hai cử chỉ giẫm nhau.
struct VoiceWaveformView: View {
    let levels: [Float]
    let progress: Double
    let playedColor: Color
    let restColor: Color
    /// nil = không tua được. Nhận tỉ lệ 0–1 tính từ chỗ chạm.
    let onSeek: ((Double) -> Void)?

    var body: some View {
        GeometryReader { geo in
            Canvas { context, size in
                // Tin cũ (trước khi có thoại) không mang waveform — vạch đều còn hơn ô trống.
                let bars = levels.isEmpty ? Array(repeating: Float(0.35), count: 28) : levels
                let step = size.width / CGFloat(bars.count)
                let barWidth = max(1.5, step * 0.55)
                let cut = progress * Double(bars.count)

                for (i, level) in bars.enumerated() {
                    let height = max(3, CGFloat(level) * size.height)
                    let rect = CGRect(x: CGFloat(i) * step, y: (size.height - height) / 2,
                                      width: barWidth, height: height)
                    context.fill(Path(roundedRect: rect, cornerRadius: 1),
                                 with: .color(Double(i) < cut ? playedColor : restColor))
                }
            }
            .contentShape(Rectangle())
            .onTapGesture { location in
                guard let onSeek, geo.size.width > 0 else { return }
                onSeek(min(max(location.x / geo.size.width, 0), 1))
            }
        }
    }
}

/// Chấm đỏ nhấp nháy của thanh ghi âm.
struct RecordingDot: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var on = false

    var body: some View {
        Circle()
            .fill(NodieColors.rec)
            .frame(width: 10, height: 10)
            .opacity(on ? 0.35 : 1)
            .animation(reduceMotion ? nil : .easeInOut(duration: 1.2).repeatForever(autoreverses: true), value: on)
            // Bật Giảm chuyển động thì chấm đứng yên, đỏ đặc. Nhấp nháy vô tận là đúng thứ
            // thiết lập đó tồn tại để tắt — và chấm đỏ im vẫn nói đủ "đang ghi".
            .onAppear { if !reduceMotion { on = true } }
            .accessibilityHidden(true)
    }
}

/// Vạch dọc lặp — `repeating-linear-gradient` của prototype.
struct WaveformStripe: View {
    var body: some View {
        Canvas { context, size in
            var x: CGFloat = 0
            while x < size.width {
                context.fill(
                    Path(CGRect(x: x, y: 0, width: 2, height: size.height)),
                    with: .color(NodieColors.chipBorder)
                )
                x += 5
            }
        }
    }
}

/// Bong bóng tin — của mình: nền mực, lệch phải, góc dưới-phải vuông. Của người: nền trắng, lệch trái.
struct MessageBubbleView: View {
    let message: MessageRow
    /// Tin của CHÍNH MÌNH — so `message.userId` với `store.currentUserId` ở caller
    /// (view này không cầm store để so trực tiếp).
    let isMine: Bool
    let senderLabel: String?
    /// Tin đang được trả lời — nil nếu tin này không trả lời ai (hoặc tin gốc đã trôi).
    let replyTarget: MessageRow?
    /// Tin đang trả lời có phải CỦA MÌNH không — khác `isMine` (đó là tin `message`, không
    /// phải tin `replyTarget`). Quyết định nhãn "Bạn" trong trích dẫn.
    let replyTargetIsMine: Bool
    let myReactions: Set<ReactionKind>
    let reduceMotion: Bool
    /// Đính kèm chưa lên xong — nil nghĩa là tin đã nằm trên server (hoặc không có đính kèm).
    /// Non-nil thì bong bóng vẽ từ bytes trong máy và hiện trạng thái đang-lên / đã-hỏng.
    let pending: ConversationStore.PendingMedia?
    /// Thanh ghi âm đang mở. Phát thoại lúc này là GIẾT bản ghi: player đổi category của
    /// audio session mà recorder đang cầm — cùng-app nên KHÔNG có interruption notification
    /// nào bắn ra, recorder chết im lặng. Chặn từ UI là tầng chắc nhất.
    let recordingActive: Bool
    let onReply: () -> Void
    let onReact: (ReactionKind) -> Void
    let onTapReplyQuote: (UUID) -> Void
    /// nil = không phải tin của mình — ẩn hẳn mục "Sửa" khỏi menu.
    let onEdit: (() -> Void)?
    /// nil = không phải tin của mình — ẩn hẳn mục "Xoá" khỏi menu.
    let onDelete: (() -> Void)?
    let onRetryMedia: () -> Void
    let onDiscardMedia: () -> Void
    /// Mở ảnh toàn màn / mở tệp bằng QuickLook — caller giữ state sheet.
    let onOpenMedia: (MessageMedia) -> Void

    /// Bong bóng trượt theo ngón khi vuốt trả lời. Thuần hiệu ứng — thả tay là về 0.
    @State private var dragX: CGFloat = 0
    /// Đã rung báo "đủ xa để thả" chưa. Không có cờ này thì mỗi pixel vượt ngưỡng lại rung một phát.
    @State private var didHaptic = false

    /// Vuốt qua đây là trả lời. 56pt: đủ xa để không nhầm với cuộn chéo, đủ gần để làm bằng một ngón cái.
    private static let replyThreshold: CGFloat = 56

    /// Dựng MỘT LẦN cho cả app: NSDataDetector biên dịch pattern lúc khởi tạo, dựng lại
    /// mỗi lần vẽ bong bóng là trả giá đó trên mỗi khung hình cuộn.
    private static let linkDetector = try? NSDataDetector(types: NSTextCheckingResult.CheckingType.link.rawValue)

    var body: some View {
        VStack(alignment: isMine ? .trailing : .leading, spacing: 3) {
            if let senderLabel {
                Text(senderLabel)
                    .font(NodieTypography.timestamp.weight(.semibold))
                    .foregroundStyle(NodieColors.accent)
                    .padding(.horizontal, NodieSpacing.xs)
            }

            bubble
                .offset(x: dragX)
                // Mũi tên ló ra từ mép khi kéo — cho biết cú vuốt này sẽ làm gì, trước khi thả.
                .background(alignment: .leading) {
                    Image(systemName: "arrowshape.turn.up.left.fill")
                        .font(.system(size: 13))
                        .foregroundStyle(NodieColors.inkFaint)
                        .opacity(min(dragX / Self.replyThreshold, 1))
                        .offset(x: dragX - 24)
                        .accessibilityHidden(true)
                }
                .gesture(replyDrag)
                .contextMenu { bubbleMenu }

            reactionRow

            HStack(spacing: 4) {
                // Non-nil "Sửa"/"Xoá"/"(đã sửa)" CHƯA có trong Localizable.xcstrings (9 ngôn
                // ngữ) — xem report để thêm key.
                if message.isEdited {
                    Text("(đã sửa)")
                        .font(NodieTypography.timestampXs)
                        .foregroundStyle(NodieColors.inkFaint)
                }
                Text(message.timeLabel)
                    .font(NodieTypography.timestampXs)
                    .foregroundStyle(NodieColors.inkFaint)
            }
            .padding(.horizontal, NodieSpacing.xs)
        }
        .frame(maxWidth: .infinity, alignment: isMine ? .trailing : .leading)
        // Vuốt là cử chỉ không nhìn thấy được. VoiceOver phải có đường khác tới cùng việc đó —
        // menu giữ-bong-bóng cũng có Trả lời, nhưng action ở đây mới là thứ VoiceOver đọc ra.
        .accessibilityAction(named: Text("Trả lời")) { onReply() }
        .accessibilityActions {
            ForEach(ReactionKind.allCases) { kind in
                Button(kind.label) { onReact(kind) }
            }
        }
    }

    @ViewBuilder
    private var bubble: some View {
        if let media = message.media {
            mediaBubble(media)
        } else {
            textBubble
        }
    }

    /// Menu giữ-bong-bóng. Cảm xúc lên trước — đó là thứ được dùng nhiều nhất.
    /// "Sao chép" chỉ cho tin CHỮ: gắn cho tin ảnh/thoại thì chỉ copy được caption rỗng,
    /// vô nghĩa. "Sửa"/"Xoá" chỉ hiện khi `onEdit`/`onDelete` non-nil (tin của mình).
    @ViewBuilder
    private var bubbleMenu: some View {
        ForEach(ReactionKind.allCases) { kind in
            Button {
                onReact(kind)
            } label: {
                Label(kind.label, systemImage: myReactions.contains(kind) ? "checkmark" : "plus")
            }
        }
        Divider()
        Button { onReply() } label: {
            Label("Trả lời", systemImage: "arrowshape.turn.up.left")
        }
        if message.media == nil {
            Button {
                UIPasteboard.general.string = message.body
            } label: {
                Label("Sao chép", systemImage: "doc.on.doc")
            }
        }
        if onEdit != nil || onDelete != nil {
            Divider()
            if let onEdit {
                Button(action: onEdit) {
                    Label("Sửa", systemImage: "pencil")
                }
            }
            if let onDelete {
                Button(role: .destructive, action: onDelete) {
                    Label("Xoá", systemImage: "trash")
                }
            }
        }
    }

    /// Vuốt ngang bong bóng để trả lời — WhatsApp/Zalo/Messenger đều là cử chỉ này.
    private var replyDrag: some Gesture {
        DragGesture(minimumDistance: 18)
            .onChanged { v in
                // Chỉ nhận cú vuốt NGANG. Không lọc thì kéo dọc để cuộn cũng làm bong bóng nhích theo.
                guard abs(v.translation.width) > abs(v.translation.height) else { return }
                // Chỉ sang phải, và có trần: kéo tiếp không đi xa thêm — thân vẫn báo "đủ rồi".
                let x = min(max(v.translation.width, 0), Self.replyThreshold + 12)
                dragX = x
                if x >= Self.replyThreshold, !didHaptic {
                    NodieHaptics.tap()
                    didHaptic = true
                } else if x < Self.replyThreshold {
                    didHaptic = false
                }
            }
            .onEnded { _ in
                if dragX >= Self.replyThreshold { onReply() }
                withAnimation(reduceMotion ? nil : .spring(duration: 0.28)) { dragX = 0 }
                didHaptic = false
            }
    }

    /// Hàng cảm xúc dưới bong bóng. Chỉ hiện loại thật sự có người thả — hiện sẵn cả hai
    /// loại với số 0 là bày ra hai nút chết.
    @ViewBuilder
    private var reactionRow: some View {
        let counts = message.reactionCounts
        let kinds = ReactionKind.allCases.filter { (counts[$0] ?? 0) > 0 }
        if !kinds.isEmpty {
            HStack(spacing: 4) {
                ForEach(kinds) { kind in
                    let count = counts[kind] ?? 0
                    let mine = myReactions.contains(kind)
                    Button { onReact(kind) } label: {
                        HStack(spacing: 3) {
                            Text(kind.glyph).font(.system(size: 10))
                            // Số 1 thì cái nhãn đã nói hết rồi — "☀ 1" chỉ là nhiễu.
                            if count > 1 {
                                Text("\(count)")
                                    .font(NodieTypography.timestampXs.weight(.semibold))
                                    .foregroundStyle(mine ? NodieColors.accent : NodieColors.inkMuted)
                            }
                        }
                        .padding(.horizontal, 7)
                        .padding(.vertical, 3)
                        .background(Capsule().fill(mine ? NodieColors.accent.opacity(0.12) : NodieColors.surface))
                        .overlay(Capsule().stroke(mine ? NodieColors.accent : NodieColors.rule, lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(mine ? Text("Gỡ \(kind.label)") : Text("\(kind.label), \(count)"))
                }
            }
            .padding(.horizontal, NodieSpacing.xs)
        }
    }

    /// Tin thoại dùng chung bong bóng chữ — chưa phát được thì nó đúng là một dòng chữ.
    private var bubbleText: String { message.previewText }

    /// URL trong tin thành link bấm được. Không gạch chân: SwiftUI đã tô link bằng `.tint`,
    /// thêm gạch chân nữa là hai tín hiệu cho một việc (iMessage/WhatsApp cũng chỉ tô màu).
    private var attributedBody: AttributedString {
        let raw = bubbleText
        guard let detector = Self.linkDetector else { return AttributedString(raw) }
        let ns = NSMutableAttributedString(string: raw)
        let full = NSRange(location: 0, length: (raw as NSString).length)
        for match in detector.matches(in: raw, range: full) {
            guard let url = match.url else { continue }
            ns.addAttribute(.link, value: url, range: match.range)
        }
        return AttributedString(ns)
    }

    private var textBubble: some View {
        VStack(alignment: .leading, spacing: 6) {
            replyQuote
            Text(attributedBody)
                .font(NodieTypography.body)
                .foregroundStyle(isMine ? NodieColors.cream : NodieColors.ink)
                .lineSpacing(3)
                // Link trên nền mực phải là kem, không phải xanh mặc định — xanh trên mực
                // là cặp màu không đọc nổi.
                .tint(isMine ? NodieColors.cream : NodieColors.purple)
                .frame(maxWidth: .infinity, alignment: isMine ? .trailing : .leading)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(bubbleShape.fill(isMine ? NodieColors.ink : NodieColors.surface))
        .overlay(bubbleShape.stroke(isMine ? NodieColors.ink : NodieColors.rule, lineWidth: 1))
        .frame(maxWidth: 260, alignment: isMine ? .trailing : .leading)
    }

    /// Trích dẫn trong bong bóng — bấm vào là nhảy về tin gốc, như mọi messenger.
    @ViewBuilder
    private var replyQuote: some View {
        if let replyTarget {
            Button { onTapReplyQuote(replyTarget.id) } label: {
                HStack(spacing: 7) {
                    RoundedRectangle(cornerRadius: 1.5)
                        .fill(isMine ? NodieColors.cream.opacity(0.5) : NodieColors.accent)
                        .frame(width: 2.5)
                    VStack(alignment: .leading, spacing: 1) {
                        Text(replyTargetIsMine ? String(localized: "Bạn") : replyTarget.authorName)
                            .font(NodieTypography.timestampXs.weight(.bold))
                            .foregroundStyle(isMine ? NodieColors.cream.opacity(0.75) : NodieColors.accent)
                        Text(replyTarget.previewText)
                            .font(NodieTypography.timestampXs)
                            .foregroundStyle(isMine ? NodieColors.cream.opacity(0.6) : NodieColors.inkMuted)
                            .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding(.vertical, 3)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel(Text("Trả lời cho: \(replyTarget.previewText)"))
        }
    }

    /// Ảnh/tệp. Ba trạng thái: đang lên (ảnh trong máy + mờ), hỏng (ảnh trong máy + nút gửi
    /// lại), đã lên (tải từ bucket qua URL ký).
    @ViewBuilder
    private func mediaBubble(_ media: MessageMedia) -> some View {
        switch media.kind {
        case .photo: photoBubble(media)
        case .file: fileBubble(media)
        case .voice: voiceBubble(media)
        }
    }

    /// Thoại: nút phát + waveform tô theo tiến trình + thời lượng + nút tốc độ.
    ///
    /// Player dùng CHUNG cả app (xem `VoiceMessagePlayer`) — bong bóng chỉ so `playingId`
    /// với id của mình để biết vẽ ▶ hay ⏸; phát bong bóng khác là bong bóng này tự về ▶.
    /// Tin còn đang upload vẫn nghe lại được: bytes truyền qua `pending.data`.
    private func voiceBubble(_ media: MessageMedia) -> some View {
        let player = VoiceMessagePlayer.shared
        let isCurrent = player.playingId == message.id
        let fraction = isCurrent ? player.progress : 0
        let duration = media.duration ?? 0
        // Đang phát thì đếm NGƯỢC — người nghe muốn biết còn bao lâu, không phải đã dài bao nhiêu.
        let shownSeconds = isCurrent ? duration * (1 - fraction) : duration

        return HStack(spacing: 10) {
            if pending?.phase == .failed {
                // Gửi lại VÀ Bỏ — cùng khuôn với bong bóng tệp.
                Button(action: onRetryMedia) {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(NodieColors.rec)
                        .expandedHitArea(visual: 44)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Gửi lại")
                .accessibilityIdentifier("retryMedia")

                Button(action: onDiscardMedia) {
                    Image(systemName: "xmark")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(voiceMuted)
                        .expandedHitArea(visual: 44)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Bỏ")
            } else if player.loadingId == message.id {
                ProgressView()
                    .tint(voiceTint)
                    .frame(width: 34, height: 34)
            } else {
                Button {
                    guard !recordingActive else { return }   // xem chú thích `recordingActive`
                    let data = pending?.data
                    Task {
                        await player.toggle(messageId: message.id, path: media.path, localData: data)
                    }
                } label: {
                    Image(systemName: isCurrent && player.isPlaying ? "pause.fill" : "play.fill")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(isMine ? NodieColors.ink : NodieColors.cream)
                        .frame(width: 34, height: 34)
                        .background(Circle().fill(isMine ? NodieColors.cream : NodieColors.accent))
                        .expandedHitArea(visual: 44)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(isCurrent && player.isPlaying ? Text("Tạm dừng") : Text("Phát"))
                .accessibilityIdentifier("voicePlay")
            }

            VoiceWaveformView(
                levels: media.waveform ?? [],
                progress: fraction,
                playedColor: isMine ? NodieColors.cream : NodieColors.accent,
                restColor: voiceMuted,
                // Tua chỉ khi chính tin này đang cầm player — chạm waveform tin khác mà nhảy
                // vị trí của tin đang phát là hành vi ma quái.
                onSeek: isCurrent ? { player.seek(to: $0) } : nil
            )
            .frame(height: 22)
            .frame(maxWidth: .infinity)
            .accessibilityHidden(true)

            VStack(alignment: .trailing, spacing: 3) {
                if isCurrent {
                    Button { player.cycleRate() } label: {
                        Text(verbatim: String(format: "%g×", player.rate))
                            .font(NodieTypography.tag.weight(.bold))
                            .foregroundStyle(isMine ? NodieColors.ink : NodieColors.cream)
                            .padding(.horizontal, 7)
                            .padding(.vertical, 2)
                            .background(Capsule().fill(isMine ? NodieColors.cream : NodieColors.accent))
                            .expandedHitArea(visual: 44)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Đổi tốc độ phát")
                    .accessibilityIdentifier("voiceRate")
                }
                HStack(spacing: 4) {
                    if pending?.phase == .uploading {
                        ProgressView().controlSize(.mini).tint(voiceMuted)
                    }
                    Text(verbatim: Self.voiceClock(shownSeconds))
                        .font(NodieTypography.timestampXs.monospacedDigit())
                        .foregroundStyle(voiceMuted)
                }
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .frame(width: 232)
        .background(bubbleShape.fill(isMine ? NodieColors.ink : NodieColors.surface))
        .overlay(bubbleShape.stroke(isMine ? NodieColors.ink : NodieColors.rule, lineWidth: 1))
        .accessibilityElement(children: .contain)
        .accessibilityLabel(voiceLabel(duration))
        .accessibilityIdentifier("voiceBubble")
    }

    /// Màu phụ trong bong bóng thoại — kem mờ trên nền mực (tin mình), mực mờ trên nền giấy.
    private var voiceMuted: Color {
        isMine ? NodieColors.cream.opacity(0.55) : NodieColors.inkMuted
    }

    private var voiceTint: Color {
        isMine ? NodieColors.cream : NodieColors.accent
    }

    private func voiceLabel(_ duration: Double) -> Text {
        switch pending?.phase {
        case .uploading: return Text("Tin nhắn thoại, đang gửi")
        case .failed: return Text("Tin nhắn thoại, gửi không thành công")
        case nil: return Text("Tin nhắn thoại, \(Int(duration.rounded())) giây")
        }
    }

    /// "0:07" — trùng cách đọc với đồng hồ thanh ghi âm.
    private static func voiceClock(_ seconds: Double) -> String {
        let total = Int(seconds.rounded())
        return String(format: "%d:%02d", total / 60, total % 60)
    }

    /// Bề ngang cố định kiểu IG; chiều cao suy từ tỉ lệ trong metadata nên khung đã đúng
    /// TRƯỚC khi ảnh về — không có cú nhảy layout lúc tải xong.
    private static let photoWidth: CGFloat = 232

    private func photoBubble(_ media: MessageMedia) -> some View {
        let ratio = media.aspectRatio ?? 1
        let height = Self.photoWidth / ratio

        return Group {
            // `pending.preview` đã giải mã sẵn từ lúc chọn ảnh — không `UIImage(data:)` ở đây,
            // chỗ này chạy lại mỗi lần thân view được tính lại.
            if let image = pending?.preview {
                Image(uiImage: image).resizable().aspectRatio(contentMode: .fill)
            } else {
                ChatRemoteImage(path: media.path)
            }
        }
        .frame(width: Self.photoWidth, height: height)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(NodieColors.rule, lineWidth: 1))
        .overlay { uploadOverlay }
        .contentShape(RoundedRectangle(cornerRadius: 16))
        .onTapGesture { if pending?.phase != .failed { onOpenMedia(media) } }
        .accessibilityLabel(photoLabel)
        .accessibilityIdentifier("mediaBubble")
        .accessibilityAddTraits(.isButton)
    }

    private var photoLabel: Text {
        switch pending?.phase {
        case .uploading: return Text("Ảnh, đang gửi")
        case .failed: return Text("Ảnh, gửi không thành công")
        case nil: return Text("Ảnh, chạm để xem")
        }
    }

    /// Lớp phủ lúc đang lên / lên hỏng. Spinner KHÔNG có phần trăm: Supabase Storage không
    /// báo tiến trình từng phần, và bịa ra một con số chạy là nói dối người dùng.
    @ViewBuilder
    private var uploadOverlay: some View {
        switch pending?.phase {
        case .uploading:
            ZStack {
                Color.black.opacity(0.28)
                ProgressView().tint(.white)
            }
            .clipShape(RoundedRectangle(cornerRadius: 16))
        case .failed:
            ZStack {
                Color.black.opacity(0.45)
                VStack(spacing: 8) {
                    Button(action: onRetryMedia) {
                        HStack(spacing: 5) {
                            Image(systemName: "arrow.clockwise")
                            Text("Gửi lại")
                        }
                        .font(NodieTypography.tag.weight(.semibold))
                        .foregroundStyle(NodieColors.ink)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Capsule().fill(NodieColors.cream))
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("retryMedia")

                    Button("Bỏ", action: onDiscardMedia)
                        .font(NodieTypography.tag)
                        .foregroundStyle(.white)
                        .buttonStyle(.plain)
                        .expandedHitArea(visual: 44)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 16))
        case nil:
            EmptyView()
        }
    }

    /// Tệp: hàng tên + cỡ, chạm mở QuickLook. Giữ TÊN GỐC — đường dẫn trong bucket là UUID,
    /// hiện nó ra thì người nhận không biết mình vừa nhận cái gì.
    private func fileBubble(_ media: MessageMedia) -> some View {
        HStack(spacing: 10) {
            // `verbatim:` — glyph không phải chữ để dịch. Không có nó thì trình biên dịch
            // trích "▤" thành một key trong catalog và bắt dịch nó ra 8 thứ tiếng.
            Text(verbatim: "▤")
                .font(.system(size: 20))
                .foregroundStyle(NodieColors.accent)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 2) {
                Text(media.name ?? String(localized: "Tệp đính kèm"))
                    .font(NodieTypography.bodySm.weight(.medium))
                    .foregroundStyle(NodieColors.ink)
                    .lineLimit(2)
                if let sizeLabel = media.sizeLabel {
                    Text(sizeLabel)
                        .font(NodieTypography.timestampXs)
                        .foregroundStyle(NodieColors.inkMuted)
                }
            }

            if pending?.phase == .uploading {
                ProgressView().tint(NodieColors.inkMuted)
            } else if pending?.phase == .failed {
                // Gửi lại VÀ Bỏ — như bong bóng ảnh. Chỉ có mỗi nút gửi lại thì một tệp cứ
                // hỏng mãi sẽ nằm lì trên màn cả phiên, không có đường gỡ.
                Button(action: onRetryMedia) {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(NodieColors.rec)
                        .expandedHitArea(visual: 44)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Gửi lại tệp")
                .accessibilityIdentifier("retryMedia")

                Button(action: onDiscardMedia) {
                    Image(systemName: "xmark")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(NodieColors.inkMuted)
                        .expandedHitArea(visual: 44)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Bỏ tệp")
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .frame(maxWidth: 250, alignment: .leading)
        .background(bubbleShape.fill(NodieColors.surface))
        .overlay(bubbleShape.stroke(NodieColors.rule, lineWidth: 1))
        .contentShape(bubbleShape)
        .onTapGesture { if pending == nil { onOpenMedia(media) } }
        .accessibilityLabel(Text("Tệp \(media.name ?? ""), chạm để mở"))
        .accessibilityIdentifier("fileBubble")
        .accessibilityAddTraits(.isButton)
    }

    /// Góc nhọn ở phía người gửi — quy ước bong bóng chat quen thuộc.
    private var bubbleShape: UnevenRoundedRectangle {
        UnevenRoundedRectangle(
            topLeadingRadius: 18,
            bottomLeadingRadius: isMine ? 18 : 4,
            bottomTrailingRadius: isMine ? 4 : 18,
            topTrailingRadius: 18
        )
    }
}

#Preview {
    ChatDetailView(state: AppState(), store: ConversationStore(), channelId: UUID())
}
