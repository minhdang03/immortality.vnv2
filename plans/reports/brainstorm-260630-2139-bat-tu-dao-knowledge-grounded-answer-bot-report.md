---
title: "Brainstorm — Bất Tử Đạo Knowledge-Grounded Answer Bot (Supabase)"
date: 2026-06-30 21:39
status: design-approved (pending plan)
owner: Đăng
branch: claude/immortality-mobile-hybrid
depends_on: plans/260611-1255-supabase-db-auth-migration (phase-04/05 Notion sync repoint)
scope: design + advice only — NO code this session
tags: [chatbot, knowledge-grounding, supabase, pgvector, notion, ai-tra-loi]
---

# Brainstorm: Bot trả lời "theo nguyên lý Bất Tử Đạo"

## 1. Vấn đề (problem-first)

User mang giải pháp: "bổ sung kiến thức Bất Tử Đạo cho chatbot iOS".
Đào ra vấn đề gốc: **sau này muốn 1 LLM đọc qua "tư duy" Bất Tử Đạo (nguồn Notion) rồi TRẢ LỜI theo nguyên lý** — kiểu agent grounded-by-knowledge (OpenClaw/goclaw nạp skill vào context để suy luận). Không phải RAG truy hồi mảnh.

## 2. Phát hiện scout (then chốt)

- Chatbot iOS hiện tại = **"AI hỏi ngược"** (`apps/mobile/.../tu-khai-tri-ai-hoi-nguoc-screen.tsx`, Pro 99K). Thiết kế **CỐ Ý không trả lời** — chỉ hỏi lại 1-3 câu.
- System prompt hardcode (`workers/notion/src/ai-hokinguoc-system-prompt.ts`) + **output classifier** chặn nếu bot lỡ trả lời. Claude `claude-sonnet-4-6`, SSE qua `workers/notion/src/ai-ask-sse-handler.ts`.
- Kiến thức bake vào bot = **~5 dòng từ vựng**. KHÔNG RAG, KHÔNG embeddings, KHÔNG đọc content.
- Notion sync ghi vào Firestore `btd_knowledge` nhưng **không ai đọc** (mồ côi).
- Vector infra (SP1 Vectorize, Supabase pgvector) đều **pending** + đều scope chatbot RA NGOÀI.
- Plan Supabase `260611` (lock 11/06) đã yêu cầu repoint `workers/notion/` Firestore→Supabase, có sẵn pgvector.

➡️ "Bổ sung kiến thức" cho bot HIỆN TẠI là vô nghĩa (nó không trả lời). Phải dựng **bot/mode TRẢ LỜI mới**, tách khỏi bot cũ.

## 3. Các hướng đã cân nhắc

| Hướng | Mô tả | Đánh giá |
|---|---|---|
| A. Sửa bot cũ cho trả lời | Gỡ classifier, viết lại prompt | ❌ Phá sản phẩm Pro hiện tại |
| B. RAG đầy đủ ngay | Vector search per-query | ❌ Infra pending, over-engineer cho corpus triết lý nhỏ |
| **C. Knowledge-pack inject (CHỌN)** | Curate "core nguyên lý" → nhét `<knowledge>` vào prompt bot-trả-lời mới | ✅ KISS, hợp "tự nạp", cửa RAG để mở |

## 4. Giải pháp chốt

**Bot-trả-lời mới = Claude + khối "Nguyên Lý Bất Tử Đạo" inject vào system prompt.**

- **Storage: Supabase** (quyết định của Đăng — "làm supabase"). Bảng `knowledge` + cột pgvector để dành. KHÔNG dùng Firestore (đang bị thay).
- **Nguồn**: Notion Bất Tử Đạo. Anh nạp/sửa trên Notion → sync (đã repoint Supabase per plan 260611) → bảng `knowledge`.
- **Chọn lọc**: tag Notion page = `core-nguyên-lý` để bot chỉ nạp phần cốt lõi (tránh tràn token).
- **Tách bot**: thêm `mode` (hỏi-ngược | trả-lời), 2 system prompt riêng, dùng chung handler/SSE. Bot cũ + classifier giữ nguyên.
- **Giờ**: inject thẳng prompt. **Sau**: bật pgvector RAG khi corpus vượt ngân sách prompt.

### Luồng
```
Notion (tag core) → [workers/notion sync → Supabase] → knowledge table
   → bot-trả-lời đọc doc core → <knowledge> → system prompt mới → Claude trả lời
```

## 5. Phụ thuộc & thứ tự

- **Ride trên plan `260611-1255-supabase-db-auth-migration`**: cần (a) `knowledge` table (phase-01), (b) Notion sync repoint Supabase (phase-04/05) TRƯỚC khi build bot-trả-lời.
- Nếu build trước Supabase → phải tạm đọc Firestore `btd_knowledge` rồi repoint sau (thêm việc thừa). → **Khuyến nghị: chờ/khớp Supabase**.

## 6. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Corpus phình > token budget | Tag core giới hạn; chuyển pgvector RAG khi cần |
| Bot trả lời sai nguyên lý | Anh duyệt nội dung chưng cất; prompt buộc "chỉ theo <knowledge>" |
| Lẫn với bot hỏi-ngược | Tách `mode` + prompt + entry rõ ràng |
| Supabase migration trượt lịch | Bot-trả-lời block theo; không build trên Firestore sắp bỏ |

## 7. Tiêu chí thành công

- [ ] Bot-trả-lời đọc "core nguyên lý" từ Supabase, trả lời bám đúng giáo lý.
- [ ] Bot "hỏi ngược" cũ + Pro paywall không đổi hành vi.
- [ ] Anh sửa Notion → nội dung bot cập nhật (không cần đổi code).
- [ ] Đường nâng cấp pgvector RAG ghi sẵn, chưa cần kích hoạt.

## 8. Bước tiếp theo

1. Tạo plan triển khai bot-trả-lời như **extension của plan 260611** (sau phase Supabase + sync repoint).
2. Anh chuẩn bị bản chưng cất "core nguyên lý" trên Notion + tag.

## Câu hỏi chưa chốt

1. Bot-trả-lời cũng **Pro-gate 99K** như bot cũ, hay free / gói riêng?
2. Có hiển thị **song song** 2 mode trong cùng màn hình, hay 2 entry tách biệt?
3. Build bot-trả-lời **sau khi** Supabase migration xong, hay làm interim đọc Firestore rồi repoint?
