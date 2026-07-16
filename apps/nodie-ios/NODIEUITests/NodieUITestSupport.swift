import XCTest

/// Dùng chung cho mọi test cần dữ liệu Supabase thật.
///
/// Vì sao không dùng `--uitest-bypass-auth` cho những test đó: cờ đó chỉ đặt
/// `phase = .signedIn` với UUID giả, KHÔNG tạo session Supabase → query đi ra như `anon`
/// → RLS cộng đồng đóng (migration 0019) chặn sạch → màn rỗng → test fail vì "không thấy gì",
/// dễ bị đọc nhầm thành lỗi giao diện. Màn nào đọc dữ liệu thật thì phải đăng nhập thật.
///
/// Bypass vẫn hợp lệ cho test KHÔNG chạm dữ liệu mạng (vd Hội thoại đang còn MockData).
enum NodieTestAuth {
    struct Account { let email: String; let password: String }

    /// Thiếu credential → skip êm. Máy chưa chạy generate-secrets-xcconfig.sh không phải lỗi code.
    static func credentials() throws -> Account {
        let env = ProcessInfo.processInfo.environment
        guard let email = env["NODIE_TEST_EMAIL"], !email.isEmpty,
              let password = env["NODIE_TEST_PASSWORD"], !password.isEmpty else {
            throw XCTSkip("Thiếu NODIE_TEST_* — bỏ qua test cần Supabase thật")
        }
        return Account(email: email, password: password)
    }

    /// Xoá session cũ → app tự đăng nhập THẬT qua SDK (không gõ phím) → dừng khi đã vào trong.
    /// Tab mặc định là Hỏi đáp (`AppState.tab = .qa`) — Bảng tin chưa wire (phase 06).
    ///
    /// Không gõ vào ô mật khẩu là CHỦ ĐÍCH: `typeText` vào SecureField làm iOS bật lớp AutoFill
    /// ("Lưu mật khẩu?") sau ~3s, phủ toàn màn và nuốt sạch chạm → mọi thao tác sau đó chết,
    /// mà ảnh chụp lại trông bình thường. Xem `AuthStore.autoLoginForUITestsIfRequested`.
    /// Session/JWT/RLS vẫn thật 100%.
    @discardableResult
    static func signIn(_ app: XCUIApplication) throws -> Account {
        let account = try credentials()
        app.launchArguments += ["--uitest-reset-auth", "--uitest-auto-login"]
        app.launchEnvironment["NODIE_TEST_EMAIL"] = account.email
        app.launchEnvironment["NODIE_TEST_PASSWORD"] = account.password
        app.launchVietnamese()

        XCTAssertTrue(app.buttons["Hỏi đáp"].waitForExistence(timeout: 25),
                      "App phải tự đăng nhập vào tới tab bar (--uitest-auto-login)")
        return account
    }
}

/// Hằng số khớp `supabase/seed_nodie.sql`. Đổi seed → đổi ở ĐÂY, không rải khắp các test.
enum NodieSeed {
    static let questionTitle = "Ngủ bao nhiêu là đủ để não tự dọn dẹp?"
    static let questionTopic = "não bộ"
    static let answerOnePrefix = "Phần lớn nghiên cứu hiện tại nói 7–9 tiếng"
    static let answerTwoPrefix = "Ngủ trưa ngắn 20 phút"
    static let replyPrefix = "Bổ sung: rượu bia làm giảm mạnh N3"
}

extension XCUIApplication {
    /// Dòng danh sách là Button bọc chữ → chữ bên trong không hittable.
    /// Muốn bấm phải tìm Button chứa nó (xem TouchTargetUITests.testRowsAreRealButtons).
    func row(containing text: String) -> XCUIElement {
        buttons.containing(.staticText, identifier: text).firstMatch
    }

    /// Assertion của UITest viết bằng chuỗi tiếng Việt, mà app giờ đa ngữ theo máy —
    /// simulator tiếng Anh sẽ render UI tiếng Anh và làm gãy toàn bộ test.
    /// Mọi test khởi động app qua đây để ghim tiếng Việt, KHÔNG gọi launch() thẳng.
    func launchVietnamese() {
        launchArguments += ["-AppleLanguages", "(vi)", "-AppleLocale", "vi_VN"]
        launch()
    }
}
