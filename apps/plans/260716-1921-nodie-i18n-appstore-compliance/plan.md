# NODIE — i18n UI strings + App Store compliance (report/block/delete/terms)

Status: DONE (build succeeded; migration 0021 chờ Đăng apply bằng psql/vault) · Branch: claude/immortality-mobile-hybrid · Scope: apps/nodie-ios + supabase/migrations

> Lưu ý thi công: repo đang có session Claude khác sửa song song (chat wiring: ChatRoute, MemberProfileView, Person.swift, auto-login UITest). Các chuỗi UI mới của session đó đã được gom key vào Localizable.xcstrings, nhưng ternary String trong view của họ (vd "✓ Đang theo dõi" : "＋ Theo dõi") cần tách Text từng nhánh mới ăn catalog.

## Bối cảnh
- Đăng chốt: (1) UI strings đa ngữ, (3) ship App Store với 3 tab Hỏi đáp/Chat/Bạn bè. (2) dịch nội dung = plan tương lai.
- Tab bar ĐÃ chỉ hiện 3 tab (`NodieTab.visibleTabs`) — không cần sửa.
- Bảng `reports`/`blocks` + RLS đã có (0017). Thiếu: UI wire, target_type 'reply', delete_account, terms.
- ⚠️ Chat + Bạn bè còn MockData — risk reject 2.1/4.0 khi submit thật (flag cho Đăng, ngoài scope).

## Phases
1. **Migration 0021** — reports check thêm 'reply'; fn `delete_account()` security definer (auth.users cascade→profiles, author_id SET NULL = ẩn danh hoá nội dung). KHÔNG tự apply prod — báo Đăng chạy.
2. **Moderation UI** — `author_id` vào AnswerRow/ReplyRow + selects; `blockedUserIds` filter trong QAStore (questions/answers/replies); `ModerationMenu` (⋯: Báo cáo + Chặn) ở QuestionDetail header, AnswerCard, ReplyRow; `BlockedUsersView` (sheet từ Profile) unblock.
3. **Delete account + Terms** — `AuthStore.deleteAccount()` (rpc → signOut local); nút xoá 2 bước ProfileView; `TermsView` tĩnh VI (sheet Profile + notice Login).
4. **i18n** — `Localizable.xcstrings` nguồn vi + en/zh-Hans/ja/ko/fr/de/es/ru (~105 keys, 7 keys plural); sửa verbatim-Text: NodieTab.title, FilterChip/EyebrowLabel key-lookup, CircleIconButton/ProfileRow LocalizedStringKey, ternary Text tách nhánh, String(localized:) cho ErrorText/AuthStore/QAModels/RelativeTime; `project.yml` developmentLanguage=vi; UITests ghim `-AppleLanguages (vi)` (assertions VI).
5. **Build verify** — xcodegen + xcodebuild simulator.

## Quyết định
- Content taxonomy (topic "Não bộ"…) + nội dung server = data, KHÔNG dịch (thuộc scope #2 tương lai).
- Feed/Journey view ẩn khỏi tab bar → không dịch (YAGNI).
- Terms giữ tiếng Việt (legal text, dịch sau khi có user ngoại).
- accessibilityIdentifier giữ nguyên chuỗi VI cố định (UITests không gãy).

## Success criteria
- Build sạch; UITests không đổi hành vi (VI pinned).
- Đổi ngôn ngữ máy → UI đổi (Settings per-app language tự có nhờ multi-localization).
- Report/block ghi đúng bảng qua RLS; block ẩn nội dung ngay; delete account đăng xuất + ẩn danh hoá nội dung.
