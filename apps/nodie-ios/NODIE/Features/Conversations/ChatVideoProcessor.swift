import AVFoundation
import CoreTransferable
import SwiftUI
import UIKit
import UniformTypeIdentifiers

/// Video chọn từ thư viện, đã sao ra tệp tạm để `AVURLAsset` đọc được.
///
/// `PhotosPickerItem.loadTransferable(type: Data.self)` cho bytes nhưng `AVAsset` cần URL —
/// `FileRepresentation` nhận một bản sao trên đĩa, có URL để rút poster/thời lượng ra.
struct PickedMovie: Transferable {
    let url: URL

    static var transferRepresentation: some TransferRepresentation {
        FileRepresentation(contentType: .movie) { movie in
            SentTransferredFile(movie.url)
        } importing: { received in
            // Copy sang tmp của mình: bản `received.file` là tạm của hệ thống, bị dọn ngay
            // sau closure — giữ nó là đọc một URL đã chết.
            let dest = FileManager.default.temporaryDirectory
                .appendingPathComponent(UUID().uuidString)
                .appendingPathExtension(received.file.pathExtension.isEmpty ? "mov" : received.file.pathExtension)
            try? FileManager.default.removeItem(at: dest)
            try FileManager.default.copyItem(at: received.file, to: dest)
            return PickedMovie(url: dest)
        }
    }
}

/// Rút poster + metadata của một video để gửi. Chạy off-main (AVAssetImageGenerator nặng).
enum ChatVideoProcessor {
    struct Prepared {
        let videoData: Data
        let ext: String
        let contentType: String
        let posterData: Data
        let poster: UIImage
        let duration: Double
        let width: Int
        let height: Int
    }

    /// Từ URL video tạm → bytes + poster JPEG (frame ~0s, thu về ≤1080 cạnh dài) + thời lượng
    /// + kích thước. Trả nil nếu không đọc được/không có track hình.
    static func prepare(url: URL) async -> Prepared? {
        let asset = AVURLAsset(url: url)
        guard let videoData = try? Data(contentsOf: url) else { return nil }

        let duration = (try? await asset.load(.duration)).map(CMTimeGetSeconds) ?? 0

        guard let track = try? await asset.loadTracks(withMediaType: .video).first,
              let naturalSize = try? await track.load(.naturalSize),
              let transform = try? await track.load(.preferredTransform)
        else { return nil }
        // preferredTransform lo chuyện video quay dọc: kích thước "tự nhiên" là của khung
        // chưa xoay, phải áp transform mới ra đúng chiều người xem thấy.
        let oriented = naturalSize.applying(transform)
        let w = Int(abs(oriented.width)), h = Int(abs(oriented.height))

        let generator = AVAssetImageGenerator(asset: asset)
        generator.appliesPreferredTrackTransform = true
        generator.maximumSize = CGSize(width: 1080, height: 1080)
        guard let cgImage = try? await generator.image(at: .zero).image else { return nil }
        let poster = UIImage(cgImage: cgImage)
        guard let posterData = poster.jpegData(compressionQuality: 0.8) else { return nil }

        let ext = url.pathExtension.isEmpty ? "mov" : url.pathExtension
        let contentType = UTType(filenameExtension: ext)?.preferredMIMEType ?? "video/quicktime"
        return Prepared(videoData: videoData, ext: ext, contentType: contentType,
                        posterData: posterData, poster: poster, duration: duration,
                        width: w, height: h)
    }
}
