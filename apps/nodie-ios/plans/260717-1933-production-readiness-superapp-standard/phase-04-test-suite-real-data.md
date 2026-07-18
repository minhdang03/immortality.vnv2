# Phase 04 — Test suite chạy dữ liệu thật, xanh lặp 3 lần

**Audit:** P0-05 — 35 XCUITest: 11 pass / 24 fail; 15 bị signal kill (infra), còn lại assert trên mock đã gỡ (`Lab trường thọ #3`, `Hà Chi`, `newMessagePerson-mai`, `12 tin chưa đọc`). Release gate không đáng tin.
**Chuẩn:** super app không ship khi gate đỏ; test phân quyền bằng user THƯỜNG (bài học 3 P0 sống sót vì test bằng admin — plan 1404).
**Model:** Fable — vùng chôn nhiều bẫy nhất repo: RLS ngắn mạch bởi admin, PGRST201 khi embed 2 đường tới `public_profiles`, test phải join kênh trước khi assert unread. Build xanh không chứng minh gì; loại lỗi "im lặng tuyệt đối" chỉ lộ khi model tự nghi ngờ và tự verify bằng HTTP/psql thật thay vì tin tài liệu.

## Kết quả (18/07 10:1x — Fable)

**✅ GATE XANH 3/3 — 18/07 21:36, commit `cba54be`**: 38/38 × 3 run liên tiếp
(681.9s / 682.0s / 684.7s — lệch <3s, suite deterministic), phủ cả Friends (06) +
MetricKit (2015-04) vừa land. Điều kiện: load <8, sim erase sạch, seed trước mỗi run.
Đường flake đã đi qua để tới đây (17 đỏ → 3/3 xanh): tap nút đang hoán đổi · typeText
ký tự lạ · đua banner-vs-mạng · state một-lần không reseed · câu hỏi xoá-mềm-kẹt ·
zombie simulator đẩy load 156 · va build với phiên khác. Chi tiết: memory
`nodie-uitest-gate-discipline` + `nodie-ios-test-ops-traps`.

- ✅ Viết lại 5 file test trên dữ liệu thật (hết sạch chuỗi mock — grep `Hà Chi|Lab trường
  thọ|hachi|-mai` = 0). Suite 38 test; các lần chạy đo được: 17 đỏ → 9 → 1 → 37-38/38 xanh.
- ✅ Seed mở rộng: user thứ 3 (Chi, Admin API) cho test tạo-DM-mới · nhóm "rời thử" riêng
  (test rời khỏi có phòng riêng) · tin thoại (test bubble voice) · **tự chữa** câu hỏi bị
  xoá-mềm-kẹt của UndoDelete · dọn DM rác có RÀO 2 vế (code review C1: thiếu vế "phải có
  thành viên test" là DM 0-thành-viên của người thật bị xoá chân không).
- ✅ Test mới cho phase 01–03: khay đính kèm 3 nút thật, nút ghi âm, bubble voice có nút
  phát, menu DM → hồ sơ người kia.
- ✅ Các bug test-infra tự tìm bằng đo prod: tap send trượt lúc mic↔gửi hoán đổi làm TIN
  DÍNH ĐÔI (bằng chứng: dòng "tin số 8… tin số 9…" trên DB) → chờ nút hiện + ô sạch + nhịp
  2.1s khớp slow-mode · ký tự "·" không gõ được qua bàn phím · UndoDelete chờ-vắng-mặt
  bằng predicate 4s (không ăn mất banner 6s) · picker giới hạn `newMessagePerson-*`
  (review H2 — tap xuyên sheet trúng dòng trùng tên).
- ✅ Sửa 2 bug SẢN PHẨM lộ ra khi viết test: DM hiển thị "Hội thoại" thay tên người
  (`resolveDMTitles`) · picker Tin nhắn mới giấu người mình follow (`peoplePicker`) ·
  `loadSuggestions` limit-không-order (người biến mất ngẫu nhiên khỏi picker).
- 📝 Nợ follow-up (review M2): đưa cả `ConversationStore` lên `@MainActor` —
  `resolveDMTitles` mutate `channels` ngoài main như pattern sẵn có của store.

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
