import Foundation
import UIKit
import Supabase

/// Đăng ký nhận push và giữ `device_tokens` (bảng có từ 0017) khớp với máy này.
///
/// Vì sao cần: DM không push là DM chết — người ta nhắn xong không ai biết mà trả lời.
///
/// Token KHÔNG vĩnh viễn: Apple đổi nó khi user cài lại app, khôi phục từ backup, hoặc đôi
/// khi tự đổi. Nên đăng ký lại mỗi lần mở app và upsert — không phải xin một lần rồi thôi.
@Observable
final class PushManager: NSObject {
    /// Đã hỏi quyền chưa và user trả lời gì — view dùng để biết có nên mời bật lại không.
    private(set) var authorization: UNAuthorizationStatus = .notDetermined

    /// Kênh mà user vừa bấm push để vào. `RootTabView` đọc rồi tự xoá.
    ///
    /// GIỮ LẠI chứ không gọi callback thẳng: lúc user bấm push khi app đang TẮT HẲN, iOS gọi
    /// `didReceive` gần như ngay sau khi launch — sớm hơn cả lúc `RootTabView` tồn tại (còn
    /// phải đợi `auth.phase` khôi phục session từ Keychain). Callback lúc đó không có ai nghe
    /// và cú bấm rơi mất. Biến này nằm đó đợi tới khi có người đọc.
    var pendingChannelId: UUID?

    private let client = SupabaseClientProvider.shared
    /// Token Apple cấp cho lần chạy này; giữ lại để lúc user đăng nhập xong còn ghi được.
    private var pendingToken: String?

    /// Hỏi quyền rồi đăng ký với APNs.
    ///
    /// Gọi sau khi ĐÃ đăng nhập: `device_tokens` gắn với `user_id`, xin quyền lúc còn ở màn
    /// Login thì có token cũng không biết ghi cho ai — và hộp thoại quyền chỉ hiện MỘT lần
    /// trong đời cài đặt, tiêu phí nó vào lúc user chưa hiểu app làm gì là mất luôn cơ hội.
    @MainActor
    func requestAuthorizationAndRegister() async {
        let center = UNUserNotificationCenter.current()
        center.delegate = self

        let granted = (try? await center.requestAuthorization(options: [.alert, .badge, .sound])) ?? false
        authorization = await center.notificationSettings().authorizationStatus

        // Từ chối thì thôi, không đăng ký: có token mà user tắt thông báo thì server cứ
        // đẩy vào hư không, còn APNs vẫn tính quota.
        guard granted else { return }
        UIApplication.shared.registerForRemoteNotifications()
    }

    /// AppDelegate gọi khi Apple trả token về.
    func didRegister(deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02x", $0) }.joined()
        pendingToken = token
        Task { await saveToken(token) }
    }

    func didFailToRegister(error: Error) {
        // Không bắn alert: user không xin push, họ chỉ mở app. Đăng ký hỏng thì mất push,
        // không mất gì khác — lần mở sau thử lại.
        #if DEBUG
        print("[Push] đăng ký thất bại: \(error.localizedDescription)")
        #endif
    }

    /// Ghi token cho user đang đăng nhập. Gọi lại được sau khi login (token có trước session).
    func saveTokenIfPending() async {
        if let token = pendingToken { await saveToken(token) }
    }

    /// Token này thuộc APNs sandbox hay production.
    ///
    /// Đọc từ `aps-environment` trong embedded.mobileprovision chứ KHÔNG đoán bằng `#if DEBUG`:
    /// môi trường do PROFILE lúc ký quyết định, không phải do cấu hình biên dịch. Build Release
    /// ký bằng profile development là chuyện có thật (và ngược lại) — lúc đó `#if DEBUG` nói dối.
    ///
    /// Không có file (chạy trên Simulator) → sandbox: Simulator không bao giờ ký bằng profile
    /// phân phối.
    private var apnsEnvironment: String {
        guard let url = Bundle.main.url(forResource: "embedded", withExtension: "mobileprovision"),
              let raw = try? Data(contentsOf: url),
              // File là CMS/DER bọc ngoài một plist; không parse cả cấu trúc làm gì —
              // chỉ cần đọc chữ. Trong đó chuỗi "production" chỉ xuất hiện ở aps-environment.
              let text = String(data: raw, encoding: .isoLatin1)
        else { return "sandbox" }
        return text.contains("<key>aps-environment</key>")
            && text.range(of: "aps-environment</key>[^<]*<string>production",
                          options: .regularExpression) != nil
            ? "production" : "sandbox"
    }

    /// `token` là khoá chính (0017): cùng một máy đổi tay người dùng thì hàng cũ bị ghi đè,
    /// không để lại token trỏ về người đã đăng xuất — nếu không, người mới sẽ nhận push
    /// của người cũ trên chính máy đó.
    private func saveToken(_ token: String) async {
        guard let uid = client.auth.currentUser?.id else { return }
        struct DeviceToken: Encodable {
            let token: String
            let userId: UUID
            let platform: String
            let apnsEnv: String
            enum CodingKeys: String, CodingKey {
                case token, platform
                case userId = "user_id"
                case apnsEnv = "apns_env"
            }
        }
        do {
            try await client.from("device_tokens")
                .upsert(DeviceToken(token: token, userId: uid, platform: "ios",
                                    apnsEnv: apnsEnvironment),
                        onConflict: "token")
                .execute()
        } catch {
            #if DEBUG
            print("[Push] lưu token thất bại: \(error)")
            #endif
        }
    }

    /// Gỡ token khi đăng xuất/xoá tài khoản — máy này không còn nhận push của họ nữa.
    /// Thiếu bước này là người đăng nhập sau trên cùng máy vẫn nhận thông báo của người trước.
    func removeToken() async {
        guard let token = pendingToken else { return }
        try? await client.from("device_tokens").delete().eq("token", value: token).execute()
    }
}

extension PushManager: UNUserNotificationCenterDelegate {
    /// Đang mở app vẫn hiện banner — trừ tin của chính hội thoại đang xem thì không cần,
    /// nhưng lọc đó cần biết màn hiện tại nên để phase sau khi có điều hướng từ push.
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        [.banner, .sound, .badge]
    }

    /// User bấm vào push → ghi lại kênh cần mở. `RootTabView` lo phần điều hướng.
    ///
    /// `channel_id` do Edge Function `push-on-message` đặt ở TẦNG NGOÀI payload (cạnh `aps`,
    /// không nằm trong nó) — key tuỳ ý phải ở ngoài, APNs chỉ sở hữu `aps`.
    @MainActor
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse
    ) async {
        let info = response.notification.request.content.userInfo
        guard let raw = info["channel_id"] as? String, let id = UUID(uuidString: raw) else { return }
        pendingChannelId = id
    }
}
