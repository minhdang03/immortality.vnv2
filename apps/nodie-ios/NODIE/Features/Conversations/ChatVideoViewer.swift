import AVKit
import SwiftUI

/// Nguồn video xem toàn màn: đang gửi (còn trong máy) hay đã lên bucket.
enum ChatVideoSource: Identifiable {
    case local(URL)
    case remote(path: String)

    var id: String {
        switch self {
        case .local(let url): return "local-\(url.path)"
        case .remote(let path): return "remote-\(path)"
        }
    }
}

/// Phát video toàn màn. Nền đen như trình xem ảnh — xem video thì app phải lùi đi.
///
/// Bucket private nên video remote phải ký URL trước; `AVPlayer` stream thẳng từ signed URL,
/// không tải cả tệp về đĩa trước (khác `ChatFileDownloader` của tài liệu).
struct ChatVideoViewer: View {
    let source: ChatVideoSource
    @Environment(\.dismiss) private var dismiss

    @State private var player: AVPlayer?
    @State private var failed = false

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            if let player {
                VideoPlayer(player: player)
                    .ignoresSafeArea()
                    .onAppear { player.play() }
            } else if failed {
                VStack(spacing: 12) {
                    Text("Không phát được video")
                        .font(NodieTypography.body)
                        .foregroundStyle(.white)
                    Button("Đóng") { dismiss() }
                        .font(NodieTypography.body.weight(.semibold))
                        .foregroundStyle(NodieColors.ink)
                        .padding(.horizontal, 18).padding(.vertical, 10)
                        .background(Capsule().fill(NodieColors.cream))
                        .buttonStyle(.plain)
                }
            } else {
                ProgressView().tint(.white)
            }

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
                    Spacer()
                }
                .padding(.horizontal, 16).padding(.top, 8)
                Spacer()
            }
        }
        .task { await load() }
        .onDisappear { player?.pause() }
        .statusBarHidden()
    }

    private func load() async {
        switch source {
        case .local(let url):
            player = AVPlayer(url: url)
        case .remote(let path):
            guard let url = await SignedURLCache.shared.url(
                for: path, client: SupabaseClientProvider.shared
            ) else { failed = true; return }
            player = AVPlayer(url: url)
        }
    }
}
