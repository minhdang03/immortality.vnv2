# Brainstorm — Chuyển DB sang Supabase + Auth + đấu nối goclaw + Dashboard đọc nội dung

**Ngày:** 2026-06-11
**Owner:** Đăng
**Trigger:** Anh muốn (1) DB qua Supabase, (2) Auth qua Supabase nhưng agent goclaw vẫn chạy ổn, (3) thấy được user đọc tới khúc nào để tối ưu nội dung — và thắc mắc web load "kỳ kỳ", category khó quản lý.
**Trạng thái:** Draft để anh đọc & chốt. CHƯA đụng code.

---

## 1. Quyết định anh đã chốt (qua hội thoại)

| Hạng mục | Chốt |
|---|---|
| Analytics | **Giữ Google Analytics (GA4)** — đang chạy, không đổi |
| Database | **Chuyển Firestore → Supabase (Postgres)** |
| Auth người dùng | **Chuyển Firebase Auth → Supabase Auth** |
| Agent goclaw | Giữ chạy ổn — cần đấu nối hợp lý (mục 3) |
| Reading analytics | Cần dashboard xem user đọc tới đâu / rớt ở đâu (mục 4) |

⚠️ **Lưu ý đảo quyết định cũ:** plan febe-redesign (260515) từng chốt *"KHÔNG migrate Firebase"*. Quyết định mới ở đây **thay thế có chủ ý** quyết định đó. SP1 (260610) thiết kế quanh Firestore+D1+Vectorize → sẽ phải điều chỉnh (mục 6).

---

## 2. Stack đích

```
Web (Vite/Astro) ─┐
Mobile (Expo RN) ─┼─► Supabase Postgres (DB) + Supabase Auth (user) + pgvector (AI)
goclaw Agent ─────┘     ▲ ghi qua API key (service plane), KHÔNG qua user login
GA4 ◄── client events (traffic, scroll macro)
Supabase ◄── reading events chi tiết (micro) → Dashboard tối ưu nội dung
Cloudflare R2 (media, giữ) · Worker api.battudao.com (gateway cho agent)
```

**Nguyên tắc:** GA4 lo *macro* (traffic, nguồn, page view). Supabase lo *dữ liệu app* + *reading events micro* + dashboard tự xây.

---

## 3. Đấu nối goclaw Agent — điểm anh lo nhất

### Hiện trạng
- Agent login bằng **Firebase ID token** (email/password → token qua identitytoolkit, refresh qua securetoken). Tức agent đang **giả làm 1 user Firebase** có trong allowlist (`api/_lib/auth.js`).
- Nhược: credential user nhúng trong config agent; quyền rộng; khó thu hồi/audit từng agent.

### Hướng đúng = **2 tầng auth tách biệt** (đã có trong SP1)
1. **Người (anh + mod)** → Supabase Auth (email/password, RLS theo role).
2. **Agent (goclaw)** → **API key riêng** `btd_<hex>` (đã có `api-key.ts`: tạo 1 lần, lưu SHA-256 hash), **không liên quan login người dùng**.

→ **Kết luận:** đổi user-auth sang Supabase **KHÔNG ảnh hưởng goclaw**, miễn API ghi nội dung còn sống. Thậm chí tốt hơn hiện tại (key scoped, revocable, audit per-agent).

### Cách ghép cụ thể (khuyến nghị: Worker làm gateway)
```
goclaw ──Bearer btd_key──► Worker api.battudao.com /v1/content
   Worker: hash key → tra bảng api_keys (Postgres) → hợp lệ?
   → ghi Supabase bằng SERVICE_ROLE (bypass RLS), service_role chỉ nằm trong Worker secret
   → log vào agent_audit_log
```
- service_role **không bao giờ** lộ ra agent config — agent chỉ giữ `btd_` key.
- Agent migrate = đổi base URL + đổi token (Firebase ID token → `btd_` key). Logic ghi giữ nguyên.
- Khớp y SP1 phase-01/02 — chỉ thay tầng lưu (Firestore REST → Supabase) bên trong Worker.

*Phương án B (agent ghi thẳng Supabase qua PostgREST + custom role):* ít tầng hơn nhưng khó kiểm soát quyền + lộ key mạnh → **không khuyến nghị** cho giai đoạn này.

---

## 4. Dashboard "user đọc tới khúc nào" — đang THIẾU UI

### Đang có gì
- `useAnalytics.js` đã bắn GA4: `article_view`, `scroll_depth` (25/50/75/100%), `article_read_time` (giây + max_scroll).
- **Nhưng KHÔNG có trang UI nào trong app để xem** → đó là lý do anh "không thấy". Data nằm trong GA4, xem qua GA4 UI rất cực để hỏi "đoạn nào rớt người".

### Bổ sung để tối ưu nội dung
1. **Sự kiện theo từng đoạn (micro):** `ArticleDetail` đã render `<p data-para={i}>`. Gắn `IntersectionObserver` → log mỗi đoạn: đã hiển thị? dừng bao lâu? rời ở đoạn nào.
2. **Lưu vào Supabase** bảng `reading_events` (không nhồi GA4 — GA4 dở khoản này). Đây là "dữ liệu app" nên hợp Supabase, đúng phân vai GA4-macro / Supabase-micro.
3. **Trang admin "Phân tích nội dung":** query SQL → hiện per-article:
   - % hoàn thành (đọc tới cuối), thời gian đọc trung vị.
   - **Heatmap/drop-off theo đoạn** — đoạn 5 mất 40% người → biết chỗ cần sửa.
   - So sánh bài: bài nào giữ chân tốt/tệ.

→ Đây là **feature độc lập**, làm được ngay sau khi có Supabase; không phụ thuộc fix render.

---

## 5. Schema Postgres dự kiến (phác thảo)

```sql
-- Nội dung (gộp articles/stories/khaitri qua cột type, hoặc tách bảng — quyết ở plan)
content(id, type, status, vi_title, vi_body, en_title, en_body,
        slug_vi, slug_en, image, category_id, source_ref, created_at, updated_at,
        embedding vector(768))           -- pgvector cho AI/search
category(id, parent_id, vi_name, en_name, "order")   -- CATEGORY cha-con (anh hỏi lúc đầu)
content_category(content_id, category_id)             -- nếu cần nhiều category/bài
comment(id, content_id, author, body, status, created_at)
donation(...), contact(...), donation_contact(...)    -- giữ như Firestore
profile(id→auth.users, display_name, bio, role)       -- user mở rộng
api_keys(id, key_hash, prefix, agent_name, scopes, revoked_at, created_at)  -- agent plane
agent_audit_log(id, key_id, action, target, ts, token_cost)
reading_events(id, content_id, session_id, para_index, dwell_ms, reached_end, ts) -- mục 4
```
- **Category quan hệ thật** → giải quyết "khó quản lý" anh hỏi đầu tiên (Firestore làm cha-con rất cực).
- **Full-text search** Postgres built-in + **pgvector** → gom được vai trò của D1 FTS + Vectorize trong SP1 thành 1 kho.

---

## 6. Ảnh hưởng SP1 (Agent Content Platform)

SP1 đang thiết kế **3 kho:** Firestore (canonical) + D1 (replica/FTS) + Vectorize (embeddings) + cron reconcile.

→ Nếu qua Supabase: **gom 3 → 1 Postgres** (bảng + tsvector FTS + pgvector). **Bỏ được cron reconcile** (không còn 3 kho để đồng bộ). Kiến trúc gọn hơn hẳn. SP1 cần viết lại phase 01-03, 05 quanh Supabase thay vì Firestore+D1+Vectorize. Phase 04 (MCP/OpenAPI/agent-spec) gần như giữ.

---

## 7. Công sức ước lượng (re-platform lớp dữ liệu, KHÔNG rewrite UI)

| Khối | Việc | Ước lượng |
|---|---|---|
| Schema + migrate data | Thiết kế bảng, script export Firestore → import Postgres | 1-2 ngày |
| Web data layer | Viết lại ~20 hooks (useArticles, useStories, useKhaiTri, useTopics, useCRUD, useFirestoreSWR, comments, donations) sang supabase-js | 3-4 ngày |
| Auth web | Firebase Auth → Supabase Auth (admin login, RLS, role) | 1-2 ngày |
| Mobile RN | @react-native-firebase → supabase-js (data + auth) | 2-3 ngày |
| Agent gateway | Worker validate `btd_` key → ghi Supabase service_role; goclaw đổi URL+key | 1-2 ngày |
| Reading analytics | IntersectionObserver + bảng reading_events + trang dashboard admin | 2-3 ngày |
| **Tổng** | | **~10-16 ngày** (1 người) |

UI/components/i18n/share/OG **giữ nguyên** — đây là điểm tiết kiệm lớn so với "rewrite từ đầu" (không cần).

---

## 8. Render "kỳ kỳ" (SPA) — track riêng, đừng trộn

Vấn đề web load trắng-rồi-hiện = Vite SPA thuần (body chỉ `<div id="root">`), bot chỉ nhận meta + 1 dòng `<p>` (`functions/index.js:63`). **Supabase KHÔNG fix cái này.** Fix gốc = SSR/SSG (Astro/Next). Khuyến nghị: **làm Supabase trước** (data nền), **Astro sau** (SP2) — vì Astro + Supabase là combo phổ biến, nhiều template. Không nên làm cùng lúc.

---

## 9. Lộ trình đề xuất

1. **Bước 0 (giờ):** anh duyệt report này → em viết plan chi tiết (`/ck:plan`).
2. **Phase A:** Schema Postgres + migrate data + Supabase Auth (web admin trước).
3. **Phase B:** Viết lại web data hooks → web chạy trên Supabase.
4. **Phase C:** Agent gateway (Worker + `btd_` key) → goclaw cắt sang, verify ghi ổn.
5. **Phase D:** Reading analytics (events + dashboard).
6. **Phase E:** Mobile RN cắt sang Supabase.
7. **Phase F (sau, tách):** Astro re-platform để fix render + SEO.

> Có thể giữ Firebase chạy song song tới khi từng phần verify xong (cutover từ từ, không big-bang).

---

## 10. Câu hỏi chưa rõ (cần anh trả lời trước khi lên plan chi tiết)

1. **Migrate data**: có cần giữ nguyên ID/slug cũ để không gãy link đã share/SEO không? (nên có → map slug.)
2. **goclaw**: agent đang chạy ở đâu (Cloudflare/VPS/local)? Đổi base URL + key là anh tự sửa config goclaw được, hay cần em đụng repo `Claw/goclaw`?
3. **Mobile**: cắt sang Supabase cùng đợt web, hay để sau (web trước, mobile sau)?
4. **Thứ tự ưu tiên**: Supabase DB+Auth trước, hay Reading dashboard trước (dashboard cần Supabase nên thường đi sau)?
5. **Supabase hosting**: dùng Supabase Cloud (free tier) hay self-host? (khuyến nghị Cloud free tier để bắt đầu.)
6. **realtime** (chat đối-thoại-sâu đang ở Durable Objects): giữ DO hay chuyển Supabase Realtime? (khuyến nghị giữ DO, ngoài scope đợt này.)
