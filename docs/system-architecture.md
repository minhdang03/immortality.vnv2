# Bất Tử Đạo — System Architecture

## Overview

Four-layer hybrid platform architecture: **UX Layer → Content/Services Layer → Backend Infrastructure → Source of Truth**.

```
┌──────────────────────────────────────────────────────────────────┐
│ LAYER 1: UX (Multi-platform)                                     │
├──────────────────────────────────────────────────────────────────┤
│ iOS App (Expo RN)  │ Android App (Expo RN)  │ Web PWA (React)    │
│ WebView Component  │ WebView Component      │ Vite SPA           │
│ Native Navigation  │ Native Navigation      │ Progressive Web    │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ LAYER 2: CONTENT & SERVICES (Features)                           │
├──────────────────────────────────────────────────────────────────┤
│ FREE TIER (All Platforms):                                       │
│ • Hub (Home feed)                                                │
│ • Tự Khai Trí (Learning tracks)                                  │
│ • Đối thoại sâu (Q&A threads)                                    │
│ • Forum Q&A (Voting system)                                      │
│ • Bay Cùng (User profiles)                                       │
│ • Phá Nô Lệ (Resources)                                          │
│ • Trao Đổi NLTT (Workshops & booking)                            │
│ • Knowledge base (Articles via WebView)                          │
│ • Practice journal (Audio learning)                              │
│                                                                  │
│ PAID TIER (Deferred):                                            │
│ • AI Hỏi Ngược: 99K/tháng (Claude-powered reflection)           │
│ • 1-on-1 coaching: 2-5tr (Deferred indefinitely)                │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ LAYER 3: BACKEND INFRASTRUCTURE                                  │
├──────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ Cloudflare Workers Ecosystem:                               │  │
│ ├─────────────────────────────────────────────────────────────┤  │
│ │ • workers/api (Hono REST)                                   │  │
│ │   - Profiles: GET, PATCH                                    │  │
│ │   - Questions: GET, POST (with pagination)                  │  │
│ │   - Answers: POST, DELETE                                   │  │
│ │   - Votes: POST (Q&A voting)                                │  │
│ │   - Comments: GET, POST                                     │  │
│ │   - Auth: Firebase token validation + custom claims         │  │
│ │                                                              │  │
│ │ • workers/realtime (Durable Objects)                        │  │
│ │   - WebSocket chat protocol                                 │  │
│ │   - Slow-mode: 1 msg per 2 seconds                         │  │
│ │   - Ephemeral: 5-min idle TTL, no persistence              │  │
│ │   - Presence broadcast (anon user ID)                       │  │
│ │   - Typing indicators                                       │  │
│ │                                                              │  │
│ │ • workers/notion (Cron jobs)                                │  │
│ │   - Daily sync: Notion DB → Firestore                       │  │
│ │   - Claude API: AI hỏi ngược (reflection suggestions)      │  │
│ │   - Skill: btd-comment-facebook v0.2                        │  │
│ │                                                              │  │
│ │ • workers/config (R2 media storage)                         │  │
│ │   - Shared bucket with project key prefix                   │  │
│ │   - Images, audio, video uploads                            │  │
│ │                                                              │  │
│ │ Storage: Firebase (Auth, Firestore)                         │  │
│ │         R2 (Media)                                          │  │
│ │         FCM (Web push, mobile push)                         │  │
│ └─────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ LAYER 4: SOURCE OF TRUTH (Data & Configuration)                  │
├──────────────────────────────────────────────────────────────────┤
│ • Firestore Collections:                                         │
│   - articles, stories, khaitri, topics, teachings, practices    │
│   - questions, answers, comments, votes                         │
│   - user profiles, subscriptions                                │
│   - settings, translations/{lang}                               │
│                                                                  │
│ • Notion Database:                                              │
│   - Master content inventory                                    │
│   - Synced daily to Firestore via workers/notion cron          │
│                                                                  │
│ • Claude API:                                                   │
│   - AI hỏi ngược feature (skill btd-comment-facebook v0.2)    │
│   - Reflection suggestions on user comments                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: User Experience (Multi-platform)

### Web PWA (apps/web/)
- **Framework:** Vite 5 + React 18 SPA
- **PWA features:**
  - Service Worker v3 (precaching, offline fallback)
  - manifest.json (installable web app)
  - FCM web push notifications
  - Theme toggle (dark/light)
- **Routing:** History API client-side SPA routing
- **Code-splitting:** Lazy-loaded pages, Firebase/React chunks
- **Security:** Firebase Auth, Firestore security rules

### Mobile (apps/mobile/)
- **Framework:** Expo SDK 54, React Native 0.76
- **Navigation:** Expo Router (file-based routing)
- **Platform support:** iOS (TestFlight → App Store) + Android (Google Play)
- **Content rendering:**
  - Native components for navigation, forms, lists
  - WebView for rich articles/teachings (content reuse from web)
- **Native capabilities:**
  - Camera (for practice photos/videos)
  - Microphone (for audio journal)
  - Push notifications (FCM + native)
  - Local storage (AsyncStorage)
  - Deep linking (Expo Linking)
- **Zero custom Swift/Kotlin:** WebView eliminates platform-specific code

### Shared Design System
- **packages/ui-tokens** — Colors, spacing, typography, shadows
- **packages/shared** — Common hooks (useAuth, useFirestore), types, utilities
- **packages/firebase-config** — Unified Firebase initialization
- **Anti-Buddhist UX principles:**
  - No visible tier segregation (paid features don't demote free)
  - No engagement metrics on people (no like counts, follow scores)
  - Đăng as peer, not authority figure
  - Tone: conversational, peer-to-peer

---

## Layer 2: Content & Services

### Free Tier Features (All Platforms)

| Screen | Purpose | Key Fields |
|---|---|---|
| **Hub** | Home feed, discover trending | Featured article, article grid, trending tags |
| **Tự Khai Trí** | Self-inquiry learning | Content cards, difficulty filter, progress tracking |
| **Tự Khai Trí AI** | Claude Q&A assistant | Query input, contextual suggestions, conversation history |
| **Đối thoại sâu** | Deep dialogue threads | Question list, nested replies, read status |
| **Forum Q&A** | Community Q&A | Questions grid, vote count, answer count, detail page |
| **Bay Cùng** | User profile | Avatar, bio, activity feed, follower count (TBD) |
| **Phá Nô Lệ** | Self-liberation resources | Resource grid, tags, sharing |
| **Trao Đổi NLTT** | Workshop browsing + booking | Workshop cards, calendar, booking form, instructor info |
| **Knowledge Base** | Article repository | Full-text search, categories, WebView rendering |
| **Practice Journal** | Audio learning + journaling | Audio player, journaling prompts, mood tracking |
| **Comments** | Inline comments | Comment thread, mention support, moderation |

### Paid Tier Features (Deferred)

| Feature | Price | Includes |
|---|---|---|
| **AI Hỏi Ngược** | 99K/tháng | Claude-powered reflection suggestions, unlimited queries |
| **1-on-1 Coaching** | 2-5tr/session | Direct coaching with Đăng (payment + scheduling TBD) |

---

## Layer 3: Backend Infrastructure

### Cloudflare Workers Architecture

#### workers/api/ — REST API (Hono)
```
GET    /profiles/:userId
PATCH  /profiles/:userId              (auth required)
GET    /questions?skip=0&limit=20
POST   /questions                     (auth required)
GET    /questions/:qId/answers
POST   /questions/:qId/answers        (auth required)
DELETE /answers/:aId                  (auth required)
POST   /votes                         (auth: question_id, answer_id, type)
GET    /comments?parent=article/:slug&skip=0
POST   /comments                      (auth required)
```

**Auth:** Firebase token in `Authorization: Bearer {token}` header. Custom claims extracted:
- `admin: true` — full CRUD access
- `mod: true` — moderation access (approve comments, delete spam)
- Default — read public data, create own comments/questions/answers

**Response format:**
```json
{
  "status": 200,
  "data": { /* entity */ },
  "pagination": { "skip": 0, "limit": 20, "total": 100 }
}
```

**Error responses:**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "details": "Firebase token invalid or expired"
}
```

#### workers/realtime/ — WebSocket Chat (Durable Objects)
```
wss://realtime.workers.dev/chat/{roomId}?userId={anon-id}&token={token}
```

**Message protocol:**
```json
{"type": "message", "text": "Hello", "userId": "anon-xyz", "timestamp": 1234567890}
{"type": "presence", "users": [{"id": "anon-abc", "typing": false}]}
{"type": "error", "reason": "rate_limited"}
```

**Features:**
- Slow-mode: 1 message per 2 seconds (rate-limited; other messages queued)
- Ephemeral: Messages stored in Durable Object memory only; 5-min idle timeout closes connection
- Presence: Broadcast user list every 5 seconds
- No persistence: For "real-time only" chat (not history threads)
- TTL: 5-minute idle auto-close

#### workers/notion/ — Content Sync + AI
```
Cron: 0 0 * * * (daily at 00:00 UTC)

Flow:
1. Fetch Notion database (notion_database_id from env)
2. Filter for modified entries since last sync
3. For each entry:
   a. Parse Notion block → Firestore document
   b. Generate OG image (if article)
   c. Call Claude API (skill btd-comment-facebook v0.2) for AI metadata
   d. Write to Firestore[articles|teachings|questions]
4. Log sync result
5. Alert on error (Slack/Discord TBD)
```

**Notion schema (expected):**
- Title (string)
- Content (rich text blocks)
- Category (select: article, teaching, question)
- Tags (multi-select)
- Status (select: draft, published, archived)
- Last edited (date)

**Claude AI integration (skill btd-comment-facebook v0.2):**
- Input: Article title + first 500 chars
- Output: Suggested reflection questions, discussion starters
- Used for: Hỏi ngược feature suggestions

---

## Layer 4: Source of Truth

### Firestore Collections

| Collection | Structure | Access | Purpose |
|---|---|---|---|
| `articles` | `{ title, slug, content, author, tags, status, createdAt }` | Public read | Blog posts, teachings |
| `questions` | `{ title, body, tags, author, createdAt, answerCount, voteCount }` | Public read | Community Q&A |
| `answers` | `{ body, questionId, author, createdAt, voteCount, voteSum }` | Public read | Answers to questions |
| `comments` | `{ text, parent (article/question/answer), author, createdAt, status }` | Public read | Comments (moderated) |
| `votes` | `{ type (up/down), targetId (q/a), userId, createdAt }` | Admin read | Vote audit trail |
| `user_profiles` | `{ displayName, avatar, bio, email, subscription, joinedAt }` | Public read | User info |
| `subscriptions` | `{ userId, plan (free/ai/coaching), startDate, renewalDate, status }` | User read own | Subscription state |
| `topics` | `{ name, slug, description, icon, order }` | Public read | Topic/tag hierarchy |
| `teachings` | `{ title, content, difficulty, duration, tags, status }` | Public read | Learning modules |
| `practices` | `{ title, description, duration, instructions, audio }` | Public read | Practice exercises (tai-yang-quan) |
| `settings` | `{ theme, lang, nav, cards, donationChannels, fcmKey }` | Public read | Site configuration |
| `translations/{lang}` | `{ key: "home.title", value: "..." }` | Public read | i18n strings (vi, en) |

### Firebase Services

**Authentication:**
- Email/Password (admin login)
- OAuth (TBD: Google, Apple for mobile)
- Custom claims: `admin`, `mod`

**Firestore Security Rules:**
- Public collections readable by all (unauthenticated)
- Authenticated users can create comments, questions, answers
- Admin/mod can moderate and delete
- Private fields (email, payment info) restricted to user + admin

**Cloud Functions:**
- `ogRenderer` — Renders OG meta tags for crawler requests (deployed to Firebase Functions v2)

**FCM (Firebase Cloud Messaging):**
- Web: push notifications on new articles, comments
- Mobile: native push via firebase-messaging
- Topic subscription: user subscribes to topics (tags)

### Notion Database (Master Inventory)

**Master source for:**
- Articles (synced daily to Firestore)
- Teachings (synced daily)
- Practice instructions (synced daily)

**Sync process:**
- workers/notion cron fetches Notion API daily
- Parses blocks → Firestore documents
- Calls Claude API for reflection suggestions
- Stores metadata (OG image, sync timestamp)

### Claude API (External AI)

**Skill:** btd-comment-facebook v0.2

**Invocations:**
1. Article title + first 500 chars → Reflection questions
2. User comment → Suggested responses (for AI Hỏi Ngược feature)

**Frequency:** On-demand (user triggers) + Daily batch (Notion sync)

---

## Data Flow Examples

### Creating a Question
```
Mobile/Web → POST /api/questions
  ├─ Firebase Auth token validation
  ├─ Custom claim check (any authenticated user)
  ├─ Firestore write: questions collection
  ├─ Increment article.questionCount
  └─ Return {id, title, body, createdAt}

Mobile notified via:
  ├─ Real-time listener (Firestore subscription)
  ├─ FCM push (if user subscribed to article topic)
  └─ Email (admin digest, deferred)
```

### Real-time Chat
```
Mobile → WebSocket wss://realtime.workers.dev/chat/{roomId}
  ├─ Durable Object session created
  ├─ Presence broadcast every 5s
  ├─ Message rate-limited (1 per 2s)
  ├─ Stored in DO memory (ephemeral)
  └─ Connection auto-close after 5min idle

Mobile 2 receives:
  ├─ Live message (via WebSocket)
  ├─ Typing indicators
  ├─ User presence updates
  └─ Auto-disconnect on timeout
```

### AI Hỏi Ngược
```
Mobile → POST /api/ai-reflect?questionId={qId}
  ├─ auth: Firebase token + subscription check (paid tier)
  ├─ Fetch question body from Firestore
  ├─ Call Claude API (skill btd-comment-facebook v0.2)
  ├─ Get reflection suggestions
  ├─ Return {suggestions, usage}
  └─ Log to analytics (GA4)
```

### Daily Notion Sync
```
00:00 UTC → workers/notion cron triggers
  ├─ Fetch Notion DB (notion_database_id from env)
  ├─ Filter modified entries since lastSync
  ├─ For each entry:
  │   ├─ Parse Notion blocks
  │   ├─ Generate preview image
  │   ├─ Call Claude API for metadata
  │   └─ Write to Firestore[articles|teachings]
  └─ Update lastSync timestamp
  └─ Alert on errors

Result: articles collection updated with new content
```

---

## Security Model

### Authentication
- **Web/Mobile:** Firebase Auth (email/password, OAuth deferred)
- **Workers:** Bearer token validation → custom claims extraction
- **Firestore:** Security rules enforce read/write permissions

### Authorization
- **Admin:** `custom claim admin=true` → full CRUD
- **Mod:** `custom claim mod=true` → moderation (delete comments, ban users deferred)
- **User:** Any authenticated user → create comments, questions, answers
- **Public:** Unauthenticated → read-only access

### Data Protection
- **PII:** Email, phone, real name stored in `donation_contacts` collection (admin-read only)
- **Firestore rules:** Strict rules rejecting public writes (except comments/questions/answers)
- **Workers:** CORS locked to https://{battudao.com,immortality.vn} + localhost
- **Secrets:** Notion API key, Claude API key stored in Cloudflare env (not .env)

---

## Deployment & Environments

### Web (Firebase Hosting + Cloud Functions)
```
dev → npm run dev (local Vite)
staging → firebase deploy --only hosting (to battudao.com/beta or staging subdomain TBD)
prod → firebase deploy --only hosting,functions (to battudao.com)
```

### Mobile (EAS Build → TestFlight/Play Console)
```
dev → npx expo start (local Expo CLI)
staging → eas build --platform ios --profile preview (TestFlight internal)
prod → eas build --platform ios (TestFlight for review)
prod → eas submit --platform ios (submit to App Store)
```

### Workers (Wrangler)
```
dev → npx wrangler dev (local Workers dev server)
staging → npx wrangler publish --env staging
prod → npx wrangler publish --env production
```

### Firestore
```
dev → Local emulator (firebase emulators:start)
prod → Cloud Firestore (immortalityvn project, no staging)
```

---

## Performance & Scaling

### Expected Scale (Year 1)
- **Users:** 1K-10K monthly active
- **Questions/month:** 100-500
- **Articles/month:** 20-50
- **Peak WebSocket connections:** 50-100 concurrent

### Performance Targets
| Component | Metric | Target |
|---|---|---|
| Web page load | TTFB | <200ms |
| Mobile app start | TTI | <3sec (4G) |
| API response | p95 latency | <200ms |
| WebSocket | Message latency | <100ms |
| Firestore | Query p95 | <500ms |

### Scaling Strategy
- **Firestore:** Enable persistent cache, implement pagination
- **Workers:** Auto-scale via CF (no ops needed)
- **Durable Objects:** Monitor usage; quota limits at 100K requests/day free tier
- **R2:** Unlimited storage tier; may need CDN in front for images

---

## Known Limitations & Future Work

| Item | Status | Impact |
|---|---|---|
| Video hosting provider | TBD | Blocks audio/video uploads |
| iOS IAP integration | Deferred | Using SePay web payment |
| User follower system | TBD | Bay Cùng profile feature incomplete |
| Email notifications | Deferred | Batch digest TBD |
| Search ranking | TBD | Full-text search, no relevance ranking |
| Moderation dashboard | TBD | Admin UI for comments/questions |
| Analytics pipeline | TBD | GA4 event streaming, BigQuery |
