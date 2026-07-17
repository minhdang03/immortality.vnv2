import SwiftUI

/// Dải "Đã xoá — Hoàn tác" nổi trên tab bar.
///
/// Gắn ở gốc cây (RootTabView) chứ không trong từng màn, cùng lý do với alert lỗi ở đó:
/// xoá câu hỏi xong là màn chi tiết bị pop, banner đặt trong màn đó sẽ chết theo trước khi
/// ai kịp đọc — mà đó lại đúng là ca cần hoàn tác nhất.
private struct UndoBannerModifier: ViewModifier {
    @Bindable var qa: QAStore

    /// Đủ lâu để đọc và với tới, đủ ngắn để không đứng chình ình. Cùng cỡ với Gmail/Files.
    private static let visibleFor: Duration = .seconds(6)

    func body(content: Content) -> some View {
        content
            .overlay(alignment: .bottom) {
                if let undo = qa.pendingUndo {
                    banner(undo)
                        .padding(.horizontal, NodieSpacing.screenH)
                        // Nằm trên tab bar nổi (cao 74) — đè lên là che mất đường thoát.
                        .padding(.bottom, 84)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                        // id theo từng lần xoá: xoá tiếp thứ hai phải đếm giờ lại từ đầu,
                        // không thì banner thứ hai thừa hưởng đồng hồ sắp hết của lần trước.
                        .task(id: undo.id) {
                            try? await Task.sleep(for: Self.visibleFor)
                            guard !Task.isCancelled, qa.pendingUndo?.id == undo.id else { return }
                            qa.pendingUndo = nil
                        }
                }
            }
            .animation(.easeOut(duration: 0.2), value: qa.pendingUndo)
    }

    private func banner(_ undo: QAStore.PendingUndo) -> some View {
        HStack(spacing: NodieSpacing.md) {
            label(for: undo.target)
                .font(NodieTypography.metaSm)
                .foregroundStyle(.white)

            Spacer(minLength: 0)

            Button {
                NodieHaptics.tap()
                Task { await qa.undoLastDelete() }
            } label: {
                Text("Hoàn tác")
                    .font(NodieTypography.cta)
                    .foregroundStyle(NodieColors.accentLight)
                    // Chạm tới được bằng ngón tay: chữ "Hoàn tác" tự nó thấp hơn 44pt.
                    .frame(minHeight: 44)
                    .padding(.horizontal, NodieSpacing.sm)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityIdentifier("Hoàn tác")
        }
        .padding(.leading, NodieSpacing.lg)
        .padding(.trailing, NodieSpacing.sm)
        .background(Capsule().fill(NodieColors.ink))
    }

    /// Ternary trong Text(...) suy ra String → init verbatim, KHÔNG tra String Catalog.
    /// Mỗi nhánh một Text (xem LoginView.swift).
    @ViewBuilder
    private func label(for target: QAStore.PendingUndo.Target) -> some View {
        switch target {
        case .question: Text("Đã xoá câu hỏi")
        case .answer: Text("Đã xoá câu trả lời")
        case .reply: Text("Đã xoá phản hồi")
        }
    }
}

extension View {
    /// Cho hoàn tác lần xoá vừa rồi. Rẻ vì xoá là xoá mềm — xem QAStoreUndo.swift.
    func nodieUndoBanner(qa: QAStore) -> some View {
        modifier(UndoBannerModifier(qa: qa))
    }
}
