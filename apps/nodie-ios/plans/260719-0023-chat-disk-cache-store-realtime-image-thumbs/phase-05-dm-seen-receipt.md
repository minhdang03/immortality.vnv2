# Phase 05 — "Đã xem" cho DM (✓✓ kiểu Zalo/Messenger)

**Model đề xuất:** Fable — có DDL prod (publication) + suy "đã xem" từ `last_read_at`, sai là
hiện trạng thái đọc sai cho người thật.

## Nguyên tắc

KHÔNG bảng read-state per-message (quy tắc scale #4): "đã xem" = `createdAt ≤ last_read_at`
của NGƯỜI KIA trong DM — dữ liệu đã có sẵn. Chỉ DM ở v1; nhóm tính sau nếu cần.

## Thiết kế

1. **Migration 0041**: thêm `channel_members` vào publication `supabase_realtime` (idempotent,
   guard pg_publication_tables). RLS `members_read` sẵn → WALRUS chỉ đẩy cho thành viên cùng kênh.
   Áp psql tay theo kỷ luật dry-run.
2. **Nạp ban đầu**: `resolveDMTitles` (đã query `channel_members` của người kia cho mọi DM) lấy
   thêm `last_read_at` → `dmPeerLastRead: [UUID: Date]` trên store.
3. **Live**: stream `UpdateAction` trên `channel_members` → user khác + kênh dm →
   `dmPeerLastRead[channelId] = last_read_at`.
4. **UI** (`ChatDetailView`): CHỈ tin cuối của mình trong DM mang nhãn — "Đã xem" nếu
   `peerLastRead ≥ createdAt`, ngược lại "Đã gửi". Không nhãn khi đang upload/failed. Gắn mọi
   bong bóng là rác thị giác — Zalo/Messenger cũng chỉ gắn tin cuối.

## Files

- Mới: `supabase/migrations/0041_realtime_channel_members.sql`
- Sửa: `ConversationStore.swift` (dmPeerLastRead + resolveDMTitles), `ConversationStoreRealtime.swift`
  (stream + handler), `ChatDetailView.swift` (nhãn).

## Lưu ý

- 2 chuỗi UI mới "Đã xem"/"Đã gửi" — build tự trích vào xcstrings, 8 ngôn ngữ còn lại chưa dịch
  (rơi về VI, cùng trạng thái các key mới gần đây).
- Nghiệm thu: build sạch; 2 tài khoản: A gửi DM → "Đã gửi"; B mở chat → nhãn A đổi "Đã xem" ~1s.
