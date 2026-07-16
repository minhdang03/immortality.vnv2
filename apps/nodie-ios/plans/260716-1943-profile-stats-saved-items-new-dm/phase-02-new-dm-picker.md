# Phase 02 — Nút soạn tin mới → chọn người nhận → DM

**Priority:** vừa · **Status:** XONG (17/07) · phụ thuộc: không (độc lập phase-01)

Test mới `NewMessageUITests`: chọn Hà Chi (đã có DM) → mở lại đúng cuộc cũ, danh sách vẫn đúng 1 dòng;
chọn Ngọc Mai (chưa có) → tạo mới, mở luôn, cuộc mới nằm lại danh sách. Dòng người có
`accessibilityIdentifier` riêng vì danh sách Chat dưới sheet có dòng trùng tên.

## Context

- `ConversationListView.swift:88` — nút ✎ đang `// TODO(phase-wire): mở màn chọn người nhận`.
- Chat vẫn chạy MockData: `MockData.people` (6 người) + `AppState.openOrCreateDM(with:)` + `createdDMs` đã có sẵn từ mục 8/9 — chỉ thiếu màn chọn.
- `openChat(_:)` đã set `chatsPath = [.chat(id)]` → sau khi tạo DM chỉ cần gọi nó.

## Files

**Tạo:**
- `NODIE/Features/Conversations/NewMessageView.swift` — sheet: tiêu đề "Tin nhắn mới", list `MockData.people` (avatar 46pt nền `person.bg` + emoji, tên `rowTitle`, sub `metaSm` — dựng row riêng gọn, KHÔNG tái dùng `PersonRowView` vì nó kèm pill follow), tap → `state.openOrCreateDM(with: person)` + dismiss. Nút Huỷ dạng capsule như AskQuestionView.

**Sửa:**
- `NODIE/Features/Conversations/ConversationListView.swift` — `@State showNewMessage` + `.sheet` (sheet được: chọn người là thao tác 1-chạm, không có draft để mất như màn hỏi); nút ✎ set true.

## Steps

1. `NewMessageView.swift`.
2. Wire nút ✎ + sheet.
3. `xcodegen generate` → build.

## Validation

- Build xanh; smoke UI test có sẵn của Chat vẫn xanh.
- Tap ✎ → chọn Hachi → mở đúng ChatDetail; chọn lại lần 2 → mở DM cũ (không tạo trùng — `openOrCreateDM` đã lo).

## Risks

- Không đụng Supabase — mock đúng tầng hiện tại của Chat; wire realtime là việc vòng sau.
