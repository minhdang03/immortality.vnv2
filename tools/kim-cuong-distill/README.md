# Kim Cương Bất Tử — Q&A Distill

Scout + quản lý hỏi đáp học trò → thầy Hà từ group Zalo **Kim Cương Bất Tử**.

**Một ngày chạy thế nào:** xem `MOT_NGAY.md`.  
**Best practice:** `GROUP_DIGEST_BEST_PRACTICE.md`.  
**Skill:** goclaw `bat-tu-dao-distill` + handoff `immortality-api`.

| | |
|---|---|
| Group ID | `2528808185298561542` |
| Channel goclaw | `dangzalo` (Zalo Personal) |
| Agent | `de-tu-dang-zalo` |
| Teacher UID (admin group) | `2274226262295314833` (cần verify tên = thầy Hà) |

## Đã cấu hình trên goclaw

- `group_policy: pairing`
- Paired: `group:2528808185298561542`
- `require_mention: true` — tin không @bot được ghi pending history (không tốn LLM mỗi tin)
- `history_limit: 500`

## Giới hạn lịch sử

API Zalo `getGroupChatHistory` hiện **404** (client unofficial).  
**Không kéo được full history cũ** qua API. Dữ liệu lấy từ:

1. **Live capture** qua goclaw (`channel_pending_messages` + sessions) khi group có tin mới  
2. **Import JSON** nếu anh export/backup từ nơi khác

## Commands

```bash
cd tools/kim-cuong-distill
npm install

# Một lần: cài daemon Mac (auto sync mỗi 5 phút)
npm run install-daemon

# Tay
npm run pipeline          # sync inbox + messages + build-qa
npm run auto-sync:once    # một vòng auto-sync
npm run ui                # http://127.0.0.1:8765
npm test                  # state + pairing tests
npm run health:local      # kiểm tra DB, cron, mirror, artifacts
npm run health:e2e        # yêu cầu receipt digest thật đã được commit
```

**Quan trọng:** goclaw ghi tin vào Postgres `channel_pending_messages` và sessions.  
Daemon `auto-sync-loop` hợp nhất hai nguồn thành `messages.jsonl`, rồi mirror inbox + một
`pending-digest.json` ổn định sang workspace. Batch chỉ được commit khi ACK Telegram khớp
`batch_id`; lỗi gửi giữ nguyên batch để retry.

Delivery là **at-least-once**: crash sau khi Telegram nhận nhưng trước khi ghi ACK có thể gửi
lặp. Mỗi digest hiện rõ `batch_id` để nhận biết; ưu tiên không mất tin.

### Zalo disconnect → Telegram alert + QR

```bash
npm run zalo-watch          # watch (hoặc install-daemon)
npm run zalo-watch:test     # gửi thử alert + QR ngay
```

Khi `dangzalo` dis ≥ ~3 phút / gave-up restart: Telegram báo + **ảnh QR** để quét lại.  
Tin trong lúc dis **vẫn miss** (không backfill) — QR chỉ **cắt ngắn** thời gian miss.

## UI distill

Trang `ui/index.html` (serve local):

- Lọc theo học trò / trạng thái `candidate | verified | rejected | unanswered`
- Xem cặp Hỏi–Đáp
- Máy chỉ tạo `candidate`; người biên tập phải verify đúng cặp trước khi dùng làm nguồn
- Gắn tag, ghi notes, soạn `distilled` (bản chắt lọc đăng site)
- Export Markdown chỉ gồm Q&A `verified`

## Teacher detection

Mặc định UID admin group được coi là thầy.  
Sửa `data/config.json` → `teacher_uids` / `teacher_name_hints` nếu cần.
