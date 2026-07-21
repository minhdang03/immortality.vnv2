# Phase 02 — Verify prod: psql + HTTP thật, account role='user'

**Model:** **Fable** — đây CHÍNH là bước chống bẫy "build xanh chứng minh gì đâu". Cần đọc kết quả HTTP thật, phân biệt admin ngắn mạch, quyết định go/no-go. Không cơ khí.

## Context Links
- CLAUDE.md → "Bẫy đã trả giá": test bằng admin = không test gì; build xanh ≠ PostgREST OK.
- `.env` (gitignored) → `SUPABASE_DB_URL`, anon key, URL. `NODIE_TEST_*` = account role='user'.
- Phase 01 migrations 0045/0046.

## Overview
- **Priority:** P2, **CỔNG chặn** — không đụng Swift (Phase 03/04) trước khi phase này DONE.
- **Status:** pending (blocked by 01).
- Mục tiêu: chứng minh trên PROD thật rằng (a) trigger chặn user thường sau ngưỡng, (b) admin không bị, (c) flag đọc được qua PostgREST, (d) chuỗi lỗi chứa `rate_limit`.

## Key Insights
- Verify phải qua **hai lăng kính**: psql (owner, RLS không áp — xem cấu trúc) VÀ HTTP PostgREST với **JWT của account role='user'** (đi đúng đường app đi).
- Admin JWT sẽ KHÔNG bị chặn → dùng để chứng minh nhánh miễn trừ, KHÔNG dùng để "thấy pass rồi yên tâm".
- Đọc đúng **mã lỗi + body** PostgREST trả khi trigger raise (thường HTTP 400/500, message chứa `rate_limit`) → Phase 04 khớp chuỗi này.

## Requirements
- Dry-run migration trong `begin; ... rollback;` xác nhận không lỗi cú pháp/không khoá bảng lâu.
- Apply thật (commit) 0045+0046 lên prod bằng psql.
- Lấy 2 JWT: 1 user thường (đăng nhập `NODIE_TEST_*`), 1 admin.
- Chạy vòng spam qua HTTP để vượt ngưỡng → kỳ vọng bị chặn (user), không bị (admin).

## Architecture — verify flow
```
psql begin;..rollback;  ─► cú pháp OK
psql commit             ─► 0045/0046 vào prod
POST /rest/v1/messages (JWT user) × (limit+1)  ─► request cuối trả lỗi chứa 'rate_limit'
POST /rest/v1/messages (JWT admin) × (limit+5)  ─► tất cả 201
GET /rest/v1/app_config?key=eq.qa_public (JWT user) ─► đọc được value
UPDATE app_config qa_public=true (psql/admin) → GET lại thấy true
```

## Related Code Files
- Không sửa code. Chỉ query + curl.

## Implementation Steps
1. **Dry-run:** `psql "$SUPABASE_DB_URL" -1 -f 0045... ` bọc thủ công `begin;\i;rollback;` (LƯU Ý: không `\i` trong transaction lồng — dán nội dung, xem bài học 0034 soft-delete). Xác nhận 0 lỗi.
2. **Commit prod:** áp 0045 rồi 0046.
3. **Cấu trúc (psql):**
   ```sql
   select tgname, tgrelid::regclass from pg_trigger where tgname='trg_rate_limit' order by 2;   -- 9 dòng
   select key, value from public.app_config order by key;                                        -- qa_public, rate_limits
   select indexname from pg_indexes where indexname like '%rate%' or indexname like '%_user_created' or indexname like '%_author_created';
   ```
4. **HTTP user thường (chặn):** lấy JWT (đăng nhập password grant với `NODIE_TEST_*`), rồi:
   ```bash
   TOKEN=... ; N=$(( LIMIT + 2 ))
   for i in $(seq 1 $N); do
     curl -s -o /tmp/r.json -w "%{http_code}\n" -X POST "$URL/rest/v1/messages" \
       -H "apikey: $ANON" -H "authorization: Bearer $TOKEN" \
       -H "content-type: application/json" \
       -d '{"channel_id":"<kênh test>","body":"spam '"$i"'"}'
   done
   # request thứ >LIMIT: http != 201 và grep 'rate_limit' /tmp/r.json
   ```
   (dùng kênh test đã seed — xem fixture `[uitest-chat-seed]`; KHÔNG đụng dữ liệu thật khác.)
5. **HTTP admin (không chặn):** lặp bước 4 với JWT admin → mọi request 201.
6. **Flag qua PostgREST:** GET app_config bằng JWT user → đọc được; `update ... set value='true' where key='qa_public'` (psql) → GET lại thấy `true`; revert về `false` sau khi test.
7. Ghi lại **chuỗi lỗi CHÍNH XÁC** PostgREST trả (message/hint/code) → đưa vào Phase 04.

## Todo
- [x] Dry-run 0045/0046 (0 lỗi)
- [x] Commit prod 0045/0046
- [x] pg_trigger đủ 9, app_config 2 row, index đủ
- [x] User thường: bị chặn sau ngưỡng, body chứa `rate_limit`
- [x] Admin: không bị chặn
- [x] app_config đọc được qua PostgREST bằng JWT user
- [x] Ghi chuỗi lỗi thật vào phase-02 report (cho Phase 04)
- [x] Revert qa_public về false sau test

## Success Criteria
- Request thứ (ngưỡng+1) của user thường: HTTP lỗi + body chứa `rate_limit`.
- Cùng vòng đó với admin: tất cả thành công.
- `app_config` GET-được bằng anon+authed JWT; UPDATE chỉ admin.

## Risk Assessment
| Rủi ro | Khả năng | Tác động | Giảm thiểu |
|---|---|---|---|
| Test bằng admin nhầm → tưởng "không chặn" là bug | Trung bình | Cao | BẮT BUỘC 2 JWT tách bạch; ghi rõ JWT nào trong log |
| Spam test làm bẩn prod (tin rác) | Trung bình | Thấp | Dùng kênh test seed; xoá sau bằng psql; hoặc test trên bảng ít nhạy (reports) |
| PostgREST bọc lỗi khiến chuỗi `rate_limit` không tới client | Trung bình | Cao | Chính là lý do phase này TỒN TẠI — nếu mất chuỗi, sửa cách raise (message vs hint vs details) ở Phase 01 rồi verify lại |
| `created_at` client set được → lách cửa sổ | Thấp | Trung bình | Thử POST kèm created_at quá khứ; nếu lách được, đổi trigger đếm theo `now()` không tin cột |

## Security Considerations
- KHÔNG commit JWT/token/password vào repo hay plan (account thật trên prod).
- Xoá tin rác test sau khi xong.

## Next Steps
- DONE → mở khoá Phase 03 (Swift flag+gate) và Phase 04 (Swift rate-limit UI) chạy song song.
- Nếu chuỗi lỗi khác dự kiến → cập nhật Phase 04 khớp đúng chuỗi thật.

## Unresolved
- Q3: Đường lấy JWT user tự động (password grant qua GoTrue `/auth/v1/token?grant_type=password`) có bị chặn captcha/Turnstile không? Nếu có, lấy token thủ công từ app đang chạy.
