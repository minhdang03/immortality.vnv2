import XCTest

/// Phase 07 — trust & safety trong luồng soạn câu hỏi.
///
/// Hai thứ được canh ở đây, cả hai đều là rủi ro *duyệt app* chứ không chỉ là UX:
/// 1. Không được gọi khớp-regex là "AI" (rủi ro FTC + App Store review).
/// 2. Banner hỗ trợ tự hại phải hiện khi nội dung khớp từ khoá, và KHÔNG được chặn gửi
///    (chuẩn safety FB/IG cho mạng xã hội — NODIE không phải app y tế, chốt 17/07).
///
/// Một tính năng an toàn không có test là một tính năng an toàn sẽ lặng lẽ chết trong lần
/// refactor kế tiếp — nên nó nằm trong gate, không phải trong danh sách kiểm tay.
final class TrustUXUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        try NodieTestAuth.signIn(app)
    }

    private func openCompose() {
        app.buttons["Hỏi đáp"].tap()
        app.buttons["＋ Chiếu câu hỏi"].tap()
    }

    /// Câu khớp từ khoá tự hại → banner hỗ trợ hiện, và nút gửi VẪN bấm được.
    ///
    /// Gõ nhánh tiếng Anh của bộ dò ("kill myself") có chủ ý: `typeText` với dấu tiếng Việt
    /// là một trong bốn mẫu flake đã trả giá, mà ở đây thứ cần chứng minh là banner có nổi
    /// hay không — không phải bàn phím gõ được dấu hay không.
    func testSelfHarmKeywordShowsSupportBannerWithoutBlockingSend() {
        openCompose()

        let title = app.textFields["Câu hỏi của bạn là gì?"]
        XCTAssertTrue(title.waitForExistence(timeout: 5), "Phải thấy ô nhập câu hỏi")
        title.tap()
        title.typeText("i want to kill myself")

        let banner = app.staticTexts.containing(
            NSPredicate(format: "label CONTAINS[c] %@", "Lifeline")
        ).firstMatch
        XCTAssertTrue(banner.waitForExistence(timeout: 5),
                      "Nội dung khớp từ khoá tự hại phải hiện banner hỗ trợ")

        // Điểm mấu chốt của chuẩn FB/IG: GIÚP, không CHẶN. Nếu nút gửi bị khoá ở đây là đã
        // biến banner thành rào chắn — sai hẳn ý định.
        let send = app.buttons["Chiếu"].firstMatch
        if send.exists {
            XCTAssertTrue(send.isEnabled, "Banner hỗ trợ KHÔNG được chặn gửi")
        }
    }

    /// Câu bình thường → không có banner. Chống dương tính giả: một bộ dò khớp mọi thứ
    /// cũng "pass" bài test trên, nên phải có mặt đối chứng.
    func testOrdinaryQuestionShowsNoSupportBanner() {
        openCompose()

        let title = app.textFields["Câu hỏi của bạn là gì?"]
        XCTAssertTrue(title.waitForExistence(timeout: 5), "Phải thấy ô nhập câu hỏi")
        title.tap()
        title.typeText("qwxjk zvbjq flmpt")

        let banner = app.staticTexts.containing(
            NSPredicate(format: "label CONTAINS[c] %@", "Lifeline")
        ).firstMatch
        XCTAssertFalse(banner.waitForExistence(timeout: 2),
                       "Câu hỏi bình thường không được hiện banner tự hại")
    }

    /// Không còn chỗ nào gọi khớp-từ-khoá là "AI" trong luồng soạn.
    /// Nhãn đúng phải nói ra cơ chế thật: gợi ý theo TỪ KHOÁ.
    func testTagSuggestionIsNotLabelledAsAI() {
        openCompose()

        let title = app.textFields["Câu hỏi của bạn là gì?"]
        XCTAssertTrue(title.waitForExistence(timeout: 5), "Phải thấy ô nhập câu hỏi")
        title.tap()
        title.typeText("qwxjk zvbjq flmpt")

        // CHÚ Ý: phải so khớp PHÂN BIỆT HOA THƯỜNG. Tiếng Việt đầy chữ chứa "ai" ("loại",
        // "ngoài", "hai", "phải") nên `CONTAINS[c]` khớp lung tung — bản đầu của test này đỏ
        // vì đúng lý do đó, không phải vì còn sót copy "AI". Acronym viết hoa mới là thứ cần cấm.
        let aiLabels = app.staticTexts.containing(
            NSPredicate(format: "label MATCHES %@", ".*\\bAI\\b.*")
        )
        XCTAssertEqual(
            aiLabels.count, 0,
            "Không được gọi khớp regex từ khoá là 'AI' (rủi ro FTC/App Store review). Nhãn còn sót: "
            + aiLabels.allElementsBoundByIndex.map(\.label).joined(separator: " | ")
        )
    }
}

/// Luật chơi phải đọc được TRƯỚC khi có tài khoản — nên lớp này KHÔNG đăng nhập.
///
/// Tách khỏi `TrustUXUITests` vì `setUpWithError` bên đó gọi `NodieTestAuth.signIn`, mà cái đó
/// tự launch app rồi; muốn đứng ở màn đăng nhập thì không thể dùng chung setUp.
final class LegalAccessUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        // Xoá session cũ nhưng KHÔNG auto-login → dừng lại đúng màn đăng nhập.
        app.launchArguments += ["--uitest-reset-auth"]
        app.launchVietnamese()
    }

    /// Apple guideline 1.2 (app UGC) đòi luật chơi user THẤY được, và điểm người ta cam kết là
    /// lúc tạo tài khoản. Thứ dễ vỡ ở đây không phải chữ mà là cái LINK: một lần refactor
    /// `LoginView` là nó biến mất không ai nhận ra, tới lúc Apple từ chối mới biết.
    func testCommunityGuidelinesReachableFromLoginScreen() {
        let link = app.buttons["Nội quy cộng đồng"].firstMatch
        XCTAssertTrue(link.waitForExistence(timeout: 20),
                      "Màn đăng nhập phải có link Nội quy cộng đồng (guideline 1.2)")
        link.tap()

        // Khớp một điều CỤ THỂ trong nội quy, không phải tiêu đề — tiêu đề còn đó mà nội dung
        // rỗng thì vẫn là màn hỏng.
        let rule = app.staticTexts.containing(
            NSPredicate(format: "label CONTAINS[c] %@", "mạo danh")
        ).firstMatch
        XCTAssertTrue(rule.waitForExistence(timeout: 10),
                      "Màn Nội quy phải hiện nội dung thật, không chỉ tiêu đề")

        // Đường sang Điều khoản đầy đủ cũng phải còn — đó mới là văn bản ràng buộc.
        XCTAssertTrue(app.buttons["Đọc Điều khoản sử dụng đầy đủ"].exists,
                      "Nội quy phải dẫn được sang Điều khoản đầy đủ")
    }
}
