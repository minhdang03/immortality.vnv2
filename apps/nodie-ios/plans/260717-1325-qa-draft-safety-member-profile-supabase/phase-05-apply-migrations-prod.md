# Phase 05 — Apply 0027 + 0028 lên prod (KHÔNG viết migration nào)

**Ưu tiên:** P1 (chặn phase 06). **Status:** chưa bắt đầu. **Người làm: ĐĂNG** (migration không auto-deploy).

## Phase này đã teo lại — đọc trước

Đề bài giao: *"viết `0028_nodie_follows.sql`"*. **Không cần nữa.** Đo lúc 13:45, trong lúc plan này đang được viết, session kia đã commit sẵn cả hai thứ:

| Cái cần | Trạng thái đo được | Kết luận |
|---|---|---|
| Bảng `follows` | ✅ **`supabase/migrations/0028_nodie_follows.sql` ĐÃ TỒN TẠI** (commit `5201a8b`) | **Không viết lại.** Bản của họ **tốt hơn** bản plan này định viết. |
| `created_at` trong `public_profiles` | ✅ **0027 dòng 35 đã có**: `select id, display_name, bio, created_at from public.profiles;` | **Không sửa view.** "Tham gia 02.2025" chạy được ngay. |
| Swift dùng `follows`/`public_profiles` | ❌ **chưa ai đụng** (grep: chỉ còn mock ở `AppState:92-137`) | **Phase 06 vẫn nguyên giá trị** — phần Swift còn trống. |

⇒ **Câu hỏi "0028 hay 0029" trong đề bài là MOOT.** Không có migration mới nào để đánh số.

## Bản `0028` của họ hơn bản ta định viết ở chỗ nào

Plan này định **ghi nợ** phần `blocks` ↔ `follows` ("YAGNI cho tới khi có ca thật"). Họ đã làm, và **họ đúng**:

- `follows_insert` có `not exists (select 1 from blocks ...)` **hai chiều** — mình chặn họ, hoặc họ chặn mình. Thiếu vế hai thì kẻ bị chặn vẫn bám theo nạn nhân.
- `trg_block_removes_follows` (after insert on `blocks`) — **cắt follow CŨ**. Policy insert chỉ chặn follow mới; không có trigger thì chặn xong người kia **vẫn nằm trong "người theo dõi" của mình**, đúng thứ người dùng bấm Chặn để thoát khỏi.
- Bỏ chặn **không** tự nối lại follow (cố ý — comment cuối file).

⇒ Phần còn lại của plan này phải **thích ứng theo**, không cãi: xem "Hệ quả cho phase 06".

## Hệ quả cho phase 06

1. `MemberStore.toggleFollow` **phải xử được insert bị RLS từ chối** (follow người đã chặn/bị chặn) → không phải lỗi mạng, mà là "không được phép". Optimistic UI phải hoàn nguyên và **không** hiện alert lỗi kỹ thuật.
2. **Sau khi Chặn ai đó → follow bị trigger xoá ở DB.** UI đang giữ `isFollowing = true` trong RAM sẽ **nói dối**. ⇒ Chặn xong phải `await members.load(id:)` lại, hoặc set `isFollowing = false` tại chỗ.
3. `follows_read` mở cho mọi người đã đăng nhập ⇒ đếm "người theo dõi" của người khác chạy được. **Không cần** denormalize (comment đầu 0028 đã giải thích vì sao không đếm sẵn).

## Việc phải làm (Đăng)

1. **Apply `0027_nodie_public_profiles_and_message_reactions.sql`** — vá bug "Ẩn danh" (latent: prod hiện 1 user và user đó là admin nên `or is_admin()` che mất). Không có nó → **mọi tên người khác = "Ẩn danh"** trên toàn app.
2. **Apply `0028_nodie_follows.sql`** — bảng follows + trigger chặn.
3. Thứ tự: **0027 trước, 0028 sau** (0028 tham chiếu `profiles`; 0027 dựng view). Cả hai độc lập nhau về mặt object nhưng cứ theo số cho khỏi nghĩ.
4. ⚠️ **Có 0026 riêng biệt** (`0026_nodie_push_on_message_trigger.sql`) — không thuộc plan này, nhưng nếu chưa apply thì kiểm luôn một thể.

## Xác minh sau khi apply (psql, trước khi mở phase 06)

- [ ] `select id, display_name, bio, created_at from public_profiles limit 1;` → chạy
- [ ] `select role from public_profiles;` → **lỗi, cột không tồn tại** (hàng rào 0027 còn nguyên)
- [ ] `\d follows` → bảng có, RLS bật, có `idx_follows_followee`
- [ ] `select tgname from pg_trigger where tgname = 'trg_block_removes_follows';` → có
- [ ] Bằng **2 tài khoản thật**: A follow B → hàng xuất hiện; A follow lại → không nhân đôi (PK)
- [ ] A chặn B → hàng follow **tự biến mất** (trigger)
- [ ] A (đang chặn B) thử follow B → **bị từ chối** (policy)

## Todo

- [ ] `ls supabase/migrations/` xác nhận 0027 + 0028 còn đúng tên (số đã trôi 3 lần trong 1 giờ)
- [ ] **Đăng apply 0027**
- [ ] **Đăng apply 0028**
- [ ] Chạy hết checklist xác minh
- [ ] Chỉ khi tất cả xanh → mở phase 06

## Success criteria

Hết checklist xác minh xanh trên **prod**, đo bằng **2 tài khoản** (1 tài khoản = admin = không thấy bug).

## Risks / Rollback

| Rủi ro | Mitigation |
|---|---|
| **Số hiệu trôi tiếp** — đã đổi 3 lần trong 1 giờ (0026→0027 rename, 0028 mới, 0029 renumber) | `ls` + `git log -1 --` ngay trước khi apply. Đối chiếu nội dung, đừng tin số. |
| Apply 0028 mà quên 0027 | Follow chạy nhưng tên vẫn "Ẩn danh" → hồ sơ vô nghĩa. Checklist ép cả hai. |
| Session kia sửa tiếp 0028 sau khi Đăng đã apply | Bảng `if not exists` + policy `drop ... create` → apply lại an toàn. Nhưng phải **apply lại**, không tự đồng bộ. |
| Ta viết đè `0028_nodie_follows.sql` của họ | **CẤM.** Phase này không viết SQL. Nếu thấy thiếu gì → migration MỚI, số kế tiếp trống, không sửa file họ. |

**Rollback:** `drop table public.follows cascade;` (trigger đi theo). Chưa có dữ liệu thật → mất mát bằng 0. Làm **trước** khi phase 06 lên tay người dùng.
