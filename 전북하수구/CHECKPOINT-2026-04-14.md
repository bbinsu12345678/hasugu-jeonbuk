# 체크포인트 2026-04-14

이 파일 = 세션 clear 직전 핵심 상태 스냅샷.
새 세션에서 이 파일 + `docs/CORE_TECH.md` 두 개만 읽으면 즉시 작업 재개 가능.

## 한 줄 요약

> 전북 15,060개 페이지(8개 서비스 × 60 URL × 251동) 빌드 완료, **8개 서비스 타입 확정 + 20,000 변형 목표 + 이미지 재구성 100장** 작업 대기 중. 다음 세션 시작 시 이미지 재구성(I0~I5)부터 진행.

## 즉시 알아야 할 사실 5가지

1. **8개 서비스 타입**: 변기 / 싱크대 / 하수구 / 누수 / 에어컨배관청소 / 오수관 / 우수관 / 맨홀
   - `src/data/url-suffixes.ts`에 `ServiceType` 타입 8개 정의 완료
   - `src/data/blog-templates.ts`에서 신규 5개는 임시로 `drainTemplate` 매핑 (G6에서 진짜 작성)

2. **변형 목표 20,000개**:
   - 현재: 675개 (가시 변형 = 인트로 15 × 결론 15 × 구조 3)
   - 목표: 20,000개 (인트로 50 × 결론 50 × 구조 8 = 20,000)
   - 페이지당 평균 공유: 1,004 → 0.75 (사실상 모두 유니크)

3. **🚨 이미지 긴급**: `public/images/blog-content-1~15.webp` 15장 모두 경쟁사 상호/번호 박혀 있음
   - 그대로 배포하면 저작권/상표권 침해 + 경쟁사 광고 효과
   - **인수님 보유 사진 100장으로 교체 예정** (저작권 안전, 실 작업 사진 = 네이버 SEO 최적)
   - 위치는 다음 세션에서 인수님께 확인

4. **호스팅 = Cloudflare Pages 무료** (Phase 1)
   - 대역폭 무제한, 빌드 500분/월, 파일 20,000개 (현재 6,844 안전)
   - Cloudflare Bot Fight Mode **OFF** 필수 (네이버 Yeti 봇 차단 위험)

5. **현재 빌드 상태 = 정상**
   - 15,060 블로그 + 14 시 허브 + 1 광역 허브 + 홈 = 15,076 페이지
   - 빌드 25초, sitemap 15,136 URL, RSS 15,120 항목
   - dev 서버는 한글 URL 버그로 사용 불가 → `npx serve out` 추천

## 다음 세션 시작 시 즉시 할 일 (순서대로)

### Phase A: 이미지 재구성 (긴급)
- I0: 인수님께 사진 100장 위치 물어보기
- I1: `public/images/blog-content-1~15.webp` 백업 후 삭제
- I2: 100장을 8개 카테고리로 분류 (`source-photos/{category}/`)
- I3: `pip install pillow && python scripts/process-images.py` 실행
- I4: `blog-templates.ts`의 `thumbnails` 배열 새 경로로 교체
- I5: 빌드 검증 + 시각 확인

### Phase B: 변형 시스템 확장 (G2~G9)
- G2: `blog-templates.ts` → `src/data/templates/` 폴더로 분리
- G3: 인트로 50개 (의도별 10개 × 5)
- G4: 결론 50개
- G5: 본문 구조 8개 + 섹션 변형 6개씩
- G6: 새 서비스 5개 진짜 템플릿 (현재 drainTemplate 임시)
- G7: url-suffixes 새 서비스 접미사 (5 서비스 × ~10개씩)
- G8: FAQ 풀 15개씩
- G9: 빌드 검증 + 변형 공간 계산

### Phase C: 배포 준비
- site.ts 실제 값 채우기 (도메인, 사업자 정보, 카카오, EmailJS)
- OG 이미지 생성 (1200x630)
- Cloudflare Pages 계정 + 배포
- Bot Fight Mode OFF
- 네이버 서치어드바이저 / 구글 서치콘솔 등록

## 주요 파일 위치

```
하수구막힘/
├── docs/
│   ├── CORE_TECH.md              ← 전체 상태 (섹션 2-2 체크포인트)
│   ├── CHECKPOINT-2026-04-14.md  ← 이 파일
│   └── superpowers/specs/
│       ├── 2026-04-12-seo-expansion-architecture-design.md
│       └── 2026-04-12-url-keyword-expansion-design.md
├── src/
│   ├── data/
│   │   ├── regions.ts            전북 14 시/군 251 동
│   │   ├── url-suffixes.ts       60 접미사 + 8 ServiceType
│   │   ├── blog-templates.ts     템플릿 + 변형 시스템 (G2에서 분리 예정)
│   │   └── blog-posts.ts         generateBlogPosts() 호출
│   ├── app/
│   │   ├── page.tsx              홈
│   │   ├── jeonbuk/page.tsx      광역 허브
│   │   ├── [city]/page.tsx       시 허브 14개
│   │   └── [city]/[slug]/page.tsx 블로그 15,060
│   └── config/
│       └── site.ts               전화 010-8184-3496 설정됨, 나머지 플레이스홀더
├── scripts/
│   ├── fetch-images.py           Pixabay 수집 (사용 X, 인수님 사진 사용)
│   └── process-images.py         Pillow 가공 파이프라인 (사용 예정)
└── public/images/
    ├── blog-content-*.webp       15장 (경쟁사 흔적, 삭제 대상)
    └── source-photos/            (예정, 인수님 사진 100장 복사 위치)
```

## 메모리 파일 (`~/.claude/projects/.../memory/`)

- `MEMORY.md` - 인덱스
- `project_hasugu_seo_architecture.md` - 전체 아키텍처
- `reference_jianhomecare_architecture.md` - 경쟁사 분석
- `reference_jianhomecare_url_patterns.md` - 60 URL 패턴
- `reference_hosting_comparison_2026.md` - 호스팅 비교 (Cloudflare/Vercel/Netlify)
- `feedback_seo_doorway_policy.md` - Google/네이버 SEO 정책
- `feedback_image_seo_rules.md` - 이미지 SEO 규칙
- `feedback_update_memory.md` - 메모리 업데이트 규칙

## 빌드/서버 명령어

```bash
cd "C:/Users/admin/Desktop/인수의 작업장/배관홈페이지/하수구막힘"

# 빌드 (15,060 페이지, ~25초)
npx next build

# 정적 서버 (한글 URL 동작)
npx serve out -p 4000
# 브라우저: http://localhost:4000

# 빌드 검증
grep -c '<url>' out/sitemap.xml
grep -c '<item>' out/feed.xml
```

## 인수님 공급 정보 정리

- **전화**: 010-8184-3496 ✅ (site.ts 설정됨)
- **사진 100장**: ⏳ 위치 미확인 (다음 세션 첫 작업)
- **도메인**: ⏳ 미정 (영문 권장, Cloudflare Pages는 .pages.dev 무료 또는 커스텀)
- **사업자 정보**: ⏳ 미정
- **카카오 오픈챗 URL**: ⏳ 미정
- **EmailJS**: ⏳ 미정 (또는 미사용)
