# Visual audit toàn website — Bất Tử Đạo

Ngày: 2026-07-11  
Phạm vi: production desktop 1440×900 + mobile 390×844; Home, Articles, Khai Trí, Stories, Practice, Energy, About, Contact, Community, Admin login. Không audit admin sau đăng nhập.

## Kết luận

Không cần đổi phong cách. Hướng `sacred editorial + cosmic imagery + paper surface` phù hợp brand. Vấn đề chính: độ hoàn thiện giữa trang không đồng đều, page header thiếu quy chuẩn, nhiều text/card quá nhạt, imagery lặp, floating chatbot che nội dung.

| Trang | Visual | Nhận định |
|---|---:|---|
| Trang Chủ | 8.5/10 | Mạnh nhất; hero có bản sắc, hierarchy rõ |
| Bài Viết | 7.5/10 | Card đẹp; ảnh lặp, text phụ nhạt |
| Năng Lượng | 7.5/10 | Immersive tốt; lệch hệ visual chung |
| 37 Câu Chuyện | 7/10 | Dễ quét; rainbow tags và grid dày |
| Giới Thiệu | 6.5/10 | Sạch nhưng thành wall-of-text |
| Khai Trí | 6/10 | Rất nhạt/sparse, chưa có featured hierarchy |
| Thái Dương Quyền | 6/10 | Cấu trúc tốt; placeholder nhiều, thiếu hình hướng dẫn |
| Cộng Đồng | 6/10 | Hero/newsletter ổn; nội dung còn mỏng |
| Admin login | 6/10 | Sạch; button/style chưa cùng brand, public chrome gây nhiễu |
| Liên Hệ | 5.5/10 | Giống form MVP, thiếu context và composition |

## Toàn cục — cần cải thiện

### P0

1. **Chatbot FAB che nội dung** trên Articles, Stories, Practice, About, Contact, Community; mobile rõ nhất.
   - Dùng collision-aware offset với bottom nav.
   - Khi user cuộn đọc: thu nhỏ/ẩn; hiện lại khi dừng.
   - Trên article: đặt vào toolbar hoặc sticky rail, không phủ body.

2. **Page header không thống nhất.**
   - Centered: Khai Trí, Stories, Practice, About.
   - Left: Articles, Contact.
   - Immersive: Energy.
   - Tạo 2 template: `EditorialPageHero` và `ImmersivePageHero`; cùng eyebrow, H1 scale, subtitle, top/bottom rhythm.

3. **Surface/card quá nhạt trên light mode.**
   - Khai Trí, Stories, Practice, About dùng beige-on-beige với border gần biến mất.
   - Tăng separation bằng white/cream surface rõ hơn, border token mạnh hơn hoặc rule-based editorial layout.

4. **Typography hệ thống chưa nhất quán.**
   - Giữ Cormorant cho display/H1/H2/quote.
   - Dùng Be Vietnam Pro cho body dài, forms, metadata.
   - Chuẩn scale: 12 label, 14 meta, 16 body UI, 18–20 reading, 24/32/48 headings.
   - Tránh body/meta dưới 12px; bottom-nav hiện ~9.9px.

### P1

5. **Ảnh AI vũ trụ lặp motif mắt/đầu người/năng lượng.**
   - Cohesive nhưng tạo cảm giác “AI sameness”, giảm khả năng phân biệt bài.
   - Art direction theo category: Energy = gold flow; Wisdom = eye/brain; Stories = human/place; Practice = movement/body diagrams.
   - Trộn ảnh tư liệu, diagram, typography cover; không dùng cosmic portrait cho mọi card.

6. **Icon language trộn nhiều kiểu.**
   - Custom sun, SVG outline, glyph moon, emoji admin, text EN.
   - Chọn một SVG family/stroke 1.5–2px; emoji chỉ là content, không làm structural icon.

7. **Quá nhiều raw colors/radii/shadows theo page.**
   - Stories dùng rainbow green/orange/purple/red/blue, lệch gold monochrome.
   - Chuẩn semantic tokens: surface-1/2, text-primary/secondary, accent, category tonal, danger/success.
   - Chuẩn radius: 8 / 12 / 16; shadow: none / sm / elevated.

8. **Global ambient particles/rays không hợp mọi context.**
   - Giữ mạnh ở Home/Energy.
   - Giảm hoặc tắt ở Article, Contact, Admin để content/forms sạch hơn.

9. **Header desktop quá nhiều mục và text nhỏ.**
   - Giữ 5 primary destinations; đưa Contact/Admin/secondary vào More/footer.
   - Search cần dễ thấy hơn.
   - Public admin icon hiện quá nổi và khó hiểu.

## Theo từng trang

### Trang Chủ

- Giữ hero hiện tại: đây là visual anchor của brand.
- Tăng contrast subtitle trên ảnh.
- Giảm khoảng trắng quá lớn giữa recent articles và newsletter.
- Wisdom carousel cần pause affordance; dots cần hit area lớn hơn.
- Một primary CTA; secondary CTA nhẹ hơn.

### Bài Viết

- Card mobile quá cao do image lớn + text; dùng 4:3 hoặc image height nhỏ hơn.
- Desktop 3 columns tốt; thêm category/search/filter rõ ở đầu.
- Summary/date/tag cần đậm hơn.
- Tạo crop/palette khác nhau theo category để card dễ phân biệt.

### Khai Trí

- Trang chỉ 2 item nên trông unfinished.
- Thêm featured question, recent answer hoặc “bắt đầu từ đây”.
- Card cần surface/border rõ; search placeholder hiện quá nhạt.
- Dùng icon/category accent vừa đủ; không để toàn trang cùng một beige value.

### 37 Câu Chuyện

- Mobile title wrap `Bất / Tử` không đẹp; giảm font hoặc dùng balanced wrap.
- Desktop 4 columns hơi dày; 3 columns giúp title thở hơn.
- Rainbow tags xung đột brand; dùng tonal gold + icon/label hoặc muted category colors.
- Thêm 1 featured story có ảnh để phá grid đồng đều.

### Thái Dương Quyền

- Nội dung intro rõ nhưng dài; rút thành 3 key benefits.
- 10 movement cards cần silhouette/diagram/step image.
- `Hướng dẫn chi tiết đang cập nhật…` lặp lại làm sản phẩm trông chưa xong; dùng một coming-soon state chung hoặc chỉ show available moves.
- Có thể dùng numbered vertical flow trên mobile, 2-column trên desktop.

### Năng Lượng

- Special immersive page hợp lý; cho phép khác biệt có chủ đích.
- Header light trên navy tạo cắt khúc mạnh; dùng contextual dark header hoặc transparent overlay.
- “Nguồn năng lượng” pills trông như button nhưng có vẻ static; đổi thành legend/chips có icon hoặc làm thật sự interactive.
- Desktop first fold quá trống; đưa artwork/flow teaser lên viewport đầu.
- Tăng contrast “Cuộn để bắt đầu”.

### Giới Thiệu

- Hiện là các card dài nối tiếp: wall-of-text.
- Mở bằng manifesto 3 câu + key principles; sau đó timeline/diagram/accordion.
- Thêm portrait/source context hoặc visual timeline để tăng trust và điểm nghỉ mắt.
- Giảm số paragraph trong một card; mỗi section có summary/callout.

### Liên Hệ

- Form sạch nhưng quá generic và nhiều khoảng trống.
- Thêm intro, phương thức liên hệ, response time, privacy note.
- Dùng visible labels + helper text; group form trong editorial surface.
- CTA full-width mobile tốt; desktop có thể giữ 220–240px.

### Cộng Đồng

- Hero và dark newsletter card có tiềm năng.
- Thêm 3 lợi ích, roadmap/app preview, trạng thái launch rõ.
- Chatbot + bottom nav đang chen vào newsletter card.
- Một CTA duy nhất: đăng ký nhận tin hoặc tham gia waitlist.

### Admin

- Login card sạch nhưng black CTA lệch gold brand.
- Admin nên chuyển sang functional visual mode: ít particles, ít footer marketing, typography sans ưu tiên.
- Sau login cần audit riêng table density, filters, forms, destructive states và mobile sidebar.

## Design direction đề xuất

- **Style:** Sacred Editorial Minimalism.
- **Display:** Cormorant Garamond 600–700.
- **Body/UI:** Be Vietnam Pro 400–600.
- **Core palette:** ink/cream/gold; category colors là tonal, saturation thấp.
- **Page types:** Editorial, Reading, Immersive, Operational Admin.
- **Rule:** Home/Energy tạo cảm xúc; content pages tạo rõ ràng; Admin tạo hiệu suất.

## Unresolved questions

1. Độc giả chính có nhiều người 50+ không?
2. Muốn giữ toàn bộ hình AI hay bổ sung ảnh thật/diagram?
3. Energy page được phép là visual sub-brand riêng hay phải đồng bộ hoàn toàn?
4. Admin authenticated screens cần audit bằng tài khoản test không?

