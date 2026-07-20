import SwiftUI
import UIKit

/// Ô soạn tin — TÁCH khỏi `ChatDetailView` có chủ đích. Chữ đang gõ giữ ở `@State` CỤC BỘ
/// của view này, KHÔNG ghi vào `AppState` mỗi phím.
///
/// Trước đây draft nằm trong `AppState` (`@Observable`), mà `body` ~1900 dòng của
/// ChatDetailView đọc `AppState` 33 chỗ → gõ MỘT chữ là SwiftUI dựng lại CẢ danh sách tin
/// (tính lại `rows`/`parentById`/`firstOfDayIds` + diff mọi bong bóng) = lag thấy được.
/// Messenger/IG/FB giữ chữ cục bộ trong ô nhập; gõ chỉ vẽ lại ô ~40pt, danh sách tin đứng yên.
/// Draft chỉ đẩy ra `AppState` khi RỜI màn (`persistDraft` trong `onDisappear`) để quay lại
/// còn chữ dở — và khi GỬI thành công.
struct MessageComposer: View {
    let members: [ConversationStore.ChannelMember]
    let currentUserId: UUID?
    let onAttach: () -> Void
    let onTyping: () -> Void
    /// Trả `true` nếu server nhận (hoặc đã vào hàng đợi offline) — khi đó ô nhập tự xoá chữ.
    /// `false` = lỗi cứng (slow-mode/RLS): giữ nguyên chữ để thử lại.
    let onSend: (String) async -> Bool
    let onStartRecording: () -> Void
    let persistDraft: (String) -> Void

    @State private var text: String
    /// Từ khoá @ đang gõ ở cuối (nil = không popup). "" = vừa gõ @, gợi ý mọi người.
    @State private var mentionQuery: String?
    @FocusState private var focused: Bool

    init(initialDraft: String,
         members: [ConversationStore.ChannelMember],
         currentUserId: UUID?,
         onAttach: @escaping () -> Void,
         onTyping: @escaping () -> Void,
         onSend: @escaping (String) async -> Bool,
         onStartRecording: @escaping () -> Void,
         persistDraft: @escaping (String) -> Void) {
        _text = State(initialValue: initialDraft)
        self.members = members
        self.currentUserId = currentUserId
        self.onAttach = onAttach
        self.onTyping = onTyping
        self.onSend = onSend
        self.onStartRecording = onStartRecording
        self.persistDraft = persistDraft
    }

    private var hasText: Bool {
        !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private var mentionCandidates: [ConversationStore.ChannelMember] {
        guard let query = mentionQuery else { return [] }
        let matches = members.filter { $0.id != currentUserId &&
            (query.isEmpty || $0.displayName.localizedCaseInsensitiveContains(query)) }
        return Array(matches.prefix(6))
    }

    var body: some View {
        VStack(spacing: NodieSpacing.sm) {
            if !mentionCandidates.isEmpty { mentionPopup }
            composeRow
        }
        // Rời màn (pop chat / bắt đầu ghi âm) → lưu chữ dở ra AppState để quay lại còn.
        .onDisappear { persistDraft(text) }
    }

    private func send() {
        let body = text
        Task {
            if await onSend(body) {
                text = ""
                mentionQuery = nil
            }
        }
    }

    /// Token @ đang gõ ở CUỐI ô nhập, hoặc nil. v1 chỉ bắt @ ở cuối (TextField không lộ vị trí
    /// con trỏ): `@` đầu chuỗi hoặc sau khoảng trắng, theo sau là chữ không khoảng trắng, sát
    /// cuối. "@" trơ → "" (gợi ý mọi người). "email@site" → nil.
    private static func mentionQuery(in text: String) -> String? {
        guard let atIndex = text.lastIndex(of: "@") else { return nil }
        if atIndex > text.startIndex {
            let before = text[text.index(before: atIndex)]
            if !before.isWhitespace { return nil }
        }
        let after = text[text.index(after: atIndex)...]
        guard !after.contains(where: { $0.isWhitespace }) else { return nil }
        return String(after)
    }

    private func insertMention(_ member: ConversationStore.ChannelMember) {
        guard let atIndex = text.lastIndex(of: "@") else { return }
        text.replaceSubrange(atIndex..., with: "@\(member.displayName) ")
        mentionQuery = nil
    }

    private var mentionPopup: some View {
        VStack(spacing: 0) {
            ForEach(mentionCandidates) { member in
                Button {
                    insertMention(member)
                } label: {
                    HStack(spacing: 10) {
                        Text(member.displayName.first.map { String($0).uppercased() } ?? "?")
                            .font(NodieTypography.tag.weight(.bold))
                            .foregroundStyle(NodieColors.cream)
                            .frame(width: 30, height: 30)
                            .background(Circle().fill(NodieColors.accent))
                        Text(member.displayName)
                            .font(NodieTypography.body)
                            .foregroundStyle(NodieColors.ink)
                        Spacer()
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                }
                .buttonStyle(.plain)
                if member.id != mentionCandidates.last?.id {
                    Divider().background(NodieColors.ruleLight)
                }
            }
        }
        .background(RoundedRectangle(cornerRadius: 12).fill(NodieColors.surface))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(NodieColors.rule, lineWidth: 1))
    }

    private var composeRow: some View {
        HStack(spacing: 10) {
            Button { onAttach() } label: {
                Text("＋")
                    .font(.system(size: 22, weight: .light))
                    .foregroundStyle(NodieColors.inkSoft)
                    .frame(width: 40, height: 40)
                    .background(Circle().stroke(NodieColors.chipBorder, lineWidth: 1))
                    .expandedHitArea(visual: 40)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Đính kèm")

            TextField("Nhắn tin…", text: $text)
                // Đang gõ → tín hiệu typing (throttle 3s trong store), chỉ khi CÓ chữ; đồng
                // thời dò @nhắc-tên. Ghi vào `$text` cục bộ nên KHÔNG động tới AppState/danh
                // sách tin — đây chính là chỗ khử lag.
                .onChange(of: text) { _, t in
                    if !t.isEmpty { onTyping() }
                    mentionQuery = Self.mentionQuery(in: t)
                }
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.ink)
                .focused($focused)
                .submitLabel(.send)
                .onSubmit { send() }
                .padding(.horizontal, NodieSpacing.lg)
                .padding(.vertical, 12)
                .background(Capsule().fill(NodieColors.surface))
                .overlay(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))

            // Có chữ thì gửi, chưa gõ gì thì ghi âm — cùng một chỗ, như FB/IG/Zalo.
            if hasText {
                Button { send() } label: {
                    Image(systemName: "arrow.up")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(NodieColors.onAccent)
                        .frame(width: 44, height: 44)
                        .background(Circle().fill(NodieColors.accent))
                        .expandedHitArea(visual: 44)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Gửi")
                // Bàn phím tiếng Việt vẽ phím Enter là "Gửi" (do `.submitLabel(.send)`),
                // trùng nhãn nút này → UITest tìm theo nhãn thấy HAI nút. Định danh không dịch
                // và bàn phím không có nó, nên test bám vào đây.
                .accessibilityIdentifier("sendMessage")
            } else {
                Button { onStartRecording() } label: {
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
}

