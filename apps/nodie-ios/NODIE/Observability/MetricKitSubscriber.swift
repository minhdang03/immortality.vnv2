import Foundation
import MetricKit
import Supabase

/// Nhận payload chẩn đoán của MetricKit (crash/hang/CPU) và đổ bản tóm tắt vào
/// `app_events` qua `AppEventLogger`.
///
/// MetricKit giao payload ở LẦN MỞ APP KẾ TIẾP sau sự cố, không realtime — nên
/// subscriber phải được đăng ký ngay `didFinishLaunching` để không lỡ payload
/// đang chờ, và phải được giữ sống suốt đời app (ARC thả là mất callback).
///
/// Payload chỉ chứa loại sự cố + stack rút gọn + build/OS — không PII, không
/// định danh. Với App Privacy đây là "Diagnostics", không phải tracking.
final class MetricKitSubscriber: NSObject, MXMetricManagerSubscriber {

    /// callStackTree đầy đủ có thể vài chục KB; cắt cứng ở đây để một diagnostic
    /// không nuốt trọn ngân sách 50KB của cả payload. Chuỗi cắt dở không còn là
    /// JSON hợp lệ — chấp nhận được, mục đích chỉ là đọc tay khi điều tra.
    private static let maxStackChars = 16_000

    func didReceive(_ payloads: [MXDiagnosticPayload]) {
        for payload in payloads {
            for crash in payload.crashDiagnostics ?? [] {
                var summary = base(of: crash)
                if let reason = crash.terminationReason { summary["termination_reason"] = .string(reason) }
                if let region = crash.virtualMemoryRegionInfo { summary["vm_region"] = .string(region) }
                if let type = crash.exceptionType { summary["exception_type"] = .integer(type.intValue) }
                if let code = crash.exceptionCode { summary["exception_code"] = .integer(code.intValue) }
                if let signal = crash.signal { summary["signal"] = .integer(signal.intValue) }
                summary["call_stack"] = .string(trimmedStack(crash.callStackTree))
                AppEventLogger.log(kind: "crash_diagnostic", payload: summary)
            }
            for hang in payload.hangDiagnostics ?? [] {
                var summary = base(of: hang)
                summary["hang_seconds"] = .double(hang.hangDuration.converted(to: .seconds).value)
                summary["call_stack"] = .string(trimmedStack(hang.callStackTree))
                AppEventLogger.log(kind: "hang_diagnostic", payload: summary)
            }
            for cpu in payload.cpuExceptionDiagnostics ?? [] {
                var summary = base(of: cpu)
                summary["total_cpu_seconds"] = .double(cpu.totalCPUTime.converted(to: .seconds).value)
                summary["sampled_seconds"] = .double(cpu.totalSampledTime.converted(to: .seconds).value)
                summary["call_stack"] = .string(trimmedStack(cpu.callStackTree))
                AppEventLogger.log(kind: "cpu_exception", payload: summary)
            }
        }
    }

    // Không nhận MXMetricPayload (metric ngày): chưa có ai đọc thì đừng ghi —
    // method là optional trong protocol, cần thì thêm sau ở phase funnel.

    private func base(of diagnostic: MXDiagnostic) -> [String: AnyJSON] {
        [
            "app_version": .string(diagnostic.applicationVersion),
            "app_build": .string(diagnostic.metaData.applicationBuildVersion),
            "os_version": .string(diagnostic.metaData.osVersion),
            "device_type": .string(diagnostic.metaData.deviceType),
        ]
    }

    private func trimmedStack(_ tree: MXCallStackTree) -> String {
        String(String(decoding: tree.jsonRepresentation(), as: UTF8.self).prefix(Self.maxStackChars))
    }
}
