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
ENV_FILE="${NODIE_UITEST_ENV_FILE:-$ROOT/.env}"

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

# Người thứ BA — cho test "chọn người CHƯA có DM thì tạo mới". An/Bình đã dính nhau đủ kiểu,
# không dựng được trạng thái 'chưa có DM' từ hai người đó. Tạo qua Admin API chứ không SQL:
# chọc thẳng auth.users ra user thiếu identity, không đăng nhập được.
CHI_EMAIL="${NODIE_TEST_THIRD_EMAIL:-chi.nodie.test@gmail.com}"
CHI_NAME="Chi Thử Nghiệm"
: "${VITE_SUPABASE_URL:?❌ .env thiếu VITE_SUPABASE_URL}"
: "${SUPABASE_SECRET_KEY:?❌ .env thiếu SUPABASE_SECRET_KEY}"
: "${NODIE_TEST_PASSWORD:?❌ .env thiếu NODIE_TEST_PASSWORD}"

echo "→ Seed chat cho UITest (marker: $MARKER)"

CHI_EXISTS=$(psql "$SUPABASE_DB_URL" -tAc "select count(*) from auth.users where email='${CHI_EMAIL}'")
if [[ "$CHI_EXISTS" == "0" ]]; then
  echo "→ Tạo tài khoản thứ ba ${CHI_EMAIL} (Admin API)"
  curl -sf -X POST "${VITE_SUPABASE_URL}/auth/v1/admin/users" \
    -H "apikey: ${SUPABASE_SECRET_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SECRET_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${CHI_EMAIL}\",\"password\":\"${NODIE_TEST_PASSWORD}\",\"email_confirm\":true,\"user_metadata\":{\"display_name\":\"${CHI_NAME}\"}}" > /dev/null
fi

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
  leave_id uuid;
begin
  select id into an_id   from auth.users where email = '${NODIE_TEST_EMAIL}';
  select id into binh_id from auth.users where email = '${PEER_EMAIL}';

  if an_id is null then
    raise exception 'Không thấy tài khoản test %. Chạy seed của plan 1404 trước.', '${NODIE_TEST_EMAIL}';
  end if;
  if binh_id is null then
    raise exception 'Không thấy tài khoản đối phương %. Chạy seed của plan 1404 trước.', '${PEER_EMAIL}';
  end if;

  -- ── Chữa trạng thái Q&A của test Hoàn tác ───────────────────────────────────
  -- UndoDeleteUITests xoá mềm câu hỏi của An rồi hoàn tác. Test chết GIỮA hai bước
  -- (fail/kill/timeout) là câu hỏi nằm xoá mềm vĩnh viễn và MỌI run sau đỏ dây chuyền
  -- ngay ở "phải thấy câu hỏi" — đã dính thật 18/07. Seed phải trả nó về sống.
  update public.questions
  set deleted_at = null
  where title = 'Vì sao càng cố ngủ càng tỉnh?' and deleted_at is not null;

  -- ── Dọn: chỉ những kênh MANG MARKER ─────────────────────────────────────────
  -- messages/channel_members tự đi theo (on delete cascade ở 0017).
  delete from public.channels where title like '%[${MARKER}]%';

  -- Dọn thêm: DM KHÔNG marker giữa các tài khoản test (đồ thừa của lần chạy trước /
  -- của test "tạo DM mới" / của verify tay). Hai vế BẮT BUỘC đi cùng nhau:
  --   · KHÔNG có thành viên nào ngoài bộ account test, VÀ
  --   · CÓ ít nhất một thành viên là account test.
  -- Thiếu vế hai thì DM 0 thành viên (hai người thật cùng rời một DM — leave() cho phép)
  -- khớp rỗng một cách "chân không" và lịch sử của họ bị xoá vĩnh viễn. Code review 18/07 bắt.
  delete from public.channels c
  where c.kind = 'dm'
    and not exists (
      select 1 from public.channel_members m
      where m.channel_id = c.id
        and m.user_id not in (
          select id from auth.users
          where email in ('${NODIE_TEST_EMAIL}', '${PEER_EMAIL}', '${CHI_EMAIL}')
        )
    )
    and exists (
      select 1 from public.channel_members m2
      where m2.channel_id = c.id
        and m2.user_id in (
          select id from auth.users
          where email in ('${NODIE_TEST_EMAIL}', '${PEER_EMAIL}', '${CHI_EMAIL}')
        )
    );

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

  -- Tin THOẠI — cho test bubble voice render nút phát (phase 02 plan 1933).
  -- path trỏ vào hư không có chủ đích: test chỉ soi UI render từ metadata (nút phát,
  -- waveform, thời lượng), không phát thật. Waveform 50 mẫu như app gửi.
  insert into public.messages (channel_id, user_id, body, created_at, metadata) values
    (dm_id, binh_id, '', now() - interval '4 minutes',
     jsonb_build_object('media', jsonb_build_object(
       'kind', 'voice',
       'path', 'uitest-seed/khong-ton-tai.m4a',
       'duration', 6.0,
       'waveform', (select jsonb_agg(round((0.15 + 0.7 * abs(sin(n * 0.7)))::numeric, 3))
                    from generate_series(1, 50) n)
     )));

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

  -- ── Nhóm RIÊNG cho test "Rời khỏi" ──────────────────────────────────────────
  -- Test rời nhóm phá membership; cho nó phòng riêng để không giẫm lên các test khác
  -- đang cần nhóm chính còn nguyên (thứ tự chạy alphabet không đoán được).
  insert into public.channels (title, kind, created_by, last_message_at, slug)
  values ('Nhóm rời thử [${MARKER}]', 'group', an_id, now() - interval '3 minutes',
          'nhom-roi-thu-${MARKER}')
  returning id into leave_id;

  -- An last_read TRƯỚC tin của Bình → badge "1 tin chưa đọc" cho test mark-as-read.
  -- Dùng nhóm NÀY chứ không DM: các test ChatDetail (chạy trước theo alphabet) mở DM
  -- là badge của DM bị tiêu mất — còn nhóm rời thử thì không ai mở trước SwipeActions.
  insert into public.channel_members (channel_id, user_id, role, last_read_at) values
    (leave_id, an_id,   'member', now() - interval '10 minutes'),
    (leave_id, binh_id, 'mod',    now());

  insert into public.messages (channel_id, user_id, body, created_at) values
    (leave_id, binh_id, 'Nhóm này để test rời khỏi', now() - interval '3 minutes');

  raise notice 'DM=% GROUP=% LEAVE=%', dm_id, group_id, leave_id;
end
\$\$;

commit;
SQL

echo "✅ Xong. DM 5 tin + nhóm 2 tin, nội dung cố định."
