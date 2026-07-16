import XCTest

/// Vùng bấm tối thiểu 44pt (Apple HIG) + VoiceOver đọc nhãn tiếng Việt.
/// Các nút này VẼ nhỏ hơn 44 theo prototype — chỉ vùng chạm được nới ra.
final class TouchTargetUITests: XCTestCase {
    private var app: XCUIApplication!

    /// Đăng nhập thật (không qua bàn phím) thay vì bypass: màn Hỏi đáp đọc dữ liệu từ
    /// Supabase, mà bypass chỉ giả `phase = .signedIn` KHÔNG có JWT → RLS cộng đồng đóng
    /// (0019) chặn sạch → danh sách rỗng → `testRowsAreRealButtons` không có dòng nào để soi.
    /// Chat vẫn MockData nên không ảnh hưởng.
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        try NodieTestAuth.signIn(app)
    }

    private func assertHitTarget(_ element: XCUIElement, _ name: String,
                                 file: StaticString = #filePath, line: UInt = #line) {
        XCTAssertTrue(element.waitForExistence(timeout: 5), "Phải thấy \(name)", file: file, line: line)
        XCTAssertGreaterThanOrEqual(element.frame.width, 44,
                                    "\(name): vùng bấm rộng \(element.frame.width)pt, phải ≥ 44",
                                    file: file, line: line)
        XCTAssertGreaterThanOrEqual(element.frame.height, 44,
                                    "\(name): vùng bấm cao \(element.frame.height)pt, phải ≥ 44",
                                    file: file, line: line)
    }

    /// Avatar ở header Bạn bè — vẽ 36pt.
    func testFriendsAvatarHitTarget() {
        app.buttons["Bạn bè"].tap()
        assertHitTarget(app.buttons["profileAvatar"], "avatar Cá nhân")
    }

    /// Nút back tròn (vẽ 34pt) + đính kèm (40pt) + mic/gửi (44pt).
    /// Tên nút cũng chính là nhãn VoiceOver: tìm thấy "Quay lại" nghĩa là VoiceOver
    /// không còn đọc "arrow.left".
    ///
    /// Mic/gửi tìm theo ĐỊNH DANH chứ không theo nhãn: bàn phím tiếng Việt vẽ phím Enter
    /// là "Gửi" (`.submitLabel(.send)` ở ô nhập) nên `buttons["Gửi"]` khớp cả phím bàn phím
    /// lẫn nút của app → truy vấn mơ hồ, XCTest văng. Nhãn vẫn được kiểm riêng bên dưới.
    func testChatControlsHitTargetsAndVietnameseLabels() {
        app.buttons["Chat"].tap()
        app.staticTexts["Lab trường thọ #3"].tap()

        assertHitTarget(app.buttons["Quay lại"], "nút quay lại")
        assertHitTarget(app.buttons["Đính kèm"], "nút đính kèm")

        // Ô nhập rỗng thì góc phải là nút ghi âm; gõ chữ vào nó mới thành nút gửi.
        let record = app.buttons["recordVoice"]
        assertHitTarget(record, "nút ghi âm")
        XCTAssertEqual(record.label, "Ghi âm", "VoiceOver phải đọc nhãn tiếng Việt, không phải tên icon")
        XCTAssertFalse(app.buttons["sendMessage"].exists, "Chưa gõ gì thì không có nút gửi")

        let input = app.textFields["Nhắn tin…"]
        XCTAssertTrue(input.waitForExistence(timeout: 3), "Phải thấy ô nhập")
        input.tap()
        input.typeText("xin chào")

        let send = app.buttons["sendMessage"]
        assertHitTarget(send, "nút gửi")
        XCTAssertEqual(send.label, "Gửi", "VoiceOver phải đọc nhãn tiếng Việt, không phải tên icon")
        XCTAssertFalse(app.buttons["recordVoice"].exists, "Có chữ rồi thì nút ghi âm nhường chỗ")
    }

    /// Dòng danh sách phải là Button thật → VoiceOver đọc đúng là bấm được.
    func testRowsAreRealButtons() {
        app.buttons["Chat"].tap()
        XCTAssertTrue(app.buttons.containing(.staticText, identifier: "Lab trường thọ #3").firstMatch
            .waitForExistence(timeout: 5), "Dòng hội thoại phải là Button, không phải khối chữ bắt tap")

        app.buttons["Hỏi đáp"].tap()
        // Câu hỏi từ Supabase thật (seed_nodie.sql), không còn MockData.
        XCTAssertTrue(app.row(containing: NodieSeed.questionTitle).waitForExistence(timeout: 10),
                      "Dòng câu hỏi phải là Button")
    }
}
