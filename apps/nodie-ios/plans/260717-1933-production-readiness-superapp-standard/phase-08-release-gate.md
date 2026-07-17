# Phase 08 — Release gate: device matrix + DoD checklist + TestFlight

**Audit:** mục "Test ma trận" + "Definition of done". Chạy CUỐI, sau khi 01–07 merge.

## Steps

1. **Suite 3× xanh** trên iPhone 17 Simulator (luật phase 04) — bao gồm AccessibilityUITests.
2. **Ma trận tay** (checklist, ghi kết quả vào report `reports/`):
   - iPhone SE/13 mini class (màn nhỏ) + iPhone 17 Pro Max (màn lớn) simulator
   - 1 thiết bị thật (iPhone của Đăng) — camera + mic + push CHỈ test được trên máy thật
   - Largest accessibility Dynamic Type · VoiceOver walk 3 tab · Reduce Motion
   - Offline/slow network (Network Link Conditioner) · permission denied (camera/mic/photos/notifications)
   - 2 account thường: gửi text/ảnh/voice/file 2 chiều, reaction, reply, follow/unfollow, push tap điều hướng
3. **DoD checklist từ audit — tick từng dòng:**
   - [ ] Không control no-op/disabled vô lý (grep + walk tay)
   - [ ] Chat media/voice end-to-end 2 account thường + Realtime
   - [ ] Test release-critical session/RLS thật, 3× xanh
   - [ ] Touch target ≥44pt, contrast AA (số đo ghi lại)
   - [ ] VoiceOver + largest Dynamic Type qua màn chính
   - [ ] Loading/empty/error/offline/permission-denied đủ ở màn chính
   - [ ] Test iPhone nhỏ + lớn + thiết bị thật
4. **Scope statement:** ghi vào release notes TestFlight + `docs/`: v1 = Light Mode, portrait, iPhone-only (chốt câu hỏi #2 plan.md).
5. **Xcstrings hygiene:** kiểm 15 key stale (bẫy build đánh oan — memory: splice text, cấm json round-trip); mọi key mới đủ 9 ngôn ngữ.
6. **Archive → TestFlight** theo pipeline memory `project_nodie_testflight_pipeline` (bump build number). Smoke test bản TestFlight trên máy thật trước khi mời tester.

## Exit criteria

Toàn bộ checklist mục 3 tick + báo cáo ma trận lưu `plans/260717-1933-production-readiness-superapp-standard/reports/` + build TestFlight cài được, login được, gửi được ảnh/voice trên máy thật.
