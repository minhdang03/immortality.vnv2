# Phase 05 — App Store readiness (xoá tài khoản + UGC moderation + submit)

**Status:** ⬜ chưa bắt đầu · P1 · ~4h
**Chặn bởi:** phase 04 (block/report cần bảng + UI chat), gián tiếp 01. Không chặn bởi 04b (push không bắt buộc để submit).
**Trigger:** ghi nợ từ [phase-02b](phase-02b-external-review-remediation.md) — "ghi xoá-tài-khoản vào phase 05". Guideline 5.1.1(v) = **HARD REJECT** nếu thiếu.

## Context links

- [plan.md](plan.md) §Phase 05 — checklist App Store
- [phase-02](phase-02-auth-and-profile.md) — có sign-up ⇒ **bắt buộc** cho xoá tài khoản
- [phase-04](phase-04-conversations-wire.md) — block/report đã có; đây là phần "checklist hoá" cho review
- `apps/nodie-ios/NODIE/Features/Profile/ProfileView.swift`, `ProfileSections.swift` — nơi đặt nút xoá + quên mật khẩu
- `apps/nodie-ios/NODIE/PrivacyInfo.xcprivacy` — **đã có** (email/name/UserContent, no tracking)
- `apps/nodie-ios/project.yml` — `UILaunchScreen: {}` (đã có launch screen tối thiểu), AppIcon `icon-1024.png` đã có
- `supabase/migrations/0017_nodie_community.sql` — `reports`/`blocks` đã có

## Overview

Đưa NODIE qua vòng review App Store. Hai mục có thể **reject cứng**: (1) xoá tài khoản server-side, (2) UGC moderation đủ 4 công cụ. Cộng các mục "thiếu là reject": quên mật khẩu, privacy labels khớp manifest, app icon/launch screen, TestFlight.

## Key insights

- **Đã có sẵn** (khỏi làm lại): `PrivacyInfo.xcprivacy` (phase 02b), `AppIcon` 1024 (`icon-1024.png`), `UILaunchScreen: {}` (project.yml:54), `ITSAppUsesNonExemptEncryption=false`, `reports`/`blocks` bảng, Release manual signing + profile "NODIE App Store".
- **Xoá tài khoản BẮT BUỘC server-side** — client không có quyền xoá `auth.users`. Đặt ở **Supabase Edge Function** với `service_role` (Đăng chốt: không Vercel, không workers/api). Cùng chỗ với `push-on-message` (phase 04b) → tái dùng pattern deploy.
- **QĐ Đăng 2026-07-16 — xoá kiểu Facebook, KHÔNG phải kiểu StackOverflow.** Vô hiệu hoá → **grace 30 ngày hoàn tác** → cron purge **hard-delete** nội dung user tự đăng. Đây là **đảo ngược** thiết kế `set null` của 0017/0018: FK để nguyên, nhưng Edge Function purge chủ động `delete` trước khi `deleteUser`. Chi tiết mô hình FB/IG/X mà ta bám theo:
  - Cả 3 nền tảng: deactivate → ~30 ngày đổi ý được → xoá vĩnh viễn tài khoản + PII + **nội dung mình đăng** (post/comment/ảnh).
  - **DM ở lại phía người nhận** — hội thoại là dữ liệu của cả hai; không với tay xoá trong hộp thư người khác. NODIE làm y vậy: `messages` trong kênh `kind='dm'` **giữ**, chỉ `user_id → null`.
  - Nội dung ở kênh public/group + Q&A = "post của mình" → **hard-delete**.
- **UGC guideline 1.2 cần 4 thứ**: (a) lọc nội dung phản cảm, (b) cơ chế báo cáo, (c) chặn user lạm dụng, (d) cách liên hệ nhà phát triển. b+c đã có ở phase 04. Còn a (filter/EULA) + d (contact).
- **Không IAP ở v1** (plan.md caveat) → không đụng guideline 3.1.1. AI Hỏi Ngược trả phí là phase sau.
- Privacy labels trong App Store Connect phải **khớp** `PrivacyInfo.xcprivacy` — lệch là cờ đỏ.

## Requirements

**Chức năng (theo mức độ reject)**
1. **[HARD] Xoá tài khoản kiểu FB — 3 phần:**
   - **(a) Yêu cầu xoá**: nút trong Cá Nhân → xác nhận 2 bước → Edge Function `request-account-deletion` đặt `profiles.deactivated_at = now()` → signOut. Tài khoản lập tức **vô hình** với người khác (RLS lọc), nhưng dữ liệu còn nguyên.
   - **(b) Hoàn tác trong 30 ngày**: đăng nhập lại → app phát hiện `deactivated_at` còn trong hạn → màn "Tài khoản đang chờ xoá — Khôi phục / Xoá ngay" → khôi phục = `deactivated_at = null`.
   - **(c) Purge sau 30 ngày**: `pg_cron` gọi Edge Function `purge-deactivated-accounts` mỗi ngày → với mỗi user quá hạn: **hard-delete** `questions`/`answers`/`answer_replies` + `messages` ở kênh **không phải DM** của user → rồi `auth.admin.deleteUser(uid)` (cascade phần còn lại). `messages` trong kênh DM giữ lại, `user_id → null` (FK sẵn có lo).
   
   Client **không bao giờ** tự xoá. Mọi bước xoá đều `service_role` server-side.
2. **[HARD] UGC moderation**: 
   - Báo cáo (phase 04) — xác nhận có mọi UGC (tin, câu hỏi, trả lời, reply).
   - Chặn user (phase 04) — xác nhận.
   - EULA/quy tắc cộng đồng "không dung thứ nội dung phản cảm" + đồng ý lúc sign-up hoặc link trong Cá Nhân.
   - Cách liên hệ nhà phát triển (email support) trong Cá Nhân + App Store metadata.
   - Cam kết xử lý báo cáo < 24h (quy trình admin — AdminUsersTab web / SQL).
3. **[Reject nếu thiếu] Quên mật khẩu**: nút ở LoginView → `client.auth.resetPasswordForEmail(email)` → màn "kiểm tra hộp thư".
4. **App icon**: xác nhận `icon-1024.png` không có alpha, đủ. (Đã có — chỉ verify.)
5. **Launch screen**: `UILaunchScreen: {}` tối thiểu — cân nhắc thêm logo/nền kem cho chỉn chu (không bắt buộc).
6. **Privacy labels** App Store Connect khớp `PrivacyInfo.xcprivacy`.
7. **TestFlight**: build Release → upload → internal test → smoke đủ luồng.

**Phi chức năng**
- Xoá tài khoản không thể hoàn tác → confirm hai bước rõ ràng tiếng Việt.
- Edge Function xác thực caller = chính chủ (JWT của user), chỉ xoá **user gọi**.

## Architecture — luồng dữ liệu

```
(a) YÊU CẦU XOÁ — tức thì, hoàn tác được
ProfileView (nút đỏ "Xoá tài khoản")
  → confirm 2 bước (alert + gõ "XOÁ")
  → PushManager.removeToken()            (ngừng push ngay, nếu 04b xong)
  → invoke `request-account-deletion` (Authorization: user JWT)
        1. uid ← JWT đã verify (KHÔNG lấy từ body)
        2. update profiles set deactivated_at = now() where id = uid
        3. delete from device_tokens where user_id = uid
  → client signOut → LoginView
  ⇒ user vô hình với người khác (RLS lọc deactivated_at), dữ liệu CÒN NGUYÊN

(b) HOÀN TÁC — trong 30 ngày (giống hệt FB)
LoginView → đăng nhập thành công
  → AuthStore đọc profiles.deactivated_at
  → còn trong hạn?  → màn "Tài khoản đang chờ xoá, còn N ngày"
                        ├─ "Khôi phục"  → deactivated_at = null → vào app
                        └─ "Xoá ngay"   → purge-now (bỏ qua grace)
  → hết hạn / không có → vào app bình thường

(c) PURGE — pg_cron, mỗi ngày 03:00
pg_cron → Edge Function `purge-deactivated-accounts` (service_role)
    với mỗi uid có deactivated_at < now() - 30 days:
      1. delete answer_reactions/answer_replies/answers/questions  where author_id = uid
      2. delete messages  where user_id = uid
           AND channel_id IN (select id from channels where kind <> 'dm')   ← DM GIỮ LẠI
      3. auth.admin.deleteUser(uid)  → cascade phần còn lại;
         messages DM còn lại tự set user_id = null (FK sẵn có)

Quên mật khẩu:
LoginView → resetPasswordForEmail → email reset (Supabase lo template)
```

**Cascade thực tế (đọc từ 0017/0018) — nền để purge đứng trên:**
- `on delete cascade`: `channel_members`, `blocks`, `reports`, `device_tokens`, `answer_reactions`.
- `on delete set null`: `messages.user_id`, `questions.author_id`, `answers.author_id`, `answer_replies.author_id`, `channels.created_by`.
- ⇒ FK **một mình nó** chỉ cho ra kiểu "ẩn danh, giữ nội dung" (StackOverflow). Đăng chốt kiểu FB ⇒ **purge phải chủ động `delete` trước** `deleteUser`; FK chỉ lo phần đuôi. **Không sửa FK trong 0017** — file đó đã áp lên prod ở phase 01, sửa file đã áp = lệch file/DB.

**RLS cần biết `deactivated_at`:** user đang chờ xoá không được hiện ra như thành viên bình thường. Xem migration `0020` bên dưới.

## Related code files

**Tạo:**
- `supabase/migrations/0020_nodie_account_deletion.sql` — `profiles.deactivated_at timestamptz`, index `where deactivated_at is not null`, RLS lọc user đang chờ xoá, bật `pg_cron` + lịch gọi purge
- `supabase/functions/request-account-deletion/index.ts` — đặt `deactivated_at`, gỡ device token (service_role)
- `supabase/functions/purge-deactivated-accounts/index.ts` — cron: hard-delete nội dung (trừ DM) + `deleteUser`
- `apps/nodie-ios/NODIE/Features/Profile/DeleteAccountView.swift` — UI xác nhận 2 bước
- `apps/nodie-ios/NODIE/Auth/ReactivateAccountView.swift` — màn "đang chờ xoá, còn N ngày → Khôi phục / Xoá ngay"
- `apps/nodie-ios/NODIEUITests/AccountDeletionUITests.swift` — verify luồng UI (skip network như AuthUITests)

**Sửa:**
- `apps/nodie-ios/NODIE/Features/Profile/ProfileView.swift` / `ProfileSections.swift` — nút Xoá tài khoản, link EULA, email support
- `apps/nodie-ios/NODIE/Auth/AuthStore.swift` — `requestAccountDeletion()`, `reactivateAccount()`, `purgeNow()`, `resetPassword(email:)`; `loadProfile()` đọc `deactivated_at`
- `apps/nodie-ios/NODIE/Auth/UserProfile.swift` — thêm field `deactivated_at`
- `apps/nodie-ios/NODIE/Auth/LoginView.swift` — nút "Quên mật khẩu"
- `apps/nodie-ios/NODIE/NodieApp.swift` / `RootTabView.swift` — chặn vào app khi tài khoản đang chờ xoá → `ReactivateAccountView`
- `apps/nodie-ios/project.yml` — (nếu thêm launch screen storyboard/asset)
- App Store Connect (ngoài repo): privacy labels, app metadata, support URL, EULA

## Implementation steps

1. **Migration `0020`**: thêm `profiles.deactivated_at timestamptz` + `create index … where deactivated_at is not null`; vá RLS để user chờ xoá không lộ ra (profiles read policy thêm `deactivated_at is null or id = (select auth.uid())`); `create extension if not exists pg_cron` + `cron.schedule('purge-nodie-accounts','0 3 * * *', …)` gọi purge qua `net.http_post` (pg_net) kèm secret header.
2. **Edge Function `request-account-deletion`**: `Authorization: Bearer <user JWT>` → verify → `uid`. `service_role` client → `update profiles set deactivated_at = now() where id = uid` + `delete from device_tokens where user_id = uid`. **uid CHỈ lấy từ JWT**, không nhận từ body (tránh vô hiệu hoá hộ người khác).
3. **Edge Function `purge-deactivated-accounts`**: bảo vệ bằng shared secret header (cron gọi, không phải user). Query user quá 30 ngày → theo đúng thứ tự (a)(b)(c) ở Architecture. Idempotent: chạy 2 lần không hỏng. Log số user đã purge.
4. **AuthStore**: `requestAccountDeletion()` (invoke → signOut), `reactivateAccount()` (`deactivated_at = null`), `purgeNow()`; `loadProfile()` đọc thêm `deactivated_at`.
5. **UI xác nhận 2 bước**: nút đỏ "Xoá tài khoản" → alert nêu rõ **"Tài khoản sẽ bị xoá vĩnh viễn sau 30 ngày. Đăng nhập lại trong 30 ngày để khôi phục."** → gõ "XOÁ" → gọi `requestAccountDeletion()`.
6. **Màn khôi phục**: sau đăng nhập, nếu `deactivated_at` còn hạn → `ReactivateAccountView` (còn N ngày, Khôi phục / Xoá ngay). Chặn vào app cho tới khi chọn.
7. **Quên mật khẩu**: LoginView nút → sheet nhập email → `auth.resetPasswordForEmail` → thông báo "kiểm tra hộp thư". (Deep link đặt lại mật khẩu trong app = phức tạp; v1 để Supabase gửi link web đặt lại — đủ cho review.)
8. **EULA + community guidelines**: trang tĩnh (link tới `battudao.com/quy-tac` hoặc bản trong app) + dòng "Bằng việc dùng, bạn đồng ý không đăng nội dung phản cảm" ở sign-up.
9. **Email support**: hàng "Liên hệ hỗ trợ" trong Cá Nhân mở `mailto:` + support URL trong App Store metadata.
10. **Verify assets**: `icon-1024.png` no-alpha (`sips -g hasAlpha`); launch screen hiện đúng.
11. **Privacy labels**: điền App Store Connect khớp manifest (Email, Name, User Content — linked, không tracking).
12. **Build Release + TestFlight**: `xcodebuild archive` với manual signing → `xcrun altool`/Xcode Organizer upload → internal test.

## Todo list

- [ ] Migration `0020`: `profiles.deactivated_at` + index + RLS lọc + `pg_cron` lịch purge
- [ ] Edge Function `request-account-deletion` (uid từ JWT, không từ body)
- [ ] Edge Function `purge-deactivated-accounts` (secret header, idempotent, DM giữ lại)
- [ ] `AuthStore`: request/reactivate/purgeNow + `resetPassword()`
- [ ] `DeleteAccountView` xác nhận 2 bước tiếng Việt (nêu rõ "30 ngày")
- [ ] `ReactivateAccountView` — còn N ngày, Khôi phục / Xoá ngay
- [ ] Nút "Quên mật khẩu" ở LoginView
- [ ] EULA/quy tắc + đồng ý lúc sign-up
- [ ] Email support trong Cá Nhân + metadata
- [ ] Verify icon no-alpha + launch screen
- [ ] Privacy labels App Store Connect khớp manifest
- [ ] Build Release archive + upload TestFlight
- [ ] Smoke test TestFlight: đủ luồng + xoá tài khoản thật (tài khoản test)
- [ ] Test grace: yêu cầu xoá → đăng nhập lại → khôi phục được → `deactivated_at` null
- [ ] Test purge: set `deactivated_at = now() - 31 days` trên tài khoản test → gọi purge tay → đối chiếu psql (nội dung public mất, DM còn với `user_id` null, `auth.users` mất row)

## Success criteria

- Nút Xoá tài khoản → confirm → `profiles.deactivated_at` được đặt (verify psql); đăng nhập lại hiện màn "chờ xoá", không vào thẳng app
- Khôi phục trong hạn → `deactivated_at` null → vào app bình thường, dữ liệu nguyên vẹn
- Purge (ép `deactivated_at = now() - 31 days`) → `auth.users` **mất row**, `questions`/`answers`/`answer_replies`/`messages` ở kênh non-DM của user **bị xoá thật**, `messages` trong kênh DM **còn** với `user_id` null, `channel_members`/`device_tokens`/`blocks`/`reports`/`answer_reactions` sạch — mỗi mục đối chiếu bằng psql
- Purge chạy 2 lần liên tiếp không lỗi (idempotent)
- Quên mật khẩu → nhận email reset thật
- Mọi UGC (tin/câu hỏi/trả lời/reply) đều báo cáo được; chặn user hoạt động (từ phase 04)
- Email support mở được từ Cá Nhân
- Privacy labels khớp `PrivacyInfo.xcprivacy`
- Build Release lên TestFlight, internal tester cài + chạy được
- 20/20 UI test cũ + test xoá tài khoản mới đều pass

## Risk assessment

| # | Rủi ro | Xác suất × Tác động | Giảm thiểu |
|---|---|---|---|
| 1 | **Xoá tài khoản từ client** (thiếu server-side) → vẫn reject vì client không xoá được `auth.users`, hoặc lỗ hổng xoá hộ | Cao nếu làm sai × Cao | Edge Function `service_role`, chỉ xoá uid của JWT. **Không** nhận uid từ body. |
| 2 | Edge Function nhận `uid` từ body → ai cũng xoá tài khoản người khác | Trung × Nghiêm trọng | Lấy uid từ JWT đã verify, bỏ qua body |
| 3 | **Cascade xoá nhầm/thiếu** — hiểu sai `set null` vs `cascade` → hoặc mất nội dung không mong muốn, hoặc để lại PII | Trung × Cao | Đã đọc FK từ 0017/0018 (bảng trên). Test trên tài khoản seed, đối chiếu từng bảng bằng psql trước khi tin. |
| 9 | **Purge xoá nhầm DM.** Bước (c) lọc `channel_id in (select id from channels where kind <> 'dm')` — sai một dấu là xoá tin trong hộp thư người khác, **không hoàn tác được**. | Trung × Nghiêm trọng | Test purge trên tài khoản test có sẵn 1 DM + 1 tin kênh public; đối chiếu psql **cả hai chiều** (tin public mất, tin DM còn) trước khi tin. Chạy thử `select` trước `delete`. |
| 10 | **Cron không chạy / chạy nhầm.** `pg_cron` chưa bật, hoặc lịch sai giờ, hoặc purge bị gọi bởi người ngoài → xoá hàng loạt. | Trung × Nghiêm trọng | Verify `select * from cron.job;` sau khi áp 0020. Purge yêu cầu shared secret header — không secret = 401. Test bằng cách gọi tay trước khi tin vào cron. |
| 11 | **Grace 30 ngày làm user tưởng đã xoá xong** trong khi dữ liệu còn → khiếu nại privacy | Thấp × Trung | Text xác nhận nói rõ "xoá vĩnh viễn sau 30 ngày"; App Store chấp nhận grace (FB/IG/X đều làm) |
| 4 | Privacy labels lệch manifest → cờ đỏ review | Trung × Trung | Điền theo đúng `PrivacyInfo.xcprivacy`; không khai thừa/thiếu loại dữ liệu |
| 5 | Reset password deep-link phức tạp làm phình scope | Trung × Thấp | v1 dùng link web Supabase gửi — đủ cho review, không làm deep-link (YAGNI) |
| 6 | Manual signing / profile "NODIE App Store" hết hạn hoặc sai | Trung × Cao | Verify profile còn hạn + đúng bundle trước archive; ASC API key sẵn (phase 02 ghi) |
| 7 | Thiếu "cách liên hệ" (guideline 1.2d) → reject dù có report/block | Trung × Trung | Email support trong app + metadata — nhỏ nhưng bắt buộc |
| 8 | Xoá tài khoản không gỡ device token → push tới thiết bị của tài khoản đã xoá | Thấp × Thấp | Gọi `removeToken()` trước khi xoá (nếu 04b xong); cascade `device_tokens` cũng xoá theo user FK |

**Rollback:** Các nút UI + Edge Function là cộng thêm — gỡ nút = quay lại trạng thái trước, không ảnh hưởng chat/QA. Không đụng schema (dùng cascade sẵn có). TestFlight build không ảnh hưởng prod DB (trừ tài khoản test tự xoá). Nếu submit bị từ chối → sửa mục bị nêu, submit lại, không rollback code.

## Security considerations

- **Xoá tài khoản chỉ server-side, chỉ chính chủ.** uid từ JWT, không từ input. Đây là bề mặt tấn công nghiêm trọng nhất của phase.
- `service_role` chỉ trong Edge Function env — không app, không repo.
- Xác nhận 2 bước tránh xoá nhầm (thao tác không hoàn tác).
- Reset password: Supabase rate-limit sẵn; không lộ "email có tồn tại không" (Supabase trả 200 dù email không tồn tại — đúng).
- EULA + report/block thoả guideline 1.2 — điều kiện cho app có UGC + DM tồn tại trên store.
- Sau xoá, verify **không còn PII** của user (email trong `auth.users`, `donation_contacts` nếu có liên kết — kiểm) — App Store yêu cầu xoá dữ liệu cá nhân, không chỉ vô hiệu hoá.

## Next steps

App live/TestFlight → mở đường phase 06 (Bảng tin + AI) sau ranh giới v1. Cập nhật `CLAUDE.md` (plan.md ghi cần update anti-pattern) — có thể gộp vào commit cuối session.

## Unresolved questions

1. ✅ **ĐÃ TRẢ LỜI 2026-07-16 — xoá kiểu Facebook: hard-delete + grace 30 ngày.** Đăng hỏi "FB/IG/X xử lý thế nào" rồi chốt theo đúng mô hình đó. Cụ thể: deactivate ngay → 30 ngày hoàn tác → cron purge hard-delete nội dung user tự đăng; **DM giữ phía người nhận** (như FB — hội thoại là dữ liệu của cả hai). Kéo theo: migration `0020` + 2 Edge Function + màn khôi phục (đã ghi ở trên). Đánh đổi đã chấp nhận: mất câu trả lời trong AI corpus + thủng luồng thảo luận khi ai đó xoá tài khoản, đổi lấy đúng kỳ vọng "xoá là mất".
2. Email support: dùng email nào? (`lmd03store@gmail.com`? email riêng của battudao? cần địa chỉ công khai được.)
3. EULA/quy tắc cộng đồng: có sẵn trang trên `battudao.com` chưa, hay cần soạn? Link web hay nhúng trong app?
4. Launch screen: giữ tối thiểu (`{}`) hay thêm logo NODIE? (Không bắt buộc cho review, nhưng chỉn chu.)
5. App Store metadata (mô tả, screenshot, category, age rating) — có UGC + DM ⇒ age rating tối thiểu 17+ hoặc cần khai "user-generated content"? Cần chuẩn bị screenshot từ device thật.
6. Reset password deep-link về app (thay vì web) — để phase sau, hay Đăng muốn ngay? Đề xuất sau (YAGNI).
