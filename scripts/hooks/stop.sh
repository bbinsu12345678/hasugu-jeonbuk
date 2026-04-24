#!/usr/bin/env bash
# Stop hook: 세션 종료 시 L1 type-check + L2 lint 실행 후 JSON systemMessage 출력.
# verify:light 는 package.json 에 정의되어 있어야 함.
set +e

output=$(npm run --silent verify:light 2>&1)
code=$?

PYTHONIOENCODING=utf-8 python -c '
import json, sys
code = int(sys.argv[1])
out = sys.argv[2][:3000]
if code == 0:
    msg = "[PASS] L1 type-check + L2 lint 통과 — 커밋 가능. 오늘 사용한 스킬/gstack 을 리포트하세요."
else:
    msg = f"[FAIL] L1/L2 실패 (exit {code}) — 다음 세션 시작 시 우선 수정.\n\n{out}"
print(json.dumps({"systemMessage": msg}, ensure_ascii=False))
' "$code" "$output"
