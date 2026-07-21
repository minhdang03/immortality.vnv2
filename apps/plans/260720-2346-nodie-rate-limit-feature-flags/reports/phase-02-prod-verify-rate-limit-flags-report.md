# Phase 02 report — verify prod 0045/0046 (21/07/2026 ~01:00 AEST)

Áp prod: 0045+0046 commit OK, chạy lại lần 2 idempotent (`INSERT 0 0`). 9 trigger `trg_rate_limit` (pg_trigger), app_config 2 row, index đếm đủ.

## Kết quả (tất cả bằng account role='user' `NODIE_TEST_*`, trừ nhánh admin)

| Check | Kết quả |
|---|---|
| Spam HTTP thật (ngưỡng tạm 3/60s, kênh public naobo, membership tạm) | tin 1-3 → 201; tin 4-5 → **400** |
| Admin (giả JWT psql, ngưỡng reactions=1) | chèn 2/2 — **miễn trừ đúng**, rollback |
| Backdate `created_at=2020-01-01` | DB lưu **2026-07-20** — trigger ép now(), hết đường lách cửa sổ |
| app_config GET (JWT user) | `[{"key":"qa_public","value":false}]` — đọc OK |
| app_config PATCH (JWT user) | HTTP 204 nhưng **no-op** (giá trị không đổi) — RLS giữ. Lưu ý: PostgREST trả 204 kể cả khi RLS lọc 0 dòng, đừng tin status code |

## Chuỗi lỗi THẬT cho Phase 04 (PostgREST trả nguyên văn)

```json
{"code":"23514","details":null,"hint":"rate_limit","message":"rate_limit: thao tác quá nhanh, thử lại sau ít phút"}
```
→ `message` chứa `rate_limit` ngay đầu chuỗi; match `raw.contains("rate_limit")` là đủ, cùng kênh với `slow_mode` hiện có.

## Phát hiện ngoài dự kiến
- Policy `messages_insert` hiện hành ≠ 0017: đòi `is_channel_member` + chặn `is_broadcast` (trừ mod). Public channel không cho người ngoài post — payload test phải kèm `user_id` VÀ có membership.
- 3 tin spam bay ra khỏi cửa sổ 60s giữa lúc test → lần test backdate đầu `INSERT 0 1` là do hết cửa sổ, không phải bug.

## Dọn dẹp đã làm
Xoá 3 tin `[rate-limit-test]%`, gỡ membership tạm kênh naobo, khôi phục ngưỡng messages 30/60 + reactions 60/60. Mọi insert thí nghiệm khác nằm trong `begin;…rollback;`.

## Go/No-go
**GO** — mở khoá Phase 03 + 04. Không có unresolved.
