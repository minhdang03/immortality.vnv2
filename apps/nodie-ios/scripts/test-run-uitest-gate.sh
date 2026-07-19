#!/usr/bin/env bash
# Regression test cho control-flow của run-uitest-gate.sh. Không gọi DB/Xcode thật.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

TMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/nodie-gate-test.XXXXXX")"
cleanup() {
  local rc=$?
  if [[ "$rc" -ne 0 || "${KEEP_GATE_TEST_TMP:-0}" == "1" ]]; then
    echo "Test fixture giữ tại: $TMP_ROOT" >&2
    return "$rc"
  fi
  case "$TMP_ROOT" in *nodie-gate-test.*) rm -rf -- "$TMP_ROOT" ;; esac
}
trap cleanup EXIT

FAKE_ENV="$TMP_ROOT/test.env"
FAKE_SEED="$TMP_ROOT/fake-seed.sh"
FAKE_XCODEBUILD="$TMP_ROOT/fake-xcodebuild.sh"
TRACE="$TMP_ROOT/trace.log"

printf '%s\n' \
  'SUPABASE_DB_URL=postgresql://test.invalid/db' \
  'NODIE_TEST_EMAIL=test@example.com' \
  "NODIE_TEST_DISPLAY_NAME='Người Kiểm Thử'" \
  'VITE_SUPABASE_URL=https://test.invalid' \
  'SUPABASE_SECRET_KEY=TOP_SECRET_SENTINEL_123' \
  'NODIE_TEST_PASSWORD=test-password' > "$FAKE_ENV"

printf '%s\n' \
  '#!/usr/bin/env bash' \
  'echo "seed:${NODIE_UITEST_GATE_RUN}" >> "$FAKE_TRACE"' \
  '[[ "${FAKE_SEED_FAIL_RUN:-}" == "${NODIE_UITEST_GATE_RUN}" ]] && exit 71' \
  'echo "seed ok"' > "$FAKE_SEED"

printf '%s\n' \
  '#!/usr/bin/env bash' \
  'echo "test:${NODIE_UITEST_GATE_RUN}" >> "$FAKE_TRACE"' \
  'if [[ -n "${SUPABASE_SECRET_KEY:-}" || -n "${SUPABASE_DB_URL:-}" || -n "${NODIE_TEST_PASSWORD:-}" ]]; then' \
  '  echo "SECRET_ENV_LEAK"; exit 72' \
  'fi' \
  'result=""' \
  'while [[ "$#" -gt 0 ]]; do' \
  '  [[ "$1" == "-resultBundlePath" ]] && { result="$2"; shift 2; continue; }' \
  '  shift' \
  'done' \
  '[[ -n "$result" && "${FAKE_XCODE_MODE:-success}" != "missing-result" ]] && mkdir -p "$result"' \
  'case "${FAKE_XCODE_MODE:-success}" in' \
  '  exit-fail) echo "Executed 38 tests, with 0 failures (0 unexpected)"; exit 65 ;;' \
  '  missing-summary) echo "TEST EXECUTE SUCCEEDED"; exit 0 ;;' \
  '  failures) echo "Executed 38 tests, with 1 failure (0 unexpected)"; exit 0 ;;' \
  '  zero-tests) echo "Executed 0 tests, with 0 failures (0 unexpected)"; exit 0 ;;' \
  '  reduced-tests) echo "Executed 37 tests, with 0 failures (0 unexpected)"; exit 0 ;;' \
  '  *) echo "Executed 38 tests, with 0 failures (0 unexpected)"; exit 0 ;;' \
  'esac' > "$FAKE_XCODEBUILD"
chmod +x "$FAKE_SEED" "$FAKE_XCODEBUILD"

run_gate() {
  local output="$1"
  shift
  NODIE_UITEST_ENV_FILE="$FAKE_ENV" \
  NODIE_UITEST_SEED_SCRIPT="$FAKE_SEED" \
  NODIE_XCODEBUILD_BIN="$FAKE_XCODEBUILD" \
  NODIE_UITEST_RESULTS_DIR="$TMP_ROOT/results-$output" \
  FAKE_TRACE="$TRACE" \
  FAKE_SEED_FAIL_RUN="${FAKE_SEED_FAIL_RUN:-}" \
  FAKE_XCODE_MODE="${FAKE_XCODE_MODE:-success}" \
    scripts/run-uitest-gate.sh "$@" > "$TMP_ROOT/$output.log" 2>&1
}

expect_failure() {
  local name="$1"
  shift
  if "$@"; then
    echo "❌ $name: đáng lẽ phải fail" >&2
    exit 1
  fi
  echo "✅ $name"
}

expect_failure "thiếu RUNS" run_gate missing-runs
expect_failure "RUNS không phải 3" run_gate wrong-runs 2
expect_failure "RUNS không hợp lệ" run_gate invalid-runs abc
expect_failure "thừa argument" run_gate extra-args 3 extra

expect_failure "thiếu env file" env \
  NODIE_UITEST_ENV_FILE="$TMP_ROOT/missing.env" \
  NODIE_UITEST_SEED_SCRIPT="$FAKE_SEED" \
  NODIE_XCODEBUILD_BIN="$FAKE_XCODEBUILD" \
  scripts/run-uitest-gate.sh 3

INCOMPLETE_ENV="$TMP_ROOT/incomplete.env"
printf '%s\n' \
  'SUPABASE_DB_URL=postgresql://test.invalid/db' \
  'NODIE_TEST_EMAIL=test@example.com' > "$INCOMPLETE_ENV"
expect_failure "thiếu required env" env \
  NODIE_UITEST_ENV_FILE="$INCOMPLETE_ENV" \
  NODIE_UITEST_SEED_SCRIPT="$FAKE_SEED" \
  NODIE_XCODEBUILD_BIN="$FAKE_XCODEBUILD" \
  scripts/run-uitest-gate.sh 3

FAKE_SEED_FAIL_RUN=1 expect_failure "seed fail" run_gate seed-fail 3
FAKE_XCODE_MODE=exit-fail expect_failure "xcodebuild fail dù summary xanh" run_gate exit-fail 3
FAKE_XCODE_MODE=missing-summary expect_failure "thiếu summary" run_gate missing-summary 3
FAKE_XCODE_MODE=failures expect_failure "summary có failure" run_gate failures 3
FAKE_XCODE_MODE=zero-tests expect_failure "summary 0 test" run_gate zero-tests 3
FAKE_XCODE_MODE=reduced-tests expect_failure "suite bị giảm còn 37 test" run_gate reduced-tests 3
FAKE_XCODE_MODE=missing-result expect_failure "thiếu result bundle" run_gate missing-result 3

: > "$TRACE"
run_gate success 3
expected_trace=$'seed:1\ntest:1\nseed:2\ntest:2\nseed:3\ntest:3'
actual_trace="$(cat "$TRACE")"
[[ "$actual_trace" == "$expected_trace" ]] || {
  echo "❌ sai thứ tự chạy:" >&2
  printf '%s\n' "$actual_trace" >&2
  exit 1
}
grep -q 'GATE XANH 3/3' "$TMP_ROOT/success.log"
if rg -q 'TOP_SECRET_SENTINEL_123' "$TMP_ROOT" --glob '*.log'; then
  echo "❌ gate làm lộ secret trong log" >&2
  exit 1
fi

echo "✅ happy path seed→test ×3, artifact đủ, không lộ secret"
echo "✅ Tất cả regression test của release gate đều xanh"
