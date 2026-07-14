# Phase 05 — SEO, OG, Discovery & Best Practices Integration

## Context Links

- Existing: `functions/index.js` (ogRenderer)
- Existing: `firebase.json` rewrites
- `.claude/rules/frontend-standards.md` (project rule: SEO metadata mandatory)
- audit-notion-to-website.md (sister report)

## Overview

**Priority:** P1 (cuối cùng vì cần phase-01..04 xong)
**Current status:** Draft
**Brief:** Đảm bảo wiki được Google/Facebook/Zalo index đúng. Internal linking từ stories/khaitri → wiki. Fix các anti-pattern hiện có (tâm linh, chữa lành, em dash).

## Key Insights

- Project rule `frontend-standards.md` ràng buộc: mọi page có `title + description + OG + Twitter`. Wiki phải đáp ứng đầy đủ.
- `ogRenderer` Cloud Function chạy ở `asia-southeast1` — đã render OG cho stories/khaitri/about/practice. Pattern có sẵn: fetch Firestore → render meta HTML cho crawler.
- Internal linking là động lực SEO quan trọng nhất sau content quality. 24 stories hoàn thành + Khai Trí articles đang nhắc thuật ngữ "Hạt Bất Tử", "Không Đạo"... mà KHÔNG link sang định nghĩa.
- Anti-pattern hiện có trong `pages.js` ("tâm linh", "chữa lành") đi vào title/desc → đi vào OG → đi vào Google snippet → vi phạm rule terminology.

## Requirements

### Functional

- Mỗi route wiki có OG meta riêng (title, description, image).
- Sitemap.xml liệt kê tất cả wiki page.
- Robots.txt cho phép crawl wiki.
- Internal link `<WikiLink>` component dùng được trong markdown render của stories/khaitri/articles.
- Audit + replace anti-pattern từ pages.js + tất cả copy.
- Breadcrumb cho mọi wiki page: Home > Wiki > [section] > [page].

### Non-functional

- TTFB < 800ms cho wiki page (cached HTML + Firestore cache).
- OG image render < 2s (dynamic generate qua satori/imagepresenter hoặc static asset).
- Lighthouse SEO score > 95.

## Anti-patterns sẽ fix

Đây là quick wins, có thể làm ngay không cần đợi wiki build xong:

### 1. `pages.js` line 19, 30

```diff
- descVi: 'Tất cả bài viết về tâm linh, sức khỏe và bất tử.'
+ descVi: 'Bài viết Khai Trí, Đối thoại sâu và nguyên lý Bất Tử Đạo.'

- descVi: 'Những câu chuyện thật về hành trình chữa lành và giác ngộ tâm linh.'
+ descVi: 'Những câu chuyện thật về hành trình xoá đi gốc rễ và mở ra Bất Tử Đạo.'
```

### 2. `pages.js` line 30, 47, 57 và các nơi khác

Audit tất cả em-dash `—` (Unicode 0x2014) → thay bằng `:` hoặc xuống dòng.

```bash
# grep tìm em-dash
rg -n '—' apps/web/src
```

### 3. `homeCard.descVi` line 34, 47, 57, 68

```diff
- 'Hành trình tu luyện siêu trí tuệ qua những câu chuyện có thật'
+ 'Hành trình mở ra siêu trí tuệ qua những câu chuyện có thật'
```

"Tu luyện" mang sắc thái Phật giáo. "Mở ra" trung tính hơn, gần với "khai trí".

### 4. `home` page hero text

Audit `apps/web/src/pages/Home*.jsx` (chưa đọc nhưng chắc chắn có copy hoa mỹ). Em sẽ rà soát hết.

### 5. functions/index.js DEFAULT_DESC

```diff
- 'Khám phá ánh sáng bên trong bạn — hành trình chữa lành từ trí tuệ Việt Nam ngàn đời.'
+ 'Khám phá Bất Tử Đạo: trí tuệ Việt Nam về ánh sáng, năng lượng và sự sống bất tử tại thế.'
```

Bỏ em-dash, bỏ "chữa lành".

## Architecture

### OG strategy

**Static OG cho tier 1 + landing:**
- `PAGE_OG` trong `functions/index.js` extend thêm 7 tier 1 + `wiki` landing.
- OG image: 1 ảnh chung gold + sun icon + tên page overlay (hoặc 1 ảnh riêng/page).

**Dynamic OG cho tier 2:**
- ogRenderer detect path `/wiki/nguyen-ly/:id` → fetch Firestore → render title/desc từ doc.
- Image: vẫn dùng default gold + overlay code "NL-018" + tên ngắn.

**Image generation options:**
- Option A: static asset cho landing + tier 1 (anh design Figma → export PNG).
- Option B: dynamic OG qua `@vercel/og` hoặc Cloudflare Workers + satori — sinh image runtime.
- Recommend: Option A cho tier 1 (7 ảnh fixed), Option B cho tier 2 (43+30 = 73 ảnh, không thể design tay từng cái).

### Internal linking strategy

**Where to link:**
- Stories detail: thuật ngữ → wiki concept tương ứng.
- Khai Trí detail: tương tự.
- About: link sang tier 1 + tier 2 entry.
- Wiki tier 1 ↔ tier 2 cross-link.
- Footer: "Tra cứu thuật ngữ" link sang `/wiki/thuat-ngu`.

**How to implement:**
- Component `<WikiLink concept="hat-bat-tu">Hạt Bất Tử</WikiLink>` render `<a href="/wiki/hat-bat-tu" class="wiki-link">Hạt Bất Tử</a>`.
- Underline dotted gold, hover popup hiện "Phát biểu ngắn" + "Đọc tiếp →".
- Trong markdown content (stories, khaitri), dùng custom remark plugin: detect các thuật ngữ trong `wiki_concepts.slugs` → auto wrap thành WikiLink.
- Plugin chỉ wrap LẦN ĐẦU thuật ngữ xuất hiện trong 1 article (tránh spam).

### Sitemap

`apps/web/public/sitemap.xml` hiện chưa có (cần verify). Tạo `apps/web/public/sitemap.xml` static:

```xml
<urlset>
  <url><loc>https://battudao.com/</loc></url>
  <url><loc>https://battudao.com/stories</loc></url>
  ...
  <url><loc>https://battudao.com/wiki</loc></url>
  <url><loc>https://battudao.com/wiki/khong-dao</loc></url>
  ...
</urlset>
```

Hoặc dynamic generation qua Cloud Function — đề xuất static + script `scripts/generate-sitemap.js` chạy lúc build.

### Robots.txt

`apps/web/public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://battudao.com/sitemap.xml
```

## Related Code Files

**Modify:**
- `apps/web/src/config/pages.js` — fix anti-pattern (4-5 edits)
- `apps/web/src/pages/Home*.jsx` — audit + fix copy
- `apps/web/src/pages/About.jsx` — link wiki
- `apps/web/src/components/*.jsx` — fix em-dash trong UI strings
- `functions/index.js` — DEFAULT_DESC, PAGE_OG cho wiki, dynamic OG cho wiki sub-routes
- `firebase.json` — rewrite `/wiki/**` qua ogRenderer
- `apps/web/public/robots.txt` (tạo nếu chưa có)
- `apps/web/public/sitemap.xml` (tạo)
- `scripts/generate-sitemap.js` (tạo, optional)

**Create:**
- `apps/web/src/components/WikiLink.jsx`
- `apps/web/src/utils/auto-wiki-link.js` (markdown plugin)
- `apps/web/src/utils/text-validator.js` (dev-only, lint copy)
- `apps/web/public/og/wiki-default.png` (asset)
- `apps/web/public/og/wiki-khong-dao.png` (7 ảnh tier 1)

## Implementation Steps

1. **Quick wins trước (không cần wait wiki build):**
   - rg tìm + fix em-dash, "tâm linh", "chữa lành" trong copy.
   - Update `pages.js` + `DEFAULT_DESC` + Home/About copy.
   - Commit riêng: `fix(copy): align terminology with Bất Tử Đạo rules (xoá em-dash, "tâm linh", "chữa lành")`.
2. Sau khi wiki landing có:
   - Update `PAGE_OG` thêm `wiki`.
   - Test crawler (`curl -A "facebookexternalhit"` → check meta).
3. Sau wiki tier 1 có content:
   - Extend ogRenderer detect `/wiki/:slug` → fetch `wiki_concepts`.
   - Generate OG image cho 7 tier 1 (design tay).
4. Sau wiki tier 2:
   - Extend ogRenderer detect `/wiki/nguyen-ly/:id` → fetch `wiki_nguyen_ly`.
   - Dynamic OG image option B (satori).
5. Internal linking:
   - Tạo `<WikiLink>` + markdown plugin.
   - Apply vào StoryDetail + KhaiTriDetail render.
   - Audit existing content: rg các thuật ngữ → kiểm tra story 1-24 + khai trí đang publish.
6. Sitemap + robots.
7. Test Lighthouse trên `/wiki`, `/wiki/khong-dao`, `/wiki/nguyen-ly/NL-018`.

## Todo List

**Quick wins (do first):**
- [ ] rg em-dash + fix
- [ ] rg "tâm linh" + replace
- [ ] rg "chữa lành" + replace ("xoá đi" nếu context ánh sáng)
- [ ] Update pages.js (4-5 line)
- [ ] Update functions/index.js DEFAULT_DESC
- [ ] Update Home/About copy
- [ ] Commit + deploy quick win

**Wiki SEO:**
- [ ] PAGE_OG cho wiki landing
- [ ] Static OG image cho 7 tier 1
- [ ] Dynamic OG cho wiki/:slug
- [ ] Dynamic OG cho wiki/nguyen-ly/:id
- [ ] Dynamic OG cho wiki/reasoning-patterns/:id

**Internal linking:**
- [ ] WikiLink component
- [ ] auto-wiki-link markdown plugin
- [ ] Apply vào StoryDetail
- [ ] Apply vào KhaiTriDetail
- [ ] Hover popup design

**Discovery:**
- [ ] sitemap.xml
- [ ] robots.txt
- [ ] generate-sitemap script (optional)
- [ ] Submit sitemap to Google Search Console

**Validation:**
- [ ] Lighthouse trên 3 wiki page > 95
- [ ] Facebook Debugger pass cho 3 wiki URL
- [ ] Zalo share preview pass
- [ ] Test rich snippet với schema.org markup (optional)

## Success Criteria

- Lighthouse SEO > 95 cho mọi wiki page.
- Facebook share `/wiki/khong-dao` → preview gold image + title "Không Đạo — Cốt lõi Bất Tử Đạo".
- Google `site:battudao.com Không Đạo` → wiki page xuất hiện trong vòng 2 tuần sau publish.
- `rg '(—|tâm linh|chữa lành)' apps/web` → 0 match (trừ memo/rule files).
- Internal link click rate từ stories → wiki concept > 5% (optional metric).

## Risk Assessment

- **Risk:** dynamic OG image fail trên Cloudflare Workers (satori cần WebAssembly). **Mitigation:** fallback về static default + text overlay HTML thuần.
- **Risk:** auto-wiki-link wrap quá nhiều, làm bài đọc bị spam. **Mitigation:** chỉ wrap lần đầu tiên xuất hiện; tối đa 5 link/article.
- **Risk:** fix anti-pattern ảnh hưởng câu chuyện đã viết. **Mitigation:** quick wins chỉ touch `pages.js` + meta — KHÔNG touch nội dung stories/khaitri/articles (anh duyệt từng cái).

## Security Considerations

- ogRenderer expose Firestore data — chỉ render data đã `published`/`publicOnWeb`. Code path đã verify ở `firestore.rules` + app layer.
- Internal linking không tạo XSS — `<WikiLink>` chỉ accept whitelisted `concept` slug, không inject arbitrary URL.

## Next Steps

Sau phase-05:
- Phase 6 future: i18n EN cho tier 2 (hiện chỉ tier 1 song ngữ).
- Phase 7 future: phân tích traffic, A/B test entry path.
- Audit định kỳ: hàng tháng rg anti-pattern lại để chắc không drift.
