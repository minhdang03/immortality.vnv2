# Supabase Control Plane — Cutover Checklist

Status: ACTIVE · Quyết định: Đăng chốt 2026-07-10 ("chốt luôn supabase")
Context: audit `plans/reports/ux-ui-reading-analytics-agent-audit-260710-1958-battudao-production-report.md` + memory `project_supabase_db_auth_migration`.
Nguyên tắc: dual-backend (`VITE_DATA_BACKEND`) là trạng thái TẠM — mỗi phase xong phải thu hẹp bề mặt Firestore tương ứng. GA4 + FCM giữ (không phải database). R2 giữ (storage).

## Phase 0 — Security hotfix (DONE 260710)
- [x] `0012_reading_stats_admin_guard.sql` — 3 RPC reading-stats check `is_admin()` (vá P0 #5)
- [x] AdminPanel fail-closed: role lạ/`user` không thấy tab nào (trước: thấy tất cả)

## Phase 1 — Read path (per-collection, flag supabase)
- [x] settings + toàn bộ content hooks dual — verify parity local OK (260710)
- [ ] articles / stories / khaitri / topics / teachings / practices: hook dual-read như settings
- [x] Parity: 18 article / 16 khaitri / 37 story + settings + translations khớp; 14 article draft → published (Đăng xác nhận); khaitri draft giữ ẩn (parity prod)
- [ ] ogRenderer (functions/index.js) đọc Supabase thay Firestore REST

## Phase 2 — Write path + admin + editorial workflow
- [ ] Content status enum `draft → in_review → published` + RLS: publish tách khỏi write
  (agent role: KHÔNG được set published — server enforce, không phải prompt)
- [ ] Admin tabs có status control + nút publish riêng (chỉ admin)
- [ ] Audit log về MỘT bảng Supabase (bỏ Firestore log)
- [ ] Agent (goclaw) chuyển API key `btd_` + Worker dùng service_role (xem memory: cần sửa repo Claw/goclaw)

## Phase 3 — Auth cutover
- [ ] Supabase Auth thành đường đăng nhập duy nhất (web + mobile cùng đợt — ràng buộc Đăng)
- [ ] Migrate user records/roles → profiles; test role mapping ROLE_TABS
- [ ] Firestore rules → read-only toàn bộ (chặn write từ client cũ)

## Phase 4 — Analytics + tắt Firestore
- [ ] Privacy/consent trước khi bật micro-reading analytics (audit thứ tự #5)
- [ ] Bật reading_events + dashboard completion/drop-off (RPC đã guard)
- [ ] Báo cáo: unique sessions, active read time, completion, drop-off/section, search→read, CSV
- [ ] Firestore OFF (billing về 0); xoá code dual + flag

## Ràng buộc phải nhớ
- HỎI Đăng trước khi retire `workers/notion` (memory: notion sync là workflow content của anh ấy)
- Không commit secrets; service_role chỉ nằm trong Worker secret
- Mobile + web cắt cùng đợt ở Phase 3, không lệch sóng
