# Phase 02 — Supabase ops: sổ migration, log push hỏng, bảng sự kiện

**Mục:** C-02 (P1) · B-03 (P1) · B-02 phần SQL (P1) · **Đợt A** · Ước lượng **0.5 ngày** · Status: ✅ 18/07 08:2x (còn 1 việc tay: deploy edge function)

## Kết quả (Fable, 18/07)

- ✅ `0035` sổ `_applied_migrations`: backfill 33 file (0010 chưa từng tồn tại — sổ phản ánh đúng),
  object đại diện verify prod trước khi ghi (trg_push_on_message, trg_answers_count, is_admin,
  create_dm, chat_media_read…). Prod: **36 dòng**, chạy lại không nhân đôi.
- ✅ `0036` `push_failures` + trigger ghi `trigger_exception` — bản fn chép từ
  `pg_get_functiondef` TRÊN PROD (khớp repo, không drift), chỉ thêm khối ghi sổ bọc
  exception 2 tầng.
- ✅ `0037` `app_events` insert-only, trần payload 64KB.
- ✅ Dry-run cả 3 trong MỘT transaction → rollback sạch → áp thật → chạy lần 2 idempotent.
- ✅ RLS verify HTTP bằng JWT **role='user'**: đọc app_events/push_failures/_applied_migrations
  đều `[]` · ghi app_events của mình **201** · ghi giả user khác **403** · admin đọc được (psql).
- ✅ Edge function `push-on-message` ghi `push_failures` mỗi token status≠200 (kèm user_id
  người nhận, apns_env) — nuốt lỗi ghi sổ, giữ bất biến 0031.
- ⚠️ **Còn tay Đăng:** deploy edge function (CLI bị chặn permission trong session):
  `supabase functions deploy push-on-message --project-ref dzctvmrlsxwkcuidsqzk`
  Sau deploy, test B-03 sống: chèn token rác vào `device_tokens` → gửi tin →
  `select * from push_failures order by created_at desc limit 5;` phải có dòng
  `BadDeviceToken` → dọn token rác.
**Model:** Fable — mutation prod DB bằng psql tay + sửa trigger trong vùng bẫy đã trả giá (pg_net sai schema 0031, EXCEPTION nuốt lỗi); phải dry-run rollback và verify bằng psql thật, không tin số thứ tự file.

## Context links

- Report: `...-beyond-ux-audit-appstore-ops-report.md` (C-02, B-03, B-02)
- Gốc B-03: `supabase/migrations/0031_nodie_fix_push_trigger_net_schema.sql` — bọc `exception when others` để push hỏng không chặn gửi tin (đúng), nhưng push chết cả tuần cũng không ai hay.
- Edge function: `supabase/functions/push-on-message/index.ts` — **đã tính sẵn** `results` có `status` + `reason` per token, chỉ là trả về response rồi vứt (dòng ~153-158).
- Quy ước migration: `CLAUDE.md` → Supabase — migrations

## Overview

Ba việc backend không đụng iOS, chạy được ngay song song với phiên 1933.

- **C-02:** không có `supabase_migrations.schema_migrations`, áp psql TAY ⇒ **số thứ tự file không chứng minh nó đã chạy trên prod**. 0035+ sắp ra từ hai plan song song → rủi ro lệch tăng.
- **B-03:** push hỏng im lặng có chủ đích. Cần chỗ đọc.
- **B-02:** bảng `app_events` để phase 04 có chỗ đổ MetricKit payload + funnel.

## Key insights

- **Migration áp bằng psql TAY, không có tracker.** Sổ `_applied_migrations` là **ghi tay có kỷ luật**, không phải CLI: giá trị nằm ở chỗ *hỏi prod* trả lời được "file nào đã chạy", chứ không ở tự động hoá. Đừng baseline `supabase db` CLI trong phase này — đổi cả quy trình deploy giữa hai plan song song là chuốc lỗi.
- **Luôn dry-run `begin; ... rollback;` trước `commit;`.** Migration phải **idempotent** (`if not exists`, `on conflict do nothing`). **Đừng `\i` migration trong transaction ngoài.**
- **Build xanh không chứng minh gì về PostgREST.** Bảng mới phải verify bằng HTTP thật với JWT của account **role='user'**.
- Edge function chạy `SUPABASE_SERVICE_ROLE_KEY` → ghi `push_failures` bỏ qua RLS. `app_events` thì client ghi bằng anon JWT → **phải có policy insert cho `authenticated`**.

## Requirements

- `_applied_migrations(filename pk, applied_at, applied_by, checksum?)` — backfill 0001..0034 đã chạy trên prod.
- `push_failures` ghi: `message_id`, `channel_id`, `user_id` (người nhận), `apns_env`, `status`, `reason`, `created_at`.
- `app_events` insert-only cho `authenticated`: `user_id` (default `auth.uid()`), `kind`, `payload jsonb`, `created_at`. **Đọc:** chỉ admin.
- Trigger push (0031) khi rơi vào `exception when others` → cũng ghi `push_failures` với reason `trigger_exception: <SQLERRM>`.

## Files

**Tạo**
- `supabase/migrations/0035_applied_migrations_ledger.sql`
- `supabase/migrations/0036_push_failure_log.sql`
- `supabase/migrations/0037_app_events.sql`

**Sửa**
- `supabase/functions/push-on-message/index.ts` — insert `push_failures` cho mỗi kết quả `status != 200`

**Xoá:** không

## Implementation steps

1. **0035 — sổ migration.**
   - `create table if not exists public._applied_migrations (filename text primary key, applied_at timestamptz not null default now(), applied_by text not null default current_user, note text);`
   - RLS on; policy select cho admin (dùng `is_admin()` sẵn có). Không policy write → chỉ psql/service_role ghi được.
   - Backfill: `insert into public._applied_migrations(filename, note) select f, 'backfill 17/07' from unnest(array['0001_...','...','0034_nodie_author_reads_own_deleted.sql']) f on conflict do nothing;`
   - **Danh sách backfill lấy từ `ls supabase/migrations/`, không gõ tay từ trí nhớ.** Chỉ backfill file đã THẬT SỰ chạy prod — nếu nghi ngờ file nào, verify bằng `pg_tables`/`pg_policies`/`pg_proc` rồi mới ghi. Ghi khống là làm sổ vô giá trị.
   - Mỗi migration từ 0035 trở đi **tự chèn dòng cuối file**: `insert into public._applied_migrations(filename) values ('0035_applied_migrations_ledger.sql') on conflict do nothing;`
2. **0036 — push_failures.** Bảng + index `(created_at desc)`. RLS on, select cho admin. Trong 0031's `exception when others` block: thêm insert vào `push_failures` với `reason = 'trigger_exception: ' || SQLERRM`. **Sửa bằng `create or replace function` trong 0036** — không sửa file 0031 đã áp prod.
3. **0037 — app_events.** Bảng + RLS: `create policy ... for insert to authenticated with check (user_id = auth.uid())`; select admin. Index `(kind, created_at desc)`. Cột `payload jsonb` — cân nhắc `check (pg_column_size(payload) < 64000)` để một crash payload khổng lồ không thổi bay bảng.
4. **Edge function:** sau khi có `results`, `await db.from('push_failures').insert(rows)` cho mọi `r.status !== 200`. Bọc trong `try/catch` — **log hỏng không được làm push hỏng**, giữ đúng tinh thần 0031.
5. **Dry-run từng file:**
   ```bash
   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -c "begin;" -f supabase/migrations/0035_applied_migrations_ledger.sql -c "rollback;"
   ```
   Xanh mới `commit`. Chạy lại lần 2 để chứng minh idempotent.
6. Deploy edge function: `supabase functions deploy push-on-message`.

## Todo

- [ ] 0035 + backfill lấy từ `ls`, verify các file nghi ngờ
- [ ] 0036 push_failures + `create or replace` trigger fn
- [ ] 0037 app_events + RLS insert-only
- [ ] Dry-run cả 3, rồi commit
- [ ] Chạy lại cả 3 → chứng minh idempotent
- [ ] Edge function insert push_failures + deploy
- [ ] Verify HTTP bằng account role='user'

## Success criteria

```bash
# 1. Sổ có đủ
psql "$SUPABASE_DB_URL" -c "select count(*) from _applied_migrations;"          # >= 37
# 2. Idempotent: chạy lại không lỗi, không nhân đôi
psql "$SUPABASE_DB_URL" -f supabase/migrations/0035_applied_migrations_ledger.sql
psql "$SUPABASE_DB_URL" -c "select filename, count(*) from _applied_migrations group by 1 having count(*)>1;"  # 0 dòng
# 3. RLS đúng: user thường KHÔNG đọc được app_events/push_failures
curl -sS "https://dzctvmrlsxwkcuidsqzk.supabase.co/rest/v1/app_events?select=*" \
  -H "apikey: $ANON" -H "Authorization: Bearer $USER_JWT"     # [] (RLS lọc sạch), KHÔNG phải 200 có dữ liệu
# 4. User thường GHI ĐƯỢC app_events
curl -sS -X POST "https://dzctvmrlsxwkcuidsqzk.supabase.co/rest/v1/app_events" \
  -H "apikey: $ANON" -H "Authorization: Bearer $USER_JWT" -H "Content-Type: application/json" \
  -d '{"kind":"probe","payload":{}}' -o /dev/null -w '%{http_code}\n'   # 201
```
- **$USER_JWT phải là account role='user'.** Test bằng admin = không test gì: 29 policy có nhánh `or is_admin()` → admin ngắn mạch phân quyền và đã giấu 4 bug P0 hôm 17/07.
- **B-03 sống thật:** chèn tay 1 row rác vào `device_tokens` (token bịa) → gửi tin nhắn → `select * from push_failures order by created_at desc limit 5;` có dòng với `reason` = `BadDeviceToken`. Dọn token rác sau khi test.

## Risks + rollback

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Backfill ghi khống (file trong repo chưa chạy prod) → sổ nói dối, tệ hơn không có sổ | **Cao** | Verify từng file nghi ngờ bằng `pg_policies`/`pg_proc`/`pg_tables` trước khi ghi; ghi `note` nói rõ là backfill suy đoán |
| `create or replace` trigger fn đè mất bản 0031 phiên 1933 vừa sửa | Trung bình | Đọc `pg_get_functiondef` **từ prod** ngay trước khi ghi, không chép từ repo |
| Số migration đụng nhau với plan 1933 (nó cũng đẻ 0035+) | **Cao** | Trước khi đặt tên file: `ls supabase/migrations/ \| tail -3` + `select max(filename) from _applied_migrations` — nhường số, đừng giành |
| `app_events` thành cống rác, phình DB free tier | Trung bình | Giới hạn size payload; phase 07 ghi ngưỡng vào docs |

**Rollback:** `drop table if exists push_failures, app_events;` + `create or replace` trigger fn về bản 0031. `_applied_migrations` giữ lại (drop là mất sổ). Edge function: `supabase functions deploy` bản trước.

## Security

- `service_role` **chỉ** trong Edge Function env, không bao giờ vào client.
- `app_events` không được chứa nội dung tin nhắn/PII. Payload MetricKit là call stack + metric — kiểm mắt một payload thật trước khi ship.
- `push_failures` chứa `user_id` người nhận → RLS admin-only, không public.

## Next

→ Phase 04 ghi `app_events`. Phase 03 seed cũng ghi sổ `_applied_migrations`? **Không** — seed là dữ liệu, không phải schema.
