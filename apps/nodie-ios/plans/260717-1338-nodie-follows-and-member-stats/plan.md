# follows + thống kê hồ sơ thành viên

**Trạng thái:** chờ duyệt · **Nhánh:** claude/immortality-mobile-hybrid
**Phạm vi:** BE cho P0 #2 + #3. Push (#1) là Opus đang làm — không đụng.

## Vì sao

Tab Bạn bè, nút Theo dõi, và thống kê hồ sơ người khác đều chạy trên `MockData`.
Bảng `follows` **không tồn tại trên prod** (đã kiểm) → Opus không có gì để wire ở FE.

## Quyết định thiết kế

**KHÔNG viết RPC aggregate.** `ProfileStatsGrid.swift:96-97` đã ghi rõ quyết định cộng ở
client, kèm điều kiện đổi ("khi một người viết tới vài nghìn câu"). Điều kiện đó chưa tới.

Lý do thật khiến hồ sơ *người khác* hỏng nhỏ hơn nhiều: `fetchDaysJoined` đọc
`profiles.created_at`, mà RLS là self-only và view `public_profiles` (0027) không chở cột đó.
→ Thêm `created_at` vào view là đủ. Một dòng SQL thay cho một RPC + đường đọc số thứ hai.

`ProfileStatsStore` nhận thêm tham số `uid` (mặc định = mình) → một store cho cả hồ sơ mình
lẫn hồ sơ người khác. Không nhân đôi đường đọc.

## Phases

| # | Việc | File | Trạng thái |
|---|---|---|---|
| 01 | `created_at` vào view `public_profiles` | `supabase/migrations/0027_*.sql` (sửa tại chỗ — CHƯA apply prod) | ✅ xong |
| 02 | Bảng `follows` + RLS + index + trigger cắt follow khi chặn | `supabase/migrations/0028_nodie_follows.sql` (mới) | ✅ xong |
| 03 | `ProfileStatsStore(uid:)` + đếm người theo dõi | `NODIE/Features/Profile/ProfileStatsGrid.swift` | ✅ xong |
| 04 | `FollowStore` — theo dõi/bỏ theo dõi/gợi ý/**tìm ILIKE** | `NODIE/Features/Friends/FollowStore.swift` (mới) | ✅ xong |

## Đã verify trên DB thật (transaction + rollback, prod không đổi)

- `view_cols: id,display_name,bio,created_at`
- Trigger cắt hai chiều: `follows trước khi chặn: 2` → `sau khi A chặn B: 0`
- `follows_no_self` chặn tự theo dõi mình
- Trigram index dùng được: `Bitmap Index Scan on idx_profiles_display_name_trgm`
  (query thường vẫn Seq Scan ở 3000 dòng — planner chọn đúng, bảng nhỏ quét thẳng rẻ hơn)
- Build: `** BUILD SUCCEEDED **`
- `profiles` prod vẫn = 1 dòng sau mọi bài test

**Ngoài phạm vi:** wiring view (FriendsView/MemberProfileView) — của Opus. Em giao bảng + store.

## Acceptance

- [ ] `follows` có trên prod, RLS: đọc = authed; ghi/xoá = chỉ hàng của mình; không tự theo mình
- [ ] Người đã chặn không theo dõi được (check `blocks` trong policy insert)
- [ ] `ProfileStatsStore(uid: <người khác>)` trả đủ 4 số + số người theo dõi
- [ ] Build sạch; hồ sơ của MÌNH không đổi hành vi (không regression)

## Code review — 1 critical, đã vá và verify lại

`code-reviewer` bắt được lỗ hổng thật mà test đầu của em BỎ SÓT (em chạy test bằng quyền
superuser — RLS không áp lên superuser, nên policy trông như chạy đúng):

- **CRITICAL — `follows_insert` nhánh "họ chặn tôi" là code chết.** Subquery trong policy chạy
  bằng quyền người gọi → `blocks` bị `blocks_self` lọc → người BỊ chặn đọc ra 0 dòng →
  `not exists` luôn true → **A bị B chặn vẫn follow được B**. Chiều duy nhất cần bảo vệ nạn nhân
  chính là chiều hỏng. Vá bằng `is_blocked_pair()` security definer (cùng lối `is_channel_member`).
  Verify đóng vai A thật: `ERROR: new row violates row-level security policy` ✅
- **#3 `alter publication` không idempotent** → chạy lại là abort cả transaction. Bọc guard như 0023. ✅
- **#7 chặn bằng UPDATE lách trigger** → `after insert or update`. Verify: follows 2 → 0. ✅
- **#2 double-tap → nút kẹt 409 vĩnh viễn** → `upsert(ignoreDuplicates)` + `inFlight` guard.
- **#5 một lần mất mạng = "—" vĩnh viễn** → chỉ bật `didLoadOnce` khi không phải cả năm cùng nil.
- **#11 kết quả tìm về trễ đè kết quả mới** → token đơn điệu.
- **#12 header 0027 vẫn ghi "0026"** → sửa. Đổi tên file mà quên header là đúng loại lỗi làm
  người sau tin nhầm migration nào đã chạy.
- **#4 header hứa vá "Ẩn danh" nhưng QAStore vẫn embed `profiles`** → ghi cảnh báo vào file.

Chưa làm (có lý do): #6 realtime DELETE lộ `(message_id,user_id,kind)` — cần chốt phạm vi
subscribe trước; #9 `.task(id:)` — thuộc lúc wire MemberProfile; #8 TOCTOU mili-giây; #13
tìm 1–2 ký tự.

## Rủi ro

- **0027 chưa apply prod** → sửa tại chỗ được. Sau khi apply thì KHÔNG sửa nữa, phải migration mới.
- **Opus commit quét working tree** — đã nuốt việc của em 2 lần. Anh đã dừng Opus; nếu nó chạy lại, dừng làm và báo.
- `follows` đụng `blocks`: chặn ai đó có nên tự bỏ theo dõi họ không? → xem phase 02.
