import SwiftUI

/// Chọn kênh đích để chuyển tiếp một tin — mở từ menu bong bóng.
///
/// Danh sách = kênh mình ĐĂNG ĐƯỢC (`canPost` — lọc luôn kênh phát một chiều với người
/// thường), trừ kênh đang đứng. Chọn một là gửi và đóng — forward nhiều kênh một lượt là
/// pattern spam, IG/Messenger cũng bắt chọn từng nơi có chủ đích.
struct ForwardMessageSheet: View {
    let store: ConversationStore
    let message: MessageRow

    @Environment(\.dismiss) private var dismiss
    /// Kênh đang gửi tới — khoá cả danh sách trong lúc chờ, tránh double-tap ra hai tin.
    @State private var sendingTo: UUID?
    /// Lỗi hiện TẠI SHEET — alert "Lỗi" gốc cây nằm DƯỚI sheet đang present, SwiftUI không
    /// bung nó lên trên: route qua store.errorMessage là forward hỏng trông như "bấm không
    /// ăn", alert chỉ nhảy ra lạc lõng sau khi đóng sheet.
    @State private var errorText: String?

    private var targets: [ChannelRow] {
        store.channels.filter { $0.canPost && $0.id != message.channelId }
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
                            Task {
                                if await store.forward(message, to: channel.id) {
                                    dismiss()
                                } else {
                                    // Lấy lời lỗi về sheet rồi XOÁ ở store — không xoá thì
                                    // alert gốc cây bung thêm lần nữa ngay khi sheet đóng.
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
            .navigationTitle(Text("Chuyển tiếp tới"))
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
