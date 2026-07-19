import SwiftUI

/// Banner mảnh trên cùng khi mất mạng — chuẩn IG/X. Tự ẩn ngay khi có mạng lại
/// (`NodieNetworkMonitor.shared.isOnline` đổi thì view host tự vẽ lại, không cần polling).
struct NodieOfflineBanner: View {
    var body: some View {
        Text("Không có kết nối")
            .font(NodieTypography.metaSm.weight(.semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 7)
            .background(NodieColors.ink)
            .accessibilityAddTraits(.updatesFrequently)
    }
}

private struct NodieOfflineBannerModifier: ViewModifier {
    /// Đọc trực tiếp singleton `@Observable` — SwiftUI tự đăng ký theo dõi thuộc tính được
    /// đọc trong `body`, không cần bọc thêm `@State` cho một tham chiếu bất biến.
    private var monitor: NodieNetworkMonitor { .shared }

    func body(content: Content) -> some View {
        VStack(spacing: 0) {
            if !monitor.isOnline {
                NodieOfflineBanner().transition(.move(edge: .top).combined(with: .opacity))
            }
            content
        }
        .animation(.easeOut(duration: 0.2), value: monitor.isOnline)
    }
}

extension View {
    /// Gắn banner offline lên trên cùng nội dung — đặt Ở GỐC CÂY (RootTabView), không phải
    /// mỗi màn một lần, để banner nhất quán qua mọi tab.
    func nodieOfflineBanner() -> some View {
        modifier(NodieOfflineBannerModifier())
    }
}

#if DEBUG
#Preview {
    VStack { Text("Nội dung màn hình") }.nodieOfflineBanner()
}
#endif
