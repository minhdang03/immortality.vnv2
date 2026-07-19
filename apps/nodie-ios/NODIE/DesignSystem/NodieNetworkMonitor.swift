import Network
import Observation

/// Trạng thái mạng dùng chung TOÀN APP — MỘT `NWPathMonitor`, không phải mỗi view một cái.
///
/// Mỗi view tự mở monitor riêng vừa lãng phí (mỗi cái là một đường giám sát riêng ở tầng hệ
/// điều hành) vừa dễ lệch nhau vài mili-giây khi nhiều view cùng đọc — banner ở màn A tắt mà
/// màn B vẫn nghĩ đang offline. Singleton + `@Observable` để mọi view tự vẽ lại khi mạng đổi,
/// không cần NotificationCenter thủ công ở từng nơi.
@Observable
final class NodieNetworkMonitor {
    static let shared = NodieNetworkMonitor()

    private(set) var isOnline = true

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "nodie.network-monitor")

    private init() {
        monitor.pathUpdateHandler = { [weak self] path in
            let online = path.status == .satisfied
            Task { @MainActor in self?.isOnline = online }
        }
        monitor.start(queue: queue)
    }
}
