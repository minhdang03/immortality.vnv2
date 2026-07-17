# Phase 04 — Test suite chạy dữ liệu thật, xanh lặp 3 lần

**Audit:** P0-05 — 35 XCUITest: 11 pass / 24 fail; 15 bị signal kill (infra), còn lại assert trên mock đã gỡ (`Lab trường thọ #3`, `Hà Chi`, `newMessagePerson-mai`, `12 tin chưa đọc`). Release gate không đáng tin.
**Chuẩn:** super app không ship khi gate đỏ; test phân quyền bằng user THƯỜNG (bài học 3 P0 sống sót vì test bằng admin — plan 1404).

## Context

- Đã xanh dưới user thường: Auth 9 · ProfileContent 4 · QAWire 3 (16/16, plan 1404).
- Đỏ: ChatDetailUITests 0/3, NewMessageUITests 0/2, SwipeActionsUITests 2/4, SwipeBackUITests 1 fail — đều mã hoá thế giới mock.
- Account test: `an.nodie.test@gmail.com` (role=user) + Bình Trần, mật khẩu `NodieTest!2026`, `NODIE_TEST_*` trong `.env`.

## Files

- Sửa: `NODIEUITests/ChatDetailUITests.swift`, `NewMessageUITests.swift`, `SwipeActionsUITests.swift`, `SwipeBackUITests.swift`, `NodieUITestSupport.swift`
- Tạo: `scripts/seed-uitest-chat.sh` (hoặc .py) — seed idempotent: 1 DM An↔Bình + N tin cố định, 1 group; chạy bằng service key NGOÀI app

## Steps

1. **Tách 2 loại đỏ:** chạy lại suite, phân loại signal-kill (15) vs assertion stale. Signal-kill điều tra riêng — thường là app restart/timeout simulator, không phải bug test logic; fix trước (tăng launch timeout, `continueAfterFailure`, kill app state giữa test).
2. **Seed thật:** script seed DM + group + messages với nội dung CỐ ĐỊNH ("Chào An 👋"…) — idempotent (xoá theo marker rồi tạo lại), chạy trước suite. Không seed trong app process.
3. **Viết lại Chat/NewMessage/Swipe tests:** đăng nhập `an.nodie.test`, assert trên seed cố định. Identifier lấy từ accessibilityIdentifier thật của views mới (kiểm sau phase 01–03 xong, tránh viết 2 lần).
4. **Test mới cho phase 01–03:** attach tray mở PhotosPicker (kiểm sheet xuất hiện), voice bubble có nút play, menu Xem hồ sơ điều hướng, media bubble render (seed 1 tin có ảnh sẵn trong bucket).
5. **Gate xanh lặp:** chạy full suite 3 lần liên tiếp — 3/3 xanh mới đạt. Flaky = fix hoặc quarantine CÓ ghi chú, không xoá lặng.
6. Localizable: test chạy `launchVietnamese` như convention hiện có.

## Validation

- 3 run liên tiếp toàn suite xanh trên iPhone 17 Simulator.
- Không còn string mock cũ trong NODIEUITests/ (grep `Hà Chi|Lab trường thọ|hachi|-mai`).
- Suite chạy được từ sạch: `seed script → xcodebuild test` không cần thao tác tay.

## Risks

- Seed đụng dữ liệu thật của account test (đã có Q&A seed từ 1404) → marker/prefix riêng cho chat seed, không quét xoá bừa.
- Realtime timing flaky → assert với `waitForExistence` timeout đủ, không sleep cứng.
