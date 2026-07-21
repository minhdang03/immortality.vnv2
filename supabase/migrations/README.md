# Migrations — thứ tự áp THẬT trên prod

**Nguồn sự thật của schema là `public._applied_migrations` trên prod, KHÔNG phải tên file.**
CLI không theo dõi gì; migration áp bằng `psql` tay. ⇒ số trong tên file KHÔNG chứng minh
thứ tự, và vài số bị **trùng** do nhiều phiên chạy song song (20–21/07). Cả ledger lẫn đây
khớp theo TÊN ĐẦY ĐỦ, nên replay theo thứ tự dưới là đúng — không cần đổi tên file.

Muốn biết prod thật sự có gì: `select filename, applied_at from public._applied_migrations order by applied_at;`

## Số trùng (cosmetic — mọi object đều đã sống prod, không thiếu không hỏng)

| Số | Các file cùng số | Vì sao |
|---|---|---|
| `0045` | `nodie_app_config`, `pinned_messages` | hai phiên (rate-limit/flags vs ghim tin) cùng lấy 0045 |
| `0048` | `guard_pinned_columns`, `guard_self_join_role`, `set_best_answer_toggle` | ba phiên cùng lấy 0048 |

Quyết định 21/07 (Đăng): **KHOAN đổi tên.** Đổi 0045→0053… kéo theo ~10 file đã commit + viết
lại lịch sử chung trong lúc phiên khác còn sửa cây — rủi ro va cao, lợi ích chức năng = 0.
README này chữa nhập nhằng replay; đổi tên để sau khi hợp nhất còn một phiên.

## Thứ tự áp thật (đoạn 0041→0052, theo `applied_at`)

Lưu ý: **0043/0044 áp TRƯỚC 0041/0042** — số file không phản ánh thứ tự.

```
0043_group_management.sql                        20/07 13:53
0044_guard_member_role.sql                       20/07 14:45
0041_realtime_channel_members.sql                20/07 14:45   (ghi bù ledger — đã sống từ trước)
0042_server_clock_last_read_at.sql               20/07 14:45   (ghi bù ledger — đã sống từ trước)
0045_nodie_app_config.sql                        20/07 14:50
0046_nodie_rate_limits.sql                       20/07 14:50
0045_pinned_messages.sql                         20/07 14:54   ← 0045 thứ hai
0047_content_column_guards_and_dm_lock.sql       20/07 14:56
0048_guard_pinned_columns.sql                    20/07 15:09
0048_guard_self_join_role.sql                    20/07 15:11   ← 0048 thứ hai
0048_set_best_answer_toggle.sql                  20/07 15:13   ← 0048 thứ ba
0049_group_edge_guards.sql                       20/07 15:16
0050_guard_reply_reaction_immutable_columns.sql  20/07 15:18
0051_web_cutover_supabase_only.sql               21/07 04:06
0052_last_seen_presence.sql                       21/07 04:10
```

## Migration tiếp theo

Số kế tiếp SẠCH = **0053** (không đụng số nào ở trên). Trước khi lấy số, kiểm ledger prod —
đừng tin thư mục. Mọi migration phải idempotent (`create or replace` / `if not exists`),
dry-run trong `begin; … rollback;`, và test vùng RLS bằng tài khoản `role='user'` (giả JWT),
KHÔNG bằng admin (is_admin ngắn mạch policy).
