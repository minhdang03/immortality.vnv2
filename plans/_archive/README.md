# Plan đã archive — đọc trước khi hồi sinh cái nào

Plan trong thư mục này **không còn là việc phải làm**. Phần lớn mô tả kiến trúc đã bị gỡ
hoặc quyết định đã bị đảo — thi công theo chúng là thi công cho một dự án không còn tồn tại.

Lịch sử git giữ đủ; cần đối chiếu thì đọc, đừng thi công.

| Plan | Vì sao archive |
|---|---|
| `260502-2304-battudao-mobile-app` | (archive từ trước) |
| `260508-2106-editorial-sacred-redesign` | Redesign web 05/2026 — phần lớn đã ship qua các commit sau đó. Giá trị lịch sử. |
| `260509-0949-home-mockup-alignment` | Con của `260508`. Chết theo plan cha. |
| `260510-2129-bat-tu-dao-mobile-hybrid` | Mô tả stack **Capacitor đã gỡ hẳn 17/07/2026**. Quyết định hiện tại: NODIE native Swift/Kotlin. |
| `260515-2144-febe-redesign` | **Đã bị đảo** bởi quyết định Supabase 11/06/2026 (DB+Auth). Đừng thi công. |
| `260611-1255-supabase-db-auth-migration` | Bị thay phần lớn bởi `260710-2018-supabase-control-plane-cutover`. Cutover là nguồn sự thật. |

**Ba stack mobile đã gỡ hẳn (17/07/2026), đừng hồi sinh mà chưa hỏi Đăng:** Capacitor ·
Expo SDK 54 RN (`apps/mobile`) · `packages/` (chỉ `apps/mobile` xài). Chi tiết trong `CLAUDE.md` gốc.

Archive ngày 17/07/2026 theo report
`apps/nodie-ios/plans/reports/plan-status-consolidation-260717-2038-all-plans-ios-production-roadmap-report.md`.
