# Phase 01 — Web: privacy + terms + trang nhúng captcha

**Mục:** A-02 (P0) · hạ tầng cho C-04 · **Đợt A** · Ước lượng **0.5 ngày** · Status: ⬜
**Model:** Opus (fast) — trang tĩnh + deploy Vercel, nội dung tái dùng từ `TermsOfUseView`; spec rõ, verify bằng HTTP 200.

## Context links

- Report gốc: `apps/nodie-ios/plans/reports/production-gap-analysis-260717-1949-beyond-ux-audit-appstore-ops-report.md` (A-02)
- Nguồn nội dung tái dùng: `apps/nodie-ios/NODIE/Features/Profile/TermsOfUseView.swift` (74 dòng, 6 mục, "Cập nhật: 16/07/2026")
- Quy ước web: `CLAUDE.md` → Routing & SEO

## Overview

App Store Connect **bắt buộc** field Privacy Policy URL. Hôm nay web **chưa có trang privacy/terms nào**. Điều khoản chỉ sống trong app (`TermsOfUseView`) — reviewer không có URL để dán.

Gộp thêm trang tĩnh nhúng Turnstile: phase 05 cần một URL **thật trên domain đã whitelist sitekey** để WKWebView trỏ vào. Làm chung một đợt deploy, không đẻ thêm vòng deploy.

## Key insights

- **Hai bên phải không lệch.** `TermsOfUseView` là văn bản pháp lý đã viết. Trang web **chép đúng 6 mục đó**, không viết lại — lệch một chữ giữa app và web là mời tranh cãi.
- **Privacy policy phải nói thật những gì app thu**: email, tên hiển thị, nội dung UGC (tin nhắn/ảnh/thoại), device token APNs. Phải khớp App Privacy labels Đăng khai ở phase 07 — Apple đối chiếu hai thứ này.
- **Turnstile không có SDK native iOS** (đã research 17/07). Cách chuẩn: WKWebView `load(URLRequest)` trỏ trang tĩnh thật; `loadHTMLString` + baseURL giả **không được Cloudflare xác nhận** là qua domain-check.
- Web routing tự code bằng History API trong `apps/web/src/App.jsx`; `apps/web/src/config/pages.js` là **single source of truth** — thêm page = thêm 1 entry.

## Requirements

**Chức năng**
- `https://battudao.com/privacy` và `https://battudao.com/terms` trả 200, đọc được trên mobile, song ngữ theo cơ chế i18n hiện có của web.
- `https://battudao.com/turnstile-embed.html?sitekey=<key>` render widget Turnstile, post token về native qua `window.webkit.messageHandlers`.

**Phi chức năng**
- Không thêm dependency web mới.
- Trang tĩnh nhúng captcha **không** load gì ngoài phạm vi captcha (tránh bị App Review coi là web wrapper).

## Files

**Sửa**
- `apps/web/src/config/pages.js` — thêm 2 entry `privacy`, `terms`
- `apps/web/src/App.jsx` — chỉ khi registry không tự map (đọc trước, đừng đoán)
- `functions/index.js` + `firebase.json` và/hoặc `vercel.json` — thêm `/privacy`, `/terms` vào route OG render **nếu** muốn share link có preview (không bắt buộc cho A-02)

**Tạo**
- `apps/web/src/pages/PrivacyPage.jsx`
- `apps/web/src/pages/TermsPage.jsx`
- `apps/web/public/turnstile-embed.html`

**Xoá:** không

## Implementation steps

1. Đọc `apps/web/src/config/pages.js` + 1 page hiện có (vd `apps/web/src/pages/ContactPage.jsx`) → **bám đúng shape entry và convention component**. Không phát minh cấu trúc mới.
2. `TermsPage.jsx`: chép 6 mục từ `TermsOfUseView.swift` (1. Về NODIE · 2. Quy tắc cộng đồng · 3. Nội dung bạn đăng · 4. Kiểm duyệt · 5. Tài khoản · 6. Liên hệ) + dòng "Cập nhật: 16/07/2026".
3. `PrivacyPage.jsx` — viết mới, tối thiểu phải có:
   - **Thu gì:** email + mật khẩu (Supabase Auth), tên hiển thị, bio, nội dung đăng (câu hỏi/trả lời/tin nhắn/ảnh/tệp/thoại), device token APNs.
   - **Dùng làm gì:** vận hành tài khoản, hiển thị nội dung, gửi thông báo. **Không quảng cáo, không tracking, không bán dữ liệu.**
   - **Ở đâu:** Supabase (ap-southeast-1), Apple APNs cho push.
   - **Xoá:** xoá tài khoản trong app → hồ sơ + dữ liệu cá nhân xoá vĩnh viễn; nội dung đã đăng ở lại **ẩn danh** (khớp đúng RPC `delete_account`, migration 0021).
   - **Media trong Storage:** ghi rõ ảnh/tệp đã gửi trong trò chuyện **có thể còn lại** sau khi xoá tài khoản (C-06 là rủi ro đã chấp nhận — privacy policy phải nói thật, không được im).
   - **Liên hệ:** trang Liên hệ battudao.com.
4. Thêm 2 entry vào `pages.js` (path `/privacy`, `/terms`).
5. `turnstile-embed.html`: đọc `sitekey` từ query param → render `<div class="cf-turnstile" data-sitekey="..." data-callback="onToken">` + `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer>`; `onToken(t)` gọi `window.webkit.messageHandlers.turnstile.postMessage(t)`; thêm `data-error-callback`/`data-expired-callback` post message lỗi. Sitekey qua param (KHÔNG hardcode): DEBUG dùng test key `1x00000000000000000000BB` (invisible, always-pass), Release dùng key thật.
6. Build local: `pnpm --filter @btd/web build` → xanh.
7. Merge vào `main` → Vercel tự deploy (Git integration).
8. Trong Cloudflare Turnstile dashboard, Đăng thêm hostname `battudao.com` vào widget config (nếu chưa) — nếu không, sitekey từ chối domain.

## Todo

- [ ] Đọc `pages.js` + 1 page mẫu, ghi lại shape entry
- [ ] `TermsPage.jsx` chép từ `TermsOfUseView.swift`
- [ ] `PrivacyPage.jsx` (đủ 6 mục trên, có mục media còn lại)
- [ ] 2 entry vào `pages.js`
- [ ] `turnstile-embed.html` + đọc sitekey từ query
- [ ] `pnpm --filter @btd/web build` xanh
- [ ] Merge `main`, verify prod

## Success criteria

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://battudao.com/privacy   # 200
curl -sS -o /dev/null -w '%{http_code}\n' https://battudao.com/terms     # 200
curl -sS "https://battudao.com/turnstile-embed.html?sitekey=1x00000000000000000000BB" | grep -c cf-turnstile  # >=1
```
- Mở `https://battudao.com/turnstile-embed.html?sitekey=1x00000000000000000000BB` trên Safari desktop → console không lỗi, callback bắn token dạng `XXXX.DUMMY.TOKEN.XXXX`.
- So từng mục Terms web vs `TermsOfUseView.swift` — **không lệch chữ nào** ở tên 6 mục.

## Risks + rollback

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| SPA route mới 404 trên Vercel (rewrite thiếu) | Trung bình | Verify bằng `curl` **hard-load** URL trực tiếp, không chỉ bấm trong app |
| Privacy policy nói khác App Privacy labels → Apple bắt lỗi | Cao | Phase 07 khai labels **theo đúng** trang này, không khai độc lập |
| Turnstile từ chối domain vì chưa whitelist | Trung bình | Bước 8 trước khi phase 05 chạy |
| SW cache khiến user thấy stale | Thấp | Page mới, không đụng asset cũ; nếu thấy stale → bump cache name `public/sw.js` |

**Rollback:** revert commit → Vercel tự deploy lại. Trang tĩnh, không có state, không migration ⇒ rollback sạch.

## Security

- Trang nhúng captcha **không nhận secret** — chỉ sitekey (public theo thiết kế của Turnstile).
- Không log token ra console ở bản prod.
- Không nhúng gì khác vào `turnstile-embed.html` (không analytics, không font ngoài) — giảm bề mặt và giữ App Review sạch.

## Next

→ Phase 05 dùng URL này. Phase 07 khai App Privacy labels **theo** `PrivacyPage.jsx`.
