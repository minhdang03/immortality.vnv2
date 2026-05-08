# Agent Auth & Write Flow — Best Practices

Best-practice guide cho goclaw Agent ghi `khaitri` lên Firestore của `immortality-vn`. Spec này không kèm code — chỉ contract + invariants.

## Authentication

### Strategy

Agent đăng nhập Firebase Auth bằng **email/password** của 1 account dành riêng cho Agent (vd `agent@battudao.com`), giống admin user thường. Sau khi signin, Firebase JS SDK gắn ID token vào mọi request → Firestore rules check `request.auth != null` → pass.

### Why not admin SDK?

| Admin SDK (rejected) | Auth client SDK (chosen) |
|---|---|
| Bypass rules, full power | Tuân rules, audit-able |
| Cần service account key file | Cần email/password (rotate dễ) |
| Phá invariant "Agent = 1 admin role" | Match design intent (admin panel cho Agent) |
| Leak key = full DB compromise | Leak password = limited blast (anh disable account ngay) |

### Credentials handling

- Store: `Claw/goclaw/.env` (gitignored) hoặc goclaw secret store
- Env vars (suggest):
  ```
  IMMORTALITY_AGENT_EMAIL=agent@battudao.com
  IMMORTALITY_AGENT_PASSWORD=<rotate-quarterly>
  IMMORTALITY_FIREBASE_API_KEY=<same as VITE_FIREBASE_API_KEY>
  IMMORTALITY_FIREBASE_AUTH_DOMAIN=immortalityvn.firebaseapp.com
  IMMORTALITY_FIREBASE_PROJECT_ID=immortalityvn
  ```
- **NEVER log password.** Logger redact regex `password|secret|token` → `***`.
- **NEVER commit `.env`.** `.gitignore` đã cover trong goclaw — verify.

### Sign-in lifecycle

- Agent signin **một lần** đầu session (long-lived process) → reuse ID token (auto-refresh by SDK)
- Per-invocation skill: signin trước batch processing, signout sau khi xong (giảm window token lộ)
- Token expiry: SDK tự refresh; Agent không cần manual handle

### Failure modes

| Failure | Handle |
|---|---|
| `auth/wrong-password` | Log error (KHÔNG log password), abort batch, alert anh |
| `auth/user-not-found` | Anh chưa tạo account → abort, instruct anh tạo |
| `auth/user-disabled` | Anh disable account (security event) → abort, KHÔNG retry |
| `auth/too-many-requests` | Backoff 60s, retry 1 lần; nếu fail tiếp → abort |
| Network error | Backoff 5s, retry 3 lần |

## Write flow

### Pseudocode (contract)

```
for file in glob('Claw/goclaw/inbox/khaitri/*.md'):
    try:
        front, body = parse_markdown(file)
        validate_schema(front, body)                    # see markdown-schema.md
        existing = query_by_sourceRef(front.sourceRef)
        if existing:
            if file_is_update_intent(file):
                update(existing.id, merge_fields(front, body))
                move file → inbox/khaitri/_done/
            else:
                log "skip: sourceRef exists"
                move file → inbox/khaitri/_done/
            continue
        doc = build_doc(front, body)
        addDoc('khaitri', doc)                          # createdAt = serverTimestamp
        move file → inbox/khaitri/_done/
    except ValidationError as e:
        write_error_log(file, e)
        move file → inbox/khaitri/_failed/
    except FirestoreError as e:
        # transient: leave file in inbox for retry next run
        log error, continue (do NOT move file)
```

### Idempotency (CRITICAL)

**Invariant:** chạy lại publisher trên cùng 1 file = exactly 0 doc mới.

Implementation:
1. Trước mỗi `addDoc`, query: `where('sourceRef', '==', front.sourceRef).limit(1)`
2. Nếu trả về kết quả → SKIP insert, move file → `_done/`
3. Nếu không → insert + move file → `_done/`

Race condition (2 Agent chạy song song trên cùng file): single-instance lock — file system mutex hoặc Agent runtime đảm bảo 1 worker / file. Goclaw nên có pattern này sẵn.

### Update mode (Option B từ markdown-schema)

Agent support update flow để cho phép:
- File VI-only ghi entry trước
- File EN sau update cùng `sourceRef` thêm `en.*` field

Detection: file frontmatter có `update: true` field, hoặc — Agent thấy `sourceRef` đã exists thì auto update merge thay vì skip. **Chọn auto-merge** (KISS):

```
if existing:
    merged = { ...existing, ...new_fields, updatedAt: serverTimestamp() }
    update(existing.id, merged)
```

⚠️ **Caveat:** auto-merge sẽ overwrite field cũ với field mới. Nếu admin đã sửa entry trong UI, file inbox cũ post lại sẽ clobber. Mitigation:
- Agent KHÔNG re-process file đã ở `_done/` (filename or hash check)
- Mỗi file ⟷ 1 sourceRef ⟷ 1 lần process. File mới = sourceRef mới HOẶC explicit `update: true` flag.

Recommend: support cả auto-merge VÀ explicit `update: true` flag. Mặc định = explicit (tránh clobber). Anh chốt.

### Concurrency với admin user

Admin (anh) có thể đang sửa `khaitri` doc đúng lúc Agent ghi. Firestore handle update race ổn (last-write-wins on field level với `updateDoc`, dot-notation merge với `setDoc({merge: true})`). Agent SHOULD:
- Dùng dot-notation update khi có thể: `updateDoc(ref, { 'en.title': '...' })` — tránh clobber `vi` block
- KHÔNG fetch-modify-write toàn doc (race với admin Inline edit)

`KhaiTriDetail.jsx:14-19` xác nhận pattern này — admin's InlineEdit cũng dùng dot-notation đúng lý do.

## Validation pipeline

Trước khi `addDoc` HOẶC `updateDoc`, Agent verify:

1. **Schema:** all required fields present (xem `markdown-schema.md` § Validation checklist)
2. **Dup check:** query `sourceRef` — handle accordingly
3. **Order sanity:** nếu `order` trùng entry khác (warning, không block) — log "order collision: docId X already has order N"
4. **Body sanity:** body có ≥ 1 cặp `Hỏi:`/`Đáp:` hoặc `Question:`/`Answer:`
5. **Status guard:** `status` ∈ `{undefined, 'draft'}`. Reject `published`.

Fail validation → file → `_failed/<sourceRef>.md` + sibling `<sourceRef>.error.txt` (lý do fail).

## Error handling matrix

| Error class | Action |
|---|---|
| Validation (pre-write) | Move file `_failed/`, write `.error.txt`, continue batch |
| Auth error | Abort batch, alert anh |
| Firestore permission denied | Abort batch (rules đã đổi?) |
| Firestore transient (network) | Leave file in inbox, retry next run |
| Firestore quota exceeded | Backoff exp, retry 3x; nếu fail → abort |
| Unknown | Move file `_failed/`, dump stack trace, continue batch |

## Logging

Each Agent run produce report:
```
Claw/goclaw/inbox/khaitri/_logs/run-YYYYMMDD-HHMMSS.log
```

Format suggest:
```
[2026-05-03 13:02:15] auth: signed in as agent@battudao.com
[2026-05-03 13:02:16] file: khaitri-2026-05-03-001.md
[2026-05-03 13:02:16]   parse: OK (frontmatter: 11 fields, body: 542 chars)
[2026-05-03 13:02:16]   validate: OK
[2026-05-03 13:02:16]   dup-check: no existing sourceRef
[2026-05-03 13:02:17]   write: addDoc('khaitri') → docId=abc123
[2026-05-03 13:02:17]   move: → _done/
[2026-05-03 13:02:18] batch summary: 1 success, 0 failed, 0 skipped
[2026-05-03 13:02:18] auth: signed out
```

## Smoke test (anh chạy sau khi deploy Agent)

1. Drop file `khaitri-test-001.md` (sourceRef unique) vào inbox
2. Run Agent skill (manual trigger)
3. Verify:
   - File moved to `_done/`
   - Firestore Console → `khaitri` collection → doc mới với đúng schema
   - Admin panel `/admin` → KhaiTriTab → entry hiện trong list, edit OK
   - `status: 'draft'` (nếu Fix A đã apply trong UI: KHÔNG hiển thị public; nếu chưa: hiển thị public — chấp nhận hoặc bump `order`)
4. Re-run Agent same file (sau khi đã ở `_done/`) → expect 0 doc mới
5. Đặt lại file vào inbox → re-run → expect skip (sourceRef dup) → file → `_done/` (không tạo doc)

## Security checklist

- [ ] Agent credentials trong `.env`, NOT committed
- [ ] Logger redact password/token
- [ ] Agent process KHÔNG accessible từ public (run trong goclaw container, không expose port)
- [ ] Firestore rules audit: `khaitri` write chỉ require `request.auth != null` (current). Nếu siết → cần claim `admin==true` hoặc `role=='agent'` (TODO).
- [ ] Email/password rotation: hằng quý hoặc mỗi sự cố nghi leak
- [ ] Audit field `source` + `createdAt` đủ cho "ai ghi entry này lúc nào" — nếu cần thêm chi tiết, log riêng `agent_writes` collection (defer v2)

## Anti-patterns to reject

- ❌ Agent dùng admin SDK + service account key
- ❌ Agent gọi backend Firebase Function ingest endpoint mới (overkill — Firestore client SDK đủ)
- ❌ Agent set `status: 'published'` trực tiếp
- ❌ Agent ghi đè `vi.title` của entry đã exists trừ khi explicit update intent
- ❌ Agent process file đã ở `_done/` lần thứ 2
- ❌ Agent loop polling inbox với interval ngắn — manual trigger v1 (D3 trong fly0-publisher pattern); cron / watch defer v2
- ❌ Agent log full doc body (PII không, nhưng noise log → grep khó)
