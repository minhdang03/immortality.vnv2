# Phase 07 — Trust & error UX: AI copy thật thà, safety tự hại, error taxonomy

**Audit:** P1-03 ("AI đọc câu hỏi" thực chất regex 5 nhóm keyword — vấn đề trust), P1-06 (alert "Lỗi" chung chung ở root, không phân loại, không Retry), P1-08 (thiếu guardrail).
**ĐÃ CHỐT (Đăng 17/07 19:41): NODIE là MẠNG XÃ HỘI** — P1-08 giải theo chuẩn safety FB/IG cho social network (banner hỗ trợ tự hại), KHÔNG theo hướng app y tế (bỏ disclaimer y khoa rải trong flow — audit viết mục đó trên tiền đề "app sức khoẻ" nay không còn đúng).
**Chuẩn:** X/FB — lỗi phân loại + hành động tại chỗ; big app không gọi thứ-không-phải-AI là AI (FTC + App Store review risk); FB/IG hiện tài nguyên hỗ trợ khi phát hiện nội dung tự hại.
**Model:** Opus (fast) — copy + error taxonomy theo quyết định đã chốt (mạng xã hội, không compliance y khoa); spec rõ, ít bẫy backend.

## Files

- Sửa: `AskQuestionView.swift` (copy detectedTag + banner tự hại), `QAStore.swift` + `ConversationStore.swift` (error mapping), `Localizable.xcstrings`
- Tạo: `NODIE/DesignSystem/NodieErrorKind.swift` (taxonomy + map), `NODIE/Features/QA/SelfHarmSupportBanner.swift`

## Steps

1. **AI copy:** đổi mọi copy "AI đọc/AI tự nhận" quanh `detectedTag` → "Gợi ý tự động theo từ khoá". Giữ regex (nó hoạt động ổn cho 5 nhóm) — vấn đề là NHÃN, không phải cơ chế. Classifier thật = backlog, không chặn ship.
2. **Error taxonomy:** enum `NodieErrorKind { offline, auth, permission, notFound, server, unknown }` + hàm map từ `URLError`/`PostgrestError`/HTTP status. Message người-hiểu-được cho từng loại ("Không có kết nối — thử lại khi có mạng" ≠ "Lỗi").
3. **Hiển thị tại chỗ thay alert root:** list đang rỗng → error state trong màn + Thử lại (pattern QA sẵn có); hành động lẻ (gửi tin, follow, vote) → toast/inline kèm retry per-action (chat đã có draft-giữ-lại — mở rộng tinh thần đó). Auth expired → điều hướng đăng nhập lại, không toast vô dụng. Alert root chỉ còn cho unknown thật sự.
4. **Offline banner:** `NWPathMonitor` → banner mảnh "Không có kết nối" trên cùng (chuẩn IG/X), tự ẩn khi có mạng lại. Gate mọi retry button khi offline.
5. **Safety tự hại (chuẩn FB/IG cho mạng xã hội):** compose khớp nhóm keyword tự hại → `SelfHarmSupportBanner` không chặn, không phán xét: "Nếu bạn đang gặp khó khăn, có người sẵn sàng lắng nghe — gọi 115 (VN) / Lifeline 13 11 14 (AU)." Dùng regex client-side (cùng cơ chế detectedTag) — không network call, không log nội dung. KHÔNG block gửi, KHÔNG disclaimer y khoa rải màn (positioning mạng xã hội — giữ Điều khoản là đủ).
6. i18n 9 ngôn ngữ toàn bộ copy mới; hotline theo locale nếu nhanh, không thì ghi cả hai.

## Validation

- Airplane mode: mỗi màn chính hiện offline UX đúng, không alert "Lỗi" trống; có mạng lại → banner biến mất, retry hồi phục.
- Compose có nội dung tự hại → banner hỗ trợ hiện, vẫn gửi được; câu hỏi bình thường → không banner.
- Grep không còn copy "AI" quanh tag suggestion; không còn disclaimer y khoa nào ngoài Điều khoản.
