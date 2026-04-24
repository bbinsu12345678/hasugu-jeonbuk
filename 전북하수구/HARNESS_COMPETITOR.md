# 하네스(Harness) 경쟁사 해부 — jianhomecare.com

> 내부 레퍼런스. 공개 배포 금지. 목적은 "구조적 시사점 추출 → 우리 버전 재탄생" 이며 **모방이 아님**.
> 작성: 2026-04-20 · 원본: `reference_jianhomecare_architecture.md`, `reference_jianhomecare_url_patterns.md`, `docs/seo-template-analysis.md`(curl 직접 스크래핑).

---

## 0. 한 줄 요약

경쟁사 jianhomecare.com은 **메인 도메인 72,212개 URL + 서브도메인 10개 + Netlify 위성**을 운용하되, 실제 블로그 페이지 콘텐츠는 **URL 키워드만 다르고 HTML 본문은 거의 동일**. SEO 최적화 자체는 빈약(H1에 키워드 없음, JSON-LD 1종). **우리가 이길 공간은 넓다**.

## 1. 규모·인프라

| 항목 | 경쟁사 | 우리(현재) |
|---|---|---|
| 메인 URL 수 | 72,212 | 15,076 |
| 사이트맵 | sitemap2~13.xml (12분할) | sitemap.xml 단일 |
| 서브도메인 | 10+ (gangnam 등 지역별) | 미운용 |
| 위성 사이트 | sungdong-drain.netlify.app 등 | 없음 |
| 네이버 블로그 | ❌ | 미운용 |
| 네이버 플레이스 | ❌ | 미등록 |
| 기술스택 | Bootstrap 4.4.1 / jQuery 3.4.1 / Owl Carousel | Next.js 16 · React 19 · Tailwind 4 |
| 호스팅 | Cloudflare | Cloudflare Pages 예정 |

## 2. URL·라우팅 하네스

### 경쟁사 패턴
- 경로: `/{시구}/{동}{서비스키워드}` (예: `/인천중구/개항동변기막힘뚫음해결후기추천`)
- 동당 접미사 60개 (변기 15 + 싱크대 17 + 하수구 14 + 기타 14).
- 접미사 예: `24시뚫는업체해결후기추천`, `뚫는곳비용업체해결후기`, `뚫음해결후기추천`, `고압세척비용역류뚫는업체추천`…
- 모든 URL이 **동일한 본문**을 가리킴(URL 도어웨이). Google Scaled Content Abuse 리스크 존재.

### 우리 버전 (재탄생 방향)
- 4단계 허브: `/` → `/jeonbuk` → `/{city}` → `/{city}/{slug}`.
- 접미사 77개(`src/data/url-suffixes.ts`, 이미 확장됨)로 8개 서비스 타입 + 의도(긴급/비용/후기/비교/방법) 자동 분기.
- **URL만 달라지는 도어웨이 패턴을 피하기 위해** 블로그 본문은 intro 50 × conclusion 50 × 본문 구조 8 × 해시 기반 섹션 변형으로 **20,000 실질 변형** 목표(`docs/REBIRTH_SPEC.md`).

## 3. 메타 태그 하네스

### 경쟁사
| 태그 | 값 (메인) | 특징 |
|---|---|---|
| title | "변기막힘, 싱크대막힘, 하수구막힘 No1 해결사" | **고정**(모든 서브페이지 공유) |
| description | "딱 한 통화면 해결! … 7년 경력으로 한번에 끝!" | 고정, 과장 표현 |
| keywords | 지역+서비스 28개 배열 | 지역명 28개 나열 |
| robots | `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1` | 관대 |
| canonical | `https://jianhomecare.com` | 모든 페이지가 메인 참조 |
| og:site_name | "변기막힘" | — |
| og:image | `/img/14.png` 1200×627 | 단일 이미지 재사용 |

### 우리 버전
- title: 페이지 타입별 5종(홈·광역·시·서비스·블로그), 70~90자, 지역명 + 서비스 + 차별점 3요소.
- description: 70~90자, 첫 25자에 3대 키워드.
- canonical: **자기참조** (모든 페이지가 자기 URL 가리킴, 중복 판정 회피).
- robots 메타: `index, follow` + `max-image-preview:large`.
- og:image: **페이지별** 다름(동·서비스 썸네일, 4,230장에서 해시 기반 선택).

## 4. 헤딩 하네스 (H1·H2)

### 경쟁사 메인
- H1 (display-3): "막힌 곳이 있으신가요? 100% 뚫어드립니다" — **키워드 없음**.
- H2 4종: "서비스 출동 지역", "변기/싱크대/하수구가 막혔을 때", "고객님들의 후기", "문의하기" — 일반적.

### 경쟁사 서브페이지
- H1: `{동} {서비스키워드}, {고유 SEO 문구}` (예: "개항동 변기막힘 뚫음, 직접 경험한 생생한 해결 후기와 추천 전문가 이야기").
- H2 5종 (섹션 s1~s5):
  1. "{서비스}, 왜 신속한 해결이 필요한가"
  2. "{동}에서 {서비스} 문제를 맞닥뜨린 순간"
  3. "전문가의 체계적 접근, 단계별 해결 과정"
  4. "실제 사례에서 확인한 {작업} 기술력과 효과"
  5. "{동} 주민들이 직접 추천하는 {서비스} 해결법"

### 우리 버전
- H1: 페이지당 **정확히 1개**, 어순을 "지역·서비스·가치제안" 3요소로 재정렬, 경쟁사의 "100% 뚫어드립니다" 같은 단정 표현 금지(표시광고법).
- H2: 최소 3개, 경쟁사와 다른 **의도 기반 순서** (상황 → 우리가 현장에서 한 일 → 사장님의 팁 → 지역 특화 포인트 → FAQ 유도).
- 블로그 슬러그에서 의도를 감지(`intent-selectors.ts`)해 H2 순서 자체를 바꿈.

## 5. 구조화 데이터(JSON-LD) 하네스

### 경쟁사
- 메인: `SiteNavigationElement` 1종만.
- 서브: 일부에 `ItemList`(5개 Service), `FAQPage`(3~4개 Q/A). **LocalBusiness·BreadcrumbList·Article 없음**.

### 우리 버전 (이미 구현, 유지)
- 6종: `LocalBusiness`, `Organization/SiteNavigationElement`, `ItemList`, `FAQPage`, `BreadcrumbList`, `Article`.
- 2025 최신 권장 필드 추가(REBIRTH_SPEC Phase 2):
  - `LocalBusiness.areaServed` 배열(전북 14 시/군).
  - `LocalBusiness.knowsAbout` 8개 서비스.
  - `LocalBusiness.makesOffer` 각 서비스 OfferCatalog.
  - `Article.speakable` (음성 검색).
  - `FAQPage.dateModified`.

## 6. 콘텐츠 하네스 (본문 5섹션 구조)

### 경쟁사 섹션 패턴
| s | 목적 | 문장 시작 | 이미지 |
|---|---|---|---|
| s1 | 문제 인식·긴급성 | "…이 발생하면 단순한 불편함을 넘어…" | `temp_images/img_N.webp` |
| s2 | 지역 사례 | "{동}에 거주하는 A씨는 어느 날…" | `temp_images/img_N.webp` |
| s3 | 작업 과정 | "전문가는 먼저 현장 방문 후…" | `temp_images/img_N.webp` |
| s4 | 실제 결과 | "B씨의 사례를 살펴보면…" | `temp_images/img_N.webp` |
| s5 | 예방·추천 | 고정 텍스트 | — |

**문제**: "A씨/B씨" 익명 사례가 15,060개 페이지에 동일 패턴으로 반복 → 네이버 중복 필터 취약.

### 우리 버전
- 풀 크기: intro 50 / conclusion 50 / 본문 구조 8 / 섹션 6개씩 / FAQ 15.
- 톤: 전북 사장님 1인칭 + 현장 에피소드(방문 시간·장비·발견한 원인·사용한 방법 실무 디테일) + "보장 0%·해결 100%" 같은 단정 표현 금지.
- 지역 토막: 동마다 "OO초등학교 앞 5층", "OO시장 뒷골목" 같은 실측 랜드마크(인수님 실 경험 풀 필요).
- 이미지 alt: 경쟁사처럼 `"{동} {서비스} 현장 모습"` 고정 금지, 시간대·장비·원인을 혼합("오후 3시 주방 배수구 기름때 고압세척 작업").

## 7. 이미지 하네스

### 경쟁사
- 본문: `temp_images/img_1~15.webp` 15장을 전 페이지가 공유(**중복 이미지 리스크**).
- 스타일: `width:60%; margin:40px auto`.
- alt: 고정 패턴.

### 우리 버전
- 원본 141장(workimages) × 30변형 = **4,230장** 이미 생성 완료.
- **경쟁사 상호/번호가 박힌 `public/images/blog-content-1~15.webp` 15장은 Phase 1에서 전부 삭제.**
- **EXIF 유니크 주입 필수** (`scripts/inject-exif.py` Phase 1 신규):
  - DateTimeOriginal: 시드 기반 2024-01~2026-04 난수.
  - Make/Model: 인수님 실사용 기종 풀 내 랜덤.
  - GPS: 전북 14 시/군 중심좌표 ±0.01° (약 ±1.1km) 소수 6자리.
  - Software·ISO·조리개·셔터·UserComment 전부 페이지 고유.
- alt: 페이지별 동·서비스·시간대·장비 4요소 조합으로 중복률 10% 미만.

## 8. 색인·robots·사이트맵·RSS 하네스

### 경쟁사
- `sitemap2.xml`~`sitemap13.xml` 총 12개 분할, URL 72,212개.
- robots: AI 봇 차단 없음, `User-agent: *` Allow.
- RSS 미확인.

### 우리 버전 (2026-04-20 업데이트 — 경쟁사 분할 방식 그대로 적용)
- **sitemap 분할 (경쟁사 방식 그대로)**:
  - `sitemap.xml` = **sitemap index** (파트 파일 참조만, 352B)
  - `sitemap-1.xml` (URL 1~10,000, 5.8MB) + `sitemap-2.xml` (10,001~19,420, 5.5MB)
  - 경쟁사 `sitemap2~13.xml` 12분할과 동일 논리 — 단일 파일 50K URL / 50MB 한도 우회, Cloudflare Pages 25MB asset 한도 통과
  - 각 파트 파일에 `<image:image>` 네임스페이스 · priority 차등(홈 1.0 / 광역 0.95 / 시 0.9 / 블로그 0.8)
- **RSS 분할**:
  - `feed.xml` = 최신 500건 actual items + `<atom:link rel="alternate">` × 8 서비스 feed 참조 (Feedly/Yeti 표준 호환)
  - `feed-service-{toilet,sink,drain,leak,aircon,sewage,stormwater,manhole}.xml` 8개 = 서비스별 전체 item (각 1.4~6.3MB)
  - 19,404 전체 item 커버리지 유지 · 네이버 서치어드바이저에 9개 feed 개별 등록 권장
  - 각 item `<category>` 2계층(서비스타입 · 지역) + `<media:content>` 썸네일 · 해시 결정론적 pubDate
- **robots**: AI 봇 8개 차단(GPTBot, ClaudeBot, CCBot, anthropic-ai, PerplexityBot, Bytespider, Amazonbot, Diffbot) + 네이버 Yeti / Googlebot-Image / Daum / MSN Bot 명시적 Allow.
- IndexNow: Phase 4에서 키 발급, Bing/Yandex/Seznam 병행 제출.

## 9. 네이버 노출 영역 하네스 (경쟁사 미진행, 우리 기회)

네이버 통합검색 탭 체계(2025 기준):
| 탭 | 경쟁사 | 우리 전략 |
|---|---|---|
| 웹사이트(구 사이트) | ✅ 색인됨 | 동일 전략 + 구조화 데이터 우위 |
| VIEW (블로그·카페) | ❌ 미진행 | 네이버 블로그 연계 콘텐츠 + RSS로 VIEW 진입 유도 |
| 플레이스 | ❌ 미등록 | ❌ 사용 안 함 (2026-04-20 인수님 결정) |
| 이미지 | ⚠️ 15장 중복 | 4,230장 EXIF 유니크로 이미지 탭 노출 확대 |
| 동영상 | ❌ | 장기(짧은 작업 영상) |
| 지식iN | ❌ | 장기 채널 |
| 파워링크 | — | 초기엔 불필요(유기적 우선) |

## 10. 경쟁사 CTA·전환 하네스

- Hero: "📞 지금 바로 전화하기" + `☎ 010-3463-4474 (24시간 상담)`.
- 특징 카드 6개: 긴급출동 / 전문기술자 / 정직한 비용 / 최신 장비 / 안전·환경 / AS.
- 서비스 카드 3종(변기·싱크대·하수구): 증상 4종 테이블.
- 후기 8개: 구체적 수치(가격 차이·소요시간)·지역·인상적 결과.
- FloatingCTA: 하단 고정, 파란 배경, 흰 텍스트.
- Footer: "변기막힘/싱크대막힘/하수구막힘 100% 해결하는 업체".

### 우리 버전
- Hero H1 어순 재배치 + "24시간·100% 해결" 단정 표현 순화("빠른 방문, 현장 진단 후 투명 견적").
- 특징 카드 6개: 경쟁사와 순서·표현 전부 교체(**우리 브랜드 고유 가치 3개 + 지역 특화 3개**).
- 후기: 전북 14 시/군 실지역명·실사례 기반 재작성, 과장 표현 최소화.

## 11. 경쟁사가 미진입한 공간 (우리 우위 요약)

| 영역 | 경쟁사 상태 | 우리 조치 |
|---|---|---|
| 네이버 플레이스 | ❌ | ❌ 사용 안 함 (2026-04-20 결정) |
| 네이버 블로그·VIEW | ❌ | Phase 4 이후 연계 |
| JSON-LD (6종) | ❌ 1종 | ✅ 이미 6종 |
| 본문 변형(20k) | ❌ | Phase 3에서 구축 |
| 이미지 유니크 EXIF | ❌ | Phase 1에서 주입 |
| H1·H2 키워드 일치 | ❌ | 이미 구현 |
| 모바일 SEO 메타 | ⚠️ | ✅ layout.tsx에 완비 |
| 표시광고법 준수 | ❌ ("100%해결·0원") | 순화 표현 전환 |

## 12. 우리가 **하지 말아야 할** 경쟁사 전술

1. **동일 HTML을 URL만 바꿔 뿌리기** — Scaled Content Abuse, Google 알고리즘 타겟.
2. **"100% 해결·안 뚫리면 0원"** 과장 표현 — 표시광고법 위반 가능.
3. **15장 이미지 전 페이지 공유** — 네이버 이미지 탭 중복 필터.
4. **canonical을 메인으로 고정** — 서브페이지 색인 불가.
5. **동일 Title/Description 고정** — 네이버 중복 판정.

## 13. 공백 (이 하네스 분석에서 추가로 필요한 것)

- [ ] 네이버 서치어드바이저 정책 2025 최신본 재확인(Yeti 봇 요구사항 변화).
<!-- 플레이스 등록 관련 항목은 사용 안 하기로 결정 (2026-04-20). -->
- [ ] 구글 Helpful Content·Spam Update 2025-Q4 기준.
- [ ] Core Web Vitals INP 임계치 변화.
- [ ] 경쟁사 서브도메인(gangnam 등)의 상세 HTML 비교(강남 서브가 우리보다 뭐가 강한지).

위 5개 항목은 **선제 연구·제안 프로토콜** (`reactive-sleeping-eagle.md`)에 따라 Phase 2 전환 시 Claude가 먼저 공부해 대안 제안.

## 14. 참조

- 원본 메모리: `~/.claude/projects/.../memory/reference_jianhomecare_architecture.md`
- URL 패턴: `~/.claude/projects/.../memory/reference_jianhomecare_url_patterns.md`
- 상세 섹션 원문: `docs/seo-template-analysis.md`
- 전체 프로젝트 현황: `~/.claude/projects/.../memory/project_hasugu_seo_architecture.md`
