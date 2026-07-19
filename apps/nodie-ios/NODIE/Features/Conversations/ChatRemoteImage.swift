import SwiftUI
import UIKit

/// Ảnh đã tải, nhớ theo đường dẫn trong bucket.
///
/// Không dùng `AsyncImage`: nó nhận URL, mà URL của ta có hạn 1 giờ và phải ký lại. `AsyncImage`
/// thấy URL đổi (ký lại ra chuỗi khác) là coi như ảnh khác và tải lại từ đầu — cuộn lên cuộn
/// xuống sẽ tải lại liên tục. Cache ở đây khoá theo ĐƯỜNG DẪN (bất biến), nên ký lại bao nhiêu
/// lần thì ảnh vẫn là một.
/// KHÔNG phải `actor`: `NSCache` đã an toàn đa luồng sẵn. Bọc nó trong actor chỉ thêm một
/// nhịp treo + đổi luồng cho MỖI lần tra — và vì tra trở thành `await`, ảnh đã nằm sẵn trong
/// cache vẫn nháy placeholder một khung hình mỗi lần cuộn qua. Không hand-roll thứ hệ thống
/// đã cho, và cũng đừng khoá thêm thứ đã khoá rồi.
enum ChatImageCache {
    private static let cache: NSCache<NSString, UIImage> = {
        let c = NSCache<NSString, UIImage>()
        // Chặn theo DUNG LƯỢNG, không theo số lượng: ảnh 2048×1536 đã giải mã chiếm ~12.6MB
        // trong RAM (không phải vài trăm KB của tệp JPEG). 120 ảnh × 12.6MB ≈ 1.5GB — iOS
        // bắn chết app vì ngốn RAM trước khi NSCache kịp nghĩ tới chuyện nhả.
        c.totalCostLimit = 64 * 1024 * 1024
        return c
    }()

    static func image(for path: String) -> UIImage? { cache.object(forKey: path as NSString) }

    static func store(_ image: UIImage, for path: String) {
        // Chi phí = số byte thật của ảnh đã giải mã (4 byte/điểm ảnh), không phải cỡ tệp.
        let cost = Int(image.size.width * image.size.height * image.scale * image.scale * 4)
        cache.setObject(image, forKey: path as NSString, cost: cost)
    }

    static func clear() { cache.removeAllObjects() }
}

/// Ảnh trong bong bóng chat: ký URL → tải → nhớ lại. Có skeleton lúc chờ và khung hỏng có
/// thể bấm thử lại lúc lỗi.
struct ChatRemoteImage<Placeholder: View>: View {
    let path: String
    let contentMode: ContentMode
    /// Xin bản thu nhỏ chừng này pixel từ Storage transform (nil = ảnh gốc). Bubble truyền
    /// 2× bề rộng điểm của nó; viewer full-screen để nil. Cũng là một phần khoá cache —
    /// bản 464 và bản gốc là hai ảnh khác nhau trong NSCache.
    var thumbWidth: Int?
    @ViewBuilder let placeholder: () -> Placeholder

    @State private var image: UIImage?
    @State private var failed = false
    /// Bản thu nhỏ của RIÊNG ảnh này hỏng (transform từ chối / file có vấn đề) → rơi về
    /// ảnh gốc. Per-ảnh chứ không cờ toàn phiên: một ảnh chết không được kéo mọi ảnh khác
    /// về bản 754KB.
    @State private var useOriginal = false

    private var effectiveThumbWidth: Int? { useOriginal ? nil : thumbWidth }
    private var cacheKey: String {
        effectiveThumbWidth.map { "\(path)#w\($0)" } ?? path
    }

    var body: some View {
        Group {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: contentMode)
            } else if failed {
                brokenBox
            } else {
                placeholder()
            }
        }
        .task(id: path) { await load() }
    }

    /// Khung hỏng — bấm để thử lại. Ảnh hỏng vì URL hết hạn là chuyện thường (để màn chat mở
    /// qua đêm), nên phải có đường tự chữa mà không cần thoát ra vào lại.
    private var brokenBox: some View {
        Button {
            failed = false
            Task { await load(forceRefresh: true) }
        } label: {
            VStack(spacing: 6) {
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 16, weight: .semibold))
                Text("Chạm để tải lại")
                    .font(NodieTypography.tag)
            }
            .foregroundStyle(NodieColors.inkMuted)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(NodieColors.surface)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Ảnh chưa tải được, chạm để tải lại")
    }

    private func load(forceRefresh: Bool = false) async {
        // Đồng bộ: cache hit không được nhả một khung hình nào, không thì cuộn qua ảnh đã có
        // vẫn thấy nháy skeleton.
        if !forceRefresh, let cached = ChatImageCache.image(for: cacheKey) {
            image = cached
            return
        }
        guard let url = await SignedURLCache.shared.url(
            for: path, client: SupabaseClientProvider.shared,
            thumbWidth: effectiveThumbWidth, forceRefresh: forceRefresh
        ) else {
            failed = true
            return
        }
        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            // Storage trả 4xx kèm JSON lỗi khi URL hết hạn — `data(from:)` coi đó là thành
            // công, và `UIImage(data:)` sẽ nil. Bắt status trước để phân biệt "hết hạn" (ký
            // lại là xong) với "ảnh hỏng thật".
            if let http = response as? HTTPURLResponse, http.statusCode >= 400 {
                if !forceRefresh {
                    await load(forceRefresh: true)
                    return
                }
                // Ký lại rồi mà vẫn 4xx: bản thu nhỏ của ảnh NÀY không dùng được (transform
                // từ chối / render lỗi) — thử đúng MỘT lần nữa bằng ảnh gốc.
                // `effectiveThumbWidth` thành nil sau khi bật cờ nên không lặp vô hạn.
                if effectiveThumbWidth != nil {
                    useOriginal = true
                    await load(forceRefresh: true)
                    return
                }
                failed = true
                return
            }
            guard let decoded = UIImage(data: data) else { failed = true; return }
            // Ép decode bitmap NGAY, ngoài main thread: `UIImage` mặc định giải mã LƯỜI ở
            // lần vẽ đầu — cuộn tới ảnh mới là khựng một nhịp đúng lúc nó lên màn. Chuẩn
            // WhatsApp/IG: ảnh vào cache là đã sẵn sàng vẽ.
            let prepared = await decoded.byPreparingForDisplay() ?? decoded
            ChatImageCache.store(prepared, for: cacheKey)
            image = prepared
        } catch {
            // Ký lại một lần rồi mới chịu thua: nguyên nhân phổ biến nhất là URL hết hạn,
            // không phải mất mạng.
            if !forceRefresh {
                await load(forceRefresh: true)
            } else {
                failed = true
            }
        }
    }
}

extension ChatRemoteImage where Placeholder == AnyView {
    /// Skeleton mặc định — ô xám dịu, không xoay không nhấp nháy (bong bóng ảnh đã có khung
    /// đúng cỡ nhờ metadata dimensions, thêm chuyển động chỉ làm rối).
    init(path: String, contentMode: ContentMode = .fill, thumbWidth: Int? = nil) {
        self.init(path: path, contentMode: contentMode, thumbWidth: thumbWidth) {
            AnyView(NodieColors.surface.overlay(ProgressView().tint(NodieColors.inkFaint)))
        }
    }
}
