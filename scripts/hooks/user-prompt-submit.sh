#!/usr/bin/env bash
# UserPromptSubmit hook: 매 사용자 메시지마다 표시등·Skill 의무·재독 규칙 리마인더 주입
# 목적: 세션 중반 drift 방지 (SessionStart 는 턴 1만 기억됨)
# 참고: advisor 권고(2026-04-23) — PreToolUse 로 차단하지 말고 UserPromptSubmit 로 상기만.

cat <<'EOF'
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"[매 응답 필수 표시등]\n📊 모델: Opus 4.7 [+Sonnet/Haiku/Codex 계획]\n📊 Skill/kit/gstack: 실제 호출명 (공란=프로토콜 위반, 예외는 한 줄 수정·단일 grep·인덱스 1줄만)\n📊 재독 규칙: Read 툴로 본문 연 파일만 (인덱스 제외)\n\n핵심 규칙 파일(본문 Read 의무):\n- ~/.claude/projects/.../memory/feedback_work_protocol.md (마스터)\n- feedback_skill_usage.md (스킬 호출 의무)\n- feedback_file_consolidation.md (새 파일 생성 금지)\n- feedback_multi_model_advisor.md (sonnet/haiku 위임 기준)\n\n미준수 = 다음 응답에서 사과+복구."}}
EOF
