#!/usr/bin/env bash
# Gate release: chạy full UITest suite N lần liên tiếp (mặc định 3), SEED TRƯỚC MỖI LẦN.
#
# Seed-mỗi-lần KHÔNG phải tuỳ chọn: ba test là kẻ tiêu thụ trạng thái một-lần —
# mark-as-read tiêu badge, leave tiêu membership, "tạo DM mới với Chi" tiêu trạng thái
# "chưa có DM". Chạy lần hai trên dữ liệu cũ là đỏ oan, không phải hồi quy.
#
# Dùng: scripts/run-uitest-gate.sh [số_lần]
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

RUNS="${1:-3}"
ROOT="$(cd ../.. && pwd)"
set -a; source "$ROOT/.env"; set +a

fails=0
for i in $(seq 1 "$RUNS"); do
  echo "===== GATE RUN $i/$RUNS ====="
  bash scripts/seed-uitest-chat.sh > /dev/null
  xcodebuild -project NODIE.xcodeproj -scheme NODIE \
    -destination 'platform=iOS Simulator,name=iPhone 17' test 2>&1 \
    | grep -E "Test Case.*failed|error: -|Executed [0-9]+ tests, with|xcodebuild: error" | tail -12
  # grep ăn mất exit code của xcodebuild — đọc kết quả từ dòng tổng kết thay vì $?.
  # tail -12 chứ đừng ít hơn: 2 failure là 4+ dòng, tail hẹp nuốt mất failure đầu.
done
echo "===== HẾT $RUNS RUN — đọc các dòng 'Executed … with N failures' ở trên ====="
