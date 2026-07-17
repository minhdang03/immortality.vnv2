import AVFoundation
import PhotosUI
import SwiftUI
import UIKit

/// Ép ảnh về cỡ gửi được trước khi upload.
///
/// Ảnh iPhone 17 là ~4000px và 3–5MB HEIC. Gửi nguyên bản qua chat là bắt người nhận tải
/// 5MB để xem một hình rộng 170pt, và cũng dễ đụng trần 25MB của bucket. Mọi app chat đều
/// thu nhỏ trước khi gửi — đây là chỗ làm việc đó.
///
/// HEIC cũng được quy về JPEG ở đây: HEIC là định dạng của Apple, người nhận trên Android
/// (hoặc bất kỳ trình xem nào ngoài hệ Apple) mở không ra.
enum ChatImageProcessor {
    /// Cạnh dài tối đa. 2048 đủ nét cho màn Retina lớn nhất khi phóng to xem, mà vẫn giữ
    /// tệp quanh vài trăm KB.
    static let maxEdge: CGFloat = 2048
    static let quality: CGFloat = 0.8

    struct Encoded {
        let data: Data
        /// Kích thước SAU khi thu nhỏ — đây là số ghi vào metadata để bên nhận chừa đúng
        /// khung trước khi ảnh tải xong (chống nhảy layout).
        let width: Int
        let height: Int
        /// Ảnh đã thu nhỏ, giữ nguyên dạng đã giải mã.
        ///
        /// Trả kèm ở đây vì ta VỪA vẽ nó xong — bong bóng lạc quan dùng lại được ngay, khỏi
        /// phải `UIImage(data:)` lại từ JPEG vừa nén (giải mã ~30ms, và thân view chạy lại
        /// mỗi lần có tin mới).
        let image: UIImage
    }

    /// Thu nhỏ + nén. Trả nil nếu ảnh hỏng không nén nổi.
    ///
    /// `nonisolated` + gọi từ Task nền: một ảnh 4000px vẽ lại mất vài chục ms, nhân với 6 ảnh
    /// là màn hình khựng thấy rõ nếu chạy trên main thread.
    static func encode(_ image: UIImage) -> Encoded? {
        let size = image.size
        guard size.width > 0, size.height > 0 else { return nil }

        let scale = min(1, maxEdge / max(size.width, size.height))
        let target = CGSize(width: (size.width * scale).rounded(),
                            height: (size.height * scale).rounded())

        // `UIGraphicsImageRenderer` với scale 1: muốn ĐÚNG `target` pixel. Mặc định nó lấy
        // scale của màn (3x) và đẻ ra ảnh gấp ba lần yêu cầu.
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true

        let resized = UIGraphicsImageRenderer(size: target, format: format).image { _ in
            image.draw(in: CGRect(origin: .zero, size: target))
        }
        guard let data = resized.jpegData(compressionQuality: quality) else { return nil }
        return Encoded(data: data, width: Int(target.width), height: Int(target.height),
                       image: resized)
    }

    /// Từ `Data` thô của PhotosPicker (HEIC/PNG/JPEG đều vào được đây).
    static func encode(data: Data) -> Encoded? {
        guard let image = UIImage(data: data) else { return nil }
        return encode(image)
    }
}

/// Quyền máy ảnh — hỏi đúng lúc bấm, không hỏi lúc mở app.
enum CameraPermission {
    enum Outcome {
        case granted
        /// Đã từ chối trước đó: hỏi lại không hiện hộp thoại nào nữa, chỉ có Cài đặt mới mở lại được.
        case denied
    }

    static func request() async -> Outcome {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            return .granted
        case .notDetermined:
            return await AVCaptureDevice.requestAccess(for: .video) ? .granted : .denied
        default:
            return .denied
        }
    }
}

/// `UIImagePickerController` bọc lại cho SwiftUI — SwiftUI chưa có API chụp ảnh riêng
/// (`PhotosPicker` chỉ đọc thư viện, không mở được máy ảnh).
struct CameraPicker: UIViewControllerRepresentable {
    /// Trả ảnh đã chụp. Huỷ thì không gọi.
    let onCapture: (UIImage) -> Void
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        // Máy ảnh không tồn tại trên Simulator → rơi về thư viện ảnh để màn hình vẫn dùng
        // được khi chạy test, thay vì dựng một controller trống rồi treo.
        picker.sourceType = UIImagePickerController.isSourceTypeAvailable(.camera) ? .camera : .photoLibrary
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ controller: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    final class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        private let parent: CameraPicker
        init(_ parent: CameraPicker) { self.parent = parent }

        func imagePickerController(
            _ picker: UIImagePickerController,
            didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]
        ) {
            if let image = info[.originalImage] as? UIImage { parent.onCapture(image) }
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}

/// Gom mọi picker/sheet của đính kèm vào một chỗ.
///
/// Là `ViewModifier` chứ không viết thẳng trong `ChatDetailView`: file đó đã 900+ dòng và
/// bảy modifier này không liên quan gì tới việc vẽ danh sách tin — chúng chỉ là ống dẫn
/// "chọn xong thì gọi ai".
struct ChatMediaFlows: ViewModifier {
    @Binding var photoItems: [PhotosPickerItem]
    @Binding var photosPresented: Bool
    @Binding var cameraPresented: Bool
    @Binding var filePresented: Bool
    @Binding var cameraDenied: Bool
    @Binding var viewingPhoto: ChatPhotoSource?
    @Binding var previewingFile: URL?

    let onPickedPhotos: ([PhotosPickerItem]) async -> Void
    let onCaptured: (UIImage) async -> Void
    let onPickedFile: (Result<URL, any Error>) async -> Void

    func body(content: Content) -> some View {
        content
            // 6 ảnh một lượt — cùng con số IG dùng. `.images` loại video: chưa gửi được video
            // thì đừng cho chọn rồi báo lỗi sau.
            .photosPicker(isPresented: $photosPresented, selection: $photoItems,
                          maxSelectionCount: 6, matching: .images)
            .onChange(of: photoItems) { _, items in
                guard !items.isEmpty else { return }
                // Dọn danh sách NGAY: `photoItems` là "vừa chọn xong cái gì", không phải
                // "đang đính kèm cái gì". Không dọn thì lần chọn sau picker mở ra với ảnh
                // cũ còn tick sẵn.
                photoItems = []
                Task { await onPickedPhotos(items) }
            }
            .fullScreenCover(isPresented: $cameraPresented) {
                CameraPicker { image in Task { await onCaptured(image) } }
                    .ignoresSafeArea()
            }
            .fileImporter(isPresented: $filePresented, allowedContentTypes: [.item]) { result in
                Task { await onPickedFile(result) }
            }
            .sheet(isPresented: $cameraDenied) {
                PermissionDeniedSheet(
                    title: "Cần quyền máy ảnh",
                    message: "Bật quyền máy ảnh trong Cài đặt để chụp và gửi ảnh trong trò chuyện."
                )
            }
            .fullScreenCover(item: $viewingPhoto) { ChatPhotoViewer(source: $0) }
            .sheet(item: Binding(
                get: { previewingFile.map(PreviewFile.init) },
                set: { previewingFile = $0?.url }
            )) { file in
                QuickLookPreview(url: file.url).ignoresSafeArea()
            }
    }
}

/// Sheet giải thích khi quyền đã bị từ chối — kèm lối đi thẳng ra Cài đặt.
///
/// Bấm nút rồi không có gì xảy ra là cách chắc chắn nhất làm người dùng nghĩ app hỏng. iOS
/// không cho hỏi lại quyền đã từ chối, nên thứ duy nhất còn làm được là nói rõ và mở Cài đặt hộ.
struct PermissionDeniedSheet: View {
    let title: LocalizedStringKey
    let message: LocalizedStringKey
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: NodieSpacing.lg) {
            Text(title)
                .font(NodieTypography.chatName)
                .foregroundStyle(NodieColors.ink)

            Text(message)
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.inkSoft)
                .multilineTextAlignment(.center)

            Button {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
                dismiss()
            } label: {
                Text("Mở Cài đặt")
                    .font(NodieTypography.body.weight(.semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Capsule().fill(NodieColors.accent))
            }
            .buttonStyle(.plain)
            .accessibilityIdentifier("openSettings")

            Button("Để sau") { dismiss() }
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.inkMuted)
                .buttonStyle(.plain)
                .expandedHitArea(visual: 44)
        }
        .padding(NodieSpacing.xl)
        .frame(maxWidth: .infinity)
        .background(NodieColors.bg)
        .presentationDetents([.height(280)])
    }
}
