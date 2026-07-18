import XCTest

/// Swipe action trên dòng hội thoại + kéo-xuống-làm-mới — dữ liệu Supabase thật.
///
/// Đăng nhập thật: mark-read/mute/leave giờ ghi `channel_members` qua RLS của user thường.
/// Bypass không có JWT thì hành động nào cũng câm (204 khớp 0 dòng) — đúng loại lỗi im lặng
/// mà suite này tồn tại để bắt.
final class SwipeActionsUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        try NodieTestAuth.signIn(app)
        app.buttons["Chat"].tap()
    }

    private func row(_ name: String) -> XCUIElement {
        app.buttons.containing(.staticText, identifier: name).firstMatch
    }

    /// Vuốt phải trên nhóm còn tin chưa đọc → "Đã đọc" → badge biến mất (ghi `last_read_at` thật).
    /// Đo trên NHÓM RỜI THỬ — xem chú thích `leaveGroupUnreadBadge` về thứ tự chạy.
    func testSwipeLeadingMarksAsRead() {
        let badge = app.staticTexts[NodieChatSeed.leaveGroupUnreadBadge]
        XCTAssertTrue(badge.waitForExistence(timeout: 10),
                      "Nhóm rời thử phải có badge '\(NodieChatSeed.leaveGroupUnreadBadge)' — seed đặt last_read trước tin của Bình")

        row(NodieChatSeed.leaveGroupTitle).swipeRight()
        app.buttons["Đã đọc"].tap()

        XCTAssertFalse(badge.waitForExistence(timeout: 3),
                       "Badge chưa đọc phải biến mất sau khi đánh dấu đã đọc")
    }

    /// Vuốt trái trên nhóm → "Tắt thông báo" → vuốt lại thấy "Bật lại" (ghi `muted_until` thật).
    func testSwipeTrailingMutesChannel() {
        let target = row(NodieChatSeed.groupTitle)
        XCTAssertTrue(target.waitForExistence(timeout: 10))

        target.swipeLeft()
        app.buttons["Tắt thông báo"].tap()

        target.swipeLeft()
        XCTAssertTrue(app.buttons["Bật lại"].waitForExistence(timeout: 5),
                      "Đã tắt thông báo thì nhãn phải đổi thành 'Bật lại'")
        // Trả lại trạng thái cũ để lần chạy sau (gate 3×) không thấy nhóm đã tắt sẵn.
        app.buttons["Bật lại"].tap()
    }

    /// Vuốt trái → "Rời khỏi" → dòng biến mất (xoá membership thật).
    /// Nhóm RIÊNG cho test này — seed dựng lại mỗi lần chạy, các test khác không dùng nó.
    func testSwipeTrailingLeavesConversation() {
        let target = app.staticTexts[NodieChatSeed.leaveGroupTitle]
        XCTAssertTrue(target.waitForExistence(timeout: 10))

        row(NodieChatSeed.leaveGroupTitle).swipeLeft()
        app.buttons["Rời khỏi"].tap()

        XCTAssertFalse(target.waitForExistence(timeout: 3), "Rời khỏi rồi thì dòng phải biến mất")
    }

    /// Kéo xuống ở đầu danh sách → refresh chạy lại từ Supabase, danh sách vẫn nguyên.
    func testPullToRefreshKeepsListIntact() {
        let first = app.staticTexts[NodieChatSeed.dmRowTitle]
        XCTAssertTrue(first.waitForExistence(timeout: 10))

        let start = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.35))
        let end = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.85))
        start.press(forDuration: 0.1, thenDragTo: end)

        XCTAssertTrue(first.waitForExistence(timeout: 8), "Sau khi làm mới, danh sách phải còn nguyên")
    }
}
