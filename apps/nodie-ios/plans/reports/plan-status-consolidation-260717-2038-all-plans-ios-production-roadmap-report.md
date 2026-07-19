# Tổng hợp trạng thái TOÀN BỘ plan + lộ trình production iOS — 17/07/2026 20:38

Đo bằng cách đọc từng `plan.md` (không tin status file mù quáng — chỗ nào status lỗi thời có ghi chú).
3 nơi chứa plan: `plans/` (root, chủ yếu web/platform) · `apps/plans/` · `apps/nodie-ios/plans/` (iOS).

---

## A. Plan iOS (NODIE) — thứ quyết định ship App Store

### A1. Xong hẳn

| Plan | Kết quả |
|---|---|
| `nodie-ios/260716-1943-profile-stats-saved-items-new-dm` | ✅ 2/2 phase, 32/32 UI test xanh |
| `nodie-ios/260716-1957-ux-interaction-polish` | ✅ cả 2 batch, code-reviewer DONE |
| `nodie-ios/260717-1338-nodie-follows-and-member-stats` | ✅ 4/4 phase, verify DB thật, critical đã vá |
| `apps/plans/260716-1921-nodie-i18n-appstore-compliance` | ✅ DONE — i18n 9 ngôn ngữ, report/block/delete-account/terms; migration đã apply prod 17/07 |
| `nodie-ios/260717-1325-qa-draft-safety-member-profile-supabase` | ✅ thực chất xong — status file ghi "phase 05–06 chờ Đăng" là LỖI THỜI: 0027+0028 đã apply prod 14:06, hồ sơ thành viên đã wire (plan 1404 phase 04) |

### A2. Dở dang — việc CODE còn nợ

**`nodie-ios/260717-1404-ship-1.0-blockers`** — 10/12 mục ✅, còn:

1. **Phase 02: Wire Chat views → ConversationStore** — store + backend XONG (đã chứng minh 2 user thường gửi/nhận thật), views đang làm dở 🔨. Đây là điều kiện tiên quyết của plan 1933.
2. **11 UITests đỏ** (ChatDetail 2 · NewMessage 1 · SwipeActions 2 · SwipeBack 4 · TouchTarget 2) — đều assert trên MockData đã gỡ ("Lab trường thọ #3", "Hà Chi"…). Quyết định đã chốt: VIẾT LẠI trên dữ liệu thật, không xoá/nới. Bẫy: An chưa là thành viên kênh public → test unread/swipe phải join kênh trước hoặc seed `channel_members`.

**`nodie-ios/260717-1306-auth-recovery-deeplink-own-content`** — phase 01–03 ✅, còn:

- Phase 04 (tắt push thật = xoá `device_tokens`): **CHẶN chờ Đăng** làm Apple Developer portal (capability Push + provisioning profile + khoá APNs). Không phải việc code.
- #20 khôi phục tab: code xong, chờ nghiệm thu tay.

### A3. Chưa làm gì — khối lượng chính còn lại

**`nodie-ios/260717-1933-production-readiness-superapp-standard`** — 0/8 phase. Audit verdict NO-GO 5.8/10. Chuẩn Đăng chốt: X/FB/IG.
⚠️ Plan 2015 đo lúc 20:16: **một phiên khác đang cook plan này** — kiểm tra trước khi nhận.

| # | Phase | Ước lượng |
|---|---|---|
| 01 | Chat media: ảnh/camera/tệp end-to-end (optimistic bubble, progress, retry, viewer) | 1.5 ngày |
| 02 | Voice message kiểu WhatsApp (giữ-để-ghi, waveform, đổi tốc độ) | 1 ngày |
| 03 | Diệt dead affordance + push trong chat | 0.5 ngày |
| 04 | Test suite chạy dữ liệu thật, xanh 3 lần (trùng với nợ 11 test của 1404) | 1 ngày |
| 05 | Accessibility AA: contrast + hit target 44pt + VoiceOver matrix | 1 ngày |
| 06 | Friends hoàn chỉnh: following + states | 0.5 ngày |
| 07 | Trust & error UX: AI copy, banner tự hại (KHÔNG disclaimer y khoa — Đăng chốt), error taxonomy | 1 ngày |
| 08 | Release gate: device matrix + DoD checklist | 0.5 ngày |

Thứ tự: 01→02→03 → 04; 05/06/07 song song sau 03; 08 cuối. Scope v1 đã chốt: Light mode + portrait + iPhone-only.
Lưu ý: git status hiện có `VoiceMessagePlayer.swift` + `VoiceRecorder.swift` untracked ⇒ phase 02 có thể đã được phiên kia khởi động.

**`nodie-ios/260717-2015-pre-appstore-submission`** — 0/7 phase; file phase 03–07 CHƯA VIẾT (mới có 01, 02). 14 gap ngoài UX. TestFlight public link ⇒ captcha là P0.

| # | Phase | Đợt | Ghi chú |
|---|---|---|---|
| 01 | Web: /privacy + /terms + trang nhúng captcha | A | chạy được ngay |
| 02 | Supabase ops: sổ migration `_applied_migrations`, log `push_failures`, bảng `app_events` | A | chạy được ngay |
| 03 | Seed kênh + nội dung mồi từ stories/khaitri | A | cần Đăng duyệt danh sách TRƯỚC khi ghi prod |
| 04 | MetricKit + đường ghi sự kiện | A | cần 02; hẹn cửa sổ build tránh đua với phiên 1933 |
| 05 | Captcha Turnstile end-to-end | B | CHỜ 1933 land + Đăng cấp sitekey/secret |
| 06 | Nội quy cộng đồng + funnel events | B | CHỜ 1933 land |
| 07 | Checklist bàn giao Đăng (console) | — | screenshots làm CUỐI (sau 1933 phase 05 đổi contrast) |

Đợt A cấm đụng: `ConversationStore` · `ChatDetailView` · `ConversationModels` · `QAStore*` · `project.yml` · `Info.plist` · `Localizable.xcstrings`.

**`plans/260714-2147-btd-community-app-swift-zalo-style`** (plan mẹ NODIE) — status ghi "tiếp phase 04 Hội thoại" = chính là 1404 phase 02 đang làm. Không có việc riêng; đóng status khi 1404 xong.

### A4. Việc CHỈ ĐĂNG làm được (chặn production, không phải code)

1. **Apple Developer portal**: Push capability + provisioning profile + khoá APNs → mở khoá 1306 phase 04 + push end-to-end thật.
2. **App Store Connect**: App Privacy labels, demo account cho review (KHÔNG dùng `an.nodie.test`), age rating, screenshots (làm cuối).
3. **SMTP thật** cho Supabase Auth (mail quên mật khẩu đang đi qua SMTP mặc định giới hạn).
4. **Turnstile sitekey/secret** (mở khoá 2015 phase 05).
5. **Duyệt danh sách nội dung mồi** (mở khoá 2015 phase 03).

---

## B. Plan web/platform (root `plans/`) — KHÔNG chặn iOS

| Plan | Status | Nhận định |
|---|---|---|
| `260503-1302-immortality-publisher-spec` | spec-only | Chưa bao giờ là plan thi công. Giữ làm tài liệu. |
| `260508-2106-editorial-sacred-redesign` | không ghi status | Web redesign cũ (05/2026), phần lớn đã ship qua các commit sau đó. Ứng viên archive. |
| `260509-0949-home-mockup-alignment` | không ghi status | Con của 260508. Ứng viên archive. |
| `260510-2129-bat-tu-dao-mobile-hybrid` | ✅ completed | Mô tả stack Capacitor ĐÃ GỠ — chỉ còn giá trị lịch sử. |
| `260513-1430-public-wiki-bat-tu-dao` | Draft, chờ duyệt | Chưa làm. Việc của Đăng quyết có làm không. |
| `260515-2144-febe-redesign` | pending | **ĐÃ BỊ ĐẢO** bởi quyết định Supabase 11/06 (memory). Ứng viên archive, đừng thi công. |
| `260610-1740-sp1-agent-content-platform` | pending | BTD 3.0 strangler. Chưa làm. Không liên quan iOS. |
| `260611-1255-supabase-db-auth-migration` | pending | Bị thay phần lớn bởi 260710 cutover. Đối chiếu rồi archive. |
| `260710-2018-supabase-control-plane-cutover` | **ACTIVE, dở dang** | Web: Phase 0 ✅, Phase 1 gần xong (còn ogRenderer đọc Supabase), Phase 2 (write path + editorial workflow + agent key `btd_`) chưa, Phase 3 (Auth cutover — web+mobile CÙNG ĐỢT, ràng buộc Đăng) chưa, analytics + Firestore OFF chưa. **Plan web quan trọng nhất còn sống.** |
| `260713-2003-home-energy-awakening-hero` | in-progress | Web hero, phase 01 đang dở. |
| `260715-1620-nodie-android-scaffold-parity` | pending | **ĐỪNG LÀM** trước iOS 1.0 (quyết định: Android sau khi iOS ổn, Kotlin/Compose). |

---

## C. Lộ trình production iOS — thứ tự đề xuất

```
[đang chạy] 1404 phase 02 Chat views  ──►  1933 phase 01–03 (media/voice/dead-affordance)
                                              │
2015 đợt A (01–04: web legal, ops, seed, MetricKit) — chạy SONG SONG ngay, không đụng file iOS nóng
                                              │
                    1933 phase 04 + nợ 11 UITests của 1404 (gộp 1 việc: test suite dữ liệu thật)
                                              │
                    1933 phase 05/06/07 (a11y · Friends · trust UX) — song song
                                              │
                    1933 phase 08 release gate  ──►  2015 đợt B (captcha, nội quy)  ──►  2015 phase 07 handoff
                                              │
                    Đăng: APNs + App Privacy + SMTP + screenshots  ──►  SUBMIT
```

Ước lượng phần code còn lại: ~7 ngày (1933) + ~4 ngày (2015) + nốt chat views + 11 tests.

## Việc dọn nhà (không gấp)

- Cập nhật status lỗi thời: 1325 (ghi chờ Đăng nhưng đã xong), 260714-2147 (phase 04 = 1404 phase 02).
- Archive: 260508, 260509, 260510, 260515 (đã đảo), 260611 (bị 260710 thay).
- Viết nốt file phase 03–07 của plan 2015 trước khi thi công đợt A phase 03+.

## Câu hỏi chưa chốt

1. Phiên đang cook 1933 là ai, tới đâu? (VoiceRecorder/VoiceMessagePlayer untracked gợi ý phase 02 đã bắt đầu.)
2. `260513` wiki + `260610` SP1 có còn muốn làm không, hay archive?
3. Auth cutover Phase 3 (260710) ràng buộc "web+mobile cùng đợt" — NODIE đã chạy Supabase Auth sẵn; ràng buộc này còn nghĩa gì cho web?
