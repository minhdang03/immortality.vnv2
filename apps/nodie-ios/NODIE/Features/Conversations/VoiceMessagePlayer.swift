import AVFoundation
import Foundation

/// Phát tin nhắn thoại. MỘT player cho cả app.
///
/// Dùng chung một instance là cách rẻ nhất để đảm bảo "phát cái mới thì cái cũ dừng" —
/// chuẩn của mọi app chat. Mỗi bong bóng giữ player riêng thì bấm ba cái là ba giọng nói
/// chồng lên nhau.
///
/// `@Observable`: bong bóng nào có `playingId == message.id` thì vẽ trạng thái đang phát.
@Observable
final class VoiceMessagePlayer: NSObject {
    static let shared = VoiceMessagePlayer()

    /// Tin đang phát — nil là không phát gì. View so với id của mình để biết vẽ ▶ hay ⏸.
    private(set) var playingId: UUID?
    /// 0–1, để tô waveform phần đã nghe.
    private(set) var progress: Double = 0
    /// Tốc độ hiện tại, đổi vòng 1 → 1.5 → 2 → 1.
    private(set) var rate: Float = 1
    /// Đang tải tệp về (lần nghe đầu) — bong bóng hiện spinner thay nút play.
    private(set) var loadingId: UUID?
    /// Đang kêu hay đang dừng — bong bóng vẽ ⏸ hay ▶. KHÔNG đọc `player?.isPlaying` từ view:
    /// `player` là chi tiết riêng, và đổi của nó không kích view vẽ lại.
    private(set) var isPlaying = false

    private var player: AVAudioPlayer?
    private var ticker: Timer?
    /// Tệp đã tải, khoá theo đường dẫn bucket. Nghe lại lần hai là tức thì, và tua không giật.
    private var fileCache: [String: URL] = [:]

    private override init() {
        super.init()
        // `audioPlayerBeginInterruption` của delegate đã deprecated và iOS mới KHÔNG gọi nữa —
        // đường báo ngắt (cuộc gọi đến, Siri) duy nhất còn sống là notification của session.
        NotificationCenter.default.addObserver(
            forName: AVAudioSession.interruptionNotification, object: nil, queue: .main
        ) { [weak self] note in
            guard let self,
                  let raw = note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
                  AVAudioSession.InterruptionType(rawValue: raw) == .began else { return }
            self.pause()
        }
    }

    /// Bấm vào nút play của một bong bóng: đang phát nó thì tạm dừng, không thì phát nó.
    /// `localData`: tin còn đang upload chưa có gì trên bucket — bytes nằm sẵn trong máy,
    /// người gửi vẫn nghe lại được ngay (chuẩn WhatsApp).
    func toggle(messageId: UUID, path: String, localData: Data? = nil) async {
        if playingId == messageId {
            if player?.isPlaying == true { pause() } else { resume() }
            return
        }
        await play(messageId: messageId, path: path, localData: localData)
    }

    private func play(messageId: UUID, path: String, localData: Data?) async {
        stop()
        loadingId = messageId
        let url = await localFile(for: path, fallback: localData)
        // Trong lúc chờ tải, người dùng đã bấm sang tin KHÁC (loadingId đổi chủ) — vứt kết
        // quả này đi. Không có guard thì tin tải chậm về sau sẽ cướp player khỏi tin đang
        // phát: người thắng là cú bấm CŨ, ngược ý người dùng.
        guard loadingId == messageId else { return }
        guard let url else { loadingId = nil; return }

        do {
            // `.playback` để tiếng ra loa ngoài kể cả khi máy đang gạt nút im lặng — nghe
            // voice note mà không ra tiếng là lỗi người dùng báo nhiều nhất.
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)

            let player = try AVAudioPlayer(contentsOf: url)
            player.delegate = self
            player.enableRate = true          // phải bật TRƯỚC khi gán `rate`, không thì bị lờ
            player.rate = rate
            player.prepareToPlay()
            guard player.play() else { loadingId = nil; return }

            self.player = player
            playingId = messageId
            progress = 0
            loadingId = nil
            isPlaying = true
            startTicker()
        } catch {
            loadingId = nil
        }
    }

    func pause() {
        player?.pause()
        ticker?.invalidate()
        isPlaying = false
    }

    func resume() {
        guard let player else { return }
        player.play()
        isPlaying = true
        startTicker()
    }

    /// Dừng hẳn và nhả session — gọi khi rời màn chat, hoặc trước khi phát tin khác.
    func stop() {
        player?.stop()
        player = nil
        ticker?.invalidate()
        ticker = nil
        playingId = nil
        progress = 0
        isPlaying = false
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    /// Tua tới tỉ lệ 0–1 (chạm vào waveform).
    func seek(to fraction: Double) {
        guard let player else { return }
        player.currentTime = player.duration * min(max(fraction, 0), 1)
        progress = fraction
    }

    /// 1 → 1.5 → 2 → 1. Đổi được cả lúc đang phát.
    func cycleRate() {
        rate = rate == 1 ? 1.5 : (rate == 1.5 ? 2 : 1)
        player?.rate = rate
    }

    private func startTicker() {
        ticker?.invalidate()
        ticker = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] _ in
            guard let self, let player = self.player, player.duration > 0 else { return }
            self.progress = player.currentTime / player.duration
        }
    }

    /// URL tệp trên đĩa: lấy trong cache, không thì ký URL rồi tải về thư mục tạm.
    ///
    /// Tải hẳn về chứ không phát thẳng từ URL: `AVAudioPlayer` không phát được từ URL mạng,
    /// và có tệp local thì tua mới tức thì.
    private func localFile(for path: String, fallback: Data? = nil) async -> URL? {
        if let cached = fileCache[path], FileManager.default.fileExists(atPath: cached.path) {
            return cached
        }
        // Chưa upload xong (`path` rỗng) thì không có gì để ký — ghi bytes local ra tệp tạm.
        // KHÔNG cache theo path rỗng: mọi tin đang gửi sẽ giẫm lên nhau cùng một khoá.
        if let fallback {
            let temp = FileManager.default.temporaryDirectory
                .appendingPathComponent("voice-pending-\(UUID().uuidString).m4a")
            guard (try? fallback.write(to: temp)) != nil else { return nil }
            return temp
        }
        guard !path.isEmpty, let remote = await SignedURLCache.shared.url(
            for: path, client: SupabaseClientProvider.shared
        ) else { return nil }

        let destination = FileManager.default.temporaryDirectory
            .appendingPathComponent("voice-\(UUID().uuidString).m4a")
        do {
            let (data, _) = try await URLSession.shared.data(from: remote)
            try data.write(to: destination)
            fileCache[path] = destination
            return destination
        } catch {
            return nil
        }
    }
}

extension VoiceMessagePlayer: AVAudioPlayerDelegate {
    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        stop()
    }

    /// Điện thoại gọi đến / rút tai nghe: iOS tự dừng player. Dọn trạng thái cho khớp, không
    /// thì bong bóng đứng yên ở trạng thái "đang phát" trong khi không có tiếng nào.
    func audioPlayerBeginInterruption(_ player: AVAudioPlayer) {
        pause()
    }
}
