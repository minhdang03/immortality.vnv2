import XCTest

/// Khung chat trên dữ liệu Supabase THẬT (seed `scripts/seed-uitest-chat.sh`):
/// draft riêng từng hội thoại, gửi tin thật, mở lại là thấy tin mới nhất.
///
/// Đăng nhập thật chứ không bypass: chat giờ đọc/ghi qua RLS của user thường — bypass
/// không có JWT thì màn trống, và quan trọng hơn là không kiểm được phân quyền
/// (bài học 3 bug P0 sống sót vì test chạy dưới quyền admin).
final class ChatDetailUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        try NodieTestAuth.signIn(app)
        app.buttons["Chat"].tap()
    }

    /// Dòng hội thoại là Button bọc chữ — tìm Button chứa text rồi mới tap được.
    private func openChat(_ name: String) {
        let row = app.row(containing: name)
        XCTAssertTrue(row.waitForExistence(timeout: 10), "Phải thấy hội thoại '\(name)'")
        row.tap()
    }

    private var input: XCUIElement { app.textFields["Nhắn tin…"] }

    private func goBack() {
        app.buttons["Quay lại"].firstMatch.tap()
    }

    /// Gõ dở ở chat A (DM) → mở chat B (nhóm) thì ô nhập PHẢI rỗng → quay lại A chữ còn nguyên.
    func testDraftIsPerConversationAndSurvivesNavigation() {
        openChat(NodieChatSeed.dmRowTitle)
        XCTAssertTrue(input.waitForExistence(timeout: 10), "Chat A phải có ô nhập")
        input.tap()
        input.typeText("ghi chú dở ở chat A")
        XCTAssertEqual(input.value as? String, "ghi chú dở ở chat A")

        goBack()
        openChat(NodieChatSeed.groupTitle)
        XCTAssertTrue(input.waitForExistence(timeout: 10), "Chat B phải có ô nhập")
        XCTAssertEqual(input.value as? String, "Nhắn tin…",
                       "Chat B phải rỗng — draft của chat A không được rò sang")

        goBack()
        openChat(NodieChatSeed.dmRowTitle)
        XCTAssertTrue(input.waitForExistence(timeout: 10))
        XCTAssertEqual(input.value as? String, "ghi chú dở ở chat A",
                       "Quay lại chat A thì draft phải còn nguyên")
    }

    /// Gửi thật lên Supabase: ô nhập sạch + tin hiện trong khung chat.
    /// Nội dung mang timestamp cho duy nhất — chat thật giữ lịch sử giữa các lần chạy,
    /// assert vào chuỗi cố định sẽ khớp nhầm tin của lần chạy trước.
    func testSendClearsOnlyThatChatDraft() {
        openChat(NodieChatSeed.dmRowTitle)
        XCTAssertTrue(input.waitForExistence(timeout: 10))

        let unique = "tin nhắn thật \(Int(Date().timeIntervalSince1970))"
        input.tap()
        input.typeText(unique)

        // Chờ nút gửi HIỆN rồi tap, và chờ ô sạch bằng predicate thay vì assert tức thì:
        // nút mic↔gửi hoán đổi có animation, tap giữa lúc đổi chỗ là cú gửi trượt im lặng
        // (đã dính ở đây 18/07 15:51 — value còn nguyên chuỗi vừa gõ).
        let send = app.buttons["sendMessage"]
        XCTAssertTrue(send.waitForExistence(timeout: 3), "Có chữ thì nút gửi phải hiện")
        send.tap()

        let cleared = XCTNSPredicateExpectation(
            predicate: NSPredicate(format: "value == %@", "Nhắn tin…"), object: input
        )
        XCTAssertEqual(XCTWaiter.wait(for: [cleared], timeout: 5), .completed,
                       "Gửi xong ô nhập phải sạch")
        XCTAssertTrue(app.staticTexts[unique].waitForExistence(timeout: 10),
                      "Tin vừa gửi phải hiện trong khung chat (đường Supabase thật)")
    }

    /// Mở lại chat dài phải thấy NGAY tin cuối, không phải tin đầu.
    /// Seed chỉ có 5 tin (không tràn màn) nên tự bơm thêm cho đủ dài — không có gì để cuộn
    /// thì không chứng minh được cuộn.
    func testReopeningLongChatStartsAtNewestMessage() {
        openChat(NodieChatSeed.dmRowTitle)
        XCTAssertTrue(input.waitForExistence(timeout: 10))

        // KHÔNG nhét "·" hay ký tự lạ vào chuỗi typeText: XCUITest gõ qua bàn phím thật,
        // ký tự không có trên bàn phím là cú gõ rơi im lặng và chuỗi assert không khớp nữa.
        let stamp = Int(Date().timeIntervalSince1970)
        for i in 1...10 {
            input.tap()
            input.typeText("tin số \(i) lần \(stamp)")

            // Chờ nút gửi HIỆN rồi mới tap, và chờ ô nhập SẠCH rồi mới lặp tiếp: nút mic↔gửi
            // hoán đổi có animation, tap trúng lúc đổi chỗ là cú gửi rơi im lặng — đã dính
            // thật (tin 2+3 dính thành một dòng trên prod, mỗi lần thứ hai một cú trượt).
            let send = app.buttons["sendMessage"]
            XCTAssertTrue(send.waitForExistence(timeout: 3), "Có chữ thì nút gửi phải hiện (tin \(i))")
            send.tap()

            let cleared = XCTNSPredicateExpectation(
                predicate: NSPredicate(format: "value == %@", "Nhắn tin…"), object: input
            )
            XCTAssertEqual(XCTWaiter.wait(for: [cleared], timeout: 5), .completed,
                           "Ô nhập phải sạch sau khi gửi tin \(i)")

            // DB giới hạn 1 tin/2 giây (slow-mode). Ô nhập sạch là LẠC QUAN — server có thể
            // vẫn bác tin sau đó và alert "Chậm lại chút…" phủ màn giết cả loop. Nhịp thật
            // của server thì phải chờ nhịp thật, không có đường tắt.
            Thread.sleep(forTimeInterval: 2.1)
        }

        let newest = app.staticTexts["tin số 10 lần \(stamp)"]
        XCTAssertTrue(newest.waitForExistence(timeout: 10), "Tin vừa gửi phải hiện")

        // Rời đi rồi quay lại → .onAppear phải cuộn xuống đáy.
        goBack()
        openChat(NodieChatSeed.dmRowTitle)

        XCTAssertTrue(newest.waitForExistence(timeout: 10), "Mở lại chat phải thấy ngay tin mới nhất")
        XCTAssertTrue(newest.isHittable, "Tin mới nhất phải nằm trong vùng nhìn thấy, không bị khuất")
        let oldest = app.staticTexts[NodieChatSeed.dmOldestMessage]
        XCTAssertFalse(oldest.isHittable,
                       "Chat dài mà mở ra vẫn đứng ở tin cũ nhất = chưa cuộn xuống đáy")
    }

    /// Phase 01/02 (1933): khay đính kèm mở được, nút ghi âm có mặt — không còn dead affordance.
    func testAttachTrayAndVoiceControlsAreAlive() {
        openChat(NodieChatSeed.dmRowTitle)
        XCTAssertTrue(input.waitForExistence(timeout: 10))

        app.buttons["Đính kèm"].tap()
        XCTAssertTrue(app.buttons["attach-photo"].waitForExistence(timeout: 5),
                      "Khay đính kèm phải mở với nút Ảnh thật")
        XCTAssertTrue(app.buttons["attach-camera"].exists && app.buttons["attach-file"].exists,
                      "Khay phải đủ ba đường Ảnh/Máy ảnh/Tệp")
        app.buttons["Đính kèm"].tap()   // đóng khay lại

        XCTAssertTrue(app.buttons["recordVoice"].waitForExistence(timeout: 5),
                      "Ô nhập rỗng thì góc phải là nút ghi âm thật")

        // Tin thoại seed sẵn trong DM — bubble phải render nút phát (phase 02).
        XCTAssertTrue(app.buttons["voicePlay"].firstMatch.waitForExistence(timeout: 5),
                      "Bubble thoại phải có nút phát thật")
    }

    /// Phase 03 (1933): menu ⋯ của DM phải MỞ ĐƯỢC hồ sơ người kia — hết disable cứng.
    func testDMMenuOpensPeerProfile() {
        openChat(NodieChatSeed.dmRowTitle)
        XCTAssertTrue(input.waitForExistence(timeout: 10))

        app.buttons["Tuỳ chọn hội thoại"].tap()
        let profileItem = app.buttons["Xem hồ sơ"]
        XCTAssertTrue(profileItem.waitForExistence(timeout: 5), "Menu phải có 'Xem hồ sơ' bấm được")
        profileItem.tap()

        // MemberProfileView của Bình — tên hiện trong header hồ sơ.
        XCTAssertTrue(app.staticTexts[NodieChatSeed.dmRowTitle].waitForExistence(timeout: 10),
                      "Phải điều hướng tới hồ sơ của đúng người đang nhắn")
    }
}
