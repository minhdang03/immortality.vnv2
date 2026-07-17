import SwiftUI
import UIKit   // UIPasteboard — SwiftUI không re-export

/// Chat chi tiết — bong bóng tin nhắn + ô nhập, hoặc khoá nếu là kênh phát một chiều.
/// Thoát bằng nút back tròn HOẶC vuốt cạnh trái (NavigationStack lo).
struct ChatDetailView: View {
    @Bindable var state: AppState
    let chatId: String

    @Environment(\.dismiss) private var dismiss
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @FocusState private var inputFocused: Bool

    /// Đang ở sát đáy hay không — quyết định tin mới được cuộn tới hay chỉ báo bằng nút.
    /// Mặc định `true`: mở chat là đang ở đáy (xem `.onAppear` bên dưới).
    @State private var atBottom = true
    /// Số tin đến trong lúc đang đọc ngược lên. 0 = không hiện nút.
    @State private var unseen = 0

    /// Mốc đáy để cuộn tới. Cuộn vào MỐC chứ không vào tin cuối: tin cuối có thể cao
    /// (ảnh, trích dẫn, hàng cảm xúc) và `anchor: .bottom` của nó vẫn hụt mất phần đệm dưới.
    private static let bottomAnchor = "bottomAnchor"

    private var conversation: Conversation? { state.conversation(id: chatId) }
    private var messages: [ChatMessage] { state.messages(for: chatId) }
    private var hasDraft: Bool {
        !state.draft(in: chatId).trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    /// Tôn trọng Giảm chuyển động: `withAnimation(nil)` là nhảy thẳng, không phải đứng im.
    private var motion: Animation? { reduceMotion ? nil : .easeOut(duration: 0.2) }

    /// Draft của riêng chat này. Viết tay vì `$state.drafts[chatId]` cho Binding<String?>,
    /// còn TextField cần Binding<String>.
    private var draft: Binding<String> {
        Binding(
            get: { state.draft(in: chatId) },
            set: { state.drafts[chatId] = $0 }
        )
    }

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(Array(messages.enumerated()), id: \.element.id) { index, message in
                            MessageBubbleView(
                                message: message,
                                senderLabel: state.senderLabel(at: index, in: messages),
                                replyTarget: replyTarget(of: message),
                                reduceMotion: reduceMotion,
                                onReply: { state.startReply(to: message.id, in: chatId) },
                                onReact: { state.toggleReaction($0, on: message.id, in: chatId) },
                                onTapReplyQuote: { parentId in
                                    withAnimation(motion) { proxy.scrollTo(parentId, anchor: .center) }
                                }
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
                    if atBottom || last.isMine {
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
    }

    /// Tin mà `message` đang trả lời — nil nếu không trả lời ai, hoặc tin gốc đã trôi khỏi
    /// khoảng đã nạp (nạp 50 tin/lượt). Trôi mất thì bong bóng chỉ mất phần trích dẫn,
    /// không phải hiện một ô rỗng khó hiểu.
    private func replyTarget(of message: ChatMessage) -> ChatMessage? {
        guard let parentId = message.replyTo else { return nil }
        return messages.first { $0.id == parentId }
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

            if let c = conversation {
                ConversationAvatar(conversation: c, size: 40, fontSize: 18)
                VStack(alignment: .leading, spacing: 1) {
                    Text(c.name)
                        .font(NodieTypography.chatName)
                        .foregroundStyle(NodieColors.ink)
                        .lineLimit(1)
                    Text(c.sub)
                        .font(NodieTypography.metaSm)
                        .foregroundStyle(NodieColors.inkMuted)
                        .lineLimit(1)
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
            if let memberId = state.member(inChat: chatId) {
                Button("Xem hồ sơ") { state.chatsPath.append(.member(memberId)) }
            } else {
                // Kênh/nhóm chưa có màn thông tin riêng — prototype cũng chỉ đóng menu.
                Button("Thông tin nhóm") {}.disabled(true)
            }
            Button(state.isMuted(chatId) ? String(localized: "Bật thông báo") : String(localized: "Tắt thông báo")) {
                state.toggleMute(chatId)
            }
            Button("Xoá cuộc trò chuyện", role: .destructive) {
                state.leave(chatId)
                dismiss()
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
            if state.canPost(in: chatId) {
                if state.recording {
                    recordingBar
                } else {
                    if let target = state.replyTarget(in: chatId) {
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
    private func replyBanner(_ target: ChatMessage) -> some View {
        HStack(spacing: 10) {
            RoundedRectangle(cornerRadius: 1.5)
                .fill(NodieColors.accent)
                .frame(width: 3)

            VStack(alignment: .leading, spacing: 2) {
                Text(target.isMine ? String(localized: "Đang trả lời chính mình")
                                   : String(localized: "Đang trả lời \(target.who ?? String(localized: "tin nhắn"))"))
                    .font(NodieTypography.tag.weight(.semibold))
                    .foregroundStyle(NodieColors.accent)
                Text(target.previewText)
                    .font(NodieTypography.metaSm)
                    .foregroundStyle(NodieColors.inkMuted)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Button { state.cancelReply(in: chatId) } label: {
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
                .onSubmit { state.send(in: chatId) }
                .padding(.horizontal, NodieSpacing.lg)
                .padding(.vertical, 12)
                .background(Capsule().fill(NodieColors.surface))
                .overlay(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))

            // Có chữ thì gửi, chưa gõ gì thì ghi âm — cùng một chỗ, như FB/IG/Zalo.
            if hasDraft {
                Button { state.send(in: chatId) } label: {
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
                Button { state.sendMedia(kind, in: chatId) } label: {
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

            Button { state.sendVoice(in: chatId) } label: {
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
    let message: ChatMessage
    let senderLabel: String?
    /// Tin đang được trả lời — nil nếu tin này không trả lời ai (hoặc tin gốc đã trôi).
    let replyTarget: ChatMessage?
    let reduceMotion: Bool
    let onReply: () -> Void
    let onReact: (ReactionKind) -> Void
    let onTapReplyQuote: (UUID) -> Void

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
        VStack(alignment: message.isMine ? .trailing : .leading, spacing: 3) {
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

            Text(message.time)
                .font(NodieTypography.timestampXs)
                .foregroundStyle(NodieColors.inkFaint)
                .padding(.horizontal, NodieSpacing.xs)
        }
        .frame(maxWidth: .infinity, alignment: message.isMine ? .trailing : .leading)
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
        switch message.kind {
        case .media(let kind): mediaBubble(kind)
        case .voice, .text:    textBubble
        }
    }

    /// Menu giữ-bong-bóng. Cảm xúc lên trước — đó là thứ được dùng nhiều nhất.
    /// "Sao chép" chỉ cho tin CHỮ: gắn cho tin thoại thì chỉ copy được dòng
    /// "▶ Tin nhắn thoại · 0:07", vô nghĩa.
    @ViewBuilder
    private var bubbleMenu: some View {
        ForEach(ReactionKind.allCases) { kind in
            Button {
                onReact(kind)
            } label: {
                Label(kind.label, systemImage: message.myReactions.contains(kind) ? "checkmark" : "plus")
            }
        }
        Divider()
        Button { onReply() } label: {
            Label("Trả lời", systemImage: "arrowshape.turn.up.left")
        }
        if case .text = message.kind {
            Button {
                UIPasteboard.general.string = message.text
            } label: {
                Label("Sao chép", systemImage: "doc.on.doc")
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
        let kinds = ReactionKind.allCases.filter { (message.reactions[$0] ?? 0) > 0 }
        if !kinds.isEmpty {
            HStack(spacing: 4) {
                ForEach(kinds) { kind in
                    let count = message.reactions[kind] ?? 0
                    let mine = message.myReactions.contains(kind)
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
    private var bubbleText: String {
        if case .voice = message.kind { return message.previewText }
        return message.text
    }

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
                .foregroundStyle(message.isMine ? NodieColors.cream : NodieColors.ink)
                .lineSpacing(3)
                // Link trên nền mực phải là kem, không phải xanh mặc định — xanh trên mực
                // là cặp màu không đọc nổi.
                .tint(message.isMine ? NodieColors.cream : NodieColors.purple)
                .frame(maxWidth: .infinity, alignment: message.isMine ? .trailing : .leading)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(bubbleShape.fill(message.isMine ? NodieColors.ink : NodieColors.surface))
        .overlay(bubbleShape.stroke(message.isMine ? NodieColors.ink : NodieColors.rule, lineWidth: 1))
        .frame(maxWidth: 260, alignment: message.isMine ? .trailing : .leading)
    }

    /// Trích dẫn trong bong bóng — bấm vào là nhảy về tin gốc, như mọi messenger.
    @ViewBuilder
    private var replyQuote: some View {
        if let replyTarget {
            Button { onTapReplyQuote(replyTarget.id) } label: {
                HStack(spacing: 7) {
                    RoundedRectangle(cornerRadius: 1.5)
                        .fill(message.isMine ? NodieColors.cream.opacity(0.5) : NodieColors.accent)
                        .frame(width: 2.5)
                    VStack(alignment: .leading, spacing: 1) {
                        Text(replyTarget.isMine ? String(localized: "Bạn")
                                                : (replyTarget.who ?? String(localized: "Tin nhắn")))
                            .font(NodieTypography.timestampXs.weight(.bold))
                            .foregroundStyle(message.isMine ? NodieColors.cream.opacity(0.75) : NodieColors.accent)
                        Text(replyTarget.previewText)
                            .font(NodieTypography.timestampXs)
                            .foregroundStyle(message.isMine ? NodieColors.cream.opacity(0.6) : NodieColors.inkMuted)
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
    private func mediaBubble(_ kind: MediaKind) -> some View {
        RoundedRectangle(cornerRadius: 16)
            .fill(LinearGradient(colors: [Color(hex: 0xE4D9BF), Color(hex: 0xB8A67E)],
                                 startPoint: .topLeading, endPoint: .bottomTrailing))
            .frame(width: 170, height: 116)
            .overlay(alignment: .bottomLeading) {
                Text("\(kind.glyph) \(kind.bubbleLabel)")
                    .font(NodieTypography.tag)
                    .foregroundStyle(.white)
                    .padding(10)
            }
            .accessibilityLabel(kind.bubbleLabel)
    }

    /// Góc nhọn ở phía người gửi — quy ước bong bóng chat quen thuộc.
    private var bubbleShape: UnevenRoundedRectangle {
        UnevenRoundedRectangle(
            topLeadingRadius: 18,
            bottomLeadingRadius: message.isMine ? 18 : 4,
            bottomTrailingRadius: message.isMine ? 4 : 18,
            topTrailingRadius: 18
        )
    }
}

#Preview {
    ChatDetailView(state: AppState(), chatId: "lab")
}
