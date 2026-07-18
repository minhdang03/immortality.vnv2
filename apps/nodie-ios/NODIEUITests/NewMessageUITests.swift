import XCTest

/// Nút ✎ ở màn Chat → chọn người → mở DM. Chạy trên Supabase thật:
/// danh sách người là `profiles` thật, DM tạo qua RPC `create_dm` (dồn trùng phía server).
final class NewMessageUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        try NodieTestAuth.signIn(app)
        app.buttons["Chat"].tap()
    }

    private func openPicker() {
        app.buttons["Soạn tin nhắn mới"].tap()
        XCTAssertTrue(app.staticTexts["TIN NHẮN MỚI"].waitForExistence(timeout: 5),
                      "Nút ✎ phải mở màn chọn người")
    }

    /// Người trong picker theo TÊN, nhưng CHỈ trong các nút `newMessagePerson-*`:
    /// danh sách hội thoại nằm ngay dưới sheet cũng có dòng trùng tên ("Bình Trần") —
    /// query theo tên trần là mơ hồ, firstMatch có thể bốc nhầm dòng ngoài picker
    /// và test "reuse DM" pass mà chưa từng đi qua picker.
    private func person(_ name: String) -> XCUIElement {
        app.buttons
            .matching(NSPredicate(format: "identifier BEGINSWITH 'newMessagePerson-'"))
            .containing(.staticText, identifier: name)
            .firstMatch
    }

    /// Bình đã có DM sẵn (seed) → chọn lại phải MỞ ĐÚNG cuộc đó, không đẻ dòng trùng.
    /// `create_dm` dồn trùng phía server — test này là hàng rào cho đúng hành vi đó.
    func testPickingExistingContactReusesConversation() {
        openPicker()
        let binh = person(NodieChatSeed.dmRowTitle)
        XCTAssertTrue(binh.waitForExistence(timeout: 10), "Picker phải liệt kê Bình")
        binh.tap()

        XCTAssertTrue(app.textFields["Nhắn tin…"].waitForExistence(timeout: 10), "Phải mở khung chat")
        // Tin seed phải có mặt — chứng minh mở ĐÚNG DM cũ chứ không phải cuộc mới trống.
        XCTAssertTrue(app.staticTexts[NodieChatSeed.dmOldestMessage].waitForExistence(timeout: 10),
                      "Phải mở lại đúng DM cũ (thấy tin seed), không phải cuộc mới")
        app.buttons["Quay lại"].firstMatch.tap()

        XCTAssertEqual(app.staticTexts.matching(identifier: NodieChatSeed.dmRowTitle).count, 1,
                       "Chọn người đã có DM không được tạo hội thoại trùng")
    }

    /// Chi CHƯA có DM (seed dọn mỗi lần chạy) → chọn là tạo mới, mở luôn, và nằm lại danh sách.
    func testPickingNewContactCreatesConversation() {
        XCTAssertFalse(app.staticTexts[NodieChatSeed.thirdPersonName].exists,
                       "Chưa nhắn thì chưa có DM với \(NodieChatSeed.thirdPersonName)")

        openPicker()
        let chi = person(NodieChatSeed.thirdPersonName)
        XCTAssertTrue(chi.waitForExistence(timeout: 10), "Picker phải liệt kê người thứ ba")
        chi.tap()

        XCTAssertTrue(app.textFields["Nhắn tin…"].waitForExistence(timeout: 10), "Phải mở khung chat mới")
        app.buttons["Quay lại"].firstMatch.tap()

        XCTAssertTrue(app.staticTexts[NodieChatSeed.thirdPersonName].waitForExistence(timeout: 10),
                      "DM vừa tạo phải nằm lại trong danh sách Chat")
    }
}
