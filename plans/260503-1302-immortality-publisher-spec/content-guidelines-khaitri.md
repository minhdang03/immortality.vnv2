# Content Guidelines — Chưng cất Khai Trí

Best practice cho việc biến **transcript** (Zalo/chat/voice note giữa Thầy Hà ↔ Người Bất Tử ↔ học viên) thành **entry Khai Trí** chuẩn cho `khaitri` collection.

Audience: CoWork (writer) hoặc Claude trong session khác. Agent goclaw chỉ parse + post, **không tự chưng cất nội dung**.

## Voice & tone

- **Voice tâm linh, kính trọng**, không nhuốm màu marketing. Người Bất Tử / Thầy Hà = nguồn — paraphrase phải bảo toàn ý gốc.
- **Đọc được cho người mới** không quen thuật ngữ. Nếu transcript dùng thuật ngữ riêng (vd "camera Tiến Tùng đảo lửa", "cột sóng thu lôi"), giữ nguyên + giải thích ngắn 1 lần.
- **Không thêm khẳng định khoa học** ("nghiên cứu cho thấy…", "đã được chứng minh…") — Khai Trí là chia sẻ trải nghiệm, không phải bài khoa học.
- **Không thêm CTA / promo** ("đăng ký khoá học…", "click vào đây…").

## Mapping transcript → entry

### Quyết định: 1 entry hay nhiều entry?

| Trường hợp | Quyết định |
|---|---|
| Transcript = 1 chủ đề, 1 cặp Q/A chính | **1 entry** |
| Transcript = 1 chủ đề, nhiều lượt Q/A xoay quanh chủ đề đó | **1 entry**, body là chuỗi `Hỏi:/Đáp:` ghép |
| Transcript = nhiều chủ đề rời rạc | **Nhiều entries** — mỗi chủ đề 1 file `.md` riêng |
| Transcript = 1 chủ đề nhưng dài & có 2-3 ý chính độc lập | **1 entry**, để admin dùng nút "Tách Hỏi/Đáp" trong UI nếu muốn split sau |

Mặc định nghiêng về **1 entry / chủ đề** — admin có nút split nếu cần. Tránh fragment quá nhỏ.

### Field-by-field guideline

| Field | Source từ transcript | Best practice |
|---|---|---|
| `titleVi` | Tự đặt — distill ý chính | 6-12 từ. Tránh clickbait. Nêu **chủ đề + góc nhìn** (vd "Cột sóng thu lôi năng lượng — kiểm chứng và mở rộng" tốt hơn "Hỏi về cột sóng") |
| `questionVi` | Lượt hỏi đầu tiên của người hỏi | Paraphrase nếu transcript lan man, giữ ý chính. 1-3 câu. Có thể bỏ filler "Em xin phép hỏi…", "Thưa thầy…" |
| `summaryVi` | Distill core teaching | 1-2 câu, ≤ 200 char. Là tóm tắt **CÂU TRẢ LỜI**, không phải tóm tắt câu hỏi. Trả lời câu "đọc bài này tôi rút ra gì?" |
| `bodyVi` | Toàn bộ Q/A (có thể nhiều lượt) | Format `Hỏi:/Đáp:` strict. Nguyên văn quan trọng — paraphrase tối thiểu. Giữ ngữ điệu của người trả lời (Thầy Hà / Người Bất Tử). |
| `tagVi` | Theme — tự chọn | 1-3 từ. Vocabulary suggest: `Năng Lượng`, `Sức Khỏe`, `Tu Tập`, `Thiền`, `Chữa Bệnh`, `Tâm Linh`, `Câu Chuyện`. Reuse tag cũ nếu có (giữ taxonomy nhỏ). |
| `*En` (EN fields) | Translate sau, hoặc empty string ban đầu | Optional v1. Khi dịch: bảo toàn thuật ngữ riêng (vd "camera Tiến Tùng đảo lửa" có thể giữ nguyên + gloss "third-eye 'Tiến Tùng đảo lửa' camera"). |

### Body format rules

- **Mỗi turn 1 paragraph**, prefix `Hỏi: ` / `Đáp: ` (VI) hoặc `Question: ` / `Answer: ` (EN)
- Cách turn bằng **2 newlines** (Markdown paragraph break)
- Nếu lượt đáp có nhiều ý → dùng newline đôi trong cùng `Đáp:` để xuống dòng, KHÔNG break thành `Đáp:` mới
- KHÔNG dùng heading `##` trong body (UI render plain text)
- KHÔNG dùng list `-` / `1.` trong body trừ khi thật cần (UI chưa render markdown — sẽ hiện literal `-`)

### Anti-patterns

- ❌ Title chung chung: "Lời dạy của Thầy" → mất discoverability
- ❌ Question = lời chào ("Thưa thầy con xin hỏi"); cắt phần substantive ra
- ❌ Summary = paraphrase title (redundant)
- ❌ Body chỉ có `Đáp:`, không có `Hỏi:` → break UI split feature, đọc khó
- ❌ Trộn nhiều chủ đề vào 1 entry "tổng hợp" — split thành nhiều
- ❌ Thêm bình luận của writer vào body ("Theo tôi đoạn này có nghĩa là…")
- ❌ Censor / soften lời dạy gốc cho "an toàn" hơn — nếu nguồn nói thẳng, giữ thẳng

## Quality bar checklist

Trước khi save file `.md` vào inbox, writer self-check:

- [ ] Title rõ chủ đề + góc nhìn
- [ ] Question đứng độc lập đọc được (không cần context bên ngoài)
- [ ] Summary stand-alone — đọc summary là biết bài nói gì
- [ ] Body Q/A nguyên văn (paraphrase tối thiểu), prefix đúng
- [ ] Tag dùng vocabulary đã có (check Firestore admin trước nếu unsure)
- [ ] `sourceRef` unique (timestamp-based khó collision)
- [ ] `order` không trùng entry mới nhất (check max order hiện tại)
- [ ] Không thuật ngữ chưa giải thích lần đầu xuất hiện
- [ ] Không CTA / promo / khoa học hoá

## Sample entry (reference — distilled từ transcript anh paste)

File: `Claw/goclaw/inbox/khaitri/khaitri-2026-05-03-001.md`

```markdown
---
sourceRef: "khaitri-2026-05-03-001"
order: 38
date: "2026-05-03"
tagVi: "Năng Lượng"
tagEn: "Energy"
titleVi: "Cột sóng thu lôi năng lượng — kiểm chứng và mở rộng"
titleEn: ""
questionVi: "Em tạo cột sóng thu lôi năng lượng để hút khí thải độc ra ngoài Trái Đất. Xin thầy kiểm chứng có thật không?"
questionEn: ""
summaryVi: "Buông lỏng não, lấy cảm giác cơ thể làm thước đo: khoẻ nhẹ là đúng, nặng đầu thì dừng. Khi đã mở camera Tiến Tùng đảo lửa, ý nghĩ tự thực hiện — dùng năng lượng này hút khí độc, chữa bệnh cho người khác."
summaryEn: ""
status: "draft"
source: "goclaw-publisher-v1"
---

Hỏi: Em tạo cột sóng thu lôi năng lượng để hút khí thải độc ra ngoài Trái Đất. Xin thầy kiểm chứng có thật không?

Đáp: Buông lỏng não. Khi nghĩ ra điều gì, lấy cảm giác cơ thể làm thước đo — khoẻ nhẹ là đúng, nặng đầu thì dừng. Đừng dùng não phán đoán đúng/sai, dùng cảm.

Hỏi: Em thấy cơ thể vẫn khoẻ, biết là ngoài khả năng nhưng vẫn kết nối được.

Đáp: Khi đã mở "con mắt thứ ba — camera Tiến Tùng đảo lửa" thì ý nghĩ tự thực hiện. Dùng năng lượng này để chữa bệnh cho người khác — hút khí độc ra. Không cần cố, để tự nhiên.
```

**Note:** đây là entry distilled từ tóm tắt 4 lượt anh đã paste, KHÔNG phải nguyên văn ảnh chat (em chưa đọc raw text). Anh review câu chữ — fix nếu sai ý — rồi đây là template seed cho file đầu tiên Agent post.

## Workflow đề xuất

1. **Anh / CoWork chưng cất** transcript → file `.md` theo schema → review câu chữ
2. **Anh drop file** vào `Claw/goclaw/inbox/khaitri/`
3. **Agent skill** chạy (manual trigger v1) → parse + signin Firebase → ghi `khaitri` doc `status: 'draft'` → move file `_done/`
4. **Anh login admin** `/admin` → KhaiTriTab → review entry → publish (nếu có UI publish action) hoặc chỉnh field cuối → giữ
5. (Sau, khi cần) **Translate EN** → tạo file thứ 2 cùng `sourceRef` + flag `update: true` → Agent merge `en.*` field vào doc cũ

## Open questions (đợi anh)

1. Vocabulary tag chuẩn: anh chốt list 5-10 tag để CoWork reuse, hay cứ tự do và admin ad-hoc dọn?
2. Khi transcript có **3+ người** (Thầy Hà + Người Bất Tử + học viên), prefix `Hỏi:/Đáp:` có đủ không, hay cần `Hỏi (Thầy Hà):` / `Đáp (Người Bất Tử):`? — UI hiện không parse role, sẽ hiện literal text.
3. Bài Khai Trí dài (>1500 chữ) có nên split thành nhiều entries để dễ đọc mobile không, hay 1 entry dài OK?
4. Title có cần kèm số thứ tự không (vd "38. Cột sóng…")? Hiện UI tự render `String(order).padStart(2, '0')` ở đầu nên KHÔNG cần kèm — anh xác nhận.
