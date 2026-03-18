#!/bin/bash
# Firebase Firestore seed via REST API (curl)
# Usage: Called by seed-*.sh scripts
# Requires .env with VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD

set -e
# Find .env relative to this script or from working directory
if [ -f "$(dirname "${BASH_SOURCE[0]}")/../.env" ]; then
  source "$(dirname "${BASH_SOURCE[0]}")/../.env"
elif [ -f ".env" ]; then
  source ".env"
else
  echo "❌ .env not found"; exit 1
fi

PROJECT_ID="$VITE_FIREBASE_PROJECT_ID"
API_KEY="$VITE_FIREBASE_API_KEY"

# Login and get token
get_token() {
  local resp
  resp=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$SEED_ADMIN_EMAIL\",\"password\":\"$SEED_ADMIN_PASSWORD\",\"returnSecureToken\":true}")

  TOKEN=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('idToken',''))" 2>/dev/null)
  if [ -z "$TOKEN" ]; then
    echo "❌ Login failed"
    echo "$resp"
    exit 1
  fi
  echo "✅ Logged in as $SEED_ADMIN_EMAIL"
}

# Add a document to a collection
# Usage: add_doc "collection_name" 'json_fields_object'
add_doc() {
  local col="$1"
  local fields="$2"

  local resp
  resp=$(curl -s -X POST \
    "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/$col" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"fields\": $fields}")

  local doc_id
  doc_id=$(echo "$resp" | python3 -c "import sys,json; n=json.load(sys.stdin).get('name',''); print(n.split('/')[-1] if n else '')" 2>/dev/null)
  if [ -n "$doc_id" ]; then
    echo "  ✅ → $doc_id"
  else
    echo "  ❌ Failed"
    echo "$resp" | head -5
  fi
}

# Helper: wrap a string value for Firestore REST API
s() { echo "\"stringValue\":\"$(echo "$1" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')\""; }
# Helper: wrap an integer value
i() { echo "\"integerValue\":\"$1\""; }
# Helper: wrap a map value
map() { echo "\"mapValue\":{\"fields\":{$1}}"; }
# Helper: server timestamp
ts() { echo "\"timestampValue\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\""; }
