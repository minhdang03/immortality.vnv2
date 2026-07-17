# Phase 03 — Seed kênh + nội dung mồi từ content sẵn có

**Mục:** D-01 (P0) · **Đợt A** · Ước lượng **0.5 ngày** · Status: ✅ 18/07 09:2x

## Kết quả (Fable, 18/07 — Đăng duyệt: cả 12 câu · tác giả = tk ảo · không thêm kênh)

- ✅ 4 persona tạo qua Admin API (Minh Tâm/Thu Hằng/Quang Duy/Ngọc Lan,
  `seed-thanh-vien-0X@battudao.com`, mật khẩu ngẫu nhiên KHÔNG lưu — cần thì reset Admin API).
- ✅ 12 câu hỏi mồi từ `content` type=khaitri (`vi_question` thật), chia vòng tròn 4 persona,
  `body` để trống (vi_summary là giọng ĐÁP, nhét vào thân câu hỏi là sai vai), topic `khai trí`.
- ✅ File: `scripts/seed-launch-questions.sh` + `supabase/seed_nodie_launch_questions.sql` —
  **KHÔNG chiếm số migration, KHÔNG ghi sổ** (seed là dữ liệu — kỷ luật ghi ở đầu 0035;
  điều này ĐÈ bước 7 cũ của phase này).
- ✅ Dry-run rollback → commit → chạy lần 2 không nhân bản (15 câu giữ nguyên = 3 cũ + 12 mới).
- ✅ Verify HTTP bằng JWT `role='user'`: thấy đủ 12 câu + tên persona (embed
  `questions_author_id_fkey`). Kênh public 2 cái có sẵn — acceptance ≥2 kênh + ≥5 câu ĐẠT.
- Fixture `[uitest-chat-seed]` không bị đụng.
**Model:** Fable — seed phải VISIBLE qua RLS với tài khoản role='user', kiểm bằng HTTP thật. Đây đúng loại lỗi im lặng: `insert` xanh, `select` của user thường trả rỗng, không ai hay.

## Context links

- Report gốc: `apps/nodie-ios/plans/reports/production-gap-analysis-260717-1949-beyond-ux-audit-appstore-ops-report.md` (D-01)
- Bẫy RLS xoá mềm: mọi `select` phải tự lọc `deleted_at is null`
- Bẫy admin: 29 policy RLS có nhánh `or is_admin()` — **test bằng admin = không test gì**

## ⚠️ SỬA SỰ THẬT CỦA plan.md (đo lại bằng psql 17/07 21:1x)

`plan.md` ghi ở mục *"Sự thật đã đo — đừng đo lại"*:

> `stories`/<code>khaitri</code> ĐÃ ở Supabase (`0002_content.sql`, `0013_content_extra_jsonb.sql`) ⇒ D-01 là SQL thuần

**Kết luận ĐÚNG, chi tiết SAI — đừng viết SQL theo câu đó.** Sự thật:

- **KHÔNG có bảng `stories`, KHÔNG có bảng `khaitri`.** Chỉ có **một bảng hợp nhất `public.content`** với cột `type`.
- `select ... from stories` → lỗi ngay. Phải là `from public.content where type='story'`.

Đo được (21:1x):

| Nguồn | Số dòng |
|---|---|
| `content` type=`story`, status=`published` | **37** |
| `content` type=`khaitri`, status=`published` | **16** (+1 draft) |
| `content` type=`article`, status=`published` | 20 |
| `content` có `vi_question` không rỗng (type=khaitri) | **17** ← nguồn mồi tốt nhất |
| `questions` | **3** |
| `channels` | **6** |
| `profiles` | **3** |

**Kênh public ĐÃ CÓ 2 cái** — report ghi "user vào thấy sa mạc" là quá lời ở phần kênh:

| slug | title | kind | is_broadcast |
|---|---|---|---|
| `thongbao` | Thông báo BTD | public | **t** |
| `naobo` | Khoa học não bộ | public | f |

3 dòng `dm` + 1 `group` còn lại là **fixture UITest** (`[uitest-chat-seed]`) đang nằm lẫn trong prod — **đừng xoá, đừng đụng**, suite đang dựa vào chúng.

⇒ **Việc thật của phase này thu hẹp lại:** thiếu chủ yếu là **câu hỏi mồi** (3 < 5 mà acceptance đòi), không phải kênh.

## Schema thật (đo 21:1x — dùng đúng tên cột này)

```
public.content         id:text, type:text, status:text, vi_title, en_title, vi_summary, en_summary,
                       vi_body, en_body, vi_slug, en_slug, vi_question, en_question, order_index,
                       content_date, category_id, source_ref, content_hash, created_by, tags:jsonb,
                       seo_meta:jsonb, thumbnail_url, created_at, updated_at, fts_vi, fts_en,
                       embedding, extra:jsonb
public.questions       id, author_id, title, body, lang, topic, answer_count, created_at, edited_at, deleted_at
public.channels        id, slug, title, kind, is_broadcast, linked_content_id, created_by,
                       last_message_at, created_at, emoji, avatar_hex, badge_hex
public.channel_members channel_id, user_id, role, joined_at, last_read_at, muted_until
```

`content.id` là **text**; `questions.id` là uuid ⇒ không nhét thẳng id content sang được. Muốn lần ngược
nguồn thì ghi vào `questions.topic` hoặc bỏ hẳn — **đừng đẻ cột mới cho việc seed một lần**.

## Overview

Prod có 3 profile và 3 câu hỏi. Người thật đầu tiên mở app: Hỏi đáp gần như trống. Không có UI admin
tạo kênh (`grep createChannel` = 0 kết quả) — đúng product rule "chỉ admin tạo nhóm", nên seed = SQL có version.

## Key insights

- **`type='khaitri'` là nguồn mồi tự nhiên nhất**: 17 dòng đã có sẵn `vi_question` — đúng hình dạng một câu hỏi, không phải bịa.
  `vi_question` → `questions.title`; `vi_body`/`vi_summary` → `questions.body`.
- **Đăng dưới tên ai:** kế hoạch là tài khoản của Đăng — đúng nguyên tắc *"Đăng = ngang hàng, không phải bề trên"*.
  **Câu hỏi mở #4 của plan — phải xác nhận trước khi ghi prod.**
- **Insert xanh ≠ user thấy.** `questions` có RLS; policy có nhánh `or is_admin()`. Verify bằng tài khoản
  `NODIE_TEST_*` (role='user'), qua **HTTP PostgREST thật**, không phải psql superuser (psql bỏ qua RLS).
- **Lọc `deleted_at is null`** ở mọi câu verify — bẫy đã trả giá.

## Requirements

- Tài khoản role='user' mở app thấy **≥2 kênh** (đã đạt sẵn) + **≥5 câu hỏi mồi** (đang 3 → thiếu).
- Seed **idempotent**: chạy lại không nhân bản. Khoá tự nhiên: `questions.title` hoặc `channels.slug`.
- Không đụng fixture `[uitest-chat-seed]`.
- Nội dung mồi là nội dung **thật của Đăng**, không lorem, không bịa.

## Files

**Tạo**
- `supabase/migrations/0038_seed_launch_content.sql`

> **Số 0038, KHÔNG phải 0035.** `0034` là mới nhất trên đĩa, nhưng **phase 02 đã nhận trước
> `0035`(sổ) · `0036`(push_failures) · `0037`(app_events)** — và dependency graph của `plan.md` là
> `02 ──> 03`, nên phase này luôn chạy sau. Vẫn **`ls supabase/migrations/` ngay trước khi viết**:
> số trôi 3 lần/giờ, và phase 02 có thể đã đẩy xa hơn.

**Sửa:** không · **Xoá:** không

## Implementation steps

1. **Đối chiếu số migration** + `ls supabase/migrations/`. Đừng tin `0035` trong file này.
2. **Rút danh sách mồi cho Đăng duyệt** — chưa ghi gì:
   ```sql
   select id, vi_question, left(coalesce(vi_summary, vi_body), 120) as tom_tat
   from public.content
   where type='khaitri' and status='published'
     and vi_question is not null and vi_question <> ''
   order by order_index nulls last, content_date desc
   limit 12;
   ```
   → đưa Đăng chọn (mục tiêu ≥5, nên lấy dư để chọn). **GATE: không qua bước 3 khi Đăng chưa gật.**
3. **Xác nhận author** = uid tài khoản Đăng (câu hỏi mở #4). Lấy uid bằng `select id, display_name from public.profiles;` (3 dòng, dễ nhìn).
4. **Kênh:** đã có `thongbao` + `naobo` ⇒ acceptance đạt. Hỏi Đăng có muốn thêm 1 kênh chủ đề trường thọ
   (Aion v3) không. **Nếu không → bỏ hẳn phần kênh, đừng thêm cho đủ số.**
5. **Viết `0035`** — idempotent, dùng đúng tên cột bảng trên:
   ```sql
   insert into public.questions (author_id, title, body, lang, topic)
   select :'dang_uid'::uuid, c.vi_question, coalesce(c.vi_summary, c.vi_body), 'vi', c.category_id
   from public.content c
   where c.type='khaitri' and c.status='published'
     and c.id = any(:'ids_da_duyet')
     and not exists (select 1 from public.questions q where q.title = c.vi_question)
   ;
   ```
   (khung minh hoạ — chốt lại theo danh sách Đăng duyệt)
6. **Dry-run**: `begin; \i 0035; select count(*) from questions; rollback;` — **đừng `\i` bên trong transaction ngoài** (bẫy đã trả giá).
7. `commit` khi số liệu đúng. Ghi vào `_applied_migrations` (sổ của phase 02).
8. **Verify bằng role='user' qua HTTP** — xem Success criteria.

## Todo

- [ ] Đối chiếu số migration thật
- [ ] Rút danh sách 12 ứng viên mồi → **Đăng duyệt**
- [ ] Xác nhận uid tác giả (câu hỏi mở #4)
- [ ] Hỏi Đăng có thêm kênh trường thọ không
- [ ] Viết `00XX_seed_launch_content.sql` idempotent
- [ ] Dry-run rollback → commit
- [ ] Ghi sổ `_applied_migrations`
- [ ] Verify bằng tài khoản role='user' qua HTTP thật
- [ ] Chạy `0035` lần 2 → chứng minh không nhân bản

## Success criteria

```bash
# PHẢI dùng token của tài khoản role='user' (NODIE_TEST_*), KHÔNG phải admin, KHÔNG phải service_role.
curl -sS "$SUPABASE_URL/rest/v1/questions?select=id,title&deleted_at=is.null" \
  -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $USER_JWT" | jq 'length'   # >= 5

curl -sS "$SUPABASE_URL/rest/v1/channels?select=slug,title&kind=eq.public" \
  -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $USER_JWT" | jq 'length'   # >= 2
```
- Chạy `0035` hai lần → `select count(*) from questions` không đổi ở lần hai.
- Mở app bằng tài khoản thường: tab Hỏi đáp có ≥5 câu, tab Chat có ≥2 kênh.
- Fixture `[uitest-chat-seed]` còn nguyên; suite UITest không đỏ thêm.

## Risks + rollback

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Viết SQL theo tên bảng `stories`/`khaitri` của plan.md → lỗi ngay | **Cao** | Mục "SỬA SỰ THẬT" ở trên; dùng `content` + `type` |
| Insert xanh nhưng RLS giấu khỏi user thường | **Cao** | Verify bằng `USER_JWT` qua HTTP, không psql |
| Seed chạy 2 lần → câu hỏi nhân đôi trên prod | Trung bình | `not exists` theo `title`; test chạy lần 2 |
| Ghi đè/xoá nhầm fixture uitest | Trung bình | Chỉ `insert`, không `delete`/`update`; `where` không chạm slug uitest |
| Nội dung mồi sai giọng / chưa được duyệt | Trung bình | GATE bước 2 — Đăng gật mới ghi |

**Rollback:** ghi lại id đã insert; `delete from public.questions where id = any(...)`. Chỉ đụng dòng seed
tự sinh, không đụng nội dung người thật đăng.

## Security

- Chạy bằng `SUPABASE_DB_URL` (psql), **không** dán service_role key vào script.
- Seed không mở thêm policy nào. Nếu user thường không thấy → **sửa dữ liệu/thành viên kênh, đừng nới RLS** để "cho xong".

## Next

→ Phase 07: demo account cho App Review phải thấy đúng nội dung mồi này (và **không** dùng `an.nodie.test` — reviewer làm bẩn fixture là suite đỏ).
