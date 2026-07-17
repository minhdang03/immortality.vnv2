import SwiftUI
import UIKit   // UIPasteboard — SwiftUI không re-export

/// Chat chi tiết — bong bóng tin nhắn + ô nhập, hoặc khoá nếu là kênh phát một chiều.
/// Thoát bằng nút back tròn HOẶC vuốt cạnh trái (NavigationStack lo).
struct ChatDetailView: View {
    @Bindable var state: AppState
    let chatId: String

    @Environment(\.dismiss) private var dismiss
    @FocusState private var inputFocused: Bool

    private var conversation: Conversation? { state.conversation(id: chatId) }
    private var messages: [ChatMessage] { state.messages(for: chatId) }
    private var hasDraft: Bool {
        !state.draft(in: chatId).trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

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
                                senderLabel: state.senderLabel(at: index, in: messages)
                            )
                            .padding(.top, index > 0 ? 10 : 0)
                            .id(message.id)
                        }
                    }
                    .padding(.horizontal, 18)
                    .padding(.vertical, 14)
                }
                // Kéo xuống là bàn phím hạ theo ngón tay — chuẩn iMessage/Messenger.
                .scrollDismissesKeyboard(.interactively)
                .onChange(of: messages.count) {
                    // Tin mới → cuộn xuống đáy (prototype làm việc này trong componentDidUpdate)
                    if let last = messages.last {
                        withAnimation(.easeOut(duration: 0.2)) { proxy.scrollTo(last.id, anchor: .bottom) }
                    }
                }
                .onAppear {
                    // Mở chat phải thấy NGAY tin mới nhất, không phải tự cuộn xuống.
                    // Không animation: đây là vị trí xuất phát, không phải chuyển động.
                    if let last = messages.last {
                        proxy.scrollTo(last.id, anchor: .bottom)
                    }
                }
            }

            inputBar
        }
        .background(NodieColors.bg)
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
    @State private var on = false

    var body: some View {
        Circle()
            .fill(NodieColors.rec)
            .frame(width: 10, height: 10)
            .opacity(on ? 0.35 : 1)
            .animation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true), value: on)
            .onAppear { on = true }
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

    var body: some View {
        VStack(alignment: message.isMine ? .trailing : .leading, spacing: 3) {
            if let senderLabel {
                Text(senderLabel)
                    .font(NodieTypography.timestamp.weight(.semibold))
                    .foregroundStyle(NodieColors.accent)
                    .padding(.horizontal, NodieSpacing.xs)
            }

            switch message.kind {
            case .media(let kind):
                mediaBubble(kind)
            case .voice:
                textBubble
            case .text:
                // Giữ bong bóng → Sao chép, như mọi messenger. Chỉ tin CHỮ — gắn cả cho
                // tin thoại thì long-press chỉ được copy dòng "▶ Tin nhắn thoại", vô nghĩa.
                textBubble.contextMenu {
                    Button {
                        UIPasteboard.general.string = message.text
                    } label: {
                        Label("Sao chép", systemImage: "doc.on.doc")
                    }
                }
            }

            Text(message.time)
                .font(NodieTypography.timestampXs)
                .foregroundStyle(NodieColors.inkFaint)
                .padding(.horizontal, NodieSpacing.xs)
        }
        .frame(maxWidth: .infinity, alignment: message.isMine ? .trailing : .leading)
    }

    /// Tin thoại dùng chung bong bóng chữ — chưa phát được thì nó đúng là một dòng chữ.
    private var bubbleText: String {
        if case .voice(let duration) = message.kind { return "▶  Tin nhắn thoại · \(duration)" }
        return message.text
    }

    private var textBubble: some View {
        Text(bubbleText)
            .font(NodieTypography.body)
            .foregroundStyle(message.isMine ? NodieColors.cream : NodieColors.ink)
            .lineSpacing(3)
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(bubbleShape.fill(message.isMine ? NodieColors.ink : NodieColors.surface))
            .overlay(bubbleShape.stroke(message.isMine ? NodieColors.ink : NodieColors.rule, lineWidth: 1))
            .frame(maxWidth: 260, alignment: message.isMine ? .trailing : .leading)
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
