# Phase 05 — migration `0029_nodie_follows.sql` (+ `created_at` vào public_profiles)

**Ưu tiên:** P1 (chặn phase 06). **Status:** chưa bắt đầu. **Chặn bởi:** Đăng apply `0027` trước.

## Context — SỐ HIỆU ĐANG TRÔI, ĐỌC TRƯỚC KHI TẠO FILE

Đo 13:38:
```
0026_nodie_push_on_message_trigger.sql                     (committed 402e9d0)
0027_nodie_public_profiles_and_message_reactions.sql       (STAGED rename từ 0026 — chưa commit)
```
- Session kia vừa `git mv` để né trùng số 0026. ⇒ **0027 giờ là public_profiles**, không phải của plan 260717-1306.
- Plan `260717-1306` phase-02 (`answer_count` trigger) đặt gạch 0027 → **họ phải trượt xuống 0028**.
- ⇒ Plan này lấy **0029**, nhường 0028. (Đề bài bảo 0028 — lý do của nó đã chết. Xem plan.md câu hỏi #1, **cần lead gật trước khi tạo file**.)
- **Chạy `ls supabase/migrations/` ngay trước khi tạo.** Lấy số trống kế tiếp nếu đã trôi tiếp.
- Không có runner tự động (`scripts/` không có migrate). Áp thủ công qua Console — **thứ tự do người, không do máy**.

**Bảng `follows` KHÔNG tồn tại** (grep `supabase/migrations/`: 0 kết quả). `AppState.swift:92-93` đang mock `Set<String>` với chính comment "server sẽ là bảng `follows` (follower_id, followee_id)".

## Requirements

1. Bảng `follows` — ai theo dõi ai, bền qua lần mở app.
2. RLS theo đúng luật 0019 (**authed only** — NODIE không có gì cho `anon`).
3. `public_profiles` cần thêm **`created_at`** để hồ sơ người khác hiện được "Tham gia MM.YYYY" (view 0027 hiện chỉ có `id, display_name, bio`).

## Files

**Create:** `supabase/migrations/0029_nodie_follows.sql`
**Modify:** không (view sửa bằng `create or replace` trong chính 0029 — **không sửa file 0027 của session kia**).

## Implementation

1. Bảng:
   ```sql
   create table if not exists public.follows (
     follower_id uuid not null references public.profiles(id) on delete cascade,
     followee_id uuid not null references public.profiles(id) on delete cascade,
     created_at timestamptz not null default now(),
     primary key (follower_id, followee_id),
     constraint follows_no_self check (follower_id <> followee_id)
   );
   ```
   - PK ghép `(follower_id, followee_id)` = **toggle idempotent**: theo dõi lần hai là DELETE, không phải cộng dồn. Cùng bài với `message_reactions` của 0027.
   - FK trỏ **`profiles`** chứ không `auth.users` — bài học 0020: PostgREST chỉ nhúng được khi FK **trực tiếp**, mà ta cần nhúng tên người theo dõi.
   - `check follower_id <> followee_id`: tự theo dõi mình là rác, chặn ở DB chứ không tin client.
2. Index: `create index if not exists idx_follows_followee on public.follows (followee_id);`
   PK đã phục vụ "tôi theo ai" (prefix `follower_id`); "ai theo người này" (đếm người theo dõi trên hồ sơ) quét ngược → cần index riêng.
3. RLS:
   ```sql
   alter table public.follows enable row level security;

   -- Đồ thị theo dõi CÔNG KHAI với người đã đăng nhập (như IG/X): hồ sơ phải đếm
   -- được người theo dõi của NGƯỜI KHÁC, self-only là không đếm nổi.
   create policy follows_read on public.follows
     for select using ((select auth.uid()) is not null);

   -- Chỉ tự theo dõi bằng tay mình. Không ai bắt người khác follow hộ.
   create policy follows_insert on public.follows
     for insert with check (follower_id = (select auth.uid()));

   create policy follows_delete on public.follows
     for delete using (follower_id = (select auth.uid()));
   ```
   Không có `update` — quan hệ này chỉ có/không, sửa gì mà update.
   `(select auth.uid())` bọc trong subquery: khớp style 0019 (initplan, tránh gọi lại mỗi hàng).
4. Nới view (**phụ thuộc 0027 đã apply**):
   ```sql
   -- Thêm created_at: hồ sơ người khác cần "Tham gia 02.2025". Vẫn KHÔNG có `role` —
   -- lý do đầy đủ nằm ở 0027, không nhắc lại: role lộ ra là lộ ai-là-admin.
   create or replace view public.public_profiles
     with (security_invoker = false) as
     select id, display_name, bio, created_at from public.profiles;
   ```
   ⚠️ `create or replace view` **chỉ thêm cột ở CUỐI** được — đúng ca này. Nếu Postgres từ chối (đổi thứ tự/kiểu) thì `drop view` + `create` + `grant` lại.
   ⚠️ Chạy **sau** 0027. Nếu 0027 chưa apply → view chưa tồn tại → `create or replace` vẫn chạy (tạo mới), nhưng khi đó **thiếu grant** → phải kèm `revoke`/`grant` lại cho chắc:
   ```sql
   revoke all on public.public_profiles from anon, public;
   grant select on public.public_profiles to authenticated;
   ```
   (idempotent, chạy lại vô hại — rẻ hơn là phụ thuộc thứ tự người bấm.)
5. Header file: comment tiếng Việt giải thích **vì sao** (theo giọng 0026/0027), nêu rõ phụ thuộc 0027.

## Todo

- [ ] **Lead gật số 0029** (vs 0028 của đề bài)
- [ ] `ls supabase/migrations/` xác nhận số trống
- [ ] Viết `0029_nodie_follows.sql`
- [ ] Bảng + PK ghép + check no-self + FK → profiles
- [ ] Index `followee_id`
- [ ] RLS read/insert/delete
- [ ] `create or replace view public_profiles` + `created_at` + grant lại
- [ ] **Đăng apply 0027 rồi 0029 lên prod**
- [ ] Xác minh bằng psql: insert/delete follow bằng 2 tài khoản khác nhau

## Success criteria

1. `follows` tồn tại trên prod, RLS bật.
2. User A follow B → hàng xuất hiện; follow lần hai → không nhân đôi (PK chặn).
3. A **không** insert được hàng có `follower_id = B` (RLS chặn).
4. A đọc được follows của B (đếm người theo dõi chạy).
5. `select created_at from public_profiles` chạy với `authenticated`; với `anon` thì bị từ chối.
6. `select role from public_profiles` **lỗi** (cột không tồn tại) — hàng rào 0027 còn nguyên.

## Risks / Rollback

| Rủi ro | Mitigation |
|---|---|
| **Số hiệu đụng** plan 260717-1306 | Nhường 0028; `ls` trước khi tạo; ghi vào bảng "file đã đổi" ở plan.md. |
| `create or replace view` đè lên file người khác về mặt logic | Không sửa file 0027; chỉ nới thêm cột ở 0029. Nếu 0027 đổi tiếp → apply theo số thứ tự vẫn ra kết quả đúng. |
| Áp 0029 trước 0027 (người bấm nhầm) | 0029 tự `create or replace` + `grant` → vẫn đúng. Nhưng `message_reactions` của 0027 thì thiếu → **vẫn phải apply 0027**. |
| Đồ thị follow công khai = lộ "ai theo ai" | Có chủ ý (IG/X đều vậy) và cần cho việc đếm. Nếu Đăng muốn kín → đổi `follows_read` thành `follower_id = auth.uid() or followee_id = auth.uid()`, khi đó **bỏ ô "người theo dõi"** trên hồ sơ người khác. Cần Đăng gật. |
| `blocks` và `follows` không nói chuyện với nhau (chặn rồi vẫn theo dõi được) | **Ghi nợ**, không xử ở phase này. YAGNI cho tới khi có ca thật. |

**Rollback:** `drop table public.follows;` + `create or replace view` về lại 3 cột. Chưa có dữ liệu thật → mất mát bằng 0. Làm **trước** khi phase 06 lên prod.
</content>
</invoke>
