#!/usr/bin/env bash
# Gate release: chạy full UITest suite N lần liên tiếp (mặc định 3), SEED TRƯỚC MỖI LẦN.
#
# Seed-mỗi-lần KHÔNG phải tuỳ chọn: ba test là kẻ tiêu thụ trạng thái một-lần —
# mark-as-read tiêu badge, leave tiêu membership, "tạo DM mới với Chi" tiêu trạng thái
# "chưa có DM". Chạy lần hai trên dữ liệu cũ là đỏ oan, không phải hồi quy.
#
# Dùng: scripts/run-uitest-gate.sh 3
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [[ "$#" -ne 1 || "$1" != "3" ]]; then
  echo "Dùng: scripts/run-uitest-gate.sh 3" >&2
  echo "❌ Release gate bắt buộc đúng 3 lần liên tiếp." >&2
  exit 64
fi

# Token design sạch trước đã — grep 1 giây, khỏi tốn 3 vòng UITest rồi mới biết màu drift.
scripts/check-design-tokens.sh

RUNS=3
ROOT="$(cd ../.. && pwd)"
ENV_FILE="${NODIE_UITEST_ENV_FILE:-$ROOT/.env}"
SEED_SCRIPT="${NODIE_UITEST_SEED_SCRIPT:-scripts/seed-uitest-chat.sh}"
XCODEBUILD_BIN="${NODIE_XCODEBUILD_BIN:-xcodebuild}"
DESTINATION="${NODIE_UITEST_DESTINATION:-platform=iOS Simulator,name=iPhone 17}"
# Đếm cứng để một suite lặng lẽ không chạy (sai tên target, file mới quên xcodegen) không
# trôi qua gate dưới dạng "xanh". Thêm/bớt test thì SỬA SỐ NÀY, đừng nới điều kiện.
# 38 → 50: +5 AccessibilityUITests, +4 TouchTargetUITests, +3 TrustUXUITests (a11y AA + trust copy).
# 50 → 51: +1 LegalAccessUITests (nội quy cộng đồng mở được từ màn đăng nhập, guideline 1.2).
EXPECTED_TESTS=51

[[ -f "$ENV_FILE" ]] || { echo "❌ Không thấy $ENV_FILE" >&2; exit 66; }

# Validate trong subshell để DB URL/service key không lọt sang xcodebuild và app test.
(
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  required_env=(
    SUPABASE_DB_URL
    NODIE_TEST_EMAIL
    NODIE_TEST_DISPLAY_NAME
    VITE_SUPABASE_URL
    SUPABASE_SECRET_KEY
    NODIE_TEST_PASSWORD
  )
  for name in "${required_env[@]}"; do
    [[ -n "${!name:-}" ]] || { echo "❌ $ENV_FILE thiếu $name" >&2; exit 66; }
  done
)

[[ -f "$SEED_SCRIPT" ]] || { echo "❌ Không thấy seed script: $SEED_SCRIPT" >&2; exit 66; }
command -v "$XCODEBUILD_BIN" >/dev/null 2>&1 || {
  echo "❌ Không tìm thấy xcodebuild: $XCODEBUILD_BIN" >&2
  exit 69
}

STAMP="$(date +%Y%m%d-%H%M%S)"
ARTIFACT_DIR="${NODIE_UITEST_RESULTS_DIR:-${TMPDIR:-/tmp}/nodie-uitest-gate-${STAMP}-$$}"
mkdir -p "$ARTIFACT_DIR"
COMMIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
trap 'echo "❌ Gate bị ngắt. Artifact giữ tại: $ARTIFACT_DIR" >&2; exit 130' INT TERM

echo "→ Commit: $COMMIT_SHA"
echo "→ Artifact: $ARTIFACT_DIR"

summaries=()
for i in 1 2 3; do
  echo "===== GATE RUN $i/$RUNS ====="
  # Simulator tươi cho mỗi run: sau nhiều full-suite liên tiếp, runner bắt đầu chết ngay
  # lúc "Running tests..." (Executed 0 tests) — đo được 18/07 sau ~6 run trong ngày.
  # Shutdown là đủ (xcodebuild tự boot lại); KHÔNG erase — boot từ đầu tốn thêm ~1 phút/run.
  xcrun simctl shutdown all 2>/dev/null || true
  seed_log="$ARTIFACT_DIR/run-${i}-seed.log"
  set +e
  NODIE_UITEST_GATE_RUN="$i" NODIE_UITEST_ENV_FILE="$ENV_FILE" \
    bash "$SEED_SCRIPT" 2>&1 | tee "$seed_log"
  seed_rc=${PIPESTATUS[0]}
  set -e
  if [[ "$seed_rc" -ne 0 ]]; then
    echo "❌ Run $i: seed thất bại (exit $seed_rc). Log: $seed_log" >&2
    exit "$seed_rc"
  fi

  test_log="$ARTIFACT_DIR/run-${i}-xcodebuild.log"
  result_bundle="$ARTIFACT_DIR/run-${i}.xcresult"
  set +e
  env \
    -u SUPABASE_DB_URL \
    -u SUPABASE_SECRET_KEY \
    -u NODIE_TEST_EMAIL \
    -u NODIE_TEST_DISPLAY_NAME \
    -u NODIE_TEST_PASSWORD \
    NODIE_UITEST_GATE_RUN="$i" \
    "$XCODEBUILD_BIN" \
    -project NODIE.xcodeproj \
    -scheme NODIE \
    -destination "$DESTINATION" \
    -parallel-testing-enabled NO \
    -resultBundlePath "$result_bundle" \
    test 2>&1 | tee "$test_log"
  xcode_rc=${PIPESTATUS[0]}
  set -e

  summary="$(grep -E 'Executed [0-9]+ tests?, with [0-9]+ failures?' "$test_log" | tail -1 || true)"
  if [[ -z "$summary" ]]; then
    echo "❌ Run $i: thiếu XCTest summary. xcodebuild exit $xcode_rc. Log: $test_log" >&2
    exit 65
  fi
  if [[ ! "$summary" =~ Executed[[:space:]]+([0-9]+)[[:space:]]+tests?,[[:space:]]+with[[:space:]]+([0-9]+)[[:space:]]+failures? ]]; then
    echo "❌ Run $i: XCTest summary không parse được: $summary" >&2
    exit 65
  fi

  test_count="${BASH_REMATCH[1]}"
  failure_count="${BASH_REMATCH[2]}"
  if [[ "$xcode_rc" -ne 0 || "$test_count" -ne "$EXPECTED_TESTS" || "$failure_count" -ne 0 ]]; then
    echo "❌ Run $i thất bại: xcodebuild=$xcode_rc, tests=$test_count/$EXPECTED_TESTS, failures=$failure_count" >&2
    echo "→ $summary" >&2
    echo "→ Log: $test_log" >&2
    echo "→ Result: $result_bundle" >&2
    exit 65
  fi
  if [[ ! -d "$result_bundle" ]]; then
    echo "❌ Run $i: xcodebuild không tạo result bundle: $result_bundle" >&2
    exit 65
  fi

  summaries+=("Run $i: $summary")
  echo "✅ Run $i/$RUNS xanh: $summary"
done

echo "===== GATE XANH 3/3 — commit $COMMIT_SHA ====="
printf '%s\n' "${summaries[@]}"
echo "Artifact: $ARTIFACT_DIR"
