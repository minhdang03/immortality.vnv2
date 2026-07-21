#!/usr/bin/env bash
# Deploy Edge Function push-on-message lên prod (immortality.vn).
# Nạp SUPABASE_ACCESS_TOKEN từ .env — không cần supabase login, không lộ token ra màn hình.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env; set +a
REF=dzctvmrlsxwkcuidsqzk
echo "Deploying push-on-message → $REF ..."
# --use-api: bundle phía server, không cần Docker. Bỏ flag này nếu muốn dùng Docker local.
supabase functions deploy push-on-message --project-ref "$REF" --use-api
