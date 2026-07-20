# Phase 06 — Chặng 2: dừng vì phiên khác đang sửa cùng file (21/07 01:13)

## Tình huống

Khi vào chặng 2, phát hiện **một phiên Claude khác đang sửa CHÍNH các file chặng 2, ngay
lúc này** (5 tiến trình `claude` đang chạy; mtime nhảy liên tục trong lúc tôi làm việc):

- `ChatDetailView.swift` — sửa 01:12:58 (7 giây trước lần kiểm cuối)
- `ConversationStore.swift` — 01:11:54 → 01:12:17
- `ConversationStoreRealtime.swift` — 01:09:05

Phiên đó đang viết đúng code phase 06 (pinnedMessages/setPinned/pinBanner/onPin đều đã có
trong cây, line number trôi +56 giữa hai lần grep của tôi). Report tái dựng 00:45 ghi
"06 ghim tin: chưa (0 ref pinnedAt)" — đã lỗi thời ngay khi tôi bắt đầu: rất có thể phiên
bị cắt đã được nối lại song song với tôi.

**Theo luật file ownership: tôi KHÔNG sửa file Swift, KHÔNG build** (build trên cây đang
đổi từng giây không chứng minh gì, và va derived-data/pbxproj nếu phiên kia build).

## Đã làm được (không đụng file của phiên kia)

### Chặng 1 — DB: XONG, xem `phase-06-chang-1-db-pinned-verify-260721.md`

- 0045 đã applied từ trước; vá 2 lỗi đếm trần trong `set_pinned` (đếm cả tin xoá mềm →
  slot kẹt vĩnh viễn; đếm cả chính tin re-ghim) — applied + verify.
- **Lỗ bảo mật MỚI, chứng minh sống trên prod rồi vá**: tác giả tự ghim tin mình bằng
  UPDATE thẳng qua `messages_update_own` (RLS không bó theo cột — đúng bài 0044/0047).
  Vá bằng `0048_guard_pinned_columns.sql`: mở rộng `tg_messages_guard` clamp
  `pinned_at`/`pinned_by`. Applied + verify (clamp ăn, sửa body/xoá mềm/RPC mod không hỏng).
- Suite forged-JWT role='user' 7 test + 3 regression: tất cả đúng kỳ vọng, rollback sạch.
- Realtime: publication cột đầy đủ (prattrs rỗng) → pinned_at chảy qua UPDATE event sẵn.

### PGRST201 — test HTTP THẬT, đạt (độc lập với edit của phiên kia)

Đăng nhập tài khoản test role='user' qua password grant, gọi PostgREST thẳng:

- `messageSelect` mới (`...,pinned_at,pinned_by,...author!messages_user_id_fkey...`):
  **HTTP 200**, đủ 12 keys gồm `pinned_at`/`pinned_by`, embed author + reactions resolve
  đúng — KHÔNG PGRST201.
- Query băng ghim (`pinned_at=not.is.null&deleted_at=is.null&order=pinned_at.desc`):
  **HTTP 200**, `[]` (prod hiện 0 tin ghim — đúng).

Lưu ý: nếu phiên kia đổi tiếp chuỗi select thì phải test lại; riêng việc THÊM
`pinned_at,pinned_by` đã chứng minh an toàn.

## Việc còn lại cho phiên đang giữ file Swift (đọc lúc 01:05, có thể họ đã làm)

1. **`dismissedPinId` đang là `@State`** — spec đòi `@AppStorage` nhớ THEO KÊNH ("ẩn tới
   khi có ghim mới"). `@State` = mở lại màn là băng hiện lại dù đã ✕.
2. **Băng ghim chỉ hiện ghim mới nhất + đếm ("3 tin đã ghim")** — spec đòi *vuốt ngang
   qua lại giữa các ghim, có chấm chỉ số*.
3. Đã có sẵn & đúng (tính đến bản tôi đọc): pinBanner đặt dưới header (ẩn khi selecting),
   jumpTo dùng lại loadWindow/pendingScrollId/flashMessageId ✓, onPin chỉ hiện với
   `canPin` (mod nhóm) + tin đã lên server ✓, dấu 📌 cạnh giờ ✓, `pinnedMessages` lọc
   `deleted_at is null` ✓, Realtime vá `replacingPin` + pinSignature reload băng ✓,
   xoá mềm qua Realtime rút tin khỏi list → băng tự gỡ ✓.
4. Sau khi cây đứng yên: `xcodegen generate` (có file mới GroupComposeView/
   ConversationStoreGroups từ phase 04–05) rồi build iPhone 17.

## Prod sạch

0 tin ghim, 0 kênh test sót (`%pin-verify%` = 0 rows); nhóm test 0043 bỏ quên đã được dọn
từ trước. Mọi fixture verify của tôi đều nằm trong transaction rollback.

## Bẫy vận hành ghi lại

- `create_group` forged-JWT dính rate_limit `channels 3/3600` (test residue trong cửa sổ)
  → dựng fixture bằng psql owner (auth.uid() null không bị đếm).
- Insert messages dính slow_mode 2s/tin cùng tác giả → backdate `created_at` khi seed.
- Đánh số migration đã va: có HAI file 0045 (`0045_nodie_app_config.sql` của workstream
  rate-limit). Cả hai applied, ledger theo filename nên không hỏng — nhưng cần quy ước
  chốt số trước khi nhiều phiên chạy song song.
