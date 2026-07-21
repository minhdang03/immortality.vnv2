import SwiftUI

/// Chọn kênh đích để chuyển tiếp — mở từ menu bong bóng (một tin) hoặc từ chế độ chọn
/// nhiều tin (phase 03).
///
/// Danh sách = kênh mình ĐĂNG ĐƯỢC (`canPost` — lọc luôn kênh phát một chiều với người
/// thường), trừ kênh đang đứng. Chọn một là gửi và đóng — forward nhiều kênh một lượt là
/// pattern spam, IG/Messenger cũng bắt chọn từng nơi có chủ đích.
struct ForwardMessageSheet: View {
    let store: ConversationStore
    /// Một hoặc nhiều tin, theo thứ tự thời gian — gửi tuần tự để bên nhận đọc đúng mạch.
    let messages: [MessageRow]

    @Environment(\.dismiss) private var dismiss
    /// Kênh đang gửi tới — khoá cả danh sách trong lúc chờ, tránh double-tap ra hai tin.
    @State private var sendingTo: UUID?
    /// Lỗi hiện TẠI SHEET — alert "Lỗi" gốc cây nằm DƯỚI sheet đang present, SwiftUI không
    /// bung nó lên trên: route qua store.errorMessage là forward hỏng trông như "bấm không
    /// ăn", alert chỉ nhảy ra lạc lõng sau khi đóng sheet.
    @State private var errorText: String?
    /// Đã forward tin nào tới kênh nào. Retry cùng kênh sau khi hỏng GIỮA CHỪNG bỏ qua phần
    /// đã sang — không thì #1-2 đã tới rồi lại gửi lần nữa (nhân đôi). Đổi kênh thì reset.
    @State private var forwarded: (channel: UUID, ids: Set<UUID>)?

    private var targets: [ChannelRow] {
        store.channels.filter { $0.canPost && $0.id != messages.first?.channelId }
    }

    var body: some View {
        NavigationStack {
            Group {
                if targets.isEmpty {
                    Text("Chưa có hội thoại nào để chuyển tiếp.")
                        .font(NodieTypography.body)
                        .foregroundStyle(NodieColors.inkMuted)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List(targets) { channel in
                        Button {
                            guard sendingTo == nil else { return }
                            sendingTo = channel.id
                            // Đổi kênh → mẻ mới; cùng kênh (retry) → giữ phần đã sang.
                            var done = forwarded?.channel == channel.id ? forwarded!.ids : []
                            Task {
                                // Tuần tự, KHÔNG song song: thứ tự tin là một phần nội dung,
                                // và media forward phải copy tệp trên Storage — bắn 20 lượt
                                // cùng lúc là tự dựng cơn bão request. Bỏ qua tin ĐÃ sang kênh
                                // này ở lần thử trước (chống nhân đôi khi retry).
                                var ok = true
                                for message in messages where ok && !done.contains(message.id) {
                                    ok = await store.forward(message, to: channel.id)
                                    if ok { done.insert(message.id) }
                                }
                                if ok {
                                    dismiss()
                                } else {
                                    forwarded = (channel.id, done)
                                    errorText = store.errorMessage
                                        ?? String(localized: "Không gửi được. Thử lại.")
                                    store.clearError()
                                    sendingTo = nil
                                }
                            }
                        } label: {
                            HStack(spacing: NodieSpacing.md) {
                                ConversationAvatar(channel: channel, size: 40, fontSize: 18)
                                Text(channel.displayTitle)
                                    .font(NodieTypography.body.weight(.medium))
                                    .foregroundStyle(NodieColors.ink)
                                Spacer()
                                if sendingTo == channel.id {
                                    ProgressView().tint(NodieColors.inkFaint)
                                }
                            }
                        }
                        .disabled(sendingTo != nil)
                        .listRowBackground(NodieColors.bg)
                        .listRowSeparator(.hidden)
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                }
            }
            .background(NodieColors.bg)
            .navigationTitle(messages.count > 1
                             ? Text("Chuyển tiếp \(messages.count) tin")
                             : Text("Chuyển tiếp tới"))
            .navigationBarTitleDisplayMode(.inline)
            .alert("Lỗi", isPresented: Binding(
                get: { errorText != nil },
                set: { if !$0 { errorText = nil } }
            )) {
                Button("OK") { errorText = nil }
            } message: { Text(errorText ?? "") }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Huỷ") { dismiss() }
                        .foregroundStyle(NodieColors.inkMuted)
                }
            }
        }
        .presentationDetents([.medium, .large])
    }
}
