# Brainstorm: NODIE docs parity — solo dual-platform

**Date:** 2026-07-15  
**Status:** DECIDED  
**Decision owner:** agent (user: "tuỳ bạn quyết")

## Problem

Solo + multi-session AI. Muốn iOS/Android song song, session sau "biết" bên kia. Hỏi: có cần setup docs parity không?

## Context

- `apps/nodie-ios/` exists (UI 6 màn)
- `apps/nodie-android/` chưa
- `docs/nodie/` chưa
- User: scaffold Android tuần này
- Priority: ship vertical iOS (Q&A/chat wire) trước

## Approaches evaluated

| ID | Approach | Verdict |
|----|----------|---------|
| A | Full 3 file (parity + log + contract) + session rules now | Reject — premature, ceremony, dễ thối docs |
| B | Zero parity docs; git + plan only | Reject — Android scaffold tuần này → session mù |
| **C** | **1 file `docs/nodie/parity.md` lúc scaffold Android** | **CHỌN** — KISS, đủ handoff |

## Decision

**Approach C.**

- **Không** setup full parity system ngay như project riêng.
- **Có** tạo **một** file `docs/nodie/parity.md` **cùng commit/scaffold** Android.
- **Không** block iOS wire vì docs.
- Android tuần này = shell + tokens + mock; **không** wire API đến khi iOS chứng minh 1 vertical.
- Mở rộng 3 file chỉ khi parity.md >~150 dòng hoặc port feature thật lần đầu đau.

### File gộp (không tách sớm)

1. Bảng Server | iOS | Android (~8–12 row core)
2. Section `Pending other OS` (thay log riêng)
3. Section `Contract` bullets ngắn (thay api-contract riêng)

### YAGNI — không làm

- Feature flag infra
- CI parity gate
- CROSS-PLATFORM-LOG.md / api-contract.md riêng day-1
- Ép Android wire song song iOS P0

## Rationale

Parity docs = bộ nhớ giữa session, **không** = tốc độ ship iOS.  
Full process Meta-style cho 1 cột Android trống = YAGNI.  
Zero docs + Android sắp có = mất port list.  
1 file đúng lúc 2 folder app xuất hiện = tối ưu solo.

## Success metrics

- [ ] Scaffold Android kèm `docs/nodie/parity.md`
- [ ] Mỗi session NODIE: đọc parity start, tick end (1–5 dòng)
- [ ] iOS Q&A/chat wire không bị delay vì "docs system"
- [ ] Android API wire chỉ sau iOS vertical có contract sống

## Risks

| Risk | Mitigation |
|------|------------|
| Quên update | Prompt session 2 dòng start/end |
| Docs thối | Cap ~100 dòng; stale row xóa/archive |
| Mải Android UI | Giữ wire Android ⬜ đến iOS P0 ✅ |

## Next steps

1. User/session: scaffold `apps/nodie-android` + tạo `parity.md` (15–30 min docs)
2. Parallel track: iOS wire Q&A/chat (P0) — không chờ parity “đẹp”
3. Không cần `/ck:plan` riêng cho docs-only; gộp phase 0 trong plan scaffold Android nếu plan scaffold

## Unresolved

- None on parity decision.
- Scaffold Android timing vẫn do user kick.
