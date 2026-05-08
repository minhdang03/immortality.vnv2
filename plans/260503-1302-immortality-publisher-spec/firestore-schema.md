# Firestore Schema — `khaitri` Collection

Reference truth từ code: `src/components/admin/KhaiTriTab.jsx`, `src/components/khaitri/KhaiTriDetail.jsx`, `src/hooks/useCRUD.js`, `src/utils/slug.js`.

## Doc shape (canonical)

```ts
type KhaiTriDoc = {
  // === Sort & meta ===
  order: number              // sort key (asc); used in URL slug
  date: string               // 'YYYY-MM-DD'

  // === Tag (per-language) ===
  tag: {
    vi: string               // VI tag (required, may be empty string)
    en: string               // EN tag (empty string if no translation)
  }

  // === Vietnamese content (REQUIRED — primary lang) ===
  vi: {
    title: string            // required non-empty — drives slug
    question: string         // câu hỏi nguyên văn / paraphrased
    summary: string          // ngắn, 1-2 câu, hiển thị list
    body: string             // Q&A format: "Hỏi: ...\n\nĐáp: ..." (2× newline = paragraph)
  }

  // === English content (OPTIONAL — empty strings if not translated) ===
  en: {
    title: string            // empty OK
    question: string         // empty OK
    summary: string          // empty OK
    body: string             // empty OK
  }

  // === Agent-only fields (NOT in admin UI form, but harmless to add) ===
  sourceRef?: string         // idempotency key — Agent set; NOT used by UI
  source?: string            // 'goclaw-publisher-v1' — provenance tag
  status?: 'draft' | 'published'  // Agent set 'draft'; admin promotes manually

  // === Auto fields ===
  createdAt: Timestamp       // server timestamp — set by useCRUD.add
  // updatedAt? — NOT auto in current useCRUD (chỉ add gắn createdAt; update không gắn updatedAt)
}
```

## Field-by-field rules

### `order: number`

- Required, integer ≥ 1
- Used by `useCRUD` query `orderBy('order', 'asc')` — controls list display order
- Used by `khaitriSlug(item)` → `${order padStart 2}-${toSlug(vi.title)}`
- **Collision warning:** 2 docs cùng `order` → display order ambiguous + URL collision possible. Agent SHOULD query `max(order)` trước insert nếu file không cung cấp; otherwise trust file value.

### `date: string`

- Format `YYYY-MM-DD`
- Stored as plain string (not Timestamp) — match admin form `<input type="date">`
- Hiện chỉ admin thấy; public detail không hiển thị

### `tag: { vi, en }`

- Always object với cả 2 key, value là string (empty OK)
- UI fallback: detail dùng `tag.vi`; list cũng dùng `tag.vi`
- Đặt theo theme: vd "Sức Khỏe", "Năng Lượng", "Tu Tập", "Câu Chuyện"

### `vi: { title, question, summary, body }`

- Object always present — required
- All 4 fields are strings (empty OK trừ `title`)
- `vi.title` là REQUIRED non-empty (drives slug; empty → slug fallback về `item.id`)
- `vi.body` text/markdown — UI render qua `renderText(body)` (kiểm tra `src/components/shared/ReadingHelpers` nếu cần biết transform cụ thể; an toàn nhất: plain text với double-newline paragraphs)

### `en: { title, question, summary, body }`

- Object always present — admin form luôn ghi cả 4 key, default `''`
- Empty string OK — UI fallback sang `vi.*`
- Don't omit object — `KhaiTriDetail` access `item.en?.title` an toàn nhưng admin form load `a.en?.title || ''`; tốt nhất giữ shape consistent

### `sourceRef: string` (Agent-added, optional)

- Idempotency key cho Agent
- Format suggest: `khaitri-YYYY-MM-DD-NNN`
- KHÔNG được expose trong public UI; chỉ Agent + admin query
- Index: chưa có composite index trên field này — single-field query OK (Firestore tự index single fields by default)

### `source: string` (Agent-added, optional)

- Provenance tag — vd `goclaw-publisher-v1`, `cowork-manual`, `legacy-seed`
- Filter trong admin: `where('source', '==', 'goclaw-publisher-v1')` để xem entries Agent ghi

### `status: 'draft' | 'published'` (Agent-added, optional)

- ✅ **Fix A applied 2026-05-03** trong `src/App.jsx:195` — public users (`user == null`) thấy `khaitri.filter(k => k.status !== 'draft')`; admin (`user != null`) thấy tất cả gồm drafts.
- Caveat: filter là client-side post-fetch — drafts vẫn được fetch về (Firestore rules cho public read tất cả doc `khaitri`). Acceptable cho v1; siết khi nào `firestore.rules` siết bằng custom claim.
- OG renderer (`functions/index.js`) **không có per-`khaitri`-item OG route** — crawler hit `/khaitri/{slug}` của draft chỉ nhận generic meta của trang list (line 168 fallback), không leak title/body của draft. KHÔNG cần fix thêm.

### `createdAt: Timestamp`

- **Auto** — `useCRUD.add` gắn `serverTimestamp()`
- Agent dùng Firebase JS SDK `addDoc` SHOULD include `createdAt: serverTimestamp()` cho consistent
- Direct `setDoc` (nếu Agent chọn deterministic doc id) — phải tự gắn `serverTimestamp()`

### `updatedAt` (NOT current)

- Hiện code KHÔNG có `updatedAt` field
- Suggest Agent gắn `updatedAt: serverTimestamp()` mọi lần update — preserve audit trail. Field thừa không phá UI.

## Doc ID strategy

Hiện code dùng `addDoc` → Firestore auto-generate doc ID. Slug URL **không** dùng doc ID; dùng `${order}-${toSlug(vi.title)}`.

**Agent có 2 lựa chọn:**

| Strategy | Pros | Cons |
|---|---|---|
| `addDoc` (auto ID) | đồng nhất với code hiện tại | re-run = duplicate nếu Agent quên check `sourceRef` |
| `setDoc(doc(db, 'khaitri', sourceRef))` (deterministic ID = sourceRef) | re-run idempotent tự nhiên; sourceRef là doc ID luôn | doc ID có dạng `khaitri-2026-05-03-001` thay vì auto — KHÔNG ảnh hưởng UI vì UI dùng slug, không dùng id, nhưng phá pattern |

**Recommend:** dùng `addDoc` + check `sourceRef` exists trước (xem `agent-auth-and-write-flow.md`). Đồng nhất hơn.

## URL slug examples

```
order=38, vi.title="Cột sóng thu lôi năng lượng — kiểm chứng và mở rộng"
→ slug = "38-cot-song-thu-loi-nang-luong-kiem-chung-va-mo-rong"
→ URL = https://battudao.com/khaitri/38-cot-song-thu-loi-nang-luong-kiem-chung-va-mo-rong
```

Vì slug derived từ `vi.title`, **đổi `vi.title` = đổi URL** = SEO break + share link cũ chết. Agent ghi entry mới = URL mới. Admin sửa title sau = URL đổi (existing pattern, không phải Agent gây ra).

## Security rules touchpoint

`firestore.rules` hiện cho `khaitri`:

```
allow read: if true                  // public read
allow write: if request.auth != null // any logged-in user can write
```

Agent (đã login Firebase Auth) → write OK. KHÔNG cần đụng rules. (TODO trong CLAUDE.md ghi cần siết rules bằng custom claim — khi đó Agent cần claim `admin==true` hoặc `role=='agent'`.)

## Sample doc (full)

```js
{
  order: 38,
  date: "2026-05-03",
  tag: { vi: "Năng Lượng", en: "Energy" },
  vi: {
    title: "Cột sóng thu lôi năng lượng — kiểm chứng và mở rộng",
    question: "Em tạo cột sóng thu lôi năng lượng để hút khí thải độc ra ngoài Trái Đất. Xin thầy kiểm chứng có thật không?",
    summary: "Buông lỏng não, lấy cảm giác cơ thể làm thước đo. Khi mở camera Tiến Tùng đảo lửa, ý nghĩ tự thực hiện — dùng để chữa bệnh người khác.",
    body: "Hỏi: Em tạo cột sóng thu lôi năng lượng…\n\nĐáp: Buông lỏng não. Khi nghĩ ra điều gì…\n\nHỏi: Em thấy cơ thể vẫn khoẻ…\n\nĐáp: Khi đã mở camera Tiến Tùng đảo lửa…"
  },
  en: { title: "", question: "", summary: "", body: "" },
  sourceRef: "khaitri-2026-05-03-001",
  source: "goclaw-publisher-v1",
  status: "draft",
  createdAt: <serverTimestamp>
}
```
