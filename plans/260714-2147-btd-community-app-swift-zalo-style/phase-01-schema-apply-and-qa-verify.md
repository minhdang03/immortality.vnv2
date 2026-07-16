# Phase 01 — Áp schema thật + kiểm chứng wire Hỏi đáp

**Status:** ✅ **XONG 2026-07-16** · P1 · thực tế ~3h (gấp đôi dự tính vì lộ 2 bug thật)
**Mở khoá:** 04, 04b, 05.
**Trigger:** scout 2026-07-16 phát hiện `0017`/`0018` viết xong nhưng **CHƯA áp lên prod**.

## Kết quả (2026-07-16)

| Việc | Kết quả |
|---|---|
| Áp `0017` + `0018` | ✅ prod: 14 → **24 bảng**, 14 bảng cũ nguyên vẹn, 6/6 truy vấn verify đúng |
| `0019` cộng đồng đóng (mới) | ✅ `anon` đọc questions/messages/channels = **0/0/0**; authed vẫn đủ. Đo SAU khi seed nên con số có nghĩa |
| `0020` vá FK (mới) | ✅ author_id/user_id 4 bảng → `profiles`; PostgREST nhúng được `author` |
| Seed `seed_nodie.sql` | ✅ 2 kênh (1 broadcast) · 4 tin · 1 câu hỏi · 2 trả lời · 2 reply lồng. Trigger `answer_count=2` + `last_message_at` sống |
| **Wire Hỏi đáp chạy thật** | ✅ `QAWireUITests` 3/3 — list + detail + reply lồng + tên tác giả nhúng |
| Bộ test | ✅ **27/27 pass** (trước: 7 fail) |

### Bug THẬT lộ ra (chỉ chạy thật mới thấy — đúng mục đích của phase)

1. **`0017` sai FK → toàn bộ Hỏi đáp rỗng.** `author_id` trỏ `auth.users`, `profiles.id` cũng trỏ `auth.users` → hai bảng là ANH EM, PostgREST không nhúng được `author:profiles(...)` → `PGRST200`. Không phải lỗi RLS/giao diện. Vá bằng `0020` (Đăng duyệt). `messages.user_id` vá cùng vì phase 04 dính y hệt.
2. **`.alert(isPresented: .constant(...))` trong QuestionListView** — `.constant` thì SwiftUI không có đường set false → không tự đóng alert được. Đổi sang Binding hai chiều. (Không phải nguyên nhân vụ đông cứng bên dưới, nhưng là bug tiềm ẩn thật.)

### Vụ "app đông cứng sau đăng nhập" — KHÔNG phải bug app

Test đăng nhập bằng `typeText` → **mọi phần tử `hittable=false` từ T+3s**, tap toạ độ cũng không xuyên, ảnh chụp lại trông bình thường. Truy ra: **lớp AutoFill "Lưu mật khẩu?" của iOS** — remote view của tiến trình khác, phủ toàn màn, vô hình với `XCUIScreen.screenshot()` và không nằm trong `app.alerts` lẫn `springboard.alerts`.

Chứng minh: thêm `--uitest-auto-login` (gọi thẳng SDK, **JWT/RLS vẫn thật**, chỉ bỏ khâu gõ) → hết đông cứng, test còn nhanh gấp đôi. ⇒ **User thật không bị ảnh hưởng; bản TestFlight an toàn.** Đường gõ tay giữ lại ở `testSignInFormLetsUserIn`.

### Việc phát sinh ngoài kế hoạch (Đăng chốt trong lúc chạy)

- **Ô "Tên hiển thị" lúc đăng ký** — trước đó trigger tự lấy `split_part(email,'@',1)` ⇒ **lộ một nửa email** của user cho cả cộng đồng. Trigger đã sẵn đọc `raw_user_meta_data->>'display_name'` nên chỉ sửa client. Kiểm chứng thật: gửi "Nguyễn Văn An" → `profiles.display_name` nhận đúng; user test đã xoá sạch.
- **`0021` (Đăng viết) — áp + kiểm chứng:** RPC `delete_account()` SECURITY DEFINER. Test thật: user tự xoá → `auth.users` mất, `profiles` cascade, câu hỏi họ đăng **ở lại với `author_id=NULL`** (khuôn Reddit/HN), anon gọi RPC → `42501 permission denied`. ⚠️ Khuôn này **đảo quyết định "hard-delete + grace 30 ngày"** ghi ở phase 05 — Đăng tự đổi ý khi code, phase 05 cần cập nhật theo.

## Context links

- [plan.md](plan.md) — quyết định gốc, quy tắc scale
- `supabase/migrations/0017_nodie_community.sql` — channels/channel_members/messages/questions/answers/reports/blocks/device_tokens + RLS + trigger
- `supabase/migrations/0018_nodie_qa_engagement.sql` — vote/lit/is_best/answer_replies/answer_reactions
- `supabase/README.md` — quy trình áp migration
- `apps/nodie-ios/NODIE/Features/QA/QAStore.swift` (263 dòng) + `QAModels.swift` — code cần kiểm chứng
- [phase-02](phase-02-auth-and-profile.md) — auth thật đã xong, tài khoản admin `mr.dang1305@gmail.com` uid `46328fcb…`

## Overview

Áp `0017` + `0018` lên Supabase prod bằng `psql`, verify từng thứ tồn tại thật, seed dữ liệu tối thiểu, rồi **chạy thật wire Hỏi đáp lần đầu tiên**.

## Key insights (scout 2026-07-16 — đã xác minh, không phải suy đoán)

| Phát hiện | Ảnh hưởng |
|---|---|
| Prod chỉ có **14 bảng**: `agent_audit_log, api_keys, categories, comments, contacts, content, content_categories, donation_contacts, donations, profiles, reading_events, settings, slug_redirects, translations` | **KHÔNG có** channels/messages/questions/answers/answer_replies. 0017+0018 chưa chạy. |
| ⇒ `QAStore.swift` **chưa bao giờ chạy với bảng thật** | Phase 03 là **code chưa kiểm chứng**, không phải code đã chạy. plan.md ghi "03: UI xong" gây hiểu nhầm — đã sửa. |
| Phụ thuộc `public.content(id)` + `public.is_admin()` **đã tồn tại** (0002, 0005) | 0017 áp sạch, không cần vá thứ tự. |
| **Supabase CLI KHÔNG có trên máy** (`which supabase` → not found). `psql` có tại `/opt/homebrew/bin/psql` | Áp bằng `psql "$SUPABASE_DB_URL" -f`, không `supabase db push`. |
| `.env` (gitignored) có `SUPABASE_DB_URL` + `SUPABASE_SECRET_KEY` | Đủ credential. **Không** đưa vào repo/app. |
| Migration mới nhất là `0016` (không có `0010`) | 0017/0018 đúng thứ tự. |
| RLS **default-deny** + chưa seed | User đăng nhập mới thấy **app rỗng**. Không seed thì tưởng code hỏng. Seed là một phần bắt buộc của phase, không phải tuỳ chọn. |
| **QĐ Đăng 2026-07-16: cộng đồng ĐÓNG** — phải đăng nhập mới đọc Q&A/kênh public | Cần migration `0019` vá RLS: thêm `(select auth.uid()) is not null` vào read policy. Login = email (miễn phí) nên không tốn SMS. Giống app IG/X (bắt login). Giải quyết Risk #6 + Unresolved #1 cũ. |

## Requirements

**Chức năng**
1. `0017` + `0018` áp thành công lên prod, không đụng 14 bảng cũ.
2. Verify bằng truy vấn hệ thống: bảng / RLS bật / policy / trigger / function / index — không tin "chạy không báo lỗi".
3. Seed: ≥1 kênh public thường + ≥1 kênh broadcast + membership của admin + vài tin nhắn + 1 câu hỏi mẫu.
4. Chạy app thật, đi hết luồng Hỏi đáp (list → detail → đặt câu hỏi → trả lời → ▲ → ☀ → Hay nhất), đối chiếu bằng `psql`.
5. Lỗi phát hiện trong QA wire → sửa tại phase này (đó là mục đích của phase).

**Phi chức năng**
- Web `battudao.com` (Vercel) không được rớt — 0017/0018 chỉ `create`, không `alter`/`drop` bảng cũ.
- Áp thẳng PROD, không có staging → mọi lệnh chạy trong transaction.

## Architecture — luồng dữ liệu

```
.env (SUPABASE_DB_URL, gitignored)
   └─ psql --single-transaction -v ON_ERROR_STOP=1
        ├─ 0017_nodie_community.sql   → 8 bảng + 2 helper + 2 trigger + RLS
        ├─ 0018_nodie_qa_engagement.sql → 2 bảng + 3 cột + 1 trigger + set_best_answer()
        └─ seed_nodie.sql             → channels/channel_members/messages/questions/answers

Simulator (anon key + JWT của mr.dang1305)
   └─ QAStore → PostgREST → RLS → questions/answers/answer_replies/answer_reactions
        ↑ đối chiếu ngược bằng psql (superuser, bypass RLS)
```

## Related code files

**Áp, KHÔNG sửa:** `supabase/migrations/0017_nodie_community.sql`, `supabase/migrations/0018_nodie_qa_engagement.sql`
**Tạo:** `supabase/migrations/0019_nodie_rls_authed_only.sql`, `supabase/seed_nodie.sql`

> `0019` vá RLS theo QĐ "cộng đồng đóng" (Đăng chốt 2026-07-16). **Migration mới, không sửa 0017** — 0017 sẽ áp lên prod ở phase này rồi, sửa file đã áp là tạo lệch giữa file và DB. `drop policy` + `create policy` bản có check auth cho: `questions_read`, `answers_read`, `answer_replies_read`, `channels_read`, `messages_read`.
> Không nhét vào `supabase/seed.sql` — file đó là default của web (settings/translations). Trộn vào là hai vòng đời khác nhau dính nhau.

**Có thể phải sửa (nếu smoke test bắt lỗi):** `apps/nodie-ios/NODIE/Features/QA/QAStore.swift`, `apps/nodie-ios/NODIE/Features/QA/QAModels.swift`

## Implementation steps

### 1. Chụp trạng thái trước (để so sau)
```bash
cd /Users/dang/Documents/ClaudeCode/apps/immortality-vn
set -a; source .env; set +a
psql "$SUPABASE_DB_URL" -c "\dt public.*" | tee /tmp/nodie-tables-before.txt   # phải đúng 14 bảng
psql "$SUPABASE_DB_URL" -c "select count(*) from public.content;"              # phụ thuộc của 0017
psql "$SUPABASE_DB_URL" -c "select proname from pg_proc where proname = 'is_admin';"
```

### 2. Kiểm tra lịch sử migration
```bash
psql "$SUPABASE_DB_URL" -c "select version from supabase_migrations.schema_migrations order by version;" 2>&1 | tail -5
```
- Có bảng → sau khi áp phải `insert` thủ công `0017`,`0018` để `supabase db push` sau này không áp lại.
- Không có → ghi chú lại, **không tự tạo**.

### 3. Áp 0017 rồi 0018 (mỗi file một transaction)
```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 --single-transaction -f supabase/migrations/0017_nodie_community.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 --single-transaction -f supabase/migrations/0018_nodie_qa_engagement.sql
```
`--single-transaction` + `ON_ERROR_STOP=1`: lỗi giữa chừng thì rollback sạch, **không để lại schema nửa vời**. Đây là điều kiện để rollback rẻ (xem Rollback bên dưới).

### 4. Verify — 6 truy vấn, không truy vấn nào được phép trả sai
```sql
-- (a) 10 bảng mới
select tablename from pg_tables where schemaname='public' and tablename in
 ('channels','channel_members','messages','questions','answers','reports','blocks',
  'device_tokens','answer_replies','answer_reactions') order by 1;                  -- kỳ vọng 10 dòng

-- (b) RLS bật hết
select relname, relrowsecurity from pg_class
 where relname in ('channels','channel_members','messages','questions','answers','reports',
                   'blocks','device_tokens','answer_replies','answer_reactions');    -- relrowsecurity = t hết

-- (c) policy
select tablename, count(*) from pg_policies where schemaname='public'
 and tablename in ('channels','channel_members','messages','questions','answers','reports',
                   'blocks','device_tokens','answer_replies','answer_reactions')
 group by 1 order by 1;                                                              -- không bảng nào 0

-- (d) trigger
select tgname from pg_trigger where tgname in
 ('trg_answers_count','trg_message_inserted','trg_answer_reaction_count');           -- 3 dòng

-- (e) function
select proname from pg_proc where proname in
 ('is_channel_member','is_channel_mod','set_best_answer','tg_answers_count',
  'tg_message_inserted','tg_answer_reaction_count');                                 -- 6 dòng

-- (f) index quyết định (quy tắc scale #3 của plan)
select indexname from pg_indexes where tablename='messages';                         -- có idx_messages_channel_created
```

### 5. Áp `0019` — RLS cộng đồng đóng (QĐ Đăng 2026-07-16)

Viết `supabase/migrations/0019_nodie_rls_authed_only.sql`: mỗi policy đọc → `drop policy if exists` rồi tạo lại có `(select auth.uid()) is not null`.

```sql
-- mẫu cho questions; làm tương tự answers/answer_replies/channels/messages
drop policy if exists questions_read on public.questions;
create policy questions_read on public.questions
  for select using ((select auth.uid()) is not null and (deleted_at is null or public.is_admin()));
```
`(select auth.uid())` chứ không `auth.uid()` trần — Postgres cache được initplan, không gọi lại mỗi dòng (khuyến nghị chính thức của Supabase về hiệu năng RLS).

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 --single-transaction -f supabase/migrations/0019_nodie_rls_authed_only.sql
```

**Verify bề mặt anon — BẮT BUỘC, đây là bài kiểm tra quyết định của phase:**
```sql
set local role anon;
select count(*) from public.questions;   -- kỳ vọng 0
select count(*) from public.messages;    -- kỳ vọng 0
select count(*) from public.channels;    -- kỳ vọng 0
reset role;
```
Ba số **phải là 0**. Khác 0 = anon còn đọc được = chưa đóng. Ghi con số thật vào phase này.

Sau đó verify chiều ngược: đăng nhập thật trong app (bước 7) **vẫn phải thấy** dữ liệu — vá quá tay thành chặn cả user đã đăng nhập thì app rỗng.

### 6. Seed — `supabase/seed_nodie.sql`

Nội dung tối thiểu (uid admin `46328fcb…` truyền qua `-v admin_uid=`):
- `channels`: `('naobo','Khoa học não bộ','public', is_broadcast=false)` + `('thongbao','Thông báo BTD','public', is_broadcast=true)`
- `channel_members`: admin vào cả 2, `role='mod'`
- `messages`: 3 tin trong `naobo` — **`created_at` đặt tường minh, giãn > 2 giây** (xem Rủi ro #1)
- `questions` + 2 `answers` của admin

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 --single-transaction \
  -v admin_uid="'46328fcb-...'" -f supabase/seed_nodie.sql
psql "$SUPABASE_DB_URL" -c "select slug,kind,is_broadcast from public.channels;"
psql "$SUPABASE_DB_URL" -c "select title,answer_count from public.questions;"   -- answer_count = 2 → trigger sống
```

### 7. Smoke-verify wire Hỏi đáp — lần chạy thật đầu tiên
```bash
cd apps/nodie-ios
./scripts/generate-secrets-xcconfig.sh && xcodegen generate
xcrun simctl list devices available | grep iPhone            # chọn 1 máy có thật
xcodebuild -project NODIE.xcodeproj -scheme NODIE \
  -destination 'platform=iOS Simulator,name=iPhone 16' build | tail -5
```
Chạy simulator, đăng nhập `mr.dang1305@gmail.com`, tab Hỏi đáp, làm đủ 6 việc — mỗi việc đối chiếu bằng `psql`:

| Thao tác trong app | Truy vấn đối chiếu | Kỳ vọng |
|---|---|---|
| Mở tab Hỏi đáp | — | thấy câu hỏi **seed** (không phải mock) |
| Đặt câu hỏi mới | `select title, author_id from questions order by created_at desc limit 1;` | đúng title + `author_id` = uid admin |
| Trả lời | `select answer_count from questions where id='…';` | +1 (trigger `trg_answers_count`) |
| ▲ vote, rồi bấm lại | `select vote_count from answers where id='…';` | 1 → 0 |
| ☀ lit trên reply | `select lit_count from answer_replies where id='…';` | 1 |
| Chọn "Hay nhất" | `select count(*) from answers where question_id='…' and is_best;` | đúng **1** |

Sai chỗ nào → sửa `QAStore`/`QAModels` tại đây, ghi lại nguyên nhân vào phase này (không im lặng vá).

### 8. Ghi migration history (chỉ nếu bước 2 thấy bảng)
```sql
insert into supabase_migrations.schema_migrations(version) values ('0017'),('0018');
```

## Todo list

- [ ] Chụp `\dt` trước + xác nhận `content` và `is_admin()` tồn tại
- [ ] Kiểm tra `supabase_migrations.schema_migrations`
- [ ] Áp `0017` (single-transaction)
- [ ] Áp `0018` (single-transaction)
- [ ] Verify (a)–(f) — 6 truy vấn đều đúng
- [ ] Viết + áp `0019` (RLS cộng đồng đóng)
- [ ] Verify `anon` = **0/0/0** + ghi con số thật vào phase
- [ ] Verify ngược: user đã đăng nhập vẫn đọc được (không vá quá tay)
- [ ] Viết + chạy `supabase/seed_nodie.sql`
- [ ] `xcodegen generate` + build sạch
- [ ] Smoke test 6 thao tác Hỏi đáp, mỗi thao tác đối chiếu psql
- [ ] Sửa lỗi QA wire (nếu có) + ghi nguyên nhân
- [ ] Ghi migration history (nếu áp dụng)
- [ ] Cập nhật plan.md: 03 từ "UI xong" → "đã kiểm chứng"

## Success criteria

- `\dt public.*` = **24 bảng** (14 cũ + 10 mới), 14 bảng cũ **nguyên vẹn**
- 6 truy vấn verify đều đúng kỳ vọng
- `anon` đọc `questions`/`messages`/`channels` → **0/0/0** (cộng đồng đóng), user đã đăng nhập vẫn thấy đủ
- `battudao.com` vẫn chạy (mở trang chủ + 1 bài viết)
- 6 thao tác Hỏi đáp đều **đối chiếu khớp bằng psql** — không có "nhìn thấy trên màn là được"
- Tab Hội thoại vẫn hiện MockData (đúng — phase 04 mới đụng)

## Risk assessment

| # | Rủi ro | Xác suất × Tác động | Giảm thiểu |
|---|---|---|---|
| 1 | **Slow-mode trigger 2s cắn lúc seed.** `now()` là **hằng số trong một transaction** → chèn 2 tin cùng user/cùng kênh trong 1 transaction luôn cho `now() - last_ts = 0 < 2s` → `raise exception`. Seed sẽ **luôn fail** nếu để `created_at` mặc định. | Cao × Cao | Seed đặt `created_at` tường minh lùi về quá khứ, giãn > 2s (vd `now()-'1 hour'`, `now()-'50 min'`, `now()-'40 min'`) |
| 2 | **Migration không idempotent.** `create table if not exists` + `create or replace function` an toàn, nhưng **`create policy` KHÔNG** — chạy lại 0017 sẽ fail ở policy đầu tiên. | Trung × Trung | `--single-transaction` → fail thì rollback sạch, không nửa vời. Chỉ chạy đúng 1 lần. |
| 3 | Áp bằng `psql` không ghi vào `supabase_migrations.schema_migrations` → sau này ai cài CLI rồi `supabase db push` sẽ áp lại → fail | Trung × Trung | Bước 2 + bước 8 |
| 4 | **QAStore chưa từng chạy** → có thể lỗi decode `Date`/`UUID`, hoặc `.in("target_id", values: [UUID])` không hợp lệ với PostgREST 2.49 | Trung × Trung | Đây là **mục tiêu chính** của phase, không phải việc phụ. Lỗi → sửa tại chỗ. Nếu `[UUID]` không nhận → map `\.uuidString`. |
| 5 | Áp thẳng prod, không staging | Thấp × Cao | 0017/0018 chỉ `create`; snapshot `\dt` trước; single-transaction |
| 6 | **`anon` đọc được toàn bộ Q&A + kênh public.** Policy `questions_read` / `channels_read` của 0017 **không kiểm tra đã đăng nhập** — trong khi comment ở 0017 ghi *"authed đọc tất cả"*. Anon key nằm public trong bundle app → ai cũng scrape được. | Cao × Trung | **ĐÃ QUYẾT (Đăng 2026-07-16): cộng đồng đóng.** Migration `0019` ở bước 5 vá; verify `anon` phải trả 0/0/0. |
| 8 | **Vá RLS quá tay** → chặn luôn user đã đăng nhập, app rỗng dù đúng tài khoản. Dễ xảy ra vì `0019` sửa 5 policy cùng lúc. | Trung × Cao | Bước 5 verify hai chiều: anon = 0 **và** authed vẫn thấy dữ liệu (bước 7 smoke test là bằng chứng) |
| 7 | Seed sai uid admin → RLS chặn khi test | Thấp × Thấp | `select id, role from profiles where role='admin';` trước khi seed |

**Rollback:** trước bước 6 — `drop table if exists public.answer_reactions, public.answer_replies, public.device_tokens, public.blocks, public.reports, public.answers, public.questions, public.messages, public.channel_members, public.channels cascade;` + `drop function if exists public.is_channel_member(uuid), public.is_channel_mod(uuid), public.set_best_answer(uuid);`. An toàn vì **không bảng cũ nào tham chiếu tới bảng mới** (chiều FK chỉ đi một hướng: mới → cũ). Sau khi có dữ liệu user thật thì rollback = mất dữ liệu → không còn là rollback.

## Security considerations

- `SUPABASE_DB_URL` / `SUPABASE_SECRET_KEY` chỉ ở `.env` gitignored. **Không** vào repo, không vào app, không vào phase file này.
- `psql` chạy quyền superuser → **bypass RLS**. Cái nhìn thấy bằng psql ≠ cái user thấy. Mọi khẳng định về quyền phải kiểm bằng `set local role anon` / đăng nhập thật trong app.
- Seed không tạo user mới, chỉ dùng uid admin đã có.
- `set_best_answer` là `SECURITY DEFINER` + tự kiểm `auth.uid()` → verify bằng cách đăng nhập tài khoản **khác** rồi thử chọn Hay nhất (phải bị từ chối). Nếu chưa có tài khoản thứ 2 → ghi nợ sang phase 04.

## Next steps

Mở khoá phase 04 (Hội thoại). 04b và 05 phụ thuộc gián tiếp qua 04.

## Unresolved questions

1. ✅ **ĐÃ TRẢ LỜI 2026-07-16 — cộng đồng ĐÓNG.** Phải đăng nhập mới đọc Q&A + kênh public. Thực hiện bằng migration `0019` (bước 5). Lý do Đăng cân nhắc: login là email/mật khẩu (miễn phí) — đóng cộng đồng **không** kéo theo chi phí SMS OTP. Đánh đổi đã chấp nhận: mất SEO/khách vãng lai đọc thử, đổi lấy chống scrape + đúng tính chất "cộng đồng riêng kiểu Zalo".
2. `supabase_migrations.schema_migrations` có tồn tại trên prod không? Nếu không, 0001–0016 đã áp bằng cách nào — và có nên dựng lại lịch sử không?
3. Seed kênh nào? Prototype có `naobo` / `lab` / `hachi` / `vutru` / `quan`. Seed đủ 5 cho giống prototype hay chỉ 2 cho đủ test?
4. `channels.linked_content_id` trỏ `content(id)` — có kênh nào cần gắn bài viết ngay từ v1 không, hay để phase 06?
