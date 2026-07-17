import AVFoundation
import Foundation

/// Thu tin nhắn thoại — AAC .m4a mono 64kbps, kèm biên độ thật để vẽ waveform.
///
/// Định dạng theo đúng chuẩn voice note của WhatsApp/Zalo: mono là đủ (giọng nói không cần
/// stereo), 64kbps cho tệp ~8KB/giây — gửi qua mạng yếu vẫn nhanh, và người nhận trên máy
/// nào cũng phát được (AAC là codec phổ thông nhất).
///
/// `@Observable` để `ChatDetailView` đọc thẳng `elapsed`/`levels` mà vẽ.
@Observable
final class VoiceRecorder {
    /// Giây đã ghi — đếm từ ĐỒNG HỒ CỦA RECORDER (`currentTime`), không phải từ Timer tự cộng:
    /// Timer trôi khi máy bận, và số nó đếm sẽ lệch với độ dài tệp thật.
    private(set) var elapsed: TimeInterval = 0
    /// Biên độ đã chuẩn hoá 0–1, lấy mỗi 50ms. View vẽ trực tiếp mảng này.
    private(set) var levels: [Float] = []
    private(set) var isRecording = false

    private var recorder: AVAudioRecorder?
    private var meterTimer: Timer?
    private var fileURL: URL?
    private var interruptionObserver: NSObjectProtocol?
    /// Độ dài chốt tại lúc bị ngắt (cuộc gọi đến…) — `currentTime` về 0 sau khi recorder dừng,
    /// nên phải chụp trước. Non-nil nghĩa là bản ghi đã dừng nhưng tệp còn nguyên, gửi được.
    private var interruptedDuration: TimeInterval?

    /// Ngắn hơn ngần này là bấm nhầm, không phải tin nhắn. WhatsApp cũng bỏ im lặng.
    static let minimumDuration: TimeInterval = 1.0
    /// Lấy mẫu 50ms — đủ dày để waveform có hình, đủ thưa để không đốt pin.
    private static let meterInterval: TimeInterval = 0.05

    enum RecorderError: LocalizedError {
        case sessionFailed
        var errorDescription: String? { String(localized: "Không bắt đầu ghi âm được.") }
    }

    /// Xin quyền mic. Hỏi lúc bấm mic lần đầu, KHÔNG hỏi lúc mở app.
    static func requestPermission() async -> Bool {
        // `AVAudioApplication` là API iOS 17; `AVAudioSession.requestRecordPermission` đã
        // deprecated. App này đỡ từ iOS 17 nên dùng thẳng bản mới.
        switch AVAudioApplication.shared.recordPermission {
        case .granted: return true
        case .undetermined: return await AVAudioApplication.requestRecordPermission()
        default: return false
        }
    }

    /// Bắt đầu ghi vào một tệp tạm. Ném lỗi nếu không chiếm được audio session.
    func start() throws {
        let session = AVAudioSession.sharedInstance()
        // `.playAndRecord` chứ không `.record`: ghi xong người dùng bấm phát lại ngay trong
        // cùng màn. `.defaultToSpeaker` để phát ra loa ngoài thay vì loa nghe điện thoại.
        try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetooth])
        try session.setActive(true)

        let recorder: AVAudioRecorder
        do {
            let url = FileManager.default.temporaryDirectory
                .appendingPathComponent("voice-\(UUID().uuidString).m4a")
            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44_100,
                AVNumberOfChannelsKey: 1,
                AVEncoderBitRateKey: 64_000,
            ]
            recorder = try AVAudioRecorder(url: url, settings: settings)
            recorder.isMeteringEnabled = true
            guard recorder.record() else { throw RecorderError.sessionFailed }
            self.fileURL = url
        } catch {
            // Session đã chiếm ở trên mà recorder không dựng được → NHẢ RA rồi mới ném lỗi.
            // Không nhả thì `.playAndRecord` treo lại, nhạc của app khác câm tới lần teardown sau.
            try? session.setActive(false, options: .notifyOthersOnDeactivation)
            throw error
        }

        self.recorder = recorder
        levels = []
        elapsed = 0
        interruptedDuration = nil
        isRecording = true
        startMetering()
        observeInterruption()
    }

    /// Điện thoại gọi đến / Siri chen ngang: hệ thống dừng recorder. Chốt độ dài và đóng tệp
    /// cho tử tế — thanh ghi âm vẫn đứng đó, người dùng tự quyết Gửi hay Huỷ. KHÔNG mất tệp.
    private func observeInterruption() {
        interruptionObserver = NotificationCenter.default.addObserver(
            forName: AVAudioSession.interruptionNotification, object: nil, queue: .main
        ) { [weak self] note in
            guard let self, self.isRecording,
                  let raw = note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
                  AVAudioSession.InterruptionType(rawValue: raw) == .began,
                  let recorder = self.recorder else { return }
            // Lúc notification tới, hệ thống có thể ĐÃ dừng recorder — `currentTime` của
            // recorder đã dừng trả 0 trên nhiều bản iOS, và 0 < 1s nghĩa là bản ghi bị vứt
            // im lặng. `elapsed` (tick metering cuối, trễ ≤50ms) là lưới đỡ.
            self.interruptedDuration = max(recorder.currentTime, self.elapsed)
            recorder.stop()                      // đóng file m4a hợp lệ, không cắt cụt
            self.meterTimer?.invalidate()
            self.isRecording = false
        }
    }

    /// Kết thúc: trả về tệp + độ dài + waveform, hoặc nil nếu quá ngắn / hỏng.
    /// Dù trả gì thì audio session cũng được nhả — xem `teardown`.
    struct Recording {
        let data: Data
        let duration: TimeInterval
        let waveform: [Float]
    }

    func finish() -> Recording? {
        guard let recorder, let fileURL else { teardown(); return nil }
        // Bị ngắt giữa chừng thì recorder đã dừng rồi — `currentTime` lúc này là 0,
        // dùng độ dài đã chốt tại thời điểm ngắt.
        let duration = interruptedDuration ?? recorder.currentTime
        recorder.stop()
        let samples = levels
        teardown()

        // Quá ngắn = bấm nhầm: xoá tệp và im lặng, không gửi, không báo lỗi.
        guard duration >= Self.minimumDuration else {
            try? FileManager.default.removeItem(at: fileURL)
            return nil
        }
        guard let data = try? Data(contentsOf: fileURL) else { return nil }
        try? FileManager.default.removeItem(at: fileURL)
        return Recording(data: data, duration: duration, waveform: Self.downsample(samples))
    }

    /// Huỷ: dừng, xoá tệp, không trả gì.
    func cancel() {
        recorder?.stop()
        if let fileURL { try? FileManager.default.removeItem(at: fileURL) }
        teardown()
    }

    private func startMetering() {
        meterTimer = Timer.scheduledTimer(withTimeInterval: Self.meterInterval, repeats: true) { [weak self] _ in
            guard let self, let recorder = self.recorder, recorder.isRecording else { return }
            recorder.updateMeters()
            self.elapsed = recorder.currentTime
            self.levels.append(Self.normalize(recorder.averagePower(forChannel: 0)))
        }
    }

    private func teardown() {
        meterTimer?.invalidate()
        meterTimer = nil
        recorder = nil
        fileURL = nil
        isRecording = false
        interruptedDuration = nil
        if let interruptionObserver {
            NotificationCenter.default.removeObserver(interruptionObserver)
            self.interruptionObserver = nil
        }
        // Nhả session NGHIÊM TÚC: giữ `.playAndRecord` sau khi ghi xong là chiếm luôn đường
        // âm thanh của cả máy — nhạc của app khác không kêu lại được.
        // `.notifyOthersOnDeactivation` là thứ báo cho chúng bật lại.
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    /// dB (−160…0) → 0–1 theo đường cong mũ.
    ///
    /// KHÔNG map tuyến tính: giọng nói bình thường nằm quanh −30dB, chia thẳng cho 160 sẽ ra
    /// ~0.2 và waveform bẹp dí ở đáy suốt. Cắt sàn ở −50dB (dưới mức đó là im lặng/ồn nền)
    /// rồi lấy mũ 1.5 để phần giữa nở ra — đây là chỗ giọng người thật sự sống.
    static func normalize(_ decibels: Float) -> Float {
        let floor: Float = -50
        guard decibels > floor else { return 0 }
        let ratio = (decibels - floor) / -floor        // 0…1
        return min(1, pow(ratio, 1.5))
    }

    /// Gom mảng mẫu (20 mẫu/giây) xuống đúng 50 điểm để nhét vào metadata.
    ///
    /// 50 điểm vẽ đủ đẹp ở mọi bề ngang bong bóng, và giữ jsonb nhỏ. Ghi 3 phút mà lưu cả
    /// 3600 mẫu là nhồi rác vào DB.
    static func downsample(_ samples: [Float], to count: Int = 50) -> [Float] {
        guard !samples.isEmpty else { return [] }
        guard samples.count > count else { return samples }
        let bucket = Double(samples.count) / Double(count)
        return (0..<count).map { i in
            let start = Int(Double(i) * bucket)
            let end = min(samples.count, max(start + 1, Int(Double(i + 1) * bucket)))
            let slice = samples[start..<end]
            // TRUNG BÌNH của mỗi khoảng, không phải lấy mẫu cách quãng: lấy cách quãng sẽ
            // bỏ sót đỉnh và waveform trông không giống thứ vừa nói.
            return slice.reduce(0, +) / Float(slice.count)
        }
    }
}
