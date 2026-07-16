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
                data: ["display_name": .string(displayName.trimmingCharacters(in: .whitespacesAndNewlines))]
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
            if raw.contains("rate limit") || raw.contains("too many") { return String(localized: "Thử lại sau ít phút giúp mình.") }
            return authError.message
        }
        if (error as NSError).domain == NSURLErrorDomain {
            return String(localized: "Không kết nối được. Kiểm tra mạng giúp mình nhé.")
        }
        return String(localized: "Có lỗi xảy ra. Thử lại giúp mình nhé.")
    }
}
