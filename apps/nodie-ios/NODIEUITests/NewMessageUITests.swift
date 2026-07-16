import XCTest

/// Nút ✎ ở màn Chat → chọn người → mở DM.
/// Bypass-auth: tầng Chat còn chạy MockData, không chạm mạng.
final class NewMessageUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUp() {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments.append("--uitest-bypass-auth")
        app.launchVietnamese()
        app.buttons["Chat"].tap()
    }

    private func openPicker() {
        app.buttons["Soạn tin nhắn mới"].tap()
        XCTAssertTrue(app.staticTexts["TIN NHẮN MỚI"].waitForExistence(timeout: 5), "Nút ✎ phải mở màn chọn người")
    }

    /// Hà Chi đã có DM sẵn (MockData) → phải mở lại đúng cuộc đó, không đẻ thêm dòng trùng.
    func testPickingExistingContactReusesConversation() {
        openPicker()
        app.buttons["newMessagePerson-hachi"].tap()

        XCTAssertTrue(app.textFields["Nhắn tin…"].waitForExistence(timeout: 5), "Phải mở khung chat")
        app.buttons["Quay lại"].firstMatch.tap()

        XCTAssertEqual(app.staticTexts.matching(identifier: "Hà Chi").count, 1,
                       "Chọn người đã có DM không được tạo hội thoại trùng")
    }

    /// Ngọc Mai chưa có DM → tạo mới rồi mở luôn, và cuộc mới nằm lại trong danh sách.
    func testPickingNewContactCreatesConversation() {
        XCTAssertFalse(app.staticTexts["Ngọc Mai"].exists, "Chưa nhắn thì chưa có DM với Ngọc Mai")

        openPicker()
        app.buttons["newMessagePerson-mai"].tap()

        XCTAssertTrue(app.textFields["Nhắn tin…"].waitForExistence(timeout: 5), "Phải mở khung chat mới")
        app.buttons["Quay lại"].firstMatch.tap()

        XCTAssertTrue(app.staticTexts["Ngọc Mai"].waitForExistence(timeout: 5),
                      "DM vừa tạo phải nằm lại trong danh sách Chat")
    }
}
