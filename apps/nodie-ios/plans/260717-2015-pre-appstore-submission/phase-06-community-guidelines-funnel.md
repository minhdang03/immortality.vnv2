# Phase 06 — Nội quy cộng đồng + link đăng ký + funnel events

**Mục:** D-05 (P2 nội quy in-app) · A-05 phần code (P1 link Nội quy màn đăng ký) · B-02 phần call-site (P1 funnel) · **Đợt B** · Ước lượng **0.5 ngày** · Status: ⬜
**Model:** Opus (fast) — một màn tĩnh + vài call-site logger đã có sẵn writer (phase 04); việc cơ khí có spec rõ, verify cục bộ.

## Điều kiện tiên quyết

1. **Plan 1933 land** — đụng `LoginView` + `Localizable.xcstrings` (đua build).
2. **Phase 04 xong** — `AppEventLogger.log(kind:)` phải tồn tại thì funnel mới có chỗ ghi.

## Context links

- Report: `...-beyond-ux-audit-appstore-ops-report.md` (D-05, A-05, B-02)
- **A-05 phần in-app ĐÃ XONG** (plan.md đo lại): `LoginView.swift` đã có link Điều khoản ở màn đăng ký. Report ghi "chỉ nằm trong Profile" là SAI. **Việc còn lại của A-05 ở phase này = thêm link NỘI QUY** (khác Điều khoản) cạnh link đã có.
- Nội quy = bản ngắn gọn dễ đọc của mục 2 `TermsOfUseView` ("Quy tắc cộng đồng"), KHÔNG phải toàn văn Điều khoản.
- `AppEventLogger` (phase 04) — đường ghi `app_events`.

## Overview

Ba việc nhỏ, cùng đợt B:
1. **Màn Nội quy cộng đồng** in-app — 1 màn tĩnh, đọc trong 30 giây (Apple 1.2 muốn guidelines user THẤY được).
2. **Link Nội quy ở màn đăng ký** — cạnh link Điều khoản đã có.
3. **Funnel events** — rải `AppEventLogger.log` ở các mốc: xem đăng ký, đăng ký thành công, đăng nhập, đăng câu hỏi/trả lời/tin đầu tiên. Tối thiểu, đo DAU/retention/funnel cho <10k user.

## Key insights

- **Nội quy ≠ Điều khoản.** Điều khoản (`TermsOfUseView`) là văn bản pháp lý 6 mục. Nội quy là **rút gọn phần "Quy tắc cộng đồng"** thành gạch đầu dòng dễ nuốt. Đừng nhân đôi toàn văn — DRY: nội quy trích ý, link "đọc đầy đủ" trỏ về Điều khoản.
- **Funnel không được là engagement metric công khai.** Ghi vào `app_events` (chỉ admin đọc) — khớp triết lý "không metric trên NGƯỜI ở UI". Không hiện số cho user.
- **Ghi funnel best-effort** — `AppEventLogger` đã nuốt lỗi + guard session. Chỉ gọi `log(kind:)` ở đúng chỗ, không thêm logic.
- **i18n:** màn nội quy + link đủ 9 ngôn ngữ — nhưng **phần chữ pháp lý giữ tiếng Việt** như Điều khoản (nhất quán quyết định của `TermsOfUseView`). Chỉ chrome/nhãn dịch.

## Files

**Tạo**
- `NODIE/Features/Profile/CommunityGuidelinesView.swift` — màn tĩnh, khuôn giống `TermsOfUseView` (header + section), nội dung rút gọn.

**Sửa**
- `NODIE/Auth/LoginView.swift` — thêm link "Nội quy cộng đồng" cạnh link Điều khoản (chỉ ở nhánh `isSignUp`).
- `NODIE/Auth/AuthStore.swift` — `log("signup_success")` sau signup ok, `log("signin_success")` sau signin ok.
- Call-site đăng nội dung lần đầu: `QAStore` (đăng câu hỏi/trả lời), `ConversationStore` (gửi tin) — `log("first_question")`/`log("first_message")` hoặc `log("post_question")` tuỳ mức chi tiết. **YAGNI: chọn ít mốc thật sự cần, đừng rải khắp nơi.**
- `NODIE/Localizable.xcstrings` — chuỗi mới cho màn nội quy + nhãn link.

**Xoá:** không

> Sửa `Localizable.xcstrings` là **splice text, cấm json round-trip** (bẫy đã trả giá — 1 build đánh 15 key stale). Thêm key với `extractionState: "manual"` nếu key dựng runtime.

## Implementation steps

1. **`CommunityGuidelinesView`:** copy khuôn `TermsOfUseView` (header `EyebrowLabel` + `section()`); nội dung = 5-7 gạch đầu dòng rút từ mục 2 Điều khoản (không quấy rối/thù ghét/khiêu dâm/spam/mạo danh; báo cáo & chặn; nội dung sức khoẻ chỉ để chia sẻ). Cuối màn: link "Đọc Điều khoản đầy đủ" → `TermsOfUseView`.
2. **LoginView:** ở nhánh đăng ký, thêm dòng link "Nội quy cộng đồng" mở `CommunityGuidelinesView` (sheet/push theo pattern link Điều khoản đang dùng — đọc đoạn đó trước, bám đúng).
3. **Funnel:** thêm `AppEventLogger.log(kind:)` ở: `signUp` success, `signIn` success, đăng câu hỏi/trả lời đầu, gửi tin đầu. Payload tối thiểu (`{}` hoặc `{"lang": "vi"}`) — **không PII**.
4. **i18n:** thêm chuỗi 9 ngôn ngữ cho nhãn/chrome; giữ thân nội quy tiếng Việt.
5. `xcodegen generate` (file mới) → build (hẹn cửa sổ, tránh đua) → chạy tay + kiểm row `app_events`.

## Todo

- [ ] `CommunityGuidelinesView` (khuôn TermsOfUseView, nội dung rút gọn + link đọc đầy đủ)
- [ ] Link Nội quy ở màn đăng ký (cạnh link Điều khoản đã có)
- [ ] Funnel: signup/signin/post đầu → `AppEventLogger.log`
- [ ] i18n nhãn/chrome 9 ngôn ngữ, thân giữ tiếng Việt
- [ ] xcstrings splice text (không round-trip)
- [ ] Build xanh + verify row `app_events` các kind funnel

## Success criteria

1. Màn đăng ký có **2 link**: Điều khoản (đã có) + Nội quy cộng đồng (mới), cả hai mở được.
2. `CommunityGuidelinesView` đọc trong ~30s, có link về Điều khoản đầy đủ.
3. Đăng ký/đăng nhập/đăng bài đầu → xuất hiện row `app_events` đúng `kind` (kiểm bằng admin):
   ```sql
   select kind, count(*) from public.app_events group by kind order by 2 desc;
   ```
4. Không hiện metric funnel nào cho user ở UI.
5. i18n: đổi ngôn ngữ UI → nhãn link đổi, thân nội quy vẫn tiếng Việt (nhất quán Điều khoản).

## Risks + rollback

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Round-trip `Localizable.xcstrings` đánh oan key stale | Cao | Splice text tay, `extractionState: manual` cho key runtime |
| Nhân đôi toàn văn Điều khoản vào Nội quy | Thấp | Nội quy chỉ trích ý + link "đọc đầy đủ" (DRY) |
| Rải funnel quá nhiều → nhiễu + payload thừa | Thấp | YAGNI: vài mốc thật cần; payload rỗng |
| Funnel lộ thành metric công khai | Thấp | `app_events` chỉ admin đọc; không render cho user |
| Đua build `xcstrings` với phiên khác | Trung bình | Hẹn cửa sổ; đợt B chạy sau 1933 land |

**Rollback:** gỡ `CommunityGuidelinesView` + revert link ở LoginView + gỡ các `log()` call. Không migration; `app_events` tự bỏ trống các kind funnel.

## Next

→ Phase 07: Đăng khai age rating (UGC + chat thường ra 17+) và xác nhận moderation đủ; nội quy + link này là bằng chứng "guidelines user thấy được" cho Apple 1.2.
