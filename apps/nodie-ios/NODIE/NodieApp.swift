import MetricKit
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

/// Chỉ tồn tại để chuyển các callback push của UIKit về `PushManager`.
final class AppDelegate: NSObject, UIApplicationDelegate {
    let push = PushManager()

    /// Property chứ không phải biến cục bộ: MXMetricManager giữ subscriber yếu,
    /// ARC thả là callback không bao giờ chạy. AppDelegate sống suốt đời app.
    private let metricSubscriber = MetricKitSubscriber()

    /// Gắn delegate NGAY lúc launch, không đợi tới sau đăng nhập.
    ///
    /// Apple giao `didReceive` (user bấm push) đúng MỘT lần, ngay sau khi app khởi động. Chưa
    /// có delegate vào thời điểm đó thì cú bấm rơi mất luôn, không có lần thứ hai — mà đó
    /// chính là đường vào phổ biến nhất: app đang tắt hẳn, có tin nhắn, user bấm banner.
    /// `requestAuthorizationAndRegister()` cũng gắn delegate nhưng nó chạy SAU đăng nhập,
    /// quá muộn cho lần mở này.
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        UNUserNotificationCenter.current().delegate = push
        // MetricKit giao payload chẩn đoán đang chờ ngay sau launch — đăng ký trễ là lỡ.
        MXMetricManager.shared.add(metricSubscriber)
        return true
    }

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
                RootTabView(auth: auth, push: push)
                    .transition(.opacity)
            }
        }
        .animation(.easeOut(duration: 0.2), value: auth.phase)
        // Bắt link ở ĐÂY chứ không ở LoginView: lúc iOS mở app từ link trong mail mà app
        // đang tắt hẳn, phase còn là .restoring → LoginView chưa có trong cây → handler
        // gắn ở đó không kịp đăng ký và URL rơi mất. RootView là thứ duy nhất luôn sống.
        .onOpenURL { url in
            Task { await auth.handleOpenURL(url) }
        }
        // Cover cũng ở RootView: đổi code xong phase nhảy .signedIn ngay (PKCE chỉ phát
        // event đó) → LoginView bị gỡ, cover đặt ở đó sẽ biến mất cùng chủ.
        .fullScreenCover(isPresented: Binding(
            get: { auth.isRecoveringPassword },
            set: { if !$0 { auth.cancelPasswordRecovery() } }
        )) {
            NewPasswordSheet(auth: auth)
        }
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
