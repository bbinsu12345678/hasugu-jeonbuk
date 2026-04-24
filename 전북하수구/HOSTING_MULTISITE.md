# 호스팅 & 멀티사이트 구조 — 메인(전북) + 서브(전북 14 시/군)

> 경쟁사 jianhomecare.com 방식 그대로: 메인 도메인(`jianhomecare.com`) + **서울 25개 구별 서브도메인**(`gangnam.jianhomecare.com`·`seocho.jianhomecare.com` 등).
> 우리: 메인(`hasugu-jeonbuk.com`, 전북 전체 허브) + **전북 14 시/군별 서브**(전주·군산·익산·정읍·남원·김제·완주·고창·부안·진안·무주·장수·임실·순창).

---

## 1. 전체 구조

```
                  ┌────────────────────────────┐
                  │  메인: hasugu-jeonbuk.com  │ ← 전북 전체 허브 (본 프로젝트)
                  │  · 전북 14 시/군 19,327개   │
                  │  · 브랜드 권위 누적 지점    │
                  │  · 14개 서브 백링크 수신    │
                  └────────────┬───────────────┘
                               │ 상호 백링크 (서브→메인 필수, 메인→서브 권장)
   ┌───────┬───────┬─────┬─────┼─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
   │       │       │     │     │     │     │     │     │     │     │     │     │     │     │
 ┌─▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼─┐ ┌─▼─┐ ┌─▼─┐ ┌─▼─┐ ┌─▼─┐ ┌─▼─┐ ┌─▼─┐ ┌─▼─┐ ┌─▼─┐ ┌─▼─┐ ┌─▼─┐
 │전주│ │군산│ │익산│ │정읍│ │남원│ │김제│ │완주│ │고창│ │부안│ │진안│ │무주│ │장수│ │임실│ │순창│
 │ 시 │ │ 시 │ │ 시 │ │ 시 │ │ 시 │ │ 시 │ │ 군 │ │ 군 │ │ 군 │ │ 군 │ │ 군 │ │ 군 │ │ 군 │ │ 군 │
 └────┘ └────┘ └────┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘
    각 별도 프로젝트 · 서브도메인 · 각 시/군 전용 콘텐츠
```

**핵심 원칙**
- 메인 = 전북 **전체 랜딩 + 14 시/군 허브** (이미 `/전주시` · `/군산시` 경로로 각 시 허브 존재)
- 서브 14개 = **해당 시/군 전용** 사이트 (다른 시 콘텐츠 X, 지역 특화 후기·이미지)
- 서브 → 메인 **백링크 필수** → 메인 도메인 권위 누적
- **네이버 플레이스는 사용하지 않음** (2026-04-20 인수님 결정)

---

## 2. 메인 홈페이지 (이 프로젝트, 전북 허브)

### 2-1. 도메인
- 기본: `hasugu-jeonbuk.com`
- `www` 서브는 apex 로 리다이렉트 (Vercel 자동)

### 2-2. 정체성
- `src/config/site.ts`: `name: '전북하수구'`, `domain: 'https://hasugu-jeonbuk.com'`
- 메시지: "전라북도 14 시/군 전 지역 24시 긴급 출동"
- 역할: **전북 전체 + 각 시/군 허브 + 서브 백링크 수신**

### 2-3. 서브 백링크 수신 자리
`src/components/layout/Footer.tsx` 에 14 시/군 링크 자리 준비 (서브 오픈 시 주석 해제).

---

## 3. 서브 홈페이지 (전북 14 시/군 각각)

### 3-1. 도메인 전략 (경쟁사 방식 그대로)

| 옵션 | 구조 | 비용 | 경쟁사 사용 여부 |
|---|---|---|---|
| **A. 서브도메인** ⭐ 추천 | `jeonju.hasugu-jeonbuk.com` · `gunsan.hasugu-jeonbuk.com` | 도메인 1개만 (**₩0**) | **경쟁사 이 방식** (gangnam.jianhomecare.com) |
| B. 별도 도메인 | `hasugu-jeonju.com` · `hasugu-gunsan.com` | 14개 × 연 ₩15,000 = **₩210,000/년** | 경쟁사 위성 몇 개만 |
| C. 혼합 | 주요 시(전주·군산·익산) = 별도 도메인 + 나머지 = 서브도메인 | ₩45,000/년 | 경쟁사 방식 |

**추천 = A (서브도메인)**, 이유:
1. **경쟁사 jianhomecare.com 이 실제로 쓰는 방식** (구별 서브도메인 10개+)
2. 비용 ₩0 (메인 도메인 1개만 있으면 무제한 서브도메인)
3. DNS 관리 단순 (메인 도메인 한 곳)
4. Vercel 에서 **같은 프로젝트에 서브도메인 추가 가능** 또는 별도 프로젝트로 분리 가능

### 3-2. 서브도메인 영문 매핑 (경쟁사 방식)

| 시/군 | 서브도메인 |
|---|---|
| 전주시 | `jeonju.hasugu-jeonbuk.com` |
| 군산시 | `gunsan.hasugu-jeonbuk.com` |
| 익산시 | `iksan.hasugu-jeonbuk.com` |
| 정읍시 | `jeongeup.hasugu-jeonbuk.com` |
| 남원시 | `namwon.hasugu-jeonbuk.com` |
| 김제시 | `gimje.hasugu-jeonbuk.com` |
| 완주군 | `wanju.hasugu-jeonbuk.com` |
| 고창군 | `gochang.hasugu-jeonbuk.com` |
| 부안군 | `buan.hasugu-jeonbuk.com` |
| 진안군 | `jinan.hasugu-jeonbuk.com` |
| 무주군 | `muju.hasugu-jeonbuk.com` |
| 장수군 | `jangsu.hasugu-jeonbuk.com` |
| 임실군 | `imsil.hasugu-jeonbuk.com` |
| 순창군 | `sunchang.hasugu-jeonbuk.com` |

DNS CNAME: 각 서브도메인 → `cname.vercel-dns.com`

### 3-3. 각 서브 프로젝트 구조

**메인 프로젝트 복제 → 시/군별 커스터마이즈**
```bash
# 예: 전주시 서브 프로젝트 시작
cp -r "C:/Users/admin/Desktop/인수의 작업장/배관홈페이지/하수구막힘" \
      "C:/Users/admin/Desktop/인수의 작업장/배관홈페이지/하수구막힘-전주시"
```

**시/군별 교체 파일 (전주시 예시)**
| 파일 | 변경 |
|---|---|
| `src/config/site.ts` | `name: '전주하수구'` · `domain: 'https://jeonju.hasugu-jeonbuk.com'` · address는 전북 본사 그대로 |
| `src/data/regions.ts` | **전주시 1개만** 남김 (동 35개) — 타 시/군 삭제 |
| `src/data/blog-posts.ts` | 전주시 동 × suffix 조합만 생성 (~2,100개) |
| Hero H1 | "전주시 변기막힘 싱크대막힘 하수구막힘" |
| `public/images/og/전주시.png` | 이미 있음, 그대로 재사용 |
| Footer | 메인(`hasugu-jeonbuk.com`) + 다른 13개 시/군 서브 백링크 |
| JSON-LD `LocalBusiness.areaServed` | 전주시 35개 동만 |

**공통 유지 (건드리지 X)**
- `src/lib/*` (SEO · feed-builder · sitemap-builder 로직)
- `src/components/*` 구조
- 디자인 토큰 (`globals.css`)
- 빌드 파이프라인

### 3-4. 서브 크기
- 각 시/군 동 평균 17~35개 × 60 URL suffix ≈ **1,000~2,100 페이지**
- 파일 수 각 ~20,000 (Vercel 무제한)
- sitemap 단일 파일 충분 (분할 불필요, 10MB 이하)
- feed 는 500건 + 서비스 8개 분할 (메인과 동일 구조)

### 3-5. 서브 → 메인 백링크 (필수)

모든 서브 Footer 에:
```tsx
<section>
  <h3>더 많은 지역 보기</h3>
  <a href="https://hasugu-jeonbuk.com" rel="noopener">
    ← 전라북도 전체 (본사)
  </a>
  {/* 다른 13개 시/군 서브 상호 백링크 */}
</section>
```

Header 에도 "← 전북 전체" 링크 배치 권장.

---

## 4. Vercel 배포

### 4-1. 메인 먼저 (이 프로젝트)
```bash
! npm install -g vercel
! vercel login
! cd "C:/Users/admin/Desktop/인수의 작업장/배관홈페이지/하수구막힘"
! vercel link              # 프로젝트명: hasugu-jeonbuk
! vercel --prod
```
Vercel Dashboard → Settings → Domains → `hasugu-jeonbuk.com` 추가 → DNS 설정:
- `A` → `76.76.21.21`
- `CNAME www` → `cname.vercel-dns.com`

### 4-2. 서브 14개 (각각 별도 Vercel 프로젝트)
각 시/군 폴더에서:
```bash
! cd "C:/Users/admin/Desktop/인수의 작업장/배관홈페이지/하수구막힘-전주시"
! vercel link              # 프로젝트명: hasugu-jeonju
! vercel --prod
```
Vercel Dashboard → Domains → `jeonju.hasugu-jeonbuk.com` 추가.

**서브도메인 DNS 설정 (메인 도메인 등록업체 에서)**
- 각 서브별 `CNAME` 레코드: `jeonju` → `cname.vercel-dns.com`
- 14개 CNAME 추가 (한 번 설정하면 Vercel 자동 SSL 발급)

### 4-3. Vercel 프로젝트 총 15개 (메인 1 + 서브 14)
- Vercel Hobby 플랜: 프로젝트 무제한 (팀 기능 제외)
- 빌드 시간 45분/월 → 15개 × 30초 = 7.5분/월 여유

---

## 5. 검색엔진 등록 (도메인당)

각 도메인(메인 + 14 서브)마다 개별 등록:
- **네이버 서치어드바이저** — 소유권 확인 + sitemap.xml + feed.xml (+ 8 서비스 feed) 제출
- **구글 서치 콘솔** — 소유권 확인 + sitemap 제출
- **IndexNow** — 도메인별 신규 키 발급 → `public/{key}.txt` 배치 → Bing·Yandex·Seznam 반영
- **네이버 플레이스는 사용하지 않음** (2026-04-20 인수님 결정)

총 feed 등록 수: 15개 도메인 × 9개 feed = **135개 feed** (네이버 SA)

---

## 6. 체크리스트

### 메인 배포 (지금 즉시 가능)
- [ ] `! vercel link` · `! vercel --prod`
- [ ] 도메인 `hasugu-jeonbuk.com` 연결
- [ ] SSL 발급 확인
- [ ] 네이버 서치어드바이저 등록 + 9개 feed 제출
- [ ] 구글 서치콘솔 등록

### 서브 14개 배포 (메인 안정 후 순차)
- [ ] 각 시/군 프로젝트 복제
- [ ] `regions.ts` · `site.ts` · Hero 교체
- [ ] 빌드 확인
- [ ] `vercel link` · `--prod`
- [ ] 서브도메인 CNAME DNS 설정
- [ ] 네이버 서치어드바이저·구글 서치콘솔 개별 등록
- [ ] Footer 메인·다른 서브 백링크 확인

---

## 7. 관련 파일

### 메인 (현재 프로젝트)
- `vercel.json` — Vercel 설정
- `next.config.ts` — `output: "export"`
- `src/config/site.ts` — 메인 도메인
- `src/components/layout/Footer.tsx` — 서브 수신 자리
- `src/lib/sitemap-builder.ts` · `feed-builder.ts` — 공통 로직 (서브도 재사용)
- `docs/HARNESS_COMPETITOR.md` — 경쟁사 구조
- `docs/IMAGE_ASSETS.md` — AI 이미지 명세

### 서브 (복제 시 교체)
- `src/config/site.ts` (시/군별 도메인·이름)
- `src/data/regions.ts` (해당 시/군 1개만)
- `src/components/sections/Hero.tsx` (시/군명 반영)
- Footer 의 백링크 링크 활성화
