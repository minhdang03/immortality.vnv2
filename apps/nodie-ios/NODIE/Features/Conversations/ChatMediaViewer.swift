import Photos
import QuickLook
import SwiftUI
import UIKit

/// Ảnh xem toàn màn đến từ đâu: đang gửi (còn trong máy) hay đã lên bucket.
enum ChatPhotoSource: Equatable, Identifiable {
    case local(Data)
    case remote(path: String)

    /// `.sheet(item:)` cần Identifiable. Ảnh local dùng `hashValue` của bytes — hai ảnh khác
    /// nhau ra hai id khác nhau, đủ cho việc SwiftUI cần biết (mở sheet nào).
    var id: String {
        switch self {
        case .local(let data): return "local-\(data.hashValue)"
        case .remote(let path): return "remote-\(path)"
        }
    }
}

/// `URL` không Identifiable sẵn mà `.sheet(item:)` đòi — bọc một lớp mỏng.
struct PreviewFile: Identifiable {
    let url: URL
    var id: String { url.path }
}

/// Xem ảnh toàn màn — chụm để phóng, kéo xuống để đóng, chia sẻ.
///
/// Nền đen đặc chứ không theo nền kem của app: xem ảnh thì mọi thứ quanh nó phải lùi đi,
/// đây là quy ước chung của mọi trình xem ảnh.
struct ChatPhotoViewer: View {
    let source: ChatPhotoSource
    @Environment(\.dismiss) private var dismiss

    @State private var scale: CGFloat = 1
    @State private var committedScale: CGFloat = 1
    @State private var offset: CGSize = .zero
    @State private var committedOffset: CGSize = .zero
    /// Chỉ dùng lúc chưa phóng to — kéo ảnh khi đang phóng là để xem chỗ khác, không phải để đóng.
    @State private var dismissDrag: CGSize = .zero
    @State private var image: UIImage?
    @State private var failed = false
    /// Đã lưu xong → nút đổi thành dấu ✓ vài giây. Lưu ảnh là việc không có phản hồi tự nhiên
    /// nào (ảnh vẫn nằm y đó trên màn), im lặng thì người dùng bấm lần nữa cho chắc.
    @State private var justSaved = false
    /// Từ chối quyền ghi thư viện — iOS không hỏi lại lần hai, phải tự chỉ đường ra Cài đặt.
    @State private var saveDenied = false
    /// Ghi hỏng (đĩa đầy, thư viện lỗi) — khác `saveDenied`: đây không phải chuyện quyền.
    @State private var saveFailed = false

    /// Mờ dần theo tay kéo — người dùng thấy được mình đang đóng nó, và kéo nhẹ rồi thả thì
    /// nó quay lại chứ không đóng oan.
    private var backdropOpacity: Double {
        max(0, 1 - Double(abs(dismissDrag.height)) / 400)
    }

    var body: some View {
        ZStack {
            Color.black.opacity(backdropOpacity).ignoresSafeArea()

            if let image {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .scaleEffect(scale)
                    .offset(x: offset.width + dismissDrag.width,
                            y: offset.height + dismissDrag.height)
                    .gesture(magnify)
                    .simultaneousGesture(drag)
                    .onTapGesture(count: 2) { toggleZoom() }
            } else if failed {
                // Không để spinner quay vô tận: URL ký có thể đã hết hạn (cache giữ tới 50
                // phút) hoặc mạng rớt. Nói ra và cho một đường thử lại.
                VStack(spacing: 12) {
                    Text("Không tải được ảnh")
                        .font(NodieTypography.body)
                        .foregroundStyle(.white)
                    Button("Thử lại") {
                        failed = false
                        Task { await loadImage(forceRefresh: true) }
                    }
                    .font(NodieTypography.body.weight(.semibold))
                    .foregroundStyle(NodieColors.ink)
                    .padding(.horizontal, 18)
                    .padding(.vertical, 10)
                    .background(Capsule().fill(NodieColors.cream))
                    .buttonStyle(.plain)
                }
            } else {
                ProgressView().tint(.white)
            }

            closeAndShareBar
        }
        .task { await loadImage() }
        .statusBarHidden()
        // Cùng khuôn với máy ảnh (xem `tapAttach`): đã từ chối thì iOS im lặng mãi mãi,
        // nên phải tự nói và chỉ đường ra Cài đặt.
        .sheet(isPresented: $saveDenied) {
            PermissionDeniedSheet(
                title: "Cần quyền thư viện ảnh",
                message: "Bật quyền thêm ảnh trong Cài đặt để lưu ảnh từ trò chuyện về máy."
            )
        }
        .alert("Không lưu được ảnh", isPresented: Binding(
            get: { saveFailed },
            set: { if !$0 { saveFailed = false } }
        )) {
            Button("OK") { saveFailed = false }
        } message: {
            Text("Thử lại, hoặc dùng nút chia sẻ bên cạnh.")
        }
    }

    /// Ghi ảnh vào thư viện. Xin quyền `.addOnly` — chỉ THÊM, không đọc: app này không có
    /// việc gì phải xem ảnh sẵn có của người dùng, và quyền hẹp thì hộp thoại iOS cũng nói
    /// đúng như vậy.
    private func save(_ image: UIImage) async {
        let status = await PHPhotoLibrary.requestAuthorization(for: .addOnly)
        guard status == .authorized || status == .limited else {
            saveDenied = true
            return
        }
        do {
            try await PHPhotoLibrary.shared().performChanges {
                PHAssetChangeRequest.creationRequestForAsset(from: image)
            }
            NodieHaptics.tap()
            justSaved = true
            // Trả nút về trạng thái cũ — dấu ✓ đứng mãi thì lần sau mở ảnh khác vẫn thấy
            // "đã lưu" dù chưa lưu gì.
            try? await Task.sleep(for: .seconds(2))
            justSaved = false
        } catch {
            saveFailed = true
        }
    }

    private var closeAndShareBar: some View {
        VStack {
            HStack {
                Button { dismiss() } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(width: 36, height: 36)
                        .background(Circle().fill(.black.opacity(0.45)))
                        .expandedHitArea(visual: 44)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Đóng")
                .accessibilityIdentifier("closePhotoViewer")

                Spacer()

                if let image {
                    // Lưu về máy MỘT CHẠM. Share sheet cũng lưu được, nhưng đó là ba bước và
                    // phải biết trước rằng "Lưu ảnh" nấp trong đó — Zalo/Messenger đều để nút
                    // riêng vì đây là việc hay làm nhất với một tấm ảnh người khác gửi.
                    Button {
                        Task { await save(image) }
                    } label: {
                        Image(systemName: justSaved ? "checkmark" : "arrow.down.to.line")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(width: 36, height: 36)
                            .background(Circle().fill(.black.opacity(0.45)))
                            .expandedHitArea(visual: 44)
                    }
                    .buttonStyle(.plain)
                    .disabled(justSaved)
                    .accessibilityLabel(justSaved ? "Đã lưu ảnh" : "Lưu ảnh về máy")
                    .accessibilityIdentifier("savePhoto")

                    // `Image` của SwiftUI là Transferable sẵn — không phải tự dựng
                    // UIActivityViewController. Không hand-roll thứ hệ thống đã cho.
                    ShareLink(item: Image(uiImage: image),
                              preview: SharePreview("Ảnh", image: Image(uiImage: image))) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(width: 36, height: 36)
                            .background(Circle().fill(.black.opacity(0.45)))
                            .expandedHitArea(visual: 44)
                    }
                    .accessibilityLabel("Chia sẻ ảnh")
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)

            Spacer()
        }
        .opacity(backdropOpacity)
    }

    private var magnify: some Gesture {
        MagnifyGesture()
            .onChanged { scale = max(1, committedScale * $0.magnification) }
            .onEnded { _ in
                committedScale = scale
                // Về đúng 1 thì phải về đúng giữa: thu nhỏ hết cỡ mà ảnh còn lệch một bên
                // trông như hỏng.
                if scale <= 1 { resetZoom() }
            }
    }

    private var drag: some Gesture {
        DragGesture()
            .onChanged { value in
                if committedScale > 1 {
                    offset = CGSize(width: committedOffset.width + value.translation.width,
                                    height: committedOffset.height + value.translation.height)
                } else {
                    dismissDrag = value.translation
                }
            }
            .onEnded { value in
                if committedScale > 1 {
                    committedOffset = offset
                } else if abs(value.translation.height) > 120 {
                    dismiss()
                } else {
                    withAnimation(.spring(duration: 0.25)) { dismissDrag = .zero }
                }
            }
    }

    private func toggleZoom() {
        withAnimation(.easeOut(duration: 0.2)) {
            if committedScale > 1 {
                resetZoom()
            } else {
                scale = 2.5
                committedScale = 2.5
            }
        }
    }

    private func resetZoom() {
        scale = 1
        committedScale = 1
        offset = .zero
        committedOffset = .zero
    }

    private func loadImage(forceRefresh: Bool = false) async {
        switch source {
        case .local(let data):
            image = UIImage(data: data)
            failed = image == nil
        case .remote(let path):
            if !forceRefresh, let cached = ChatImageCache.image(for: path) {
                image = cached
                return
            }
            guard let url = await SignedURLCache.shared.url(
                for: path, client: SupabaseClientProvider.shared, forceRefresh: forceRefresh
            ), let (data, response) = try? await URLSession.shared.data(from: url) else {
                failed = true
                return
            }
            // Storage trả 400 + thân JSON khi URL hết hạn — `data(from:)` coi đó là thành công.
            // Ký lại một lần rồi mới chịu thua, giống `ChatRemoteImage`.
            if let http = response as? HTTPURLResponse, http.statusCode >= 400 {
                if forceRefresh { failed = true } else { await loadImage(forceRefresh: true) }
                return
            }
            guard let decoded = UIImage(data: data) else { failed = true; return }
            ChatImageCache.store(decoded, for: path)
            image = decoded
        }
    }
}

/// QuickLook bọc cho SwiftUI — mở pdf/docx/ảnh mà không cần app ngoài.
///
/// QuickLook chỉ đọc tệp trên đĩa, không nhận `Data`, nên tệp phải tải về thư mục tạm trước
/// (xem `ChatFileDownloader`).
struct QuickLookPreview: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> QLPreviewController {
        let controller = QLPreviewController()
        controller.dataSource = context.coordinator
        return controller
    }

    func updateUIViewController(_ controller: QLPreviewController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(url: url) }

    final class Coordinator: NSObject, QLPreviewControllerDataSource {
        private let url: URL
        init(url: URL) { self.url = url }

        func numberOfPreviewItems(in controller: QLPreviewController) -> Int { 1 }
        func previewController(_ controller: QLPreviewController, previewItemAt index: Int) -> QLPreviewItem {
            url as QLPreviewItem
        }
    }
}

/// Kéo tệp từ bucket về thư mục tạm để QuickLook mở được.
enum ChatFileDownloader {
    /// Thư mục riêng cho tệp chat tải về — dọn được cả cụm mà không đụng thứ khác trong tmp.
    private static var cacheDirectory: URL {
        FileManager.default.temporaryDirectory.appendingPathComponent("chat-files", isDirectory: true)
    }

    /// Giữ tên gốc khi lưu tạm: QuickLook chọn trình xem theo ĐUÔI TỆP, và tiêu đề nó hiện
    /// chính là tên file. Lưu thành "uuid" không đuôi thì nó không biết mở bằng gì.
    static func localURL(for path: String, name: String?) async -> URL? {
        let fileName = name ?? (path as NSString).lastPathComponent
        // Khoá theo đường dẫn bucket (băm cho thành tên thư mục hợp lệ): mở lại tệp cũ là
        // tức thì, và mười lần mở không để lại mười bản 20MB trong tmp.
        let folder = cacheDirectory.appendingPathComponent(String(path.hashValue.magnitude),
                                                           isDirectory: true)
        let destination = folder.appendingPathComponent(fileName)
        if FileManager.default.fileExists(atPath: destination.path) { return destination }

        guard let url = await SignedURLCache.shared.url(
            for: path, client: SupabaseClientProvider.shared
        ) else { return nil }

        do {
            // `download(from:)` ghi thẳng ra đĩa; `data(from:)` nạp cả 25MB vào RAM trước.
            let (temp, response) = try await URLSession.shared.download(from: url)
            // KHÔNG bỏ qua status: URL hết hạn trả 400 kèm thân JSON, và nếu cứ thế ghi ra
            // thì "báo-cáo.pdf" chính là mấy dòng JSON đó — QuickLook mở ra một tệp hỏng và
            // người dùng tưởng tệp của mình hỏng.
            guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
                try? FileManager.default.removeItem(at: temp)
                return nil
            }
            try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
            try? FileManager.default.removeItem(at: destination)
            try FileManager.default.moveItem(at: temp, to: destination)
            return destination
        } catch {
            return nil
        }
    }

    /// Xoá tệp chat đã tải — gọi khi đăng xuất, cùng lúc với các cache khác.
    static func clear() {
        try? FileManager.default.removeItem(at: cacheDirectory)
    }
}
