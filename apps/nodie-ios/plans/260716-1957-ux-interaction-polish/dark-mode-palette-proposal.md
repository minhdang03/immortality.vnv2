# Đề xuất Dark Mode — NODIE

**Trạng thái:** CHỜ DUYỆT — chưa code dòng nào.
**Nguyên tắc:** không thêm hệ màu mới — đảo hệ be/mực sẵn có. App đã có sẵn "hệ nền tối" (thẻ ink, tab bar, header hồ sơ thành viên: cream opacity, `goldOnDark`, `accentLight`) → dark mode = mở rộng hệ đó ra toàn màn.

## Cách làm (nếu duyệt)

Đổi `NodieColors` từ hex tĩnh sang màu thích ứng (`UIColor { trait in … }` bọc trong `Color`). **Tên token giữ nguyên → 0 call-site phải sửa.** Một file + 1 colorset launch thêm biến thể dark.

Ba chỗ phải rà tay vì không đi qua token:
- Gradient bubble media (`#E4D9BF→#B8A67E`) — giữ nguyên được (đủ tối).
- `person.bg` avatar (hex cứng trong MockData) — giữ nguyên (màu nhận diện người).
- Thẻ tối sẵn có (tab bar, header thành viên, card Cân bằng) — GIỮ NGUYÊN ink; trên nền dark chúng cần viền `onDarkBorder` để tách lớp.

## Bảng màu đề xuất

| Token | Light (hiện tại) | Dark (đề xuất) | Ghi chú |
|---|---|---|---|
| `bg` | `#FAF7F0` | `#171209` | Nâu-đen ấm, không đen tuyền — giữ chất "giấy/đạo" |
| `surface` | `#FFFFFF` | `#221B10` | Card nổi hơn nền 1 nấc |
| `ink` | `#241C10` | `#F2EDE2` | Chữ chính — đảo gần đúng cream |
| `inkBody` | `#4D4230` | `#CFC5AF` | |
| `inkSoft` | `#6D5F45` | `#B0A188` | |
| `inkMuted` | `#8A7A5C` | `#94866B` | Meta — giữ tương phản ≥ 4.5:1 trên `bg` |
| `inkFaint` | `#A99A78` | `#776C55` | Timestamp |
| `label` | `#8A6D3F` | `#CBB98A` | = `goldOnDark` sẵn có |
| `accent` | `#2B7A5E` | `#48A57F` | Lục sáng hơn 1 nấc cho đủ tương phản nút/link |
| `accentLight` | `#A894FF` | `#A894FF` | Giữ — sinh ra cho nền tối |
| `sun` / `sunDim` | `#E8A200` / `#C69214` | giữ / `#8F6E1F` | ☀ tắt phải chìm xuống trên nền tối |
| `gold` | `#B8862B` | `#CBB98A` | |
| `rule` | `#E8DFC9` | `#3A3122` | |
| `ruleLight` | `#F0E8D6` | `#2E2718` | |
| `chipBorder` | `#D9CDB2` | `#4A3F2C` | |
| `tagBg` | `#F1E9D8` | `#2E2515` | |
| `expertBg` | `#ECE7FB` | `#2B2440` | |
| `bestBg` / `bestBorder` / `bestBadgeBg` | `#F3F7F4` / `#BCD8CA` / `#E3F0E9` | `#1C2620` / `#35594A` / `#24352C` | Card "Hay nhất" |
| `rec` / `recBorder` | `#C0392B` / `#E5C9C4` | `#E05545` / `#5A322C` | |
| `cream` + nhóm `onDark*` | — | giữ nguyên | Thẻ ink không đổi giữa 2 mode |
| Bubble mình (ink) | ink/cream | `#332A1B` nền + cream | Ink thuần sẽ lẫn vào bg tối |

## Việc kèm theo

- `LaunchBackground.colorset` thêm appearance dark `#171209`.
- Bubble chat "của mình" đang fill `ink` — trên nền dark cần token riêng (`bubbleMine`?) vì ink-đảo thành chữ sáng. Đây là chỗ duy nhất phải thêm token mới.
- UI test chạy cả 2 appearance? Đề xuất: chỉ smoke 1 màn dark, không nhân đôi suite.

## Chưa quyết (cần Đăng)

1. Làm dark mode thật, hay khoá light-only (`UIUserInterfaceStyle: Light` trong Info.plist — 1 dòng, hết flash trắng khi máy dark)?
2. Nếu làm: theo hệ thống (auto) hay có toggle trong Cá nhân? Đề xuất: theo hệ thống, không toggle (FB/IG cũng vậy).
3. Prototype không có bản tối — bảng trên là em nội suy từ hệ be/mực. Có muốn dựng lại trong Claude Design trước khi code không?
