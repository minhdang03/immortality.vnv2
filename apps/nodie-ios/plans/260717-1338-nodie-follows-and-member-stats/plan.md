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
| 01 | `created_at` vào view `public_profiles` | `supabase/migrations/0027_*.sql` (sửa tại chỗ — CHƯA apply prod) | chờ |
| 02 | Bảng `follows` + RLS + index | `supabase/migrations/0028_nodie_follows.sql` (mới) | chờ |
| 03 | `ProfileStatsStore(uid:)` + đếm người theo dõi | `NODIE/Features/Profile/ProfileStatsGrid.swift` | chờ |
| 04 | `FollowStore` — theo dõi/bỏ theo dõi/gợi ý | `NODIE/Features/Friends/FollowStore.swift` (mới) | chờ |

**Ngoài phạm vi:** wiring view (FriendsView/MemberProfileView) — của Opus. Em giao bảng + store.

## Acceptance

- [ ] `follows` có trên prod, RLS: đọc = authed; ghi/xoá = chỉ hàng của mình; không tự theo mình
- [ ] Người đã chặn không theo dõi được (check `blocks` trong policy insert)
- [ ] `ProfileStatsStore(uid: <người khác>)` trả đủ 4 số + số người theo dõi
- [ ] Build sạch; hồ sơ của MÌNH không đổi hành vi (không regression)

## Rủi ro

- **0027 chưa apply prod** → sửa tại chỗ được. Sau khi apply thì KHÔNG sửa nữa, phải migration mới.
- **Opus commit quét working tree** — đã nuốt việc của em 2 lần. Anh đã dừng Opus; nếu nó chạy lại, dừng làm và báo.
- `follows` đụng `blocks`: chặn ai đó có nên tự bỏ theo dõi họ không? → xem phase 02.
