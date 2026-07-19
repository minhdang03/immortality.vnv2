import XCTest

/// Phase 05 — traversal VoiceOver + largest Dynamic Type trên các màn chính.
/// Hit-area regression (mục 44pt) nằm ở `TouchTargetUITests` (mở rộng, không đẻ suite mới)
/// — file này chỉ lo hai phần còn lại: nhãn đọc được và cỡ chữ lớn nhất không cắt mất nút.
///
/// Chạy với Supabase THẬT bằng tài khoản role='user' — cùng luật với QAWireUITests/
/// TouchTargetUITests (admin ngắn mạch RLS, test bằng admin = không test gì).
final class AccessibilityUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
    }

    // MARK: - Traversal VoiceOver: mọi control có nhãn, không phải tên SF Symbol/glyph trần

    /// Tab bar + control chính ở Hỏi đáp/chi tiết câu hỏi phải đọc được nhãn tiếng Việt có
    /// nghĩa — không phải "sun.max"/"arrowtriangle.up.fill" (tên hệ thống VoiceOver sẽ đọc
    /// nếu thiếu `.accessibilityLabel`).
    func testQuestionDetailControlsHaveMeaningfulLabels() throws {
        try NodieTestAuth.signIn(app)

        let row = app.row(containing: NodieSeed.questionTitle)
        XCTAssertTrue(row.waitForExistence(timeout: 15), "Phải thấy dòng câu hỏi seed")
        row.tap()

        // ☀/▲ đổi nhãn theo trạng thái bật/tắt — khớp HẬU TỐ chung thay vì chuỗi cứng để
        // không phụ thuộc lần chạy trước đã bấm hay chưa (test chỉ ĐỌC nhãn, không bấm).
        let lit = app.buttons.containing(NSPredicate(format: "label ENDSWITH %@", "ánh sáng")).firstMatch
        XCTAssertTrue(lit.waitForExistence(timeout: 10), "Nút ☀ phải có nhãn kết thúc bằng 'ánh sáng'")

        let vote = app.buttons.containing(NSPredicate(format: "label ENDSWITH %@", "hữu ích")).firstMatch
        XCTAssertTrue(vote.exists, "Nút ▲ phải có nhãn kết thúc bằng 'hữu ích'")

        XCTAssertTrue(app.buttons["Trả lời"].exists, "Nút Trả lời phải đọc đúng chữ 'Trả lời'")
        XCTAssertTrue(app.buttons["Quay lại"].exists, "Nút back phải đọc 'Quay lại', không phải 'arrow.left'")

        let save = app.buttons["saveQuestion"]
        XCTAssertTrue(save.exists, "Nút lưu câu hỏi phải có định danh saveQuestion")
        XCTAssertTrue(save.label == "Lưu câu hỏi" || save.label == "Bỏ lưu câu hỏi",
                      "Nút lưu phải đọc tiếng Việt có nghĩa, không phải tên icon: \(save.label)")

        // Avatar chữ cái là DECORATIVE (accessibilityHidden) — không được rơi ra thành một
        // staticText một-ký-tự trần trụi (đó chính là VoiceOver đọc lặp "Đ, Đăng…" mà audit
        // medium đã ghi). Không có static text hợp lệ nào trên màn này chỉ dài 1 ký tự.
        let strayLetterAvatars = app.staticTexts.matching(
            NSPredicate(format: "label MATCHES %@", "^[A-ZÀ-Ỹ]$")
        )
        XCTAssertEqual(strayLetterAvatars.count, 0,
                       "Avatar chữ cái phải accessibilityHidden — không được là staticText riêng")
    }

    /// Màn "Chiếu câu hỏi": Huỷ/Chiếu sáng/chip lĩnh vực đều phải có nhãn đọc được.
    func testAskQuestionControlsHaveMeaningfulLabels() throws {
        try NodieTestAuth.signIn(app)

        app.buttons["＋ Chiếu câu hỏi"].tap()
        XCTAssertTrue(app.buttons["Huỷ"].waitForExistence(timeout: 5), "Phải mở được màn Chiếu câu hỏi")
        XCTAssertTrue(app.buttons["Chiếu sáng"].exists, "Nút gửi phải đọc 'Chiếu sáng'")

        // Gõ chữ không khớp luật AI nào ⇒ hàng chip lĩnh vực hiện ra để chọn tay.
        let title = app.textFields["Câu hỏi của bạn là gì?"]
        XCTAssertTrue(title.waitForExistence(timeout: 5))
        title.tap()
        title.typeText("qwxjk zvbjq flmpt")

        let tagChip = app.buttons["Não bộ"]
        XCTAssertTrue(tagChip.waitForExistence(timeout: 5), "Hàng chip lĩnh vực phải hiện khi AI không đoán được")

        app.buttons["Huỷ"].tap()
    }

    /// Bạn bè: avatar cá nhân + ô tìm kiếm phải đọc được nhãn.
    func testFriendsHeaderControlsHaveMeaningfulLabels() throws {
        try NodieTestAuth.signIn(app)

        app.buttons["Bạn bè"].tap()
        XCTAssertTrue(app.buttons["profileAvatar"].waitForExistence(timeout: 10))
        XCTAssertEqual(app.buttons["profileAvatar"].label, "Cá nhân",
                       "Avatar header phải đọc 'Cá nhân', không phải chữ cái đầu tên")
    }

    // MARK: - Largest accessibility Dynamic Type: control chính vẫn hittable, không mất nút

    /// `-UIPreferredContentSizeCategoryName` là launch arg chuẩn UIKit đọc để đặt cỡ chữ hệ
    /// thống lúc khởi động — SwiftUI `dynamicTypeSize` suy ra từ đây, không cần app tự implement
    /// gì thêm. Set TRƯỚC khi `NodieTestAuth.signIn` gọi `launch()` (nó chỉ APPEND launchArguments,
    /// không xoá — xem `NodieUITestSupport.swift`).
    private func launchAtLargestAccessibilitySize() throws {
        app.launchArguments += [
            "-UIPreferredContentSizeCategoryName", "UICTContentSizeCategoryAccessibilityXXXL",
        ]
        try NodieTestAuth.signIn(app)
    }

    func testTabBarHittableAtLargestDynamicType() throws {
        try launchAtLargestAccessibilitySize()

        // Chỉ 3 tab này có mặt trong tab bar (`NodieTab.visibleTabs`) — Bảng tin/Hành trình
        // rút khỏi tab bar, Cá nhân vào từ avatar ở header chứ không phải tab riêng.
        for tab in ["Hỏi đáp", "Chat", "Bạn bè"] {
            let button = app.buttons[tab]
            XCTAssertTrue(button.waitForExistence(timeout: 10), "Tab '\(tab)' phải còn thấy ở cỡ chữ lớn nhất")
            XCTAssertTrue(button.isHittable, "Tab '\(tab)' phải còn bấm được ở cỡ chữ lớn nhất, không bị đè/clip")
        }
    }

    /// Câu trả lời (☀/▲/Trả lời) + nút gửi câu trả lời không được biến mất/kẹt ngoài màn hình
    /// khi chữ hệ thống phóng tới cỡ lớn nhất — đây chính là ca audit P1-07 nêu (chưa test
    /// largest Dynamic Type lần nào trước phase này).
    func testQuestionDetailActionsHittableAtLargestDynamicType() throws {
        try launchAtLargestAccessibilitySize()

        let row = app.row(containing: NodieSeed.questionTitle)
        XCTAssertTrue(row.waitForExistence(timeout: 15), "Phải thấy dòng câu hỏi seed ở cỡ chữ lớn nhất")
        row.tap()

        let replyBar = app.textFields["Viết câu trả lời của bạn…"]
        XCTAssertTrue(replyBar.waitForExistence(timeout: 10), "Ô trả lời phải còn thấy ở cỡ chữ lớn nhất")

        let reply = app.buttons["Trả lời"].firstMatch
        XCTAssertTrue(reply.waitForExistence(timeout: 10), "Nút Trả lời không được biến mất ở cỡ chữ lớn nhất")
        // Phải CUỘN tới rồi mới đòi bấm được: ở cỡ chữ lớn nhất câu trả lời đầu tiên đã đẩy
        // hàng ☀/▲/Trả lời xuống ~y=1631 trong cửa sổ cao 874 (đo thật). Nút không hỏng —
        // nó chỉ nằm dưới nếp gấp, đúng như mọi danh sách dài.
        XCTAssertTrue(
            app.scrollUntilHittable(reply),
            "Nút Trả lời phải bấm được sau khi cuộn tới — nếu không thì nó bị clip/kẹt ngoài vùng cuộn"
        )

        let send = app.buttons["Gửi câu trả lời"]
        XCTAssertTrue(send.exists, "Nút gửi câu trả lời không được clip mất ở cỡ chữ lớn nhất")
    }
}
