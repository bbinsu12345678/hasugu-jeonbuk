# 하수구막힘 프로젝트 핵심 기술 문서

> 새 세션에서 이 파일과 `~/.claude/projects/.../memory/project_hasugu_seo_architecture.md`를 읽으면 전체 작업 상태를 파악할 수 있습니다.

## 1. 프로젝트 개요

- **위치**: `C:\Users\admin\Desktop\인수의 작업장\배관홈페이지\하수구막힘`
- **브랜치**: `rebuild-jianhomecare`
- **기술 스택**: Next.js 16.2.2, React 19, Tailwind CSS 4, TypeScript 5
- **빌드**: 정적 export (`output: "export"`)
- **전화번호**: `010-8184-3496`
- **타겟 지역**: 전라북도 14개 시/군

## 2. 현재 빌드 결과 (2026-04-15 업데이트)

| 항목 | 수치 |
|------|------|
| 블로그 포스트 | **19,327개** (251동 × 77접미사) |
| 시 허브 페이지 | 14개 (`/[city]/page.tsx`) |
| 광역 허브 페이지 | 1개 (`/jeonbuk/page.tsx`) |
| 동/읍/면 | 251개 |
| URL 접미사 | **77개/동** (8 서비스 타입) |
| sitemap URL | **19,420개** |
| RSS 항목 | 19,404개 |
| 빌드 시간 | 22초 |
| out/ 폴더 크기 | ~1.5GB (블로그 이미지 포함) |
| 블로그 이미지 | **4,230장** (141 원본 × 30 변형) |
| OG 이미지 | 1개 (1200x630) |

## 2-1. 리서치 기반 개선 (2026-04-13)

하수구.com 리서치 문서에서 추출한 아이디어 3가지 적용 완료:

1. **URL 접미사 의도 분류** (5종: 긴급/비교/비용/후기/방법)
   - `src/data/url-suffixes.ts`에 `intent` 필드 추가
   - `detectIntent()` 함수로 suffix 텍스트에서 자동 감지

2. **6가지 변형 축 시스템**
   - 인트로 3개 × 5 의도 = 15개 인트로 변형
   - 결론 3개 × 5 의도 = 15개 결론 변형
   - 본문 구조 3패턴 (섹션 순서 로테이션 A/B/C)
   - 각 포스트에 `s0` 인트로 + `s1~s5` 본문 + `s6` 결론 섹션 구조
   - `pickIntro/pickConclusion/pickBodyStructure` 함수로 해시 기반 선택

3. **4단계 허브 페이지 계층**
   - Level 1: `/` 홈 (기존)
   - Level 2: `/jeonbuk` 광역 허브 (신규) - 14개 시/군 그리드
   - Level 3: `/[city]` 시 허브 (신규, 14개 자동 생성) - 동 목록 + FAQ + 사례
   - Level 4: `/[city]/[slug]` 블로그 포스트 (기존)

**참고**: 한글 디렉토리명(`/전라북도`)은 Next.js 16 정적 export에서 `InvalidCharacterError` 발생. `/jeonbuk` 영문 경로로 변경. 페이지 내부 콘텐츠는 모두 한글 유지.

## 2-2. 진행 중인 작업 (2026-04-14 체크포인트)

### 결정된 사항

**8개 서비스 타입 확정** (인수님 요청):
1. 변기막힘 (기존)
2. 싱크대막힘 (기존)
3. 하수구막힘 (기존)
4. 누수탐지 (신규)
5. 에어컨배관청소 (신규)
6. 오수관막힘 (신규)
7. 우수관막힘 (신규)
8. 맨홀청소 (신규)

**변형 목표: 20,000개** (전북 15,060 페이지 충분 커버):
- 인트로 50개 (의도별 10개 × 5)
- 결론 50개 (의도별 10개 × 5)
- 본문 구조 8개 (현재 3개)
- 섹션 변형 6개씩 (현재 3개)
- FAQ 풀 15개씩 (현재 6개)

**호스팅 결정 (Phase 1)**: **Cloudflare Pages 무료 플랜**
- 대역폭 무제한, 빌드 500분/월, 파일 20,000개 제한 (현재 6,844 안전)
- 비용 0원으로 시장 반응 확인
- Phase 2 (전국 확장) 시 Cloudflare Pages Pro $5 또는 Vercel Pro $20
- **주의**: Cloudflare 사용 시 Bot Fight Mode OFF 필수 (네이버봇 차단 위험)
- 상세: `~/.claude/projects/.../memory/reference_hosting_comparison_2026.md`

### 2026-04-15 추가 완료

**이미지 시스템 완성 (I 시리즈):**
- I0~I3: 인수님 보유 141장 → `scripts/process-workimages.py` 가공 → **4,230장** 생성
  - 각 파일: EXIF 제거, 픽셀 노이즈 주입 (50~150 픽셀 ±3), 색상 조정, WebP 재인코딩
  - 모든 파일 해시 고유 (중복 0)
  - **브랜딩 오버레이**: 굵은 테두리 + 상/하단 하이라이트 바 + 홍보 문구 + 전화번호 (TEL. 010-8184-3496) + 서브 문구
  - 색상 팔레트 10종 테두리/배경 + 10종 텍스트 컬러
  - 무지개 효과: 전화번호 글자별 색상 60% 확률
  - 배너 크기: 사진 60%+ 커버, 반투명 배경 (alpha 130~180)
- I4: `templates/thumbnails.ts` → 4,230장 동적 배열
- I5: 빌드 + 실제 HTML에 `/images/blog-content/blog-content-NNNN.webp` 반영 확인

**OG 이미지:**
- `public/images/og-image.png` (1200x630, 62KB)
- 그라데이션 블루 + 노란 테두리 + 전화번호 + 태그라인
- `scripts/generate-og-image.py`로 재생성 가능

**배포 설정 (2026-04-15):**
- `wrangler.toml` (Cloudflare Pages 설정)
- `netlify.toml` (Netlify 대안)
- `docs/DEPLOY_SEARCH_ENGINE.md` 통합 가이드 (배포 → 네이버 → 구글 → IndexNow → 플레이스)

**⚠️ Cloudflare Pages 파일 수 주의**: 19,327 페이지 × 각 페이지 파일 약 1.3개 = **약 24,000 파일** → 무료 플랜 20,000 제한 초과. **Pro 플랜 $5/월 필수**.

### 진행 상황 (G 시리즈 작업) - 2026-04-14 완료

| Task | 상태 | 내용 |
|------|:---:|------|
| G1 | ✅ | 타입 확장 (ServiceType 8개) + 임시 templateMap |
| G2 | ✅ | blog-templates.ts → templates/ 폴더 14개 파일로 분리 (654줄 → 147줄 + 13파일) |
| G3 | ✅ | 인트로 풀 50개 확장 (의도별 10개 × 5의도) - templates/intro-pool.ts |
| G4 | ✅ | 결론 풀 50개 확장 - templates/conclusion-pool.ts |
| G5 | ✅ | 본문 구조 8개 (3 → 8) - templates/body-structures.ts |
| G6 | ✅ | 새 서비스 5개 진짜 템플릿 작성 (누수/에어컨/오수관/우수관/맨홀) |
| G7 | ✅ | url-suffixes 60 → **77개** (신규 5 서비스 × 5개씩 추가) |
| G8 | ⏭️ | FAQ 풀 6개 유지 (목표 변형 공간 도달로 우선순위 낮음) |
| G9 | ✅ | 빌드 검증 + 변형 공간 재계산 (4,000 가시 조합 / 18.66억 이론) |

### 빌드 결과 (G 시리즈 완료 후)

| 항목 | 이전 | 현재 |
|------|:---:|:---:|
| 블로그 포스트 | 15,060 | **19,327** |
| sitemap URL | 15,136 | **19,420** |
| RSS 항목 | 15,120 | **19,404** |
| 빌드 시간 | 25초 | **22초** |
| 가시 변형 조합 (인트로×구조×결론) | 675 | **4,000 (5.9배 증가)** |
| 의도별 페이지 평균 공유 | 1,004회 | **4.8회 (99.5% 감소)** |
| 이론 총 변형 공간 | ~1.18억 | **~18.66억 (15.8배 증가)** |

### 변형 풀 최종 현황

| 요소 | 개수 |
|------|:---:|
| 인트로 (의도별 10개 × 5의도) | 50 |
| 결론 (의도별 10개 × 5의도) | 50 |
| 본문 구조 (섹션 순서 패턴) | 8 |
| 서비스 템플릿 | 8 |
| URL 접미사 | 77 |
| 템플릿당 타이틀 변형 | 4 |
| 템플릿당 excerpt 변형 | 3 |
| 섹션 s1~s5 변형 (서비스당) | 각 3개 |
| FAQ 풀 (서비스당) | 6 |

### 🚨 긴급: 이미지 재구성 작업 (CRITICAL)

**현재 `public/images/blog-content-1~15.webp` 15장에 경쟁사 정보 박혀 있음 (상호명/전화번호 등)** → 그대로 배포 시 저작권/상표권 침해 + 경쟁사 광고 효과까지 발생.

**계획**:
1. **15장 전부 제거 또는 교체** (workimages 폴더도 동일 검수 필요)
2. **신규 이미지 소스 확보**:
   - **✅ 결정: 인수님 보유 사진 약 100장 사용** (최선의 옵션)
     - 저작권 문제 없음 (본인 소유)
     - 경쟁사 흔적 없음
     - 실제 작업 사진 = 네이버 SEO에 최적 (실 사용자 신호)
     - 100장 × `process-images.py` 2배 변형 = 200장 고유 이미지
     - 15,060 페이지에 200장이면 페이지당 평균 75회 재사용 (메인 사이트 내 OK)
   - 옵션 A 폐기: Pixabay (인수님 사진 충분)
   - 옵션 C 폐기: AI 생성 (네이버 가짜 사진 탐지 위험)
3. **이미지 가공 파이프라인 적용** (`scripts/process-images.py` 준비됨):
   - EXIF 메타 제거
   - 픽셀 해시 변경 (노이즈)
   - 색상 프로파일 변경
   - WebP 재인코딩
4. **신규 이미지 8개 카테고리** (8개 서비스 타입과 매칭):
   - 변기 / 싱크대 / 하수구 / 누수 / 에어컨 / 오수관 / 우수관 / 맨홀
5. **동/도시별 CSS 필터 변형은 이미 적용됨** (`makeImageFilter()` in `src/app/[city]/[slug]/page.tsx`)

**작업 순서 (이미지 재구성 → G2~G9 이전에 처리하는 게 안전)**:
- I0: 인수님 사진 100장 위치 확인 + 프로젝트로 복사 (예: `public/images/source-photos/`)
- I1: 현재 `blog-content-1~15.webp` 15장 백업 후 삭제 (경쟁사 흔적 박힘)
- I2: 100장을 8개 카테고리로 분류 (변기/싱크대/하수구/누수/에어컨/오수관/우수관/맨홀)
   - 매뉴얼 분류 또는 폴더 이름으로 분류 (`source-photos/{category}/`)
- I3: `scripts/process-images.py` 실행하여 EXIF 제거 + 변형 + WebP 재인코딩
   - 100장 → 200장 (원본당 2개 변형)
   - 출력: `public/images/processed/{category}/*.webp`
- I4: `blog-templates.ts`의 `thumbnails` 배열을 새 경로로 업데이트
- I5: `imageAlt`도 카테고리별 적절히 매칭 (현재 코드는 동 이름 + 키워드 자동 생성, OK)
- I6: 빌드 검증 + 샘플 페이지 시각 확인

### 다음 세션 시작 시 읽을 파일 (우선순위)

1. **이 파일** (`docs/CORE_TECH.md`) - 전체 상황
2. `~/.claude/projects/.../memory/project_hasugu_seo_architecture.md` - 메모리 인덱스
3. `~/.claude/projects/.../memory/reference_hosting_comparison_2026.md` - 호스팅 결정
4. `~/.claude/projects/.../memory/reference_jianhomecare_url_patterns.md` - URL 패턴
5. `~/.claude/projects/.../memory/feedback_image_seo_rules.md` - 이미지 SEO 규칙
6. `~/.claude/projects/.../memory/feedback_seo_doorway_policy.md` - Google/네이버 정책
7. `~/.claude/plans/zany-crunching-cerf.md` - 직전 plan 파일 (있을 경우)

### 새 세션에서 즉시 실행할 작업 (우선순위순)

1. **I1~I6: 이미지 재구성** (가장 시급, 배포 차단 요소)
2. **G2: 파일 분리** (templates/ 폴더 구조)
3. **G3~G4: 인트로/결론 풀 50개 확장**
4. **G5: 본문 구조 + 섹션 변형 확장**
5. **G6: 새 서비스 5개 진짜 템플릿 작성** (현재 drainTemplate 임시 매핑)
6. **G7: url-suffixes 새 서비스 접미사 추가**
7. **G8: FAQ 풀 15개씩 확장**
8. **G9: 빌드 검증 + 변형 공간 계산**

### 빠르게 컨텍스트 회복하는 한 줄 요약

> 전북 14시/군 251동에 60개 URL 접미사 × 8개 서비스로 15,060개 정적 페이지 생성, 4단계 허브(홈/jeonbuk/[city]/[slug])로 SEO 강화, 다음 단계는 이미지 경쟁사 흔적 제거(긴급) → 변형 풀 20,000개 확장 → 5개 서비스 진짜 템플릿 작성, 호스팅은 Cloudflare Pages 무료로 배포 예정.

## 3. 핵심 아키텍처

### 데이터 흐름
```
src/data/regions.ts (지역 데이터)
   ↓
src/data/url-suffixes.ts (60개 URL 접미사)
   ↓
src/data/blog-templates.ts (콘텐츠 변형 시스템)
   ↓
src/data/blog-posts.ts (자동 생성된 15,060개 포스트)
   ↓
src/app/[city]/[slug]/page.tsx (동적 라우트로 정적 빌드)
```

### 파일 구조
```
src/
├── app/
│   ├── layout.tsx              # 글로벌 메타, JSON-LD, RSS link, 모바일 메타
│   ├── page.tsx                # 홈페이지 + Breadcrumb
│   ├── [city]/[slug]/page.tsx  # 블로그 포스트 (15,060개 정적 생성)
│   ├── robots.ts               # AI봇 8개 차단
│   ├── sitemap.ts              # 자동 사이트맵
│   └── feed.xml/route.ts       # RSS 피드
├── config/
│   └── site.ts                 # 사이트 설정 (도메인 등 - 일부 플레이스홀더)
├── data/
│   ├── regions.ts              # 전북 14개 시/군 251개 동
│   ├── url-suffixes.ts         # 60개 URL 접미사 패턴
│   ├── blog-templates.ts       # 콘텐츠 변형 시스템 + 자동 생성 함수
│   ├── blog-posts.ts           # generateBlogPosts() 호출
│   ├── services.ts
│   ├── facilities.ts
│   ├── testimonials.ts
│   └── regions.ts
├── lib/
│   ├── seo.ts                  # JSON-LD 6종 생성 함수
│   └── utils.ts
└── components/
    ├── layout/
    │   ├── Header.tsx
    │   └── Footer.tsx
    ├── sections/
    │   ├── Hero.tsx            # H1 키워드
    │   ├── Facilities.tsx      # H2 키워드 + 6 카드
    │   ├── ServiceArea.tsx     # H2 키워드
    │   ├── ServiceCards.tsx    # H2 키워드 + 3 서비스
    │   ├── Testimonials.tsx    # H2 키워드 + 8 후기
    │   ├── ContactForm.tsx     # H2 키워드 + EmailJS
    │   └── BlogGrid.tsx        # H2 키워드 + 그리드
    └── ui/
        └── FloatingCTA.tsx     # 모바일 하단 고정 전화 버튼

scripts/
├── fetch-images.py             # Pixabay 이미지 자동 수집
└── process-images.py           # 이미지 가공 파이프라인 (Pillow)
```

## 4. URL 키워드 확장 전략

### 핵심 결정
경쟁사 jianhomecare.com이 동당 60개 URL 변형을 운영. 우리도 같은 전략을 채택하되, **키워드 순서를 변형**하여 차별화.

### URL 패턴
```
형식: /{city}/{dong}{suffix}
예시: /전주시/덕진동변기막힘뚫는곳업체비용해결후기
```

### 60개 접미사 카테고리
- **변기**: 15개 (변기막힘, 변기뚫음, 변기막혔을때 조합)
- **싱크대**: 17개 (싱크대막힘, 싱크대뚫음, 싱크대역류 조합)
- **하수구**: 14개 (하수구막힘, 고압세척, 하수구해빙 조합)
- **기타**: 14개 (오수관, 배관, 배수구, 누수, 동파, 세면대, 욕조)

### 경쟁사 vs 우리 차이
| 항목 | 경쟁사 | 우리 |
|------|:---:|:---:|
| URL 키워드 순서 | 원본 | 순서 변형 (고유 URL) |
| Title 태그 | 모든 페이지 동일 | URL suffix의 primaryKeywords 기반 동적 |
| 페이지 콘텐츠 | 모든 URL 동일 HTML | 해시 기반 콘텐츠 변형 |
| ALT 태그 | 동일 | dong + 키워드 기반 고유 |
| JSON-LD | 1개 (SiteNav) | 6종 (LocalBusiness, FAQ, Article 등) |
| H1/H2 키워드 | 없음 | 모든 섹션 키워드 |

## 5. 콘텐츠 변형 시스템

### 결정론적 해시 기반 변형
같은 동은 항상 같은 콘텐츠가 나오도록 `hashString(dong)` 함수 사용. 이걸로 랜덤이 아닌 결정론적 변형을 적용:

- 섹션 콘텐츠: 카테고리당 3~4개 변형
- 타이틀: 4개 변형
- FAQ: 6개 풀에서 3개 선택
- 썸네일: 15개 이미지 순환
- 색상 테마: 8개 (blue, green, orange, purple, red, teal, indigo, amber)
- 아이콘: 10개 이모지

### 핵심 함수
- `hashString(str)` - 결정론적 해시
- `pickVariation<T>(items, dong, offset)` - 변형 선택
- `pickMultiple<T>(items, dong, count)` - 여러 항목 선택
- `fill(pattern, dong, city)` - `{dong}`, `{city}` 치환

## 6. SEO 최적화 현황

### 메타 태그
- **Title**: 동적 생성, URL suffix의 primaryKeywords 반영
- **Description**: 동+서비스 맞춤, 키워드 밀집
- **Keywords**: 21개 + URL suffix 기반 추가
- **OG image**: `/images/og-image.png` (1200x630, 직접 만들어야 함)
- **Twitter Card**: summary_large_image
- **Canonical**: 페이지별 자동 생성
- **Robots**: index, follow, max-snippet:-1

### JSON-LD 구조화 데이터 (6종)
1. **LocalBusiness** (Plumber 타입) - 글로벌
2. **SiteNavigationElement** - 글로벌
3. **ItemList** - 홈/블로그
4. **FAQPage** - 홈/블로그
5. **BreadcrumbList** - 홈/블로그
6. **Article** - 블로그 전용

### 모바일 SEO
- `format-detection: telephone=yes` (전화번호 자동 인식)
- `apple-mobile-web-app-capable`
- `mobile-web-app-capable`
- `theme-color: #1e40af`
- viewport meta
- 반응형 Tailwind 클래스 24개+
- FloatingCTA (하단 고정 전화 버튼)

### robots.txt AI봇 차단 (8개)
GPTBot, ClaudeBot, CCBot, Google-Extended, Bytespider, Amazonbot, Applebot-Extended, meta-externalagent

### sitemap + RSS
- `sitemap.xml`: 15,121개 URL 자동 생성
- `feed.xml`: 15,120개 RSS 항목 자동 생성

## 7. 이미지 전략

### 핵심 원칙 (메모리에 저장된 규칙)
- **메인 사이트 내 이미지 재사용**: OK (구글 공식 - 패널티 없음)
- **ALT 태그**: 페이지별 다르게 (이미 구현됨, dong + 키워드 기반)
- **위성 사이트 간 이미지 공유**: 절대 금지 (네이버 AI 유사 이미지 탐지)

### 현재 구현
- CSS 플레이스홀더 + 색상/테두리/아이콘 변형 (8개 색상 테마, 10개 아이콘)
- blog-content-1~15.webp (15개 이미지) 해시 기반 순환
- 동마다 다른 색상/아이콘 자동 배정

### 이미지 수집/가공 파이프라인 (스크립트 준비됨)
**소스**: Pixabay API (무료 상업 이용, 출처 표기 불필요)

**fetch-images.py**:
- 8개 카테고리 × 3개 검색어 × 15장 다운로드 가능
- 환경변수: `PIXABAY_API_KEY` 필요

**process-images.py** (Pillow):
- EXIF 메타데이터 완전 제거
- 표준 크기 1200x800 + 랜덤 크롭
- 미세 노이즈 (Gaussian/Unsharp)
- 색상 조정 (brightness/contrast/saturation)
- WebP 재인코딩 (랜덤 품질 80~92)
- 파일명 해시화
- 원본당 2개 변형 생성

### ⚠️ 사용 금지
네이버 이미지 검색 크롤링 + 세탁 = 저작권 침해 + 네이버 패널티 위험. 거절됨.

## 8. 미완료 작업 (다음 세션에서)

### 인수님 결정/입력 필요
1. **site.ts 실제 값**:
   - `domain` (Netlify URL 또는 커스텀 도메인)
   - `kakaoUrl` (카카오 오픈챗)
   - `business`: 회사명, 대표, 사업자번호, 주소
   - `emailjs`: serviceId, templateId, publicKey
   - `verification.naver/google` (서치콘솔 등록 후)

2. **이미지 수집 실행**:
   - Pixabay API 키 발급: https://pixabay.com/api/docs/
   - `export PIXABAY_API_KEY=xxx`
   - `python scripts/fetch-images.py`
   - `pip install pillow`
   - `python scripts/process-images.py`

3. **OG 이미지 생성**:
   - `public/images/og-image.png` (1200x630px)
   - 사이트명 + 전화번호 + "변기막힘 싱크대막힘 하수구막힘 24시 즉시 출동"

### 코드 작업
- 가공된 이미지 경로를 blog-templates.ts thumbnails 배열에 반영
- 5채널 전략 중 채널 1 (네이버 플레이스 등록 가이드)
- 위성 사이트 2~3개 제작 (각각 다른 디자인/이미지)

### 배포
- Netlify 무료 플랜 한도 확인 (1.2GB는 클 수 있음)
- 대안: Cloudflare Pages
- 네이버 서치어드바이저 등록 + 사이트맵/RSS 제출
- 구글 서치콘솔 등록
- IndexNow (빙/얀덱스/세즈남) 제출

## 9. 핵심 결정사항 기록

| 결정 | 이유 |
|------|------|
| 멀티사이트 → 단일사이트 | banana-app 방식 검증 안 됨, 단일 사이트가 관리 쉬움 |
| 동당 3개 → 60개 URL | 경쟁사 모방, 검색 키워드 커버리지 극대화 |
| 키워드 순서 변형 | 경쟁사와 차별화, 도어웨이 네트워크 회피 |
| Pixabay 이미지 | 저작권 안전, 무료 상업 이용 |
| 네이버 크롤링 거절 | 저작권 침해 + 패널티 위험 |
| Cloudflare 미적용 | Netlify 기본 도메인에는 적용 불가, 커스텀 도메인 시 가능 |
| 5채널 전략 인지 | 플레이스/블로그/웹사이트/위성/지식iN — 경쟁사가 안 하는 영역 우선 선점 |

## 10. 경쟁사 분석 요약

### jianhomecare.com 실체
- **메인 도메인**: 72,212개 URL (sitemap2~13.xml)
- **콘텐츠**: 모든 URL이 메인 홈페이지와 거의 동일한 HTML (3줄만 차이)
- **서브도메인**: 10개+ (gangnam, sp, gangbuk, namdong 등 - 별도 콘텐츠)
- **위성 사이트**: 1개+ (sungdong-drain.netlify.app)
- **약점**: JSON-LD 1개만, H1/H2 키워드 없음, 콘텐츠 차별화 없음
- **강점**: URL 키워드 양 + 수도권 집중

### 우리가 우위인 점
- JSON-LD 6종 vs 1종
- H1/H2 키워드 vs 없음
- 콘텐츠 변형 시스템 vs 동일 HTML
- 모바일 SEO 메타 vs 기본 viewport만
- AI봇 차단 vs 미차단

### 우리가 부족한 점
- URL 양: 15,060 vs 72,212 (전북만 vs 수도권)
- 도메인 권위: 신규 vs 운영 중
- 백링크: 없음 vs 위성 사이트로 확보

## 11. 메모리 파일 (~/.claude/projects/.../memory/)

다음 파일들에 상세 정보가 저장되어 있습니다:

- `project_hasugu_seo_architecture.md` - 전체 현황 (가장 중요)
- `reference_jianhomecare_architecture.md` - 경쟁사 완전 분석
- `reference_jianhomecare_url_patterns.md` - 60개 URL 접미사 목록
- `feedback_seo_doorway_policy.md` - Google/네이버 공식 SEO 정책
- `feedback_image_seo_rules.md` - 이미지 SEO 규칙
- `feedback_update_memory.md` - 작업마다 메모리 업데이트 규칙

## 12. 빌드 & 실행 명령어

```bash
# 빌드
cd "C:/Users/admin/Desktop/인수의 작업장/배관홈페이지/하수구막힘"
npx next build

# 개발 서버
npx next dev

# 결과 확인
ls out/
cat out/sitemap.xml | grep -c '<url>'
cat out/feed.xml | grep -c '<item>'
cat out/robots.txt
```
