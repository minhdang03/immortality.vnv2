# NODIE (Bất Tử Đạo) — Design Guidelines

**Sản phẩm:** NODIE — cộng đồng hỏi đáp + chat tâm linh Việt (`apps/nodie-ios`, SwiftUI native, iOS 17+).
**Ngôn ngữ hình ảnh:** "editorial sacred" — nền kem giấy, mực nâu, accent xanh rừng. Light mode (chưa có dark).
**Locale:** tiếng Việt trước (`vi`), xcstrings 9 ngôn ngữ.

> ⚠️ **Bản này thay hẳn bản cũ** (dark tím/vàng Cormorant+Inter cho app Expo/RN) — app đó đã gỡ
> 17/07/2026, mọi giá trị trong bản cũ KHÔNG còn hiệu lực. Cần xem lại thì tra lịch sử git.

---

## 1. Nguồn sự thật — thứ tự thắng thua

1. **Code token** — `NODIE/DesignSystem/NodieColors.swift`, `NodieTypography.swift` (kèm `NodieSpacing`). Giá trị ở đây là giá trị đang ship, kể cả các chỗ **cố ý lệch prototype** (xem §7).
2. **Claude Design prototype** — `apps/nodie-ios/design_handoff_nodie_v4/Aion Prototype v3.dc.html` + `README.md` (delta v4). Là nguồn chuẩn về *bố cục & hành vi*; là design reference dựng bằng HTML, **không phải code để copy**.
3. File này — bản tóm tắt đọc-nhanh cho người/agent mới. Nếu lệch với (1) thì (1) đúng, và sửa file này.

**Quy trình màn mới:** tính năng mới → dựng trong Claude Design trước, xuất handoff delta như v4.
Chưa có prototype mà vẫn phải dựng (banner hệ thống, sheet lỗi…) → **chỉ dùng token sẵn có,
cấm bịa hex mới trong view**. Thiếu màu thì thêm token vào `NodieColors` kèm chú thích vì sao.

---

## 2. Màu — trích từ `NodieColors.swift`

### 2.1 Nền & mực

| Token | Hex | Dùng cho |
|---|---|---|
| `bg` | `#FAF7F0` | Nền app (kem giấy) |
| `outerBg` | `#EFE9DD` | Nền ngoài khung |
| `surface` | `#FFFFFF` | Card, ô nhập |
| `ink` | `#241C10` | Tiêu đề; đồng thời là NỀN của card tối + tab bar |
| `inkBody` | `#4D4230` | Thân bài |
| `inkSoft` | `#60533D` | Chữ trên chip *(AA 7.00:1)* |
| `inkMuted` | `#6F624A` | Meta *(AA 5.57:1)* |
| `inkFaint` | `#7C7158` | Timestamp *(AA 4.50:1)* |
| `label` | `#8A6D3F` | Nhãn tiết diện in hoa giãn chữ |

### 2.2 Accent & tín hiệu

| Token | Hex | Dùng cho |
|---|---|---|
| `accent` | `#2B7A5E` | Xanh rừng — MỌI hành động chính (nút gửi, CTA, tab active, badge đếm). Prototype cho chọn 4 màu, đã **chốt lục**. |
| `onAccent` | trắng | Chữ/glyph/spinner đặt TRÊN nền accent. Dùng token này, không `.white` trần. |
| `accentLight` | `#A894FF` | Tím sáng trên nền tối (chữ nhấn, nhãn AI). Cố định, không đổi theo accent. |
| `gold` / `goldOnDark` | `#B8862B` / `#CBB98A` | Vàng — dấu ấn "của mình", huy hiệu |
| `sun` / `sunDim` | `#E8A200` / `#B88713` | Glyph ☀ "thả ánh sáng": nắng khi bật, trầm khi tắt. `sunDim` chỉ cho glyph (non-text 3:1 — xem §7). |
| `purple` | `#5B43D8` | Tím phụ (gradient avatar, chip expert) |
| `rec` / `recBorder` | `#C0392B` / `#E5C9C4` | CHỈ trạng thái đang ghi âm |
| `error` | `#B3261E` | Dòng lỗi dưới ô nhập (auth, hồ sơ) *(AA 6.87:1 trên nền kem)* |

### 2.3 Viền, nền phụ, trên-nền-tối, avatar

- Viền: `rule #E8DFC9` · `ruleLight #F0E8D6` · `chipBorder #D9CDB2`
- Nền phụ: `tagBg #F1E9D8` · `expertBg #ECE7FB` · `bestBg/bestBorder/bestBadgeBg` (khối "Hay nhất")
- Trên nền tối (card ink/tab bar): họ `cream #FAF7F0` + opacity — `tabDim .5`, `onDarkBody .6`, `onDarkStrong .8`, `onDarkFill .06`, `onDarkTrack .12`, `onDarkBorder .2`
- Gradient avatar (135°): mình = `avatarSelfFrom #FFE6A8 → avatarSelfTo (gold)`; tím = `avatarPurpleFrom #C9B8F5 → avatarPurpleTo (purple)`; kênh chat lấy màu từ DB (`Color(hexString:)`, có fallback)

### 2.4 Luật dùng màu

- **Accent = hành động.** Bấm được và đẩy người dùng đi tiếp → accent. Không dùng accent trang trí.
- **Vàng/☀ = ánh sáng & của mình.** Không cho vàng cạnh tranh với accent trong cùng một khối.
- **Đỏ = tín hiệu.** `error` cho lỗi, `rec` cho ghi âm. Không đỏ trang trí.
- **`.white` trần chỉ hợp lệ trên media/scrim** (chữ đè ảnh, nút play trên video, lớp phủ đen). Trên nền accent phải là `onAccent`.
- **Cấm `Color(hex:)` ngoài `DesignSystem/`** — gate `scripts/check-design-tokens.sh` chặn (ngoại lệ duy nhất: `Models/MockData.swift`, fixture của 2 tab đang ẩn).
- Không nền trắng tinh tràn màn (surface trắng chỉ cho card/ô nhập trên nền kem); không `#000` thuần.

---

## 3. Typography — trích từ `NodieTypography.swift`

- **Serif** (tiêu đề, câu hỏi, trích dẫn): system serif — New York. **Sans** (thân, meta, nhãn): SF Pro.
  Prototype dùng Lora + Be Vietnam Pro; đã map sang font hệ thống để phủ dấu tiếng Việt không cần bundle. Muốn khớp 100% chỉ cần sửa 2 hàm `serif`/`sans`.
- **Dynamic Type bắt buộc:** mọi cỡ đi qua `scaled()` (neo UIFontMetrics theo cỡ gần nhất). View mới không gọi `.font(.system(size:))` cho CHỮ — chỉ chấp nhận cho glyph/icon trang trí.
- Tối đa 2 họ font trên một màn (serif tiêu đề + sans còn lại).

Vai trò chính (đủ dùng, xem file cho bản đầy đủ): `screenTitle` serif 26 · `detailTitle` 20 · `cardTitle` 18–19 · `cardTitleSm` 16 · `body` 13.5 · `bodySm` 13 · `meta` 12 · `timestamp` 11 · `rowTitle` 14.5 sb · `chatName` 15 b · `chip` 12 sb · `cta` 12.5 sb / `ctaLg` 13.5 b · `eyebrow` 12 sb (tracking 1.6 đặt ở view).

---

## 4. Spacing & layout — `NodieSpacing`

- Thang: `xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24`
- `screenH = 22` — lề ngang chuẩn MỌI màn (prototype 22px). `screenTop = 18`.
- Touch target **≥ 44×44pt** (nút gửi 44, dùng `expandedHitArea` khi visual nhỏ hơn).
- Tab bar nổi (ẩn khi push detail) — nội dung cuối danh sách chừa đáy 74.
- Mỗi tab một `NavigationStack` + path riêng trong `AppState` (pattern FB/IG/X); edge-swipe-back của hệ thống, không tự viết.

---

## 5. Thuật ngữ & giọng (copy)

- **"chiếu sáng"**, không bao giờ "phóng". Nút hỏi: "＋ Chiếu câu hỏi"; nút gửi màn hỏi: "Chiếu sáng"; like = "thả ánh sáng", đơn vị "hạt ánh sáng", glyph ☀.
- Tab: "Hỏi đáp" · "Chat" (không "Hội thoại") · "Bạn bè".
- Giọng ngang hàng, không bề trên, không ẩn dụ Phật giáo trong UI. Metric nằm trên NỘI DUNG; **không leaderboard giữa người với người** (thống kê hồ sơ cá nhân thì được — quyết định 16/07).
- Nhãn vai trò (admin/mod) chỉ hiện với admin/mod.

---

## 6. Accessibility (đã đo, đừng phá)

- Text nhỏ ≥ 4.5:1 trên nền kem — `inkSoft/inkMuted/inkFaint/error` đều đã đo đạt (script `contrast.py`, report phase 05).
- Non-text ≥ 3:1 — `sunDim` 3.01:1, chỉ cho glyph ☀, **không** đẩy lên 4.5 (mất sắc vàng trầm).
- Mọi phần tử tương tác có `accessibilityLabel`/`accessibilityIdentifier` tiếng Việt; UITest a11y + touch-target nằm trong gate 51 test.

---

## 7. Lệch prototype CÓ CHỦ ĐÍCH — đừng "sửa lại cho giống"

| Chỗ lệch | Vì sao |
|---|---|
| `inkSoft/inkMuted/inkFaint` đậm hơn prototype | Prototype rớt WCAG AA; hạ value giữ hue (phase 05, có số đo) |
| Font hệ thống thay Lora/Be Vietnam Pro | Phủ dấu Việt + Dynamic Type miễn phí, không bundle .ttf |
| Nút gửi 44pt, safe-area đáy, NavigationStack native | Chuẩn iOS — chính handoff v4 yêu cầu |
| `sunDim` không đạt 4.5:1 | Glyph non-text, ngưỡng 3:1 là đúng luật |

---

## 8. Gate chống drift

```bash
apps/nodie-ios/scripts/check-design-tokens.sh   # grep Color(hex:) ngoài DesignSystem → fail
```

Chạy tay lúc dev; tự chạy ở đầu `run-uitest-gate.sh` (release gate). Vi phạm = thêm token vào `NodieColors` rồi dùng token, không allowlist thêm.

---

## 9. Phạm vi

File này tả **NODIE iOS**. Web battudao.com (`apps/web`) đang giữ style riêng có trước — chưa hợp nhất; khi làm lại web theo ngôn ngữ Aion thì cập nhật ở đây. Android chưa tồn tại.
