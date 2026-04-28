#!/bin/bash
# JWT 환경변수 우회 방식 wrangler pages deploy
# 1회 호출 = 약 10분 진행 후 timeout. CF hash dedup으로 이미 올라간 파일 즉시 skip.
# 약 8회 반복 호출 시 23,714 files 완료.
# Run: bash scripts/deploy-after-zone-active.sh

set -e
cd "$(dirname "$0")/.."

set -a
source .env.local
set +a

export PYTHONIOENCODING=utf-8

echo "================================================================"
echo "[1] Fresh JWT 받기 (max_file_count_allowed: 100000)"
echo "================================================================"
JWT=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/hasugu-jeonbuk/upload-token" \
  | python -c "import sys,json; print(json.load(sys.stdin)['result']['jwt'])")

echo "  JWT 길이: ${#JWT}"
echo "$JWT" | python -c "
import sys, json, base64
token = sys.stdin.read().strip()
payload = token.split('.')[1]
payload += '=' * (4 - len(payload) % 4)
data = json.loads(base64.urlsafe_b64decode(payload))
print(f'  exp: {data.get(\"exp\")}, max_file_count_allowed: {data.get(\"max_file_count_allowed\")}')
"

export CF_PAGES_UPLOAD_JWT="$JWT"
export PAGES_WRANGLER_MAJOR_VERSION=4

echo ""
echo "================================================================"
echo "[2] wrangler pages deploy (CF_PAGES_UPLOAD_JWT 주입, 100k 한도)"
echo "================================================================"
echo "  files: $(find out -type f | wc -l)"
echo "  시작: $(date +%H:%M:%S)"
echo ""

CF_PAGES_UPLOAD_JWT="$JWT" PAGES_WRANGLER_MAJOR_VERSION=4 npx wrangler@4.85.0 pages deploy out \
  --project-name=hasugu-jeonbuk \
  --branch=main \
  --commit-dirty=true 2>&1 | tee /tmp/wrangler-deploy-bg.log

echo ""
echo "================================================================"
echo "[3] 결과 분석"
echo "================================================================"
DEPLOY_URL=$(grep -oE 'https://[a-z0-9]+\.hasugu-jeonbuk\.pages\.dev' /tmp/wrangler-deploy-bg.log | head -1)
if [ -n "$DEPLOY_URL" ]; then
  echo "  ✨ DEPLOY SUCCESS: $DEPLOY_URL"
  echo ""
  echo "================================================================"
  echo "[4] 커스텀 도메인 연결: hasugu-jeonbuk.com"
  echo "================================================================"
  curl -s -X POST -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/hasugu-jeonbuk/domains" \
    --data '{"name":"hasugu-jeonbuk.com"}' | python -c "
import sys, json
d = json.load(sys.stdin)
if d.get('success'):
    r = d.get('result', {})
    print(f'  → 연결: {r.get(\"name\")}, status: {r.get(\"status\")}')
else:
    print(f'  → 결과: {d.get(\"errors\")}')
"

  echo ""
  echo "================================================================"
  echo "[5] Bot Fight Mode OFF"
  echo "================================================================"
  curl -s -X PATCH -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/bot_management" \
    --data '{"fight_mode":false}' | python -c "
import sys, json
d = json.load(sys.stdin)
if d.get('success'):
    print('  → Bot Fight Mode: OFF')
else:
    print(f'  → 결과: {d.get(\"errors\")}')
"

  echo ""
  echo "DONE ✅"
  echo "  Pages URL: $DEPLOY_URL"
  echo "  Custom: https://hasugu-jeonbuk.com (zone active 후 접근 가능)"
else
  PROGRESS=$(grep -oE 'Uploading... \([0-9]+/23714\)' /tmp/wrangler-deploy-bg.log | tail -1)
  echo "  ⏳ 진행 중 (timeout 또는 미완료): $PROGRESS"
  echo "  → 다시 호출하여 이어서 업로드"
  echo "  명령: bash scripts/deploy-after-zone-active.sh"
fi
