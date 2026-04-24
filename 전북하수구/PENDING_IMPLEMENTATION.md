# 미구현 / 사용자 입력 대기 항목

> 🔴 **우선순위: 배포 전 필수** | 🟡 배포 후 성능·최적화 | 🟢 향후 확장

_업데이트: 2026-04-23 — Supabase RPC · Phase 3 콘텐츠 확장 · IndexNow · Hook 강제 완료 반영_

---

## ✅ 해결된 항목 (2026-04-22~23)

### 문의 폼 수신 — **Supabase RPC 로 해결** (EmailJS 불필요)

- `inquiries_hasugu` + `symptom_leads_hasugu` 테이블 생성 (공용 Supabase 프로젝트 `ofcqhpatmembkwbajmte`)
- `submit_inquiry_hasugu(...)` · `submit_symptom_lead_hasugu(...)` SECURITY DEFINER RPC 작성 → RLS 우회 + 입력 검증(이름·전화번호 regex)
- 직접 INSERT 는 RLS 로 차단 → RPC 만 허용 (방어심층)
- `src/lib/supabase.ts` 클라이언트 RPC 호출로 전환, 테스트 18/18 pass
- **조회 방법**: Supabase Dashboard → Table Editor → `inquiries_hasugu` · `symptom_leads_hasugu`
- **세션 토큰 revoke 필요**: https://supabase.com/dashboard/account/tokens → `hasugu-migration` 토큰 제거
- `siteConfig.emailjs` 필드는 dead code — 제거 여부는 인수님 결정

### Phase 3 콘텐츠 풀 확장 (완료)

- intro 50 · conclusion 50 (기존 유지)
- body-structures 8 → **12 패턴** (s6 포함)
- 섹션 5 → **6 per service** (8 × 2 새 변형 = 16 신규)
- FAQ 6 → **15 per service** (72 신규)
- 내부 유사도 avg Jaccard **0.089** (임계 0.35 대비 1/4)
- `scripts/rebirth-diff.mjs` 신규 측정 도구 도입

### IndexNow 키 설정 (완료)

- `siteConfig.indexNowKey = '3578809e434106335a30185a7e5c5284'`
- `public/3578809e434106335a30185a7e5c5284.txt` 프로토콜 파일 배치
- 빌드 후 `out/` 에 자동 복사 → 빙·얀덱스·세즈남 즉시 색인 제출 가능

### 작업 프로토콜 강화 (Hook 기반)

- `.claude/settings.json` 에 **UserPromptSubmit hook** 추가 — 매 사용자 메시지마다 표시등·Skill 의무·재독 규칙 리마인더 주입
- `scripts/hooks/user-prompt-submit.sh` 신규
- 메모리 규칙 강화:
  - `feedback_work_protocol.md` 에 "0단계 규칙 본문 Read (매 작업)" + "매 응답 표시등 블록 필수" 추가
  - `feedback_skill_usage.md` 예외 범위 엄격 축소 (한 줄 수정·단일 grep·인덱스 1줄만)
  - `feedback_multi_model_advisor.md` 에 모델·스킬 사용 투명 표시 규칙 추가
  - `feedback_file_consolidation.md` 신규 — 새 파일 생성 금지, 기존 문서 수정 우선

---

## 🔴 남은 인수님 필수 입력 (배포 전)

### 1. 카카오 오픈챗 실제 URL

**현재**: `siteConfig.kakaoUrl = 'https://open.kakao.com/o/example'` (placeholder, 클릭 시 404).

**필요**: 카카오톡 오픈채팅 개설 → 링크 복사 → `src/config/site.ts:12` 에 입력.

### 2. 운영 이메일 주소

**현재**: `siteConfig.email = 'example@example.com'` (placeholder).

**필요**: JSON-LD Organization.email 용 공식 이메일. `src/config/site.ts:13`.

### 3. 도메인 · DNS · 배포

**현재**: `hasugu-jeonbuk.com` 구매 상태 미확인, 호스팅 미배포.

**필요**:
1. 도메인 소유권 확인
2. Cloudflare Pages 또는 Vercel 프로젝트 생성 → GitHub 연동
3. DNS A 레코드 / CNAME 설정
4. HTTPS 자동 발급 확인

### 4. 네이버 SA / 구글 SC 인증코드

**현재**: `siteConfig.verification.naver` · `.google` 빈 문자열.

**필요** (도메인 배포 후):
1. 네이버 서치어드바이저 사이트 등록 → HTML 태그 `content` 값 → `site.ts verification.naver`
2. 구글 Search Console 등록 → 동일 방식 → `site.ts verification.google`
3. sitemap-1.xml · sitemap-2.xml · feed.xml URL 제출

---

## 🟢 남은 자율 작업 (Claude 가능)

### 5. Lighthouse 95점 최적화 (사용자가 "마지막" 지정)

**Task #31** — 배포 후 실측 기반 튜닝:
- `/benchmark` 로 베이스라인 측정
- 이미지 loading 전략 (LCP 타겟 < 2.5s)
- Critical CSS inline, font preconnect
- JSON-LD 크기 최적화

### 6. 추가 AI 이미지 보강 (선택)

현재 이미지 분포:
- toilet 1260, sink 570, leak 270, aircon 1470 — 충분
- drain 120 — 경계
- stormwater 30, misc 510 — 경계
- sewage 0, manhole 0 — fallback chain 으로 drain 풀에서 빌려 렌더 중

필요 시 sewage/manhole 전용 이미지 50~100장 제작 후 `scripts/process-workimages.py` 재실행.

---

## 투두 진행 순서 (배포까지)

| 순서 | 작업 | 블로커 | 상태 |
|---|---|---|---|
| 1 | 카카오 오픈챗 URL | 인수님 생성 | 🔴 대기 |
| 2 | 운영 이메일 | 인수님 | 🔴 대기 |
| 3 | 도메인 · 호스팅 계정 · 배포 | 인수님 | 🔴 대기 |
| 4 | 네이버 SA / 구글 SC 인증 코드 | 3번 선행 | 🟡 대기 |
| 5 | `/canary` 60분 모니터 | 배포 후 | 🟡 대기 |
| 6 | Lighthouse 최적화 | 배포 후 | 🟢 |
| 7 | 희소 카테고리 이미지 보강 | 선택 | 🟢 |
