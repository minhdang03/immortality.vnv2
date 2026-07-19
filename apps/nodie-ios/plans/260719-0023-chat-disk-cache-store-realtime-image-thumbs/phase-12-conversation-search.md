# Phase 12 — Tìm kiếm trong tab Chat (kênh + nội dung tin)

**Model đề xuất:** Opus (fast) — query ILIKE + UI list, khuôn sẵn; Fable soát escaping/RLS.

## Thiết kế

- Ô tìm trong `ConversationListView` (TextField custom theo tông app — màn dùng header tự vẽ,
  không xài `.searchable` của nav bar).
- Gõ ≥2 ký tự (debounce 300ms):
  - **Kênh:** lọc local `displayTitle` contains (case-insensitive).
  - **Tin nhắn:** server `ilike("body", "%q%")` — select nhẹ `id,channel_id,body,created_at`,
    `deleted_at is null`, limit 30, mới nhất trước. RLS tự giới hạn kênh đọc được; tìm được
    CẢ lịch sử ngoài 200 tin cache đĩa. Escape `%`/`_` trong query người gõ.
- Kết quả 2 section: "Hội thoại" / "Tin nhắn" (row: tên kênh + snippet + giờ) — tap mở kênh.
  Nhược v1 (ghi nhận): mở ở ĐÁY chứ chưa nhảy tới đúng tin (jump-to-message cần cửa sổ keyset
  quanh tin — để đợt sau).
- Dấu tiếng Việt: ILIKE không match không-dấu → có-dấu — chấp nhận v1.

## Nghiệm thu

Build sạch. Gõ từ có trong tin cũ (ngoài trang đầu) → hit hiện kèm tên kênh; tap mở đúng kênh.
Gõ "%" không làm query nổ.
