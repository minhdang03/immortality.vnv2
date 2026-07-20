# Phase 06 — Ghim tin nhắn (mục 6)

**Model:** **Fable** — thêm policy trên `messages`, bảng nóng nhất hệ thống.
**Migration:** `0044`. **Phụ thuộc:** phase 04 (cần vai trò quản trị).

## Vì sao

Kênh thông báo cần nội quy/thông báo đứng đầu. Hiện thông tin quan trọng trôi mất sau vài
chục tin, không có cách nào giữ lại ngoài gửi lại.

## Quyền (Đăng chốt 20/07)

**Chỉ quản trị nhóm** (nhiều người) — `is_channel_mod(channel_id)`, đồng bộ với quyền xoá
tin của mod đã có từ 0017. Thành viên thường **thấy** ghim, không ghim được.

DM: theo cùng luật — DM không có mod nên **không ai ghim được**. Nếu sau này muốn cho ghim
trong DM thì đó là quyết định riêng, không suy ra từ đây.

## Migration 0044

Cột trên `messages`, không phải bảng rời:

```sql
alter table public.messages
  add column if not exists pinned_at  timestamptz,
  add column if not exists pinned_by  uuid references auth.users(id) on delete set null;

create index if not exists idx_messages_pinned
  on public.messages(channel_id, pinned_at desc) where pinned_at is not null;
```

Cột vì ghim là **thuộc tính của tin**, một-một; bảng rời sẽ phải join ở mọi đường đọc tin
chỉ để biết một cờ.

Policy: `messages_update_own` hiện chỉ cho sửa tin của mình. Ghim là sửa tin **của người
khác** → policy riêng:

```sql
create policy messages_pin_by_mod on public.messages
  for update using (public.is_channel_mod(channel_id))
  with check (public.is_channel_mod(channel_id));
```

⚠️ **Policy UPDATE trong Postgres không giới hạn được theo CỘT.** Policy này cho mod sửa
**mọi** cột của **mọi** tin trong kênh — kể cả `body`. Mod sửa lời người khác mà không ai
biết là chuyện khác hẳn với ghim. Hai đường xử lý, phải chọn trước khi code:

- (a) **RPC `set_pinned(p_message_id, p_pinned bool)`** security definer, chỉ đụng
  `pinned_at`/`pinned_by`; KHÔNG thêm policy update nào cho mod. ← khuyến nghị
- (b) Policy như trên + trigger chặn mod đổi `body`/`metadata` của tin người khác.

(a) đơn giản hơn và đóng đúng cửa cần đóng.

## Giới hạn

**Tối đa 3 tin ghim mỗi kênh** (Telegram cho nhiều, nhưng băng ghim chiếm chỗ trên mọi màn
chat). Ghim cái thứ 4 → báo phải gỡ bớt, không âm thầm đẩy cái cũ ra.

## UI

- **Băng ghim** dưới header: 📌 + trích một dòng. Nhiều ghim thì vuốt ngang qua lại, có
  chấm chỉ số. Chạm → nhảy tới tin gốc (dùng `pendingScrollId` + `flashMessageId` đã có).
- Menu giữ-bong-bóng: **"Ghim"** / **"Bỏ ghim"** — chỉ hiện với quản trị.
- Tin đã ghim: dấu 📌 nhỏ cạnh giờ.
- Ẩn băng ghim: chạm ✕ → ẩn tới khi có ghim MỚI (nhớ theo kênh, `@AppStorage`).

## Files

- `supabase/migrations/0044_pinned_messages.sql` (mới)
- `ConversationModels.swift` — `MessageRow` thêm `pinnedAt`, `pinnedBy`.
- `ConversationStore.swift` — `pinnedMessages(in:)`, `setPinned(messageId:pinned:)`; chuỗi
  `select` thêm hai cột.
- `ChatDetailView.swift` — băng ghim + mục menu.

## Xong khi

- Quản trị ghim tin → băng hiện ngay ở mọi thành viên (realtime), chạm nhảy đúng tin.
- Thành viên thường: thấy băng, menu KHÔNG có mục Ghim.
- Ghim tin thứ 4 → báo rõ, không nuốt.
- Xoá mềm một tin đang ghim → băng tự gỡ (không trỏ vào hư không).
- Tin cũ không ghim: mọi đường đọc tin chạy y như trước.

## Rủi ro

- **Đổi chuỗi `select` là vùng PGRST201.** Thêm hai cột thì phải test bằng HTTP thật —
  build xanh không chứng minh gì.
- Băng ghim ăn chỗ của danh sách tin → kiểm lại vị trí cuộn và `scrollTo(bottomAnchor)`.
- Ghim tin rồi tin đó trôi khỏi 50 tin đã nạp → chạm băng phải **nạp tới** tin đó, không
  chỉ `scrollTo` một id không có trong `rows` (đường jump-to-message phase 18 đã lo, dùng lại).
