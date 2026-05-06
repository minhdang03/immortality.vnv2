# Goclaw → Firebase Storage image upload

Spec for Phi Thuyền Illustrator (or any goclaw agent) to publish images that get
stamped onto immortality-vn article / khaitri docs.

## Why this exists

`create_image` tool (minimax / byteplus / dashscope) returns a Telegram-hosted URL
which expires. To survive on battudao.com we need to copy the bytes to Firebase
Storage (5 GB free tier, lasts until usage > limit, then migrate to R2).

## Flow (Path 1 — direct upload, no Vercel function)

```
[goclaw agent]                                                      [Firebase]
     │
     │  1. tool: create_image
     ├─────────────────────────────────►  Telegram CDN (temp URL)
     │
     │  2. signInWithPassword
     ├─────────────────────────────────►  Auth API
     │  ◄────────────────  idToken (1 h)
     │
     │  3. GET telegramUrl
     ├─────────────────────────────────►  Telegram CDN
     │  ◄────────────────  bytes
     │
     │  4. POST /v0/b/<bucket>/o?name=articles/<file>
     │     Authorization: Bearer <idToken>
     │     Content-Type: image/png
     ├─────────────────────────────────►  Storage REST
     │  ◄────────────────  { downloadTokens: "..." }
     │
     │  → permanent URL = https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<path>?alt=media&token=<token>
     │
     │  5. Firestore write
     │     { image: "<permanent URL>", ...rest }
     ├─────────────────────────────────►  Firestore
     │  ◄────────────────  doc id
     ▼
   done
```

## Required goclaw config

| Key | Value | Where stored |
|---|---|---|
| `FIREBASE_API_KEY` | Web API key (public, safe in config) | Firebase Console → Project Settings → General |
| `AGENT_EMAIL` | `agent@battudao.com` | goclaw config |
| `AGENT_PASSWORD` | (provided once on bootstrap) | goclaw secret manager |
| `FIREBASE_STORAGE_BUCKET` | `immortalityvn.firebasestorage.app` | goclaw config |
| `FIRESTORE_PROJECT_ID` | `immortalityvn` | goclaw config |

## Step 2: signIn (Go pseudocode)

```go
type signInResp struct { IDToken, RefreshToken, LocalID string }

func signIn(email, password, apiKey string) (*signInResp, error) {
  body, _ := json.Marshal(map[string]any{
    "email": email, "password": password, "returnSecureToken": true,
  })
  resp, err := http.Post(
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key="+apiKey,
    "application/json",
    bytes.NewReader(body),
  )
  // parse JSON → return idToken
}
```

ID token expires after 1 h. Cache + refresh via `/v1/token?key=<apiKey>` body
`grant_type=refresh_token&refresh_token=<rt>`.

## Step 4: upload (Go pseudocode)

```go
func uploadToStorage(bucket, path string, bytes []byte, contentType, idToken string) (string, error) {
  url := fmt.Sprintf(
    "https://firebasestorage.googleapis.com/v0/b/%s/o?name=%s",
    bucket, urlencode(path),
  )
  req, _ := http.NewRequest("POST", url, bytes.NewReader(bytes))
  req.Header.Set("Authorization", "Bearer " + idToken)
  req.Header.Set("Content-Type", contentType)
  resp, err := http.DefaultClient.Do(req)
  // parse JSON → returns { downloadTokens: "<token>", name: path, ... }
  token := j["downloadTokens"]
  return fmt.Sprintf(
    "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media&token=%s",
    bucket, urlencode(path), token,
  ), nil
}
```

## Path conventions

| Article asset | Path |
|---|---|
| Article hero | `articles/<articleId-or-slug>-<timestamp>.<ext>` |
| Khai Trí hero | `khaitri/<id-or-slug>-<timestamp>.<ext>` |

Timestamp avoids overwrites on re-runs. Slug ensures human-readable.

## Storage rules in effect

`storage.rules` (deployed when `firebase deploy --only storage` runs):

```
match /articles/{file=**}  → write: admin | agent | mod-articles
match /khaitri/{file=**}   → write: admin | agent | mod-khaitri
all paths                  → read: public
```

Agent role checks the `/admins/{uid}.role` field in Firestore.

## Test the flow before goclaw integration

```bash
cd /Users/dang/Documents/ClaudeCode/apps/immortality-vn
FIREBASE_API_KEY=<web-key> \
AGENT_EMAIL=agent@battudao.com \
AGENT_PASSWORD=<pass> \
node functions/scripts/test-upload-image.js
```

This signs in as the agent, downloads a sample image from picsum, uploads it,
and prints the permanent URL. Pass any URL as 1st arg to test specific source:

```bash
node functions/scripts/test-upload-image.js https://api.telegram.org/file/bot.../photos/x.jpg
```

## Migration path to R2 (later, when Firebase free tier insufficient)

When traffic grows past free tier (~1 GB/day download from Storage):

1. Mass-copy `gs://immortalityvn.firebasestorage.app/articles/*` → R2 bucket via `rclone`
2. Update goclaw `bucket` env to R2 endpoint (R2 supports S3 API)
3. Rewrite article URLs in Firestore (admin SDK script). Keep both URLs for grace period via Vercel rewrite.

R2 has unlimited egress (free), so no bandwidth cap. ~$0.015/GB/month for storage.

## Failure handling guidance for goclaw

| Failure | Suggested response |
|---|---|
| signIn returns 400 `INVALID_PASSWORD` | Halt, alert ops — credentials drifted |
| Telegram URL 404 | Re-run `create_image` (some providers expire fast) |
| Storage 403 `permission_denied` | Check `/admins/<uid>.role === 'agent'`. Token refresh may be needed |
| Storage 5xx | Retry 2× with backoff; on 3rd fail, leave article without image (`image: ''`), schedule re-upload job |
| Bandwidth exceeded | Stop upload loop, alert ops to evaluate R2 migration |

## Out of scope (future)

- Resize/optimize before upload (WebP @ 75% quality, max 1600px)
- Multi-resolution variants (`<picture>` + srcset)
- CDN proxy via Vercel for cache-edge serving (saves Firebase bandwidth)
