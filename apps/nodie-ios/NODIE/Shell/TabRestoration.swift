import SwiftUI

/// Nhớ tab qua lần giết app: đang đọc dở tab Hỏi đáp mà mở lại rơi về tab mặc định là mất chỗ.
///
/// Tách thành modifier riêng thay vì viết thẳng trong `RootTabView` vì hai lẽ:
/// `@SceneStorage` chỉ sống được trong View (không nhét vào `@Observable` như `AppState`),
/// và gói ở đây thì `RootTabView` chỉ phải nhận đúng một dòng.
///
/// Dùng `@SceneStorage` chứ không tự dựng kho lưu riêng — iOS đã giữ sẵn theo từng scene.
private struct TabRestoringModifier: ViewModifier {
    let state: AppState

    /// Lưu `rawValue` — `NodieTab: String` có rawValue là chuỗi nguồn cố định ("Hỏi đáp"…),
    /// KHÔNG dịch theo máy, nên user đổi ngôn ngữ không làm hỏng giá trị đã lưu.
    @SceneStorage("selectedTab") private var storedTab: String?

    func body(content: Content) -> some View {
        content
            // .task chứ không .onAppear: chạy đúng một lần lúc dựng, sau khi state đã có.
            .task {
                guard let raw = storedTab, let tab = NodieTab(rawValue: raw) else { return }
                // Chỉ khôi phục tab CÒN TRONG tab bar. Máy đã cài bản cũ có thể đang giữ
                // "Bảng tin"/"Hành trình" — hai tab đã rút khỏi `visibleTabs` vì còn chạy nội
                // dung giả. Khôi phục mù sẽ mở app thẳng vào đúng màn ta cố ý giấu, và tab bar
                // không có nút nào sáng lên để chỉ đường ra.
                guard NodieTab.visibleTabs.contains(tab) else { return }
                state.tab = tab
            }
            .onChange(of: state.tab) { _, new in
                storedTab = new.rawValue
            }
    }
}

extension View {
    /// Khôi phục tab đang đứng sau khi app bị giết. Chỉ nhớ TAB, không nhớ ngăn xếp điều hướng:
    /// `feedPath`/`friendsPath` là `NavigationPath`, muốn lưu phải cho `FeedRoute`/`FriendsRoute`/
    /// `ChatRoute` theo `Codable` — chưa ai xin mở lại app rơi đúng màn detail, không đáng nợ.
    func nodieRestoresTab(state: AppState) -> some View {
        modifier(TabRestoringModifier(state: state))
    }
}
