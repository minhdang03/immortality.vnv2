# Phase 02 — Voice message thật kiểu WhatsApp

**Audit:** P0-02 (recording bar là UI giả: không AVAudioRecorder, waveform giả, gửi chỉ huỷ), P0-03 (voice nhận về không phát được).
**Chuẩn:** WhatsApp/IG DM — giữ-để-ghi, vuốt huỷ, waveform thật, playback có tốc độ.
**Model:** Fable — cùng chuỗi media của phase 01 (ghi âm → upload → signed URL → playback) cộng interaction giữ-để-ghi/vuốt-huỷ/waveform metering thật; chuẩn WhatsApp không chấp nhận bản "gần giống".

## Context

- `ChatDetailView.swift:456` `recordingBar` — comment dòng 478 `CHƯA nối thật`. UI shell đã có (đã tôn trọng Reduce Motion — giữ).
- Upload dùng lại `ChatMediaStorage` (m4a, contentType `audio/mp4`), metadata `MessageMedia` kind voice + `duration` + `waveform: [Float]` (~50 mẫu chuẩn hoá 0–1, đủ vẽ bubble mọi cỡ).

## Files

- Tạo: `NODIE/Features/Conversations/VoiceRecorder.swift` (AVAudioRecorder wrapper: session, metering, file .m4a AAC 64kbps mono), `VoiceMessagePlayer.swift` (AVAudioPlayer + progress + speed)
- Sửa: `ChatDetailView.swift` (recordingBar nối recorder thật; bubble voice nối player), `ConversationStore.swift` (sendVoice — dùng chung pipeline optimistic/retry phase 01)
- `project.yml` → `info.properties`: `NSMicrophoneUsageDescription` (verify trên built bundle)

## Steps

1. **Permission:** `AVAudioApplication.requestRecordPermission`. Denied → sheet giải thích + mở Settings. Chưa cấp → hỏi NGAY khi bấm mic lần đầu, không hỏi lúc launch.
2. **Ghi:** `AVAudioSession` category `.playAndRecord` + `.defaultToSpeaker`; kích hoạt khi bắt đầu, deactivate khi xong (đừng chiếm audio session cả app). AAC .m4a, 64kbps mono — chuẩn voice note.
3. **UX ghi:** giữ mic để ghi (đã có gesture) — thêm: timer thật từ recorder, waveform từ `averagePower(forChannel:)` mỗi 50ms (thay waveform giả), vuốt trái huỷ (đã có UI), thả tay = gửi. Ghi <1s → huỷ im lặng (chuẩn WhatsApp, tránh gửi nhầm).
4. **Gửi:** thả tay → sample waveform xuống 50 điểm → optimistic bubble → upload → INSERT metadata `{kind: voice, path, duration, waveform}`. Fail → retry per-message như phase 01.
5. **Playback bubble:** nút play/pause + waveform vẽ progress (đã phát = đậm) + duration còn lại + tốc độ 1x/1.5x/2x (`rate`, `enableRate`). Tap waveform để seek. Chỉ 1 message phát tại 1 thời điểm (player dùng chung, phát cái mới dừng cái cũ). Signed URL qua `SignedURLCache` phase 01, tải xong cache file local để seek mượt.
6. **Interruption:** điện thoại gọi đến / route change → pause ghi & phát, không crash, không mất file đang ghi.
7. i18n + a11y: label "Ghi âm, giữ để ghi", bubble voice đọc "Tin nhắn thoại, 12 giây" — đủ 9 ngôn ngữ.

## Kết quả (17/07 21:12 — Fable tiếp quản code dở của phiên trước)

- ✅ Recorder/Player/waveform thật (phiên trước) + phần Fable vá: **bubble playback hoàn chỉnh**
  (trước đó voice rơi vào textBubble rỗng — `VoiceMessagePlayer` không được ai gọi), play/pause,
  waveform tô tiến trình, tap-seek, tốc độ 1×/1.5×/2×, đếm ngược, retry/discard cùng khuôn ảnh/tệp,
  nghe lại được cả tin đang upload (bytes local).
- ✅ `NSMicrophoneUsageDescription` — project.yml `info.properties`, verify trên bundle ĐÃ BUILD
  (trước đó THIẾU HẲN → bấm mic là iOS giết app).
- ✅ Interruption khi đang ghi (chốt duration, giữ tệp, user tự quyết Gửi/Huỷ) + khi đang phát
  (observer notification — delegate cũ deprecated, iOS mới không gọi).
- ✅ **Bug P0 mò ra khi verify:** `messageSelect` THIẾU cột `metadata` — `MessageRow.metadata`
  optional nên decode "thành công", mọi ảnh/thoại chỉ sống qua Realtime, mở lại chat thành bong
  bóng rỗng. Đã thêm cột + comment cảnh báo.
- ✅ i18n: 8 key mới + 1 key rỗng, đủ 8 ngôn ngữ đích (splice text, không round-trip).
- ✅ E2E prod 2 account thường: An upload m4a (RLS insert) → INSERT voice metadata → Bình load
  bằng ĐÚNG chuỗi select của app (metadata + waveform 50 điểm + tên thật, không PGRST201) →
  Bình ký URL tải về bytes khớp → dọn sạch.
- ⚠️ **Lệch spec có chủ ý:** tap-để-ghi rồi bấm Gửi/Huỷ (kiểu locked-mode Telegram/Zalo), KHÔNG
  giữ-để-ghi thả-tay-gửi. Spec ghi "đã có gesture" là sai — shell cũ cũng là tap. Tap ít gửi
  nhầm hơn và a11y tốt hơn; đổi sang hold cần Đăng duyệt riêng.

## Validation

- An ghi 5s → Bình nghe được, seek được, 2x chạy. Ghi <1s không gửi. Vuốt huỷ không upload.
- Mic denied → sheet Settings. Đang ghi bị gọi điện → không crash, giữ hoặc huỷ sạch.
- Reduce Motion: giữ hành vi hiện có (audit khen — đừng regress).

## Risks

- Audio session conflict nếu sau này có video/audio content khác → deactivate nghiêm túc sau mỗi lần dùng.
- Metering trả dB (−160…0) → chuẩn hoá phi tuyến (power curve) kẻo waveform toàn đáy.
