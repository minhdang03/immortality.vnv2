---
title: "Production readiness — chuẩn super app X/FB/IG"
description: "Xử lý 5 P0 + 8 P1 từ audit 260717-1915. Media/voice thật, test suite thật, a11y AA, Friends đủ, trust copy."
status: planned
priority: P0
branch: claude/immortality-mobile-hybrid
created: 2026-07-17
source-audit: apps/plans/reports/ux-ui-260717-1915-nodie-ios-production-readiness-audit-report.md
---

# Production readiness — chuẩn super app

**Audit verdict:** NO-GO, 5.8/10. Chat 3.5, a11y 4.5, release gate 3.8.
**Chuẩn tham chiếu (Đăng chốt):** X/FB/IG — không dead affordance, media/voice native hoàn chỉnh, error UX có retry tại chỗ, a11y AA. Áp dụng: **ship media/voice THẬT thay vì ẩn** (trả lời câu hỏi mở #2 của audit).

**Tài sản có sẵn:** `ChatMediaStorage` (bucket `chat-media` private, signed URL 1h, path-based policy 0024, trần 25MB) + `MessageMedia` model + metadata pipeline. Việc còn lại chủ yếu là client.

**Điều kiện tiên quyết:** plan `260717-1404` phase 02 (Chat views → ConversationStore) phải xong — mọi phase dưới build trên chat thật.

## Phases

| # | Phase | Audit IDs | Ước lượng | Status |
|---|---|---|---|---|
| 01 | [Chat media pipeline: ảnh/camera/tệp end-to-end](phase-01-chat-media-pipeline.md) | P0-01, P0-03 | 1.5 ngày | ⬜ |
| 02 | [Voice message thật kiểu WhatsApp](phase-02-voice-messages.md) | P0-02, P0-03 | 1 ngày | ⬜ |
| 03 | [Diệt dead affordance + push trong chat](phase-03-dead-affordances-push.md) | P0-04 + medium push | 0.5 ngày | ⬜ |
| 04 | [Test suite chạy dữ liệu thật, xanh 3 lần](phase-04-test-suite-real-data.md) | P0-05 | 1 ngày | ⬜ |
| 05 | [Accessibility AA: contrast + hit target + matrix](phase-05-accessibility-aa.md) | P1-01, P1-02, P1-07 | 1 ngày | ⬜ |
| 06 | [Friends hoàn chỉnh: following + states](phase-06-friends-completion.md) | P1-04, P1-05 | 0.5 ngày | ⬜ |
| 07 | [Trust & error UX: AI copy, safety tự hại, error taxonomy](phase-07-trust-error-ux.md) | P1-03, P1-06, P1-08 | 1 ngày | ⬜ |
| 08 | [Release gate: device matrix + DoD checklist](phase-08-release-gate.md) | DoD audit | 0.5 ngày | ⬜ |

**Thứ tự:** 01→02→03 (chat), 04 sau 03 (test cần UI ổn định). 05/06/07 độc lập, chạy được song song sau 03. 08 cuối cùng.

## Nguyên tắc super app áp cho từng phase

- **IG/WhatsApp media:** optimistic bubble ngay khi chọn, progress overlay, retry per-message, downscale trước upload, viewer full-screen, cache thumbnail.
- **WhatsApp voice:** giữ-để-ghi, vuốt huỷ, waveform metering thật, playback đổi tốc độ.
- **IG rule #1:** nút chưa hoạt động = không được render. Ẩn > disable > no-op.
- **X error UX:** phân loại offline/auth/server, retry tại chỗ, không alert chung "Lỗi" ở root.
- **FB a11y:** 44pt mọi target, AA contrast, VoiceOver traversal có test regression.

## Acceptance (DoD từ audit)

1. Không control nào nhìn bấm được mà no-op/disabled vô lý.
2. Chat media/voice end-to-end trên 2 account thường + Realtime.
3. Test release-critical chạy session/RLS thật, xanh lặp 3 lần.
4. Touch target ≥44pt, contrast AA, VoiceOver + largest Dynamic Type qua màn chính.
5. Loading/empty/error/offline/permission-denied có UX rõ ở mọi màn chính.
6. Test 1 iPhone nhỏ + 1 lớn + 1 thiết bị thật.

## Ngoài phạm vi (backlog v1.1)

Dark mode + landscape (chốt scope v1 = light/portrait, ghi rõ trong release notes) · SF Symbols thay glyph Unicode tab · onboarding preview trước đăng nhập · autosave compose qua termination · Hidden Feed/Journey giữ ẩn.

## Quyết định đã chốt

1. **NODIE là MẠNG XÃ HỘI** (Đăng chốt 17/07 19:41) — không phải cộng đồng sức khoẻ. Phase 07 theo chuẩn safety FB/IG: banner hỗ trợ khi phát hiện nội dung tự hại; KHÔNG rải disclaimer y khoa trong flow (giữ ở Điều khoản là đủ). Đóng câu hỏi mở #3 của audit.
2. **Positioning = Aion v3** (Đăng chốt 17/07 19:45) — khoa học trường thọ, feed phóng-hút; mạng xã hội CÓ CHỦ ĐỀ, không phải sản phẩm y tế ⇒ UI không gánh compliance y khoa. Củng cố #1: phase 07 bỏ `MedicalSafetyFooter` + disclaimer trong luồng Q&A, chỉ giữ banner tự hại.
3. **Scope v1 = Light Mode + portrait + iPhone-only** (Đăng chốt 17/07 19:45) — ghi vào TestFlight release notes + `docs/` ở phase 08 để tester không báo là bug. Dark mode + landscape → backlog v1.1.
4. **Phiên 17/07 19:45: chạy cả 8 phase liên tục**, gate duyệt giữa mỗi phase.
