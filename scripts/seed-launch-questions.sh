#!/bin/bash
# Seed 12 câu hỏi mồi cho NODIE (plan 2015 phase 03, Đăng duyệt 18/07: cả 12, tác giả = tk ảo).
#
# Hai tầng:
#   1. Tạo 4 persona (Admin API — tạo user bằng SQL thẳng vào auth.users sẽ ra user
#      thiếu identity). Idempotent theo email. Mật khẩu ngẫu nhiên, KHÔNG lưu — đây là
#      account giữ nội dung, cần vào thì reset qua Admin API.
#   2. Chạy supabase/seed_nodie_launch_questions.sql (idempotent theo title).
#
# Seed là DỮ LIỆU, không phải schema → không chiếm số migration, không ghi _applied_migrations
# (đúng kỷ luật ghi ở đầu 0035).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -a; source "$ROOT/.env"; set +a
: "${SUPABASE_DB_URL:?thiếu SUPABASE_DB_URL}"
: "${VITE_SUPABASE_URL:?thiếu VITE_SUPABASE_URL}"
: "${SUPABASE_SECRET_KEY:?thiếu SUPABASE_SECRET_KEY}"

# Tên nghe tự nhiên, email domain battudao.com (không cần nhận mail — email_confirm sẵn).
PERSONAS=(
  "seed-thanh-vien-01@battudao.com|Minh Tâm"
  "seed-thanh-vien-02@battudao.com|Thu Hằng"
  "seed-thanh-vien-03@battudao.com|Quang Duy"
  "seed-thanh-vien-04@battudao.com|Ngọc Lan"
)

for entry in "${PERSONAS[@]}"; do
  email="${entry%%|*}"; name="${entry##*|}"
  exists=$(psql "$SUPABASE_DB_URL" -tAc "select count(*) from auth.users where email='${email}'")
  if [[ "$exists" == "0" ]]; then
    pass=$(openssl rand -base64 24)
    echo "→ Tạo persona ${name} <${email}>"
    curl -sf -X POST "${VITE_SUPABASE_URL}/auth/v1/admin/users" \
      -H "apikey: ${SUPABASE_SECRET_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_SECRET_KEY}" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"${email}\",\"password\":\"${pass}\",\"email_confirm\":true,\"user_metadata\":{\"display_name\":\"${name}\"}}" > /dev/null
  fi
done

echo "→ Seed câu hỏi mồi (dry-run rồi commit)"
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q \
  -c "begin;" -f "$ROOT/supabase/seed_nodie_launch_questions.sql" \
  -c "select count(*) as questions_sau_seed from public.questions where deleted_at is null;" \
  -c "rollback;"
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q -f "$ROOT/supabase/seed_nodie_launch_questions.sql"
echo "✅ Xong."
