import XCTest

/// Verify vuốt-cạnh-trái-để-back thật sự chạy.
///
/// Lý do phải test thật chứ không tin lý thuyết: ẩn nav bar hệ thống VÔ HIỆU HOÁ
/// `interactivePopGestureRecognizer` — kể cả với `.toolbar(.hidden, for: .navigationBar)`.
/// Test này từng FAIL và chính nó lộ ra điều đó; `InteractivePopGestureEnabler` là bản vá.
/// Nếu ai gỡ enabler đi, mấy test này fail lại ngay.
final class SwipeBackUITests: XCTestCase {
    private var app: XCUIApplication!

    /// Đăng nhập thật (qua SDK, không gõ phím) thay vì bypass: `testSwipeBackFromQuestionDetail`
    /// phải vào được CHI TIẾT câu hỏi, mà chi tiết chỉ mở được khi danh sách có dòng thật từ
    /// Supabase. Bypass không có JWT → RLS (0019) trả rỗng → không có gì để bấm vào.
    /// Chat vẫn MockData nên các test chat không đổi gì.
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        try NodieTestAuth.signIn(app)
    }

    /// Vuốt từ mép trái sang phải — mô phỏng edge-swipe của iOS.
    private func swipeBackFromLeftEdge() {
        let start = app.coordinate(withNormalizedOffset: CGVector(dx: 0.01, dy: 0.5))
        let end = app.coordinate(withNormalizedOffset: CGVector(dx: 0.9, dy: 0.5))
        start.press(forDuration: 0.05, thenDragTo: end)
    }

    /// Vuốt sang phải từ VÙNG NỘI DUNG, cách xa mép trái — `edgeSwipe` của UIKit chỉ nhận touch
    /// trong dải ~20pt sát mép, nên điểm xuất phát 0.25 (≈100pt) nằm ngoài tầm nó hoàn toàn.
    /// Pop được từ đây nghĩa là `contentSwipe` đang chạy — thứ cho cảm giác vuốt của FB/IG.
    ///
    /// `dy` mặc định nằm giữa màn, tức ĐÈ LÊN scroll view của chat: vuốt ngang phải thắng,
    /// cuộn dọc phải thắng (xem `testVerticalScrollInChatDetailDoesNotPop`).
    ///
    /// Vì sao kéo gần hết bề ngang: UIKit pop khi qua ~50% HOẶC nhả tay đủ nhanh, mà cú kéo của
    /// XCUITest luôn giảm tốc trước khi nhả — không mô phỏng được flick, nên chỉ còn khoảng cách.
    /// Đừng rút ngắn: đo thực tế, dừng ở 42.7% thì transition huỷ về (đúng thiết kế UIKit),
    /// còn dừng ở 57% thì lúc pop lúc không — sát ngưỡng quá, test đổi màu theo timing máy.
    private func swipeBackFromContentArea(dy: CGFloat = 0.45) {
        let start = app.coordinate(withNormalizedOffset: CGVector(dx: 0.25, dy: dy))
        let end = app.coordinate(withNormalizedOffset: CGVector(dx: 0.99, dy: dy))
        start.press(forDuration: 0.05, thenDragTo: end)
    }

    /// ĐỐI CHỨNG: nút back tròn phải pop được.
    /// Nếu test này pass mà test vuốt fail → lỗi ở gesture, không phải ở điều hướng/test.
    func testBackButtonPopsChatDetail() {
        app.buttons["Chat"].tap()
        app.row(containing: NodieChatSeed.dmRowTitle).tap()

        let input = app.textFields["Nhắn tin…"]
        XCTAssertTrue(input.waitForExistence(timeout: 3), "Phải vào được chat detail")

        app.buttons.matching(identifier: "arrow.left").firstMatch.tap()

        XCTAssertTrue(app.buttons["Bạn bè"].waitForExistence(timeout: 3),
                      "Nút back phải quay về danh sách")
    }

    func testSwipeBackFromChatDetail() {
        app.buttons["Chat"].tap()

        let row = app.row(containing: NodieChatSeed.groupTitle)
        XCTAssertTrue(row.waitForExistence(timeout: 10), "Danh sách hội thoại phải hiện")
        row.tap()

        // Ô nhập chỉ có ở chat detail → dùng làm mốc nhận biết đã vào detail
        let input = app.textFields["Nhắn tin…"]
        XCTAssertTrue(input.waitForExistence(timeout: 3), "Phải vào được chat detail")

        swipeBackFromLeftEdge()

        XCTAssertTrue(app.staticTexts["Chat"].waitForExistence(timeout: 3),
                      "Vuốt cạnh trái phải quay về danh sách Chat")
        XCTAssertFalse(input.exists, "Chat detail phải đóng sau khi vuốt back")
    }

    func testSwipeBackFromQuestionDetail() {
        app.buttons["Hỏi đáp"].tap()

        // Câu hỏi từ Supabase thật (seed_nodie.sql). Bấm vào Button bọc dòng — chữ bên trong
        // không hittable. Timeout rộng hơn vì phải chờ mạng, không còn là MockData tại chỗ.
        let row = app.row(containing: NodieSeed.questionTitle)
        XCTAssertTrue(row.waitForExistence(timeout: 10), "Danh sách câu hỏi phải hiện")
        row.tap()

        // Thanh trả lời chỉ có ở detail
        let replyBar = app.textFields["Viết câu trả lời của bạn…"]
        XCTAssertTrue(replyBar.waitForExistence(timeout: 3), "Phải vào được chi tiết câu hỏi")

        swipeBackFromLeftEdge()

        XCTAssertTrue(app.buttons["＋ Chiếu câu hỏi"].waitForExistence(timeout: 3),
                      "Vuốt cạnh trái phải quay về danh sách Hỏi đáp")
        XCTAssertFalse(replyBar.exists, "Chi tiết câu hỏi phải đóng sau khi vuốt back")
    }

    /// Tab bar phải ẩn ở detail và hiện lại sau khi vuốt back
    /// (tương đương `hidesBottomBarWhenPushed` bên UIKit).
    func testTabBarHidesInDetailAndReturnsAfterSwipeBack() {
        app.buttons["Chat"].tap()

        let friendsTab = app.buttons["Bạn bè"]
        XCTAssertTrue(friendsTab.waitForExistence(timeout: 3), "Tab bar phải hiện ở màn list")

        app.row(containing: NodieChatSeed.dmRowTitle).tap()
        XCTAssertTrue(app.textFields["Nhắn tin…"].waitForExistence(timeout: 10))
        XCTAssertFalse(friendsTab.exists, "Tab bar phải ẩn ở chat detail")

        swipeBackFromLeftEdge()

        XCTAssertTrue(friendsTab.waitForExistence(timeout: 3), "Tab bar phải hiện lại sau khi back")
    }

    // MARK: - Vuốt full-screen (parity FB/IG)

    func testSwipeBackFromContentAreaOfChatDetail() {
        app.buttons["Chat"].tap()
        app.row(containing: NodieChatSeed.dmRowTitle).tap()

        let input = app.textFields["Nhắn tin…"]
        XCTAssertTrue(input.waitForExistence(timeout: 3), "Phải vào được chat detail")

        swipeBackFromContentArea()

        XCTAssertTrue(app.staticTexts["Chat"].waitForExistence(timeout: 3),
                      "Vuốt từ vùng nội dung phải quay về danh sách Chat (FB/IG cho back từ bất kỳ đâu)")
        XCTAssertFalse(input.exists, "Chat detail phải đóng sau khi vuốt back từ vùng nội dung")
    }

    /// Không có bản Hỏi đáp của test này: gesture pop sống trên nav controller, không theo màn,
    /// nên chat detail đã đủ chứng minh. Thêm nữa chỉ tổ nhân đôi chỗ đang hỏng —
    /// `testSwipeBackFromQuestionDetail` fail sẵn vì danh sách câu hỏi không load trong UI test.

    /// Vuốt phủ cả màn KHÔNG được nuốt cuộn dọc: chat detail cuộn được thì mới đọc được tin cũ.: chat detail cuộn được thì mới đọc được tin cũ.
    /// Đây là cái giá phải canh khi mở rộng vùng vuốt ra cả màn hình.
    func testVerticalScrollInChatDetailDoesNotPop() {
        app.buttons["Chat"].tap()
        app.row(containing: NodieChatSeed.dmRowTitle).tap()

        let input = app.textFields["Nhắn tin…"]
        XCTAssertTrue(input.waitForExistence(timeout: 3), "Phải vào được chat detail")

        // Cuộn lên xem tin cũ — thao tác dọc, không phải back.
        app.swipeDown()
        app.swipeDown()

        XCTAssertTrue(input.exists, "Cuộn dọc không được làm pop chat detail")
    }

    /// Kéo sang TRÁI không phải là back — không được pop.
    func testLeftwardDragDoesNotPop() {
        app.buttons["Chat"].tap()
        app.row(containing: NodieChatSeed.dmRowTitle).tap()

        let input = app.textFields["Nhắn tin…"]
        XCTAssertTrue(input.waitForExistence(timeout: 3), "Phải vào được chat detail")

        let start = app.coordinate(withNormalizedOffset: CGVector(dx: 0.9, dy: 0.45))
        let end = app.coordinate(withNormalizedOffset: CGVector(dx: 0.1, dy: 0.45))
        start.press(forDuration: 0.05, thenDragTo: end)

        XCTAssertTrue(input.exists, "Kéo sang trái không được pop chat detail")
    }
}
