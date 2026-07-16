import XCTest

/// Hỏi đáp chạy với Supabase THẬT — không bypass auth, không MockData.
///
/// Vì sao cần: QAStore viết ở phase 03 nhưng bảng `questions`/`answers` mãi tới 2026-07-16
/// mới áp lên DB, nên code chưa từng chạy lần nào. Lần chạy thật đầu tiên lộ ngay lỗi
/// PGRST200 — `author_id` trỏ `auth.users` còn query nhúng `profiles`, hai bảng là anh em
/// nên PostgREST không nối được → danh sách rỗng sạch. Migration 0020 là bản vá.
/// Test này chính là thứ bắt được lỗi đó; gỡ nó đi thì lần sau không ai biết.
///
/// Dữ liệu bám `supabase/seed_nodie.sql` qua `NodieSeed`.
final class QAWireUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUp() {
        continueAfterFailure = false
        app = XCUIApplication()
    }

    /// Danh sách kéo được câu hỏi thật về.
    /// Fail = wire chết (RLS chặn / decode lỗi / query sai), không phải lỗi giao diện.
    func testQuestionListLoadsRealDataFromSupabase() throws {
        try NodieTestAuth.signIn(app)

        XCTAssertTrue(app.staticTexts[NodieSeed.questionTitle].waitForExistence(timeout: 20),
                      "Danh sách phải hiện câu hỏi seed từ Supabase — không thấy nghĩa là QAStore.loadQuestions() không kéo được dữ liệu")
    }

    /// Chi tiết: câu trả lời + reply lồng đều từ DB thật.
    /// Reply lồng chứng minh flatReplies() dựng cây parent_id đúng.
    func testQuestionDetailShowsRealAnswersAndNestedReplies() throws {
        try NodieTestAuth.signIn(app)

        let row = app.row(containing: NodieSeed.questionTitle)
        XCTAssertTrue(row.waitForExistence(timeout: 20), "Phải thấy dòng câu hỏi seed")
        row.tap()

        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label BEGINSWITH %@", NodieSeed.answerOnePrefix))
            .firstMatch.waitForExistence(timeout: 15), "Chi tiết phải hiện câu trả lời thật thứ nhất")
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label BEGINSWITH %@", NodieSeed.answerTwoPrefix))
            .firstMatch.exists, "Chi tiết phải hiện câu trả lời thật thứ hai")
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label BEGINSWITH %@", NodieSeed.replyPrefix))
            .firstMatch.exists, "Phải hiện reply lồng — chứng minh answer_replies + flatReplies() chạy đúng")
    }

    /// Tên tác giả đến từ `author:profiles(display_name)` nhúng qua PostgREST.
    /// Đây là chính xác chỗ đã gãy PGRST200 — có test riêng để lần sau gãy là biết ngay.
    /// Gãy lại thì tên rơi về "Ẩn danh" (fallback trong AuthorRef.name).
    func testAuthorNameComesFromEmbeddedProfile() throws {
        try NodieTestAuth.signIn(app)

        XCTAssertTrue(app.staticTexts[NodieSeed.questionTitle].waitForExistence(timeout: 20), "Phải thấy câu hỏi seed")

        // Tên nằm chung dòng meta "<tên> · <thời gian> · <n> câu trả lời", không đứng riêng.
        let meta = app.staticTexts.containing(NSPredicate(format: "label CONTAINS %@", "câu trả lời")).firstMatch
        XCTAssertTrue(meta.exists, "Phải có dòng meta của câu hỏi")
        XCTAssertFalse(meta.label.hasPrefix("Ẩn danh"),
                       "Tên tác giả rơi về 'Ẩn danh' → join author:profiles gãy lại (PGRST200). Dòng meta: \(meta.label)")
    }
}
