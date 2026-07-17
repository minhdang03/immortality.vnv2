import SwiftUI

/// Bước 1: xin link đặt lại. Mở dạng sheet từ màn Login.
///
/// Supabase cố tình không nói email có tồn tại hay không (chống dò tài khoản), nên gửi
/// xong là chuyển thẳng sang "kiểm tra hộp thư" — không có gì để xác nhận thêm.
struct ForgotPasswordSheet: View {
    @Bindable var auth: AuthStore
    @Environment(\.dismiss) private var dismiss

    @State private var email = ""
    @FocusState private var focused: Bool

    private var canSend: Bool { email.contains("@") && !auth.isBusy }

    var body: some View {
        ZStack {
            NodieColors.bg.ignoresSafeArea()

            if auth.didSendResetEmail {
                sentState
            } else {
                form
            }
        }
        .onAppear { auth.clearError() }
        .onDisappear { auth.clearSendState() }
    }

    private var form: some View {
        VStack(alignment: .leading, spacing: 0) {
            Spacer(minLength: 0)

            Text("Đặt lại mật khẩu")
                .font(NodieTypography.screenTitle)
                .foregroundStyle(NodieColors.ink)

            Text("Nhập email của bạn, mình gửi link đặt lại.")
                .font(NodieTypography.metaSm)
                .foregroundStyle(NodieColors.inkMuted)
                .padding(.top, 6)

            TextField("Email", text: $email)
                .focused($focused)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .nodieAuthField(isFocused: focused)
                .accessibilityIdentifier("Email đặt lại")
                .padding(.top, NodieSpacing.xxl)

            if let error = auth.errorMessage {
                Text(error)
                    .font(NodieTypography.meta)
                    .foregroundStyle(Color(hex: 0xB3261E))
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.top, NodieSpacing.md)
                    .accessibilityIdentifier("authError")
            }

            Button {
                Task { await auth.sendPasswordReset(email: email) }
            } label: {
                ZStack {
                    if auth.isBusy {
                        ProgressView().tint(.white)
                    } else {
                        Text("Gửi link đặt lại")
                            .font(NodieTypography.ctaLg)
                            .foregroundStyle(.white)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Capsule().fill(canSend ? NodieColors.accent : NodieColors.chipBorder))
            }
            .buttonStyle(.plain)
            .disabled(!canSend)
            .accessibilityIdentifier("Gửi link đặt lại")
            .padding(.top, NodieSpacing.xl)

            Spacer(minLength: 0)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var sentState: some View {
        VStack(spacing: 0) {
            Spacer()

            Text("✉️").font(.system(size: 48))

            Text("Kiểm tra hộp thư")
                .font(NodieTypography.screenTitle)
                .foregroundStyle(NodieColors.ink)
                .padding(.top, NodieSpacing.lg)

            (Text("Mình vừa gửi link đặt lại tới\n")
             + Text(email).foregroundColor(NodieColors.accent).bold())
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.inkMuted)
                .multilineTextAlignment(.center)
                .lineSpacing(4)
                .padding(.top, NodieSpacing.md)

            Text("Bấm link trong email để đặt mật khẩu mới.")
                .font(NodieTypography.metaSm)
                .foregroundStyle(NodieColors.inkFaint)
                .multilineTextAlignment(.center)
                .padding(.top, NodieSpacing.sm)

            // Đường thật của user: gửi xong → sang Mail → bấm link → app quay lại lúc sheet
            // NÀY vẫn đang mở. Link hỏng thì lỗi phải hiện ở đây; không có ô này thì user
            // bấm link chết và nhận lại sự im lặng.
            if let error = auth.errorMessage {
                Text(error)
                    .font(NodieTypography.meta)
                    .foregroundStyle(Color(hex: 0xB3261E))
                    .fixedSize(horizontal: false, vertical: true)
                    .multilineTextAlignment(.center)
                    .padding(.top, NodieSpacing.md)
                    .accessibilityIdentifier("authError")
            }

            Button { dismiss() } label: {
                Text("Xong")
                    .font(NodieTypography.ctaLg)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Capsule().fill(NodieColors.accent))
            }
            .buttonStyle(.plain)
            .padding(.top, NodieSpacing.xxl)

            Spacer()
        }
        .padding(.horizontal, NodieSpacing.screenH)
    }
}

/// Bước 2: đặt mật khẩu mới, sau khi link trong mail đã mở app.
///
/// Đặt ở `RootView` chứ không phải LoginView: đổi code xong là phase nhảy `.signedIn`
/// (PKCE chỉ phát event đó) → LoginView bị gỡ khỏi cây, cover gắn ở đó sẽ biến mất
/// cùng chủ. Xem AuthStore.isRecoveringPassword.
struct NewPasswordSheet: View {
    @Bindable var auth: AuthStore

    @State private var password = ""
    @FocusState private var focused: Bool

    // `isExchangingCode`: chưa đổi xong code thì session còn là của người đang đăng nhập
    // (hoặc chưa có) — cho bấm Lưu lúc này là ghi mật khẩu nhầm tài khoản. Xem AuthStore.
    private var canSave: Bool { password.count >= 6 && !auth.isBusy && !auth.isExchangingCode }

    var body: some View {
        ZStack {
            NodieColors.bg.ignoresSafeArea()

            VStack(alignment: .leading, spacing: 0) {
                Spacer(minLength: 0)

                Text("Đặt mật khẩu mới")
                    .font(NodieTypography.screenTitle)
                    .foregroundStyle(NodieColors.ink)

                Text("Mật khẩu phải từ 6 ký tự trở lên.")
                    .font(NodieTypography.metaSm)
                    .foregroundStyle(NodieColors.inkMuted)
                    .padding(.top, 6)

                SecureField("Mật khẩu mới", text: $password)
                    .focused($focused)
                    .textContentType(.newPassword)
                    .nodieAuthField(isFocused: focused)
                    .accessibilityIdentifier("Mật khẩu mới")
                    .padding(.top, NodieSpacing.xxl)

                if let error = auth.errorMessage {
                    Text(error)
                        .font(NodieTypography.meta)
                        .foregroundStyle(Color(hex: 0xB3261E))
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.top, NodieSpacing.md)
                        .accessibilityIdentifier("authError")
                }

                Button {
                    Task { await auth.updatePassword(password) }
                } label: {
                    ZStack {
                        if auth.isBusy {
                            ProgressView().tint(.white)
                        } else {
                            Text("Lưu mật khẩu")
                                .font(NodieTypography.ctaLg)
                                .foregroundStyle(.white)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Capsule().fill(canSave ? NodieColors.accent : NodieColors.chipBorder))
                }
                .buttonStyle(.plain)
                .disabled(!canSave)
                .accessibilityIdentifier("Lưu mật khẩu")
                .padding(.top, NodieSpacing.xl)

                // Huỷ không đăng xuất: link recovery đã là session hợp lệ (xem
                // AuthStore.cancelPasswordRecovery). Mật khẩu cũ vẫn dùng được.
                Button { auth.cancelPasswordRecovery() } label: {
                    Text("Để sau")
                        .font(NodieTypography.meta)
                        .foregroundStyle(NodieColors.inkSoft)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.plain)
                .padding(.top, NodieSpacing.lg)

                Spacer(minLength: 0)
            }
            .padding(.horizontal, NodieSpacing.screenH)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}
