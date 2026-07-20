import XCTest

/// Test auth chạy với Supabase THẬT (không mock) — chậm hơn nhưng chứng minh
/// đúng đường mà user đi: signIn → RLS self-read profiles → signOut.
///
/// Tài khoản lấy từ biến môi trường `NODIE_TEST_EMAIL` / `NODIE_TEST_PASSWORD`
/// (scheme → Config/Secrets.xcconfig → .env gốc monorepo). KHÔNG hardcode trong
/// source: đây cũng là tài khoản admin battudao.com.
/// Thiếu biến → skip êm, không fail: máy chưa chạy generate-secrets-xcconfig.sh
/// thì test auth không chạy được, nhưng đó không phải lỗi của code.
final class AuthUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUp() {
        continueAfterFailure = false
        app = XCUIApplication()
    }

    /// Thiếu credential → XCTSkip.
    private func credentials() throws -> NodieTestAuth.Account { try NodieTestAuth.credentials() }

    /// Mở app với session đã xoá, DỪNG ở màn Login — cho test soi trạng thái chưa đăng nhập.
    /// Kèm `--uitest-show-qa` vì `testSignInFormLetsUserIn` đăng nhập từ màn này rồi chốt
    /// "vào được app" bằng tab Hỏi đáp — tab đó đang khoá với role='user' khi thiếu cờ.
    private func launchSignedOut() {
        app.launchArguments += ["--uitest-reset-auth", "--uitest-show-qa"]
        app.launchVietnamese()
        XCTAssertTrue(
            app.textFields["Email"].waitForExistence(timeout: 25),
            "Reset session phải hoàn tất và hiện màn Login kể cả ở cold start"
        )
    }

    /// Vào app ở trạng thái đã đăng nhập, KHÔNG qua bàn phím — dùng cho các test soi thứ
    /// NẰM SAU đăng nhập (hồ sơ, đăng xuất, vuốt back). Đường gõ tay được `testSignInFormLetsUserIn`
    /// giữ riêng: gõ mật khẩu xong là iOS bật lớp AutoFill nuốt hết chạm, nên test nào còn phải
    /// bấm tiếp thì không đi đường đó được. Xem `AuthStore.autoLoginForUITestsIfRequested`.
    @discardableResult
    private func signIn() throws -> NodieTestAuth.Account { try NodieTestAuth.signIn(app) }

    /// Đăng nhập xong app dừng ở Hỏi đáp (tab mặc định). Avatar chỉ có ở Bạn bè và Bảng tin,
    /// mà Bảng tin đang rút khỏi tab bar (`NodieTab.visibleTabs`) → phải sang Bạn bè mới bấm được.
    @discardableResult
    private func openProfileFromFriends() -> XCUIElement {
        let friendsTab = app.buttons["Bạn bè"]
        XCTAssertTrue(friendsTab.waitForExistence(timeout: 20), "Phải thấy tab Bạn bè")
        friendsTab.tap()

        let avatar = app.buttons["profileAvatar"]
        XCTAssertTrue(avatar.waitForExistence(timeout: 10), "Tab Bạn bè phải có avatar để vào Cá Nhân")
        avatar.tap()
        return friendsTab
    }

    /// Chưa đăng nhập → thấy Login, KHÔNG vào được app.
    func testSignedOutShowsLoginAndBlocksApp() {
        launchSignedOut()

        XCTAssertTrue(app.textFields["Email"].waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["Bạn bè"].exists, "Chưa đăng nhập thì không được thấy tab bar")
    }

    /// Quên mật khẩu: có lối vào, sheet mở được, và nút gửi tắt khi email chưa hợp lệ.
    ///
    /// CỐ Ý không test đầu-cuối (bấm link trong mail → đặt mật khẩu mới): cần hộp thư thật
    /// nên sẽ thành test rung rinh. Phần đó nghiệm thu bằng tay — xem phase-01 §Test.
    func testForgotPasswordSheetOpensAndGuardsEmptyEmail() {
        launchSignedOut()

        let forgot = app.buttons["Quên mật khẩu?"]
        XCTAssertTrue(forgot.waitForExistence(timeout: 10), "Màn Login phải có lối đặt lại mật khẩu")
        forgot.tap()

        let send = app.buttons["Gửi link đặt lại"]
        XCTAssertTrue(send.waitForExistence(timeout: 5), "Phải mở được sheet đặt lại mật khẩu")
        XCTAssertFalse(send.isEnabled, "Email rỗng thì không cho gửi")

        app.textFields["Email đặt lại"].tap()
        app.typeText("khong-phai-email")
        XCTAssertFalse(send.isEnabled, "Chuỗi không có @ thì vẫn không cho gửi")
    }

    /// Đang ở nhánh Đăng ký thì không có mật khẩu nào để quên → không được hiện nút.
    func testForgotPasswordHiddenOnSignUp() {
        launchSignedOut()

        let toSignUp = app.buttons["Chưa có tài khoản? Đăng ký"]
        XCTAssertTrue(toSignUp.waitForExistence(timeout: 10))
        toSignUp.tap()

        XCTAssertFalse(app.buttons["Quên mật khẩu?"].exists,
                       "Nhánh Đăng ký không được có 'Quên mật khẩu?'")
    }

    /// Sai mật khẩu → báo lỗi tiếng Việt, không crash, không vào app.
    func testWrongPasswordShowsVietnameseError() throws {
        let account = try credentials()
        launchSignedOut()

        let emailField = app.textFields["Email"]
        XCTAssertTrue(emailField.waitForExistence(timeout: 10))
        emailField.tap()
        emailField.typeText(account.email)

        let passwordField = app.secureTextFields["Mật khẩu"]
        passwordField.tap()
        passwordField.typeText("saibetmatkhau")

        app.buttons["Đăng nhập"].tap()

        let error = app.staticTexts["authError"]
        XCTAssertTrue(error.waitForExistence(timeout: 15), "Phải hiện lỗi")
        XCTAssertEqual(error.label, "Email hoặc mật khẩu không đúng.")
        XCTAssertFalse(app.buttons["Bạn bè"].exists, "Sai mật khẩu thì không được vào app")
    }

    /// Đường HẠNH PHÚC gõ tay: nhập đúng email/mật khẩu vào form → vào được app.
    /// Test duy nhất còn đi qua bàn phím ở nhánh đăng nhập thành công, nên nó là thứ duy nhất
    /// chứng minh form Login thật sự hoạt động. Cố tình KHÔNG bấm gì thêm sau khi vào:
    /// lớp AutoFill của iOS nổi lên ngay sau đó và nuốt mọi chạm.
    func testSignInFormLetsUserIn() throws {
        let account = try credentials()
        launchSignedOut()

        let emailField = app.textFields["Email"]
        XCTAssertTrue(emailField.waitForExistence(timeout: 10), "Phải thấy màn Login khi chưa đăng nhập")
        emailField.tap()
        emailField.typeText(account.email)

        let passwordField = app.secureTextFields["Mật khẩu"]
        passwordField.tap()
        passwordField.typeText(account.password)
        app.buttons["Đăng nhập"].tap()

        XCTAssertTrue(app.buttons["Hỏi đáp"].waitForExistence(timeout: 25),
                      "Gõ đúng email/mật khẩu rồi bấm Đăng nhập phải vào được app")
        XCTAssertFalse(app.textFields["Email"].exists, "Vào app rồi thì màn Login phải biến mất")
    }

    /// Đăng nhập thật → vào app → avatar → Cá Nhân hiện hồ sơ THẬT từ Supabase.
    func testSignInThenOpenProfileShowsRealData() throws {
        let account = try signIn()

        openProfileFromFriends()

        let name = app.staticTexts["profileName"]
        XCTAssertTrue(name.waitForExistence(timeout: 15), "Cá Nhân phải hiện tên")
        XCTAssertEqual(name.label, account.displayName, "Tên phải đến từ profiles thật, không hardcode")

        // Tài khoản test là user THƯỜNG ⇒ KHÔNG được có nhãn vai trò.
        //
        // Trước 17/07 chỗ này khẳng định ngược lại (`"Quản trị viên"` PHẢI hiện) vì tài khoản
        // test là admin — nghĩa là bộ test được dựng quanh một tài khoản ngắn mạch 29 policy
        // RLS, và nó đã giấu ba bug P0 (xem project.yml). Đổi sang user thường thì phép thử
        // đúng là nhãn phải VẮNG: `UserProfile.roleLabel` trả nil với 'user' — "chỉ hiện khi
        // khác 'user' để tránh phân tầng vô nghĩa", đúng luật không phân tầng của app.
        XCTAssertFalse(app.staticTexts["Quản trị viên"].exists,
                       "User thường không được hiện nhãn vai trò (luật không phân tầng)")
        XCTAssertFalse(app.staticTexts["Điều hành viên"].exists,
                       "User thường không được hiện nhãn vai trò (luật không phân tầng)")

        // Đính ảnh màn Cá Nhân với dữ liệu THẬT để review thiết kế.
        let shot = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        shot.name = "profile-real-data"
        shot.lifetime = .keepAlways
        add(shot)
    }

    /// Vuốt cạnh trái ở Cá Nhân → về Bạn bè (gesture phase 03a vẫn chạy ở màn mới),
    /// VÀ tab bar phải ẩn khi đang ở Cá Nhân — quy tắc chung: push detail thì ẩn tab bar.
    /// Bug này từng lọt (feedPath không được khai trong `showsTabBar`), chỉ lộ khi nhìn ảnh.
    func testSwipeBackFromProfileAndTabBarHides() throws {
        try signIn()

        let friendsTab = openProfileFromFriends()
        XCTAssertTrue(app.buttons["signOutButton"].waitForExistence(timeout: 15))
        XCTAssertFalse(friendsTab.exists, "Tab bar phải ẩn ở màn Cá Nhân, như mọi màn detail khác")

        let start = app.coordinate(withNormalizedOffset: CGVector(dx: 0.01, dy: 0.5))
        let end = app.coordinate(withNormalizedOffset: CGVector(dx: 0.9, dy: 0.5))
        start.press(forDuration: 0.05, thenDragTo: end)

        XCTAssertTrue(friendsTab.waitForExistence(timeout: 5), "Vuốt back phải về Bạn bè, tab bar hiện lại")
    }

    /// Đăng xuất → về Login, session xoá sạch.
    func testSignOutReturnsToLogin() throws {
        try signIn()
        openProfileFromFriends()

        // Màn Cá nhân dài hơn màn hình (thẻ danh tính + thống kê + đóng góp + cài đặt) nên
        // nút Đăng xuất nằm dưới mép: `tap()` bấm vào TÂM phần tử, tâm ở ngoài màn thì cú
        // chạm rơi vào hư không và dialog không bao giờ mở. Cuộn tới nơi rồi hẵng bấm.
        let signOut = app.buttons["signOutButton"]
        XCTAssertTrue(signOut.waitForExistence(timeout: 15))
        app.scrollViews.firstMatch.swipeUp()
        signOut.tap()

        // Bám vào dialog thay vì `buttons["Đăng xuất"].firstMatch`: nhãn này trùng với chính
        // nút vừa bấm, firstMatch dễ tóm nhầm nút dưới nền và test sẽ xanh/đỏ tuỳ thứ tự cây.
        let confirm = app.sheets.buttons["Đăng xuất"]
        XCTAssertTrue(confirm.waitForExistence(timeout: 5), "Bấm Đăng xuất phải mở dialog xác nhận")
        confirm.tap()

        XCTAssertTrue(app.textFields["Email"].waitForExistence(timeout: 15), "Đăng xuất phải về màn Login")
        XCTAssertFalse(app.buttons["Bạn bè"].exists)
    }

    /// Session phải sống sót qua lần mở app kế tiếp (Keychain) — user không phải login lại.
    func testSessionPersistsAcrossRelaunch() throws {
        try signIn()
        XCTAssertTrue(app.buttons["Bạn bè"].waitForExistence(timeout: 20))

        app.terminate()

        // Tái dùng cùng automation handle: tạo XCUIApplication thứ hai ngay sau terminate
        // làm XCTest runner trên iOS 26.5 kẹt ở "Setting up automation session" rồi bị SIGKILL.
        // Xoá reset/auto-login flags để lần mở này chỉ có thể vào nhờ session Keychain.
        app.launchArguments = []
        app.launchEnvironment = [:]
        app.launchVietnamese()

        XCTAssertTrue(app.buttons["Bạn bè"].waitForExistence(timeout: 20),
                      "Mở lại app phải vẫn đăng nhập, không hiện Login")
        app.terminate()
    }
}
