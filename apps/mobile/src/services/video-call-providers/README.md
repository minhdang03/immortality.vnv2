# Video Call Providers — Integration Notes

Decision deferred. Anh chưa chọn Daily.co vs Whereby vs LiveKit.
Default stub: `daily-co-stub-provider.ts` (all return placeholder URLs).

## Provider Decision Matrix

| Criteria | Daily.co | Whereby | LiveKit |
|---|---|---|---|
| **Pricing model** | Per-minute ($0.004/min/participant) | Per room/month ($9.99+) | Self-host free / LiveKit Cloud per-min |
| **Setup complexity** | Low — SaaS, REST API | Low — SaaS, embed URL | High — needs server infra + token service |
| **React Native SDK** | `@daily-co/daily-js` (WebRTC via WebView) | `@whereby.com/browser-sdk` (iframe/WebView) | `@livekit/react-native` (native SDK) |
| **Embed in app** | Yes (iframe/WebView) | Yes (iframe, purpose-built) | No — native view only |
| **Data sovereignty** | US servers by default | EU servers | Self-hosted = full control |
| **Customisation** | High (recording, breakout, custom UI) | Medium (branding via CSS) | Full (open source, self-host) |
| **For 1-on-1 use case** | Excellent | Excellent | Excellent (overkill for small scale) |
| **Recommendation** | Best for quick launch | Best UX simplicity | Best long-term if infra cost ok |

## To Activate a Provider

### Daily.co
```bash
pnpm add @daily-co/daily-js
```
Replace stub methods in `daily-co-stub-provider.ts`:
- `createRoom`: POST to `https://api.daily.co/v1/rooms` with `api-key` header
- `getJoinLink`: generate meeting token via `POST /meeting-tokens`
- `getEmbedUrl`: `https://{domain}.daily.co/{roomName}`

### Whereby
```bash
pnpm add @whereby.com/browser-sdk
```
Replace stub methods in `whereby-stub-provider.ts`:
- `createRoom`: POST to `https://api.whereby.dev/v1/meetings`
- `getJoinLink`: return `meeting.roomUrl` (Whereby handles auth internally)
- `getEmbedUrl`: same `roomUrl` with `?embed` param

### LiveKit
```bash
pnpm add @livekit/react-native livekit-client
```
Requires server-side token service (workers/api):
- `createRoom`: POST to LiveKit server API or LiveKit Cloud
- `getJoinLink`: server generates JWT `AccessToken` for participant, return as join URL
- `getEmbedUrl`: returns null — use native `<Room>` component from `@livekit/react-native`

## Switching Provider

In `video-call-service.ts`, change one line:
```ts
// Before:
export const videoCallProvider: VideoCallProvider = dailyCoProvider;

// After (example):
export const videoCallProvider: VideoCallProvider = wherebyProvider;
```

No other code changes needed — all callers use the interface, not the stub directly.
