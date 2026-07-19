# Phase 14 — Dải phân cách ngày trong chat (Hôm nay / Hôm qua / ngày)

**Model:** Opus (fast) — view thuần, tự chứa, cùng khuôn vạch "Tin chưa đọc" (phase 10).
`timeLabel` đã giả định "ngày nằm ở dải phân cách" nhưng dải đó CHƯA tồn tại.

## Thiết kế

- Trong `ChatDetailView.body`: đã có `let rows = messages` chụp một lần. Tính thêm
  `firstOfDayIds: Set<UUID>` = id của tin ĐẦU TIÊN mỗi ngày lịch (so `Calendar.current
  .isDate(_:inSameDayAs:)` với tin liền trước).
- Chèn `dayDivider(for: message.createdAt)` TRƯỚC bubble khi `firstOfDayIds.contains(id)` —
  cùng chỗ, cùng kiểu với vạch chưa đọc (nếu cả hai rơi vào một tin thì ngày ở trên, chưa đọc
  ở dưới).
- Nhãn: `Calendar.isDateInToday` → "Hôm nay", `isDateInYesterday` → "Hôm qua", còn lại
  `DateFormatter` locale vi_VN ("12 thg 7" trong năm, "12 thg 7, 2025" khác năm).
- Style: chip nhỏ giữa màn — nền surface bo tròn, chữ tag/inkMuted (KHÔNG hai đường kẻ như
  vạch chưa đọc — phân biệt thị giác giữa "mốc thời gian" và "ranh giới đã đọc").

## Ràng buộc file ownership

- CHỈ sửa `ChatDetailView.swift`. KHÔNG đụng Localizable.xcstrings (controller lo splice sau —
  bẫy round-trip đã trả giá), KHÔNG đụng store/model.
- Dùng `String(localized: "Hôm nay")` / `"Hôm qua"` — controller kiểm/splice 2 key sau.

## Nghiệm thu

Build sạch, hành vi cũ y nguyên. Chat có tin nhiều ngày → mỗi ngày một chip; tin hôm nay dưới
chip "Hôm nay"; đúng thứ tự với vạch chưa đọc khi trùng tin.
