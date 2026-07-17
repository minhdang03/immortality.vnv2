# Phase 05 — Accessibility AA: contrast + hit target + matrix test

**Audit:** P1-01 (contrast fail: `inkMuted` 3.91:1, `inkFaint` 2.59:1, `sunDim` 2.79:1 — cần 4.5:1 text nhỏ), P1-02 (☀ ▲ Trả lời follow Huỷ/Đổi/tag chip <44pt), P1-07 (chưa test largest Dynamic Type / VoiceOver / Bold Text / Increase Contrast) + medium (avatar chữ cái chưa `accessibilityHidden`).
**Chuẩn:** FB/IG đạt AA và 44pt toàn bộ; a11y có regression test, không audit tay một lần rồi thôi.
**Model:** Opus (fast) — spec đo được bằng số (contrast ≥4.5:1, hit ≥44pt), sửa token + áp helper `expandedHitArea` có sẵn; việc cơ khí, verify bằng đo lại.

## Files

- Sửa: `DesignSystem/NodieColors.swift` (token đậm hơn), các view dùng ☀/▲/Trả lời/follow/chip: `AnswerCardView.swift`, `AnswerReplyRow.swift`, `InlineReplyField.swift`, `QuestionDetailView.swift`, `FriendsView.swift`, `MemberProfileView.swift`, `AskQuestionView.swift`
- Tạo: `NODIEUITests/AccessibilityUITests.swift`

## Steps

1. **Contrast:** tính lại 3 token trên nền kem thật (không phải trắng thuần): `inkMuted` ≥4.5:1, `inkFaint` — nếu chỉ dùng cho glyph/decorative ≥18pt thì 3:1 đủ, còn dùng cho text nhỏ thì nâng ≥4.5:1 hoặc đổi chỗ dùng sang `inkMuted` mới; `sunDim` trên trắng ≥4.5:1 (đậm màu hoặc thêm nền). Đổi TOKEN, không đổi từng chỗ — giữ nguyên tắc không rải hex (audit khen). Chụp trước/sau các màn chính để Đăng duyệt vì đây là đổi diện mạo.
2. **Hit target:** áp `expandedHitArea` (helper đã có — audit ghi back/attach/mic/send đã đạt) cho: nút ☀, ▲, "Trả lời", follow/unfollow, Huỷ/Đổi, tag chip, clear search. Quy tắc: visual giữ nguyên, vùng chạm ≥44×44.
3. **Avatar decorative:** `accessibilityHidden(true)` cho avatar chữ cái ở mọi row (Conversation/Friends/QA) — tên đã được đọc từ label chính, tránh VoiceOver đọc lặp "M, Minh…".
4. **Quét `lineLimit(1)`:** tên/bio/chat preview — cho phép 2 dòng ở largest size hoặc chấp nhận truncation CÓ chủ đích (ghi lại); không để mất nội dung nghĩa.
5. **AccessibilityUITests:** (a) traversal VoiceOver các màn chính — mọi control có label, thứ tự hợp lý (assert qua accessibility tree); (b) largest accessibility Dynamic Type — launch arg content size category, assert control chính vẫn hittable, không clip mất nút; (c) hit-area regression cho danh sách nút mục 2 (mở rộng test 44pt sẵn có thay vì suite mới nếu tiện).
6. **Kiểm tay 1 vòng:** Bold Text + Increase Contrast bật — ghi kết quả vào report phase (2 setting này khó automate, chấp nhận manual có ghi chép).

## Validation

- Đo lại contrast bằng công thức WCAG trên token mới: 3 giá trị đạt ngưỡng, ghi số vào report.
- AccessibilityUITests xanh và nằm trong gate phase 04 (chạy cùng suite, cùng luật 3× xanh).
- VoiceOver không đọc lặp avatar; largest size không mất nút nào.

## Risks

- Token đậm hơn đổi cảm giác editorial kem/mực — cần Đăng nhìn screenshot trước khi merge; nếu chê, giải pháp thay thế là tăng cỡ chữ meta lên ≥18pt (glyph lớn chỉ cần 3:1) thay vì đậm màu.
