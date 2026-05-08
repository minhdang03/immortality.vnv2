# Phase 05 — Livestream Host (WebRTC + Firestore Signaling)

## Context Links
- Shared livestream signaling helpers from P02
- `react-native-webrtc` docs (peer connection, SDP, ICE)
- Mesh topology: host opens N peer connections (one per viewer)

## Overview
- **Priority**: P1 (core feature)
- **Status**: pending
- **Effort**: 3d
- Build host go-live screen: camera + mic capture, create stream doc, accept up to 20 viewer peer connections via Firestore signaling, render local preview, end stream.

## Key Insights
- Mesh topology: host = N parallel `RTCPeerConnection` (one per viewer). CPU + uplink bandwidth scale linearly with viewers — viable for ≤20.
- Future migration: Cloudflare Calls SFU. Architecture isolates this in `shared/livestream/signaling.ts` so swapping signaling + topology is contained.
- Firestore signaling pattern: host writes `offer`, viewer writes `answer`, both write ICE candidates to subcollection. Use `battudao_signals` collection with composite IDs.
- Permissions: iOS needs `NSCameraUsageDescription` + `NSMicrophoneUsageDescription` in app.json. Android needs `CAMERA`, `RECORD_AUDIO`.
- `react-native-webrtc` requires custom dev client (already done in P01).

## Functional Requirements
- "Live" tab → "Go Live" CTA. Pressing → camera permission prompt → preview screen → "Start broadcast" → stream live.
- Host enters title before going live.
- Host sees: local preview, viewer count, end-stream button.
- Stream doc created in `battudao_streams` with `status: 'live'`.
- Host accepts incoming viewer connections (subscribes to signals where `toId == hostId`).
- End stream → set `status: 'ended'`, close all peer connections, navigate back.

## Architecture

### Component tree
```
go-live-screen
  ├─ stream-title-input  (pre-broadcast)
  ├─ start-broadcast-button
  └─ broadcasting-view (post-broadcast)
       ├─ local-video-preview (RTCView)
       ├─ viewer-count-badge
       ├─ chat-overlay (reuses P04 components)
       └─ end-stream-button
```

### Signaling protocol (Firestore `battudao_signals`)
```
Doc ID format: {streamId}__{viewerUid}__{type}
type ∈ { 'viewer-join', 'offer', 'answer', 'ice-host-to-viewer', 'ice-viewer-to-host' }

Flow:
1. Viewer creates 'viewer-join' doc { streamId, fromId: viewerUid, toId: hostId, payload: '' }
2. Host listens for 'viewer-join' → spawns new RTCPeerConnection
3. Host createOffer → setLocalDescription → write 'offer' doc { fromId: host, toId: viewer, payload: SDP }
4. Viewer listens for 'offer' (toId == self) → setRemoteDescription → createAnswer → write 'answer'
5. Host listens for 'answer' (toId == self) → setRemoteDescription
6. Both sides write ICE candidates as they emit; both subscribe to inbound ICE
7. ontrack on viewer side → render
```

### Data flow
```
Host device
  getUserMedia({video, audio})
  ↓
  RTCPeerConnection per viewer
  ↓
  addTrack(localStream)
  ↓
  ondatachannel/ontrack handled
  ↓
  Firestore signaling sync
```

### Firestore schema (`battudao_streams`)
```ts
{
  id: streamId,
  hostId: uid,
  hostName: string,
  title: string,
  status: 'live' | 'ended',
  startedAt: serverTimestamp,
  endedAt?: serverTimestamp,
  viewerCount: number,        // updated by Cloud Function or client write
  thumbnailUrl?: string,      // optional snapshot at start
}
```

## Related Code Files

**Read:**
- P02: `shared/livestream/streams.ts`, `shared/livestream/signaling.ts`, `shared/types/stream.ts`, `shared/types/signal.ts`

**Create:**
- `apps/immortality-vn/mobile/src/screens/live/go-live-screen.tsx`
- `apps/immortality-vn/mobile/src/screens/live/broadcasting-screen.tsx`
- `apps/immortality-vn/mobile/src/services/webrtc/host-peer-manager.ts` (manages N connections)
- `apps/immortality-vn/mobile/src/services/webrtc/peer-connection-factory.ts` (ICE servers config, creates RTCPeerConnection)
- `apps/immortality-vn/mobile/src/services/webrtc/permissions.ts`
- `apps/immortality-vn/mobile/src/hooks/use-host-stream.ts` (lifecycle: start/end stream)
- `apps/immortality-vn/mobile/src/hooks/use-camera-stream.ts` (getUserMedia wrapper)
- `apps/immortality-vn/mobile/src/components/live/local-preview.tsx`
- `apps/immortality-vn/mobile/src/components/live/viewer-count-badge.tsx`

**Modify:**
- `apps/immortality-vn/mobile/app.json` — add iOS `infoPlist` (NSCameraUsageDescription, NSMicrophoneUsageDescription) + Android permissions
- `apps/immortality-vn/mobile/package.json` — add `react-native-webrtc`
- `apps/immortality-vn/mobile/src/navigation/main-tabs.tsx` — Live tab opens go-live-screen

## Implementation Steps
1. `npx expo install react-native-webrtc` + add config plugin.
2. `npx expo install expo-camera` (needed for permission shim).
3. Add `infoPlist` strings to `app.json` (vi: "Battudao cần camera để livestream").
4. Run `npx expo run:ios` to rebuild dev client with WebRTC native module.
5. Implement `peer-connection-factory.ts`: STUN/TURN config (use free STUN: `stun:stun.l.google.com:19302`; TURN deferred — note as risk for users behind symmetric NAT).
6. Implement `permissions.ts` requesting camera + mic.
7. Implement `use-camera-stream.ts` calling `mediaDevices.getUserMedia`.
8. Implement `host-peer-manager.ts`:
   - Maintain `Map<viewerUid, RTCPeerConnection>`
   - Subscribe to viewer-join signals
   - For each viewer: createOffer, exchange SDP+ICE via signaling helpers
   - Add local stream tracks
   - Handle disconnect, cleanup on close
9. Implement `use-host-stream.ts` orchestrating: start (create stream doc + start peer manager), end (close all + update doc).
10. Build `go-live-screen` (form) + `broadcasting-screen` (preview + overlay).
11. Test with two devices: host on device A, viewer (P06 placeholder) on device B.

## Todo
- [ ] Install react-native-webrtc + rebuild dev client
- [ ] Add iOS/Android permissions to app.json
- [ ] Build peer-connection-factory
- [ ] Build permissions service
- [ ] Build use-camera-stream hook
- [ ] Build host-peer-manager
- [ ] Build use-host-stream hook
- [ ] Build go-live-screen
- [ ] Build broadcasting-screen + local-preview
- [ ] Two-device handshake test (manual SDP injection or wait for P06)
- [ ] Cleanup verified: no orphan PCs after end stream

## Success Criteria
- Host taps Go Live → camera preview shows.
- Stream doc appears in `battudao_streams` with `status: 'live'`.
- One viewer (test device or P06 build) connects, sees video <2s after join.
- End stream cleanly closes all PCs (verify console — no "ICE state failed" leaks).
- App doesn't crash if camera permission denied.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Symmetric NAT blocks P2P (no TURN) | Med | High | Document; add TURN (Twilio/Xirsys/Cloudflare) before public launch |
| iOS background = stream dies | High | Med | Document limitation; show "Stream ended (backgrounded)" UI; foreground service later |
| Mesh CPU >5 viewers | Med | High | Cap at 20 enforced server-side via rules + client guard; later move to SFU |
| Firestore signaling write floods | Med | Med | Throttle ICE writes; cleanup signals on stream end; TTL 24h |
| WebRTC native module breaks Expo update | Low | High | Pin react-native-webrtc version; test on each Expo SDK upgrade |

## Security
- Camera/mic permission strings in vi.
- Stream rules: only host can create/update own stream doc.
- Signal rules: only fromId==auth.uid can write; only toId can read targeted signals.
- No public ICE — all signaling auth-gated.

## Next Steps
- P06 viewer side (consumes same signaling).
- TURN server provisioning before public launch.
