---
title: "Ship 1.0 blockers — 11 mục P0/P1/P2"
description: "Wire Chat vào ConversationStore, public_profiles, ẩn Hub+Journey, follows, 9 lỗi UX, nợ plan 1306, push trọn vòng."
status: in-progress
priority: P0
branch: claude/immortality-mobile-hybrid
created: 2026-07-17
---

# Ship 1.0 blockers

**Nguồn:** đề bài 11 mục của Đăng (17/07 14:04). Đăng chốt: làm **cả 11**.

## ĐỀ BÀI LỆCH THỰC TẾ — đo bằng prod DB lúc 14:05, không phải đọc code

| Đề bài nói | Thực tế đo được | Hệ quả |
|---|---|---|
| #9 `scripts/set-push-secrets.sh` **không tồn tại** | **CÓ** — commit `402e9d0` | #9 ✅ xong, không có việc |
| #9 vault secrets "đã nạp chưa?" | **ĐÃ NẠP** — `push_webhook_secret`, `push_function_url` | — |
| #9 edge function "đã deploy chưa?" | **ĐÃ** — `push-on-message` v4 ACTIVE | — |
| #9 "0029 đã apply chưa?" | **ĐÃ** — cột tên `apns_env` chứ không phải `environment` | — |
| #11 "tài khoản test có role=admin" | Test account **CHÍNH LÀ** account admin của Đăng (`mr.dang1305@gmail.com`), và là profile **DUY NHẤT** | Gỡ admin = mất admin. Phải reframe |
| #10 "xác nhận đã thêm redirect URL chưa" | `uri_allow_list` **RỖNG HOÀN TOÀN**, `site_url`=`localhost:3000` | Quên-mật-khẩu **ĐANG CHẾT** trên TestFlight, không phải "cần xác nhận" |
| — (đề bài không nhắc) | `disable_signup: **False**` | **Đăng ký public ĐANG MỞ SẴN** — mọi lo "trước khi mở public" là thì hiện tại |

## Bằng chứng bug "Ẩn danh" (đo trên prod, đăng nhập bằng user thường)

```
author:profiles(display_name)        → "author": null            → "Ẩn danh"
author:public_profiles(display_name) → {"display_name":"mr.dang1305"} ✅
```
PostgREST **embed được view** (lần theo FK của bảng gốc) → không PGRST200.

## 🔴 HAI P0 KHÔNG AI BIẾT — tìm ra lúc test bằng tài khoản THƯỜNG (14:30)

Cả hai đều bị **màn Chat giả che mất**: UI chạy MockData nên chưa từng có tin nào đi đường thật.

### A. Gửi tin nhắn HỎNG HOÀN TOÀN (mọi kênh, mọi user) → `0031`
```
0A000: cross-database references are not implemented: extensions.net.http_post
```
Trigger push 0026 gọi `extensions.net.http_post` (3 phần) → Postgres đọc là database `extensions`.
`pg_net` ĐĂNG KÝ ở schema `extensions` nhưng hàm của nó SỐNG ở schema `net`. Tên đúng: `net.http_post`.
Trigger nổ ⇒ INSERT `messages` nổ theo ⇒ **không ai gửi được tin nào**.
Bonus: 0026 tự viết bất biến "push hỏng không được chặn gửi tin" nhưng chỉ áp cho case thiếu secret → 0031 bọc `exception when others`, cưỡng chế thật.

### B. Mở DM là BẤT KHẢ THI với user thường (bế tắc RLS) → `0030`
`channels_read`: dm chỉ thành viên thấy. `members_self_join`: cần `exists(select from channels…)` — câu này chạy dưới RLS người gọi.
⇒ **Vào DM phải thấy DM; thấy DM phải đã ở trong DM.** Đo: An tạo channel dm → 201, An tự chèn mình → **403**.
Chữa bằng RPC `create_dm(other_id)` security definer (khuôn Slack/IG: server tạo DM, client không tự lắp) — kèm dồn trùng + chặn block + nguyên tử.

**Vì sao im lặng suốt:** prod chỉ có 1 tài khoản và nó là **admin** — `is_admin()` ngắn mạch cả hai policy. Đúng cái bẫy plan 1325 ghi: *"1 tài khoản = admin = không thấy bug"*.

## Phases

| # | Mục | Nội dung | Status |
|---|---|---|---|
| 00 | 2·9·10 | Apply 0027+0028 prod · fix redirect URL · seed 3 account | ✅ **xong** |
| 01 | 3 | `profiles`→`public_profiles` (5 join) | ✅ **xong** |
| 00b | — | **0030 create_dm RPC + 0031 fix push trigger** (P0 mới, đã áp prod) | ✅ **xong** |
| 02 | 1 | Wire Chat UI → ConversationStore | 🔨 store+backend xong, **views đang làm** |
| 03 | 4 | Ẩn Hub + Journey | ✅ **đã xong từ trước** — `NodieTab.visibleTabs = [.qa,.conversations,.friends]`, không gì set `tab = .feed/.journey`. Không cần code. |
| 05 | 6 | 9 lỗi UX plan 1325 | ✅ **đã xong từ trước** — code nằm sẵn trong working tree (chưa commit), status file lỗi thời. Đã verify. |
| 04 | 5 | Wire Bạn bè + hồ sơ thành viên → FollowStore | ✅ **xong** — build xanh |
| 06 | 7 | Nợ plan 1306 | ✅ **xong** — #20 (file `TabRestoration.swift` đã có nhưng **chưa ai gọi** → đã nối + guard tab ẩn) · #17 đã xong từ trước · #15 sửa/xoá + `0033` |
| 00d | — | **0033 answer_count đếm cả xoá mềm** | ✅ **xong** — trigger cũ chỉ `INSERT OR DELETE`, xoá mềm là UPDATE ⇒ câu hỏi ghi "1 câu trả lời" mà mở ra trống. Bug do chính #15 mở ra. |
| 07 | 8 | Push | ✅ **xong** — tap điều hướng (delegate đặt ở `didFinishLaunching`, không phải sau đăng nhập) + toggle ✅ đã thật từ trước |
| 08 | 11 | Tách test khỏi admin | ✅ **xong** — xem mục reframe dưới |
| 00c | — | **0032 profiles_self_update** (P0 thứ ba) | ✅ **xong** |

## Backend chat — ĐÃ CHỨNG MINH chạy (2 user thường, 14:35)

DM tạo qua RPC ✅ · cả 2 thành viên ✅ · Bình gửi 201 ✅ · An reply `parent_id` 201 ✅ · An thả ☀ 201 ✅ ·
`messageSelect` trả **đúng tên** ("Bình Trần"/"An Nguyễn"), không "Ẩn danh" ✅

**Bẫy đã dính và đã chữa:** thêm `reactions:message_reactions(...)` đẻ ra đường thứ HAI từ `messages`
sang `public_profiles` (qua `message_reactions.user_id`) → **PGRST201 ambiguous**, mọi tin không tải được.
Build vẫn XANH, chỉ test thật mới lộ. Phải nêu đích danh FK: `author:public_profiles!messages_user_id_fkey(display_name)`.

## Trạng thái prod sau phase 00

- Migrations: 0026 ✅ · 0027 ✅ (áp 14:06) · 0028 ✅ (áp 14:06) · 0029 ✅
- `public_profiles` cols: `id, display_name, bio, created_at`
- `follows`, `message_reactions`, `is_blocked_pair()`, `trg_block_removes_follows` ✅
- Auth: `uri_allow_list` = `nodie://password-reset,nodie://email-confirmed`; `site_url` = `https://battudao.com`
- Profiles: `mr.dang1305 [admin]` · `An Nguyễn [user]` · `Bình Trần [user]`
- Mật khẩu hai tài khoản test: xem `.env` (`NODIE_TEST_PASSWORD`, gitignored). **Không chép vào plan** —
  đây là tài khoản THẬT trên prod và đăng ký đang mở.

**KHÔNG có `supabase_migrations.schema_migrations`** — migration áp bằng psql tay, CLI không theo dõi. Đừng tin số thứ tự, đối chiếu nội dung.

## 🔴 P0 THỨ BA — cùng gốc rễ, tìm ra 18:40 → `0032`

**"Sửa hồ sơ" không lưu được gì với MỌI user thường.** `PATCH /profiles?id=eq.<mình>` → `[]`, HTTP 200,
DB không đổi. `AuthStore.updateProfile` dùng `.single()` nên 0 dòng biến thành lỗi ném vào mặt user.

Gốc: từ `0007` tới giờ `profiles` chỉ có `profiles_self_read [SELECT]` + `profiles_admin_all [ALL]` —
**không có policy UPDATE cho chính chủ**. RLS chặn UPDATE thì không báo lỗi, chỉ khớp 0 dòng ⇒ im lặng tuyệt đối.
Admin thì `profiles_admin_all` cho qua ⇒ không ai thấy.

`0032` thêm `profiles_self_update` + trigger `tg_profiles_guard_role`. **Trigger là bắt buộc**:
`with check (id = auth.uid())` KHÔNG chặn `role` — user gửi `{"role":"admin"}` cho hàng của chính mình
vẫn thoả ⇒ tự phong admin ⇒ mở khoá 29 policy. Không siết bằng subquery trong policy (`profiles` tự
SELECT `profiles` = đệ quy vô hạn).

Đã verify trên prod: An sửa được hồ sơ mình ✅ · An gửi `role=admin` → vẫn `user` ✅ · An sửa hồ sơ Bình → `[]` ✅

## Item 11 — reframe: nguy hiểm KHÔNG phải "account test có admin"

Nguy hiểm thật: **UITests chạy BẰNG account admin** (`project.yml` cũ tự ghi: *"account này cũng là admin"*).
29 policy có nhánh `or is_admin()` ⇒ test bằng admin **ngắn mạch toàn bộ phân quyền** — nó không kiểm tra
thứ đáng kiểm tra nhất. Đó là lý do DUY NHẤT ba P0 trên sống sót tới tận hôm nay.

**Đã làm:** `.env` NODIE_TEST_* → `an.nodie.test@gmail.com` (role=user). `mr.dang1305` GIỮ admin
(gỡ nó ra là dự án không còn admin nào). Thêm `NODIE_TEST_DISPLAY_NAME` — test không còn đoán tên từ
email (phép đoán đó chỉ đúng nhờ `mr.dang1305` được tạo không kèm metadata nên rơi vào nhánh dự phòng
`split_part(email,'@',1)`; mọi user đăng ký qua app đều có tên riêng).

Seed nội dung THẬT cho tài khoản test: An đăng "Vì sao càng cố ngủ càng tỉnh?", Bình trả lời
→ "Câu hỏi của tôi"/"Trả lời của tôi" có dữ liệu thật thay vì rỗng.

**AuthUITests đảo chiều một khẳng định:** trước bắt `"Quản trị viên"` PHẢI hiện; giờ bắt nó phải VẮNG —
`UserProfile.roleLabel` trả nil với 'user' ("chỉ hiện khi khác 'user' để tránh phân tầng vô nghĩa"),
đúng luật không phân tầng của app. Test giờ kiểm đúng giá trị sản phẩm thay vì kiểm đặc quyền.

→ **16/16 xanh dưới quyền user thường** (Auth 9 · ProfileContent 4 · QAWire 3).

## UITests — 11 ĐỎ (đo lại 19:2x, con số cuối)

Chạy full: **20 test case · 9 pass · 11 fail.** (Bản báo trước ghi "8 đỏ" là SAI — đếm từ một lần
chạy tập con. Gỡ MockData làm gãy thêm `SwipeBackUITests` + `TouchTargetUITests` chứ không chỉ 3 suite Chat.)

| Suite | Kết quả |
|---|---|
| AuthUITests | ✅ 9/9 (chạy bằng user THƯỜNG) |
| ProfileContentUITests · QAWireUITests | ✅ xanh khi chạy riêng (7/7) |
| ChatDetailUITests | ❌ 2 |
| NewMessageUITests | ❌ 1 |
| SwipeActionsUITests | ❌ 2 |
| SwipeBackUITests | ❌ 4 |
| TouchTargetUITests | ❌ 2 |

**11 đỏ ĐỀU khẳng định trên MockData của Chat** — `"Lab trường thọ #3"`, `"Hà Chi"`,
`newMessagePerson-hachi`, `"12 chưa đọc"`. Những hội thoại đó **không còn tồn tại theo thiết kế**.
KHÔNG phải hồi quy hành vi — là test mã hoá cứng thế giới giả vừa bị gỡ.

**CỐ Ý KHÔNG xoá/nới.** Viết lại trên dữ liệu thật; đường đi đã có sẵn:
- An thấy `naobo` ("Khoa học não bộ") + `thongbao` ("Thông báo BTD") — public, RLS cho mọi user đã đăng nhập đọc.
- DM An↔Bình đã có thật (3 tin).
- **Cạm bẫy khi viết lại:** An **không phải thành viên** kênh public ⇒ `canPost=false`, `last_read_at` không có
  ⇒ test unread/swipe (đã đọc · tắt thông báo · rời) sẽ KHÔNG chạy cho tới khi An `join` kênh.
  Đó là RLS đúng, không phải bug — test phải join trước, hoặc seed `channel_members` cho An.

→ **Việc còn nợ, phải làm trước khi ship.**

## Tư vấn model cho việc còn lại

Phase 02 (Chat views) + viết lại 11 UITests trên dữ liệu thật: **Fable** — đây là vùng đã chôn nhiều
bẫy nhất repo (RLS ngắn mạch bởi admin, PGRST201 khi embed 2 đường tới `public_profiles`, test phải
join kênh trước khi assert unread). Build xanh không chứng minh gì ở đây; loại lỗi "im lặng tuyệt đối"
(như `profiles_self_update` thiếu policy) chỉ lộ khi model chủ động đi đo bằng HTTP/psql thật thay vì
tin tài liệu.

## Lưu ý sự cố i18n (agent #15 tự khai)

Agent chạy `git checkout -- Localizable.xcstrings` giữa chừng, xoá mất phần chưa commit rồi tự dựng lại.
**Đã kiểm chứng độc lập, kết luận: KHÔNG mất gì đáng kể.**
- so với HEAD: **0 key mất** (HEAD 224 → hiện 245, +21).
- build lại (SWIFT_EMIT_LOC_STRINGS tự trích) → **không phát sinh key thiếu nào**; mọi chuỗi code dùng đều có.
- **0 key chưa dịch** (40 cái trông "rỗng" là số nhiều nằm trong `variations`, không phải `stringUnit` — báo động giả).
- Chỉ mất `"người theo dõi"` — grep xác nhận **không màn thật nào dùng** (chỉ MockData + comment). Vô hại.

`SWIFT_EMIT_LOC_STRINGS: YES` chính là thứ cứu vụ này — đúng như comment project.yml:
*"Người sẽ quên, trình biên dịch thì không."*

## Acceptance criteria

1. Chat đọc/ghi Supabase thật, không MockData. Gửi tin → hiện ở máy kia (Realtime).
2. Tên người khác hiện ĐÚNG (đo bằng 2 account, admin không thấy bug).
3. Hub + Journey không còn trong tab bar.
4. Build xanh; UITests đang xanh vẫn xanh; key mới đủ 9 ngôn ngữ.

## Rủi ro

- **Ẩn tab = đổi `AppState.tab` enum** → chạm `NodieTabBar`, `RootTabView`, UITests. Tab mặc định phải đổi khỏi `.feed`.
- **Chat wiring chạm `AppState`** — file mà plan 1325 cấm; plan đó nay là của chính session này nên hết xung đột.
- Bug "Ẩn danh" giờ **KHÔNG còn latent** (đã có 3 profile) → phải ship phase 01 cùng lúc.
