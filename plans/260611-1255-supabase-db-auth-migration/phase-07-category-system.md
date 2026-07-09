# Phase 07 — Category System (Relational, Parent-Child) + Migrate Topics

## Context Links
- Brainstorm §5 (relational categories solve "khó quản lý"): ../reports/brainstorm-260611-1244-supabase-db-auth-migration-reading-analytics.md
- Schema: phase-01 `0003_taxonomy.sql` (categories + content_categories)
- Topics staging output: phase-02 `transforms/topics-stage.mjs`
- Current topics hook + page: ../../apps/web/src/hooks/useTopics.js ; ../../apps/web/src/pages/content/ (topic route)
- Page registry: ../../apps/web/src/config/pages.js

## Overview
- **Priority:** P2 (depends on 04; replaces flat `topics`)
- **Status:** pending
- **Description:** Replace the flat Firestore `topics` collection with relational Postgres `categories` (self-referencing parent-child). Add admin CRUD for categories and a browse-by-category UI. Migrate existing topics → categories, preserving the old `topic/:id` route via slug_redirects.

## Key Insights
- Firestore made parent-child hard (the original complaint). Postgres self-FK (`parent_id`) makes hierarchy trivial — this is a core reason for the migration.
- Existing content references topic by a flat field. Map each old topic → a category id; set `content.category_id` (and/or `content_categories` for multi-category). Keep old `topic/:id` URLs working via slug_redirects → category.
- Browse UI: list top-level categories → expand children → filter content. Reuse existing list/card components; only the data source + nav changes.
- KISS: start single category per content (`content.category_id`). Use `content_categories` join only if Đăng confirms multi-category need (YAGNI until then).

## Requirements
**Functional**
- `categories`: id, parent_id (nullable self-FK), vi_name, en_name, slug, order.
- Admin CRUD: create/edit/delete/reorder; assign parent; prevent cycles.
- Browse UI: hierarchical category nav + per-category content listing (bilingual).
- Migrate topics → categories; map content.category_id; redirect old topic URLs.

**Non-functional**
- Files <200 lines; reuse existing card/list components.
- Cycle prevention on parent assignment (no category is its own ancestor).

## Architecture
```
categories(id, parent_id→categories.id, vi_name, en_name, slug, order)
content.category_id → categories.id   (single category; join table optional)
Admin: useCategories() CRUD via supabase-js (RLS admin)
Browse: /category/:slug → list children + content where category_id in subtree
Migration: topics-stage output → insert categories (preserve id where possible)
           → set content.category_id → slug_redirects(old topic slug → category)
```
**Data flow:** topics dump → categories rows → content.category_id backfill → browse UI queries by category subtree.

## Related Code Files
**Create**
- `apps/web/src/hooks/useCategories.js` (read + CRUD via supabase-js)
- `apps/web/src/pages/content/category-browse-page.jsx` (hierarchical browse)
- `apps/web/src/pages/admin/category-manager-page.jsx` (admin CRUD + reorder + parent assign)
- `apps/web/src/components/category-tree.jsx` (recursive parent-child renderer)
- `scripts/migrate/transforms/topics-to-categories.mjs` (consumes topics-stage; inserts categories + backfills content.category_id + writes slug_redirects)

**Modify**
- `apps/web/src/hooks/useTopics.js` (re-point to categories OR deprecate; keep export shape if components consume it)
- `apps/web/src/config/pages.js` (add `category/:slug`, admin category manager; keep `topic/:id` → redirect)
- Any component reading `topic` field → read category (only if shape differs; prefer mapping in hook)

**Delete** (at phase-08)
- Firestore `topics` reads (collection retired with cutover)

## Implementation Steps
1. `topics-to-categories.mjs`: read staged topics → insert `categories` (flat first; parent_id null), preserve ids where feasible; backfill `content.category_id`; write `slug_redirects(old topic slug → category slug)`.
2. `useCategories.js`: list (with hierarchy), create/edit/delete/reorder, assign parent (cycle check).
3. `category-tree.jsx`: recursive renderer for nav + admin tree.
4. `category-manager-page.jsx`: admin CRUD UI (role-gated).
5. `category-browse-page.jsx`: `/category/:slug` → show children + content in subtree (bilingual).
6. Register routes in `pages.js`; map old `topic/:id` to category (via slug_redirects resolver) so shared links survive.
7. Re-point/deprecate `useTopics.js` keeping component contract.
8. QA: every old topic link resolves; admin can build a 2-level hierarchy; content lists under correct category.

## Todo List
- [ ] `topics-to-categories.mjs` (insert categories, backfill content.category_id, slug_redirects)
- [ ] `useCategories.js` (read + CRUD + cycle-safe parent assign)
- [ ] `category-tree.jsx` recursive renderer
- [ ] `category-manager-page.jsx` admin CRUD
- [ ] `category-browse-page.jsx` browse-by-category
- [ ] Routes in pages.js; old topic/:id → category redirect
- [ ] Re-point/deprecate useTopics keeping contract
- [ ] QA: old links resolve; 2-level hierarchy works

## Success Criteria
- Categories are relational parent-child; admin can CRUD + reorder + nest.
- All content mapped to a category; browse-by-category UI works bilingual.
- Every old `topic/:id` link resolves (direct or redirect) — no broken shares/SEO.
- topics collection no longer read by the app after cutover.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Old topic links break | Med | High | slug_redirects topic→category; resolver in router; QA all topic URLs |
| Category cycles via bad parent assign | Med | Med | Ancestor check on parent set; reject cycle |
| Content unmapped (orphan category) | Med | Med | Migration report flags content with no category; default "Uncategorized" |
| Over-engineering multi-category | Low | Low | Single category_id first (YAGNI); join table only if Đăng confirms need |

## Security Considerations
- Category CRUD admin-gated via RLS (role from phase-03).
- Browse is public read (categories public SELECT per phase-01).

## Next Steps
- Verified in phase-08 (link parity includes topic→category redirects).
- Depends on phase-02 (topics staged), phase-04 (supabase data layer).
- Open: confirm with Đăng whether multi-category per content is needed (default no).
