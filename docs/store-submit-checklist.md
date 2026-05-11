# App Store / Play Store Submit Checklist

**Status: DEFERRED** — blocked on Apple Developer and Google Play Console accounts.

---

## Blocker

| Account | Fee | Status |
|---|---|---|
| Apple Developer Program | $99/yr | PENDING — anh confirms provisioned |
| Google Play Console | $25 one-time | PENDING — anh confirms provisioned |

---

## Google Play Store

### Prerequisites
- [ ] Bundle ID: `com.immortality.app` (set in `capacitor.config.json`)
- [ ] Google Play Console account registered ($25 one-time)
- [ ] App signed AAB (Android App Bundle) — not APK

### Build
```bash
pnpm --filter @btd/web build   # Vite build
npx cap sync android           # Sync web assets to Capacitor
# Open Android Studio → Build → Generate Signed Bundle/APK → AAB
```

### Store Listing
- [ ] Short description (≤80 chars): "Con đường tu tập đến bất tử vật lý — trí tuệ Việt Nam"
- [ ] Full description (≤4000 chars): bilingual VI/EN
- [ ] Screenshots: phone (min 2), 7" tablet optional
  - Source from Figma mockup: `docs/redesign-mockup-multi-device.html`
- [ ] Feature graphic: 1024×500 px
- [ ] App icon: 512×512 PNG (already generated: `apps/web/public/icons/icon-512.png`)

### Privacy & Policy
- [ ] Privacy policy URL — publish at `https://battudao.com/privacy`
- [ ] Data safety form:
  - Data collected: User ID (Firebase Auth), FCM token (push), Firestore data (Khai Trí questions)
  - Data encrypted in transit: yes (HTTPS/TLS)
  - User can request data deletion: yes (contact form)

### Content Rating
- [ ] Complete IARC questionnaire — expected: Everyone / General Audience
- [ ] Category: Lifestyle → Spirituality & Religion

### Release
- [ ] Internal test track → Closed testing → Production
- [ ] Rollout: 10% → 100% over 7 days recommended

---

## Apple App Store

### Prerequisites
- [ ] Apple Developer Program enrolled ($99/yr)
- [ ] Bundle ID: `com.immortality.app` registered in Apple Developer portal
- [ ] Provisioning profiles + certificates set up in Xcode

### Build
```bash
pnpm --filter @btd/web build
npx cap sync ios
# Open Xcode → Product → Archive → Distribute to App Store Connect
```

### App Store Connect
- [ ] Create app record with bundle ID `com.immortality.app`
- [ ] App name: "Bất Tử Đạo — Immortality"
- [ ] Subtitle (≤30 chars): "Trí Tuệ Người Việt Nam"
- [ ] Description: bilingual VI/EN
- [ ] Keywords: bất tử, immortality, thiền định, tâm linh, Vietnamese wisdom
- [ ] Support URL: `https://battudao.com/contact`
- [ ] Privacy policy URL: `https://battudao.com/privacy`

### Screenshots Required (no simulator — must be on real device or Xcode Simulator)
- [ ] iPhone 6.9" (iPhone 16 Pro Max): 1320×2868 px — min 3 screenshots
- [ ] iPhone 6.7" (iPhone 15 Plus): 1290×2796 px
- [ ] iPad 13" (optional but recommended for universal)

### Privacy Disclosure (App Privacy section)
- Data linked to user: User ID, device ID
- Data NOT collected: precise location, contacts, financial info
- Push notifications: used for content alerts (Khai Trí answers, new articles)

### AI Disclosure
- App uses AI chatbot (GoClaw) for Khai Trí answers
- Disclosure required in App Store description per Apple guidelines

### Age Rating
- [ ] Run age rating questionnaire — expected: 4+ (no objectionable content)

### In-App Purchases (IAP)
- Not applicable for initial release — ủng hộ (donation) handled via external links
- External payment links: must follow Apple guidelines (no upsell within the app)

### Review Notes for Apple
- App is primarily a content reader / spiritual community platform
- Firebase Auth used for admin/user accounts (email+password)
- No user-generated content visible to minors
- Push notifications: deliberate, low-frequency (max 1-2/week)

---

## Shared Requirements

### Privacy Policy Page
- [ ] Create `https://battudao.com/privacy` (static HTML or Firestore-hosted)
- [ ] Content must cover: data collected, Firebase/FCM usage, third-party SDKs, user rights, contact info

### Release Timeline (after accounts confirmed)
1. Privacy policy page live — 1 day
2. Android AAB build + Play Store listing — 3 days
3. iOS archive + App Store Connect listing — 3 days
4. Apple review — 1-7 days (variable)
5. Google Play review — 1-3 days
6. Coordinated launch: both stores same day

---

*Last updated: 2026-05-11 | Phase 12 — PWA + Store Submit*
