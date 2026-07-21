#!/usr/bin/env bash
# Install launchd agents:
#  1) kim-cuong-sync — pending → inbox every 5 min
#  2) zalo-reconnect-watch — dis → Telegram alert + QR
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NODE="$(command -v node)"
LOG_DIR="$ROOT/data"
mkdir -p "$LOG_DIR"
UID_NUM="$(id -u)"
PATH_ENV="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
MODE="${1:-all}"

if [[ "$MODE" != "all" && "$MODE" != "--sync-only" && "$MODE" != "--watch-only" ]]; then
  echo "Usage: $0 [--sync-only|--watch-only]" >&2
  exit 2
fi

install_one() {
  local LABEL="$1"
  local SCRIPT="$2"
  local EXTRA_ENV="$3"
  local PLIST="$HOME/Library/LaunchAgents/${LABEL}.plist"

  cat >"$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${NODE}</string>
    <string>${ROOT}/scripts/${SCRIPT}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${ROOT}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>${PATH_ENV}</string>
${EXTRA_ENV}
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${LOG_DIR}/${LABEL}.out.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/${LABEL}.err.log</string>
</dict>
</plist>
EOF

  launchctl bootout "gui/${UID_NUM}/${LABEL}" 2>/dev/null || true
  launchctl bootstrap "gui/${UID_NUM}" "$PLIST"
  launchctl enable "gui/${UID_NUM}/${LABEL}" 2>/dev/null || true
  launchctl kickstart -k "gui/${UID_NUM}/${LABEL}" 2>/dev/null || true
  echo "Installed ${PLIST}"
}

if [[ "$MODE" != "--watch-only" ]]; then
  install_one "vn.battudao.kim-cuong-sync" "auto-sync-loop.mjs" \
    "    <key>SYNC_INTERVAL_SEC</key>
    <string>300</string>"
fi

if [[ "$MODE" != "--sync-only" ]]; then
  install_one "vn.battudao.zalo-reconnect-watch" "zalo-reconnect-watch.mjs" \
    "    <key>ALERT_AFTER_SEC</key>
    <string>180</string>
    <key>QR_COOLDOWN_SEC</key>
    <string>600</string>
    <key>TELEGRAM_CHAT_ID</key>
    <string>448301215</string>"
fi

# ensure ws dep
cd "$ROOT" && npm install ws --no-save 2>/dev/null || npm install ws 2>/dev/null || true

echo ""
echo "Daemons:"
echo "  kim-cuong-sync          every 5m → inbox"
echo "  zalo-reconnect-watch    Zalo dis → Telegram alert + QR"
echo "Logs: ${LOG_DIR}/"
echo "Unload:"
echo "  launchctl bootout gui/${UID_NUM}/vn.battudao.kim-cuong-sync"
echo "  launchctl bootout gui/${UID_NUM}/vn.battudao.zalo-reconnect-watch"
echo "Test QR blast: FORCE_ALERT=1 ONCE=1 node scripts/zalo-reconnect-watch.mjs"
