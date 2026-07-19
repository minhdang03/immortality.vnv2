# Chat: disk cache + realtime cấp store + thumbnail ảnh

**Status:** DONE (code) — 5 phase xong, build xanh, 2 vòng code-review (18 findings) xử lý xong,
migrations 0041+0042 đã áp prod. Gate UITest **BỎ theo lệnh Đăng 19/07 ~04:00** (bị phiên khác
tranh máy kill 3 lần) — nghiệm thu = build sạch + code-review + verify prod psql/HTTP.
Còn nợ: verify 2 tài khoản 2 simulator; quyết định P2-4 (ẩn reaction người bị chặn?); commit.
**Ngày:** 2026-07-19 · **Nguồn:** audit chat UX (3 gap so với WhatsApp/Zalo chuẩn) + đợt 2 theo
đánh giá "chat còn thiếu gì" (live reactions/edits + Đã xem DM)

**Đổi so với spec ban đầu (có lý do đo thật):**
- Transform PHẢI kèm `resize:"contain"` — chỉ `width` là Storage giữ nguyên chiều cao, ảnh méo
  (đo prod 19/07: 1536×2048 → 464×2048). Đúng spec: 754KB → 50KB (~15×).
- BỎ cờ `transformUnavailable` toàn phiên — fallback per-request/per-ảnh (review finding #5:
  một ảnh chết không được kéo cả phiên về ảnh gốc). Transform xác nhận ĐANG BẬT trên prod.
- Realtime: 5 hàm cấp store gắn `@MainActor`; resume chỉ khi về từ `.background` thật
  (cờ `wasInBackground` — kéo Notification Center không đập socket).
- Review findings #7 (createdAt client-clock trên đĩa, tự lành khi mở chat) và #9 (đĩa lưu
  bản đã lọc blocked từ fetchNewMessages) — chấp nhận, không sửa đợt này.

## Mục tiêu

1. Mở app → mở chat thấy lịch sử NGAY từ đĩa (GRDB/SQLite), mạng chỉ sync phần mới.
2. Tin mới hiện ở MỌI NƠI (badge, danh sách nổi lên đầu) — không chỉ trong khung chat đang mở.
   App về từ background có catch-up.
3. Bubble ảnh tải bản thu nhỏ (~464px) thay vì 2048px — thử Supabase transform, fallback ảnh gốc.

## Phases

| # | Phase | File | Ước lượng | Model đề xuất |
|---|-------|------|-----------|---------------|
| 1 | GRDB disk cache cho channels + messages | [phase-01](phase-01-grdb-disk-cache.md) | 1–1.5 ngày | **Fable** — đụng ConversationStore nhiều bẫy (pendingMedia reattach, per-user wipe, thứ tự disk-trước-mạng-sau) |
| 2 | Realtime cấp store + scenePhase catch-up | [phase-02](phase-02-store-level-realtime.md) | 0.5–1 ngày | **Fable** — RLS/WALRUS phải verify trên prod bằng tài khoản role='user', không tin build xanh |
| 3 | Thumbnail bubble ảnh qua Storage transform | [phase-03](phase-03-image-thumbnails.md) | 0.5 ngày | **Opus (fast)** — spec cơ khí rõ; riêng bước verify HTTP transform trên prod nên chạy Fable hoặc tự tay |
| 4 | Reaction/sửa/xoá của người khác hiện live | [phase-04](phase-04-live-reactions-edits-deletes.md) | 0.5 ngày | **Fable** — cùng vùng bẫy realtime phase 02 |
| 5 | "Đã xem" cho DM từ last_read_at | [phase-05](phase-05-dm-seen-receipt.md) | 0.5 ngày | **Fable** — DDL prod (0041) + suy trạng thái đọc |
| 6 | Typing indicator (Broadcast) | [phase-06](phase-06-typing-indicator-broadcast.md) | 0.5 ngày | **Fable** — lần đầu dùng Broadcast, vòng đời subscription |
| 7 | Hàng đợi gửi offline | [phase-07](phase-07-offline-send-queue.md) | 0.5 ngày | **Fable** — đổi nhánh lỗi send, vùng dễ mất tin/tin đôi |
| 8 | Ẩn reaction+typing người bị chặn | [phase-08](phase-08-hide-blocked-reactions.md) | 0.1 ngày | **Opus (fast)** — fix accessor một điểm |
| 9 | Link preview card (LinkPresentation) | [phase-09](phase-09-link-preview-card.md) | 0.3 ngày | **Opus (fast)** — API hệ thống, khuôn cache sẵn |
| 10 | Vạch "Tin chưa đọc" | [phase-10](phase-10-unread-divider.md) | 0.2 ngày | **Opus (fast)** — view thuần + so mốc |
| 11 | Chuyển tiếp tin (copy media theo policy path) | [phase-11](phase-11-forward-message.md) | 0.5 ngày | **Fable** — policy Storage đọc quyền từ đường dẫn |
| 12 | Tìm kiếm kênh + tin nhắn | [phase-12](phase-12-conversation-search.md) | 0.3 ngày | **Opus (fast)** — ILIKE + UI list khuôn sẵn |
| 13 | Polish tốc độ render (O(n²)→O(n), decode off-main) | [phase-13](phase-13-render-performance-polish.md) | 0.2 ngày | **Fable** — refactor đường nóng của body |
| 14 | Dải phân cách ngày | [phase-14](phase-14-day-separators.md) | 0.2 ngày | **Opus gõ / Fable review** |
| 15 | Nút cuộn-xuống-đáy | [phase-15](phase-15-scroll-to-bottom-button.md) | 0.1 ngày | **Opus gõ / Fable review** |
| 16 | Tin nhắn video (poster + AVPlayer) | [phase-16](phase-16-video-message.md) | 1 ngày | **Fable** — pipeline media + async |
| 17 | Nhắc tên @ | [phase-17](phase-17-mention.md) | 0.5 ngày | **Fable** — composer + parse/render |
| 18 | Nhảy tới đúng tin từ search | [phase-18](phase-18-jump-to-message.md) | 0.5 ngày | **Fable** — keyset 2 chiều + cuộn |

Thứ tự: 1 → 2 → 3 (1 và 2 cùng đụng ConversationStore; 3 độc lập, có thể đảo lên nếu cần ship nhanh).

## Dependencies

- SPM mới: **GRDB.swift** (`groue/GRDB.swift`, from 7.0.0) — dependency thứ 2 sau supabase-swift.
  Sửa `project.yml` → `xcodegen generate` (BẮT BUỘC).
- Phase 3 phụ thuộc plan Supabase: image transform là tính năng **Pro**. Media chat nằm trên
  Supabase Storage bucket `chat-media` (KHÔNG phải R2 — R2 là web). Thiết kế fallback nên
  free tier vẫn chạy đúng như hiện tại.

## Nghiệm thu (đã chốt với Đăng)

- Build sạch + `scripts/run-uitest-gate.sh 3` xanh 3/3 (seed trước mỗi run, máy nguội load<8).
- Test bằng tài khoản role='user' (KHÔNG admin — is_admin() ngắn mạch RLS).
- Verify hành vi thật trên simulator: mở chat từ cold start thấy tin ngay; tin mới đến khi
  đứng ngoài danh sách → badge nhảy + kênh nổi lên; bubble ảnh tải URL có `width=`.

## Không làm đợt này

- Broadcast thay postgres_changes (nợ scale, đã ghi chú sẵn trong code).
- Search offline / lịch sử vô hạn trên disk cache (giữ ~200 tin/kênh).
- Đổi pipeline upload (2048px giữ nguyên — viewer full-screen cần bản to).
- UPDATE/DELETE realtime (sửa/xoá tin của người khác vẫn chờ refresh — như hiện tại).
