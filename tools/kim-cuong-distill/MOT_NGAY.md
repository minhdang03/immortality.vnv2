# Một ngày pipeline BTĐ (đã wire)

Timezone: **Asia/Ho_Chi_Minh**

## Ai làm gì

| Agent | Vai |
|---|---|
| **dangzalo / de-tu** | Nghe group Kim Cương, capture pending, cron DIGEST |
| **Gia Hân** | Nhận lệnh ngắn của Đăng, distill/viết, dispatch mod (lead Team Đăng) |
| **immortality-mod** | Dịch EN + hero 16:9 + POST draft live |
| **Đăng** | Đọc DIGEST; chốt `Ok viết` / `Ok đăng` (hoặc “tự quyết”) |

## Timeline mẫu

| Giờ | Việc |
|---|---|
| **Cả ngày** | Group Zalo có tin → goclaw ghi pending (`require_mention=true`, không tốn LLM mỗi tin) |
| **07:59–08:00** | Cron chào sáng học trò (đã có, không liên quan distill) |
| **08:00 · 14:00 · 20:00** | Cron đọc stable batch → **DIGEST có batch ID** → Telegram → ACK; lỗi giữ batch để retry |
| **~18:00–21:00** (gợi ý) | Đăng đọc DIGEST trên Telegram |
| **Khi Đăng nhắn** | Xem bảng lệnh bên dưới |
| **Sau handoff** | immortality-mod: EN + ảnh + draft → báo link |
| **Khi rảnh** | Đăng vào admin promote `draft` → `published` (hoặc bảo mod publish) |

### Lệnh Đăng (Telegram / Gia Hân)

| Anh nhắn | Hệ thống |
|---|---|
| *(im lặng)* | Chỉ DIGEST định kỳ |
| `Ok viết` | Distill skill → draft VI + file handoff (chưa mod) |
| `Ok đăng` / `Ok viết + đăng` | Viết (nếu cần) → **immortality-mod** full → draft trên site + link |
| `Ok chưng NL` | Notion BTD/NL only |
| `Best practice tự quyết` | Material đủ → viết + handoff draft, vẫn báo anh link |

## Một “viên” bài hoàn chỉnh

```
1. Chat group có cặp hỏi–đáp hoặc mạch giảng
2. DIGEST liệt kê
3. Anh: Ok viết + đăng
4. Agent:
   - classify Article | Khai Trí (theo format)
   - viết VI + self-check
   - handoff file
5. immortality-mod:
   - EN
   - hero 16:9
   - thumbnail_url
   - POST status=draft
6. Anh nhận: publicUrl + admin
```

## File / job kỹ thuật

| Thành phần | Đường / tên |
|---|---|
| Skill distill | `bat-tu-dao-distill` |
| Skill publish | `immortality-api` + `immortality-cover-art` |
| Canonical capture | `de-tu…/group-kim-cuong/inbox.md` |
| Digest batch | `de-tu…/group-kim-cuong/pending-digest.json` |
| Delivery ACK | `de-tu…/group-kim-cuong/digest-ack.json` |
| Handoff | `…/group-kim-cuong/handoffs/*.md` |
| Cron digest | `kim-cuong-group-digest` · `0 */6 * * *` |
| Auto-sync (Mac) | launchd `vn.battudao.kim-cuong-sync` mỗi **5 phút** → inbox + qa |
| Sync tay | `npm run pipeline` / `npm run auto-sync:once` / `npm run ui` |
| Health | `npm run health:local` / `npm run health:e2e` |
| Group ID | `2528808185298561542` |

## Giới hạn còn lại

- **Không** kéo full history Zalo cũ (API 404) — pipeline sống từ tin **sau khi bật**.
- **Draft** mặc định — không auto `published` (an toàn).
- NL mới: vẫn theo skill (fetch Notion, không bịa từ report học trò).
