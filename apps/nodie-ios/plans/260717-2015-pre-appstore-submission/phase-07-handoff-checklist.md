# Phase 07 — Checklist bàn giao Đăng (việc console, không phải code)

**Mục:** A-03 (App Privacy labels) · A-04 (demo account) · A-06 (screenshots/metadata) · C-01 (SMTP thật) · C-03 (backup — chỉ ghi nhận) · **Không đợt** · Ước lượng **0.5 ngày (Đăng bấm)** · Status: ⬜
**Model:** — (không code). Đây là danh sách Đăng tự làm trên App Store Connect / Supabase / Apple Developer. Claude Code chỉ soạn checklist + verify được phần nào bằng HTTP/psql.

## Context links

- Report: `...-beyond-ux-audit-appstore-ops-report.md` (A-03, A-04, A-06, C-01, C-03)
- Nguồn sự thật cho App Privacy labels: `apps/web/src/pages/info/PrivacyPage.jsx` (phase 01) — **khai ASC theo đúng trang này**, Apple đối chiếu.
- A-06 screenshots làm **CUỐI CÙNG**, sau 1933 phase 05 (đổi contrast token) — chụp trước là chụp lại.

## Vì sao phase này tồn tại

5 mục này **chỉ Đăng làm được** — cần tài khoản Apple Developer / App Store Connect / quyền đổi Supabase Auth
config. Không phải việc code. Gom vào một checklist để lúc Submit không thiếu mục nào, và ghi rõ mục nào
**chặn Submit** vs mục nào **ghi nhận rủi ro**.

## Checklist

### A-03 — App Privacy labels (CHẶN Submit)

Khai trong ASC → App Privacy, **khớp đúng `PrivacyPage.jsx`**:

- [ ] **Contact Info → Email**: dùng để vận hành tài khoản. Không tracking.
- [ ] **User Content → Messages/Photos/Audio, Other (câu hỏi/trả lời)**: hiển thị nội dung. Không tracking.
- [ ] **Identifiers → Device ID (APNs token)**: chỉ để gửi thông báo. Không tracking.
- [ ] **Diagnostics**: crash/hang qua MetricKit (`app_events`, phase 04). Khai "App Functionality/Diagnostics", **không** linked to identity, **không** tracking.
- [ ] Xác nhận **không có ATT** (không tracking cross-app, không IDFA) — đúng như PrivacyPage nói.

> Apple đối chiếu labels ↔ Privacy Policy URL. Lệch = bắt lỗi. Sửa PrivacyPage thì sửa labels cùng lúc.

### A-04 — Demo account cho App Review (CHẶN Submit)

- [ ] Tạo account review **role='user'** riêng — **KHÔNG dùng `an.nodie.test`** (fixture UITest; reviewer làm bẩn data = suite đỏ).
- [ ] Account này phải thấy nội dung mồi (phase 03): ≥2 kênh + ≥5 câu hỏi.
- [ ] Điền email + mật khẩu vào ASC → App Review Information → Sign-In required.
- [ ] Review Notes: ghi app dùng **Turnstile captcha** (nếu phase 05 đã bật) — reviewer có build kèm token nên không bị chặn.

### A-06 — Screenshots + metadata (CHẶN Submit, làm CUỐI)

- [ ] Chờ **1933 phase 05 land** (đổi contrast token → diện mạo đổi). Chụp trước = chụp lại.
- [ ] Screenshots 6.5" + 6.9" (bắt buộc), scope v1 = **light mode + portrait + iPhone** (đúng scope đã chốt).
- [ ] Description + keywords + support URL + marketing URL (battudao.com).
- [ ] Age rating questionnaire: UGC + chat → khai moderation (report/block có ở QA + chat) → thường 17+; khai trung thực.

### C-01 — SMTP thật (CHẶN public, không chặn TestFlight nội bộ)

- [ ] Cấu hình custom SMTP ở Supabase Auth (Resend/Postmark/SES) — mặc định giới hạn **2 mail/giờ** (đo được, tệ hơn report đoán).
- [ ] Đổi from-address khỏi `supabase.io`.
- [ ] Test: đăng ký mới + quên mật khẩu → mail vào **inbox** (không spam), link confirm/reset chạy.

### C-03 — Backup (CHỈ GHI NHẬN, không nâng tier)

- [ ] Xác nhận đã hiểu: free tier = daily backup 7 ngày, **không PITR**, tự pause sau 7 ngày không traffic.
- [ ] Storage `chat-media` **không có backup mặc định** — rủi ro đã chấp nhận (ghi vào docs, không hành động).
- [ ] Quyết định đã chốt (plan.md): **giữ free, ghi nhận rủi ro** — KHÔNG nâng Pro ở phase này.

## Việc Claude Code verify được (không phải Đăng)

Sau khi Đăng làm xong, chạy để xác nhận (không tin lời khai):

```bash
# Demo account thấy nội dung mồi (dùng JWT của account review):
curl -sS "$SUPABASE_URL/rest/v1/questions?select=id&deleted_at=is.null" \
  -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $REVIEW_JWT" | jq 'length'   # >= 5

# SMTP đã đổi (kiểm qua Auth settings API nếu có quyền, hoặc gửi thử reset rồi xem header mail).
```

## Todo (tổng hợp — trạng thái Submit)

- [ ] A-03 App Privacy labels khớp PrivacyPage — **CHẶN**
- [ ] A-04 demo account role='user', không phải fixture — **CHẶN**
- [ ] A-06 screenshots sau 1933 phase 05 — **CHẶN, cuối cùng**
- [ ] C-01 SMTP thật + test inbox — **CHẶN public**
- [ ] C-03 ghi nhận backup risk — **không chặn**
- [ ] Claude verify demo account thấy nội dung mồi qua HTTP

## Success criteria

1. ASC đủ 5 mục CHẶN (A-03, A-04, A-06, C-01) — không field bắt buộc nào trống.
2. Demo account role='user' đăng nhập được + thấy nội dung mồi (verify HTTP).
3. Mail confirm + reset vào inbox thật (không dính giới hạn 2/giờ).
4. Age rating khai xong, khớp mức moderation thật của app.
5. Backup risk ghi vào `docs/` — có dấu vết quyết định, không im lặng.

## Câu hỏi chưa chốt

1. **Nội dung mồi đăng dưới tên ai** (phase 03 câu hỏi mở #4) — ảnh hưởng demo account thấy gì.
2. **Đã có tester ngoài chưa** (phase 05 câu hỏi mở #1) — ảnh hưởng thời điểm bật captcha + demo account.
3. SMTP provider nào (Resend/Postmark/SES) — Đăng chọn theo chi phí/độ tin.

## Next

→ Sau checklist này + đợt A + đợt B + việc Đăng (APNs, xem A4 report gốc) → **SUBMIT**.
