# Brainstorm — Sacred Editorial UI Pass (9 items) + Goclaw Art Direction

Date: 2026-07-11 · Status: APPROVED · Source: visual-design-system-audit-260711-2106 + ux-ui audit 260710-1958
Scope decision: 1 plan gộp 9 items, item 5 (goclaw) = phase cuối.

## Problem

Audit 10 routes production: style đúng brand nhưng hoàn thiện không đều. 9 vấn đề user chốt:

1. Chatbot FAB che card/nội dung (mobile nặng nhất, đè cả bottom nav + newsletter card)
2. Page hero mỗi trang một kiểu (centered/left/immersive, spacing lệch)
3. Beige-on-beige — card/metadata/placeholder quá nhạt
4. Bottom nav font 0.62rem (~9.9px) — dưới mức đọc được
5. Ảnh AI lặp motif mắt/đầu người/năng lượng — cần art direction per category (goclaw + chatgpt image)
6. Rainbow tags (stories) lệch brand gold monochrome
7. Cormorant bị dùng lan sang body/UI — phải giới hạn display; body = Be Vietnam Pro
8. Header desktop quá nhiều mục, chữ nhỏ
9. About/Practice/Contact wall-of-text

## User decisions (AskUserQuestion)

| Câu hỏi | Chốt |
|---|---|
| Tách item 5 riêng? | **Gộp 1 plan**, item 5 = phase cuối |
| Ảnh cũ? | **Chỉ ảnh sinh mới** theo art direction; ảnh cũ thay dần |
| Item 9 content? | **Chỉ khung trình bày** — không viết lại nội dung |
| Audience? | **50+ đáng kể** → reading 18–20px, AAA text chính, meta ≥12px, hit ≥44px |
| Chatbot behavior? | **A — scroll-aware toàn site** (không per-page code path) |
| Duyệt thiết kế? | **Duyệt** |

## Approaches evaluated

- **Token-first sweep (CHỌN)**: mở rộng semantic tokens ở `base.css` rồi sweep page CSS dùng token. Chậm hơn ~1 phase; sửa gốc, dark mode chỉnh 1 chỗ, không tái phát.
- ~~Patch per-page CSS~~: nhanh nhưng chính là nguyên nhân hiện trạng lệch; loại.
- Chatbot B (A + dời vào toolbar trang article): đọc sạch nhất nhưng thêm code path riêng; loại theo KISS, có thể nâng cấp sau.

## Final design — 6 phases

### P1 Foundation tokens (items 3,4,6,7)
- `apps/web/src/styles/base.css`: thêm `surface-1/2`, `text-primary/secondary` đậm hơn, border token rõ, category tonal palette (họ vàng/đất, low-sat) thay rainbow, radius 8/12/16, shadow none/sm/elevated.
- Type scale: 12 label / 14 meta / 16 UI / 18–20 reading / 24–32–48 headings. Cormorant CHỈ display/H1/H2/quote; Be Vietnam Pro cho body/form/meta (token `--font-display`/`--font-body` đã có — sửa chỗ dùng sai).
- Bottom nav `bottom-nav.css:26` 0.62rem → 0.8rem.
- Sweep: `styles/pages/*.css` (khaitri, stories, practice, about nặng nhất) sang tokens.
- **Phải test dark mode song song** (dark mode vừa fix f06323c — tránh regression).

### P2 PageHero component (item 2)
- Component mới `apps/web/src/components/shared/PageHero.jsx` + css: variant `editorial` (eyebrow + H1 Cormorant + subtitle + rhythm chuẩn) và `immersive` (Energy).
- Thay hero tự chế ở 8 trang; Articles/Contact (left-align) về chuẩn chung.

### P3 Chatbot scroll-aware (item 1)
- `Chatbot.jsx` (150 loc) + `chatbot.css`: cuộn xuống → thu chấm nhỏ mờ; dừng 2–3s hoặc cuộn lên → hiện. Offset collision với bottom nav (hiện đang đè).
- Một hành vi mọi trang, không per-page.

### P4 Header desktop (item 8)
- Primary 5: Trang Chủ, Bài Viết, Khai Trí, Câu Chuyện, Năng Lượng.
- "Thêm" dropdown: Giới Thiệu, Thái Dương Quyền, Cộng Đồng, Liên Hệ. Admin icon → footer. Search nổi hơn.
- Nav config qua `src/config/pages.js` registry sẵn có.

### P5 Anti wall-of-text framework (item 9 — khung only)
- Components dùng chung: `Callout`, `KeyPoints`, `Timeline`, `StepCard` (Practice movements), coming-soon state chung (thay lặp "đang cập nhật…").
- Cắt nội dung HIỆN CÓ vào khung; không viết chữ mới.

### P6 Goclaw art direction skill (item 5)
- Repo goclaw: skill mới `immortality-cover-art` — prompt template per category cắm vào flow chatgpt image hiện có của agent:
  - Energy = gold flow trừu tượng · Wisdom/Khai Trí = ánh sáng/biểu tượng (né mắt/đầu người) · Stories = người/bối cảnh cụ thể · Practice = diagram chuyển động/cơ thể.
- Chỉ ảnh mới. Output: file local nếu Worker/R2 chưa deploy (up tay), tự động hoá upload sau khi Worker live.

## Risks

- P1 sweep contrast → dark mode regression: screenshot before/after light+dark từng trang.
- P2 đụng 8 trang cùng lúc: verify từng route.
- P6 phụ thuộc hosting ảnh (Worker/R2 chưa deploy — xem session 260711): fallback file local.

## Success criteria

- Bottom nav ≥12.8px; meta ≥12px; reading 18–20px; text chính AAA trên cream.
- Mọi page hero render từ PageHero (grep không còn hero markup tự chế).
- Chatbot không đè bottom nav/newsletter; thu nhỏ khi cuộn đọc.
- Stories tags tonal gold/earth — không còn rainbow.
- Header desktop 5 primary + Thêm; admin icon khỏi header.
- Skill goclaw sinh ảnh 4 category ra 4 art direction khác nhau rõ rệt.

## Unresolved

1. Danh sách 5 primary nav — user chưa xác nhận thứ tự cụ thể (đề xuất ở P4, chỉnh được lúc implement).
2. P6: OpenAI API key/flow image hiện tại của goclaw agent nằm đâu — cần xác định lúc làm phase 6.
