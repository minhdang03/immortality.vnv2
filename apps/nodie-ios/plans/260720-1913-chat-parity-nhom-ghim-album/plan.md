# Chat bắt kịp Zalo/Messenger — đợt 2

**Trạng thái:** chưa bắt đầu · **Nhánh:** main · **Ngày:** 20/07/2026

Đợt 1 (chú thích ảnh, lưu ảnh, chưa đọc, chạm-đôi ☀, emoji lớn) đã ship ở `d70259c`.
Đợt này làm 5 mục còn lại trong bảng so sánh: 8, 10, 11, 7, 6. Mục 12 (xoá cho riêng
mình) Đăng chốt **để sau**. Mục 9 (online/hoạt động gần đây) **không làm** — tạo áp lực
phải trả lời, ngược nguyên tắc sản phẩm.

## Quyết định sản phẩm (Đăng chốt 20/07)

1. **User được tự tạo nhóm** — ĐẢO quyết định cũ "chỉ admin tạo nhóm" (CLAUDE.md +
   `channels_insert_dm`). Người tạo là quản trị nhóm, chuyển giao được, nhiều quản trị —
   mô hình Telegram/Zalo/FB/IG.
2. **Ghim tin: chỉ quản trị nhóm** (nhiều người), đồng bộ với quyền xoá tin của mod đã có.
3. Xoá-cho-riêng-mình: hoãn.

## Phases

| # | Việc | Migration | Model | Trạng thái |
|---|---|---|---|---|
| 01 | Trạng thái gửi từng tin (mục 8) | không | Opus (fast) | ✅ committed `350606c` |
| 02 | Gộp album nhiều ảnh (mục 11) | không | Opus (fast) | ✅ committed `350606c` |
| 03 | Chọn nhiều tin (mục 10) | không | Opus (fast) | ✅ committed `350606c` |
| 04 | Nền quyền nhóm: vai trò + tạo nhóm + RLS (mục 7a) | **0043 + 0044** | **Fable** | ✅ prod applied + ma trận verified 21/07 (uncommitted) |
| 05 | UI quản trị nhóm (mục 7b) | không | Opus (fast) | ✅ built + compiles (chưa runtime-test) (uncommitted) |
| 06 | Ghim tin nhắn (mục 6) | **0045** (0044 đã bị guard chiếm) | **Fable** | ☐ chưa bắt đầu — mục DUY NHẤT còn lại |

> **0044 ngoài kế hoạch:** Fable phát hiện + vá lỗ tự-phong-mod (RLS không bó theo cột) bằng
> trigger `trg_guard_member_role`, kiểu `nodie_clamp_last_read_at` (0042). Đã verified prod.
> ⇒ migration ghim tin của phase 06 giờ là **0045**, không phải 0044.

**Tư vấn model:** phase 01–03, 05 là việc cơ khí có spec rõ, `sendMedia`/`MessageBubbleView`
đã có khuôn — Opus (fast) đủ. Phase 04 và 06 đụng **RLS trên prod**, đúng vùng đã trả giá 4
bug P0 hôm 17/07 — Fable, và review cuối cũng Fable.

## Thứ tự & phụ thuộc

```
01 ─┐
02 ─┼─→ (độc lập, ship được ngay từng cái)
03 ─┘
04 ──→ 05 ──→ 06        (06 cần vai trò quản trị từ 04)
```

01–03 không đụng DB nên ship trước, không chờ gì. 04 là cửa vào của 05 và 06.

## Tiêu chí xong (toàn đợt)

- Người dùng thường (KHÔNG phải admin) tạo được nhóm, thêm/xoá người, đổi tên, phong và
  chuyển giao quản trị, ghim/gỡ ghim tin.
- Gửi 6 ảnh ra MỘT bong bóng lưới, không phải 6 bong bóng rời.
- Mỗi tin của mình mang trạng thái riêng (đang gửi / đã gửi / đã xem), không chỉ tin cuối.
- Chọn nhiều tin để xoá/chuyển tiếp một lượt.
- Không hồi quy: gửi/nhận/realtime/offline queue/cache đĩa/tìm kiếm chạy như cũ.

## Rủi ro đã biết

- **Test bằng admin = không test gì.** 04–06 phải chạy bằng tài khoản `role='user'`
  (`NODIE_TEST_*`). `is_admin()` ngắn mạch mọi policy và đã giấu 4 bug P0.
- **Dev đang chạy thẳng trên prod.** Roadmap scale đã đặt "tách staging" là việc số 1;
  đợt này thêm 2 migration nữa vào prod. Dry-run `begin; … rollback;` bắt buộc.
- **Mở quyền tạo nhóm = mở cửa nhóm rác.** Moderation hiện chỉ có report/block ở mức
  người và nội dung, chưa có gì ở mức nhóm.
- **Máy đang có phiên khác build NODIE** (load ~12). UITest cho kết quả rác tới khi rảnh.

## Phase files

- `phase-01-trang-thai-gui-tung-tin.md`
- `phase-02-gop-album-nhieu-anh.md`
- `phase-03-chon-nhieu-tin.md`
- `phase-04-nen-quyen-nhom-rls.md`
- `phase-05-ui-quan-tri-nhom.md`
- `phase-06-ghim-tin-nhan.md`
