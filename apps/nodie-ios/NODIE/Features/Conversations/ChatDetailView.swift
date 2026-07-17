import SwiftUI
import UIKit   // UIPasteboard — SwiftUI không re-export

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
                                onReply: { state.startReply(to: message.id, in: channelId) },
                                onReact: { kind in
                                    Task { await store.toggleReaction(messageId: message.id, channelId: channelId, kind: kind) }
                                },
                                onTapReplyQuote: { parentId in
                                    withAnimation(motion) { proxy.scrollTo(parentId, anchor: .center) }
                                },
                                onEdit: onEdit,
                                onDelete: onDelete
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
            // "Xem hồ sơ": `ChannelRow` chỉ mang membership CỦA MÌNH (RLS `channel_members`
            // lọc theo chính mình), không có API lộ UUID người kia. `MemberProfileView` cũng
            // còn dùng `memberId: String` (Mock) — phase member-profile-real đang đổi việc đó
            // song song. Chặn tạm ở đây, KHÔNG tự đổi kiểu MemberProfileView (ngoài phạm vi).
            Button(channel?.kind == "dm" ? "Xem hồ sơ" : "Thông tin nhóm") {}.disabled(true)
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
                Button { state.startRec() } label: {
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
                    // CHƯA nối thật: chưa có PhotosPicker/DocumentPicker để lấy `Data` thật
                    // cho `store.sendMedia`. Gọi nó với dữ liệu giả là bịa dữ liệu — đóng khay
                    // thay vì giả vờ gửi thành công. Xem report để nối picker thật.
                    state.toggleAttach()
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
            }
        }
        .padding(.horizontal, 2)
    }

    private var recordingBar: some View {
        HStack(spacing: NodieSpacing.md) {
            RecordingDot()

            Text("Đang ghi âm…")
                .font(NodieTypography.bodySm.weight(.medium))
                .foregroundStyle(NodieColors.inkSoft)
                .fixedSize()

            // Waveform giả — chưa thu tiếng thật thì không có biên độ để vẽ.
            WaveformStripe()
                .frame(height: 14)
                .frame(maxWidth: .infinity)
                .opacity(0.7)
                .accessibilityHidden(true)

            Button("Huỷ") { state.cancelRec() }
                .font(NodieTypography.bodySm)
                .foregroundStyle(NodieColors.inkFaint)
                .buttonStyle(.plain)

            Button {
                // CHƯA nối thật: chưa có AVAudioRecorder thu âm thanh thật nên không có `Data`
                // để gọi `store.sendMedia`. Huỷ ghi âm thay vì giả vờ gửi thành công — xem report.
                state.cancelRec()
            } label: {
                Image(systemName: "arrow.up")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 38, height: 38)
                    .background(Circle().fill(NodieColors.accent))
                    .expandedHitArea(visual: 38)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Gửi tin nhắn thoại")
        }
        .padding(.horizontal, NodieSpacing.lg)
        .padding(.vertical, 9)
        .background(Capsule().fill(NodieColors.surface))
        .overlay(Capsule().stroke(NodieColors.recBorder, lineWidth: 1))
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
    let onReply: () -> Void
    let onReact: (ReactionKind) -> Void
    let onTapReplyQuote: (UUID) -> Void
    /// nil = không phải tin của mình — ẩn hẳn mục "Sửa" khỏi menu.
    let onEdit: (() -> Void)?
    /// nil = không phải tin của mình — ẩn hẳn mục "Xoá" khỏi menu.
    let onDelete: (() -> Void)?

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
        // Ảnh/tệp có ô riêng; thoại (chưa phát được thì) và tin chữ dùng chung bong bóng chữ.
        if let media = message.media, media.kind != .voice {
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

    /// Ảnh/tệp: hộp gradient thay bong bóng chữ — nội dung thật sẽ là thumbnail từ R2.
    private func mediaBubble(_ media: MessageMedia) -> some View {
        let glyph = media.kind == .photo ? "▣" : "▤"
        let label = media.kind == .photo ? String(localized: "Ảnh") : String(localized: "Tệp đính kèm")
        return RoundedRectangle(cornerRadius: 16)
            .fill(LinearGradient(colors: [Color(hex: 0xE4D9BF), Color(hex: 0xB8A67E)],
                                 startPoint: .topLeading, endPoint: .bottomTrailing))
            .frame(width: 170, height: 116)
            .overlay(alignment: .bottomLeading) {
                Text("\(glyph) \(label)")
                    .font(NodieTypography.tag)
                    .foregroundStyle(.white)
                    .padding(10)
            }
            .accessibilityLabel(label)
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
