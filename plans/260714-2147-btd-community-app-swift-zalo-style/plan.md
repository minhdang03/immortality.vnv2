# NODIE — BTD Community App, Native Swift, Zalo-style

**Status:** in-progress — phase 00/01/02/02b/03/03a XONG (260716). Schema đã lên prod, Hỏi đáp chạy dữ liệu thật, 27/27 UI test pass. **Tiếp theo: phase 04 (Hội thoại)** — mảnh cuối của v1 còn chạy MockData.
**Quyết định gốc (Đăng):** app như Zalo cho cộng đồng riêng; làm CẢ 3: chat cộng đồng + DM 1-1 + feed chia sẻ trải nghiệm. UI viết lại từ đầu bằng Swift/SwiftUI (không dùng Expo RN hiện có).

## Quyết định chốt 2026-07-14 (Đăng trả lời 5 câu treo)

1. **Chỉ admin tạo nhóm/phòng chat** — user không tự tạo group. RLS: insert `channels` chỉ role admin; DM (`kind='dm'`) thì user nào cũng mở được với nhau.
2. **DM có gửi ảnh + audio** — Supabase Storage (hoặc R2 prefix sẵn có), cần moderation media + giới hạn dung lượng.
3. **Bỏ app Expo RN** (`apps/mobile`) — không maintain song song; phase-08 của plan 260611 (mobile RN cutover) trở nên VÔ HIỆU, thay bằng plan này.
4. **Có user Android** — cần cả 2 nền tảng: Swift/SwiftUI iOS trước, Kotlin/Compose Android sau (backend + schema dùng chung, `supabase-kt`).
5. **Tên app: NODIE** ("no die" = bất tử). Bundle ID đề xuất: `com.battudao.nodie`.

## Product shape — nguồn chuẩn: `Aion Prototype v3.dc.html`

Import qua DesignSync MCP từ project claude.ai/design `88fbf590-0eb4-4923-b877-c1289421569a` ("Ứng dụng cộng đồng bất tử đạo"). **File prototype là spec, không phải 2 ảnh chụp** — ảnh thiếu hẳn cơ chế cốt lõi.

**Cốt lõi: PHÓNG RA → HÚT VÀO.** Bảng tin không cho lướt thụ động. Phải phóng câu hỏi/hình dung ra trước, rồi nội dung mới được hút về, kèm **điểm khớp** (94%/81%/62%) và **lý do hút** ("✦ Vì sao hút về: …"). Đây là điểm khác biệt lớn nhất so với feed thuật toán: người dùng luôn thấy VÌ SAO thứ này xuất hiện. Nguyên lý Bất Tử Đạo: *nạp vào mà không phóng ra chỉ thành kho rác.*

| Tab | Nội dung | Trạng thái |
|---|---|---|
| Bảng tin | 2 trạng thái: chưa phóng (chỉ lời mời) → đã phóng (hút nội dung + điểm khớp + lý do) | ✅ |
| Hỏi đáp | List + lọc; "＋ Phóng câu hỏi" — đặt câu hỏi = một lần phóng | ✅ |
| Chi tiết câu hỏi | Thân bài + trả lời có vote, badge "✓ Hay nhất", "Phóng câu trả lời của bạn…" | ✅ |
| Hội thoại | Kênh + Nhóm + 1-1 một list, lọc, badge KÊNH/NHÓM, đếm chưa đọc | ✅ |
| Chat chi tiết | Bong bóng tin, gửi được; kênh broadcast → khoá "🔒 Chỉ quản trị viên có thể đăng" | ✅ |
| Hành trình | Cân bằng Phóng↔Hút (32 vs 50 = 64%), nhận định AI, timeline đã phóng, ghi chú SLM on-device | ✅ |

**Anti-pattern ĐÃ GỠ (Đăng duyệt 2026-07-15):** badge "Có chuyên gia trả lời", "✓ Hay nhất", đếm "2,4k đã đọc", vote "▲ Hữu ích", streak "28 ngày 🔥". Đảo ngược "no tier segregation" + "no engagement metrics" trong `CLAUDE.md` — **cần update CLAUDE.md**.
**Còn giữ:** no Buddhist imagery.

## Code đã có (2026-07-15)

`apps/nodie-ios/` — XcodeGen + SwiftUI iOS 17, bundle `com.battudao.nodie`. **20 file / ~1.960 dòng. Build sạch, cả 6 màn verify trong Simulator.**
- `AppState.swift` — @Observable, port từ `state` + `renderVals()` của prototype. Điều hướng bằng enum (không NavigationStack) vì detail phải ẩn tab bar.
- `DesignSystem/` NodieColors (token **trích nguyên văn** từ prototype, không đoán từ ảnh), NodieTypography, NodieSpacing
- `Shell/` RootTabView + NodieTabBar (pill tối, glyph ✦ ? ◧ ◍ như prototype)
- `Features/Feed/` FeedView + ProjectionPromptCard + AttractedItemRow (+ PulsingDot)
- `Features/QA/` QuestionListView + QuestionDetailView + AnswerCardView
- `Features/Conversations/` ConversationListView + ConversationRowView + ChatDetailView (+ MessageBubbleView, ConversationAvatar)
- `Features/Journey/` JourneyView (+ BalanceCard, InsightCard, ProjectionTimeline)
- `Components/NodieChips.swift` — EyebrowLabel, FilterChip(Row), TopicTagView, UnreadBadge, CircleIconButton
- `Models/` Question+Answer, Conversation+ChatMessage+Projection+AttractedItem, MockData (port 1:1)

**Token chuẩn:** bg `#faf7f0` · ink `#241c10` · accent `#2b7a5e` · accentLight `#a894ff` · gold `#b8862b` · rule `#e8dfc9` · tagBg `#f1e9d8` · expertBg `#ece7fb`.
**Font:** prototype dùng **Lora + Be Vietnam Pro**; hiện map sang New York + SF Pro (hệ thống, đủ dấu VI, không cần bundle). Đổi = sửa 2 hàm trong `NodieTypography.swift`.

## Database — XÀI CHUNG với web (chốt 2026-07-15)

KHÔNG tạo DB riêng. Cùng Supabase project: một `auth.users` + `profiles` cho web lẫn app; content sẵn có; AdminUsersTab web quản luôn user app; AI corpus một chỗ. Việc cần làm = thêm migration `0016+`, không đụng bảng cũ.

---

## (VÔ HIỆU — bản 260714) Product shape 5 tab

<details><summary>Giữ để tra cứu lịch sử quyết định</summary>

5 tab chat-first: Tin Nhắn / Chia Sẻ / Trang Chủ / Khai Trí / Cá Nhân. Gold `#b08642`. Nội dung tâm linh. Anti-pattern: no metrics, Đăng = peer.

</details>

## Backend — Supabase một plane (đã có sẵn từ migration 260611)

- Auth: Supabase Auth (email/password + Sign in with Apple — App Store bắt buộc nếu có social login). User quản lý qua Supabase Dashboard + AdminUsersTab web sẵn có.
- Chat realtime: Supabase Realtime trên Postgres (KHÔNG dùng workers/realtime DO — ephemeral, không lưu → không có data cho AI; DO sẽ retire hoặc chỉ giữ presence).
- Push: APNs qua `device_tokens` table. DM không push = DM chết.

## Schema (AI-ready, thiết kế 260714)

```
channels(id, slug, title, kind: public|group|dm|feed, linked_content_id, created_by, created_at)
channel_members(channel_id, user_id, role: member|mod, joined_at, last_read_at)
messages(id, channel_id, user_id, parent_id→thread, body, lang, created_at, edited_at,
         deleted_at /*SOFT delete*/, metadata jsonb, ai_annotations jsonb, tsv tsvector)
reactions(message_id, user_id, emoji)
reports(id, message_id, reporter_id, reason, status)   -- App Store UGC guideline 1.2
blocks(blocker_id, blocked_id)                          -- bắt buộc khi có DM
message_embeddings(message_id, model, embedding vector) -- pgvector, tách bảng
device_tokens(user_id, token, platform)
profiles.ai_consent boolean                             -- consent khi sign-up
view v_ai_corpus: loại DM + deleted + non-consent. DM TUYỆT ĐỐI không vào corpus.
```

RLS: member đọc kênh mình tham gia; public channel ai cũng đọc; sửa/xoá tin của mình; mod xoá trong kênh; DM chỉ 2 người; slow-mode trigger 2s/tin.

## Phases (đề xuất thứ tự ship)

| # | Phase | Ghi chú |
|---|---|---|
**Đăng chốt 260715: Bảng tin + Hành trình để phase sau.** Phase đầu ship Hỏi đáp + Hội thoại — đúng 2 màn chạy được mà KHÔNG cần AI. UI cả 6 màn đã dựng sẵn nên phase sau chỉ việc wire.

| # | Phase | Ghi chú |
|---|---|---|
| 00 | ✅ **XONG 260715** — admin user Supabase (`mr.dang1305@gmail.com`, `profiles.role='admin'`, uid `46328fcb…`) | tạo qua Admin API |
| 01a | ✅ **XONG 260716** — `0017` + `0018` áp lên prod (14 → 24 bảng, bảng cũ nguyên vẹn). | |
| 01 | ✅ **XONG 260716** — [Áp schema + kiểm chứng Hỏi đáp](phase-01-schema-apply-and-qa-verify.md): áp bằng `psql` (không có Supabase CLI), verify 6/6, `0019` đóng cộng đồng (anon=0/0/0), **`0020` vá bug FK author→profiles** (thủ phạm làm Hỏi đáp rỗng sạch), seed, QA wire chạy thật 3/3. | lộ 2 bug thật; AutoFill ≠ bug app |
| 02 | ✅ **XONG 260715** — [Auth thật + màn Cá Nhân](phase-02-auth-and-profile.md): supabase-swift, login/signup email, session Keychain, hồ sơ thật qua RLS, đăng xuất. Vào Cá Nhân qua avatar góc Bảng tin (KHÔNG thêm tab thứ 5 — prototype chỉ có 4 tab). Sign in with Apple: bỏ, không cần (chỉ có provider email → App Store không bắt buộc). | 14/14 UI test pass, 6 test gọi Supabase thật |
| 02b | ✅ **XONG 260715** — [Xử lý review ngoài](phase-02b-external-review-remediation.md): gỡ credential khỏi test (→ `.env`/xcconfig/scheme, skip êm khi thiếu), Dynamic Type, draft riêng từng chat + tự cuộn, touch target 44pt + VoiceOver, ghi xoá-tài-khoản vào phase 05 | review ngoài: 4/6 P0 đúng, #6 reviewer đọc nhầm. 20/20 UI test pass; ảnh cỡ mặc định lệch 0 pixel. Còn mở: test auth flaky sẵn có (xem Unresolved #3 của phase) |
| 03a | ✅ **XONG 260715** — [Thao tác vuốt iOS](phase-03a-ios-swipe-gestures.md): NavigationStack refactor, vuốt-cạnh-back, swipe action dòng hội thoại, pull-to-refresh | 8/8 UI test pass |
| 03 | ✅ **XONG 260716** — Wire **Hỏi đáp** chạy dữ liệu thật: list + detail + vote/lit/Hay nhất + reply lồng + tên tác giả nhúng. Kiểm chứng bằng `QAWireUITests` (3/3). | phải vá `0020` mới sống |
| 04 | 🔜 **TIẾP THEO** — [Wire **Hội thoại**](phase-04-conversations-wire.md): `ConversationStore` (khuôn QAStore) thay MockData (AppState 82/105/126/168), list + chat keyset + Realtime + unread (`last_read_at`) + `is_broadcast` RLS + block/report. **01 đã mở khoá.** | UI xong; phần nặng nhất. FK messages→profiles đã vá sẵn ở 0020 |
| 04b | ⬜ [APNs push](phase-04b-apns-push.md): entitlement `aps-environment`, đăng ký `device_tokens`, Edge Function ký JWT ES256 (`.p8`) → APNs HTTP/2, webhook trên messages INSERT. Không push tin của mình, tôn trọng block+mute. **Chặn bởi 04.** Cần Đăng cấp `.p8`/Key ID. | server = Supabase Edge Function |
| 05 | 🏗️ **ĐANG LÀM (Đăng)** — [App Store readiness](phase-05-app-store-readiness.md): **xoá tài khoản XONG + kiểm chứng thật** — không dùng Edge Function mà RPC `delete_account()` SECURITY DEFINER (`0021`, đã áp): user tự xoá → auth.users mất, profiles cascade, nội dung ở lại `author_id=NULL`, anon bị 42501. Moderation (report/block/BlockedUsersView) + Điều khoản + localize đang dựng. Còn: quên mật khẩu, privacy labels, TestFlight. | ⚠️ khuôn Reddit/HN — ĐẢO quyết định 'hard-delete + grace 30 ngày' trong phase-05 |
| — | *— ranh giới v1 —* | |
| 06 | **Bảng tin** + pipeline AI xếp hạng ngữ nghĩa (xem mục AI bên dưới) | UI xong, chờ AI |
| 07 | **Hành trình** + bản đồ hiểu biết (`concepts` + mastery do AI suy) | UI hiện là timeline — sẽ thay bằng bản đồ |
| 08 | SLM on-device re-rank + xử lý ghi chú riêng tư | |
| 09 | Android: Kotlin/Compose (supabase-kt + FCM) | sau khi iOS ổn định. **Scaffold+parity sớm:** plan `260715-1620-nodie-android-scaffold-parity` (UI mock only, không wire API) |
| 10 | Retire `apps/mobile` Expo RN + dọn `workers/api` Firebase path + nhánh Firestore ngủ ở web | thay thế phase-08 plan 260611 |

## Kiến trúc AI (Đăng chốt 260715)

**Nguyên tắc phân tầng:** *server lo gom + lọc thô (rẻ, chạy hàng loạt) → model lo hiểu + chọn tinh (đắt, chạy cho từng user).*
Đây là điểm phân biệt với Facebook/Zalo: **feed tối ưu cho học sâu, không phải thời gian lướt.**

### LLM trên server (làm trước — phase 06)
- **Xếp hạng ngữ nghĩa** — không chấm theo vote/độ mới. LLM hiểu nội dung bài + hồ sơ học (từ Hành trình) → đẩy bài **lấp lỗ hổng kiến thức của user**, không phải bài "hot" chung.
- **Tóm tắt** — mỗi bài dài có 1-2 câu tóm tắt LLM viết; gom bài trùng chủ đề thành thẻ cụm ("5 bài mới về telomere tuần này").
- **Bản tin cá nhân hoá** — mỗi sáng LLM soạn "hôm nay đáng đọc gì" theo chu kỳ học hiện tại.

### SLM on-device (phase 08)
- **Re-rank ngay trên máy** bằng dữ liệu nhạy cảm không rời điện thoại: ghi chú riêng, lịch sử đọc chi tiết, tốc độ đọc.
- **Server gửi ~100 ứng viên thô → SLM chọn + sắp 20 bài cuối.** Cá nhân hoá sâu mà không lộ dữ liệu.
- Ghi chú riêng tư xử lý on-device = **điểm bán hàng về quyền riêng tư**.

### "Hành trình" = AI đồng hành, KHÔNG phải nhật ký thủ công
LLM quan sát hoạt động (bài đọc, câu hỏi, thảo luận) rồi **tự suy ra**: đã thực sự hiểu gì, còn hổng chỗ nào, nên học gì tiếp.
- **Bản đồ hiểu biết do AI suy luận** thay cho timeline liệt kê. Mỗi khái niệm có **mức độ nắm vững** — AI đánh giá qua cách user trả lời Q&A, ghi chú, thảo luận.
- **Nhận định AI kèm dẫn chứng** từ chính hoạt động của user (nút "Xem dẫn chứng ↗" trong UI đã có).
- **Gợi ý bước tiếp theo** do AI đề xuất theo nguyên lý học của user.

→ Schema phát sinh: `concepts`, `user_concept_mastery` (điểm + evidence refs), `ai_insights` (nhận định + dẫn chứng), `ai_briefings` (bản tin sáng).

⚠️ **Mâu thuẫn cần giải trước phase 08:** web hiện đã gửi `reading_events` (dwell từng đoạn) **lên Supabase**. iOS lại hứa "lịch sử đọc chi tiết, tốc độ đọc" không rời máy. Hai vế đá nhau — phải chốt: hoặc web cũng ngừng gửi, hoặc lời hứa privacy chỉ áp cho **ghi chú riêng** (không gồm lịch sử đọc). Nói sai chỗ này là rủi ro App Store privacy label + mất niềm tin.

## Scale — quyết định phải chốt NGAY ở schema (rẻ giờ, đắt sau)

Postgres chịu tới hàng chục triệu tin nhắn nếu làm đúng 4 thứ này từ đầu:
1. **Đếm denormalized** — `reply_count`, `read_count`, `last_message_at` là CỘT, cập nhật bằng trigger. KHÔNG `COUNT(*)` lúc đọc (O(n), giết list view). Mockup đã hiện "3 câu trả lời · 2,4k đã đọc" → bắt buộc.
2. **Keyset pagination** — `WHERE created_at < $cursor ORDER BY created_at DESC LIMIT 50`. KHÔNG `OFFSET` (OFFSET 10000 quét 10000 dòng).
3. **Index `(channel_id, created_at DESC)`** — index composite này là thứ quyết định, không phải index rời từng cột.
4. **`last_read_at` thay read-receipt per-message** — unread = `COUNT WHERE created_at > last_read_at` (bounded). Bảng read-state per message = bùng nổ N×M dòng.

Đòn bẩy sau, KHÔNG cần redesign: partition `messages` theo tháng (`PARTITION BY RANGE (created_at)`) khi >50M dòng → detach partition cũ ra R2/parquet cho AI corpus. Media không nằm trong DB (Storage/R2, DB giữ URL). Embeddings đã tách bảng riêng + HNSW index.

**Nút cổ chai thật của app chat không phải số dòng mà là Realtime connections** — `postgres_changes` không scale quá vài trăm subscriber đồng thời (RLS check mỗi subscriber mỗi event). Khi đông → chuyển sang Realtime **Broadcast**. Quyết định này ở tầng client, đổi được sau.

## Unresolved questions

1. **Tên app: NODIE hay Aion?** Prototype tên "Aion"; Đăng chốt "NODIE" 260714. Target + bundle đang là NODIE / `com.battudao.nodie`.
2. ✅ **ĐÃ TRẢ LỜI 260715** — Cá Nhân vào qua avatar góc Bảng tin, giữ 4 tab. Xem `phase-02`.
3. **"Ngày 128" + streak "28 ngày 🔥"** đếm từ đâu? Cần `joined_at` + bảng streak.
4. ✅ **ĐÃ TRẢ LỜI 260715** — ranh giới SLM/LLM: xem mục "Kiến trúc AI". Còn treo: mâu thuẫn `reading_events` web-vs-iOS (⚠️ cuối mục đó).
5. Nội dung đổi sang khoa học trường thọ → `topics`/`categories` tâm linh hiện có xử sao? Giữ song song hay thay?
6. Media DM: giới hạn dung lượng ảnh/audio? Duyệt trước khi hiển thị?
7. App Store: check trademark tên; IAP bắt buộc cho digital goods (Apple 15-30%), không được dùng SePay trong app iOS (guideline 3.1.1).
8. Font: bundle Lora + Be Vietnam Pro để khớp 100% prototype, hay giữ font hệ thống?

## Schema mới prototype lộ ra (ngoài chat/Q&A đã có)

1. **`projections`** — mỗi lần phóng ra là một row (câu hỏi / trả lời / dạy lại / hình dung). Nguồn của timeline Hành trình VÀ tỷ lệ phóng/hút.
2. **Điểm khớp + lý do hút** — cần embedding similarity (pgvector, đã có) + câu giải thích do LLM sinh **lúc hút rồi cache** (`attraction_reason`), không sinh mỗi lần render.
3. **`is_broadcast` trên channel** — kênh phát một chiều. Client mới chỉ ẩn ô nhập; **RLS phải enforce thật**, không thì ai cũng POST được qua API.
