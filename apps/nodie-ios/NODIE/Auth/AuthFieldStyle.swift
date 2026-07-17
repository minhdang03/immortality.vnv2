import SwiftUI

/// Vỏ ô nhập của các màn auth (Login + đặt lại mật khẩu).
///
/// Tách ra vì hai file cùng cần đúng bộ viền/nền này. Chỉ gói phần NHÌN — việc quản
/// focus để nguyên ở view gọi: LoginView dùng enum nhiều ô, các sheet chỉ có một ô,
/// ép chung một khuôn focus sẽ phức tạp hơn thứ nó tiết kiệm.
extension View {
    func nodieAuthField(isFocused: Bool) -> some View {
        self
            .font(NodieTypography.body)
            .foregroundStyle(NodieColors.ink)
            .padding(.horizontal, NodieSpacing.lg)
            .padding(.vertical, 14)
            .background(Capsule().fill(NodieColors.surface))
            .overlay(Capsule().stroke(isFocused ? NodieColors.accent : NodieColors.chipBorder,
                                      lineWidth: 1))
    }
}
