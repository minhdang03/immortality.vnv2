# Phase 05 — Build + QATabGateUITests + code review

**Model:** **Fable** — bước quyết định go/no-go: đọc kết quả UITest (biết phân biệt flake vs regress thật), review chốt vùng RLS/gate. Không cơ khí.

## Context Links
- Phase 03 (gate) + Phase 04 (rate-limit UI) — code cần build/test.
- `apps/nodie-ios` — `QATabGateUITests` (chốt gate không cờ).
- CLAUDE.md → iOS build/test commands; `scripts/run-uitest-gate.sh`.
- Bài học flake: `[project_nodie_uitest_gate_discipline]`, `[project_nodie_ios_test_ops_traps]`.

## Overview
- **Priority:** P2. **Status:** pending (blocked by 03 + 04).
- Build xanh, `QATabGateUITests` pass, không regress send-path chat/Q&A. Review vùng gate + trigger.

## Key Insights
- `QATabGateUITests` chốt hành vi **không cờ**: user thường không thấy Q&A. Với default `qaPublic=false`, phải vẫn xanh. Nếu đỏ → gate bị đổi semantics sai.
- Rate-limit KHÔNG có UITest chuyên (khó dựng spam ổn định trong sim + prod thật) → dựa Phase 02 (HTTP thật) làm bằng chứng, Phase 05 chỉ smoke câu lỗi thân thiện.
- Máy phải nguội (load < 8), không phiên build iOS khác, seed trước mỗi run (kỷ luật gate).

## Requirements
- `xcodegen generate` (đã có file mới FeatureFlagStore) rồi `xcodebuild ... build`.
- Chạy `QATabGateUITests` (ít nhất, lý tưởng full gate qua `run-uitest-gate.sh 3`).
- `code-reviewer` review diff (gate + migration + error kind).

## Implementation Steps
1. `cd apps/nodie-ios && xcodegen generate`.
2. `xcodebuild -project NODIE.xcodeproj -scheme NODIE -destination 'platform=iOS Simulator,name=iPhone 17' build`.
3. Chạy `QATabGateUITests` (bằng account role='user', không cờ) → pass.
4. Smoke: bật `--uitest-show-qa` xác nhận Q&A hiện; đổi `qa_public=true` trên DB test → launch lại thấy Q&A với user thường; revert.
5. Smoke rate-limit UI: spam gửi trên sim bằng account thường → thấy câu thân thiện (nếu ngưỡng đủ thấp để test tay; nếu không, tin cậy Phase 02).
6. `code-reviewer` agent review: (a) trigger có fail-open không, (b) gate default an toàn, (c) xcstrings không stale oan, (d) migration idempotent + ghi sổ.
7. Docs: cập nhật `docs/project-changelog.md` + `docs/development-roadmap.md` nếu Đăng muốn (rate-limit + feature-flag là thay đổi hạ tầng đáng ghi).

## Todo
- [x] xcodegen generate + build xanh
- [x] QATabGateUITests pass (không cờ)
- [x] Smoke flag on/off qua DB
- [x] Smoke rate-limit câu thân thiện (hoặc dựa Phase 02)
- [x] code-reviewer review + xử lý concern
- [x] Changelog/roadmap (nếu áp dụng)

## Success Criteria
- Build xanh; `QATabGateUITests` pass; send-path chat/Q&A không regress.
- Review không còn concern P0/P1 chưa xử lý.
- Toàn bộ acceptance criteria tổng ở `plan.md` thoả.

## Risk Assessment
| Rủi ro | Khả năng | Tác động | Giảm thiểu |
|---|---|---|---|
| Flake UITest bị hiểu nhầm là regress | Trung bình | Trung bình | Máy nguội, seed trước run, chạy 3 lần; đối chiếu 4 mẫu flake đã biết |
| Zombie simulator đẩy load → "Executed 0 tests" | Trung bình | Trung bình | pkill CoreSimulator/Volumes; chờ load<8 |
| Gate đổi làm regress restore tab | Thấp | Cao | TabRestoration test cùng cặp (role,qaPublic); QATabGateUITests chốt |

## Security Considerations
- Xác nhận bật flag KHÔNG cấp quyền mới (chỉ hiển thị) — review kỹ điểm này.

## Next Steps
- Xong → commit theo conventional (`feat(nodie): rate-limit server-side + feature flags`), PR về `main`.
- Cân nhắc flag thứ 2 (vd mở lại Bảng tin/Hành trình) khi cần — hạ tầng đã sẵn.

## Unresolved
- Q6: Có seed ngưỡng rate-limit riêng cho môi trường test (thấp để test tay dễ) không? Prod nên giữ ngưỡng generous. Nếu chưa tách staging (xem roadmap scale), test tay trên prod phải cẩn thận dữ liệu.
