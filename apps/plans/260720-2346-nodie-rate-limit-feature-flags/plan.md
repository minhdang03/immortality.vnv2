---
title: "NODIE — Rate limiting server-side + Feature flags boolean"
description: "Postgres trigger chống flood trên bảng ghi từ user + bảng app_config cho feature flag (flag đầu: mở tab Hỏi đáp)."
status: done
priority: P2
effort: 8-11h
branch: main
tags: [nodie, supabase, rls, rate-limit, feature-flags, ios]
created: 2026-07-20
---

# NODIE — Rate limiting + Feature flags

Hai hạng mục hạ tầng backend, chung một plan vì dùng chung **một bảng `app_config`**
(ngưỡng rate-limit + giá trị flag ở cùng chỗ — KISS). iOS gọi THẲNG PostgREST, không API
trung gian → mọi chốt chặn nằm ở Postgres (trigger BEFORE INSERT + RLS), không ở client.

## Quyết định đã chốt (KHÔNG bàn lại)
- Rate limit = **Postgres BEFORE INSERT trigger** đếm bản ghi của `auth.uid()` trong cửa sổ
  thời gian, KHÔNG edge-function proxy. Admin/mod miễn trừ qua `is_admin()`.
- Feature flag = **boolean đơn giản**, KHÔNG % rollout.
- Flag đầu tiên: `qa_public` — mở tab Hỏi đáp. Semantics mới: `qaVisible = qa_public==true OR role∈{admin,mod} OR --uitest-show-qa`.

## Ngữ cảnh chốt hạ (đã verify từ nguồn)
- Bảng đích rate-limit + cột chủ sở hữu (đọc 0017/0018/0027/0028/0043):
  `messages.user_id`, `questions.author_id`, `answers.author_id`, `answer_replies.author_id`,
  `message_reactions.user_id`(=profiles.id=auth.uid), `answer_reactions.user_id`,
  `reports.reporter_id`, `follows.follower_id`(=profiles.id), `channels.created_by`.
  TẤT CẢ có `created_at timestamptz`.
- `is_admin()` = SECURITY DEFINER stable (0005). Slow-mode 2s/tin đã có (0017, AFTER INSERT,
  errcode check_violation, chuỗi `slow_mode`) — rate-limit là lớp KHÁC (cửa sổ 60s), sống song song.
- Migration áp TAY bằng psql, có sổ tự chế `_applied_migrations` (0035) — mỗi file tự ghi sổ ở cuối.
  Số tiếp theo: **0045** (0043 group-management + 0044 guard_member_role vừa thêm 20/07, chưa commit — verify lại `ls` trước khi đặt tên).
- iOS: lỗi đã phân loại qua `NodieErrorKind` (DesignSystem/NodieErrorKind.swift) — khớp theo CHUỖI.
  Đã có case `.slowMode`. Thêm case `.rateLimited` (khớp `rate_limit`).
- Gate Q&A: hàm thuần `NodieTab.qaUnlocked(role:)` / `visibleTabs(role:)` (Shell/NodieTabBar.swift),
  gọi ở RootTabView, TabRestoration, ProfileView. Store app boot ở RootTabView (`.task(id:auth.phase)`).

## Phases
| # | Phase | Model | Status |
|---|-------|-------|--------|
| 01 | Migration 0045 app_config + 0046 rate-limit triggers (SQL) | **Fable** | ✅ done 21/07 |
| 02 | Verify prod bằng psql + HTTP, account role='user' | **Fable** | ✅ done 21/07 (xem reports/) |
| 03 | Swift FeatureFlagStore + đổi gate Q&A đọc flag | **Opus (fast)** (review Fable) | ✅ done 21/07 |
| 04 | Swift bắt lỗi rate-limit + chuỗi xcstrings | **Opus (fast)** | ✅ done 21/07 |
| 05 | Build + QATabGateUITests + code review | **Fable** | ✅ done 21/07 (review DONE_WITH_CONCERNS → 2 P1 đã vá: 0050 + @MainActor) |

## Dependency graph
```
01 (SQL migration) ──► 02 (verify prod) ──► 03 (Swift flag+gate) ──► 05 (build+test+review)
                                        └──► 04 (Swift rate-limit UI) ──┘
```
02 là CỔNG chặn: không đụng Swift trước khi trigger/flag đã verify bằng HTTP thật trên account thường.
03 và 04 độc lập file (03 = Shell/Features/Profile flag; 04 = DesignSystem + store send-path) → chạy song song sau 02.

## Acceptance criteria (tổng)
1. User role='user' spam insert qua PostgREST bị chặn sau ngưỡng; admin KHÔNG bị. Verify HTTP thật.
2. Đổi giá trị flag trong DB → app thấy sau lần launch kế, không cần release.
3. Q&A gate không đổi với dev/admin; user thường thấy Q&A ⟺ flag `qa_public` bật.
4. Build iOS xanh + `QATabGateUITests` pass; không regress đường gửi tin/Q&A.
5. Migration idempotent, có ghi sổ `_applied_migrations`, có script rollback (trong từng phase).

## Rủi ro xuyên suốt
- **Test bằng admin = không test gì** (is_admin ngắn mạch RLS + được miễn rate-limit). Mọi verify dùng role='user'.
- **Build Swift xanh không chứng minh PostgREST.** Đổi trigger/flag phải test bằng HTTP thật (Phase 02).
- **Hot-path cost:** trigger đọc app_config mỗi insert → cần index + bảng config nhỏ; xem Phase 01 mitigations.

## Files (tổng quan sở hữu — không chồng lấn giữa 03 và 04)
- Phase 01/02: `supabase/migrations/0045_*.sql`, `0046_*.sql` (mới) + query verify (không sửa code).
- Phase 03: `Shell/NodieTabBar.swift`, `Shell/RootTabView.swift`, `Shell/TabRestoration.swift`,
  `Features/Profile/ProfileView.swift`, `Features/FeatureFlags/FeatureFlagStore.swift` (mới).
- Phase 04: `DesignSystem/NodieErrorKind.swift`, `Localizable.xcstrings` (splice text, CẤM json round-trip).
- Phase 05: không sửa code (chạy build/test/review); vá nhỏ nếu test đỏ.
