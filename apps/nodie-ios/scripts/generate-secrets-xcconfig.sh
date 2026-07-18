#!/bin/bash
# Sinh Config/Secrets.xcconfig từ .env ở gốc monorepo.
#
# Chạy trước `xcodegen generate` khi clone mới hoặc khi .env đổi.
# Secrets.xcconfig bị gitignore — không bao giờ commit.
#
# Chỉ lấy anon key (public-safe, RLS bảo vệ dữ liệu).
# service_role / SUPABASE_SECRET_KEY TUYỆT ĐỐI không được vào app client.
set -euo pipefail

cd "$(dirname "$0")/.."
ENV_FILE="../../.env"
OUT="Config/Secrets.xcconfig"

[ -f "$ENV_FILE" ] || { echo "✗ Không thấy $ENV_FILE"; exit 1; }

read_env() { grep "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"'\''' | tr -d '\r'; }

URL=$(read_env VITE_SUPABASE_URL)
KEY=$(read_env VITE_SUPABASE_ANON_KEY)
# Sitekey Turnstile — public theo thiết kế (nằm trong bundle web luôn rồi).
# Secret thì KHÔNG BAO GIỜ vào app: nó sống ở Supabase Auth config.
TURNSTILE=$(read_env TURNSTILE_SITE_KEY)

[ -n "$URL" ] && [ -n "$KEY" ] || { echo "✗ Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong $ENV_FILE"; exit 1; }

# Tài khoản cho UI test auth. KHÔNG bắt buộc: thiếu thì test auth tự skip
# (xem AuthUITests.credentials()), build app vẫn chạy bình thường.
# Chỉ scheme test đọc 2 biến này — không vào Info.plist nên không nằm trong app ship đi.
TEST_EMAIL=$(read_env NODIE_TEST_EMAIL)
TEST_PASSWORD=$(read_env NODIE_TEST_PASSWORD)
TEST_DISPLAY_NAME=$(read_env NODIE_TEST_DISPLAY_NAME)

mkdir -p Config
# CHỈ lưu host, KHÔNG lưu URL đầy đủ: xcconfig coi "//" là mở comment nên
# "https://host" bị cắt còn "https:" — lỗi im lặng, chỉ lộ ra lúc chạy.
# Swift ghép lại thành https://<host> (xem SupabaseClientProvider).
cat > "$OUT" <<EOF
// SINH TỰ ĐỘNG bởi scripts/generate-secrets-xcconfig.sh — đừng sửa tay, đừng commit.
SUPABASE_HOST = ${URL#https://}
SUPABASE_ANON_KEY = $KEY
TURNSTILE_SITEKEY = $TURNSTILE
NODIE_TEST_EMAIL = $TEST_EMAIL
NODIE_TEST_DISPLAY_NAME = $TEST_DISPLAY_NAME
NODIE_TEST_PASSWORD = $TEST_PASSWORD
EOF

echo "✓ Đã sinh $OUT (host: ${URL#https://})"
[ -n "$TEST_EMAIL" ] && [ -n "$TEST_PASSWORD" ] \
  && echo "✓ Có NODIE_TEST_* — test auth sẽ chạy thật" \
  || echo "! Thiếu NODIE_TEST_EMAIL/NODIE_TEST_PASSWORD trong $ENV_FILE — test auth sẽ skip"
