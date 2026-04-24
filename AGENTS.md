<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 하수구막힘 프로젝트 — 에이전트 컨텍스트

> 새 세션 시작 시 다음 순서로 읽으세요:
> 1. 이 파일 (AGENTS.md)
> 2. `전북하수구/CHECKPOINT-2026-04-14.md` — 최신 체크포인트
> 3. `전북하수구/CORE_TECH.md` — 전체 기술 문서 (특히 섹션 2-2)
> 4. `~/.claude/projects/.../memory/MEMORY.md` — 인덱스

## 한 줄 요약

전북 14 시/군 251 동에 8개 서비스 × 60 URL 접미사로 **15,060개 정적 페이지** + 4단계 허브(홈/jeonbuk/[city]/[slug])를 운영하는 SEO 사이트. 경쟁사 jianhomecare.com 모방 + 키워드 순서 변형으로 차별화.

## 프로젝트 핵심 사실

- **위치**: `C:\Users\admin\Desktop\인수의 작업장\배관홈페이지\하수구막힘`
- **브랜치**: `rebuild-jianhomecare`
- **기술 스택**: Next.js 16.2.2 (Turbopack), React 19, Tailwind CSS 4, TypeScript 5
- **빌드 모드**: 정적 export (`output: "export"`)
- **전화번호**: `010-8184-3496` (site.ts 설정됨)
- **타겟 지역**: 전라북도 14개 시/군 (전국 확장 계획 있음)
- **현재 빌드**: 15,060 블로그 + 14 시 허브 + 1 광역 허브 + 홈 = 15,076 페이지 / 25초 / 1.2GB

## 8개 서비스 타입 (확정)

1. 변기막힘
2. 싱크대막힘
3. 하수구막힘
4. 누수탐지 (신규, 임시 drainTemplate 매핑)
5. 에어컨배관청소 (신규, 임시 drainTemplate 매핑)
6. 오수관막힘 (신규, 임시 drainTemplate 매핑)
7. 우수관막힘 (신규, 임시 drainTemplate 매핑)
8. 맨홀청소 (신규, 임시 drainTemplate 매핑)

## URL 4단계 허브 구조

```
/                              L1: 홈
└── /jeonbuk                   L2: 광역 허브 (전라북도)
     └── /{city}               L3: 시 허브 14개 (/전주시, /군산시, ...)
          └── /{city}/{slug}   L4: 블로그 15,060개
```

**참고**: 한글 디렉토리 (`src/app/전라북도/`)는 Next.js 16 정적 export에서 `InvalidCharacterError` 발생 → 영문 경로 `/jeonbuk` 사용. 페이지 내부 콘텐츠는 한글 유지.

## 핵심 파일 구조

```
src/
├── app/
│   ├── layout.tsx              글로벌 메타 + JSON-LD 6종 + 모바일 메타 + RSS link
│   ├── page.tsx                홈
│   ├── jeonbuk/page.tsx        광역 허브
│   ├── [city]/page.tsx         시 허브 14개 (generateStaticParams)
│   ├── [city]/[slug]/page.tsx  블로그 15,060개 (CSS filter 변형 적용)
│   ├── robots.ts               AI 봇 8개 차단
│   ├── sitemap.ts              자동 사이트맵
│   └── feed.xml/route.ts       RSS 피드
├── data/
│   ├── regions.ts              전북 14 시/군 251 동
│   ├── url-suffixes.ts         60 접미사 + 8 ServiceType + intent 자동 감지
│   ├── blog-templates.ts       콘텐츠 변형 시스템 (G2에서 폴더 분리 예정)
│   └── blog-posts.ts           generateBlogPosts() 호출
├── lib/
│   └── seo.ts                  JSON-LD 6종: LocalBusiness, SiteNav, ItemList, FAQ, Breadcrumb, Article
├── config/
│   └── site.ts                 전화 ✅, 도메인/사업자/카카오/EmailJS ⏳ 플레이스홀더
└── components/
    ├── layout/Header.tsx, Footer.tsx
    ├── sections/Hero.tsx       H1 키워드 (siteConfig.seo.h1)
    ├── sections/*.tsx          모든 H2에 키워드 포함
    └── ui/FloatingCTA.tsx      모바일 하단 고정 전화 버튼

scripts/
├── fetch-images.py             Pixabay 수집 (사용 X — 인수님 사진 100장 사용 예정)
└── process-images.py           Pillow 이미지 가공 파이프라인 (EXIF 제거, WebP, 변형)

docs/
├── CHECKPOINT-2026-04-14.md    최신 체크포인트 (이거 먼저 읽기)
├── CORE_TECH.md                전체 기술 문서
└── superpowers/specs/          설계 문서들
```

## 결정 사항 요약

| 결정 | 값 | 이유 |
|------|------|------|
| 호스팅 (Phase 1) | Cloudflare Pages 무료 | 대역폭 무제한, 비용 0 |
| 호스팅 (Phase 2) | CF Pro $5 또는 Vercel Pro $20 | 트래픽 확인 후 |
| 변형 목표 | 20,000개 | 15,060 페이지 충분 커버 |
| 도메인 형식 | 영문 권장 | 퓨니코드 이슈 회피 |
| 이미지 소스 | 인수님 보유 100장 | 저작권 안전, 실 작업 사진 |
| URL 패턴 | 경쟁사 60개 + 순서 변형 | 도어웨이 네트워크 회피 |

## 🚨 긴급 이슈

`public/images/blog-content-1~15.webp` **15장 모두 경쟁사 상호/번호가 박혀 있음**. 그대로 배포 시 저작권/상표권 침해 + 경쟁사 광고 효과 발생. **다음 세션에서 가장 먼저 처리할 작업** (체크포인트 문서의 I0~I5).

## 진행 중 작업 (G/I 시리즈)

- **G1 ✅**: 8개 ServiceType 타입 확장 + 임시 templateMap
- **G2~G9 ⏳**: 변형 시스템 확장 (blog-templates 분리, 인트로 50, 결론 50, 본문 8, 섹션 6, FAQ 15)
- **I0~I5 ⏳**: 이미지 재구성 (인수님 사진 100장 → 카테고리 분류 → 가공 → 적용)
- **다음 단계**: I0 (사진 위치 확인) 부터 시작

## 빌드/실행 명령어

```bash
cd "C:/Users/admin/Desktop/인수의 작업장/배관홈페이지/하수구막힘"

# 빌드 (15,060 페이지, ~25초)
npx next build

# 정적 서버 (한글 URL 동작) — dev 서버는 한글 URL 버그 있음
npx serve out -p 4000
# http://localhost:4000

# 빌드 검증
grep -c '<url>' out/sitemap.xml      # 15,136
grep -c '<item>' out/feed.xml        # 15,120
cat out/robots.txt                   # AI 봇 8개 차단 확인
```

## SEO 정책 요약 (절대 위반 금지)

1. **이미지에 경쟁사 상호/번호** 박힌 채로 배포 ❌
2. **저작권 있는 이미지** 무단 사용 ❌
3. **AI 가짜 사진** 생성 ❌ (네이버 탐지)
4. **위성 사이트 간 이미지 공유** ❌ (네이버 AI 유사 이미지 탐지)
5. **Cloudflare Bot Fight Mode ON** ❌ (네이버봇 차단 위험)
6. **각 동마다 똑같은 콘텐츠** 위험 (Google Doorway Pages → 변형 시스템으로 회피)

## 메모리 인덱스

`~/.claude/projects/.../memory/`:
- `project_hasugu_seo_architecture.md` — 전체 아키텍처 (가장 중요)
- `reference_jianhomecare_architecture.md` — 경쟁사 분석
- `reference_jianhomecare_url_patterns.md` — 60 URL 접미사
- `reference_hosting_comparison_2026.md` — 호스팅 비교
- `feedback_seo_doorway_policy.md` — Google/네이버 정책
- `feedback_image_seo_rules.md` — 이미지 SEO 규칙
