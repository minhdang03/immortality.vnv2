import SwiftUI
import WebKit

/// Captcha Cloudflare Turnstile — lấy "phiếu người thật" qua trang nhúng trên battudao.com.
///
/// Turnstile KHÔNG có SDK native iOS, và `loadHTMLString` + baseURL giả không qua được
/// domain-check của Cloudflare — nên bắt buộc WKWebView trỏ trang THẬT trên domain đã
/// whitelist sitekey: `https://battudao.com/turnstile-embed.html` (plan 2015 phase 01).
///
/// Hợp đồng với trang nhúng: `window.webkit.messageHandlers.turnstile.postMessage({kind, value})`,
/// `kind ∈ {token, error, expired}`.

// MARK: - Điều phối

/// Cầu giữa AuthStore (logic, không có UI) và sheet captcha (UI, sống ở RootView).
///
/// AuthStore gọi `requestToken()` khi server đòi captcha; presenter bật sheet, người dùng
/// (hoặc widget invisible) sinh token, sheet đóng, continuation trả token về cho AuthStore
/// retry. Một continuation tại một thời điểm — captcha chồng captcha là vô nghĩa.
@MainActor
@Observable
final class CaptchaPresenter {
    var isPresenting = false
    private var continuation: CheckedContinuation<String?, Never>?

    /// Bật sheet và chờ token. nil = người dùng đóng sheet / lỗi không hồi được.
    func requestToken() async -> String? {
        guard continuation == nil else { return nil }   // đã có phiên captcha đang mở
        isPresenting = true
        return await withCheckedContinuation { continuation = $0 }
    }

    /// Sheet gọi khi có kết quả. Cũng là chốt an toàn khi user vuốt tắt sheet (token nil).
    func finish(with token: String?) {
        continuation?.resume(returning: token)
        continuation = nil
        isPresenting = false
    }
}

// MARK: - Sheet

/// Sheet chứa widget Turnstile. Managed mode thường tự qua không cần bấm —
/// sheet chỉ thoáng hiện rồi tự đóng; trường hợp bị thách đố thì người dùng bấm một ô.
struct CaptchaSheetView: View {
    let presenter: CaptchaPresenter
    @State private var failed = false
    /// Đổi để ép WebView dựng lại — đường "Thử lại" khi lỗi mạng/expired.
    @State private var attempt = 0

    var body: some View {
        VStack(spacing: NodieSpacing.lg) {
            Text("Xác nhận bạn là người thật")
                .font(NodieTypography.chatName)
                .foregroundStyle(NodieColors.ink)
                .padding(.top, NodieSpacing.xl)

            if failed {
                Text("Không xác nhận được. Kiểm tra mạng rồi thử lại nhé.")
                    .font(NodieTypography.bodySm)
                    .foregroundStyle(NodieColors.inkMuted)
                    .multilineTextAlignment(.center)
                Button {
                    failed = false
                    attempt += 1
                } label: {
                    Text("Thử lại")
                        .font(NodieTypography.body.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 28)
                        .padding(.vertical, 12)
                        .background(Capsule().fill(NodieColors.accent))
                }
                .buttonStyle(.plain)
            } else {
                TurnstileWebView(
                    onToken: { presenter.finish(with: $0) },
                    onError: { failed = true }
                )
                .id(attempt)
                .frame(height: 140)
                .padding(.horizontal, NodieSpacing.lg)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity)
        .background(NodieColors.bg)
        // Vuốt tắt sheet giữa chừng = từ chối captcha — phải nhả continuation,
        // không thì AuthStore treo chờ vĩnh viễn.
        .onDisappear { presenter.finish(with: nil) }
        .presentationDetents([.medium])
    }
}

// MARK: - WebView

/// WKWebView tối giản quanh trang nhúng — không điều hướng đi đâu khác, không lưu gì.
struct TurnstileWebView: UIViewRepresentable {
    let onToken: (String) -> Void
    let onError: () -> Void

    /// Sitekey từ Info.plist (bơm qua Secrets.xcconfig như SUPABASE_HOST — không hardcode:
    /// đổi widget/tài khoản Cloudflare là đổi .env, không đổi code).
    private static var sitekey: String {
        Bundle.main.object(forInfoDictionaryKey: "TURNSTILE_SITEKEY") as? String ?? ""
    }

    func makeCoordinator() -> Coordinator { Coordinator(onToken: onToken, onError: onError) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.userContentController.add(context.coordinator, name: "turnstile")
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.isScrollEnabled = false

        var components = URLComponents(string: "https://battudao.com/turnstile-embed.html")!
        components.queryItems = [URLQueryItem(name: "sitekey", value: Self.sitekey)]
        webView.load(URLRequest(url: components.url!))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
        // Không gỡ handler thì WKUserContentController giữ coordinator sống mãi (retain cycle
        // có tài liệu của WebKit) — mỗi lần hiện captcha rò một coordinator.
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "turnstile")
    }

    final class Coordinator: NSObject, WKScriptMessageHandler {
        let onToken: (String) -> Void
        let onError: () -> Void
        init(onToken: @escaping (String) -> Void, onError: @escaping () -> Void) {
            self.onToken = onToken
            self.onError = onError
        }

        func userContentController(_ userContentController: WKUserContentController,
                                   didReceive message: WKScriptMessage) {
            guard message.name == "turnstile",
                  let body = message.body as? [String: Any],
                  let kind = body["kind"] as? String else { return }
            switch kind {
            case "token":
                if let value = body["value"] as? String, !value.isEmpty {
                    onToken(value)
                } else {
                    onError()
                }
            case "error", "expired":
                // expired cũng đi đường lỗi: trang nhúng tự xin widget mới khi reload,
                // và nút "Thử lại" của sheet chính là cú reload đó.
                onError()
            default:
                break
            }
        }
    }
}
