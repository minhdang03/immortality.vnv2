# Code Standards — Reference & Examples

Detailed implementation examples for shared packages, testing, and deployment.

## Shared Packages Implementation

### packages/firebase-config/

**Purpose:** Unified Firebase initialization (web + mobile)

```typescript
// packages/firebase-config/web.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: 'immortalityvn.firebaseapp.com',
  projectId: 'immortalityvn',
  storageBucket: 'immortalityvn.firebasestorage.app',
  messagingSenderId: '204809901558',
  appId: '1:204809901558:web:169a7b3168a9d3d3a623d7',
  measurementId: 'G-NZ6ZX0RN4L'
};

export const app = initializeApp(config);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Emulator (development only)
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(firestore, 'localhost', 8080);
}

// packages/firebase-config/native.ts
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export { auth, firestore };
```

### packages/ui-tokens/

**Purpose:** Design tokens (colors, spacing, typography)

```typescript
// packages/ui-tokens/tokens.ts
export const colors = {
  primary: '#1a1a1a',      // Charcoal
  secondary: '#d4af37',    // Gold accent
  background: '#f5f5f5',
  text: '#333333',
  border: '#e0e0e0',
  success: '#4caf50',
  error: '#f44336'
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const typography = {
  heading1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40
  },
  heading2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24
  }
};
```

### packages/shared/

**Purpose:** Common types, hooks, utilities

```typescript
// packages/shared/types.ts
export interface User {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  subscription: 'free' | 'ai' | 'coaching';
  createdAt: number;
}

export interface Question {
  id: string;
  title: string;
  body: string;
  author: string;
  tags: string[];
  createdAt: number;
  answerCount: number;
  voteCount: number;
}

// packages/shared/hooks.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ /* ... */ });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  return { user, loading };
}

// packages/shared/utils.ts
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('vi-VN');
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
```

---

## Testing Standards

### Unit Tests (Vitest)

**Web component testing:**
```typescript
import { render, screen } from '@testing-library/react';
import { ArticleCard } from './ArticleCard';

describe('ArticleCard', () => {
  it('renders title and excerpt', () => {
    render(
      <ArticleCard
        title="Test Article"
        excerpt="This is a test"
        onPress={() => {}}
      />
    );
    expect(screen.getByText('Test Article')).toBeTruthy();
  });

  it('calls onPress when clicked', () => {
    const mock = vi.fn();
    const { getByRole } = render(
      <ArticleCard
        title="Test"
        excerpt="Test"
        onPress={mock}
      />
    );
    fireEvent.click(getByRole('button'));
    expect(mock).toHaveBeenCalled();
  });
});
```

**Hook testing:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
  });

  it('updates user after auth state change', async () => {
    const { result, rerender } = renderHook(() => useAuth());
    
    await act(async () => {
      // Mock Firebase auth change
      mockAuthChange({ uid: '123', email: 'test@test.com' });
      rerender();
    });
    
    expect(result.current.user?.id).toBe('123');
  });
});
```

### Integration Tests (Firebase Emulator)

```typescript
beforeAll(async () => {
  await initializeFirestoreEmulator();
});

afterEach(async () => {
  await clearFirestoreEmulator();
});

test('saves question to Firestore', async () => {
  const question = await createQuestion('userId', {
    title: 'Test Q',
    body: 'Body'
  });
  expect(question.id).toBeDefined();
  expect(question.title).toBe('Test Q');

  // Verify read-back
  const fetched = await getQuestion(question.id);
  expect(fetched.body).toBe('Body');
});

test('increments answer count on new answer', async () => {
  const q = await createQuestion('userId', { title: 'Q', body: 'B' });
  const a = await addAnswer(q.id, 'userId2', { body: 'Answer' });
  
  const updated = await getQuestion(q.id);
  expect(updated.answerCount).toBe(1);
});
```

### E2E Tests (Playwright/Detox)

**Web E2E:**
```typescript
import { test, expect } from '@playwright/test';

test('user can post a question and vote', async ({ page }) => {
  await page.goto('http://localhost:5173/forum');
  
  // Click ask button
  await page.click('[data-testid="ask-question"]');
  
  // Fill form
  await page.fill('[data-testid="title"]', 'My question');
  await page.fill('[data-testid="body"]', 'Details...');
  
  // Submit
  await page.click('[data-testid="submit"]');
  
  // Verify posted
  const posted = await page.textContent('[data-testid="question-title"]');
  expect(posted).toContain('My question');
  
  // Vote on answer
  const answers = await page.locator('[data-testid="answer"]');
  expect(answers).toHaveCount(1);
  
  await answers.first().locator('[data-testid="upvote"]').click();
  const voteCount = await answers.first().locator('[data-testid="vote-count"]').textContent();
  expect(voteCount).toBe('1');
});
```

**Mobile E2E (Detox):**
```typescript
describe('Forum screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('user can ask question', async () => {
    await element(by.id('forum-tab')).tap();
    await element(by.id('ask-button')).tap();
    
    await element(by.id('title-input')).typeText('My question');
    await element(by.id('body-input')).typeText('Details...');
    await element(by.id('submit')).tap();
    
    await expect(element(by.text('My question'))).toBeVisible();
  });
});
```

---

## Documentation Standards

- **README:** Each workspace has setup/deploy instructions
- **Inline comments:** Explain *why*, not *what*
- **JSDoc/TSDoc:** Document public APIs with parameter + return types
- **CHANGELOG:** Update after each release
- **API docs:** Document Worker endpoints (request/response format)

**Example JSDoc:**
```typescript
/**
 * Create a new question in the forum
 * @param {string} userId - Firebase user ID
 * @param {Object} data - Question data
 * @param {string} data.title - Question title (required)
 * @param {string} data.body - Question body (required)
 * @param {string[]} data.tags - Topic tags (optional)
 * @returns {Promise<Question>} Created question with ID
 * @throws {Error} If title/body missing or user not authenticated
 */
export async function createQuestion(userId: string, data: CreateQuestionInput): Promise<Question>
```

---

## Deployment & CI/CD

### Pre-commit Checks

```bash
pnpm run lint       # ESLint all workspaces
pnpm run type-check # TypeScript check
pnpm run test       # Vitest all workspaces
```

### GitHub Actions (Future)

**PR Workflow:**
- Run lint & type check
- Run unit tests
- Build all workspaces
- Post results as comment

**Main Branch Deploy:**
- Run full test suite
- Build web + functions → Firebase Hosting
- Build + submit mobile to EAS Build
- Deploy workers to Cloudflare

**Staging Environment:**
- Separate Firebase project (immortalityvn-staging)
- EAS Build profile: `preview` for TestFlight internal testing
- Workers staging URL: staging.api.battudao.com

### Manual Deploy

**Web:**
```bash
# Build
pnpm -F @btd/web run build

# Deploy to Firebase Hosting + Functions
firebase deploy --only hosting,functions --project immortalityvn
```

**Mobile:**
```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios --latest

# Build for App Store
eas build --platform ios

# Android: Build + submit to Play Store
eas build --platform android
eas submit --platform android --latest
```

**Workers:**
```bash
# Deploy API
pnpm -F @btd/workers-api run deploy

# Deploy realtime
pnpm -F @btd/workers-realtime run deploy

# Deploy notion sync
pnpm -F @btd/workers-notion run deploy
```

### Environment Variables

**Web (.env):**
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=immortalityvn.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=immortalityvn
VITE_FIREBASE_STORAGE_BUCKET=immortalityvn.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=204809901558
VITE_FIREBASE_APP_ID=1:204809901558:web:...
VITE_FIREBASE_MEASUREMENT_ID=G-...
```

**Workers (wrangler.toml env vars):**
```toml
[env.production]
vars = { NOTION_DATABASE_ID = "...", NOTION_API_KEY = "..." }

[env.staging]
vars = { NOTION_DATABASE_ID = "staging-db-id", ... }
```

**Mobile (.env):**
```
EXPO_PUBLIC_FIREBASE_PROJECT_ID=immortalityvn
EXPO_PUBLIC_API_URL=https://api.battudao.com
```

---

## Performance Monitoring

**Web:**
- Google Analytics 4 (GA4) via Firebase
- Web Vitals (LCP, FID, CLS) integration
- Error tracking: Sentry (optional)

**Mobile:**
- Firebase Performance Monitoring
- Crash reporting: Firebase Crashlytics
- Custom events: user journey tracking

**Backend:**
- CloudFlare Analytics
- Durable Objects request metrics
- Firestore read/write quota monitoring

---

## Security Checklist

- [ ] Firebase Auth tokens validated on all Worker endpoints
- [ ] CORS restricted to known origins (no `*`)
- [ ] Firestore security rules reviewed and tested
- [ ] No API keys in client code (environment variables only)
- [ ] No secrets in git history (pnpm-lock.yaml, .env, admin keys all .gitignored)
- [ ] Rate limiting on API endpoints (Hono middleware)
- [ ] Notion API credentials stored in Cloudflare env (not .env)
- [ ] R2 bucket ACLs reviewed (private by default)
