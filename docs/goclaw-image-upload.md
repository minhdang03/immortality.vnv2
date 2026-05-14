# Goclaw → CMS image upload API

Spec for Phi Thuyền Illustrator (or any goclaw agent) to publish images that get
stamped onto immortality-vn article / khaitri docs.

## Why this exists

`create_image` tool (minimax / byteplus / dashscope) returns a Telegram-hosted URL
which expires. To survive on battudao.com we copy the bytes to Firebase Storage
(5 GB free tier; migrate to R2 later when needed).

## Architecture: route through CMS API (NOT direct Storage upload)

Agents go through `/api/upload-from-url` on battudao.com — same auth + audit
surface as the rest of the CMS API:

```
[goclaw agent]                                            [Vercel /api]                  [Firebase]
     │
     │  1. tool: create_image
     ├─────►  Telegram CDN (temp URL)
     │
     │  2. signInWithPassword(agent@battudao.com)
     ├─────────────────────────────────────────►  Auth
     │  ◄─────────  idToken (1 h)
     │
     │  3. POST /api/upload-from-url
     │     Authorization: Bearer <idToken>
     │     Body: { url, intent, slug }
     ├─────────────────────────────────────►  upload-from-url
     │                                              │
     │                                              │  fetch(telegramUrl) → bytes
     │                                              │  validate (size, mime, path)
     │                                              │  bucket.file(path).save(bytes)
     │                                              │  agent_log.add(...)
     │                                              ▼
     │  ◄─────────  { ok, url: "<permanent>", path, bytes, contentType }
     │
     │  4. Firestore write { image: "<permanent url>", ...rest }
     │     (also via /api/articles or /api/khaitri)
     ▼
   done
```

Benefits over direct Firebase Storage upload:
- Centralized validation (size cap 8 MB, mime allowlist, path policy)
- Per-upload audit row in `/agent_log`
- Decouples agent from storage backend (Firebase → R2 later: only API changes)
- Same Bearer token surface as other CMS endpoints

## Required goclaw config

| Key | Value | Where |
|---|---|---|
| `FIREBASE_API_KEY` | Web API key | Firebase Console → Project Settings → General |
| `AGENT_EMAIL` | `agent@battudao.com` | goclaw config |
| `AGENT_PASSWORD` | (provided once on bootstrap) | goclaw secret manager |
| `CMS_BASE_URL` | `https://battudao.com` | goclaw config |

The agent does NOT need direct Storage credentials — only the Firebase Auth
ID token, which battudao.com verifies on every API call.

## API contract

`POST /api/upload-from-url`

Headers:
- `Authorization: Bearer <firebase-id-token>`
- `Content-Type: application/json`

Body:
```json
{
  "url": "https://api.telegram.org/file/bot.../photos/x.jpg",
  "intent": "article" | "khaitri",
  "slug": "phi-thuyen-mat-ngu-2026"
}
```

Constraints:
- `url` must return one of `image/png`, `image/jpeg`, `image/webp`, `image/gif`
- Max size: 8 MB
- `intent` decides folder: `articles/` or `khaitri/`
- `slug` is sanitized to `[a-z0-9-]`, max 80 chars; timestamp appended

Success (200):
```json
{
  "ok": true,
  "url": "https://firebasestorage.googleapis.com/v0/b/.../o/articles%2Fmy-slug-1730000000000.jpg?alt=media&token=...",
  "path": "articles/my-slug-1730000000000.jpg",
  "bytes": 234567,
  "contentType": "image/jpeg"
}
```

Errors (JSON `{ ok: false, error, detail }`):
- 400 `missing_url` / `invalid_intent` / `path_not_allowed`
- 400 `public_url_required` — body `url` was `data:`/`blob:`/`file:`; use `/api/upload-file` (see below)
- 401 `missing_bearer_token` / `invalid_token`
- 403 `forbidden` (email not in agent allowlist)
- 413 `payload_too_large` (>8 MB)
- 415 `unsupported_content_type`
- 422 `source_fetch_failed` (4xx from source URL)
- 422 `source_fetch_blocked` (SSRF guard — private IP, DNS failure, redirect to non-public host)
- 500 `upload_failed`

### Alternative: `POST /api/upload-file` (raw bytes — for local images)

Use when the agent already has the image bytes locally (e.g. generated in workspace
by `create_image`) and has no public URL to point at. Avoids base64-inflated payload
(and the SSRF guard that blocks `data:` URLs in `/api/upload-from-url`).

Headers:
- `Authorization: Bearer <firebase-id-token>`
- `Content-Type: image/png | image/jpeg | image/webp | image/gif`
- `X-Intent: article | khaitri`
- `X-Slug: <kebab-slug>` (optional)

Body: raw image bytes (≤ 8 MB; Vercel platform may cap lower — downscale if 413).

Success (200): same shape as `/api/upload-from-url`.

Errors:
- 400 `invalid_intent` (missing/invalid `X-Intent`) / `empty_body`
- 401 / 403 same as above
- 413 `payload_too_large` (Vercel platform limit OR 8 MB internal cap)
- 415 `unsupported_content_type`
- 500 `upload_failed` / `r2_not_configured`

## Step 2: signIn (Go pseudocode)

```go
type signInResp struct { IDToken, RefreshToken, LocalID string }

func signIn(email, password, apiKey string) (*signInResp, error) {
  body, _ := json.Marshal(map[string]any{
    "email": email, "password": password, "returnSecureToken": true,
  })
  resp, _ := http.Post(
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key="+apiKey,
    "application/json",
    bytes.NewReader(body),
  )
  // parse JSON → return IDToken
}
```

ID tokens expire in 1 h. Refresh via `/v1/token?key=<apiKey>` body
`grant_type=refresh_token&refresh_token=<rt>`.

## Step 3: call upload-from-url (Go pseudocode)

```go
func uploadFromUrl(idToken, sourceUrl, intent, slug string) (string, error) {
  body, _ := json.Marshal(map[string]string{
    "url": sourceUrl, "intent": intent, "slug": slug,
  })
  req, _ := http.NewRequest("POST", "https://battudao.com/api/upload-from-url", bytes.NewReader(body))
  req.Header.Set("Authorization", "Bearer " + idToken)
  req.Header.Set("Content-Type", "application/json")
  resp, _ := http.DefaultClient.Do(req)
  // decode JSON → return r.url
}
```

## Step 4: stamp image URL into article doc

Already documented in `docs/goclaw-articles-api.md` (or use existing
`/api/articles` POST/PUT). Pass `image: "<permanent url>"` in body.

## Path conventions (server-enforced)

| Intent | Resulting path |
|---|---|
| `intent: "article"`, `slug: "phi-thuyen-mat-ngu"` | `articles/phi-thuyen-mat-ngu-1730000000000.jpg` |
| `intent: "khaitri"`, `slug: "01-cau-hoi"` | `khaitri/01-cau-hoi-1730000000000.png` |

Timestamp avoids overwrites on re-runs. Slug is sanitized server-side
(strip diacritics, lowercase, max 80 chars).

## Storage backend: Cloudflare R2

Object key layout (bucket shared across projects, prefixed by app):
```
<bucket>/immortality-vn/articles/<slug>-<timestamp>.<ext>
<bucket>/immortality-vn/khaitri/<slug>-<timestamp>.<ext>
```

Public URL format: `<R2_PUBLIC_URL>/<key>` — e.g.
`https://pub-xxx.r2.dev/immortality-vn/articles/foo-1730000000000.jpg`

R2 free tier:
- 10 GB storage
- Unlimited egress (vs Firebase 1 GB/day)
- 10 M Class B (read) operations/month
- 1 M Class A (write) operations/month — plenty for content site

Why R2 over Firebase Storage: Firebase Storage now requires Blaze (paid)
plan with credit card to enable. R2 free tier needs no card.

## Test the flow

```bash
cd /Users/dang/Documents/ClaudeCode/apps/immortality-vn
FIREBASE_API_KEY=<web-key> \
AGENT_EMAIL=agent@battudao.com \
AGENT_PASSWORD=<pass> \
node functions/scripts/test-upload-image.js
```

Default sample image from picsum. Pass any URL as 1st arg to test specific
source (e.g. a Telegram URL during integration testing):

```bash
node functions/scripts/test-upload-image.js https://api.telegram.org/file/bot.../photos/x.jpg
```

## Failure handling guidance

| Failure | Suggested response |
|---|---|
| signIn 400 `INVALID_PASSWORD` | Halt, alert ops — credentials drifted |
| Telegram URL 404 | Re-run `create_image` (some providers expire fast) |
| API 401/403 | Re-signIn for fresh token; if still 403 check `/admins/<uid>.role === 'agent'` |
| API 413 `payload_too_large` | Resize/compress before sending (or accept upstream optimization) |
| API 415 `unsupported_content_type` | Convert to PNG/JPEG before passing to API |
| API 5xx | Retry 2× with backoff; on 3rd fail, stamp empty image, queue retry |

## Migration to R2 later (when free tier insufficient)

1. Mass-copy `gs://immortalityvn.firebasestorage.app/{articles,khaitri}/*` → R2
   bucket via `rclone`
2. Update `/api/upload-from-url` to upload to R2 (S3 SDK) instead of Firebase
   Storage
3. Update existing article URLs in Firestore via admin script (rewrite domain)
4. Goclaw side: zero changes (still calls same API endpoint)

R2: unlimited egress (free), $0.015/GB/month storage.

## Required Vercel env vars (already configured)

| Env var | Purpose |
|---|---|
| `FIREBASE_ADMIN_SA_B64` | Service account JSON (base64) — for Firestore writes + Auth verify |
| `AGENT_ALLOWLIST_EMAILS` | Emails permitted to call CMS API (default: `agent@battudao.com`) |
| `R2_ACCOUNT_ID` | Cloudflare account id |
| `R2_ACCESS_KEY_ID` | R2 API token |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET_NAME` | Shared bucket name |
| `R2_PUBLIC_URL` | Public URL prefix (r2.dev or custom domain) |
| `R2_KEY_PREFIX` | Project namespace (default: `immortality-vn`) |
