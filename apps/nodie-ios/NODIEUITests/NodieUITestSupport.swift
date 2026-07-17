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
    /// `displayName` khai TƯỜNG MINH chứ không suy từ email.
    ///
    /// Trước 17/07 test tự suy `display_name == phần trước @` — chỉ đúng vì tài khoản test cũ
    /// (`mr.dang1305`) được tạo KHÔNG kèm metadata nên trigger `handle_new_user` rơi vào nhánh
    /// dự phòng `split_part(email,'@',1)`. Ai đăng ký qua app đều có `display_name` riêng
    /// (`signUp` gửi kèm), nên phép suy đó sai với mọi tài khoản thật.
    struct Account { let email: String; let password: String; let displayName: String }

    /// Thiếu credential → skip êm. Máy chưa chạy generate-secrets-xcconfig.sh không phải lỗi code.
    static func credentials() throws -> Account {
        let env = ProcessInfo.processInfo.environment
        guard let email = env["NODIE_TEST_EMAIL"], !email.isEmpty,
              let password = env["NODIE_TEST_PASSWORD"], !password.isEmpty,
              let displayName = env["NODIE_TEST_DISPLAY_NAME"], !displayName.isEmpty else {
            throw XCTSkip("Thiếu NODIE_TEST_* — bỏ qua test cần Supabase thật")
        }
        return Account(email: email, password: password, displayName: displayName)
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

        dismissPushPermissionAlert()

        XCTAssertTrue(app.buttons["Hỏi đáp"].waitForExistence(timeout: 25),
                      "App phải tự đăng nhập vào tới tab bar (--uitest-auto-login)")
        return account
    }

    /// Tắt hộp thoại "NODIE muốn gửi thông báo cho bạn".
    ///
    /// Vì sao PHẢI có: `RootView` gọi `push.requestAuthorizationAndRegister()` ngay khi
    /// `phase == .signedIn`, nên iOS bật hộp thoại quyền đúng vào lúc test vừa đăng nhập xong.
    /// Nó là cửa sổ của springboard — nằm NGOÀI cây view của app, `app.alerts` không thấy —
    /// và nó nuốt chạm, khiến mọi test sau đăng nhập treo tới hết giờ rồi bị kill. Triệu chứng
    /// ra ngoài là "Executed 0 tests" + "Test crashed with signal kill", đọc y như app crash.
    ///
    /// Hộp thoại chỉ hiện MỘT lần cho mỗi lần cài app, nên máy nào đã trả lời rồi sẽ không
    /// thấy gì — đó là lý do bộ test xanh trên máy dev mà đỏ trên máy sạch/CI. Không dùng
    /// `addUIInterruptionMonitor`: monitor chỉ chạy khi test chạm vào app, mà ở đây test đang
    /// CHỜ chứ chưa chạm gì.
    private static func dismissPushPermissionAlert() {
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        // Nhãn theo ngôn ngữ HỆ THỐNG, không theo -AppleLanguages của app: springboard là
        // tiến trình khác, cờ ngôn ngữ của app không với tới nó.
        for label in ["Allow", "Cho phép"] {
            let button = springboard.buttons[label]
            if button.waitForExistence(timeout: 3) {
                button.tap()
                return
            }
        }
    }
}

/// Hằng số khớp `supabase/seed_nodie.sql`. Đổi seed → đổi ở ĐÂY, không rải khắp các test.
enum NodieSeed {
    static let questionTitle = "Ngủ bao nhiêu là đủ để não tự dọn dẹp?"

    /// Câu hỏi do CHÍNH tài khoản test đăng — cho hai màn "Câu hỏi của tôi"/"Trả lời của tôi".
    ///
    /// Tách khỏi `questionTitle`: câu kia thuộc về tài khoản admin của Đăng. Từ lúc test chạy
    /// bằng user thường (17/07), "của tôi" của tài khoản test là RỖNG nếu vẫn tìm câu đó —
    /// test đỏ mà code không hề sai.
    static let myQuestionTitle = "Vì sao càng cố ngủ càng tỉnh?"
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
