# Phase 05 + 07 + 08 — a11y AA, trust copy, release gate

**Ngày:** 19/07/2026 · **Plan:** `260717-1933-production-readiness-superapp-standard`
**Phạm vi:** phase 05 (accessibility AA) · phase 07 (trust & error UX) · phase 08 (release gate, phần tự động hoá được)

---

## Tóm tắt

| Phase | Trạng thái | Bằng chứng |
|---|---|---|
| 05 a11y AA | ✅ | 4 token đạt ngưỡng (đo lại độc lập), 12/12 test xanh |
| 07 trust copy | ✅ | copy "AI" sạch, banner tự hại có test, 6 key dịch đủ 8 ngôn ngữ |
| 08 release gate | ⚠️ một phần | gate 3× + docs xong; máy thật/TestFlight/screenshots phải Đăng bấm |

**Phát hiện đắt nhất:** plan viết 17/07 đã LỖI THỜI ở phase 07 — `NodieErrorKind.swift` (89 dòng,
7 nhánh) đã tồn tại sẵn và đã nối vào QAStore/FollowStore/FriendsView. Bước 2 của phase file coi
như xong từ trước; làm lại là phá code đang chạy. **Đọc code trước khi đọc plan.**

---

## Phase 05 — Accessibility AA

### Contrast: đổi TOKEN, không rải hex

Đo bằng công thức WCAG trên **nền kem thật `#FAF7F0`**, không phải trắng thuần (đo trên trắng
cho số đẹp hơn thực tế ~7%, đủ để tưởng đạt trong khi thật ra trượt).

| Token | Cũ | Mới | Trước | Sau | Ngưỡng |
|---|---|---|---|---|---|
| `inkSoft` | `#6D5F45` | `#60533D` | 5.82:1 | **7.00:1** | — |
| `inkMuted` | `#8A7A5C` | `#6F624A` | 3.91:1 | **5.57:1** | 4.5:1 |
| `inkFaint` | `#A99A78` | `#7C7158` | 2.59:1 | **4.50:1** | 4.5:1 |
| `sunDim` | `#C69214` | `#B88713` | 2.61:1 | **3.01:1** | 3:1 |

Hai chỗ ĐI KHÁC phase file, có lý do:

1. **`sunDim` chỉ cần 3:1, không phải 4.5:1.** Grep ra nó dùng đúng MỘT chỗ —
   `QAActionButtons.swift:25`, glyph ☀. WCAG non-text contrast = 3:1. Ép lên 4.5:1 là mất sắc
   "vàng trầm" mà không đổi lấy gì.

2. **Phải đổi thêm `inkSoft` dù audit không nêu.** AA buộc text nhỏ ≥4.5:1, mà `inkSoft` cũ chỉ
   5.82:1 ⇒ nâng `inkMuted` + `inkFaint` lên 4.5 là ba bậc mực dưới cùng dồn hết vào dải
   4.5–5.82, nhìn như một màu. Đó là thứ bậc giả. Giãn cả thang mới giữ được bước thật:

   ```
   ink 15.72 → inkBody 9.18 → inkSoft 7.00 → inkMuted 5.57 → inkFaint 4.50
   bước:          1.71×          1.31×          1.26×          1.24×
   ```
   Hue + saturation giữ nguyên, chỉ hạ value ⇒ vẫn đúng tông be/mực Aion v3.

### Hit target + VoiceOver

- `expandedHitArea` áp cho ☀/▲/Trả lời/follow/Huỷ/Đổi/tag chip/clear search (visual giữ nguyên).
- Avatar chữ cái `accessibilityHidden(true)` — hết đọc lặp "M, Minh…".
- Test mới: `AccessibilityUITests` (5) + `TouchTargetUITests` mở rộng (+4).

### Một bug thật do test bắt được

`testQuestionDetailActionsHittableAtLargestDynamicType` đỏ ngay lần chạy đầu. Đã đi SAI hai lần
trước khi lấy số đo:

- Giả thuyết 1 (sai): vùng chạm chồng nhau — mỗi nút nới 16pt/bên ((44−12)/2) mà khoảng cách chỉ
  `xl`=20pt ⇒ chồng 12pt, nút sau đè nút trước. Sửa bằng `ViewThatFits` xuống hai hàng → **vẫn đỏ**.
- Số đo thật: `nút=(170, 1631, 155, 75)` · `cửa sổ=(0, 0, 402, 874)`.
  ⇒ Nút nằm ở y=1631 trong cửa sổ cao 874 — **dưới nếp gấp**, không phải bị đè. Và `x+w=325 < 402`
  nên hàng VẪN vừa chiều ngang ở cỡ chữ lớn nhất ⇒ nhánh hai hàng không bao giờ chạy, là code chết.
- Đã **revert** `ViewThatFits`. Lỗi thuộc về TEST: nó assert `isHittable` mà không cuộn tới.
  `exists` ≠ `isHittable` — XCUITest dựng cả cây kể cả phần ngoài màn.
- Sửa đúng: thêm `XCUIApplication.scrollUntilHittable(_:maxSwipes:)` vào `NodieUITestSupport`.
  Vẫn giữ ý nghĩa: nút bị clip/kẹt ngoài vùng cuộn thì cuộn mấy cũng không hittable, test vẫn đỏ đúng.

**Ghi lại vì sẽ gặp lại:** ở cỡ Dynamic Type lớn nhất mọi thứ dưới nếp gấp trôi rất sâu; assert
thẳng `isHittable` là đỏ oan. Luôn cuộn tới trước.

**Vùng chạm vẫn chồng nhau 12pt** (16+16 vào khe 20pt) — có thật, nhưng KHÔNG phải nguyên nhân của
lỗi trên và chưa có bằng chứng nó gây lỗi cho người dùng. Sửa phải đổi `NodieSpacing.xl` = đổi diện
mạo ⇒ **để Đăng quyết**, không tự đổi token khoảng cách của prototype.

---

## Phase 07 — Trust & error UX

### Copy "AI" — rủi ro App Store/FTC, đã gỡ

Cơ chế thật là regex 5 nhóm từ khoá (`fieldRules`), không có mô hình nào.

| Trước | Sau |
|---|---|
| "AI đọc câu hỏi & xếp vào" | "Gợi ý theo từ khoá" |
| "AI tự nhận" | (bỏ) |
| "AI sẽ tự nhận lĩnh vực khi bạn gõ câu hỏi." | "Gợi ý xếp lĩnh vực sẽ hiện theo từ khoá bạn gõ." |

Biến `aiConfident`/`aiCard` cũng đổi tên — code thôi nói dối. 3 key "AI" cũ (kèm bản dịch 8 ngôn
ngữ) đã rời `Localizable.xcstrings`.

### Error taxonomy + offline

- `NodieErrorKind` (**đã có sẵn**) nay nối thêm vào `ConversationStore`.
- `NodieNetworkMonitor` — MỘT `NWPathMonitor` dùng chung toàn app, `@Observable`, cập nhật trên
  main actor. Mọi nút "Thử lại" `.disabled(!isOnline)` ở Chat/ConversationList/Friends.
- Giữ nguyên hành vi đúng sẵn có ở `ConversationStore` (lỗi gửi thuộc về đúng một bong bóng,
  không gỡ tin, không bắn alert gốc).

### Safety tự hại — có test, không chặn gửi

`SelfHarmSupportBanner` + `SelfHarmKeywordDetector`: regex client-side, **không gọi mạng, không log
nội dung**. Không chặn gửi, không phán xét (chuẩn FB/IG cho mạng xã hội).

Test mới `TrustUXUITests` (3) — tính năng an toàn không có test là tính năng sẽ chết lặng lẽ ở lần
refactor sau:
- khớp từ khoá → banner hiện, **nút gửi vẫn bấm được**
- câu bình thường → không banner (mặt đối chứng, chống dương tính giả)
- không nhãn "AI" nào trong luồng soạn

**Bẫy tự gây khi viết test:** dùng `CONTAINS[c] "AI"` → đỏ oan, vì so khớp KHÔNG phân biệt hoa
thường khớp luôn chữ "ai" trong tiếng Việt ("loại", "ngoài", "hai", "phải"). Đổi sang
`MATCHES ".*\bAI\b.*"` (phân biệt hoa thường). **Suýt "sửa" code đang đúng vì test sai.**

Không còn disclaimer y khoa nào ngoài Điều khoản (grep sạch; `MedicalSafetyFooter` không tồn tại).

---

## Phase 08 — Release gate

### `EXPECTED_TESTS` 38 → 50

Gate đếm cứng số test để một suite lặng lẽ không chạy không trôi qua dưới dạng "xanh". Ba phase này
thêm 12 test (5 a11y + 4 touch target + 3 trust) ⇒ **38 sẽ làm gate đỏ với `tests=50/38`**.
Đã sửa hằng số + ghi rõ vì sao. Thêm/bớt test sau này phải sửa số này, đừng nới điều kiện.

### i18n

`Localizable.xcstrings`: 307 key · base tiếng Việt + 8 bản dịch (= "9 ngôn ngữ").

6 key SỐNG còn thiếu bản dịch — chính là chuỗi error taxonomy mới của phase 07 (bước i18n của
phase đó chưa làm xong). Đã dịch đủ 8 ngôn ngữ:
`Không có kết nối…` · `Máy chủ đang trục trặc…` · `Nội dung này không còn nữa.` ·
`Phiên đăng nhập đã hết hạn…` · `Bỏ tệp` · `Không tải được ảnh`

Cách làm: **splice văn bản** — thay đúng khối rỗng `"KEY" : {\n\n    }` của từng key, có backup +
validate JSON trước khi ghi. KHÔNG `json.dump` cả file (round-trip xáo thứ tự key, biến 6 key thành
diff vài nghìn dòng). Kiểm sau khi ghi: 307 key nguyên vẹn, không đảo thứ tự.

11 key còn thiếu đều thuộc **Bảng tin/Hành trình** — hai tab đã rút khỏi tab bar, chạy MockData,
không ship v1. Trong đó có `'✦ AI: '` (`JourneyView.swift:74`) — còn là copy "AI" nhưng người dùng
v1 không chạm tới. **Phải xử trước khi mở lại hai tab đó.**

### Docs

Tạo `docs/nodie-ios-v1-scope-release-notes.md`: phạm vi v1 (Light Mode · portrait · iPhone-only ·
2 tab ẩn) + release notes TestFlight dán thẳng + bảng contrast + việc còn lại.

⚠️ `docs/store-submit-checklist.md` **đã lỗi thời** — mô tả Capacitor (`npx cap sync android`) và
Google Play, cả hai không còn tồn tại. Chưa sửa (ngoài phạm vi), đã cảnh báo trong file mới.

---

## Việc chỉ Đăng làm được

- [ ] **iPhone thật** — camera/mic/push chỉ test được trên máy thật
- [ ] **Bold Text · Increase Contrast · Reduce Motion** — không automate được, kiểm tay
- [ ] **Nhìn duyệt màu mới** trên các màn chính (đây là đổi diện mạo, dù đã đo đạt AA)
- [ ] Archive → altool → TestFlight, smoke test trước khi mời tester
- [ ] Screenshots App Store — làm SAU CÙNG, sau khi chốt token contrast
- [ ] App Privacy labels · age rating · demo account (KHÔNG dùng `an.nodie.test`) · SMTP thật

---

## Câu hỏi chưa giải quyết

1. **Vùng chạm chồng nhau 12pt** ở hàng ☀/▲/Trả lời — sửa cần đổi `NodieSpacing.xl` (20→32),
   tức đổi diện mạo. Đăng quyết: giữ nguyên hay giãn?
2. **Ma trận thiết bị nhỏ/lớn** (iPhone SE class + 17 Pro Max simulator) — phase 08 mục 2 yêu cầu,
   chưa chạy trong phiên này. Chạy tiếp hay gộp vào lượt kiểm tay của Đăng?
3. **`'✦ AI: '` ở JourneyView** — để nguyên (tab đang ẩn) hay dọn luôn cho sạch?
4. Tên test + comment nội bộ vẫn còn chữ "AI" (`testAskQuestionAiChangeButtonHitTarget`). Không
   phải copy người dùng thấy ⇒ không có rủi ro duyệt app. Dọn hay để?
