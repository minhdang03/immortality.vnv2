---
title: "Immortality Publisher — Spec & Best Practices"
description: "Contract spec for goclaw Agent posting Khai Trí (and later: articles, stories) to immortality-vn Firestore. Spec only — no code in this plan; Agent + skill provided externally."
status: spec-only
priority: P2
scope: cross-app (immortality-vn ⟵ goclaw)
created: 2026-05-03
owner: Dang
deliverable: documentation contract
---

# Immortality Publisher — Spec

## Goal

Define a stable **contract** so a goclaw Agent (with Firebase Auth credentials anh provides separately) can post **Khai Trí** Q&A entries into `immortality-vn` Firestore as `draft`, ready for human review in admin panel.

## Non-goals

- KHÔNG code skill goclaw (anh tự build / đưa cho Agent)
- KHÔNG tạo Firebase Auth account (anh tự tạo, đưa credentials cho Agent qua env)
- KHÔNG xây ingest HTTP endpoint mới — Agent dùng Firebase JS SDK trực tiếp như admin user thường
- KHÔNG đụng `firestore.rules` — current rule (`request.auth != null`) đã đủ cho v1

## Architecture (one-liner)

```
[goclaw inbox/<file>.md] → [Agent skill] → signin Firebase Auth (agent@…)
                                         → Firestore.add('khaitri', doc)
                                         → move file → inbox/_done/
```

Anh review trong admin (`KhaiTriTab.jsx`) → publish (xoá field `status` hoặc set `published`).

## Deliverables (in this plan dir)

| File | Mục đích | Audience |
|---|---|---|
| `plan.md` | overview (file này) | anh + Agent |
| `markdown-schema.md` | YAML frontmatter + body convention cho file inbox | CoWork (writer) + Agent (parser) |
| `firestore-schema.md` | shape doc Firestore `khaitri` Agent phải ghi đúng | Agent (writer) |
| `agent-auth-and-write-flow.md` | flow signin + write + idempotency + error handling | Agent implementer |
| `content-guidelines-khaitri.md` | rule chưng cất transcript → Q&A entry, voice/length/song ngữ | CoWork (writer) |

## Phases

| # | Phase | Status | Owner |
|---|-------|--------|-------|
| 1 | Khoá schema markdown + Firestore | ✅ done | Claude |
| 2 | Best practice content (chưng cất Khai Trí) | ✅ done | Claude |
| 2.5 | Fix A — filter `status: 'draft'` khỏi public KhaiTriPage (`App.jsx:195`) | ✅ done 2026-05-03 | Claude |
| 3 | Anh tạo Firebase Auth account `agent@…` + lưu credentials | pending | Dang |
| 4 | Skill goclaw `immortality-publisher` (Node ESM) — `Claw/goclaw/skills/immortality-publisher/`. Credentials qua CLI args / stdin JSON (preferred) / env (fallback) — phù hợp goclaw agent credential store pattern | ✅ done 2026-05-03 (dry-run pass) | Claude |
| 5 | E2E test: 1 file inbox → 1 doc Firestore status=draft → admin review OK | pending (đợi anh fill `.env`) | Dang |

## Key decisions (locked 2026-05-03)

| # | Decision | Choice |
|---|----------|--------|
| D1 | Auth model | Firebase Auth email/password — Agent dùng Firebase JS SDK như admin programmatic |
| D2 | Write path | Direct Firestore client SDK (KHÔNG ingest endpoint, KHÔNG admin SDK) |
| D3 | Default doc state | `status: 'draft'` — admin review trước khi publish |
| D4 | Idempotency | Field `sourceRef` (vd `transcript-2026-05-03-001`) — Agent check exists trước khi `addDoc` |
| D5 | File format | Markdown + YAML frontmatter, 1 file = 1 entry Khai Trí |
| D6 | Inbox location | `Claw/goclaw/inbox/khaitri/` (tách prefix khỏi `inbox/` của fly0) |
| D7 | Song ngữ | VI required, EN optional — empty string nếu chưa dịch |
| D8 | Source attribution | Field `source: 'goclaw-publisher-v1'` để filter trong admin |

## Open questions (đợi anh)

1. Agent có quyền **publish trực tiếp** không, hay luôn chỉ tạo `draft`? (D3 mặc định draft; mở publish quyền sau)
2. Khi `firestore.rules` siết lại bằng custom claim (TODO trong CLAUDE.md), Agent cần claim gì? (`role=='agent'` hay `admin==true`?)
3. Có cần audit log riêng (collection `agent_writes`) không, hay đủ với `source` + `createdAt` field?
4. Inbox đặt ở `Claw/goclaw/inbox/khaitri/` (Claw repo) hay `apps/immortality-vn/inbox-khaitri/` (target app repo)? — em chọn trong Claw để Agent control file lifecycle, nhưng anh có thể prefer target app.

---

**Spec status:** v1 draft — review xong em update lock.
