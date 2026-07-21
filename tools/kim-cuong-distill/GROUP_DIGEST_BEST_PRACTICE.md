# Best practice — scout group Kim Cương → distill BTĐ

## Vấn đề cũ

Anh copy tay transcript → dán Claude → chạy `bat-tu-dao-distill`.  
Mất thời gian, dễ dính lẫn giọng học trò / Thầy, dễ quên fetch Notion.

## Kiến trúc đề xuất (3 layer)

```
Zalo group ──capture──► goclaw dangzalo (pending + @mention)
                              │
                              ▼
                 canonical sync + stable digest batch
                              │
                              ▼
        de-tu workspace: group-kim-cuong/pending-digest.json
                              │
                              ▼
         goclaw CRON (de-tu) ──digest──► Đăng (Telegram)
                              │
                    “Ok chưng …” │
                              ▼
              bat-tu-dao-distill Layer 2 → Notion NL/RP/BTD
                              │
                              ▼
                    immortality-mod → battudao.com
```

### Layer 0 — Capture (đã bật)

| | |
|---|---|
| Group paired | `2528808185298561542` |
| group_policy | pairing |
| require_mention | **true** (không tốn LLM mỗi tin) |
| history_limit | 500 |

Tin **không** @bot → `channel_pending_messages`.  
Tin **@bot** → session agent.

### Layer 1 — Digest (operational, KHÔNG doctrine)

Cron `kim-cuong-group-digest` trên agent **de-tu-dang-zalo**:

1. Đọc batch canonical `group-kim-cuong/pending-digest.json`
2. Viết DIGEST theo skill format, kèm `batch_id`
3. Gửi bằng message tool → Đăng (`giahan1-bot`)
4. Chỉ khi tool success mới ghi `digest-ack.json`; lỗi thì batch được retry

Delivery là at-least-once: có thể lặp cùng batch ID nếu crash sau send/trước ACK.

**Cấm:** tạo NL/RP, paraphrase Thầy thành doctrine, trộn giọng. Ghép theo thời gian chỉ
là `candidate`; chỉ cặp được người biên tập `verified` mới là nguồn authoritative.

### Layer 2 — Distill (khi anh chốt)

Anh reply ngắn: `Ok chưng 3 cái` / `BTD report X` / `NL từ đoạn Thầy …`

Agent bật **Quy tắc 0** (fetch Notion), rồi:

| Nguồn | Đích |
|---|---|
| Học trò | Raw Materials **BTD-xxx** only |
| Lời Thầy verbatim | **NL/RP** (sau search trùng + verify max) |

### Layer 3 — Publish

`immortality-mod` / skill immortality-api: Article hoặc Khai Trí, hero 16:9, `thumbnail_url`.

## Lịch gợi ý

| Job | Lịch | Việc |
|---|---|---|
| Host sync inbox | mỗi 30–60 phút | `node scripts/sync-to-agent-inbox.mjs` |
| GoClaw digest | `0 */6 * * *` (6h) hoặc `0 21 * * *` (tối) | Summary gửi anh |
| Distill | on-demand | Anh chốt sau khi đọc DIGEST |

## Anti-pattern tránh

1. Cron tự “chưng NL” không hỏi anh (trừ khi anh đã “best practice tự quyết”).
2. Summary layer dùng làm nguồn doctrine.
3. Backfill history Zalo bằng API (hiện 404) — đừng kỳ vọng full log cũ.
4. `require_mention=false` trên group đông → tốn token vô ích.

## Lệnh tay

```bash
cd tools/kim-cuong-distill
node scripts/sync-to-agent-inbox.mjs
npm run sync && npm run build-qa
npm run ui   # http://127.0.0.1:8765
```
