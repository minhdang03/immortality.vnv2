# Markdown Schema — Khai Trí Inbox File

CoWork (or anh manually) outputs **one `.md` file per Khai Trí entry** vào `Claw/goclaw/inbox/khaitri/`. Agent đọc file → ghi 1 doc Firestore `khaitri` → move file `_done/`.

## File layout

YAML frontmatter (required) + markdown body (Q/A content).

```markdown
---
# === Required ===
sourceRef: "khaitri-2026-05-03-001"   # idempotency key — globally unique, immutable
order: 38                              # sort order (asc) — coordinate with anh để tránh collision
date: "2026-05-03"                     # YYYY-MM-DD — date entry diễn ra (transcript date), KHÔNG phải ngày publish
tagVi: "Năng Lượng"                    # tag VI (1-3 từ)
tagEn: "Energy"                        # tag EN (1-3 từ; empty string OK nếu chưa dịch)
titleVi: "Cột sóng thu lôi năng lượng — kiểm chứng và mở rộng"
questionVi: "Em tạo cột sóng thu lôi… có thật không thầy?"

# === Optional but strongly recommended ===
titleEn: ""                            # empty = chưa dịch
questionEn: ""
summaryVi: "Buông lỏng não, lấy cảm giác cơ thể làm thước đo. Khi mở camera Tiến Tùng đảo lửa, ý nghĩ tự thực hiện — dùng để chữa bệnh người khác."
summaryEn: ""

# === Optional — defaults if omitted ===
status: "draft"                        # draft | published — default 'draft'; Agent KHÔNG được set 'published' trực tiếp
source: "goclaw-publisher-v1"          # auto-set by Agent; override để tag batch riêng nếu cần
---

Hỏi: Em tạo cột sóng thu lôi năng lượng để hút khí thải độc ra ngoài Trái Đất. Xin thầy kiểm chứng có thật không?

Đáp: Buông lỏng não. Khi nghĩ ra điều gì, lấy cảm giác cơ thể làm thước đo — khoẻ nhẹ là đúng, nặng đầu thì dừng. Đừng dùng não phán đoán đúng/sai, dùng cảm.

Hỏi: Em thấy cơ thể vẫn khoẻ, biết là ngoài khả năng nhưng vẫn kết nối được.

Đáp: Khi đã mở "con mắt thứ ba — camera Tiến Tùng đảo lửa" thì ý nghĩ tự thực hiện. Dùng năng lượng này để chữa bệnh cho người khác — hút khí độc ra. Không cần cố, để tự nhiên.
```

## Field rules

### `sourceRef` (REQUIRED)

- Format: `khaitri-YYYY-MM-DD-NNN` (suggest) or any unique string
- **Must be globally unique** in `khaitri` collection
- **Immutable** — Agent dùng làm idempotency key; re-run same file = no duplicate
- Suggest pattern: `khaitri-{date}-{counter}` hoặc `khaitri-{transcript-id}`

### `order` (REQUIRED)

- Integer ≥ 1
- Determines display order trong KhaiTriPage (asc)
- Combined với `vi.title` → URL slug (`{order}-{slug}` — vd `38-cot-song-thu-loi-nang-luong`)
- **Collision risk:** 2 entries cùng `order` → cùng URL prefix. Agent SHOULD query max(order) trước khi insert nếu file không cung cấp; nếu file cung cấp → trust file.

### `date` (REQUIRED)

- ISO date `YYYY-MM-DD`
- Hiển thị trong admin list, không hiển thị public (chưa thấy trong KhaiTriDetail)

### `tagVi` / `tagEn`

- Short label (1-3 từ tiếng Việt / English)
- Hiển thị badge trong admin list + detail header
- `tagEn` empty string OK — UI fallback `tag.vi`

### `titleVi` (REQUIRED) / `titleEn`

- `titleVi` bắt buộc — dùng làm slug URL
- `titleEn` empty OK; UI fallback `vi.title`
- Length: ≤ 100 char khuyến nghị (slug truncate ở 80 trong code)

### `questionVi` (REQUIRED) / `questionEn`

- Câu hỏi nguyên văn của người hỏi (paraphrase OK nếu transcript dài quá)
- Hiển thị riêng trong KhaiTriDetail, không lẫn vào body
- 1-3 câu thường ổn

### `summaryVi` / `summaryEn`

- Tóm tắt ngắn câu trả lời — hiển thị preview list + detail header
- 1-2 câu, ≤ 200 char
- Optional nhưng STRONGLY recommended (UX list view tốt hơn)

### `status`

- Default `draft` nếu omit
- Agent **MUST NOT** set `published` directly — chỉ admin (anh) publish trong UI
- Possible values: `draft`, `published` (UI hiện chưa filter theo field này — nhưng spec để tương lai)

### `source`

- Default `goclaw-publisher-v1` nếu omit
- Filter admin: "show all entries by Agent" → query `where('source', '==', 'goclaw-publisher-v1')`

## Body convention

Markdown body sau frontmatter = field `vi.body` (hoặc `en.body` nếu file là EN).

**Format Q/A:**
```
Hỏi: <câu hỏi 1>

Đáp: <câu trả lời 1>

Hỏi: <câu hỏi 2>

Đáp: <câu trả lời 2>
```

- Bắt đầu mỗi turn bằng `Hỏi:` hoặc `Đáp:` (VI) / `Question:` hoặc `Answer:` (EN)
- Cách nhau bằng **2 newlines** (paragraph break)
- Admin có nút "Tách Hỏi/Đáp" — split body có nhiều cặp Q/A thành nhiều entries riêng. **Agent KHÔNG cần làm split** — đẩy responsibility cho anh quyết tách hay không trong UI.

## File naming

`<sourceRef>.md` — vd `khaitri-2026-05-03-001.md`. Tên file ≠ data; chỉ frontmatter + body matter. Filename giúp anh sort inbox.

## Bilingual file convention

**Option A (recommended):** 1 file chứa cả VI + EN (đầy đủ field `*Vi` + `*En`)

**Option B:** 1 file chỉ VI, file thứ 2 update cùng `sourceRef` thêm field EN later. Agent phải support **update mode** — nếu doc với `sourceRef` đã tồn tại, merge field EN vào doc cũ thay vì tạo doc mới.

## Validation checklist (Agent must verify trước khi write)

- [ ] `sourceRef` non-empty và unique (query Firestore)
- [ ] `order` integer ≥ 1
- [ ] `date` match `^\d{4}-\d{2}-\d{2}$`
- [ ] `titleVi` non-empty
- [ ] `questionVi` non-empty
- [ ] Body có ít nhất 1 cặp `Hỏi:`/`Đáp:` (VI) hoặc `Question:`/`Answer:` (EN)
- [ ] `status` ∈ `{undefined, 'draft'}` — reject nếu Agent thấy `published`

Fail validation → log error, **không ghi Firestore**, move file vào `_failed/<sourceRef>.md` + viết `_failed/<sourceRef>.error.txt`.
