# Phase 07 — Hàng đợi gửi offline (tự gửi lại khi có mạng, chuẩn WhatsApp)

**Model đề xuất:** Fable — đổi hành vi send() có sẵn optimistic/rollback, sai một nhánh là
mất tin hoặc tin đôi.

## Hiện trạng → đích

- Text fail: bubble bị GỠ + alert + draft giữ → phải gõ gửi lại tay.
  → Đích: fail VÌ MẤT MẠNG (`NodieErrorKind == .offline`) thì bubble Ở LẠI trạng thái
  "Đang chờ mạng…", vào hàng đợi, mạng về tự gửi theo THỨ TỰ. Fail vì lý do khác (slow-mode,
  RLS) giữ hành vi cũ — retry tự động thứ lỗi 403 là spam vô vọng.
- Media fail: đã có bubble hỏng + nút Gửi lại tay → thêm: mạng về tự retry các bubble `.failed`.

## Thiết kế

- `queuedTexts: [QueuedText]` (mảng — giữ thứ tự gửi), struct {payload, channelId, rowId}.
  `isQueued(messageId)` cho view. RAM-only — nhất quán quyết định pendingMedia ("đóng app lúc
  đang gửi thì mất, và mất là đúng — chưa có gì trên server").
- `flushQueued()`: gửi tuần tự từng payload; 23505 duplicate-key = coi như đã gửi (tái dùng
  `isDuplicateKey` — lần trước INSERT xong mà response lạc); vẫn offline giữa chừng thì dừng,
  phần còn lại chờ đợt sau. Xong text → retry mọi pendingMedia `.failed`.
- Trigger flush: `RootTabView.onChange(of: NodieNetworkMonitor.shared.isOnline)` (monitor đã
  @Observable, body đọc là track được) — online → `chat.flushQueued()`.
- UI: bubble text queued hiện "Đang chờ mạng…" nhỏ dưới bubble (chỉ tin mình). Nhãn "Đã gửi/Đã
  xem" (phase 05) đã tự né tin pending media; thêm né tin queued.
- Đĩa: tin queued KHÔNG ghi ChatDiskCache (chưa có trên server — luật phase 01 giữ nguyên).

## Files

Sửa: `ConversationStore.swift` (send + queue + flush), `ChatDetailView.swift` (nhãn queued,
statusLabelMessageId né queued), `RootTabView.swift` (trigger), xcstrings (1 key × 8).

## Nghiệm thu

Build sạch. Simulator: bật airplane → gửi 3 tin → 3 bubble "Đang chờ mạng…" đúng thứ tự →
tắt airplane → tự lên cả 3, nhãn biến mất, không tin đôi.
