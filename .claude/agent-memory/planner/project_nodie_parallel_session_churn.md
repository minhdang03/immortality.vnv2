---
name: nodie-parallel-session-churn
description: NODIE iOS có nhiều session chạy song song — file dirty map và số migration trôi theo phút; phải đo lại ngay trước khi code, không tin đề bài
metadata:
  type: project
---

Trên `apps/nodie-ios`, thường có 2+ session Claude chạy song song trên cùng branch `claude/immortality-mobile-hybrid`. Bản đồ "file nào đang dirty" trong đề bài **chết trong vòng ~10 phút**.

**Why:** Đo thực tế 17/07/2026 khi viết plan `260717-1325`: danh sách file cấm của đề bài đã sạch hết (session kia commit) trước cả khi bắt đầu; số migration trôi **3 lần trong 1 giờ** (`0026_public_profiles` →git mv→ `0027`; `0028_nodie_follows` mới xuất hiện; `0029` renumber). Nghiêm trọng nhất: **session kia đã viết sẵn đúng migration mà đề bài giao cho mình viết** (`0028_nodie_follows.sql`) — và bản của họ tốt hơn (có blocks↔follows hai chiều + trigger). Suýt viết trùng/đè.

**How to apply:**
- Trước mỗi phase: `git status --short` + `ls supabase/migrations/` + `git log --oneline -3`. Không tin số hiệu migration trong bất kỳ plan nào — **đối chiếu nội dung file**.
- Trước khi viết bất kỳ migration nào: grep xem thứ mình định tạo đã tồn tại chưa (bảng, view, cột).
- Giữ lệnh cấm file kể cả khi git đã sạch — họ quay lại bất cứ lúc nào. Nhưng **ghi rõ là git state đã đổi** để lead quyết định lại.
- Plan phải có mục "file ta đổi → báo plan kia rebase". Xem `plans/260717-1306-*/plan.md` — họ cũng đã tự rút ra luật này ("bản đồ đề bài đã chết, và bản đồ này cũng sẽ chết").

Liên quan: [[nodie-rls-anonymous-name-bug]]
</content>
