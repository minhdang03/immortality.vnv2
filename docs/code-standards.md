# Bất Tử Đạo — Code Standards

## Package Manager: pnpm Only

**RULE:** Never use `npm` or `yarn`. Lock file is `pnpm-lock.yaml`.

```bash
# ✅ Correct
pnpm install
pnpm add react
pnpm run dev

# ❌ Wrong
npm install
npm add react
yarn install
```

**Reason:** Monorepo uses pnpm workspaces. Running `npm install` will overwrite workspace metadata and break dependency resolution.

**Command reference:**
```bash
# Root-level commands
pnpm install                           # Install all dependencies
pnpm run dev                          # Run dev across all workspaces
pnpm run build                        # Build all workspaces

# Workspace-specific commands
pnpm -F @btd/web run dev              # Dev for web app only
pnpm -F @btd/mobile run dev           # Dev for mobile app only
pnpm -F @btd/workers-api run dev      # Dev for workers API
pnpm --recursive run test             # Run tests in all workspaces
```

---

## Web (apps/web/)

### Stack
- **Framework:** Vite 5 + React 18 (SPA, no SSR)
- **Styling:** CSS Modules + Tailwind (if applicable)
- **State:** React hooks + Context API (no Redux)
- **Data fetching:** React Query + Firestore hooks
- **Firebase:** firebase v12 JS SDK
- **Bundler:** Vite (not Webpack)

### Code Structure

```
apps/web/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── layout/          # Header, Footer, Nav
│   │   ├── common/          # Buttons, Cards, Inputs
│   │   ├── pages/           # Page-level components
│   │   └── *.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useFirestore.js
│   │   ├── useTheme.js
│   │   └── ...
│   ├── pages/               # Route pages (if not using router)
│   ├── services/            # Firebase, API clients
│   │   ├── firebaseInit.js
│   │   ├── authService.js
│   │   └── firestoreService.js
│   ├── styles/              # Global CSS
│   │   ├── base.css
│   │   ├── animations.css
│   │   └── index.css
│   ├── config/              # Configuration
│   │   ├── pages.js         # Route registry
│   │   └── constants.js
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Vite entry
│   └── index.html
├── public/                  # Static assets
│   ├── favicon.ico
│   ├── sw.js               # Service Worker v3
│   ├── manifest.json       # PWA manifest
│   └── og-image.png
├── vite.config.js
└── package.json
```

### React Component Standards

**File naming:** PascalCase for components
```javascript
// ✅ Correct
src/components/HomePage.jsx
src/components/ArticleCard.jsx

// ❌ Wrong
src/components/home-page.jsx
src/components/articleCard.jsx
```

**Hook usage:**
```javascript
// ✅ Use hooks instead of class components
function HomePage() {
  const { user } = useAuth();
  const { articles, loading } = useArticles();
  
  return (
    <div>
      {loading ? <Spinner /> : <ArticleList articles={articles} />}
    </div>
  );
}

// ❌ Don't use class components
class HomePage extends React.Component { ... }
```

**Props & PropTypes (optional for this project):**
```javascript
// ✅ TypeScript JSDoc for clarity (no PropTypes required)
/**
 * Article card component
 * @param {Object} props
 * @param {string} props.title - Article title
 * @param {string} props.slug - URL slug
 * @param {string} props.excerpt - Short description
 * @returns {JSX.Element}
 */
function ArticleCard({ title, slug, excerpt }) {
  return <div>{title}</div>;
}

// Alternatively, use TypeScript
// apps/web/src/components/ArticleCard.tsx
interface ArticleCardProps {
  title: string;
  slug: string;
  excerpt: string;
}
```

**Code splitting:**
```javascript
// ✅ Lazy-load pages to reduce initial bundle
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <HomePage />
    </Suspense>
  );
}
```

### Firebase Usage (Web)

```javascript
// ✅ Use imported firebase config (from packages/firebase-config)
import { auth, firestore } from '@btd/firebase-config/web';
import { collection, query, where, getDocs } from 'firebase/firestore';

async function fetchUserArticles(userId) {
  const q = query(
    collection(firestore, 'articles'),
    where('author', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ❌ Don't initialize Firebase in components
import { initializeApp } from 'firebase/app';
const firebaseApp = initializeApp({ /* config */ });  // Wrong location
```

### PWA Standards (Service Worker v3)

**public/sw.js:**
```javascript
// v3 strategy: precache critical assets, network-first for articles

const CACHE_NAME = 'v3';
const CRITICAL_URLS = [
  '/',
  '/index.html',
  '/styles/base.css',
  '/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CRITICAL_URLS);
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/article/')) {
    // Network-first for articles (fresh content)
    event.respondWith(
      fetch(event.request)
        .then(response => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
```

**public/manifest.json:**
```json
{
  "name": "Bất Tử Đạo",
  "short_name": "BTD",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/"
}
```

---

## Mobile (apps/mobile/)

### Stack
- **Framework:** Expo SDK 54, React Native 0.76
- **Navigation:** Expo Router (file-based)
- **Firebase:** @react-native-firebase v18+ (NOT Firebase JS SDK)
- **State:** React hooks + Context API
- **Styling:** NativeWind (Tailwind for React Native)
- **HTTP client:** Axios or fetch (no third-party RN Firebase for API calls)

### Crucial: @react-native-firebase, Not Firebase JS SDK

**✅ CORRECT:**
```javascript
// apps/mobile/src/services/auth.ts
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export async function signInWithEmail(email, password) {
  const userCredential = await auth().signInWithEmailAndPassword(email, password);
  return userCredential.user;
}

export async function fetchQuestions() {
  const snapshot = await firestore().collection('questions').limit(20).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

**❌ WRONG:**
```javascript
// Don't use Firebase JS SDK in React Native
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const app = initializeApp(config);  // This will fail in RN
const auth = getAuth(app);
```

**Why?** Firebase JS SDK uses Web APIs (localStorage, XMLHttpRequest) not available in React Native. @react-native-firebase provides native bindings and better performance.

### Code Structure

```
apps/mobile/
├── src/
│   ├── app/                 # Expo Router screens (file-based routing)
│   │   ├── _layout.tsx      # Root navigator
│   │   ├── (tabs)/          # Tab-based layout
│   │   │   ├── hub.tsx      # Hub screen
│   │   │   ├── khaitri.tsx  # Tự Khai Trí
│   │   │   └── ...
│   │   ├── article/
│   │   │   └── [slug].tsx   # Dynamic route: /article/:slug
│   │   └── ...
│   ├── components/          # Reusable components
│   │   ├── ArticleCard.tsx
│   │   ├── QuestionList.tsx
│   │   └── ...
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useFirestore.ts
│   │   └── ...
│   ├── services/            # Firebase, API services
│   │   ├── firebaseInit.ts
│   │   ├── authService.ts
│   │   ├── firestoreService.ts
│   │   └── apiClient.ts     # For workers/api calls
│   ├── config/              # Configuration
│   │   ├── constants.ts
│   │   └── theme.ts
│   ├── App.tsx              # Entry point
│   └── index.tsx
├── app.json                 # Expo config
├── eas.json                 # EAS Build config
└── package.json
```

### React Native Component Standards

**File naming:** PascalCase for components
```typescript
// ✅ Correct
src/components/ArticleCard.tsx
src/screens/HomeScreen.tsx

// ❌ Wrong
src/components/articleCard.tsx
src/screens/home-screen.tsx
```

**TypeScript:** Always use .ts/.tsx files (strict type safety)
```typescript
// ✅ Type-safe component
import { View, Text, ScrollView } from 'react-native';

interface ArticleCardProps {
  title: string;
  excerpt: string;
  onPress: () => void;
}

export function ArticleCard({ title, excerpt, onPress }: ArticleCardProps) {
  return (
    <View className="p-4 bg-white rounded">
      <Text className="text-lg font-bold">{title}</Text>
      <Text className="text-gray-600">{excerpt}</Text>
    </View>
  );
}
```

**NativeWind styling:**
```typescript
// ✅ Use NativeWind (Tailwind utilities)
import { View, Text } from 'react-native';

export function HubScreen() {
  return (
    <View className="flex-1 bg-white">
      <Text className="text-2xl font-bold text-black p-4">Hub</Text>
      {/* content */}
    </View>
  );
}

// ❌ Don't use raw StyleSheet for simple cases
import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' }
});
```

### WebView Integration (Content Reuse)

**Pattern: Web articles rendered via WebView**

```typescript
// apps/mobile/src/screens/ArticleScreen.tsx
import WebView from 'react-native-webview';

export function ArticleScreen({ slug }: { slug: string }) {
  const webUrl = `https://battudao.com/article/${slug}`;
  
  return (
    <WebView
      source={{ uri: webUrl }}
      startInLoadingState
      renderLoading={() => <ActivityIndicator />}
      // Security: HTTPS only, no access to device sensors
      originWhitelist={['https://']}
    />
  );
}
```

**Benefits:**
- Single source of truth for rich-text articles
- No custom Swift/Kotlin rendering code
- Web updates automatically reflect in mobile app

---

## Workers (workers/)

### Stack
- **Framework:** Hono (lightweight HTTP framework for Workers)
- **Runtime:** Cloudflare Workers
- **State:** Durable Objects (for realtime chat)
- **Deploy:** Wrangler CLI
- **Testing:** Vitest + @cloudflare/workers-testing

### Code Structure

```
workers/
├── api/
│   ├── src/
│   │   ├── index.ts         # Main entry, route definitions
│   │   ├── routes/
│   │   │   ├── profiles.ts  # GET, PATCH /profiles/:id
│   │   │   ├── questions.ts # GET, POST /questions
│   │   │   ├── answers.ts   # POST, DELETE /answers/:id
│   │   │   ├── votes.ts     # POST /votes
│   │   │   └── comments.ts  # GET, POST /comments
│   │   ├── middleware/
│   │   │   ├── auth.ts      # Firebase token validation
│   │   │   ├── cors.ts      # CORS headers
│   │   │   └── errorHandler.ts
│   │   ├── services/
│   │   │   ├── firestore.ts # Firestore REST client
│   │   │   ├── storage.ts   # R2 client
│   │   │   └── firebase.ts  # Auth token verification
│   │   └── types/
│   │       └── index.ts     # TypeScript interfaces
│   ├── tests/
│   │   └── *.test.ts
│   ├── wrangler.toml        # Worker config
│   ├── tsconfig.json
│   └── package.json
├── realtime/
│   ├── src/
│   │   ├── index.ts         # WebSocket handler
│   │   ├── durable_objects.ts # Durable Object class
│   │   └── ...
├── notion/
│   ├── src/
│   │   ├── index.ts         # Cron job handler
│   │   ├── services/
│   │   │   ├── notion.ts    # Notion API client
│   │   │   ├── firestore.ts # Firestore writer
│   │   │   └── claude.ts    # Claude API caller
│   │   └── ...
└── wrangler.toml            # Root config (if monorepo wrangler)
```

### Hono REST API Standards

**Route definition:**
```typescript
// workers/api/src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './middleware/auth';

const app = new Hono();

// CORS
app.use(cors({
  origin: ['https://battudao.com', 'https://immortality.vn', 'http://localhost:5173'],
  credentials: true
}));

// Auth middleware (all protected routes)
const protectedRoutes = new Hono();
protectedRoutes.use(authMiddleware);

// Routes
app.get('/profiles/:id', async (c) => {
  const id = c.req.param('id');
  const profile = await getProfile(id);
  return c.json({ status: 200, data: profile });
});

protectedRoutes.post('/questions', async (c) => {
  const { title, body, tags } = await c.req.json();
  const userId = c.get('userId'); // From auth middleware
  const question = await createQuestion(userId, { title, body, tags });
  return c.json({ status: 201, data: question });
});

app.route('/api', protectedRoutes);

export default app;
```

**Error handling:**
```typescript
// ✅ Consistent error responses
export async function getQuestion(id: string, c: Context) {
  try {
    const question = await firestore.doc(`questions/${id}`).get();
    if (!question.exists) {
      return c.json({ status: 404, error: 'Not found' }, 404);
    }
    return c.json({ status: 200, data: question.data() });
  } catch (error) {
    console.error('getQuestion error:', error);
    return c.json(
      { status: 500, error: 'Internal server error' },
      500
    );
  }
}
```

### Firebase Integration (Workers)

**Firestore REST client (no JS SDK):**
```typescript
// workers/api/src/services/firestore.ts
export async function getDocument(collection: string, docId: string, token: string) {
  const url = `https://firestore.googleapis.com/v1/projects/immortalityvn/databases/(default)/documents/${collection}/${docId}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) throw new Error(`Firestore error: ${response.status}`);
  return response.json();
}

// ✅ Why: Firestore REST API works in Workers (no Node.js deps)
// ❌ Don't: firebase/firestore JS SDK (requires Web APIs)
```

**Firebase Auth token verification:**
```typescript
// workers/api/src/services/firebase.ts
import { importSPKI, jwtVerify } from 'jose';

export async function verifyToken(token: string, publicKey: string) {
  try {
    const key = await importSPKI(publicKey, 'RS256');
    const { payload } = await jwtVerify(token, key);
    return {
      uid: payload.sub,
      email: payload.email,
      claims: payload // custom claims: admin, mod, etc.
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

### Durable Objects Standards (Realtime Chat)

**Class-based state machine:**
```typescript
// workers/realtime/src/durable_objects.ts
import { DurableObject } from 'cloudflare:workers';

export class ChatRoom extends DurableObject {
  private messages: Array<{ type: string; text: string; userId: string; timestamp: number }> = [];
  private users: Map<string, { id: string; typing: boolean }> = new Map();
  private idleTimeout: number = 5 * 60 * 1000; // 5 minutes

  async fetch(request: Request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/connect') {
      const webSocket = new WebSocket('...');
      this.handleWebSocket(webSocket);
      return new Response(null, { status: 101, webSocket });
    }
    
    return new Response('Not found', { status: 404 });
  }

  private handleWebSocket(webSocket: WebSocket) {
    const userId = `user-${Math.random()}`;
    this.users.set(userId, { id: userId, typing: false });
    
    let messageCount = 0;
    let lastMessageTime = Date.now();
    
    webSocket.onmessage = async (event) => {
      const now = Date.now();
      
      // Rate limiting: 1 message per 2 seconds
      if (now - lastMessageTime < 2000) {
        webSocket.send(JSON.stringify({ type: 'error', reason: 'rate_limited' }));
        return;
      }
      
      lastMessageTime = now;
      const message = JSON.parse(event.data);
      
      this.messages.push({
        ...message,
        userId,
        timestamp: now
      });
      
      // Broadcast to all connected users
      this.broadcast(JSON.stringify(message));
    };
    
    webSocket.onclose = () => {
      this.users.delete(userId);
    };
  }

  private broadcast(message: string) {
    // Send to all connected clients
    // Implementation depends on Cloudflare's WebSocket state management
  }
}

export default ChatRoom;
```

### Notion Sync Standards (Cron)

**Error-safe cron handler:**
```typescript
// workers/notion/src/index.ts
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    try {
      const lastSync = await getLastSyncTimestamp(env);
      const entries = await fetchNotionDatabase(env, lastSync);
      
      for (const entry of entries) {
        const docData = parseNotionBlock(entry);
        const aiMetadata = await generateAIMetadata(docData.content, env);
        
        await writeToFirestore(env, docData, aiMetadata);
      }
      
      await setLastSyncTimestamp(env, Date.now());
      console.log(`Sync completed: ${entries.length} entries`);
    } catch (error) {
      console.error('Notion sync failed:', error);
      // Alert: Slack, Discord, or email (TBD)
      throw error;
    }
  }
};
```

---

## Shared Packages (packages/)

See [code-standards-reference.md](./code-standards-reference.md#shared-packages-implementation) for detailed implementation examples of:
- `@btd/firebase-config` — Unified Firebase init (web + RN)
- `@btd/ui-tokens` — Design tokens (colors, spacing, typography)
- `@btd/shared` — Common types, hooks, utilities

---

## Anti-Patterns to Reject

### UX / Product Anti-Patterns
- **❌ Visible tier segregation:** Don't show "Premium feature" badges or lock free features
- **❌ Engagement metrics on people:** Don't display like counts, follower scores, or reputation systems
- **❌ Guru/authority tone:** Đăng is a peer, not a master; use conversational language
- **❌ Buddhist metaphors in code/UI:** Don't name variables after Buddhist concepts to avoid cultural appropriation tone

### Code Anti-Patterns (Web)
- **❌ Firebase JS SDK in React Native:** Use @react-native-firebase instead
- **❌ Class components:** Use functional components + hooks
- **❌ Direct Firestore calls in components:** Wrap in custom hooks
- **❌ Hard-coded API URLs:** Use config or env vars
- **❌ No error boundaries:** Wrap page routes in ErrorBoundary
- **❌ Inline styles:** Use CSS modules or Tailwind classes

### Code Anti-Patterns (Mobile)
- **❌ Firebase JS SDK:** Use @react-native-firebase/auth, @react-native-firebase/firestore
- **❌ StyleSheet.create for every component:** Use NativeWind for simple cases
- **❌ No TypeScript:** Always use .ts/.tsx files
- **❌ Direct fetch calls without error handling:** Wrap in service layer
- **❌ WebView with http:// URLs:** HTTPS only (or localhost:3000 dev)

### Code Anti-Patterns (Workers)
- **❌ No CORS policy:** Always restrict origin to known hosts
- **❌ Unvalidated tokens:** Always verify Firebase auth token before processing
- **❌ No rate limiting:** Implement slow-mode or quota checks
- **❌ Logging secrets:** Never log API keys or tokens
- **❌ Synchronous Firestore calls:** Use async/await consistently

---

## Testing & Deployment

See [code-standards-reference.md](./code-standards-reference.md) for detailed guidance on:
- **Testing Standards** — Unit tests (Vitest), integration tests (Firebase Emulator), E2E tests (Playwright/Detox)
- **Documentation Standards** — JSDoc, README, CHANGELOG, API docs
- **Deployment & CI/CD** — Pre-commit checks, GitHub Actions, manual deploy commands, environment variables
- **Performance Monitoring** — GA4, Web Vitals, Crashlytics
- **Security Checklist** — Auth validation, CORS, Firestore rules, secret management
