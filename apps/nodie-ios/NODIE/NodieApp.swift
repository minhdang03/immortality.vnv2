import SwiftUI

@main
struct NodieApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}

/// Cổng vào: chưa đăng nhập → Login; đã đăng nhập → app.
/// `restoring` là lúc supabase-swift đọc session từ Keychain — hiện màn chờ thay vì
/// nháy Login rồi nhảy vào app (user đã đăng nhập không được thấy màn Login lần nào).
struct RootView: View {
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
    }
}
