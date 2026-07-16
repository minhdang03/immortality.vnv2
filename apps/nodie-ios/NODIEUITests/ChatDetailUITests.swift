import XCTest

/// Khung chat: draft riêng từng hội thoại + mở chat là thấy ngay tin mới nhất.
/// Dùng bypass-auth: đây là test UI/state, không soi auth.
final class ChatDetailUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUp() {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments.append("--uitest-bypass-auth")
        app.launchVietnamese()
        app.buttons["Chat"].tap()
    }

    private func openChat(_ name: String) {
        let row = app.staticTexts[name]
        XCTAssertTrue(row.waitForExistence(timeout: 5), "Phải thấy hội thoại '\(name)'")
        row.tap()
    }

    private var input: XCUIElement { app.textFields["Nhắn tin…"] }

    private func goBack() {
        app.buttons["Quay lại"].firstMatch.tap()
    }

    /// Gõ dở ở chat A → mở chat B thì ô nhập PHẢI rỗng → quay lại A thì chữ còn nguyên.
    /// Cả hai chat phải KHÔNG phải kênh phát (kênh phát không có ô nhập — xem canPost).
    func testDraftIsPerConversationAndSurvivesNavigation() {
        openChat("Lab trường thọ #3")
        XCTAssertTrue(input.waitForExistence(timeout: 5), "Chat A phải có ô nhập")
        input.tap()
        input.typeText("ghi chú dở ở chat A")
        XCTAssertEqual(input.value as? String, "ghi chú dở ở chat A")

        goBack()
        openChat("Hà Chi")
        XCTAssertTrue(input.waitForExistence(timeout: 5), "Chat B phải có ô nhập")
        XCTAssertEqual(input.value as? String, "Nhắn tin…",
                       "Chat B phải rỗng — draft của chat A không được rò sang")

        goBack()
        openChat("Lab trường thọ #3")
        XCTAssertTrue(input.waitForExistence(timeout: 5))
        XCTAssertEqual(input.value as? String, "ghi chú dở ở chat A",
                       "Quay lại chat A thì draft phải còn nguyên")
    }

    /// Gửi xong thì draft của chat đó phải sạch.
    func testSendClearsOnlyThatChatDraft() {
        openChat("Lab trường thọ #3")
        XCTAssertTrue(input.waitForExistence(timeout: 5))
        input.tap()
        input.typeText("tin nhắn thật")
        app.buttons["sendMessage"].tap()

        XCTAssertEqual(input.value as? String, "Nhắn tin…", "Gửi xong ô nhập phải sạch")
        XCTAssertTrue(app.staticTexts["tin nhắn thật"].waitForExistence(timeout: 3),
                      "Tin vừa gửi phải hiện trong khung chat")
    }

    /// Mở lại chat dài phải thấy NGAY tin cuối, không phải tin đầu.
    /// Mock data chỉ có 3 tin (không tràn màn hình) nên phải tự bơm tin cho đủ dài —
    /// không có gì để cuộn thì không chứng minh được cuộn.
    func testReopeningLongChatStartsAtNewestMessage() {
        openChat("Lab trường thọ #3")
        XCTAssertTrue(input.waitForExistence(timeout: 5))

        let oldest = app.staticTexts["Mình vừa tổng hợp 4 bài về telomere, mọi người xem trước buổi tối nay nha"]
        XCTAssertTrue(oldest.exists, "Tin cũ nhất phải thấy được lúc chat còn ngắn")

        for i in 1...12 {
            input.tap()
            input.typeText("tin số \(i)")
            app.buttons["sendMessage"].tap()
        }

        let newest = app.staticTexts["tin số 12"]
        XCTAssertTrue(newest.waitForExistence(timeout: 5), "Tin vừa gửi phải hiện")

        // Rời đi rồi quay lại → .onAppear phải cuộn xuống đáy.
        goBack()
        openChat("Lab trường thọ #3")

        XCTAssertTrue(newest.waitForExistence(timeout: 5), "Mở lại chat phải thấy ngay tin mới nhất")
        XCTAssertTrue(newest.isHittable, "Tin mới nhất phải nằm trong vùng nhìn thấy, không bị khuất")
        XCTAssertFalse(oldest.isHittable,
                       "Chat dài mà mở ra vẫn đứng ở tin cũ nhất = chưa cuộn xuống đáy")
    }
}
