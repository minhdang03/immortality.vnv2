# Production gaps NGOÀI audit UX — App Store, ops, observability, cold start

Ngày: 17/07/2026 19:49. Phạm vi: những thứ audit `ux-ui-260717-1915` (chỉ soi UI/UX) và plan `260717-1933` KHÔNG phủ. Phương pháp: quét repo NODIE + đối chiếu yêu cầu App Review / chuẩn vận hành super app. Không sửa code (session khác đang cook plan 1933).

## Verdict

Plan 1933 xử lý xong UX vẫn CHƯA đủ lên App Store. Tìm thấy **3 nhóm blocker mới**: (A) chat thiếu report/block = rủi ro reject Guideline 1.2, (B) zero observability — không crash reporting, mù hoàn toàn sau khi ship, (C) hồ sơ App Store Connect chưa chuẩn bị. Kèm nợ ops backend và bài toán cold-start mạng xã hội.

## A. App Store submission — blocker trước khi bấm Submit

| ID | Mức | Vấn đề | Bằng chứng / việc cần làm |
|---|---|---|---|
| A-01 | **P0** | **Chat KHÔNG có Báo cáo/Chặn** — `ModerationMenu` chỉ gắn ở QA (AnswerCardView, QuestionDetailView, AnswerReplyRow). Guideline 1.2 UGC áp cho MỌI bề mặt UGC; chat là UGC. Reviewer mở chat, giữ tin nhắn, không thấy flag → reject | Gắn ModerationMenu (context menu long-press) vào `MessageBubbleView`; report ghi bảng `reports` sẵn có; block dùng `is_blocked_pair` sẵn có. Đề xuất nhét vào phase 03 plan 1933 (đang làm menu chat) |
| A-02 | **P0** | **Privacy Policy URL hosted trên web** — App Store Connect bắt buộc field này; `TermsOfUseView` chỉ nằm trong app | Đăng trang privacy + terms lên battudao.com (web đã có sẵn hạ tầng); điền URL vào ASC |
| A-03 | **P0** | **App Privacy labels** chưa khai — app thu email, tên, nội dung UGC, device token | Khai trong ASC: Contact Info (email), User Content (messages/photos/audio), Identifiers. Không tracking → không cần ATT |
| A-04 | P1 | **Demo account cho App Review** — app bắt đăng nhập mới xem được gì (audit cũng chê không có preview) | Tạo account review riêng (KHÔNG dùng `an.nodie.test` đang là fixture của UITest — reviewer làm bẩn data là suite đỏ), điền vào ASC Review Notes |
| A-05 | P1 | Age rating + community guidelines: UGC + chat → thường ra 17+ nếu không khai moderation đủ; Apple 1.2 muốn terms/guidelines user THẤY được khi đăng ký | Khai questionnaire cẩn thận; link Điều khoản ngay màn đăng ký (hiện chỉ nằm trong Profile) |
| A-06 | P2 | Screenshots + metadata 6.5"/6.9", description, keywords — chưa có gì | Làm sau khi UI đóng băng (sau phase 05 đổi contrast token) |

Đã ổn (kiểm rồi, khỏi lo): `ITSAppUsesNonExemptEncryption: false` ✅ · icon 1024 ✅ · versioning một chỗ trong project.yml ✅ · `aps-environment` theo config ✅ · delete account ✅ (AuthStore + ProfileView) · deep link password reset ✅.

## B. Observability — hiện tại mù 100% sau khi ship

| ID | Mức | Vấn đề | Đề xuất |
|---|---|---|---|
| B-01 | **P0** | **Không có crash reporting** — grep toàn repo: dependency duy nhất là Supabase. Crash trên máy user = không bao giờ biết. Chuẩn FB/IG: không app nào ship thiếu | Nhẹ nhất: bật **MetricKit** (`MXMetricManager`, zero dependency, Apple-native) + Xcode Organizer crash. Đủ hơn: Sentry SDK (self-hosted option, không đụng App Privacy tracking). Chọn 1, làm trước TestFlight public |
| B-02 | P1 | **Không có product analytics** — mạng xã hội không đo được DAU/retention/funnel đăng ký. GA4 đã dùng bên web | Tối thiểu: bảng `app_events` Supabase (client ghi batched, RLS insert-only) — khỏi thêm SDK. Đủ dùng cho <10k user, khớp triết lý "không engagement metrics công khai" |
| B-03 | P1 | **Push fail im lặng có chủ đích** — 0031 bọc `exception when others` để push hỏng không chặn gửi tin (đúng), nhưng nghĩa là push chết cả tuần cũng không ai hay | Edge function `push-on-message` log lỗi vào bảng `push_failures` + kiểm tra định kỳ; hoặc alert qua goclaw Telegram bot sẵn có |
| B-04 | P2 | Supabase log/alert: chưa có ai xem logs, không alert khi error rate tăng | Bật log drain hoặc lịch check thủ công tuần đầu sau launch |

## C. Backend ops — nợ đã biết nhưng chưa có chủ

| ID | Mức | Vấn đề | Đề xuất |
|---|---|---|---|
| C-01 | **P0** | **Email production**: Supabase default SMTP giới hạn ~3-4 email/giờ + from-address supabase.io — signup/reset password chết ngay khi có >3 user/giờ đăng ký | Cấu hình custom SMTP (Resend/Postmark/SES) TRƯỚC khi mở public; test confirm + reset email vào inbox (không spam) |
| C-02 | P1 | **Migration không được track** — không có `schema_migrations`, áp psql tay (ghi trong plan 1404). 0033+ sắp ra từ plan 1933 → rủi ro lệch prod/repo tăng dần | Baseline `supabase db` CLI hoặc tối thiểu bảng `_applied_migrations` ghi tay từng file đã áp |
| C-03 | P1 | **Backup/PITR chưa xác nhận** — mất DB = mất mạng xã hội. Free tier chỉ có daily backup 7 ngày, không PITR | Xác nhận tier project; nếu nghiêm túc launch → Pro plan + PITR. Storage `chat-media` không có backup mặc định — chấp nhận rủi ro có ghi nhận, hoặc lifecycle sync sang R2 |
| C-04 | P1 | **Signup đang mở + không captcha** — `disable_signup: False` (đo 17/07), không có bot protection. Mạng xã hội mở = bot đăng ký spam | Bật Turnstile/hCaptcha trong Supabase Auth (SDK Swift hỗ trợ captchaToken) hoặc chấp nhận rủi ro giai đoạn TestFlight (invite-only nên tạm ổn — nhưng phải bật trước App Store public) |
| C-05 | P2 | Realtime scale: comment code tự ghi `postgres_changes` chịu được vài trăm subscriber; đủ cho launch, nhưng chưa có ngưỡng theo dõi | Ghi vào docs ngưỡng chuyển Broadcast; theo dõi concurrent qua dashboard |
| C-06 | P2 | Delete account có purge media Storage không? — xoá auth user không tự xoá file trong `chat-media/{channel}/{user}/` | Verify flow; nếu không → cron cleanup orphan hoặc chấp nhận + ghi vào privacy policy |

## D. Product gaps cho một MẠNG XÃ HỘI (positioning đã chốt 19:41)

| ID | Mức | Vấn đề | Đề xuất |
|---|---|---|---|
| D-01 | **P0** | **Cold start: prod có đúng 3 profile, channels tạo bằng SQL tay** — user thật đầu tiên vào thấy sa mạc. Không có UI admin tạo nhóm (grep `createChannel` = 0 kết quả) dù product rule là "chỉ admin tạo nhóm" | Trước launch: seed 2-3 kênh chủ đề (khoa học trường thọ theo Aion v3) + nội dung mồi Q&A thật từ content Đăng có sẵn (37 stories, khaitri) + Đăng hiện diện tuần đầu. UI admin tạo kênh = v1.1, tạm SQL/script có version |
| D-02 | P1 | **Pagination không có**: messages `limit(20)`, questions `limit(50)` — hết cỡ đó là cụt. Chat >20 tin không xem lại lịch sử được | Load-more cursor theo `created_at` (chat: kéo lên đỉnh tải cũ hơn; QA: infinite scroll). Nên nhét vào phase 01/06 plan 1933 vì đụng cùng file |
| D-03 | P1 | **Realtime reconnect**: store chỉ subscribe/unsubscribe; app nền 10 phút quay lại, socket chết → màn chat đứng hình không tự hồi | Resubscribe khi `scenePhase == .active` + refetch delta; verify hành vi SDK trước khi làm (có thể tự reconnect) |
| D-04 | P2 | Block coverage ở kênh public: `is_blocked_pair` chặn DM, nhưng trong kênh chung vẫn thấy tin người đã chặn? | Verify; chuẩn IG là ẩn nội dung người bị chặn ở mọi nơi — nếu thiếu, filter client-side theo blocklist |
| D-05 | P2 | Community guidelines in-app (nội quy cộng đồng) — Điều khoản có nhưng nội quy ngắn gọn dễ đọc thì chưa | 1 màn tĩnh + link từ đăng ký (gộp A-05) |

## E. Đề xuất xếp việc

**Nhét vào plan 1933 đang chạy (cùng file, cùng phase):**
- A-01 report/block chat → phase 03 (đang làm chat menu)
- D-02 pagination messages → phase 01 · pagination QA → phase 06
- D-03 realtime reconnect → phase 01 (đụng ConversationStore)

**Plan mới `pre-appstore-submission` (sau khi 1933 xong, ~2-3 ngày):**
1. B-01 MetricKit/Sentry + B-03 push failure log (0.5d)
2. C-01 custom SMTP + test email flow (0.5d)
3. A-02/03/04/05 hồ sơ ASC: privacy URL, labels, demo account, age rating (0.5d)
4. D-01 seed content + kênh launch (0.5d, cần Đăng cấp content)
5. C-02 migration tracking + C-03 backup tier + C-04 captcha quyết định (0.5d)
6. A-06 screenshots/metadata (0.5d, cuối cùng)

**Chấp nhận rủi ro có ghi nhận (không làm trước v1):** C-05 realtime scale, C-06 orphan media, B-04 alerting tự động, D-04 nếu verify ra là đã ổn.

## Câu hỏi chưa giải quyết

1. Supabase project đang tier nào? (quyết C-03 backup + C-01 SMTP addon)
2. Đăng có content mồi cho kênh launch chưa, lấy từ 37 stories/khaitri hay viết mới? (D-01)
3. TestFlight public link hay invite-only giai đoạn đầu? (quyết C-04 captcha gấp hay không)
4. Crash reporting: MetricKit thuần (zero-dep, ít tính năng) hay Sentry (đủ đồ, thêm dependency)? Khuyến nghị: MetricKit cho v1, Sentry khi có >1000 user.
