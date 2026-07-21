#!/usr/bin/env bash
# Nạp secret cho push: sinh shared secret, cất vào Vault (cho trigger đọc) và vào
# Edge Function env (cho function kiểm). Hai nơi phải TRÙNG nhau — đây là lý do
# script này tồn tại thay vì copy-paste tay hai lần rồi lệch.
#
# Chạy lại được: mỗi lần chạy sinh secret MỚI và cập nhật cả hai nơi cùng lúc.
#
#   ./scripts/set-push-secrets.sh
#
# Cần: .env (APNS_*), supabase CLI đã `supabase login`, psql.
set -euo pipefail

cd "$(dirname "$0")/.."
[ -f .env ] || { echo "Không thấy .env"; exit 1; }
set -a; source .env; set +a
export PATH="$HOME/.local/bin:$PATH"

: "${SUPABASE_DB_URL:?thiếu SUPABASE_DB_URL}"
: "${APNS_KEY_ID:?thiếu APNS_KEY_ID}"
: "${APNS_KEY_PATH:?thiếu APNS_KEY_PATH}"
: "${APNS_TEAM_ID:?thiếu APNS_TEAM_ID}"
: "${APNS_BUNDLE_ID:?thiếu APNS_BUNDLE_ID}"
[ -f "$APNS_KEY_PATH" ] || { echo "Không thấy khoá APNs: $APNS_KEY_PATH"; exit 1; }

PROJECT_REF=$(echo "$VITE_SUPABASE_URL" | sed 's|https://||; s|\.supabase\.co||')
FN_URL="https://${PROJECT_REF}.supabase.co/functions/v1/push-on-message"
SECRET=$(openssl rand -hex 32)

echo "→ Nạp secret vào Edge Function"
# Khoá .p8 đi vào env của function dưới dạng PEM nguyên văn — function tự bóc base64 rồi
# importKey. Không commit, không nằm trong image.
supabase secrets set --project-ref "$PROJECT_REF" \
  PUSH_WEBHOOK_SECRET="$SECRET" \
  APNS_KEY_ID="$APNS_KEY_ID" \
  APNS_TEAM_ID="$APNS_TEAM_ID" \
  APNS_BUNDLE_ID="$APNS_BUNDLE_ID" \
  APNS_ENVIRONMENT="${APNS_ENVIRONMENT:-production}" \
  APNS_KEY_P8="$(cat "$APNS_KEY_PATH")" >/dev/null

echo "→ Nạp secret vào Vault (trigger 0026 đọc từ đây)"
# Vault không có upsert: xoá tên cũ rồi tạo lại. Nếu không, chạy lần hai sẽ đẻ ra hai
# secret trùng tên và trigger vớ phải cái nào là chuyện hên xui.
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q <<SQL
delete from vault.secrets where name in ('push_webhook_secret', 'push_function_url');
select vault.create_secret('${SECRET}', 'push_webhook_secret', 'Shared secret: trigger 0026 -> Edge Function push-on-message');
select vault.create_secret('${FN_URL}', 'push_function_url', 'URL Edge Function push-on-message');
SQL

echo "→ Kiểm tra"
psql "$SUPABASE_DB_URL" -tAc "select '  vault: '||name from vault.decrypted_secrets where name like 'push_%' order by name;"
echo "  function: $FN_URL"
echo "Xong. Đừng quên: supabase functions deploy push-on-message --no-verify-jwt --project-ref $PROJECT_REF"
echo "  (BẮT BUỘC --no-verify-jwt: trigger pg_net chỉ gửi x-push-secret, không có JWT — thiếu cờ là 401 và push chết IM LẶNG, lỗi chỉ nằm trong net._http_response vài giờ rồi tự xoá)"
