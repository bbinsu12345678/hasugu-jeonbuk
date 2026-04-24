#!/usr/bin/env bash
# SessionStart hook: additionalContext 를 주입해 하네스 재탄생 원칙과 테스트 사이클을 상기시킴.
cat <<'EOF'
{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"[하수구막힘 프로젝트 규칙]\n1. 반드시 docs/HARNESS_COMPETITOR.md, docs/REBIRTH_SPEC.md, docs/TEST_CYCLE.md 3개 문서의 원칙을 따릅니다.\n2. 경쟁사(jianhomecare)는 구조만 참고, 문장·톤·이미지·EXIF 는 전부 우리 버전으로 재탄생.\n3. 모든 작업은 스킬/kit/gstack 사용 강제 (superpowers:*, /browse, /qa-only, /benchmark, /canary, codex:rescue 등).\n4. 테스트 사이클 L1(type) → L2(lint) → L3(build) → L4(SEO 검증) → L5(/browse) → L6(/benchmark) → L7(/canary). 실패 시 L1 부터 재시작.\n5. 이전 세션 Stop hook 에서 verify:light 실패 보고가 있었다면 가장 먼저 처리하세요.\n6. 인수님이 직접 검증하기 어려운 항목은 공식문서·최신 사례 3종 근거로 먼저 대안 제안 후 진행."}}
EOF
