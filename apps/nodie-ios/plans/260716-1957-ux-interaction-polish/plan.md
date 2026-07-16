# Plan: UX interaction polish

**Status:** XONG cả 2 batch (17/07 08:15) — build xanh, code-reviewer DONE không blocker (3 minor đã sửa: allowsHitTesting empty-state, badge trần 99+, Chat list scroll-to-top). SwipeBackUITests 7/7 xanh — chứng minh contextMenu không phá vuốt-back toàn màn.
**Full suite CHƯA chạy trọn:** fail compile ở `ConversationStore.swift:125` (missing argument 'metadata') — file wire-chat-Supabase của luồng khác đang sửa dở, ngoài phạm vi plan này. Chạy lại full suite sau khi luồng đó xong.
**Follow-up ghi nhận từ review:** khi wire ConversationStore vào UI, `AppState.totalUnread` (badge tab) phải chuyển nguồn từ mock sang store — dễ quên. Nit bỏ qua có chủ đích: NodieHaptics không prepare() trước; refreshable chi tiết không refetch title câu hỏi.
**Duyệt:** user chọn 16/07 19:57. Plan 260716-1943 (Opus) đã XONG → batch 2 hết bị chặn.
**Mục 9 dời từ batch 1 sang 2:** nằm trong ConversationListView — lúc đó là vùng Opus.

## Batch 1 (đã code, build xanh)

| # | Việc | File |
|---|---|---|
| 1 | Chạm lại tab đang đứng → pop về root; ở root → cuộn lên đầu (QA + Bạn bè) | AppState, RootTabView, QuestionListView, FriendsView |
| 2 | Long-press bubble chat → Sao chép; long-press thân câu trả lời/reply → Sao chép | ChatDetailView, AnswerCardView, AnswerReplyRow |
| 3 | Haptics: gửi tin, ☀ lit, ▲ vote, theo dõi, chuyển tab | NodieHaptics (mới), các call-site trên |
| 4 | `.scrollDismissesKeyboard(.interactively)` trong chat | ChatDetailView |
| 7 | Anim số đếm ☀/▲ (`contentTransition(.numericText())`) + spring cho nút theo dõi | AnswerCardView, AnswerReplyRow, FriendsView |
| 8 | Launch screen màu nền #FAF7F0 (hết flash trắng) | project.yml + Assets |

## Batch 2 (đã code)

- (5) Badge chưa đọc trên tab Chat — `AppState.totalUnread` (bỏ kênh muted) + `NodieTabBar.unreadCount` (UnreadBadge scale 0.72 trên glyph ◧).
- (6) `.refreshable` cho QuestionDetailView — kéo là refetch thread.
- (9) Empty state Chat list — overlay lên List (giữ pull-to-refresh khi rỗng), copy đổi theo filter.

## Riêng: dark mode

Chỉ ĐỀ XUẤT palette (doc + preview) — không code trước khi user duyệt.

## Validation

Build xanh + SwipeBackUITests + TouchTargetUITests. Build có thể đỏ do file Opus dở tay — phân biệt rõ trước khi kết luận.
