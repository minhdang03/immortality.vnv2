# Phase 04 — Data Layer (Notion → Firestore sync extension)

## Context Links

- Existing sync: `workers/notion/src/notion-to-firestore-sync.ts`
- Existing client: `workers/notion/src/notion-knowledge-base-client.ts`
- Existing Firestore rules: `firestore.rules` (btd_knowledge, btd_ai_flags, btd_ai_usage, _sync_logs đã có)
- Notion DBs:
  - Nguyên Lý: `collection://e9c676cb-02f3-4ff1-84db-3c9b714715ac`
  - Reasoning Patterns: `collection://8db5873a-2039-4533-81cf-3492ccc2061f`
  - Raw Materials: `collection://b663b13c-17fa-4317-a422-25248c1938af`
  - Khai Trí (đã có riêng): `collection://ab5c78f4-e0d4-4878-87e3-7a7bd7006fa1`

## Overview

**Priority:** P0 (blocks phase-02, phase-03 thực sự chạy)
**Current status:** Draft
**Brief:** Quyết định extend `btd_knowledge` hay tạo collection riêng. Extend Notion sync worker để pull thêm các DB Nguyên Lý + Reasoning Patterns. Đảm bảo Notion là source of truth, web chỉ đọc.

## Key Insights

- `workers/notion` đã có khung sync hoàn chỉnh: paginate Notion → diff theo `lastEditedTime` → upsert Firestore → soft-delete khi page biến mất → log metrics. Chỉ cần thêm DB ID + mapping.
- `btd_knowledge` hiện chỉ có 1 DB nguồn (knowledge base chung). 3 DB mới (NL/RP/Raw + đa-tên page Notion) có schema khác hẳn → KHÔNG nên gộp vào `btd_knowledge`.
- Notion DB Nguyên Lý có 9+ field (Mã, Tên, Phát biểu ngắn, Cụm, Trạng thái, Tier, Module áp dụng, RP liên quan, Cross-ref, BTD nguồn). Field-by-field map sang Firestore.
- Anh có rule "không public 100% Notion" → cần property `publicOnWeb` thêm vào Notion (anh manual toggle) để worker filter.

## Quyết định cốt lõi

### A. Schema strategy

**Chọn:** Tạo collections riêng cho từng loại, KHÔNG nhồi vào `btd_knowledge`.

Lý do:
- Schema mỗi DB khác hẳn (NL có Tầng 1, Neo khoa học, Cross-ref; RP có Tầm quan trọng, FOUNDATION flag).
- Query pattern khác (NL filter theo Cụm; RP sort theo Tầm quan trọng).
- Security rules khác (DRAFT NL ẩn; tất cả RP có thể public).
- Notion sync worker hiện chỉ filter theo DB ID — dễ extend, không phá `btd_knowledge` đang chạy.

Collections mới:
- `wiki_nguyen_ly` — 43 NL (Cụm 1+2+3)
- `wiki_reasoning_patterns` — 30 RP (2 FOUNDATION + 28 còn lại)
- `wiki_raw_materials` — BTD raw, **chỉ public field title + cụm + date**, không public bodyMarkdown (vì là transcript nguyên văn của Anh — riêng tư)
- `wiki_concepts` — 7 page tier 1 (Không Đạo, Hạt Bất Tử...). Có thể source từ Notion hoặc edit thẳng Firestore — phase-02 viết content tay nhanh hơn.

### B. Sync direction

- 1-way: Notion → Firestore. Web read-only. Edit ở Notion là source of truth.
- Frequency: 5 phút (giống `btd_knowledge` hiện tại).
- Soft-delete: page biến mất khỏi Notion → set `archivedAt`, không xoá doc (giữ history).

### C. Validation pipeline

Trước khi upsert vào Firestore, sync worker chạy validator:

1. **Em dash check** — content có `—` → reject, log vào `btd_ai_flags`.
2. **Cấm từ check** — "tâm linh" / "spiritual" / "viên ma" / "chữa lành" (trong context ánh sáng) → flag.
3. **Required field check** — NL thiếu "Tầng 1" hoặc "Phát biểu ngắn" → flag.
4. **PublicOnWeb gate** — `publicOnWeb !== true` → skip upsert, log skipped.

Anh review flags qua admin panel; chỉ khi cleared mới sync lần sau.

## Schema chi tiết

### Firestore: `wiki_nguyen_ly`

```ts
{
  notionPageId: string,          // doc id = notionPageId
  code: string,                  // "NL-018"
  name: string,                  // "Không Đạo = Cốt lõi BTĐ"
  shortStatement: string,        // "Phát biểu ngắn"
  reasoning: string,             // "Cách reasoning"
  tier1Mechanism: string,        // "Tầng 1"
  scienceAnchor: string,         // "Neo khoa học"
  application: string,           // "Áp dụng"
  cluster: 'cum-1' | 'cum-2' | 'cum-3',
  status: 'CHỐT' | 'ĐANG CHƯNG' | 'DRAFT',
  tiers: string[],               // ['T1', 'T8']
  modules: string[],             // ['Tất cả', 'Fly', '37stories']
  relatedRp: string[],           // ['RP-18']
  crossRefNl: string[],          // ['NL-019', 'NL-020', 'NL-045']
  btdSource: string[],           // ['BTD-003', 'BTD-014']
  publicOnWeb: boolean,
  lastEditedTime: string,
  lastSyncedAt: string,
  archivedAt: string | null,
  source: 'notion',
}
```

### Firestore: `wiki_reasoning_patterns`

```ts
{
  notionPageId, code: 'RP-26',
  name: 'Phóng ra trước',
  shortStatement: string,
  whenToUse: string,
  examples: string[],            // các NL ví dụ
  importance: 'FOUNDATION' | 'CHỐT' | 'CANDIDATE',
  publicOnWeb: boolean,
  lastEditedTime, lastSyncedAt, archivedAt, source: 'notion',
}
```

### Firestore: `wiki_concepts` (tier 1)

```ts
{
  slug: 'khong-dao',             // doc id = slug
  title: { vi: string, en: string },
  shortStatement: { vi: string, en: string },
  paragraphs: { vi: string, en: string }[],
  examples: { vi: string, en: string }[],
  relatedSlugs: string[],
  relatedNl: string[],           // ['NL-018']
  readingTimeMinutes: number,
  published: boolean,
  updatedAt: string,
}
```

Không sync từ Notion ở phase-1 — content tay (ít trang, nhiều care). Sau này nếu cần thì port sang Notion sync.

## firestore.rules (extend)

```
match /wiki_nguyen_ly/{id} {
  allow read: if resource.data.status in ['CHỐT', 'ĐANG CHƯNG']
              && resource.data.publicOnWeb == true
              && resource.data.archivedAt == null;
  allow write: if false; // chỉ Notion sync Worker
}

match /wiki_reasoning_patterns/{id} {
  allow read: if resource.data.publicOnWeb == true
              && resource.data.archivedAt == null;
  allow write: if false;
}

match /wiki_concepts/{slug} {
  allow read: if resource.data.published == true;
  allow write: if isAdmin() || hasRole('mod-wiki');
}

match /wiki_raw_materials/{id} {
  // public read CHỈ field title + cluster + date, KHÔNG body
  // → enforce via app layer (web không request field body)
  // → rule chỉ check status:
  allow read: if resource.data.publicOnWeb == true
              && resource.data.archivedAt == null;
  allow write: if false;
}
```

## Related Code Files

**Modify:**
- `workers/notion/src/notion-to-firestore-sync.ts` — main sync function nhận danh sách `DatabaseConfig[]`, mỗi config có `databaseId + collection + mapper`.
- `workers/notion/src/notion-knowledge-base-client.ts` — split thành multiple client modules theo DB, hoặc generic client + per-DB mapper.
- `workers/notion/wrangler.toml` — thêm env vars `NOTION_DB_NGUYEN_LY`, `NOTION_DB_RP`, `NOTION_DB_RAW`.
- `firestore.rules` — thêm 3-4 match blocks ở trên.

**Create:**
- `workers/notion/src/mappers/nguyen-ly-mapper.ts` — map Notion property → Firestore schema.
- `workers/notion/src/mappers/rp-mapper.ts`
- `workers/notion/src/mappers/raw-materials-mapper.ts`
- `workers/notion/src/validators/content-validator.ts` — em-dash check, cấm-từ check.
- `apps/web/src/admin/WikiFlagsTab.jsx` — admin tab review flag từ `btd_ai_flags`.

## Implementation Steps

1. Anh thêm property `publicOnWeb: bool` vào 3 Notion DB (NL, RP, Raw). Default false. Anh manual toggle khi sẵn sàng public.
2. Extend `workers/notion` config nhận multi-DB:
   ```ts
   const SYNC_TARGETS = [
     { dbId: env.NOTION_DB_KB, collection: 'btd_knowledge', mapper: kbMapper },
     { dbId: env.NOTION_DB_NGUYEN_LY, collection: 'wiki_nguyen_ly', mapper: nlMapper },
     { dbId: env.NOTION_DB_RP, collection: 'wiki_reasoning_patterns', mapper: rpMapper },
     { dbId: env.NOTION_DB_RAW, collection: 'wiki_raw_materials', mapper: rawMapper },
   ];
   ```
3. Implement `nlMapper.ts`: parse Notion property "Mã", "Phát biểu ngắn", "Cụm" (select), "Trạng thái" (select), "Tier áp dụng" (multi-select), v.v.
4. Implement validator chạy trước upsert. Nếu fail → log `btd_ai_flags` với `severity`, `field`, `match`, KHÔNG upsert lần này.
5. Update `firestore.rules`, deploy `firebase deploy --only firestore:rules`.
6. Run sync manual lần đầu (qua `wrangler dev` trigger), verify Firestore có data.
7. Admin tab: render flags để anh duyệt; clear flag → sync sau cleared upsert OK.

## Todo List

- [ ] Anh thêm `publicOnWeb` property vào 3 Notion DB
- [ ] Confirm Notion DB IDs (em đã có từ collection://) → đưa vào wrangler env
- [ ] Refactor sync worker thành multi-DB
- [ ] Viết 3 mapper
- [ ] Viết validator (em-dash + cấm-từ)
- [ ] Update firestore.rules
- [ ] Deploy rules
- [ ] First sync manual + verify
- [ ] Admin Flags tab
- [ ] Unit test cho mapper (NL có field thiếu, RP FOUNDATION detect, validator catch em-dash)
- [ ] Cron đảm bảo vẫn 5 min

## Success Criteria

- 43 NL có trong Firestore `wiki_nguyen_ly`, chỉ những doc `publicOnWeb = true` mới đọc được từ client SDK.
- 30 RP trong `wiki_reasoning_patterns`, 2 FOUNDATION đúng flag.
- Edit page Notion NL-018 → 5 phút sau Firestore reflect.
- Em dash trong Notion → sync skip + flag → admin review.
- `wiki_raw_materials` doc tồn tại nhưng body không lộ ra public (test bằng client SDK với rule mode).

## Risk Assessment

- **Risk:** Notion API rate limit khi sync 4 DB cùng lúc 5 phút/lần. **Mitigation:** sync tuần tự, không parallel. Notion limit 3 req/s — 4 DB × ~50 pages = 200 req, mỗi 5 phút thừa thời gian.
- **Risk:** mapper sai field type (text vs rich_text vs select). **Mitigation:** unit test với fixture từ Notion API response thật.
- **Risk:** schema Notion thay đổi (anh đổi tên field) → mapper crash. **Mitigation:** mapper try/catch + flag warning, không crash whole sync.
- **Risk:** content body markdown từ Notion có HTML/script. **Mitigation:** sanitize markdown trên web khi render (`react-markdown` + `rehype-sanitize`).

## Security Considerations

- Notion sync Worker dùng Firestore Admin SDK qua service account — bypass rules. Đảm bảo creds trong Cloudflare env, KHÔNG commit.
- `publicOnWeb` gate là defense-in-depth: anh quên set `publicOnWeb=false` cho 1 page nhạy cảm → rule check default false → vẫn an toàn.
- Validator block em-dash + cấm-từ — prevent accidental publish content sai tone.

## Next Steps

- phase-04 xong → phase-02 + phase-03 unblock thực sự.
- phase-05 (SEO + integration) cần biết collection names cuối để extend ogRenderer.
