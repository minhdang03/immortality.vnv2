import XCTest

/// Màn Cá nhân: thống kê số thật + ba màn đóng góp push được.
///
/// Không assert GIÁ TRỊ con số: chúng đến từ Supabase thật và đổi theo dữ liệu tài khoản
/// test. Chỉ chốt thứ đúng-sai được: số đã nạp xong (khác "—") và ba dòng mở ra màn thật.
final class ProfileContentUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        try NodieTestAuth.signIn(app)
        app.buttons["Bạn bè"].tap()
        app.buttons["profileAvatar"].tap()
        XCTAssertTrue(app.staticTexts["CÁ NHÂN"].waitForExistence(timeout: 15), "Phải vào được màn Cá nhân")
    }

    /// Bốn ô đều là số thật từ Supabase — "—" nghĩa là nạp hỏng hoặc chưa xong.
    func testStatsLoadRealNumbers() {
        for label in ["ngày tham gia", "câu hỏi đã đặt", "trả lời đã viết", "hạt ánh sáng nhận được"] {
            XCTAssertTrue(app.staticTexts[label].waitForExistence(timeout: 10), "Phải thấy ô '\(label)'")
        }

        // Số nằm ngay trên nhãn trong cùng thẻ; chờ tới khi không còn ô nào là "—".
        let placeholder = app.staticTexts["—"]
        let gone = expectation(for: NSPredicate(format: "exists == false"), evaluatedWith: placeholder)
        wait(for: [gone], timeout: 20)
    }

    /// Ba dòng "Đóng góp của bạn" phải push màn thật (trước đây là chữ "Sắp có" chết).
    /// Nhãn eyebrow của màn đích viết HOA nên không đụng nhãn dòng bấm vào.
    func testContributionRowsPushRealScreens() {
        for (row, screenTitle) in [("Câu hỏi của tôi", "CÂU HỎI CỦA TÔI"),
                                   ("Trả lời của tôi", "TRẢ LỜI CỦA TÔI"),
                                   ("Đã lưu", "ĐÃ LƯU")] {
            app.buttons[row].tap()
            XCTAssertTrue(app.staticTexts[screenTitle].waitForExistence(timeout: 10),
                          "Dòng '\(row)' phải mở màn thật, không phải dòng chết")

            app.buttons["Quay lại"].tap()
            XCTAssertTrue(app.staticTexts["CÁ NHÂN"].waitForExistence(timeout: 5), "Quay lại phải về Cá nhân")
        }
    }

    /// Cá nhân → Câu hỏi của tôi → CHI TIẾT (đẩy tầng 3).
    ///
    /// Chốt riêng vì `navigationDestination(for: ProfileRoute.self)` khai ở ProfileView (tầng 1)
    /// còn link `.question` nằm ở tầng 2: sai chỗ khai là SwiftUI lặng thinh không đẩy.
    /// Câu seed do chính tài khoản test đăng (`seed_nodie.sql`, `:admin_uid`) nên chắc chắn có.
    func testMyQuestionsPushesQuestionDetail() {
        app.buttons["Câu hỏi của tôi"].tap()
        XCTAssertTrue(app.staticTexts["CÂU HỎI CỦA TÔI"].waitForExistence(timeout: 10))

        app.row(containing: NodieSeed.questionTitle).tap()
        XCTAssertTrue(app.buttons["saveQuestion"].waitForExistence(timeout: 10),
                      "Bấm câu hỏi trong 'Câu hỏi của tôi' phải mở màn chi tiết")
    }

    /// Nút lưu ở chi tiết câu hỏi (tab Hỏi đáp) — chỉ chốt là có và bấm được.
    /// Không chốt trạng thái sau khi bấm: cần migration 0022 đã áp lên Supabase.
    func testSaveButtonExistsOnQuestionDetail() {
        app.buttons["Quay lại"].tap()
        app.buttons["Hỏi đáp"].tap()
        app.row(containing: NodieSeed.questionTitle).tap()

        let save = app.buttons["saveQuestion"]
        XCTAssertTrue(save.waitForExistence(timeout: 10), "Chi tiết câu hỏi phải có nút lưu")
        XCTAssertTrue(save.isHittable, "Nút lưu phải bấm được")
    }
}
