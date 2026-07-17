# Chuẩn hoá repo — 17/07/2026

Ảnh chụp thứ ĐO ĐƯỢC, không phải thứ tài liệu hứa.

## Nền tảng thật

| | Trạng thái |
|---|---|
| Web (`apps/web`) | ✅ sống → battudao.com |
| iOS (`apps/nodie-ios`) | ✅ sống — SwiftUI native |
| **Android** | ❌ **không tồn tại** — không project, không gradle, chưa từng dựng |

Android duy nhất từng khả thi là qua Expo EAS — mà Expo đã bỏ (14/07). Ai nói "đang có Android" là nhầm.

## Đã gỡ (tag `archive/pre-mobile-cleanup-260717`)

Ba stack mobile chồng nhau, hai đã chết mà vẫn nằm đó:
- **Capacitor** — `ios/`, `capacitor.config.json` (im 10 tuần / 4 tháng)
- **Expo SDK 54** — `apps/mobile`, 133 file (im 10 tuần)
- **`packages/`** — chỉ `apps/mobile` xài, chết theo
- **`package-lock.json`** ở root — dự án dùng pnpm; file npm lock 2 tháng tuổi chỉ mời gõ nhầm

153 file, −23.388 dòng. Lấy lại: `git checkout archive/pre-mobile-cleanup-260717 -- apps/mobile`

**Bằng chứng xoá an toàn:** `pnpm --filter @btd/web build` ra ĐÚNG ba hash production đang serve
(`index-DjhdzZxa` · `react-DghaKJPf` · `firebase-n6mqjdSS`) ⇒ bundle không đổi một byte.
Vercel cũng tự build `main` @ `65c5432` từ git → READY.

## Git — trước / sau

| | Trước | Sau |
|---|---|---|
| GitHub default | `claude/immortality-vite-react-ISIpv` — chết từ 09/05, kiến trúc khác hẳn | `main` |
| Vercel productionBranch | cùng branch chết ⇒ **git push không bao giờ deploy** | `main` |
| Cách deploy | `vercel --prod` TAY từ laptop | tự động từ git |
| Trunk | `claude/immortality-mobile-hybrid` — tên của chiến lược đã bỏ | `main` |

**Vì sao đây là bug, không phải sở thích:** productionBranch trỏ branch chết ⇒ branch đó không bao giờ
đổi ⇒ Vercel không bao giờ tự deploy ⇒ production chỉ đến từ ổ cứng laptop. Prod không khớp commit nào,
không rollback được, không tái lập được. Máy hỏng là không ai biết prod đang chạy gì.

## Còn nợ

- **Session song song** đang làm trên `claude/immortality-mobile-hybrid`. Đã đồng bộ = `main` (cùng
  `65c5432`) nên không ai mất gì, nhưng họ **phải chuyển sang `main`** — không thì hai nhánh lại rẽ.
- Xoá được sau khi họ xong: `claude/immortality-mobile-hybrid`,
  `claude/immortality-vite-react-ISIpv`, `fix/home-redesign-lang-ungho`, `stable-with-bugfixes`.
- **11 UITest Chat đỏ** — khẳng định trên MockData đã gỡ. Xem `plan.md`.

## Luật từ nay

- **`main` = trunk duy nhất. Push lên `main` là ra thẳng battudao.com.** Việc mới: cắt nhánh từ `main` → PR về `main`.
- **Không `vercel --prod` tay nữa** — production phải luôn là một commit có thật.
- **Không `npm install`** — pnpm, và chỉ `pnpm-lock.yaml`.
- **Không hồi sinh Expo/Capacitor** mà chưa hỏi Đăng. Android = `apps/nodie-android` (Kotlin/Compose), sau khi iOS 1.0 ổn.
