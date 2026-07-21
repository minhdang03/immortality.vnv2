# Phase 04 — Swift bắt lỗi rate-limit + chuỗi xcstrings

**Model:** **Opus (fast)** — cơ khí, spec rõ: thêm 1 case enum + khớp chuỗi + thêm key xcstrings. Bẫy duy nhất là xcstrings (đã ghi cách xử lý).

## Context Links
- `DesignSystem/NodieErrorKind.swift` — enum phân loại lỗi; `of(_:)` khớp theo CHUỖI; đã có `.slowMode` (khớp `slow_mode`).
- `Features/Conversations/ConversationStore.swift:521-586` — `send()` catch → `errorMessage = ErrorText.localized(error)`.
- `Features/QA/QAStore.swift` (nhiều chỗ) — catch → `errorMessage = ErrorText.localized(error)`.
- `Features/Conversations/MessageComposer.swift` — đường gõ/gửi tin.
- `Localizable.xcstrings` — **CẤM json round-trip; phải splice text** (bài học `[project_nodie_xcstrings_build_marks_stale]`).
- Phase 02 report — **chuỗi lỗi THẬT** PostgREST trả (khớp đúng cái này, không đoán).

## Overview
- **Priority:** P2. **Status:** pending (blocked by 02; song song 03).
- Thêm `NodieErrorKind.rateLimited` khớp chuỗi `rate_limit`, message thân thiện "Bạn thao tác quá nhanh, chờ chút nhé". Vì `ErrorText.localized` + `errorMessage` đã chảy qua `NodieErrorKind`, các đường gửi (chat/Q&A) **tự động** hiện đúng câu — không sửa từng store.

## Key Insights
- Kiến trúc lỗi đã tập trung: chỉ cần thêm case + nhánh khớp chuỗi ở `of(_:)` là mọi call-site (`ErrorText.localized`, `NodieErrorKind.of`) hưởng ngay → DRY, không rải try/catch mới.
- Đặt nhánh `rate_limit` **TRƯỚC** `slow_mode`? Không cần — hai chuỗi khác nhau; nhưng đặt `rate_limit` trước nhánh `permission`/`check` chung để tránh nuốt. `check_violation` không nằm trong danh sách permission hiện tại nên an toàn; vẫn để `rate_limit` sớm cho chắc.
- `isRetryable = true` (chờ chút là gửi được), `needsReauth = false`.

## Requirements
### Functional
- `case rateLimited` trong `NodieErrorKind`.
- `of(_:)`: `if raw.contains("rate_limit") { return .rateLimited }` — đặt cạnh nhánh `slow_mode` (dòng ~44).
- `message`: câu tiếng Việt thân thiện, `String(localized:)`.
- `isRetryable`: thêm `.rateLimited` vào nhánh true.
- Chuỗi mới vào `Localizable.xcstrings` (9 ngôn ngữ; ít nhất VI + EN, còn lại theo cơ chế key=literal hiện có).

### Non-functional
- KHÔNG json round-trip xcstrings — splice text thêm entry, giữ `extractionState` nhất quán các key khác (bài học stale).

## Architecture — data flow
```
POST insert bị trigger raise ─► supabase-swift throw error (chuỗi chứa 'rate_limit')
   store.catch ─► ErrorText.localized(error) = NodieErrorKind.of(error).message
                   └─ of() thấy 'rate_limit' → .rateLimited
   errorMessage = "Bạn thao tác quá nhanh, chờ chút nhé." ─► alert/UI hiện câu thân thiện
```

## Related Code Files
- Modify: `DesignSystem/NodieErrorKind.swift` (case + of + message + isRetryable).
- Modify: `Localizable.xcstrings` (splice key mới).
- Không cần sửa ConversationStore/QAStore (đã chảy qua NodieErrorKind) — XÁC NHẬN bằng grep call-site trước khi kết luận.

## Implementation Steps
1. Đọc chuỗi lỗi THẬT từ Phase 02 report; xác nhận nó chứa `rate_limit` (nếu PostgREST đổi thành hint/details, chỉnh `of()` đọc đúng field — hoặc yêu cầu Phase 01 sửa cách raise).
2. Thêm `case rateLimited` + nhánh `of()`:
   ```swift
   if raw.contains("rate_limit") { return .rateLimited }   // đặt ngay trên dòng slow_mode
   ```
3. `message`: `case .rateLimited: return String(localized: "Bạn thao tác quá nhanh, chờ chút nhé.")`
4. `isRetryable`: thêm `.rateLimited` vào nhánh `return true`.
5. Splice key `"Bạn thao tác quá nhanh, chờ chút nhé."` vào `Localizable.xcstrings` (VI source + EN translation, theo khuôn key hiện có).
6. Grep xác nhận đường chat/Q&A đều đi qua `ErrorText.localized`/`NodieErrorKind.of` (không có đường nào nuốt lỗi thô trước đó).
7. Build.

## Todo
- [x] Lấy chuỗi lỗi thật (Phase 02)
- [x] case rateLimited + of() + message + isRetryable
- [x] xcstrings key mới (splice, không round-trip)
- [x] Grep xác nhận send-path chat/Q&A dùng NodieErrorKind
- [x] Build xanh

## Success Criteria
- Trên simulator/máy: user thường spam gửi tin → sau ngưỡng hiện "Bạn thao tác quá nhanh, chờ chút nhé." (không phải câu "Có lỗi xảy ra" thô).
- Q&A spam (nếu flag mở cho tài khoản test) → cùng câu.
- `xcodebuild` xanh; không key xcstrings nào bị đánh stale oan (kiểm sau build).

## Risk Assessment
| Rủi ro | Khả năng | Tác động | Giảm thiểu |
|---|---|---|---|
| PostgREST không đưa chuỗi `rate_limit` tới client | Trung bình | Cao | Phase 02 đã đo chuỗi thật; nếu khác, khớp đúng field hoặc sửa cách raise (Phase 01) |
| xcstrings json round-trip làm stale 15 key | Trung bình | Trung bình | Splice text tay, giữ extractionState; kiểm HEAD diff sau build |
| Có đường gửi nuốt lỗi thô (không qua NodieErrorKind) | Thấp | Trung bình | Grep bước 6; nếu có, đưa về ErrorText.localized |
| `rate_limit` khớp nhầm nội dung khác | Rất thấp | Thấp | Chuỗi hiếm; đặt nhánh có chủ đích cạnh slow_mode |

## Security Considerations
- Không hiện chi tiết kỹ thuật (bảng/ngưỡng) cho user — chỉ câu thân thiện.

## Next Steps
- Hội tụ Phase 05: build + UITest + review cùng nhánh Phase 03.

## Unresolved
- Q5: Có cần phân biệt câu theo hành động (gửi tin vs đăng câu hỏi) không? Đề xuất KHÔNG (một câu chung, KISS) trừ khi Đăng muốn.
