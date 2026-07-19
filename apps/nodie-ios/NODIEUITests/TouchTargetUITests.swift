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
        app.row(containing: NodieChatSeed.dmRowTitle).tap()

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
        XCTAssertTrue(app.row(containing: NodieChatSeed.dmRowTitle)
            .waitForExistence(timeout: 10), "Dòng hội thoại phải là Button, không phải khối chữ bắt tap")

        app.buttons["Hỏi đáp"].tap()
        // Câu hỏi từ Supabase thật (seed_nodie.sql), không còn MockData.
        XCTAssertTrue(app.row(containing: NodieSeed.questionTitle).waitForExistence(timeout: 10),
                      "Dòng câu hỏi phải là Button")
    }

    // MARK: - Phase 05: ☀/▲/Trả lời/chip/Đổi/Huỷ/clear search — audit P1-02

    /// ☀ + ▲ + Trả lời trong chi tiết câu hỏi (`QAActionButtons`). Chỉ ĐO frame, không bấm —
    /// bấm sẽ đổi trạng thái lit/vote thật trên Supabase, cùng bẫy với QAWireUITests.
    /// Nhãn ☀/▲ đổi theo trạng thái nên khớp HẬU TỐ chung ("ánh sáng"/"hữu ích") thay vì
    /// chuỗi cứng — xem `AccessibilityUITests.testQuestionDetailControlsHaveMeaningfulLabels`.
    func testQADetailActionButtonsHitTargets() {
        app.buttons["Hỏi đáp"].tap()
        let row = app.row(containing: NodieSeed.questionTitle)
        XCTAssertTrue(row.waitForExistence(timeout: 15), "Phải thấy dòng câu hỏi seed")
        row.tap()

        let lit = app.buttons.containing(NSPredicate(format: "label ENDSWITH %@", "ánh sáng")).firstMatch
        assertHitTarget(lit, "nút ☀")

        let vote = app.buttons.containing(NSPredicate(format: "label ENDSWITH %@", "hữu ích")).firstMatch
        assertHitTarget(vote, "nút ▲")

        assertHitTarget(app.buttons["Trả lời"].firstMatch, "nút Trả lời")
    }

    /// Chip lĩnh vực ở màn "Chiếu câu hỏi" — vẽ ~28pt theo prototype, vùng chạm phải nới ≥44pt.
    /// Gõ chữ không khớp luật AI nào để hàng chip hiện lên tay chọn (`showManualPicker`).
    func testAskQuestionTagChipHitTarget() {
        app.buttons["Hỏi đáp"].tap()
        app.buttons["＋ Chiếu câu hỏi"].tap()

        assertHitTarget(app.buttons["Huỷ"], "nút Huỷ (Chiếu câu hỏi)")

        let title = app.textFields["Câu hỏi của bạn là gì?"]
        XCTAssertTrue(title.waitForExistence(timeout: 5))
        title.tap()
        title.typeText("qwxjk zvbjq flmpt")

        assertHitTarget(app.buttons["Não bộ"], "chip lĩnh vực 'Não bộ'")

        app.buttons["Huỷ"].tap()
    }

    /// Nút "Đổi" trong thẻ AI tự nhận lĩnh vực — chỉ hiện khi AI đoán ra (gõ chữ khớp luật).
    func testAskQuestionAiChangeButtonHitTarget() {
        app.buttons["Hỏi đáp"].tap()
        app.buttons["＋ Chiếu câu hỏi"].tap()

        let title = app.textFields["Câu hỏi của bạn là gì?"]
        XCTAssertTrue(title.waitForExistence(timeout: 5))
        title.tap()
        // "ngủ" khớp luật "Giấc ngủ" (fieldRules) → thẻ AI tự nhận hiện ra kèm nút Đổi.
        title.typeText("Tại sao tôi hay mất ngủ giữa đêm")

        assertHitTarget(app.buttons["Đổi"], "nút Đổi (AI tự nhận lĩnh vực)")

        app.buttons["Huỷ"].tap()
    }

    /// Ô "Xoá tìm kiếm" ở Bạn bè — vẽ 15pt icon, chỉ hiện khi có chữ trong ô tìm.
    func testFriendsClearSearchHitTarget() {
        app.buttons["Bạn bè"].tap()
        let search = app.textFields["Tìm người trong cộng đồng…"]
        XCTAssertTrue(search.waitForExistence(timeout: 10))
        search.tap()
        search.typeText("a")

        assertHitTarget(app.buttons["Xoá tìm kiếm"], "nút xoá tìm kiếm")
    }
}
