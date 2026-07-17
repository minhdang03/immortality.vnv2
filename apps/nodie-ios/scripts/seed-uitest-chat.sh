#!/usr/bin/env bash
# Dựng dữ liệu chat cố định cho XCUITest: 1 DM (An ↔ Bình) + 1 nhóm, nội dung bất biến.
#
# VÌ SAO CÓ FILE NÀY: test cũ assert vào thế giới MockData ("Hà Chi", "Lab trường thọ #3",
# "12 tin chưa đọc"). Mock đã bị gỡ khi Chat nối vào Supabase thật ⇒ 24/35 test đỏ. Test
# phải chạy trên dữ liệu THẬT, mà dữ liệu thật thì phải biết trước nó là gì — nên seed.
#
# CHẠY NGOÀI APP, bằng service key: app chạy dưới RLS của user thường (đúng như production),
# nó KHÔNG được phép tự dựng sân khấu cho mình. Seed trong app process cũng là seed dưới
# quyền user → lại không kiểm tra được phân quyền, đúng cái bẫy đã giấu 3 bug P0.
#
# IDEMPOTENT: xoá theo marker rồi tạo lại. Chạy 10 lần ra 10 kết quả giống nhau.
#
# Dùng: scripts/seed-uitest-chat.sh
# Cần:  SUPABASE_DB_URL trong .env ở gốc repo (immortality-vn/.env)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ENV_FILE="$ROOT/.env"

[[ -f "$ENV_FILE" ]] || { echo "❌ Không thấy $ENV_FILE"; exit 1; }
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

: "${SUPABASE_DB_URL:?❌ .env thiếu SUPABASE_DB_URL}"
: "${NODIE_TEST_EMAIL:?❌ .env thiếu NODIE_TEST_EMAIL}"

# Tài khoản đối phương — cố định theo seed của plan 1404.
PEER_EMAIL="${NODIE_TEST_PEER_EMAIL:-binh.nodie.test@gmail.com}"

# Marker: MỌI thứ script này tạo đều mang dấu này, và nó chỉ xoá thứ mang dấu này.
# Không có marker thì "dọn trước khi seed" sẽ xoá nhầm dữ liệu Q&A mà plan 1404 đã seed
# trên cùng tài khoản.
MARKER='uitest-chat-seed'

echo "→ Seed chat cho UITest (marker: $MARKER)"

psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q <<SQL
begin;

-- Hai tài khoản test phải tồn tại sẵn (plan 1404 phase 00 đã tạo). Không tự tạo user ở đây:
-- tạo user là việc của Auth, chọc thẳng auth.users bằng SQL sẽ ra user thiếu identity và
-- không đăng nhập được.
do \$\$
declare
  an_id uuid;
  binh_id uuid;
  dm_id uuid;
  group_id uuid;
begin
  select id into an_id   from auth.users where email = '${NODIE_TEST_EMAIL}';
  select id into binh_id from auth.users where email = '${PEER_EMAIL}';

  if an_id is null then
    raise exception 'Không thấy tài khoản test %. Chạy seed của plan 1404 trước.', '${NODIE_TEST_EMAIL}';
  end if;
  if binh_id is null then
    raise exception 'Không thấy tài khoản đối phương %. Chạy seed của plan 1404 trước.', '${PEER_EMAIL}';
  end if;

  -- ── Dọn: chỉ những kênh MANG MARKER ─────────────────────────────────────────
  -- messages/channel_members tự đi theo (on delete cascade ở 0017).
  delete from public.channels where title like '%[${MARKER}]%';

  -- ── DM An ↔ Bình ────────────────────────────────────────────────────────────
  -- Tạo thẳng chứ không gọi RPC create_dm: RPC chạy dưới auth.uid() của người gọi, mà psql
  -- không có phiên đăng nhập nào. Ở đây là service context nên dựng tay, đúng thứ RPC dựng.
  insert into public.channels (title, kind, created_by, last_message_at)
  values ('An ↔ Bình [${MARKER}]', 'dm', an_id, now())
  returning id into dm_id;

  insert into public.channel_members (channel_id, user_id, last_read_at) values
    (dm_id, an_id,   now() - interval '10 minutes'),
    (dm_id, binh_id, now());

  -- Nội dung CỐ ĐỊNH — test assert đúng vào các chuỗi này.
  -- created_at giãn ra để thứ tự ổn định, không phụ thuộc tốc độ insert.
  insert into public.messages (channel_id, user_id, body, created_at) values
    (dm_id, binh_id, 'Chào An 👋',                  now() - interval '9 minutes'),
    (dm_id, an_id,   'Chào Bình, khoẻ không?',      now() - interval '8 minutes'),
    (dm_id, binh_id, 'Mình khoẻ, cảm ơn bạn nhé',   now() - interval '7 minutes'),
    (dm_id, binh_id, 'Tin nhắn kiểm thử số bốn',    now() - interval '6 minutes'),
    (dm_id, binh_id, 'Tin nhắn kiểm thử số năm',    now() - interval '5 minutes');

  -- ── Nhóm ────────────────────────────────────────────────────────────────────
  insert into public.channels (title, kind, created_by, last_message_at, slug)
  values ('Nhóm kiểm thử [${MARKER}]', 'group', an_id, now() - interval '4 minutes',
          'nhom-kiem-thu-${MARKER}')
  returning id into group_id;

  insert into public.channel_members (channel_id, user_id, role, last_read_at) values
    (group_id, an_id,   'mod',    now()),
    (group_id, binh_id, 'member', now());

  insert into public.messages (channel_id, user_id, body, created_at) values
    (group_id, an_id,   'Chào cả nhóm',              now() - interval '5 minutes'),
    (group_id, binh_id, 'Tin nhắn nhóm kiểm thử',    now() - interval '4 minutes');

  raise notice 'DM=% GROUP=%', dm_id, group_id;
end
\$\$;

commit;
SQL

echo "✅ Xong. DM 5 tin + nhóm 2 tin, nội dung cố định."
