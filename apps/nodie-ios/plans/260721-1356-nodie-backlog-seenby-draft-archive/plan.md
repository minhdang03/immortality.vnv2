# NODIE backlog — Đã-xem-bởi-ai (nhóm) · Draft · Archive

**Trạng thái:** scoping · **Nhánh:** main · **Ngày:** 21/07/2026
Ba mục Đăng chọn từ backlog chat. Xếp theo chi phí tăng dần. Chưa code — chờ hợp nhất phiên.

## Bối cảnh đã xác minh (đọc code + prod 21/07)

- `members(of:)` (ConversationStore ~463) **đã fetch sẵn** per-member `last_read_at` + `display_name`.
- `peerLastRead` đã có (mốc đọc xa nhất, nguồn ✓✓). Nhóm ✓✓ đã chạy.
- `channel_members` **CHƯA có** cột `archived_at` / `draft`. → cần quyết: sync server hay local.

## Phase 01 — "Đã xem bởi ai" trong nhóm (RẺ NHẤT)

**Migration:** KHÔNG (data đã fetch). **Model:** Opus (fast) — thuần UI.
- Store: accessor `seenBy(message:in:) -> [ChannelMember]` = lọc members có `last_read_at >= message.createdAt`, trừ chính mình + tác giả.
- UI: chạm/giữ tin CỦA MÌNH trong nhóm → sheet "Đã xem bởi" liệt kê tên + avatar. DM giữ nhãn "Đã xem" như cũ.
- ⚠️ Anti-pattern CLAUDE.md: KHÔNG đếm đầu người thành điểm số/leaderboard. Chỉ liệt kê ai đã đọc — như Zalo/Messenger. Metric trên NỘI DUNG, không xếp hạng NGƯỜI.
- `members(of:)` chỉ nạp khi mở Thông tin nhóm → seen-by cần gọi `members()` lúc mở sheet (rẻ, bảng nhỏ).

## Phase 02 — Draft theo hội thoại

**Quyết định cần Đăng:** local-only hay sync?
- (a) **Local `@AppStorage` theo channelId** ← khuyến nghị. "Gõ dở thoát ra vào lại còn nguyên" trên CÙNG máy. KISS, không migration, không đường ghi.
- (b) Sync server (Telegram): cột `channel_members.draft` + realtime. Đắt hơn nhiều, đa thiết bị. YAGNI ở quy mô hiện tại.
- Nếu (a): lưu draft khi rời `ChatDetailView`, nạp lại khi vào; xoá khi gửi. Ô nhập đã tách `MessageComposer` (commit 0a1a448) — hook ở đó.

## Phase 03 — Archive hội thoại (ĐẮT NHẤT)

**Quyết định cần Đăng:** local hay server?
- Ẩn kênh khỏi danh sách chính, gom vào mục "Lưu trữ"; có tin mới thì bỏ lưu trữ (Telegram) hay giữ ẩn (một số app)? → chốt hành vi trước.
- (a) Local `@AppStorage` set channelId đã archive — đơn giản, không đa thiết bị.
- (b) Cột `channel_members.archived_at` + migration + RLS (chỉ chủ hàng sửa) — đa thiết bị, đúng kiểu Telegram. Nếu chọn (b): đây là migration prod, đúng vùng bẫy → Fable + dry-run + test role='user'.
- Va với unread badge + realtime resurfacing → kiểm kỹ.

## Rủi ro / chặn

- **Nhiều phiên song song vẫn đang sửa `ChatDetailView`/`ConversationStore`** (21/07 ~14:00). Cả 3 phase đụng 2 file này → PHẢI hợp nhất về MỘT phiên trước khi code, không thì va như đêm 20/07.
- Số migration đang va (hai 0045, ba 0048) — nếu phase 03 chọn (b) phải chốt số kế tiếp SẠCH (hiện cao nhất 0050).

## Câu hỏi mở

1. Draft + Archive: local hay sync server? (mặc định đề xuất: local cả hai)
2. Archive: tin mới có tự bỏ lưu trữ không?
3. Đợi hợp nhất phiên rồi mới bắt đầu?
