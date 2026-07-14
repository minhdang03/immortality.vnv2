# Brainstorm: Bất Tử Đạo 3.0 — Agent-Operated Publishing Platform

**Date:** 2026-06-10 | **Branch:** claude/immortality-mobile-hybrid | **Status:** Awaiting approval
**Supersedes & absorbs:** `plans/260515-2144-febe-redesign/` (user confirmed: gộp & mở rộng)

---

## 1. Problem Statement

Hệ thống ngày càng nhiều bài viết, cần scale thành CMS + blog website. User confirms:
- Scale target: **1,000–10,000+ bài** trong 12-24 tháng
- **CMS chỉ phục vụ AI agents** — agents viết/đăng, người moderate
- Tương lai mở rộng **chatbot** trên nền content
- Constraint cứng: **agent API hiện tại (Vercel /api) đang chạy ổn — KHÔNG được phá**

### Pain points hiện tại (scout 2026-06-10)

| Pain | Hiện trạng | Chặn scale |
|---|---|---|
| Data layer | Full collection load client-side; articles `limit(200)` hardcoded (`useArticles.js`), useCRUD 500 docs, localStorage cache cap 2MB | Không vượt được 200-500 bài |
| Search | String-match O(n) client-side (`SearchPage.jsx`) | Vô dụng ở 1k+ bài |
| SEO | SPA — crawler-only OG render, duplicate 2 nơi (`functions/index.js` 226L + `api/og.js` 213L); không sitemap, không JSON-LD | Google index kém → content agent viết không ai thấy |
| Admin | 15 tabs inline-CRUD cho người gõ tay, publish-on-save, không media picker | Sai persona — agents không click UI |
| Backend | 3 backends song song (Firebase Functions + Vercel /api + Workers scaffold chưa deploy) | Đã ghi nhận ở febe-redesign |
| Code | StoriesPage/KhaiTriPage/ArticlesPage duplicate pattern; App.jsx prop-drill 19 hooks | Maintenance |

---

## 2. Reframe

Đây không phải "thêm CMS" — là đổi loại sản phẩm: **publishing platform do AI agents vận hành**.
- Admin UI 15 tabs = dead-end. Cốt lõi = **Content API agent-native** (schema validation, dedup, auto-slug, auto-enrich).
- SEO = kênh phân phối chính của content agent viết → cần HTML thật cho mọi request (SSR/SSG), không chỉ vá OG.
- Firestore vấn đề không phải lưu mà là đọc: 10k bài × page views đọc thẳng Firestore = tốn + chậm → cần edge read-layer.
- "Nghĩ xa": CMS expose chính nó như **MCP server** — mọi agent (Claude Code, goclaw, cron) cắm vào publish/search được. Embed content vào **Vectorize** ngay lúc ingest → chatbot RAG-ready từ ngày 1, không backfill.

---

## 3. Approaches Evaluated

### A — Edge Publishing Platform ✅ CHỌN
- Astro public site trên Cloudflare Workers (SSR/SSG hybrid)
- Firestore vẫn canonical → replicate D1 edge khi publish; public reads đánh D1
- D1 FTS5 = full-text search miễn phí; Vectorize = semantic/related/chatbot
- Agent API Workers Hono `api.battudao.com` + MCP
- Interactive (comments, community, admin) = React islands
- **Pros:** SEO thật, scale 10k+, chatbot-ready, $0-5/mo, không đập mobile/19 hooks ngay
- **Cons:** Astro mới trong stack; dual-store cần sync discipline

### B — Lật canonical sang D1 ❌
Sạch nhất dài hạn nhưng đập 19 web hooks + mobile RN Firestore realtime + migration nặng. Là **endgame của A**, không phải bước 1.

### C — Vá SPA tối đa ❌
Cursor pagination + edge OG + Typesense. Rẻ effort nhưng SPA không có HTML thật per-article — "vá xe đạp chạy cao tốc" với mục tiêu blog SEO 10k bài.

---

## 4. Target Architecture (A)

```
AI Agents (Claude Code, goclaw, cron)
    │  MCP tools + REST ingest
    ▼
api.battudao.com (Cloudflare Workers + Hono)
    │  validate → auto-enrich:
    │   • auto-slug, dedup, taxonomy
    │   • internal links, SEO meta
    │   • embeddings → Vectorize   ◄── chatbot-ready
    ▼
Firestore (canonical) ──publish event──► D1 (edge replica + FTS5)
                                          R2 (media)
    │                                       │
    ▼                                       ▼
Mobile RN (giữ nguyên              Astro site (toàn bộ battudao.com)
Firestore SDK realtime)            SSR/SSG, sitemap, RSS, JSON-LD,
                                   i18n VI/EN, search FTS5
                                   + React islands (comments,
                                     community, AI hỏi ngược, admin)
```

### Backward compatibility (constraint cứng của user)
**Strangler pattern:** Vercel `/api` hiện tại giữ nguyên, không đụng. Workers API mới xây song song, mirror contract cũ (`/articles`, `/khaitri`, `/upload-file`, `/agent-spec`) rồi mở rộng. Agents đổi base URL khi API mới đạt parity — thời điểm do user quyết. Chỉ retire Vercel sau khi không còn traffic đường cũ.

### Write path (1 đường duy nhất)
Agent → ingest API → validate/enrich → Firestore write → publish event → D1 upsert + Vectorize upsert + cache purge. Không ai ghi tay D1. Cron reconcile Firestore↔D1 hàng đêm.

---

## 5. Sub-Projects (mỗi cái 1 plan riêng, brainstorm → plan → implement)

| # | Sub-project | Scope | Breaking? |
|---|---|---|---|
| **SP1** | Agent Content Platform | Workers `api.battudao.com`: ingest v2 + R2 media + **MCP server** + auto-enrich pipeline (taxonomy, internal links, SEO meta, Vectorize embeddings). D1 schema + publish replication. | Không — additive |
| **SP2** | Astro Public Site | Toàn bộ public site sang Astro/Cloudflare. Reads từ D1. FTS5 search page. Sitemap + RSS + JSON-LD + i18n VI/EN routes. React islands cho interactive. Deploy song song → cutover DNS. | Thay SPA public sau cutover |
| **SP3** | Consolidation (phần còn lại febe-redesign) | Notion sync worker, admin custom claims (fix "any auth = admin"), Firestore rules auto-deploy, retire Vercel + Firebase Hosting + 2 bản OG renderer (chết tự nhiên vì Astro render HTML thật). | Chỉ xoá sau SP1+SP2 parity |
| **SP4** | Admin thu gọn | Content tabs → monitor/edit-on-exception. AgentLog nâng cấp. **Review queue KHÔNG làm đợt này** (agents publish thẳng) — schema có sẵn field `status` để thêm queue sau không phải migrate. | Không |

**Thứ tự:** SP1 → SP2 (overlap được, khác file ownership) → SP3 → SP4.

---

## 6. Success Metrics

- Agents publish qua MCP/REST không cần người; bài mới live + indexed trong < 5 phút
- Mọi article URL trả HTML đầy đủ (curl không JS thấy nội dung) + JSON-LD + sitemap auto-update
- Search 10k bài < 200ms (D1 FTS5)
- Agent API cũ hoạt động nguyên vẹn suốt quá trình migrate (zero downtime cho agents)
- 1 backend canonical (Workers), 2 vendor dashboards (Cloudflare + Firebase), $0-5/mo
- Vectorize index phủ 100% bài published (chatbot-ready)

## 7. Risks

| Risk | Mitigation |
|---|---|
| Firestore↔D1 drift | Single write path qua API + nightly reconcile cron |
| Astro learning curve | Public site phần lớn content tĩnh (sở trường Astro); interactive vẫn React |
| D1 limits | 10GB/DB — 10k bài text ~vài trăm MB, dư |
| Vectorize cost | Free tier 30M queried dims — đủ giai đoạn này |
| Cutover DNS rủi ro | Deploy Astro song song domain staging, so sánh trước khi trỏ |

## 8. Out of Scope

Chatbot (chỉ chuẩn bị nền Vectorize), lật D1 canonical (endgame), mobile data layer, IAP/video provider, review queue UI.

---

## 9. Decisions (chốt 2026-06-10, user uỷ quyền quyết theo cấu trúc hiện tại)

1. **Agent auth = per-agent API keys**, mirror đúng pattern goclaw đang dùng nội bộ (`docs/20-api-keys-auth.md`): prefix `btd_` + 32 hex (128-bit entropy), SHA-256 hash lưu D1 (raw key không persist), show-once khi tạo, RBAC scopes (`content:write`, `content:read`, `media:write`), revocable. Mỗi agent 1 key riêng → audit trail trong AgentLog. Lý do: cùng 1 security model xuyên suốt stack của Đăng (goclaw + BTD), không phụ thuộc Firebase service account cho Go runtime.
2. **Astro deploy = Cloudflare Workers static assets** (không Pages — CF đang dồn về Workers; cùng wrangler toolchain với api worker, 1 cách deploy duy nhất).
3. **Notion sync: ⚠️ REMIND ĐĂNG TẠI SP3** — đề xuất retire (agents publish thẳng qua API làm Notion sync thừa) nhưng đây là content workflow của Đăng, KHÔNG tự quyết. Phải hỏi lại trước khi xoá workers/notion. (Memory đã ghi.)
4. **Tất cả content types vào D1 replica**: unified `content` table + `type` discriminator (article/story/khaitri/teaching/practice) → 1 FTS5 index, 1 search, 1 ingest path, 1 MCP tool surface. Không tách bảng per-type.

---

## 10. GoClaw Integration & AI-Agentic Best Practices

**Hai surface, một handler core** (cùng Worker):
- **REST** `api.battudao.com` — cho goclaw agents (custom shell tools / HTTP tool trong tools registry) + cron jobs
- **MCP server** — cho Claude Code / Claude agents; tools: `publish_content`, `update_content`, `search_content`, `get_taxonomy`, `upload_media`

**GoClaw vận hành content fleet:**
- GoClaw cron lanes (at/every/cron, retry exponential backoff — `docs/08-scheduling-cron.md`) schedule content agents: viết bài định kỳ, reconcile check, SEO refresh
- Mỗi goclaw agent = 1 `btd_` API key = identity riêng trong AgentLog (ai đăng bài nào, lúc nào, token cost)
- GoClaw tool registry đã có credential scrubbing + rate limiting phía client; CMS API thêm rate limit phía server per-key

**Agent-native API contract (bắt buộc cho mọi endpoint):**
- **Idempotent ingest**: client gửi `external_id` hoặc content-hash → retry an toàn (goclaw cron retry với backoff sẽ không tạo bài trùng)
- **Structured errors**: JSON problem-details (machine-readable code + hint) để agent loop tự sửa thay vì chết câm
- **Self-onboarding discovery**: mở rộng `/api/agent-spec` hiện có + publish OpenAPI spec + `llms.txt` — agent mới cắm vào tự đọc spec, không cần người hướng dẫn

**Website AI-agentic (content máy đọc được, không chỉ người):**
- `llms.txt` + `llms-full.txt` ở root (index toàn bộ content cho LLMs)
- Mỗi article có bản markdown thuần (`/article/{slug}.md` hoặc content-negotiation) — agents/LLMs đọc không cần parse HTML
- JSON-LD đầy đủ (Article, BreadcrumbList, Organization) — máy hiểu cấu trúc
- RSS/Atom feed — agents subscribe content mới

---

## Unresolved Questions

- Notion sync retire hay giữ — **chờ Đăng confirm tại SP3** (xem Decision #3)
