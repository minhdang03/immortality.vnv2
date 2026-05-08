# Phase 06 — Livestream Viewer + Reactions

## Context Links
- P05 host (counterpart side of WebRTC handshake)
- Shared signaling helpers (P02)
- TikTok-style reactions UX (floating hearts/claps)

## Overview
- **Priority**: P1 (core feature)
- **Status**: pending
- **Effort**: 3d
- Build viewer side: list active streams, watch screen with video render, live chat overlay, reactions panel with floating animations.

## Key Insights
- Viewer consumes one `RTCPeerConnection` to host. Only inbound media tracks; outbound tracks empty.
- `RTCView` from `react-native-webrtc` renders remote `MediaStream`.
- Reactions: write to `battudao_reactions` (ephemeral) → all clients in stream subscribe → render floating animation. TTL 60s on reaction docs.
- Animation: `react-native-reanimated@~4` worklets; spawn floating heart from bottom-right, fade up + out over ~2s.
- Chat overlay reuses `message-list` + `message-composer` from P04 but with translucent dark background, bottom-anchored, smaller height.

## Functional Requirements
- Home tab shows active streams (`battudao_streams` where `status == 'live'`).
- Tap stream → watch-stream-screen.
- Watch screen: full-bleed video, host name + viewer count overlay, chat overlay, reactions panel.
- 4 reaction buttons: heart (❤️), clap (👏), star (⭐), gift (🎁 — placeholder, no payment).
- Tap reaction → write doc → animate locally + propagate to other viewers.
- Leave stream → close PC, decrement viewer count, navigate back.

## Architecture

### Component tree
```
home-screen → live-streams-list → stream-card
                                       ↓ tap
                                watch-stream-screen
                                  ├ remote-video (RTCView)
                                  ├ stream-header (host, viewers)
                                  ├ chat-overlay (message-list + composer)
                                  ├ reactions-panel (4 buttons)
                                  └ floating-reactions-layer (animated)
```

### Viewer signaling flow (mirror of P05)
1. Mount → write `viewer-join` signal `{ streamId, fromId: viewerUid, toId: hostId }`
2. Listen for `offer` where `toId == self`
3. On offer: setRemoteDescription → createAnswer → setLocalDescription → write `answer`
4. Subscribe to `ice-host-to-viewer` → addIceCandidate
5. Emit own ICE → write `ice-viewer-to-host`
6. `ontrack` → set MediaStream → render in `RTCView`
7. Unmount → close PC + write `viewer-leave` signal (host removes connection)

### Reactions flow
```
Tap heart
  ↓
addDoc(battudao_reactions, { streamId, userId, type: 'heart', createdAt })
  ↓
Local optimistic animation immediately
  ↓
Other viewers' onSnapshot triggers → animate
```

### Schema (`battudao_reactions`)
```ts
{
  id: string,
  streamId: string,
  userId: string,
  type: 'heart' | 'clap' | 'star' | 'gift',
  createdAt: serverTimestamp,
  expiresAt: number,  // createdAt + 60s; client filters
}
```

## Related Code Files

**Read:**
- P05: `mobile/src/services/webrtc/peer-connection-factory.ts`, `host-peer-manager.ts`
- P02 livestream helpers
- P04 chat components (reuse)

**Create:**
- `apps/immortality-vn/mobile/src/screens/live/watch-stream-screen.tsx`
- `apps/immortality-vn/mobile/src/screens/home/live-streams-list.tsx`
- `apps/immortality-vn/mobile/src/screens/home/stream-card.tsx`
- `apps/immortality-vn/mobile/src/services/webrtc/viewer-peer-manager.ts`
- `apps/immortality-vn/mobile/src/hooks/use-watch-stream.ts`
- `apps/immortality-vn/mobile/src/hooks/use-active-streams.ts`
- `apps/immortality-vn/mobile/src/hooks/use-stream-reactions.ts`
- `apps/immortality-vn/mobile/src/components/live/remote-video.tsx`
- `apps/immortality-vn/mobile/src/components/live/stream-header.tsx`
- `apps/immortality-vn/mobile/src/components/live/chat-overlay.tsx`
- `apps/immortality-vn/mobile/src/components/live/reactions-panel.tsx`
- `apps/immortality-vn/mobile/src/components/live/floating-reaction.tsx`
- `apps/immortality-vn/mobile/src/components/live/floating-reactions-layer.tsx`
- `apps/immortality-vn/shared/livestream/reactions.ts` (sendReaction, listenReactions)

**Modify:**
- `apps/immortality-vn/mobile/src/screens/home/home-screen.tsx` — replace P01 stub with live streams list
- `apps/immortality-vn/mobile/src/navigation/main-tabs.tsx` — add Watch route under Home stack

## Implementation Steps
1. Implement shared `reactions.ts` (send + listen).
2. Implement `viewer-peer-manager.ts` mirroring host but inbound.
3. Implement `use-active-streams` hook (snapshot of streams where status==live).
4. Build `live-streams-list` + `stream-card` (thumbnail or hostName-initial avatar, viewer count, title, "LIVE" pill).
5. Build `watch-stream-screen` skeleton (video + overlays).
6. Wire `viewer-peer-manager` into screen lifecycle.
7. Build `chat-overlay` reusing P04 `message-list`/`message-composer` with overlay styles. Use streamId as roomId or dedicated stream-chat room id.
8. Build `reactions-panel` (4 buttons).
9. Build `floating-reactions-layer` with reanimated worklets — listen to reactions, push into local queue, animate each from bottom-right floating up.
10. Verify viewer count: increment on join (transactional update on stream doc) + decrement on leave.
11. Two-device end-to-end test: host (P05) + viewer (this phase).

## Todo
- [ ] Implement shared reactions module
- [ ] Build viewer-peer-manager
- [ ] use-active-streams hook
- [ ] live-streams-list + stream-card
- [ ] watch-stream-screen skeleton
- [ ] Wire viewer signaling lifecycle
- [ ] remote-video component (RTCView)
- [ ] stream-header overlay
- [ ] chat-overlay reusing P04 components
- [ ] reactions-panel
- [ ] floating-reactions-layer (reanimated)
- [ ] use-stream-reactions hook
- [ ] Viewer count transaction
- [ ] Two-device E2E test (host+viewer simultaneously)

## Success Criteria
- Viewer sees host's video <2s after tap-to-watch.
- Chat overlay messages send + receive in real-time during stream.
- Tapping heart spawns floating heart locally + on other viewer devices.
- Viewer count visible to all participants, increments/decrements correctly.
- Leaving stream closes connection cleanly (no zombie PCs verified via Chrome inspector / Flipper).

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Reactions flood UI/Firestore | Med | Med | Throttle button (1 tap/200ms), cap visible animations at 20 simultaneous |
| Viewer count drift (didn't decrement on crash) | High | Low | Periodic cleanup via Cloud Function (deferred); MVP accepts drift |
| Chat overlay obscures video | Med | Low | Translucent bg + max height 30% of screen |
| Reanimated worklet errors on dev client | Med | Med | Babel plugin configured; tested early in P01 |
| Stream loads but black video (codec issue) | Low | High | Default to VP8/H.264 negotiation; test on real iPhone |

## Security
- Reactions rules: `userId == auth.uid` on create.
- View rules: any signed-in user can read streams + reactions.
- No PII in reaction events beyond userId (no display name embedded — read from auth).

## Next Steps
- P07 design polish (video overlay, reaction icon polish).
- P08 testing + EAS build.
