import XCTest

/// Xoá nội dung của mình rồi hoàn tác — chạy trên Supabase THẬT.
///
/// Xoá là xoá mềm (`deleted_at`), nên test mượn tạm câu hỏi seed của tài khoản test rồi trả
/// lại nguyên vẹn ngay trong cùng một test. Chết giữa chừng thì câu hỏi nằm lại ở trạng thái
/// đã-xoá và `ProfileContentUITests.testMyQuestionsPushesQuestionDetail` đỏ theo — khôi phục:
/// `update questions set deleted_at = null where title = '<NodieSeed.myQuestionTitle>';`
///
/// CỐ Ý không test "banner tự tắt sau 6s": chứng minh nó đòi phải bỏ lỡ đường hoàn tác, tức
/// để câu hỏi seed nằm lại trạng thái đã xoá và kéo test khác đỏ theo. Cái giá lớn hơn thứ thu về.
final class UndoDeleteUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        try NodieTestAuth.signIn(app)
    }

    /// Xoá câu hỏi của mình → banner hiện → Hoàn tác → câu hỏi quay lại danh sách.
    func testDeleteQuestionThenUndoBringsItBack() {
        let title = NodieSeed.myQuestionTitle

        let row = app.row(containing: title)
        XCTAssertTrue(row.waitForExistence(timeout: 20), "Phải thấy câu hỏi của tài khoản test")
        row.tap()

        // ⋯ chỉ hiện "Sửa/Xoá" trên nội dung của CHÍNH MÌNH (xem ModerationMenu).
        let menu = app.buttons["Sửa hoặc xoá"]
        XCTAssertTrue(menu.waitForExistence(timeout: 10), "Câu hỏi của mình phải có ⋯ Sửa/Xoá")
        menu.tap()

        // Mục trong Menu. Truy vấn riêng khỏi nút xác nhận bên dưới: cả hai cùng nhãn "Xoá",
        // `firstMatch` chung sẽ bốc nhầm cái còn sót trong cây.
        let menuDelete = app.buttons["Xoá"].firstMatch
        XCTAssertTrue(menuDelete.waitForExistence(timeout: 5), "Menu ⋯ phải có mục Xoá")
        menuDelete.tap()

        // confirmationDialog = action sheet, không phải alert (xem AuthUITests:195).
        let confirmDelete = app.sheets.buttons["Xoá"]
        XCTAssertTrue(confirmDelete.waitForExistence(timeout: 5),
                      "Bấm Xoá phải mở hộp xác nhận 'Xoá nội dung này?'")
        confirmDelete.tap()

        // Xoá câu hỏi thì màn chi tiết bị pop — banner phải sống ở gốc cây mới kịp hiện.
        let undo = app.buttons["Hoàn tác"]
        XCTAssertTrue(undo.waitForExistence(timeout: 10),
                      "Xoá xong phải có banner Hoàn tác (banner gắn ở RootTabView)")
        XCTAssertTrue(app.staticTexts["Đã xoá câu hỏi"].exists, "Banner phải nói rõ vừa xoá gì")

        XCTAssertFalse(app.row(containing: title).waitForExistence(timeout: 3),
                       "Xoá xong câu hỏi phải biến mất khỏi danh sách")

        undo.tap()

        XCTAssertTrue(app.row(containing: title).waitForExistence(timeout: 15),
                      "Hoàn tác phải trả câu hỏi về danh sách (deleted_at = null + nạp lại)")
    }
}
