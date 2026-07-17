import SwiftUI

/// Màn đăng nhập / đăng ký.
///
/// ⚠️ KHÔNG có trong `Aion Prototype v3` — tự thiết kế theo design token hiện có.
/// Cần Đăng review; có thể design lại trong Claude Design rồi thay.
///
/// Chỉ email + mật khẩu: Supabase mới bật provider `email`. Vì không có social login nào,
/// App Store KHÔNG bắt buộc Sign in with Apple (guideline 4.8 chỉ áp khi có social khác).
struct LoginView: View {
    @Bindable var auth: AuthStore

    @State private var isSignUp = false
    @State private var email = ""
    @State private var password = ""
    @State private var displayName = ""
    @State private var showTerms = false
    @State private var showForgotPassword = false
    @FocusState private var focus: Field?

    private enum Field { case name, email, password }

    private var trimmedName: String { displayName.trimmingCharacters(in: .whitespacesAndNewlines) }

    private var canSubmit: Bool {
        guard email.contains("@"), password.count >= 6, !auth.isBusy else { return false }
        // Đăng ký thì tên là bắt buộc — xem ghi chú ở AuthStore.signUp: bỏ trống là user
        // hiện lên với phần trước @ của email trước mặt cả cộng đồng.
        return isSignUp ? trimmedName.count >= 2 : true
    }

    var body: some View {
        ZStack {
            NodieColors.bg.ignoresSafeArea()

            if case .awaitingEmailConfirmation(let pendingEmail) = auth.phase {
                EmailConfirmationView(email: pendingEmail) { auth.backToSignIn() }
            } else {
                form
            }
        }
    }

    private var form: some View {
        VStack(alignment: .leading, spacing: 0) {
            Spacer(minLength: 0)

            EyebrowLabel(text: "Bất Tử Đạo", font: NodieTypography.eyebrow)

            // Ternary trong Text(...) suy ra String → init verbatim, KHÔNG tra String Catalog.
            // Tách mỗi nhánh một Text để giữ đường localize.
            (isSignUp ? Text("Tạo tài khoản") : Text("Chào mừng trở lại"))
                .font(NodieTypography.screenTitle)
                .foregroundStyle(NodieColors.ink)
                .padding(.top, NodieSpacing.sm)

            (isSignUp
                 ? Text("Nơi bạn chia sẻ tri thức và cùng nhau đi sâu.")
                 : Text("Đăng nhập để tiếp tục hành trình."))
                .font(NodieTypography.metaSm)
                .foregroundStyle(NodieColors.inkMuted)
                .padding(.top, 6)

            if isSignUp {
                field(placeholder: "Tên hiển thị", id: "Tên hiển thị", text: $displayName, focused: .name)
                    .textContentType(.name)
                    .textInputAutocapitalization(.words)
                    .padding(.top, NodieSpacing.xxl)

                Text("Tên này hiện cùng mọi câu hỏi và trả lời của bạn. Đổi được sau trong Cá Nhân.")
                    .font(NodieTypography.metaSm)
                    .foregroundStyle(NodieColors.inkFaint)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.top, 6)
                    .padding(.horizontal, NodieSpacing.lg)
            }

            field(placeholder: "Email", id: "Email", text: $email, focused: .email)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .padding(.top, isSignUp ? NodieSpacing.md : NodieSpacing.xxl)

            field(placeholder: "Mật khẩu", id: "Mật khẩu", text: $password, focused: .password, secure: true)
                .textContentType(isSignUp ? .newPassword : .password)
                .padding(.top, NodieSpacing.md)

            // Chỉ ở nhánh đăng nhập: đang tạo tài khoản mới thì chưa có mật khẩu để quên.
            if !isSignUp {
                Button { showForgotPassword = true } label: {
                    Text("Quên mật khẩu?")
                        .font(NodieTypography.metaSm)
                        .foregroundStyle(NodieColors.inkSoft)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("Quên mật khẩu?")
                .padding(.top, NodieSpacing.sm)
                .padding(.horizontal, NodieSpacing.lg)
            }

            if let error = auth.errorMessage {
                Text(error)
                    .font(NodieTypography.meta)
                    .foregroundStyle(Color(hex: 0xB3261E))
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.top, NodieSpacing.md)
                    .accessibilityIdentifier("authError")
            }

            Button {
                Task {
                    if isSignUp { await auth.signUp(email: email, password: password, displayName: trimmedName) }
                    else { await auth.signIn(email: email, password: password) }
                }
            } label: {
                ZStack {
                    if auth.isBusy {
                        ProgressView().tint(.white)
                    } else {
                        (isSignUp ? Text("Đăng ký") : Text("Đăng nhập"))
                            .font(NodieTypography.ctaLg)
                            .foregroundStyle(.white)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Capsule().fill(canSubmit ? NodieColors.accent : NodieColors.chipBorder))
            }
            .buttonStyle(.plain)
            .disabled(!canSubmit)
            .padding(.top, NodieSpacing.xl)

            Button {
                isSignUp.toggle()
                auth.clearError()
            } label: {
                (isSignUp ? Text("Đã có tài khoản? Đăng nhập") : Text("Chưa có tài khoản? Đăng ký"))
                    .font(NodieTypography.meta)
                    .foregroundStyle(NodieColors.inkSoft)
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.plain)
            .padding(.top, NodieSpacing.lg)

            // Guideline 1.2: điều khoản phải đọc được từ trong app, và điểm user
            // cam kết là lúc tạo tài khoản — nên link đặt ngay ở đây.
            Button { showTerms = true } label: {
                Text("Khi dùng NODIE, bạn đồng ý với Điều khoản sử dụng.")
                    .font(NodieTypography.metaSm)
                    .underline()
                    .foregroundStyle(NodieColors.inkFaint)
                    .frame(maxWidth: .infinity)
                    .multilineTextAlignment(.center)
            }
            .buttonStyle(.plain)
            .padding(.top, NodieSpacing.sm)
            .sheet(isPresented: $showTerms) { TermsOfUseView() }
            .sheet(isPresented: $showForgotPassword) { ForgotPasswordSheet(auth: auth) }
            // Link trong mail quay về lúc sheet "kiểm tra hộp thư" CÒN MỞ (đường thật của
            // user: gửi xong là sang Mail luôn, chẳng ai bấm "Xong"). Một host chỉ trình bày
            // được một modal — sheet này còn đó thì `.fullScreenCover` đặt ở RootView bị
            // chặn và màn đặt mật khẩu mới rơi mất, để lại cờ kẹt ở true.
            .onChange(of: auth.isRecoveringPassword) { _, isRecovering in
                if isRecovering { showForgotPassword = false }
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    /// `placeholder` là LocalizedStringKey (dịch theo máy); `id` là accessibilityIdentifier
    /// CỐ ĐỊNH tiếng Việt — UITests bám vào id, không được trôi theo ngôn ngữ.
    @ViewBuilder
    private func field(placeholder: LocalizedStringKey, id: String, text: Binding<String>,
                       focused: Field, secure: Bool = false) -> some View {
        Group {
            if secure {
                SecureField(placeholder, text: text)
            } else {
                TextField(placeholder, text: text)
            }
        }
        .focused($focus, equals: focused)
        .nodieAuthField(isFocused: focus == focused)
        .accessibilityIdentifier(id)
    }
}

/// Sau khi đăng ký: Supabase bắt xác nhận email (`mailer_autoconfirm: false`)
/// nên chưa có session. Phải nói rõ, không để user tưởng đã vào được.
private struct EmailConfirmationView: View {
    let email: String
    let onBack: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            Text("✉️").font(.system(size: 48))

            Text("Kiểm tra hộp thư")
                .font(NodieTypography.screenTitle)
                .foregroundStyle(NodieColors.ink)
                .padding(.top, NodieSpacing.lg)

            (Text("Mình vừa gửi link xác nhận tới\n")
             + Text(email).foregroundColor(NodieColors.accent).bold())
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.inkMuted)
                .multilineTextAlignment(.center)
                .lineSpacing(4)
                .padding(.top, NodieSpacing.md)

            Text("Bấm link trong email rồi quay lại đây đăng nhập.")
                .font(NodieTypography.metaSm)
                .foregroundStyle(NodieColors.inkFaint)
                .multilineTextAlignment(.center)
                .padding(.top, NodieSpacing.sm)

            Button(action: onBack) {
                Text("Quay lại đăng nhập")
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

#Preview {
    LoginView(auth: AuthStore())
}
