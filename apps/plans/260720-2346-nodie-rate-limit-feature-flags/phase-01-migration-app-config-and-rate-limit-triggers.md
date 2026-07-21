# Phase 01 — Migration: app_config + rate-limit triggers (SQL)

**Model:** **Fable** — vùng bẫy: migration prod áp tay, RLS, hot-path trigger, đặt sai errcode/chuỗi là iOS bắt lỗi sai. Cần suy luận cẩn trọng, không cơ khí.

## Context Links
- `supabase/migrations/0017_nodie_community.sql` — tables messages/questions/answers/reports/channels; slow_mode trigger mẫu (dòng 158-172); `is_channel_member` helper.
- `supabase/migrations/0018_nodie_qa_engagement.sql` — answer_replies.author_id, answer_reactions.user_id.
- `supabase/migrations/0027_*` — message_reactions.user_id **= profiles.id = auth.uid()**.
- `supabase/migrations/0028_nodie_follows.sql` — follows.follower_id = profiles.id.
- `supabase/migrations/0043_group_management.sql` — channels.created_by (user thường tạo group được).
- `supabase/migrations/0005_agent.sql:48` — `public.is_admin()` SECURITY DEFINER.
- `supabase/migrations/0035_applied_migrations_ledger.sql` — sổ `_applied_migrations`, mỗi file tự chèn dòng cuối.

## Overview
- **Priority:** P2, blocker của toàn plan.
- **Status:** pending.
- Tạo **0045** (bảng `app_config` + seed) và **0046** (config ngưỡng + generic rate-limit trigger + index + attach). Tách 2 file để rollback độc lập: flag có thể sống mà không cần rate-limit và ngược lại.

## Key Insights
- **Một generic trigger function** dùng `TG_ARGV` cho (action key, owner column) → DRY, gắn lên mọi bảng đích thay vì viết N hàm. Owner column khác nhau (user_id/author_id/follower_id/reporter_id/created_by) → truyền qua arg.
- **Ngưỡng ở app_config** (key `rate_limits` jsonb) để chỉnh không cần migration, NHƯNG trigger phải có **fallback default baked-in** → thiếu row vẫn được bảo vệ (fail-safe, không fail-open).
- **Admin/mod miễn trừ** qua `is_admin()` ngay đầu hàm → return NEW sớm, khỏi đếm.
- Chỉ đếm bản ghi mà `owner_col = auth.uid()` (bỏ qua khi insert hộ/hệ thống set null).
- `raise exception ... using errcode='check_violation', hint='rate_limit'` — chuỗi `rate_limit` để iOS `NodieErrorKind.of` khớp (Phase 04). KHÔNG trùng `slow_mode`.

## Requirements
### Functional
- `app_config(key text pk, value jsonb not null, updated_at timestamptz)`. RLS: authenticated `select`, chỉ `is_admin()` `insert/update/delete`.
- Seed `qa_public` = `false` (jsonb `false` hoặc `{"enabled":false}` — chọn 1, xem Q1).
- Seed `rate_limits` = jsonb map: mỗi action → `{"limit":N,"window":S}` (giây).
- Generic trigger BEFORE INSERT trên: messages, questions, answers, answer_replies, message_reactions, answer_reactions, reports, follows, channels(kind='group' only qua WHEN nếu cần).
- Index hỗ trợ đếm `(owner_col, created_at)` cho từng bảng còn thiếu.

### Non-functional
- Idempotent: `create table if not exists`, `create or replace function`, `drop trigger if exists`, `create index if not exists`, seed `on conflict do nothing`.
- Mỗi file tự chèn dòng `_applied_migrations` ở cuối.

## Architecture — data flow
```
INSERT qua PostgREST (iOS) ─► BEFORE INSERT trigger tg_rate_limit(action, owner_col)
   ├─ auth.uid() null?  → return NEW (để RLS/khác lo)
   ├─ is_admin()?       → return NEW (miễn trừ)
   ├─ owner_col ≠ uid?  → return NEW (không phải bản ghi của user)
   ├─ đọc limit/window từ app_config['rate_limits'][action]  (fallback default)
   ├─ count(*) where owner_col=uid and created_at > now()-window   (dùng index)
   └─ count ≥ limit → RAISE 'rate_limit: ...'  → PostgREST trả 400/500 kèm chuỗi
```

## Related Code Files
- Create: `supabase/migrations/0045_nodie_app_config.sql`
- Create: `supabase/migrations/0046_nodie_rate_limits.sql`
- Modify: none (chỉ SQL mới).

## Implementation Steps
1. **0045** — bảng `app_config` + RLS (authed read / admin write) + seed `qa_public=false`. Ghi sổ.
2. **0046** — seed row `rate_limits`; helper đọc config; generic function `tg_rate_limit()`; index; attach trigger từng bảng; ghi sổ.
3. Trong CẢ HAI: bọc thân trong `begin; ... rollback;` khi dry-run (xem Phase 02 verify trước khi commit).

### Snippet minh hoạ (generic trigger — rút gọn)
```sql
create or replace function public.tg_rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_action text := tg_argv[0];           -- 'messages','questions',...
  v_col    text := tg_argv[1];           -- 'user_id' | 'author_id' | ...
  v_uid uuid := auth.uid();
  v_owner uuid; v_limit int; v_window int; v_count int;
begin
  if v_uid is null or public.is_admin() then return new; end if;
  execute format('select ($1).%I', v_col) into v_owner using new;
  if v_owner is distinct from v_uid then return new; end if;
  select coalesce((value->v_action->>'limit')::int, 30),
         coalesce((value->v_action->>'window')::int, 60)
    into v_limit, v_window
    from public.app_config where key = 'rate_limits';
  v_limit := coalesce(v_limit, 30); v_window := coalesce(v_window, 60);   -- fail-safe khi thiếu row
  execute format(
    'select count(*) from public.%I where %I = $1 and created_at > now() - make_interval(secs => $2)',
    tg_table_name, v_col) into v_count using v_uid, v_window;
  if v_count >= v_limit then
    raise exception 'rate_limit: % thao tác quá nhanh, chờ chút', v_action
      using errcode = 'check_violation', hint = 'rate_limit';
  end if;
  return new;
end; $$;

-- attach (mỗi bảng: action + owner col)
drop trigger if exists trg_rate_limit on public.messages;
create trigger trg_rate_limit before insert on public.messages
  for each row execute function public.tg_rate_limit('messages','user_id');
-- ... lặp cho questions('author_id'), answers('author_id'), answer_replies('author_id'),
--     message_reactions('user_id'), answer_reactions('user_id'), reports('reporter_id'),
--     follows('follower_id'), channels('created_by')
```
Ngưỡng khởi điểm gợi ý (tinh chỉnh sau khi đo): messages 30/60s, questions 5/300s, answers 10/300s,
answer_replies 15/300s, reactions 60/60s, reports 5/600s, follows 30/60s, channels 3/3600s.

## Todo
- [x] 0045 app_config + RLS + seed qa_public + ghi sổ
- [x] 0046 seed rate_limits + tg_rate_limit() + index từng bảng + attach 9 trigger + ghi sổ
- [x] Dry-run cả hai trong `begin; ... rollback;` (chi tiết verify ở Phase 02)
- [x] Xác nhận số migration 0045/0046 chưa bị chiếm (0043 chưa commit)

## Success Criteria
- Cả hai migration chạy lại nhiều lần không lỗi, không nhân đôi seed/sổ.
- Trigger tồn tại trên 9 bảng (verify Phase 02: `pg_trigger`).
- Chuỗi exception chứa `rate_limit`, errcode `check_violation`, KHÔNG lẫn `slow_mode`.

## Risk Assessment
| Rủi ro | Khả năng | Tác động | Giảm thiểu |
|---|---|---|---|
| Trigger đọc app_config mỗi insert → chậm | Trung bình | Trung bình | Bảng 1 row, PK lookup, Postgres cache; đo ở Phase 02. Nếu đau: chuyển sang `set_config` cache/GUC hoặc TG_ARGV ngưỡng cứng |
| `created_at` default now() nhưng client gửi giá trị lạ | Thấp | Cao | Đếm theo `created_at > now()-window`; cân nhắc dùng `now()` thay cột nếu client set được created_at (kiểm ở Phase 02) |
| Miễn trừ sai (mod per-channel vs admin toàn cục) | Thấp | Trung bình | Chỉ miễn `is_admin()` (toàn cục); mod nhóm KHÔNG được miễn — đúng ý "admin/dev" |
| Chặn oan reaction/toggle hợp lệ | Trung bình | Thấp | Ngưỡng reaction generous (60/60s); tinh chỉnh sau đo |
| fail-open khi app_config trống | Thấp | Cao | Baked-in default trong hàm (30/60) → luôn có chốt |

## Security Considerations
- Trigger `security definer set search_path=public` — không để search_path injection.
- app_config write chỉ `is_admin()`; authed read OK (flag/ngưỡng không nhạy cảm).
- KHÔNG log nội dung bản ghi trong exception (tránh lộ text tin nhắn).

## Next Steps
- Phase 02 verify bằng psql + HTTP account thường TRƯỚC KHI commit và trước khi đụng Swift.

## Unresolved
- Q1: `qa_public` lưu dạng jsonb bool thuần (`true`) hay object (`{"enabled":true}`)? Đề xuất bool thuần cho KISS; iOS đọc `value == true`.
- Q2: channels rate-limit áp cho MỌI kind hay chỉ `kind='group'`? DM đã có create_dm RPC (0030). Đề xuất `WHEN (new.kind='group')` để không đụng DM.
