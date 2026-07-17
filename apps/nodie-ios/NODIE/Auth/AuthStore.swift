import Foundation
import Supabase

/// Vòng đời đăng nhập + hồ sơ. Tách khỏi `AppState` có chủ đích:
/// auth sống lâu hơn và độc lập với state điều hướng/UI.
///
/// Session do supabase-swift tự lưu vào Keychain và tự refresh token —
/// không tự làm lại (xem memory: không hand-roll thứ SDK đã cho).
@Observable
final class AuthStore {
    enum Phase: Equatable {
        /// Đang khôi phục session lúc khởi động — chưa biết đăng nhập hay chưa.
        case restoring
        case signedOut
        case signedIn
        /// Đã đăng ký nhưng Supabase bắt xác nhận email (`mailer_autoconfirm: false`).
        case awaitingEmailConfirmation(email: String)
    }

    private(set) var phase: Phase = .restoring
    private(set) var profile: UserProfile?
    private(set) var errorMessage: String?
    private(set) var isBusy = false

    /// Đang ở giữa luồng đặt lại mật khẩu (mở từ link trong mail).
    ///
    /// Vì sao là cờ tự quản chứ không nghe `.passwordRecovery`: SDK CHỈ phát event đó trong
    /// nhánh `handleImplicitGrantFlow`, mà app chạy PKCE (`Defaults.defaultFlowType = .pkce`)
    /// → link recovery đi đường `exchangeCodeForSession`, chỉ phát `.signedIn`.
    /// Nghe event = chờ một thứ không bao giờ tới.
    private(set) var isRecoveringPassword = false

    /// Đã gửi xong mail đặt lại — để sheet đổi sang trạng thái "kiểm tra hộp thư".
    private(set) var didSendResetEmail = false

    /// Đang đổi `code` trong link lấy session. Nút "Lưu mật khẩu" phải tắt trong lúc này:
    /// xem ghi chú trong `handleOpenURL`.
    private(set) var isExchangingCode = false

    /// Supabase phải whitelist đúng 2 URL này ở Dashboard → Auth → URL Configuration,
    /// nếu không nó từ chối `redirect_to` và mail không có đường về app.
    private static let resetURL = URL(string: "nodie://password-reset")!
    private static let confirmURL = URL(string: "nodie://email-confirmed")!

    private let client = SupabaseClientProvider.shared
    private var authTask: Task<Void, Never>?

    init() {
        #if DEBUG
        // Test gesture/UI không quan tâm auth — cho chúng bỏ qua để khỏi gọi mạng,
        // giữ test nhanh và tất định. CHỈ DEBUG + chỉ khi có launch arg.
        if ProcessInfo.processInfo.arguments.contains("--uitest-bypass-auth") {
            phase = .signedIn
            profile = UserProfile(id: UUID(), role: "user", displayName: "Minh", bio: nil)
            return
        }
        #endif
        observeAuthChanges()
    }

    deinit {
        authTask?.cancel()
    }

    #if DEBUG
    /// Đăng nhập THẬT cho UI test, nhưng không đi qua bàn phím.
    ///
    /// Vì sao phải có: test nào gõ mật khẩu bằng `typeText` thì ~3 giây sau khi bấm Đăng nhập,
    /// iOS bật lớp AutoFill ("Lưu mật khẩu?") — một remote view của tiến trình khác, phủ toàn
    /// màn và NUỐT SẠCH chạm. Nó vô hình trong ảnh chụp của XCUITest và không nằm trong
    /// `app.alerts` lẫn `springboard.alerts`, nên biểu hiện ra ngoài chỉ là "bấm gì cũng không
    /// ăn" — cực dễ đọc nhầm thành app treo. (Đo được: mọi phần tử `hittable=false` từ T+3s,
    /// tap theo toạ độ cũng không xuyên qua.)
    ///
    /// Đây KHÔNG phải bypass: session/JWT/RLS đều thật y như user gõ tay — chỉ khác là gọi
    /// thẳng SDK thay vì gõ vào ô. Test nào cần soi chính màn Login (sai mật khẩu, đăng xuất,
    /// chặn khi chưa đăng nhập) vẫn gõ tay bình thường qua `AuthUITests`.
    ///
    /// Credential lấy từ môi trường của test runner; thiếu → không làm gì, app dừng ở Login.
    private func autoLoginForUITestsIfRequested() async {
        guard ProcessInfo.processInfo.arguments.contains("--uitest-auto-login") else { return }
        let env = ProcessInfo.processInfo.environment
        guard let email = env["NODIE_TEST_EMAIL"], !email.isEmpty,
              let password = env["NODIE_TEST_PASSWORD"], !password.isEmpty else { return }
        try? await client.auth.signIn(email: email, password: password)
    }
    #endif

    /// Nguồn sự thật duy nhất cho `phase`: luồng authStateChanges của SDK.
    /// Nghe cả lúc khởi động (SDK phát `initialSession`) nên không cần gọi getSession riêng.
    private func observeAuthChanges() {
        authTask = Task { [weak self] in
            guard let self else { return }

            #if DEBUG
            // Test auth thật cần bắt đầu từ trạng thái đã biết → xoá session cũ trước khi nghe.
            // Subscribe sau signOut vẫn nhận `initialSession` (nil) → phase = .signedOut.
            //
            // scope .local, KHÔNG phải mặc định .global: global gọi mạng để thu hồi session
            // trên server, mạng lỗi/token hết hạn thì `try?` nuốt lỗi và session dưới máy CÒN
            // NGUYÊN → app tự vào thẳng → test tưởng "không thấy màn Login" là bug. Việc ta cần
            // ở đây chỉ là máy quên session; thu hồi phía server không liên quan.
            if ProcessInfo.processInfo.arguments.contains("--uitest-reset-auth") {
                try? await self.client.auth.signOut(scope: .local)
            }
            await self.autoLoginForUITestsIfRequested()
            #endif

            for await (event, session) in client.auth.authStateChanges {
                switch event {
                case .initialSession, .signedIn, .tokenRefreshed, .userUpdated:
                    if session != nil {
                        self.phase = .signedIn
                        await self.loadProfile()
                    } else if case .restoring = self.phase {
                        self.phase = .signedOut
                    }
                case .signedOut:
                    self.profile = nil
                    self.phase = .signedOut
                default:
                    break
                }
            }
        }
    }

    // MARK: - Hành động

    func signIn(email: String, password: String) async {
        await run {
            try await self.client.auth.signIn(email: email, password: password)
            // phase chuyển sang .signedIn qua authStateChanges — không set tay ở đây
            // để tránh hai nguồn sự thật.
        }
    }

    /// `displayName` đi vào `raw_user_meta_data` để trigger `handle_new_user` (0009) đọc:
    /// `coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1))`.
    ///
    /// Bắt buộc hỏi tên chứ không để trigger tự lấy phần trước @: tên hiện công khai trên
    /// mọi câu hỏi/trả lời, nên rơi về email prefix là LỘ MỘT NỬA EMAIL của user cho cả
    /// cộng đồng (`nguyenvanan1988@gmail.com` → ai cũng thấy "nguyenvanan1988").
    /// Nhánh coalesce chỉ còn là lưới an toàn cho user tạo thẳng bằng Admin API.
    func signUp(email: String, password: String, displayName: String) async {
        await run {
            let response = try await self.client.auth.signUp(
                email: email,
                password: password,
                data: ["display_name": .string(displayName.trimmingCharacters(in: .whitespacesAndNewlines))],
                redirectTo: Self.confirmURL
            )
            // Supabase bật xác nhận email → chưa có session. Phải báo user đi check mail,
            // KHÔNG được để họ tưởng đã vào được.
            if response.session == nil {
                self.phase = .awaitingEmailConfirmation(email: email)
            }
        }
    }

    func signOut() async {
        await run {
            try await self.client.auth.signOut()
        }
    }

    // MARK: - Đặt lại mật khẩu

    /// Gửi mail chứa link `nodie://password-reset`.
    ///
    /// Supabase cố tình KHÔNG báo email có tồn tại hay không (chống dò tài khoản), nên
    /// gọi xong là coi như đã gửi — không có gì để kiểm chứng phía client.
    func sendPasswordReset(email: String) async {
        await run {
            try await self.client.auth.resetPasswordForEmail(
                email.trimmingCharacters(in: .whitespacesAndNewlines),
                redirectTo: Self.resetURL
            )
            self.didSendResetEmail = true
        }
    }

    /// iOS mở app bằng link trong mail.
    func handleOpenURL(_ url: URL) async {
        // Đặt cờ TRƯỚC khi đổi code: exchange xong là `authStateChanges` bắn `.signedIn`
        // ngay, phase nhảy sang .signedIn và cây view đổi — set sau là trễ mất một nhịp
        // render, user thấy nháy vào thẳng app rồi mới hiện màn đặt mật khẩu.
        let isReset = url.host == "password-reset" || url.path == "password-reset"
        if isReset { isRecoveringPassword = true }

        // Chưa đổi xong code thì CHƯA có session của chủ link. Không khoá lại thì nút
        // "Lưu mật khẩu" ăn được ngay, và `update(user:)` sẽ ghi bằng session ĐANG có —
        // mở link của B trong lúc đang đăng nhập bằng A là đổi nhầm mật khẩu của A.
        isExchangingCode = true
        errorMessage = nil
        do {
            _ = try await client.auth.session(from: url)
        } catch {
            // Ca thật hay gặp: xin reset ở máy A, mở link ở máy B → máy B không có
            // code_verifier của PKCE → exchange fail. Không vá được, chỉ nói cho rõ.
            errorMessage = Self.linkMessage(for: error)
            isRecoveringPassword = false
        }
        isExchangingCode = false
    }

    /// Lỗi khi đổi code từ link trong mail.
    ///
    /// Tách khỏi `viMessage` có chủ đích: câu "link hết hạn" CHỈ đúng ở đây. Nhét nó vào
    /// translator dùng chung (bắt theo chữ "invalid") thì mọi lỗi khác có chữ đó — email
    /// sai định dạng lúc đăng ký, refresh token hỏng — đều bị gán nhầm thành lỗi link.
    private static func linkMessage(for error: Error) -> String {
        // Mất mạng thì nói mất mạng, đừng đổ cho cái link.
        if (error as NSError).domain == NSURLErrorDomain { return viMessage(for: error) }
        return String(localized: "Link đã hết hạn hoặc mở trên máy khác. Gửi lại giúp mình nhé.")
    }

    func updatePassword(_ newPassword: String) async {
        await run {
            _ = try await self.client.auth.update(user: UserAttributes(password: newPassword))
            self.isRecoveringPassword = false
        }
    }

    /// Huỷ giữa chừng. KHÔNG signOut: link recovery đã tạo session hợp lệ rồi — để họ ở
    /// trong app như vừa đăng nhập, đúng mô hình của Supabase. Mật khẩu cũ vẫn dùng được.
    func cancelPasswordRecovery() {
        isRecoveringPassword = false
        errorMessage = nil
    }

    /// Đóng sheet "Quên mật khẩu": quên trạng thái đã-gửi để lần mở sau thấy lại form.
    ///
    /// CỐ Ý không xoá `errorMessage`: lỗi từ link trong mail (`handleOpenURL`) tới đúng lúc
    /// sheet đang đóng — xoá ở đây là nuốt mất thông báo, user bấm link hỏng rồi thấy im lặng.
    /// Lỗi cũ được dọn ở `clearError()` lúc mở sheet.
    func clearSendState() {
        didSendResetEmail = false
    }

    /// Xoá tài khoản (App Store 5.1.1(v)) — RPC `delete_account` (migration 0021) chạy
    /// SECURITY DEFINER xoá auth.users của chính caller; cascade ẩn danh hoá nội dung.
    /// Sau đó chỉ cần dọn Keychain cục bộ: user server-side đã không còn để thu hồi gì thêm.
    func deleteAccount() async {
        await run {
            try await self.client.rpc("delete_account").execute()
            try? await self.client.auth.signOut(scope: .local)
            self.profile = nil
            self.phase = .signedOut
        }
    }

    func updateProfile(displayName: String, bio: String) async {
        guard let id = profile?.id else { return }
        await run {
            let update = ProfileUpdate(
                displayName: displayName.trimmingCharacters(in: .whitespacesAndNewlines),
                bio: bio.trimmingCharacters(in: .whitespacesAndNewlines)
            )
            let updated: UserProfile = try await self.client
                .from("profiles")
                .update(update)
                .eq("id", value: id)
                .select()
                .single()
                .execute()
                .value
            self.profile = updated
        }
    }

    func backToSignIn() {
        phase = .signedOut
        errorMessage = nil
    }

    func clearError() { errorMessage = nil }

    // MARK: - Riêng tư

    /// Hồ sơ đọc qua RLS self-read (policy trong 0007_rls.sql).
    /// Row do trigger `handle_new_user` tạo lúc sign-up.
    private func loadProfile() async {
        guard let userId = client.auth.currentUser?.id else { return }
        do {
            profile = try await client
                .from("profiles")
                .select("id, role, display_name, bio")
                .eq("id", value: userId)
                .single()
                .execute()
                .value
        } catch {
            // Không đẩy user ra ngoài chỉ vì hồ sơ lỗi — session vẫn hợp lệ.
            // Màn Cá Nhân sẽ hiện trạng thái trống thay vì crash.
            errorMessage = Self.viMessage(for: error)
        }
    }

    /// Bọc thao tác async: bật cờ bận, dịch lỗi sang tiếng Việt.
    private func run(_ operation: @escaping () async throws -> Void) async {
        isBusy = true
        errorMessage = nil
        do {
            try await operation()
        } catch {
            errorMessage = Self.viMessage(for: error)
        }
        isBusy = false
    }

    /// Dịch lỗi Supabase sang chuỗi thân thiện (đa ngữ qua String Catalog).
    /// Không lộ chi tiết kỹ thuật cho người dùng cuối.
    private static func viMessage(for error: Error) -> String {
        if let authError = error as? AuthError {
            let raw = authError.message.lowercased()
            if raw.contains("invalid login credentials") { return String(localized: "Email hoặc mật khẩu không đúng.") }
            if raw.contains("email not confirmed") { return String(localized: "Email chưa được xác nhận. Kiểm tra hộp thư giúp mình nhé.") }
            if raw.contains("already registered") || raw.contains("already been registered") { return String(localized: "Email này đã có tài khoản.") }
            if raw.contains("password") && raw.contains("6") { return String(localized: "Mật khẩu phải từ 6 ký tự trở lên.") }
            // GoTrue chặn gửi lại quá nhanh bằng câu "For security purposes, you can only
            // request this after N seconds" — không chứa "rate limit"/"too many", nên phải
            // bắt riêng, không thì user thấy nguyên tiếng Anh.
            if raw.contains("rate limit") || raw.contains("too many")
                || raw.contains("for security purposes") || raw.contains("only request this after") {
                return String(localized: "Thử lại sau ít phút giúp mình.")
            }
            if raw.contains("auth session missing") { return String(localized: "Phiên đăng nhập đã hết. Đăng nhập lại giúp mình nhé.") }
            return authError.message
        }
        if (error as NSError).domain == NSURLErrorDomain {
            return String(localized: "Không kết nối được. Kiểm tra mạng giúp mình nhé.")
        }
        return String(localized: "Có lỗi xảy ra. Thử lại giúp mình nhé.")
    }
}
