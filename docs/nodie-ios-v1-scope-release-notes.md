# NODIE iOS v1 — phạm vi & release notes TestFlight

**Cập nhật:** 19/07/2026 · **Nguồn:** plan `260717-1933-production-readiness-superapp-standard` phase 08

Mục đích: tester TestFlight biết cái gì CỐ Ý chưa có, để không báo "bug" cho thứ đã chốt nằm ngoài v1.

---

## Phạm vi v1 (Đăng chốt 17/07/2026)

| Khía cạnh | v1 | Ghi chú |
|---|---|---|
| Giao diện | **Chỉ Light Mode** | Dark mode → backlog v1.1 |
| Hướng màn | **Chỉ portrait** | Landscape → backlog v1.1 |
| Thiết bị | **Chỉ iPhone** | Chưa có layout iPad |
| Nền tảng | **Chỉ iOS** | Android chưa từng được dựng — xem `CLAUDE.md` mục "Nền tảng" |

**Tab đang ẩn khỏi tab bar** (`NodieTab.visibleTabs`): **Bảng tin** và **Hành trình**.
Hai tab này còn chạy MockData, chưa nối nguồn thật ⇒ cố ý giấu, không phải lỗi.

---

## Release notes TestFlight (dán thẳng)

```
NODIE 1.0 — bản thử nghiệm

Có gì trong bản này:
· Hỏi đáp — đặt câu hỏi, trả lời, reply lồng, ☀ thả ánh sáng, ▲ hữu ích
· Chat — kênh & tin nhắn riêng, ảnh/tệp/tin thoại, reaction, reply
· Bạn bè — theo dõi, hồ sơ thành viên, tìm người
· Cá nhân — đóng góp của tôi, đã lưu, cài đặt

Phạm vi bản này (cố ý, không phải lỗi — xin đừng báo):
· Chỉ giao diện Sáng (Light Mode)
· Chỉ hướng dọc (portrait)
· Chỉ iPhone, chưa có iPad
· Tab "Bảng tin" và "Hành trình" tạm ẩn — đang chờ nguồn dữ liệu thật

Mong bạn báo giúp:
· Chỗ nào bấm không ăn, hoặc bấm rồi không thấy gì xảy ra
· Chữ bị cắt/đè khi bạn phóng to cỡ chữ hệ thống
· Ảnh/tin thoại gửi hỏng, hoặc gửi rồi người kia không nhận được
· Bất kỳ câu báo lỗi nào đọc không hiểu
```

---

## Trạng thái accessibility (phase 05)

Đã đo và đạt, KHÔNG phải tự nhận:

| Token | Cũ | Mới | Tỉ lệ tương phản trên nền kem `#FAF7F0` |
|---|---|---|---|
| `inkSoft` | `#6D5F45` | `#60533D` | 5.82 → **7.00:1** |
| `inkMuted` | `#8A7A5C` | `#6F624A` | 3.91 → **5.57:1** |
| `inkFaint` | `#A99A78` | `#7C7158` | 2.59 → **4.50:1** |
| `sunDim` | `#C69214` | `#B88713` | 2.61 → **3.01:1** |

- Ngưỡng WCAG AA: text nhỏ ≥4.5:1 · glyph/non-text ≥3:1.
- `sunDim` chỉ dùng cho glyph ☀ (`QAActionButtons.swift`) nên đích là 3:1, không phải 4.5:1.
- `inkSoft` phải đổi theo dù audit không nêu: giữ nguyên thì ba bậc mực dưới cùng dồn vào dải
  4.5–5.82 và gần như trùng nhau — thứ bậc giả. Giãn cả thang mới còn bước nhìn ra được.
- Vùng chạm ≥44×44 (`expandedHitArea`), có test hồi quy: `TouchTargetUITests`.
- VoiceOver + cỡ chữ lớn nhất: `AccessibilityUITests`.

**Chưa tự động hoá được — phải kiểm tay:** Bold Text, Increase Contrast, Reduce Motion.

---

## Còn lại trước khi mời tester ngoài

Việc chỉ Đăng bấm được (không tự động hoá từ máy phát triển):

- [ ] Chạy trên **iPhone thật** — camera, mic, push chỉ test được trên máy thật
- [ ] Archive → altool → TestFlight (xem pipeline trong plan `260716`)
- [ ] Screenshots App Store — làm **sau cùng**, sau khi token contrast đã chốt
- [ ] App Privacy labels · age rating · demo account (KHÔNG dùng `an.nodie.test`) · SMTP thật
- [ ] Bật captcha Turnstile trước khi mở public link (plan `260717-2015` phase 05)

---

## Cảnh báo tài liệu cũ

`docs/store-submit-checklist.md` **đã lỗi thời**: nó mô tả Capacitor (`npx cap sync android`,
`capacitor.config.json`) và Google Play. Cả hai đều không còn — Capacitor gỡ 17/07/2026, Android
chưa từng được dựng. Đừng làm theo file đó cho lần submit này; dùng file này + `CLAUDE.md`.
