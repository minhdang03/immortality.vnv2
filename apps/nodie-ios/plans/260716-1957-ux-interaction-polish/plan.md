# Plan: UX interaction polish (batch 1 — ngoài vùng file Opus)

**Status:** in progress · **Duyệt:** user chọn 16/07 19:57
**Ràng buộc:** KHÔNG đụng file Opus đang làm (plan 260716-1943): Profile/*, QAStore*, QuestionDetailView, ConversationListView, NewMessageView, Auth/*.

## Batch này (làm ngay)

| # | Việc | File |
|---|---|---|
| 1 | Chạm lại tab đang đứng → pop về root; ở root → cuộn lên đầu (QA + Bạn bè) | AppState, RootTabView, QuestionListView, FriendsView |
| 2 | Long-press bubble chat → Sao chép; long-press thân câu trả lời/reply → Sao chép | ChatDetailView, AnswerCardView, AnswerReplyRow |
| 3 | Haptics: gửi tin, ☀ lit, ▲ vote, theo dõi, chuyển tab | NodieHaptics (mới), các call-site trên |
| 4 | `.scrollDismissesKeyboard(.interactively)` trong chat | ChatDetailView |
| 7 | Anim số đếm ☀/▲ (`contentTransition(.numericText())`) + spring cho nút theo dõi | AnswerCardView, AnswerReplyRow, FriendsView |
| 8 | Launch screen màu nền #FAF7F0 (hết flash trắng) | project.yml + Assets |

## Chờ Opus xong (batch 2)

- (5) Badge chưa đọc trên tab Chat — AppState + NodieTabBar + đọc `unread`.
- (6) `.refreshable` cho QuestionDetailView.
- (9) Empty state Chat list — ConversationListView (vùng Opus).

## Riêng: dark mode

Chỉ ĐỀ XUẤT palette (doc + preview) — không code trước khi user duyệt.

## Validation

Build xanh + SwipeBackUITests + TouchTargetUITests. Build có thể đỏ do file Opus dở tay — phân biệt rõ trước khi kết luận.
