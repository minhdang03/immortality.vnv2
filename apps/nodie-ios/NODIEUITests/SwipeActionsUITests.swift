import XCTest

/// Verify swipe action trên dòng hội thoại + kéo-xuống-làm-mới.
final class SwipeActionsUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUp() {
        continueAfterFailure = false
        app = XCUIApplication()
        // Test này soi gesture/UI, không soi auth → bỏ qua đăng nhập cho nhanh & tất định.
        app.launchArguments.append("--uitest-bypass-auth")
        app.launchVietnamese()
        app.buttons["Chat"].tap()
    }

    private func row(_ name: String) -> XCUIElement {
        app.cells.containing(.staticText, identifier: name).firstMatch
    }

    /// Vuốt phải trên dòng → "Đã đọc" → badge chưa đọc biến mất thật.
    func testSwipeLeadingMarksAsRead() {
        let badge = app.staticTexts["12 tin chưa đọc"]
        XCTAssertTrue(badge.waitForExistence(timeout: 3), "Lab trường thọ #3 phải có 12 chưa đọc")

        row("Lab trường thọ #3").swipeRight()
        app.buttons["Đã đọc"].tap()

        XCTAssertFalse(badge.waitForExistence(timeout: 2), "Badge chưa đọc phải biến mất sau khi đánh dấu đã đọc")
    }

    /// Vuốt trái → "Tắt thông báo" → chuông gạch hiện lên, nhãn đổi thành "Bật lại".
    func testSwipeTrailingMutesChannel() {
        let target = row("Khoa học não bộ")
        XCTAssertTrue(target.waitForExistence(timeout: 3))

        target.swipeLeft()
        app.buttons["Tắt thông báo"].tap()

        target.swipeLeft()
        XCTAssertTrue(app.buttons["Bật lại"].waitForExistence(timeout: 2),
                      "Đã tắt thông báo thì nhãn phải đổi thành 'Bật lại'")
    }

    /// Vuốt trái → "Rời khỏi" → dòng biến mất khỏi danh sách.
    func testSwipeTrailingLeavesConversation() {
        let target = app.staticTexts["Vũ trụ học hiện đại"]
        XCTAssertTrue(target.waitForExistence(timeout: 3))

        row("Vũ trụ học hiện đại").swipeLeft()
        app.buttons["Rời khỏi"].tap()

        XCTAssertFalse(target.waitForExistence(timeout: 2), "Rời khỏi rồi thì dòng phải biến mất")
    }

    /// Kéo xuống ở đầu danh sách → refresh chạy, danh sách vẫn nguyên vẹn sau đó.
    func testPullToRefreshKeepsListIntact() {
        let first = app.staticTexts["Khoa học não bộ"]
        XCTAssertTrue(first.waitForExistence(timeout: 3))

        let start = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.35))
        let end = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.85))
        start.press(forDuration: 0.1, thenDragTo: end)

        XCTAssertTrue(first.waitForExistence(timeout: 4), "Sau khi làm mới, danh sách phải còn nguyên")
    }
}
