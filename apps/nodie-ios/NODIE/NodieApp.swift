import SwiftUI
import UIKit

@main
struct NodieApp: App {
    /// SwiftUI không có chỗ nhận token APNs — `didRegisterForRemoteNotifications` là
    /// callback của UIKit, phải có AppDelegate mới bắt được.
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    var body: some Scene {
        WindowGroup {
            RootView(push: appDelegate.push)
        }
    }
}

/// Chỉ tồn tại để chuyển hai callback push của UIKit về `PushManager`.
final class AppDelegate: NSObject, UIApplicationDelegate {
    let push = PushManager()

    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        push.didRegister(deviceToken: deviceToken)
    }

    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {
        push.didFailToRegister(error: error)
    }
}

/// Cổng vào: chưa đăng nhập → Login; đã đăng nhập → app.
/// `restoring` là lúc supabase-swift đọc session từ Keychain — hiện màn chờ thay vì
/// nháy Login rồi nhảy vào app (user đã đăng nhập không được thấy màn Login lần nào).
struct RootView: View {
    let push: PushManager
    @State private var auth = AuthStore()

    var body: some View {
        ZStack {
            NodieColors.bg.ignoresSafeArea()

            switch auth.phase {
            case .restoring:
                ProgressView().tint(NodieColors.accent)
            case .signedOut, .awaitingEmailConfirmation:
                LoginView(auth: auth)
                    .transition(.opacity)
            case .signedIn:
                RootTabView(auth: auth)
                    .transition(.opacity)
            }
        }
        .animation(.easeOut(duration: 0.2), value: auth.phase)
        // Xin quyền push SAU khi đã đăng nhập, không phải lúc mở app: device_tokens gắn với
        // user_id, và hộp thoại quyền của iOS chỉ hiện MỘT lần trong đời cài đặt — tiêu nó
        // lúc user còn đang ở màn Login là mất luôn cơ hội.
        .task(id: auth.phase) {
            guard auth.phase == .signedIn else { return }
            await push.requestAuthorizationAndRegister()
            await push.saveTokenIfPending()   // token có thể về trước cả session
        }
    }
}
