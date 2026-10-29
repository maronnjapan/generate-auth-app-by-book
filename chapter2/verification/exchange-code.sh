#!/usr/bin/env bash
# exchange-code.mjs と同じことを curl で行う。
# 使い方: ./exchange-code.sh <認可コード> [code_verifier]
set -u
CODE="${1:?使い方: ./exchange-code.sh <認可コード> [code_verifier]}"
CODE_VERIFIER="${2:-}"
TOKEN_ENDPOINT="${TOKEN_ENDPOINT:-http://localhost:3000/token}"
CLIENT_ID="${CLIENT_ID:-app-a}"
CLIENT_SECRET="${CLIENT_SECRET:-app-a-secret}"
REDIRECT_URI="${REDIRECT_URI:-http://localhost:3001/callback}"

args=(
  -s -i -X POST "$TOKEN_ENDPOINT"
  -H 'Content-Type: application/x-www-form-urlencoded'
  --data-urlencode grant_type=authorization_code
  --data-urlencode "code=$CODE"
  --data-urlencode "redirect_uri=$REDIRECT_URI"
  --data-urlencode "client_id=$CLIENT_ID"
  --data-urlencode "client_secret=$CLIENT_SECRET"
)
if [ -n "$CODE_VERIFIER" ]; then
  args+=(--data-urlencode "code_verifier=$CODE_VERIFIER")
fi
curl "${args[@]}"
echo
