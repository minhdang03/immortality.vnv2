import XCTest

/// Gate tab Hỏi đáp: feature tạm khoá công khai, chỉ tài khoản dev (admin/mod) thấy.
///
/// Mọi test khác mở lại tab bằng cờ `--uitest-show-qa` (xem `NodieTestAuth.signIn`) —
/// test này là chốt duy nhất chạy KHÔNG cờ, đúng như người dùng thường ngoài prod.
/// Thiếu nó thì gate có thể bị refactor bay mất mà cả suite vẫn xanh, vì suite
/// toàn nhìn app qua cái cờ mở khoá.
final class QATabGateUITests: XCTestCase {
    /// Tài khoản test role='user', KHÔNG kèm `--uitest-show-qa`:
    /// tab bar chỉ còn Chat + Bạn bè, và app không được đứng ở màn Hỏi đáp
    /// (default của AppState là .qa — phải bị đá về Chat ngay nhịp dựng đầu).
    func testRegularAccountDoesNotSeeQATab() throws {
        let account = try NodieTestAuth.credentials()
        let app = XCUIApplication()
        app.launchArguments += ["--uitest-reset-auth", "--uitest-auto-login"]
        app.launchEnvironment["NODIE_TEST_EMAIL"] = account.email
        app.launchEnvironment["NODIE_TEST_PASSWORD"] = account.password
        app.launchVietnamese()

        NodieTestAuth.dismissPushPermissionAlert()

        // Đăng nhập xong phải vào được app — mốc là tab Chat (tab đầu tiên còn mở).
        XCTAssertTrue(app.buttons["Chat"].waitForExistence(timeout: 25),
                      "Auto-login phải vào tới tab bar, đứng ở Chat vì Hỏi đáp đã khoá")
        XCTAssertTrue(app.buttons["Bạn bè"].exists, "Tab Bạn bè vẫn phải có mặt")
        XCTAssertFalse(app.buttons["Hỏi đáp"].exists,
                       "role='user' không có cờ --uitest-show-qa thì KHÔNG được thấy tab Hỏi đáp")
    }
}
