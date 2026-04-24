# 전북하수구 경쟁력·성장 전략 — 관리·수정·추가·연관검색어 활용

> 작성 2026-04-22
> 목적: 인수님이 직접 **콘텐츠 관리 · 페이지 수정 · 새 지역/서비스 추가 · 연관검색어 기반 경쟁력 확보**.
> 대상 파일: site.ts · regions.ts · url-suffixes.ts · blog-templates.ts · templates/*.ts

---

## 1. 핵심 고민 3축

| 축 | 문제 | 해결 접근 |
|---|---|---|
| **관리** | 매번 Claude 부르지 않고 인수님이 직접 편집 | Notion DB ↔ GitHub Actions 자동 배포 |
| **수정·추가** | 새 지역/서비스/키워드 즉시 반영 | `data/*.ts` 파일 1곳 수정 → 자동 재빌드 |
| **경쟁력** | 경쟁사가 놓친 연관검색어 선점 | Autocomplete API → 60 접미사 풀 동적 확장 |

---

## 2. 관리 · 수정 · 추가 방식 4가지 (쉬운 순)

### 🟢 Lv.1 — GitHub Web UI (가장 빠름, 5분)
인수님이 직접 GitHub 웹에서 파일 수정 → Vercel 자동 재배포.

**편집 대상**:
- `src/data/regions.ts` — 새 동·읍·면 추가
- `src/data/url-suffixes.ts` — 새 키워드 접미사 추가
- `src/config/site.ts` — 전화·주소·카카오 URL 변경
- `src/data/testimonials.ts` — 새 후기 추가
- `src/data/partners.ts` — 협력 브랜드 추가

**워크플로우**:
1. github.com/{repo}/edit/main/src/data/regions.ts 이동
2. 값 수정 → "Commit changes"
3. Vercel 2분 내 자동 재배포
4. 19,420 페이지 자동 재생성

**장점**: 즉시 가능, 코드 지식 불필요한 수준 편집
**단점**: 배열 문법 실수 시 빌드 실패 (Vercel 알림)

---

### 🟡 Lv.2 — Notion DB + GitHub Actions (추천, 1회 세팅 후 편함)

**구조**:
```
Notion DB "지역" (14 레코드) ──┐
Notion DB "키워드 접미사" (60) ├──→ GitHub Action (1시간마다 pull)
Notion DB "후기" (동적) ────────┘     └→ src/data/*.ts 자동 생성
                                         └→ Vercel 자동 배포
```

**세팅 (Claude 1회 작업)**:
1. Notion에 4개 DB 템플릿 생성
2. `scripts/notion-sync.py` 작성 — Notion API → `src/data/*.ts`
3. GitHub Action `.github/workflows/notion-sync.yml` — 매시간 실행
4. 변경 감지 시 자동 커밋 → Vercel 배포

**인수님 워크플로우**:
1. 스마트폰 · PC Notion 앱에서 "지역" DB 오픈
2. 새 동 추가 (한 줄 입력)
3. 최대 1시간 내 사이트 반영

**비용**: Notion 무료 플랜 · GitHub Actions 무료 (월 2,000분)

---

### 🟠 Lv.3 — Supabase + 관리자 페이지 (본격 CMS)

**구조**: Supabase DB (이미 문의 DB 용으로 고려 중) 에 콘텐츠 테이블 확장.

**테이블**:
```sql
-- regions (14 레코드, 동적)
create table regions (city text primary key, districts jsonb);

-- keywords (60+ 접미사, 동적)
create table keywords (suffix text primary key, service_type text, priority int);

-- testimonials
create table testimonials (id uuid primary key, name text, location text, content text, active boolean);

-- blog_templates (인트로·결론·본문 풀)
create table blog_templates (id uuid primary key, kind text, service_type text, text text);
```

**빌드 시 Supabase → 정적 데이터 페치**:
- `src/data/regions.ts` → `src/lib/loadData.ts` 로 변경
- `next build` 중 Supabase REST API 로 데이터 페치 → JSON 생성
- 정적 export 유지

**관리자 페이지**: Supabase Studio (무료) 로 충분. 별도 관리 UI 불필요.

**장점**: 진짜 CMS. SQL 로 대량 수정 가능.
**단점**: 빌드 시 Supabase 호출 필요 → 호스팅 종속.

---

### 🔴 Lv.4 — Sanity / Strapi / Payload (전용 Headless CMS)
과한 수준. 현재 프로젝트 규모엔 불필요.

---

## 3. 연관검색어 활용 전략 (**핵심 경쟁력**)

### 3-A. 연관검색어 수집 채널

| 소스 | 난이도 | 수집 가능 키워드 | 실시간성 |
|---|---|---|---|
| 네이버 Autocomplete | 🟢 | 상단 10개 | 실시간 |
| 네이버 DataLab Trends | 🟢 | 급상승·랭크 | 일 1회 |
| 네이버 검색광고 API | 🟡 | 월 검색량 · 경쟁도 | 월 1회 |
| 구글 Suggest | 🟢 | 알파벳 a~z 조합 | 실시간 |
| 네이버 검색 결과 하단 "이런 검색어는 어때요?" | 🟡 | 10개 | 실시간 |
| AlsoAsked API ($29/월) | 🟡 | "People Also Ask" | 실시간 |
| KeywordTool.io | 🔴 | 유료 | — |

### 3-B. Autocomplete 기반 키워드 자동 확장 (**무료 · 즉시 가능**)

**구조**:
```python
# scripts/autocomplete-expander.py
import requests, json, time

SEED_KEYWORDS = [
  '변기막힘', '싱크대막힘', '하수구막힘', '24시배관',
  '누수탐지', '에어컨배관', '오수관', '우수관', '맨홀청소',
  # 지역형
  '전주변기막힘', '군산변기막힘', '익산변기막힘', ...
]

def fetch_naver_suggest(q):
    url = f'https://ac.search.naver.com/nx/ac?q={q}&con=1&frm=nv&ans=2&r_format=json&r_enc=UTF-8&r_unicode=0&t_koreng=1&st=100&r_lt=100'
    r = requests.get(url, headers={'User-Agent': '...'})
    # 응답 파싱 → ['변기막힘업체', '변기막힘비용', ...]

ALL = {}
for seed in SEED_KEYWORDS:
    suggestions = fetch_naver_suggest(seed)
    for s in suggestions:
        ALL.setdefault(seed, set()).add(s)
    time.sleep(0.5)  # rate limit

# 기존 60 접미사와 차집합 → 신규 후보
# src/data/url-suffixes.ts 수동 검토 후 추가
```

**주 1회 자동 실행** → Slack/이메일 로 "신규 키워드 후보 15개" 알림.

### 3-C. 자동 적용 시나리오

1. 수집: 매주 월 07:00 GitHub Action 실행
2. 차집합: 기존 접미사 60 vs 수집 키워드 → 신규 N개 추출
3. 스코어링: 볼륨 ≥ 50 + 경쟁도 중간 = 우선
4. PR 자동 생성: "Add suffix: 변기막힘잘뚫는곳 (volume 120, low competition)"
5. 인수님 검토 → merge → Vercel 배포

**효과**: 경쟁사보다 **먼저 트렌드 키워드 접미사 추가 → 블로그 N개 × 14 시군 × 252 동 = 수백~수천 신규 URL 자동 생성**.

### 3-D. 경쟁사 키워드 역공학

```python
# scripts/competitor-keyword-scraper.py
# jianhomecare.com / 유사 경쟁사 sitemap 수집
# URL 에서 suffix 추출 → 우리와 차집합 → 누락분 확인
```

**법적 이슈**: 공개 sitemap 수집은 OK (robots.txt 준수). 본문 복사는 금지.

---

## 4. 콘텐츠 다변화 고도화 (중복 색인 회피)

현재 목표: `인트로 50 × 결론 50 × 본문 구조 8` = 20,000 변형 (plan REBIRTH_SPEC).

### 신규 제안

#### 4-1. LLM 기반 본문 리라이트 (1회 배치)
- DeepInfra Qwen 2.5 32B ($60~80 1회)
- 현재 본문 풀을 9개 서비스 × 10개 톤 × 60 접미사 = 5,400 고유 문단 생성
- 인수님 승인 후 `src/data/templates/` 에 반영

#### 4-2. 실제 작업 기록 통합
- 인수님 실 작업 사진 EXIF GPS → 좌표 매칭 → 해당 동 블로그에 **실 작업 날짜** 표기
- "2026-03-15 전주시 효자동 작업" 같은 실성 신호 → 네이버 AI 가짜 콘텐츠 필터 회피

#### 4-3. 지역 고유 정보 주입
- 각 동별 **실제 랜드마크·아파트명** 자동 포함 (정부 공공데이터 API → 아파트 목록 · 학교 목록)
- 예: "효자동 코아루더스카이뷰 아파트 ABC 배관..." — 경쟁사 없는 롱테일 선점

---

## 5. 실시간 모니터링 대시보드

### 5-A. 자체 구축 (Next.js + Supabase)
- `/admin` 라우트 (인증 필요)
- 차트: 문의수 · 페이지뷰 · 검색 순위 · 신규 키워드
- 무료 스택: Supabase Auth + Recharts

### 5-B. 외부 툴 조합 (권장, 초기)
- **Vercel Analytics** (무료) — 페이지뷰 · 방문자
- **Google Search Console** (무료) — 구글 키워드·CTR·포지션
- **네이버 서치어드바이저** (무료) — 네이버 키워드·순위
- **Microsoft Clarity** (무료) — 히트맵·세션 리플레이

---

## 6. 실행 로드맵 (6주)

### Week 1 — 관리 기반
- [ ] GitHub Web UI 편집 가이드 (인수님 튜토리얼 영상 녹화)
- [ ] Notion DB 템플릿 생성 + Action 1개 (regions 동기화) 구축

### Week 2 — 연관검색어 기초
- [ ] Autocomplete 수집 스크립트 작성
- [ ] 주 1회 PR 자동 생성 워크플로우

### Week 3 — Supabase 문의 DB + 관리 페이지
- [ ] Supabase 프로젝트 셋업 (문의 DB 구현 문서 참조)
- [ ] ContactForm 연동
- [ ] Discord 알림

### Week 4 — 검색광고 API 키워드 볼륨
- [ ] 네이버 검색광고 계정 생성
- [ ] 월 검색량 수집 스크립트
- [ ] 접미사 60개 재평가 리포트

### Week 5 — 콘텐츠 다변화
- [ ] LLM 본문 리라이트 1회 배치
- [ ] 실 작업 기록 통합

### Week 6 — 모니터링 대시보드
- [ ] Vercel Analytics · Clarity 연결
- [ ] `/admin` 내부 페이지 (옵션)

---

## 7. 예상 성과 (6주 후)

- 신규 키워드 자동 반영: 월 10~30개 (접미사 풀 90+ 로 확장)
- 블로그 URL: 19,420 → 28,000+ (+40% 롱테일)
- 문의 DB 집계 가능 → 월별 트렌드 보고서
- Notion 편집으로 **Claude 없이 인수님 단독 수정** 가능

---

## 8. 당장 시작 가능한 3가지 (무료 · 1주 내)

1. **GitHub Web UI 편집 가이드** — 30분
2. **Autocomplete 수집 스크립트** — 1시간 (네이버 개발자 키 없이도 공개 엔드포인트)
3. **Notion DB 1개 (regions) 동기화** — 2시간

"1번부터 시작" 또는 "3번 Notion 구축 먼저" 말씀만 주시면 즉시 작업 시작.

---

_업데이트 2026-04-22_
