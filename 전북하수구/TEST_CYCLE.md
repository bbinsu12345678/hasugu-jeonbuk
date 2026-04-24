# TEST CYCLE — 연쇄 검증 사이클 (L1 ~ L7)

> 원칙: **테스트 → 연쇄검증 → 수정 → 테스트.** 한 레이어라도 실패하면 수정 후 **L1부터** 다시 돌린다 (부분 재검증 금지).
> 모든 작업은 스킬/kit/gstack을 강제로 사용한다 (`superpowers:*`, `/browse`, `/qa-only`, `/benchmark`, `/canary` 등).

---

## 0. 강제 선언 (이 프로젝트의 모든 작업에 적용)

1. 코드 편집 전에는 `superpowers:brainstorming` 또는 `superpowers:writing-plans`를 호출해 의도를 문서화한다.
2. 실행은 `superpowers:executing-plans` 또는 `superpowers:subagent-driven-development`로 진행한다.
3. 테스트 작성이 필요한 로직은 `superpowers:test-driven-development`를 따른다.
4. 버그/실패 발생 시 `superpowers:systematic-debugging` + `/investigate`를 사용한다.
5. "완료" 선언 전 `superpowers:verification-before-completion`으로 증빙을 확보한다.
6. PR 전 `superpowers:requesting-code-review` + `/review`로 2차 의견을 받는다.
7. 라이브 QA는 `/browse`·`/qa-only` (헤드리스) 사용. 수동 확인 금지.
8. 성능은 `/benchmark`, 배포 후는 `/canary`·`/land-and-deploy`로 감시한다.
9. 애매한 판단은 `codex:codex-rescue`로 2차 의견을 받는다.

**위반 시**: Stop hook이 "스킬 미사용" 경고를 띄우고 다음 세션 시작 시 해당 항목을 우선 처리한다.

---

## 1. 사이클 레이어 정의

### L1 — 타입 체크 (정적)
- 커맨드: `npm run type-check` (= `tsc --noEmit`)
- 통과: 오류 0건
- 평균 소요: < 10초
- 실패 시: 타입 오류를 `@/types`에 명시하고 수정 후 L1부터 재시작.

### L2 — Lint (정적)
- 커맨드: `npm run lint` (= `eslint`)
- 통과: 오류 0건 · 경고 검토 완료
- 평균 소요: < 5초
- 실패 시: 수정 후 **L1부터** 재시작.

### L3 — Build (생성)
- 커맨드: `npx next build`
- 통과: 
  - 에러 0건
  - 총 15,076 페이지(홈 1 + 광역 1 + 시 14 + 블로그 15,060) ± 편차 < 5
  - 소요 < 40초
- 실패 시: 에러 로그 분석 후 L1부터.

### L4 — SEO 산출물 검증
- 커맨드: 
  ```bash
  node scripts/verify-seo.mjs
  node scripts/verify-images.mjs
  node scripts/rebirth-diff.mjs  # Phase 3 이후만
  ```
- 통과 기준:
  - `out/sitemap.xml` URL 수 ≥ 15,076 · `<image:image>` 포함 (Phase 2 이후)
  - `out/feed.xml` item ≥ 15,060 · `<media:content>` 포함 (Phase 2 이후)
  - `out/robots.txt` AI 봇 8종 차단 라인 존재
  - 경쟁사 상호(jianhomecare·지안홈케어)·경쟁사 전화(010-3463-4474) 스캔 0건
  - JSON-LD 6종 필수 필드 유효
  - 이미지: 해시 중복 0건, EXIF DateTimeOriginal 유니크 100%, alt 중복률 < 10%
  - **이미지 컨테이너 비율 ↔ 원본 비율 일치** (2026-04-20 추가):
    - 샘플 HTML `<img object-cover>` 중 `aspect-[W/H]` 명시 없고 고정 `h-N` 만 쓰는 패턴 → FAIL (이미지 자름 리스크)
    - 허용 예외: 원형 아바타(`rounded-full h-X w-X` 정방형)만, 주석 필수
    - 생성 스크립트(gen-placeholders·process-images)의 출력 치수와 컴포넌트 `aspect-[W/H]` 가 같은 비율인지 크로스체크
  - `out/**/*.html` 에 `__next_error__` / `NEXT_HTTP_ERROR_FALLBACK;404` 포함 0건 (한글 URL 인코딩 버그 회귀 방지)
  - 표시광고법 금지어(`100% 해결`·`즉시 출동`·`안 뚫리면 0원`·`무조건`·`최저가`·`No1`·`1등`·`국내 최고`) 0건 (Phase 3 이후 엄격)
  - n-gram 유사도 < 0.35 (Phase 3 이후)
- 실패 시: 관련 데이터/컴포넌트 수정 후 L1부터.

### L5 — 브라우저 QA
- 커맨드: `/qa-only` (리포트만) → 이슈 수정 후 `/browse` 대표 5페이지 확인
- 통과 기준:
  - 모바일(iPhone 12 Pro) + 데스크톱(1920×1080) 스크린샷 5페이지 무결
  - 전화 링크·카카오 버튼·문의 폼 동작
  - 404·콘솔 에러 0건
- 실패 시: 수정 후 L1부터.

### L6 — 성능
- 커맨드: `/benchmark`
- 통과 기준:
  - LCP < 2.5s · CLS < 0.1 · INP < 200ms (모바일 3G Fast 기준)
  - 홈·시 허브·블로그 대표 각 1회씩 측정
- 실패 시: 이미지 lazy-loading, 폰트 최적화, 번들 분석. 수정 후 L1부터.

### L7 — Canary (배포 후만)
- 커맨드: `/canary`
- 통과 기준:
  - 배포 직후 60분 에러율 < 0.1%
  - 15,076 URL 중 샘플 200개 HTTP 200
  - 네이버 Yeti·Googlebot 접근 로그 확인 (Cloudflare Analytics)
- 실패 시: `/land-and-deploy` 롤백 → L1부터.

---

## 2. Phase별 요구 레이어

| Phase | 필수 통과 | 선택 |
|---|---|---|
| 0 (문서·훅) | L1, L2 | — |
| 1 (이미지) | L1~L4 (verify-images 포함) | L5 |
| 2 (SEO 표면) | L1~L4 | L5 |
| 3 (콘텐츠) | L1~L5 (+rebirth-diff) | L6 |
| 4 (실값·확장) | L1~L5 | L6 |
| 5 (배포) | L1~L7 | — |

---

## 3. 재시작 규칙 (부분 재검증 금지)

> 한 레이어 실패 = L1부터 전체 재시작. 이유: 부분 재검증은 회귀 버그를 놓친다.

예시 시나리오:
1. L4에서 sitemap URL 수 부족 발견 → sitemap.ts 수정 → **L1 재시작** (수정이 타입에 영향 주지 않는지 확인부터).
2. L6에서 LCP 초과 → 이미지 설정 수정 → **L1 재시작** (type-check·lint·build·SEO 검증 전부 재실행).

**재시작 로그**: `docs/CYCLE_LOG_{yyyymmdd}.md`에 "Phase X / 시도 N / 실패 레이어 / 원인 / 수정 커밋"을 적재.

---

## 4. 스킬 강제 체크리스트 (Stop hook 출력)

세션 종료 시 hook이 다음 항목을 점검해 출력한다.

```
[Stop Hook 체크리스트 — {timestamp}]

## 사이클 상태
- L1 type-check : [PASS/FAIL]
- L2 lint       : [PASS/FAIL]

## 오늘 사용한 스킬
- superpowers:*  : {목록}
- gstack /skill  : {목록}
- codex:*        : {목록}

## 스킬 미사용 경고
- 편집은 있었으나 브레인스토밍·계획 스킬 호출 기록 없음 ⚠
- PR 전 /review 미호출 ⚠

## 학습·제안 로그 (오늘 발견한 더 나은 방법)
- {자동 추출}

## 다음 세션 첫 할 일
- {실패 레이어·미완 태스크}
```

---

## 5. 실패 복구 매트릭스

| 실패 증상 | 1차 진단 | 2차 조치 | 스킬 |
|---|---|---|---|
| L1 타입 오류 | `@/types` 누락·드리프트 | 타입 정의 추가 → L1 | — |
| L2 eslint 오류 | 사용 안 하는 import, any | 규칙 확인 후 수정 | — |
| L3 빌드 실패 | 한글 경로·generateStaticParams | `node_modules/next/dist/docs/` 확인 후 수정 | `superpowers:systematic-debugging` |
| L4 sitemap URL 수 부족 | `blog-posts.ts` generateBlogPosts 분기 오류 | 루프 커버리지 확인 | `/investigate` |
| L4 경쟁사 흔적 검출 | 이미지 파일·콘텐츠 잔존 | 해당 파일 삭제·텍스트 교체 | `superpowers:verification-before-completion` |
| L4 이미지 해시 중복 | `process-images.py` 시드 충돌 | 시드 전략 수정 | `codex:rescue` |
| L5 404·콘솔 에러 | Link href 오타, 정적 export 한계 | Next.js 16 docs 확인 | `/investigate` |
| L6 LCP 초과 | 이미지·폰트 | `<Image priority>`·font-display swap | `/benchmark` |
| L7 canary 에러 | Cloudflare Bot Fight Mode ON | 설정 OFF | `/canary` |

---

## 6. 선제 연구·제안 연계

> 아래 상황에선 Claude가 먼저 공부·대안 제안 후 실행.

- L3·L4에서 **3회 이상 같은 종류 실패** → 공식문서 재조사 + `codex:rescue` 2차 의견 → 대안 A/B/C 제시.
- Phase 전환 시 해당 Phase의 영향 범위를 먼저 공부 → `docs/SUGGESTION_LOG_{yyyymmdd}.md`.
- 새로운 Next.js/네이버/구글 정책 발견 시 즉시 `feedback_proactive_research.md` 업데이트.

---

## 7. 간단 레퍼런스 (명령어 치트시트)

```bash
# 전체 사이클 (Phase 1 이후)
npm run verify:full

# 빠른 사이클 (편집 중)
npm run verify:light

# 개별
npm run type-check
npm run lint
npx next build
node scripts/verify-seo.mjs
node scripts/verify-images.mjs
node scripts/rebirth-diff.mjs  # Phase 3 이후

# 정적 서버
npx serve out -p 4000
# → http://localhost:4000

# 배포 후
/canary
```
