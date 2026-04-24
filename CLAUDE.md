@AGENTS.md

## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy,
/canary, /benchmark, /browse, /open-gstack-browser, /qa, /qa-only, /design-review,
/setup-browser-cookies, /setup-deploy, /retro, /investigate, /document-release, /codex,
/cso, /autoplan, /pair-agent, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn.

## 새 세션 시작 시 필수 읽기 순서

1. **`AGENTS.md`** (이 파일을 import) — 프로젝트 한 눈에 보는 컨텍스트
2. **`전북하수구/CHECKPOINT-2026-04-14.md`** — 최신 작업 상태 스냅샷 (가장 중요)
3. **`전북하수구/CORE_TECH.md`** — 전체 기술 문서 (특히 섹션 2-2 진행 상황)
4. **`~/.claude/projects/C--Users-admin-Desktop---------------/memory/MEMORY.md`** — 메모리 인덱스
5. **`~/.claude/projects/.../memory/project_hasugu_seo_architecture.md`** — 아키텍처 상세

## 핵심 규칙

- **🔥 통합 작업 프로토콜 필수**: 모든 작업은 `~/.claude/projects/.../memory/feedback_work_protocol.md` 의
  - **시작** — 스킬/kit/gstack 호출 + `advisor()` 호출 + 사용자 승인
  - **진행** — 변경 파급 4단계: Map(grep 10축 전수) → Report(영향 파일 목록 보고) → Apply(원자적 일괄 수정) → Verify(옛값 0-hit + 새값 기대-hit)
  - **종료** — 검증용 스킬/kit/gstack(TEST_CYCLE L1~L7 포함) + `advisor()` + 완료 선언
  를 **빠짐없이** 거칠 것. 단일 파일 부분 수정·스킬 생략·advisor 생략 금지.
- **모든 작업은 스킬/kit을 사용**해야 함 (인수님 명시 요청)
- **작업할 때마다 메모리/문서 업데이트** (project_hasugu_seo_architecture.md, CORE_TECH.md)
- **공식 문서 + 최신 트렌드 기반**으로 의사결정
- **저작권/상표권 위반 금지** — 경쟁사 흔적 박힌 이미지/콘텐츠 절대 사용 X
- **새 프로젝트 = 기존 banana-app/jeonbuk-hasugu 코드 참조 절대 금지** — 완전 분리 유지

## 빠른 컨텍스트

전북 14시군 251동 × 60 URL 접미사 × 8개 서비스 = **15,060개 정적 페이지** 운영 중. 4단계 허브 구조(홈/jeonbuk/[city]/[slug]). 다음 작업: 이미지 재구성 (I0~I5, 인수님 사진 100장 활용) → 변형 시스템 확장 (G2~G9, 20,000개 변형 목표).
