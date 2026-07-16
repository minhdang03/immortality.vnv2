import SwiftUI
import UIKit

/// Vuốt-để-back trên TOÀN màn hình — không chỉ dải hẹp sát mép trái.
///
/// **Vì sao cần:** thiết kế NODIE có header riêng nên phải ẩn nav bar hệ thống. Khi ẩn,
/// `_UINavigationInteractiveTransition` (delegate mặc định) từ chối MỌI gesture pop → vuốt back chết.
///
/// **Vì sao là cả màn hình:** UIKit dựng sẵn HAI gesture pop trên nav view, cùng chạy
/// `handleNavigationTransition:`:
/// - `UINavigationController.edgeSwipe` = `interactivePopGestureRecognizer`, chỉ nhận touch
///    trong dải hẹp sát mép trái.
/// - `UINavigationController.contentSwipe` = nhận từ bất kỳ đâu trên màn — đúng cảm giác FB/IG.
///
/// Cả hai đã enabled sẵn; thứ chặn chúng chỉ là delegate. Nên ở đây KHÔNG tự dựng pan mới
/// rồi mượn target nội bộ bằng KVC (pattern FDFullscreenPopGesture) — bộ máy transition của UIKit
/// đã đủ, chỉ cần gỡ cái chặn. Toàn bộ parallax/dim/ngưỡng thả/huỷ giữa chừng vẫn của UIKit.
///
/// Giữ `edgeSwipe` làm đường lùi: nếu UIKit đổi tên `contentSwipe`, vuốt mép vẫn back được.
///
/// UI test `SwipeBackUITests` khoá cả hành vi back (vuốt mép, vuốt từ vùng nội dung) lẫn các cú
/// kéo KHÔNG được tính là back (kéo trái, cuộn dọc).
///
/// Dùng: `.nodieDetailScreen()` trên màn detail.
struct InteractivePopGestureEnabler: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController { Enabler() }
    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}

    /// VC rỗng, tồn tại chỉ để với tới `UINavigationController` cha.
    private final class Enabler: UIViewController {
        override func didMove(toParent parent: UIViewController?) {
            super.didMove(toParent: parent)
            navigationController?.popGestures.forEach { $0.delegate = PopGestureDelegate.shared }
        }
    }
}

private extension UINavigationController {
    /// Gesture pop dựng sẵn của UIKit, tìm theo `name` — thuộc tính public, khỏi động vào ivar.
    /// `contentSwipe` trước `edgeSwipe` chỉ để đọc cho thuận; thứ tự không mang ý nghĩa gì.
    var popGestures: [UIGestureRecognizer] {
        let contentSwipe = view.gestureRecognizers?.filter {
            $0.name == "UINavigationController.contentSwipe"
        } ?? []
        return contentSwipe + [interactivePopGestureRecognizer].compactMap { $0 }
    }
}

/// Quyết định khi nào gesture pop được phép chạy.
///
/// Cố tình KHÔNG lọc hướng kéo ở đây: `handleNavigationTransition:` của UIKit đã tự bỏ qua kéo
/// trái và nhường cuộn dọc cho scroll view (test khoá cả hai). Thử lọc thêm bằng `translation`
/// thì hỏng — mấy gesture này gọi `shouldBegin` ngay lúc chạm, khi translation còn là 0,
/// nên mọi cú vuốt đều bị chặn.
///
/// Là singleton vì `UIGestureRecognizer.delegate` là weak, còn gesture thì sống cùng nav
/// controller — lâu hơn màn detail đã gắn nó. Nếu delegate chết theo màn detail, gesture quay về
/// mặc định "cho phép tất cả" và sẽ nuốt `.swipeActions` của danh sách hội thoại ở màn gốc.
private final class PopGestureDelegate: NSObject, UIGestureRecognizerDelegate {
    static let shared = PopGestureDelegate()

    func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
        guard let nav = navigationController(for: gestureRecognizer) else { return false }
        // Ở màn gốc không có gì để pop — cũng chính là thứ chừa `.swipeActions` lại cho danh sách.
        guard nav.viewControllers.count > 1 else { return false }
        // Đang chạy push/pop dở: vuốt chen vào làm hỏng stack.
        return nav.transitionCoordinator == nil
    }

    private func navigationController(for gesture: UIGestureRecognizer) -> UINavigationController? {
        var responder = gesture.view?.next
        while let current = responder {
            if let nav = current as? UINavigationController { return nav }
            responder = current.next
        }
        return nil
    }
}

extension View {
    /// Màn detail: ẩn nav bar hệ thống NHƯNG giữ vuốt-back trên cả màn hình.
    func nodieDetailScreen() -> some View {
        self.toolbar(.hidden, for: .navigationBar)
            .toolbarBackground(.hidden, for: .navigationBar)
            .background(InteractivePopGestureEnabler())
    }

    /// Màn gốc của stack: chỉ ẩn nav bar, không cần enabler.
    func nodieRootScreen() -> some View {
        self.toolbar(.hidden, for: .navigationBar)
            .toolbarBackground(.hidden, for: .navigationBar)
    }
}
