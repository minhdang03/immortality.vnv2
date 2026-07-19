import LinkPresentation
import SwiftUI
import UIKit

/// Metadata OG của link trong chat, nhớ theo URL.
///
/// Cùng khuôn `SignedURLCache`: actor + inFlight dedup — mười bubble cùng chứa một link thì
/// một request đi ra. Nhớ cả thất bại (`failed`): link chết mà cứ thử lại mỗi lần cuộn qua
/// là spam mạng cho một thứ đã biết trước kết quả.
///
/// Nợ ghi nhận (phase file): fetch phía NGƯỜI ĐỌC — site chủ link thấy IP người đọc, cùng
/// tradeoff với iMessage receiver-side. Bản nâng cấp sau: sender nhúng metadata vào message.
actor LinkPreviewCache {
    static let shared = LinkPreviewCache()

    struct Preview {
        let title: String?
        let host: String
        let image: UIImage?
    }

    private enum Entry {
        case loaded(Preview)
        case failed
    }

    private var entries: [URL: Entry] = [:]
    private var inFlight: [URL: Task<Preview?, Never>] = [:]

    func preview(for url: URL) async -> Preview? {
        if let entry = entries[url] {
            if case .loaded(let preview) = entry { return preview }
            return nil
        }
        if let running = inFlight[url] { return await running.value }

        let task = Task<Preview?, Never> { await Self.fetch(url) }
        inFlight[url] = task
        let preview = await task.value
        inFlight[url] = nil

        // Chặn kích thước thô sơ: đầy thì bỏ nửa cũ (dict không có thứ tự — đủ tốt cho cache
        // phiên; ảnh OG là thứ nặng RAM chứ không phải metadata).
        if entries.count > 80 {
            for key in Array(entries.keys.prefix(40)) { entries[key] = nil }
        }
        entries[url] = preview.map(Entry.loaded) ?? .failed
        return preview
    }

    private static func fetch(_ url: URL) async -> Preview? {
        let provider = LPMetadataProvider()
        provider.timeout = 8
        guard let metadata = try? await provider.startFetchingMetadata(for: url) else { return nil }
        var image: UIImage?
        if let imageProvider = metadata.imageProvider {
            image = await withCheckedContinuation { continuation in
                imageProvider.loadObject(ofClass: UIImage.self) { object, _ in
                    continuation.resume(returning: object as? UIImage)
                }
            }
        }
        // Không title không ảnh = card trống — coi như không có preview.
        guard metadata.title != nil || image != nil else { return nil }
        return Preview(title: metadata.title, host: url.host ?? "", image: image)
    }

    func clear() {
        entries.removeAll()
        inFlight.values.forEach { $0.cancel() }
        inFlight.removeAll()
    }
}

/// Card preview dưới phần chữ của bubble — tự vẽ theo tông Nodie, KHÔNG dùng `LPLinkView`
/// (khối hệ thống to, style không chỉnh được, lệch hẳn bảng màu kem/mực).
///
/// Chưa loaded hoặc fetch hỏng → không chiếm chỗ nào: giữ skeleton cho một link có thể chết
/// là giữ khoảng trống vô nghĩa; bubble nở ra khi preview đến — Messenger cũng vậy.
struct ChatLinkPreviewCard: View {
    let url: URL
    let isMine: Bool

    @State private var preview: LinkPreviewCache.Preview?

    var body: some View {
        Group {
            if let preview {
                Link(destination: url) {
                    VStack(alignment: .leading, spacing: 0) {
                        if let image = preview.image {
                            Image(uiImage: image)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(maxWidth: .infinity)
                                .frame(height: 110)
                                .clipped()
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            if let title = preview.title, !title.isEmpty {
                                Text(title)
                                    .font(NodieTypography.chip.weight(.semibold))
                                    .foregroundStyle(isMine ? NodieColors.cream : NodieColors.ink)
                                    .lineLimit(2)
                                    .multilineTextAlignment(.leading)
                            }
                            Text(preview.host)
                                .font(NodieTypography.tag)
                                .foregroundStyle(isMine ? NodieColors.cream.opacity(0.7) : NodieColors.inkMuted)
                                .lineLimit(1)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 8)
                    }
                    // Trên nền mực (tin mình) card phải sáng hơn nền một nấc, trên nền kem
                    // (tin người) thì dùng bg — cùng logic tương phản với link tint ở trên.
                    .background(isMine ? Color.white.opacity(0.12) : NodieColors.bg)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(isMine ? Color.white.opacity(0.15) : NodieColors.rule, lineWidth: 1)
                    )
                }
                .buttonStyle(.plain)
            }
        }
        .task(id: url) {
            preview = await LinkPreviewCache.shared.preview(for: url)
        }
    }
}
