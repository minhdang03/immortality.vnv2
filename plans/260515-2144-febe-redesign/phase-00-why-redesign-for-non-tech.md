# Phase 00 — Vì sao redesign (giải thích cho người không rành kỹ thuật)

> Doc này viết cho người KHÔNG biết code đọc. Mục tiêu: hiểu vì sao tốn 4-6 tuần dọn dẹp, mà không thấy tính năng mới nào hiện ra.

---

## 1. Bất Tử Đạo là gì về mặt kỹ thuật?

Tưởng tượng anh đang vận hành **một quán cà phê online**. Khách (user) vào quán bằng 2 cửa:

- **Cửa Web** — battudao.com mở trên trình duyệt
- **Cửa Mobile** — app điện thoại (đang chuẩn bị mở)

Bên trong quán có:

| Bộ phận | Việc làm | Tương đương kỹ thuật |
|---|---|---|
| **Bảng thực đơn** (menu cố định) | Hiển thị bài viết, câu chuyện, hỏi đáp khai trí | "Frontend" — phần khách nhìn thấy |
| **Đầu bếp** (làm món) | Khi khách bấm "đăng câu hỏi", có người ghi xuống, lưu vào sổ | "Backend" — phần xử lý phía sau |
| **Tủ hồ sơ khách** (CSDL) | Lưu danh sách bài viết, hồ sơ, comment | "Database" — nơi lưu dữ liệu |
| **Bảng tên khách** (đăng nhập) | Biết ai vào quán, ai là chủ quán | "Authentication" — đăng nhập |
| **Kho hàng** (file ảnh, audio) | Chứa hình bìa bài viết, file âm thanh Khai Trí | "Storage" — kho lưu trữ |
| **Loa phát** (thông báo) | Gửi tin nhắn xuống điện thoại khi có comment mới | "Push notification" |

Khi anh vào battudao.com lúc 11h đêm, toàn bộ guồng máy này phải chạy. Khi anh launch app mobile, **cũng guồng máy đó phục vụ**.

---

## 2. Tình hình hiện tại — "3 bếp cho 1 quán"

Trong 3 tháng qua, mỗi lần em (Claude) trước được giao việc mới, em "đụng đâu xây đó". Kết quả:

> **Cùng 1 quán cà phê, hiện có 3 cái bếp đang chạy song song.**

| Bếp | Tên thật | Đang nấu gì |
|---|---|---|
| **Bếp 1** | Firebase Functions (Google) | Nấu món "OG render" (lúc share link Facebook ra ảnh đẹp) |
| **Bếp 2** | Vercel `/api/*` | Nấu món "OG render" (giống bếp 1!) + upload ảnh + chat AI |
| **Bếp 3** | Cloudflare Workers (chưa bật) | Đã xây sẵn nhưng chưa cắm điện, chưa nấu món nào |

**Vấn đề khi có 3 bếp:**

### Vấn đề 1: Cùng món, 2 bếp nấu — 1 bếp tắt thì khách báo "món sống"

Hiện tại khi anh share link bài viết lên Facebook, có 2 chỗ vẽ ảnh preview cho Facebook. Nếu anh đổi nội dung bài viết:
- Bếp 1 (Firebase) update đúng
- Bếp 2 (Vercel) vẫn vẽ ảnh cũ vì code đã fork ra rồi

Khách thấy ảnh sai → tưởng quán đăng tin giả.

### Vấn đề 2: 3 cuốn sổ kế toán

Mỗi bếp có 1 dashboard riêng (Firebase Console, Vercel Dashboard, Cloudflare Dashboard). Mỗi nơi 1 password, 1 cách báo lỗi, 1 nơi để cài secret (API key).

Anh muốn debug 1 bug → phải mở 3 cửa sổ trình duyệt, tìm log ở 3 nơi.

### Vấn đề 3: Mobile app sắp launch — không biết bếp nào phục vụ

App điện thoại sắp submit App Store. Nó cần biết "khi tôi đăng câu hỏi, gửi vào đâu?".

- Nếu trỏ vào Bếp 1 (Firebase) → cold start chậm (3-10 giây), khách bấm xong chờ → đóng app
- Nếu trỏ vào Bếp 2 (Vercel) → đỡ chậm hơn nhưng vẫn có giới hạn
- Nếu trỏ vào Bếp 3 (Cloudflare) → nhanh nhất (5ms) nhưng chưa cắm điện

**Hiện tại app trỏ vào Bếp 2** vì là cái duy nhất có sẵn. Nhưng:
- Mỗi tháng Vercel cho ~100GB băng thông miễn phí — nếu mobile app pull bài viết kèm hình thì rất nhanh hết
- Vercel không hỗ trợ "chat live" (Đối Thoại Sâu) — chat real-time cần công nghệ khác

### Vấn đề 4: An ninh lỏng

Hiện tại, **bất kỳ ai đăng nhập vào Bất Tử Đạo bằng email đều có quyền chủ quán** (admin). Đây không phải lỗ hổng theo nghĩa "hack được" — vì hiện chỉ anh có email đăng nhập. Nhưng:
- Nếu mai mở public signup (cho mọi người tạo account) → bất kỳ ai cũng xóa được bài viết
- Đây là "bom hẹn giờ" — phải fix trước khi mở cửa cho công chúng

### Vấn đề 5: Không có sao lưu

Toàn bộ data (bài viết, câu hỏi, comment, hồ sơ donor) chỉ có 1 bản trên server Google. Nếu:
- Account Google bị khóa
- Lỡ tay xóa nhầm 1 collection
- Google policy đổi

→ **mất hết**. Hiện không có file backup tự động nào.

---

## 3. Vì sao phải dọn — "đang ổn thì sao động vào?"

Câu hỏi hợp lý. Em trả lời thẳng:

> **"Đang ổn" không phải vì hệ thống tốt, mà vì chưa có ai test giới hạn.**

Hiện tại:
- Chỉ anh + vài người thân vào quán
- Mobile app chưa launch
- Khách share link Facebook không nhiều
- Chưa ai cố xóa bài viết "thử"

Khi 3 tháng nữa anh launch mobile + viral 1 bài → **lúc đó 3 vấn đề trên đồng loạt bộc lộ**. Sửa lúc đang chạy live = stress + downtime + user mất niềm tin.

**Dọn lúc còn nhỏ rẻ hơn 10 lần dọn lúc đang chạy live.**

---

## 4. Giải pháp — "1 bếp duy nhất, hiện đại, rẻ"

### Em sẽ phá 2 bếp cũ, giữ 1 bếp mới (Cloudflare)

| Thay đổi | Trước | Sau |
|---|---|---|
| Bếp nấu món | 3 bếp (Firebase Functions + Vercel + CF Workers) | 1 bếp (Cloudflare Workers) |
| Tủ hồ sơ khách | Firebase Firestore | Firebase Firestore (GIỮ) |
| Bảng tên đăng nhập | Firebase Auth | Firebase Auth (GIỮ) |
| Loa thông báo | Firebase FCM | Firebase FCM (GIỮ) |
| Mặt tiền quán (web) | Firebase Hosting | Cloudflare Pages (đổi) |
| Kho hàng | Cloudflare R2 | Cloudflare R2 (GIỮ) |
| Sao lưu | Không có | Auto daily backup → R2 |

### Vì sao Cloudflare?

| Lý do | Giải thích cho non-tech |
|---|---|
| **Server đặt gần khách VN** | Cloudflare có "trạm" ở Sài Gòn + Hà Nội. Firebase đặt ở Mỹ. Khách VN load nhanh hơn 10x. |
| **Băng thông không tính tiền** | Firebase/Vercel tính tiền theo GB. Cloudflare miễn phí không giới hạn. Mobile app pull data nhiều = save tiền |
| **Khởi động nhanh** | Bếp Firebase mất 3-10 giây để "nóng". Bếp Cloudflare 5 mili giây. Mobile UX khác biệt rõ |
| **Free tier rộng** | 100 nghìn request/ngày miễn phí. Hiện anh dùng < 1% giới hạn này |
| **Chat live native** | Cloudflare có công nghệ "Durable Objects" — chat real-time miễn phí, không cần thuê dịch vụ ngoài |

### Vì sao GIỮ Firebase (3 thứ)?

Em không bỏ Firebase hoàn toàn vì:

1. **Firebase Auth (đăng nhập)** — đang work, mobile app dùng Firebase SDK native (Apple Sign In + Google Sign In tích hợp 1 dòng code). Đổi đi = mọi user phải đăng nhập lại + viết lại code rất nhiều
2. **Firebase Firestore (kho dữ liệu)** — đang lưu 20+ collection bài viết. Đổi sang database khác = viết lại toàn bộ 19 cái "tay nắm cửa" (hooks) ở frontend. Effort 4-6 tuần riêng cho phần này
3. **Firebase FCM (push notification)** — gửi thông báo xuống điện thoại Android + iOS qua 1 API duy nhất. Không có dịch vụ thay thế miễn phí tương đương

**Kết luận:** Giữ Firebase ở vai trò "tủ hồ sơ + bảng tên + loa thông báo". Cloudflare lo "bếp nấu + mặt tiền quán + kho hàng".

---

## 5. Sẽ làm gì — chia 6 giai đoạn (4-6 tuần)

Em chia thành 6 giai đoạn nhỏ, **làm song song bếp cũ + bếp mới**, không tắt bếp cũ trước khi bếp mới đã phục vụ ổn 1 tuần. Triết lý: **không bao giờ để khách không có món**.

| Giai đoạn | Việc làm | Tuần | Ai thấy thay đổi? |
|---|---|---|---|
| **1. Móng** | Xây bếp Cloudflare, dạy nó nấu món OG | 1-2 | Không ai. Internal. |
| **2. Mobile API** | Bếp mới phục vụ mobile app (chat live, upload, Q&A) | 2-3 | App tester. Public chưa. |
| **3. Đổi mặt tiền** | battudao.com chuyển từ server Google sang Cloudflare | 3-4 | Có thể có 5-10 phút "ngắt nhẹ" lúc đổi DNS. Em sẽ làm lúc 3h sáng VN. |
| **4. Notion + AI** | Cron job sync bài từ Notion + AI Hỏi Ngược chạy trên bếp mới | 4-5 | Không ai. Internal. |
| **5. Database hygiene** | Sao lưu tự động, validation, indexes vào git | 5 | Không ai. Bảo hiểm cho tương lai. |
| **6. Dọn bếp cũ + Khóa cửa admin** | Tắt Firebase Functions, tắt Vercel, fix admin auth lỏng | 5-6 | Không ai (nếu mọi thứ ổn 5 giai đoạn trước). |

**Tổng:** 4-6 tuần, làm dần, không break.

---

## 6. Rủi ro + cách giảm

| Rủi ro | Có thể xảy ra | Em làm gì |
|---|---|---|
| Đổi DNS sai → battudao.com down | Có | TTL thấp 24h trước, rollback trong 5 phút nếu lỗi |
| Bếp mới nấu món OG khác bếp cũ → ảnh share Facebook lệch | Có thể | Chạy song song 1 tuần, test bằng tool Facebook Sharing Debugger |
| Mobile app cũ cache endpoint cũ → không kết nối được | Thấp | Mobile chưa launch public, em verify trước App Store submit |
| Lỡ tay xóa Firebase Functions trước khi bếp mới ổn | Em đã đặt rule: chỉ tắt sau 14-21 ngày verify | |
| Siết admin auth → anh bị khóa khỏi chính web của mình | Có thể | Em yêu cầu anh confirm UID + test trên emulator trước khi áp dụng prod |
| Costs vọt khi traffic spike | Thấp với Cloudflare free tier | Monitor weekly, có alert nếu vượt 50% free tier |

---

## 7. Tiền — sẽ tốn bao nhiêu?

**Hiện tại:** ~0 đồng/tháng (đang dưới free tier mọi nơi)

**Sau redesign:** 0 đồng/tháng → ~125,000đ/tháng khi scale 10x lượng user hiện tại

**So với cách KHÔNG redesign (cứ giữ 3 bếp + thuê Ably cho chat live):**
- 3 tháng nữa khi mobile launch: ~$50/tháng (~1.2 triệu/tháng)
- Tiết kiệm dài hạn: $50-100/tháng (~1.2-2.4 triệu/tháng)

---

## 8. Tiến độ — khi nào xong?

- **Tuần 1-2:** Giai đoạn 1 (móng) — kết thúc khi share link Facebook trên bếp mới ra ảnh đúng
- **Tuần 2-3:** Giai đoạn 2 (mobile API) — kết thúc khi app dev có thể chat live + post Q&A
- **Tuần 3-4:** Giai đoạn 3 (đổi mặt tiền) — kết thúc khi battudao.com hoàn toàn chạy trên Cloudflare 7 ngày không lỗi
- **Tuần 4-5:** Giai đoạn 4 (Notion + AI) — kết thúc khi cron sync chạy ổn 7 ngày
- **Tuần 5:** Giai đoạn 5 (DB hygiene) — kết thúc khi có backup file đầu tiên trên R2
- **Tuần 5-6:** Giai đoạn 6 (dọn dẹp) — kết thúc khi Firebase Functions + Vercel đã tắt, admin đã siết

**Mốc public:** sau Giai đoạn 6, anh có thể launch mobile App Store + mở public signup mà không lo bom nổ.

---

## 9. Q&A dự đoán

**Q: Sao không làm 1 lần cho xong, chia 6 giai đoạn làm gì?**
A: Mỗi giai đoạn là 1 "checkpoint" — nếu lỗi, chỉ rollback giai đoạn đó, không phải toàn bộ. Như leo núi có nhiều trạm dừng, không bị đứt một cú là rơi xuống chân núi.

**Q: Có cần báo trước cho user không?**
A: Chỉ cần báo cho user pre-launch (bạn bè anh đang test). Giai đoạn 3 (đổi DNS) có thể có 5-10 phút ngắt, em làm 3h sáng VN khi traffic thấp nhất. Public chưa launch nên đa số không thấy gì.

**Q: Em (Claude) làm 1 mình hay cần thêm người?**
A: Em làm 1 mình. Anh chỉ cần:
- Trả lời 6 câu hỏi mở đầu (xem `plan.md` Open Questions)
- Approve cutover từng giai đoạn (em báo trước, anh "OK" thì em làm)
- Đứng cạnh giai đoạn 3 (đổi DNS) để rollback nếu cần

**Q: Mình KHÔNG redesign được không? Cứ để vậy thì sao?**
A: Có thể, nhưng:
- 3 tháng nữa khi mobile launch, anh sẽ phải dọn dưới áp lực live traffic
- Costs sẽ vượt free tier (~$50/tháng) khi user > 1000
- Admin auth lỏng là rủi ro thực — chỉ chờ ai đó signup là họ thành admin
- Mất ngủ debug bug ở 3 dashboard

Dọn lúc nhỏ rẻ + an toàn + không stress. Đây là "phòng cháy", không phải "chữa cháy".

---

## 10. Kết luận 1 câu

> **Em phá 2 bếp cũ chồng chéo, giữ 3 thứ Firebase đang work tốt, dồn tất cả compute về 1 bếp Cloudflare nhanh-rẻ-có sẵn. Làm dần 6 giai đoạn 4-6 tuần, không break. Sau khi xong: 1 source of truth, mobile launch sẵn sàng, costs $0-5/tháng, an toàn cho public signup.**

---

## Next

Anh đọc xong doc này, anh có thể:
1. Skim các phase file kỹ thuật (phase-01 → phase-06) để biết chi tiết
2. Hoặc bỏ qua phần kỹ thuật, chỉ approve plan + trả lời 6 open questions trong `plan.md`

Em sẵn sàng bắt đầu Phase 1 khi anh nói "go".
