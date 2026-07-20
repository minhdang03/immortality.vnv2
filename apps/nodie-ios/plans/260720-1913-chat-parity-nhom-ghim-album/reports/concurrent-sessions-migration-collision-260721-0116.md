# CẢNH BÁO: nhiều phiên song song + va số migration trên prod (21/07 01:16)

## Phase 06 DB: XONG + verified prod (giá trị thật của turn này)

- `0045_pinned_messages.sql` applied prod. RPC `set_pinned` (mod-only, trần 3 ghim/kênh).
- Fable vá 2 bug đếm trần: (a) đếm cả tin xoá mềm → ghim-rồi-xoá chiếm slot vĩnh viễn;
  (b) đếm cả tin đang re-ghim → lỗi trần oan.
- **Lỗ bảo mật MỚI đã vá — `0048_guard_pinned_columns.sql`**: tác giả tự ghim tin mình qua
  `messages_update_own` (RLS không bó cột, cùng lớp 0044/0047). Chứng minh forged JWT, vá
  bằng mở rộng `tg_messages_guard` clamp pinned_at/pinned_by. Applied + re-test prod.
- Suite forged-JWT role='user' 7+3 test đạt hết; PGRST201 test HTTP thật 200/12 keys.

## VẤN ĐỀ VẬN HÀNH (ưu tiên cao hơn code)

Nhiều phiên Claude chạy song song trên CÙNG cây + CÙNG prod DB, không điều phối:

**Va số migration (mỗi số áp thẳng prod ad-hoc):**
- `0045_pinned_messages` ⚔ `0045_nodie_app_config`
- `0048_guard_pinned_columns` ⚔ `0048_guard_self_join_role` ⚔ `0048_set_best_answer_toggle`
- Kèm 0046_nodie_rate_limits, 0047_content_column_guards_and_dm_lock (phiên khác tạo).

⇒ Mô hình "áp theo thứ tự số" gãy. Không dựng lại được thứ tự áp thật trên prod từ tên file.

**Đua file:** ChatDetailView.swift / ConversationStore.swift / QAStore.swift bị nhiều phiên sửa
đồng thời (QAStore vừa bị thêm `@MainActor` bởi phiên khác giữa turn). Cây có 13+ file M +
`FeatureFlags/` mới — thuộc backlog (rate limit, flags, app config, best-answer toggle) mà
turn này KHÔNG được giao đụng.

## Đã KHÔNG làm (có chủ đích)

- Không sửa ChatDetailView/ConversationStore (phiên khác đang giữ).
- Không commit (sẽ gom việc dở của 5 phiên vào một mối).
- Không thêm migration.

## Phase 06 Swift còn 2 gap (phiên khác đang viết, gần xong)

1. `dismissedPinId` là `@State` → cần `@AppStorage` nhớ theo kênh.
2. Băng ghim mới hiện ghim mới nhất + đếm → cần vuốt ngang + chấm chỉ số.

## Cần Đăng quyết

1. Điều phối phiên: chỉ một phiên giữ mỗi file; ai chốt số migration.
2. Có muốn audit prod xem THẬT SỰ những object nào của 0045–0048 đã áp (vì tên file va nhau)?
3. Reconcile số migration trước khi commit bất cứ thứ gì.
