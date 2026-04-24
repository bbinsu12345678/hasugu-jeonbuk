# 배포 + 검색엔진 등록 가이드

> 배포부터 네이버/구글/IndexNow/플레이스 등록까지 순서대로.

## 0. 배포 전 체크리스트

- [ ] `src/config/site.ts` 실제 값 확인 (phone ✅ 010-8184-3496 설정됨, 나머지는 현재 플레이스홀더)
- [ ] `public/images/og-image.png` 존재 확인 ✅
- [ ] `public/images/blog-content/*.webp` 4,230장 존재 확인 ✅
- [ ] `npx next build` 성공 (19,327 페이지) ✅
- [ ] `out/sitemap.xml` URL 수 확인 (19,400+)
- [ ] `out/feed.xml` 존재 확인
- [ ] `out/robots.txt` AI봇 차단 + Sitemap 참조 확인

## 1. Cloudflare Pages 배포 (권장)

**이유**: 빌드 500분/월, 대역폭 무제한, 파일 20,000개 (현재 24,000+ → Pro 필요시 $5/월)

```bash
# 1) Cloudflare 계정 생성: https://dash.cloudflare.com/sign-up
# 2) API 토큰 발급 (필요 시): Account → API Tokens → Create Token (Edit Cloudflare Pages)
# 3) 프로젝트 생성
#    대시보드 → Pages → Create a project → Direct Upload
#    프로젝트명: hasugu-jeonbuk (또는 원하는 이름)

# 4) 빌드
cd "C:/Users/admin/Desktop/인수의 작업장/배관홈페이지/하수구막힘"
npx next build

# 5) 업로드 (최초)
npx wrangler pages deploy out --project-name=hasugu-jeonbuk

# 이후 배포 시
npx wrangler pages deploy out --project-name=hasugu-jeonbuk --branch=main
```

**⚠️ 파일 수 주의**: Cloudflare Pages 무료 플랜은 20,000개 파일 제한. 현재 out/ 폴더는 약 24,000개 파일 → **Pro 플랜 ($5/월) 필수** 또는 파일 수 감축.

### 대안: Netlify 배포

```bash
# 1) Netlify CLI 설치
npm install -g netlify-cli

# 2) 로그인
netlify login

# 3) 배포 (초기)
netlify deploy --dir=out --prod --site=hasugu-jeonbuk

# Netlify 한계: 빌드 100분/월, 대역폭 100GB/월 (대량 트래픽 시 부족)
```

### 커스텀 도메인 연결 (선택)

1. 도메인 구매: 가비아/후이즈 (한글 도메인 주의 - 퓨니코드 이슈)
2. Cloudflare Pages 대시보드 → Custom Domains → Add → DNS 레코드 자동 설정
3. SSL 자동 발급 대기 (5~10분)

## 2. Cloudflare 보안 설정 (필수)

### ⚠️ Bot Fight Mode 반드시 OFF

Cloudflare가 네이버 Yeti 봇을 차단할 수 있음. 검색 노출 안 되는 원인.

```
대시보드 → Security → Bots → Bot Fight Mode → OFF
대시보드 → Security → WAF → Custom Rules
  → "Allow Naver Yeti" 규칙 추가
  → 조건: User Agent contains "Yeti" or "NaverBot"
  → 동작: Skip all security
```

## 3. 네이버 서치어드바이저 등록

### 사이트 등록

1. https://searchadvisor.naver.com/ 로그인 (네이버 계정)
2. **웹마스터 도구** → **사이트 등록** → 도메인 입력
3. **소유 확인** 중 하나 선택:
   - **HTML 파일 업로드** (권장): `naver_XXXXX.html` 다운로드 → `public/` 폴더에 넣고 재배포
   - **HTML 태그**: `src/config/site.ts`의 `verification.naver`에 코드 입력 → layout.tsx가 자동 삽입

### 사이트맵/RSS 제출

1. 요청 → **사이트맵 제출** → `https://도메인/sitemap.xml` 입력
2. 요청 → **RSS 제출** → `https://도메인/feed.xml` 입력
3. 수집 요청 → 주요 URL 3~5개 수동 수집 요청 (초기 크롤링 촉진)

### 네이버 수집요청 벌크

사이트맵의 19,400개 URL을 빠르게 크롤링 요청하려면 Playwright 자동화 스크립트 필요. banana-app의 `scripts/seo/request-recrawl.js` 참조 가능 (단, 프로젝트 분리 원칙 유지 - 직접 복사 X, 로직만 참고).

## 4. 구글 서치콘솔 등록

1. https://search.google.com/search-console 로그인
2. **속성 추가** → URL 접두어 → 도메인 입력
3. **소유 확인** 중 선택:
   - HTML 태그: `site.ts`의 `verification.google` 입력 후 재배포
   - DNS 레코드: Cloudflare DNS에 TXT 레코드 추가

### 사이트맵 제출

1. 좌측 메뉴 → **Sitemaps** → `sitemap.xml` 추가
2. 자동 크롤링 시작 (초기 1~7일 소요)

### 색인 요청

1. URL 검사 도구 → 주요 URL 입력 → "색인 생성 요청"
2. 홈, 광역 허브, 시 허브 등 약 20개 URL 우선 요청

## 5. IndexNow 제출 (빙/얀덱스/세즈남)

IndexNow는 한 번의 POST 요청으로 여러 검색엔진에 동시 제출.

### 키 발급

```bash
# 랜덤 키 생성 (예시)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
# 결과: abc123def456... (32자리)
```

### public/ 폴더에 키 파일 저장

```bash
# public/{key}.txt 파일 생성 (내용: 키 값 동일)
echo "abc123def456..." > public/abc123def456.txt
```

### API 호출 스크립트

```javascript
// scripts/indexnow-submit.js
const urls = require('fs')
  .readFileSync('out/sitemap.xml', 'utf-8')
  .match(/<loc>([^<]+)<\/loc>/g)
  .map(m => m.replace(/<\/?loc>/g, ''));

// 한 번에 최대 10,000개 URL
const chunks = [];
for (let i = 0; i < urls.length; i += 10000) {
  chunks.push(urls.slice(i, i + 10000));
}

for (const chunk of chunks) {
  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: '도메인',
      key: 'abc123def456...',
      keyLocation: 'https://도메인/abc123def456.txt',
      urlList: chunk,
    }),
  });
}
```

## 6. 네이버 플레이스 등록 (경쟁사 공백 영역)

**경쟁사 jianhomecare.com 분석 결과**: 네이버 플레이스 미등록 → **여기가 가장 큰 기회**.

### 사업자 등록 필요

1. https://smartplace.naver.com 접속
2. **플레이스 등록 신청** → 사업자등록증 업로드 (오다희/139-04-76709)
3. 승인 대기 (1~3일)

### 플레이스 최적화 (승인 후)

1. **상호명에 지역+키워드**: "전주 하수구막힘 24시 배관"
2. **키워드 태그 5개** (최대):
   - 변기막힘, 싱크대막힘, 하수구막힘, 24시배관, 하수구고압세척
3. **상세설명 2,000자** 꽉 채우기 (서비스 지역/서비스 종류/가격/후기)
4. **사진 업로드** (정기적으로): 작업 사진 `public/images/workimages/` 원본 활용
5. **영업시간**: 24시간 운영 표시
6. **전화번호**: 010-8184-3496

### 2026 네이버 플레이스 핵심 알고리즘

**리뷰 수가 아닌 실제 유저 행동 데이터**가 순위 결정:
- 검색 → 클릭률
- 지도 보기 빈도
- 전화 연결 횟수
- 페이지 체류 시간
- 재방문 패턴

→ **자연스러운 유입 설계 + 실제 고객 리뷰**가 핵심.

## 7. 네이버 블로그 (경쟁사 공백)

**경쟁사 분석**: jianhomecare.com 네이버 블로그 미운영.

### 전략

1. 네이버 블로그 개설 (기존 네이버 계정 활용)
2. 주 1~2회 포스팅:
   - 실제 작업 후기 (전북 특정 지역)
   - 예방 팁
   - 비용 안내
   - 계절별 이슈 (겨울 동파/여름 악취)
3. 홈페이지로 자연스러운 백링크
4. 네이버 검색 결과 "VIEW" 영역 추가 노출

## 8. 배포 후 모니터링 체크리스트

- [ ] `https://도메인/` 홈 로딩 정상
- [ ] `https://도메인/sitemap.xml` 19,400+ URL 확인
- [ ] `https://도메인/feed.xml` RSS 정상
- [ ] `https://도메인/robots.txt` AI봇 차단 확인
- [ ] 샘플 블로그 포스트 3~5개 랜덤 접속 정상
- [ ] 모바일 렌더링 확인 (Chrome DevTools 반응형)
- [ ] Lighthouse 성능 점수 확인 (목표: 90+)
- [ ] 네이버 웹마스터 → 사이트 등록 확인
- [ ] 구글 서치콘솔 → 사이트 등록 확인
- [ ] IndexNow 제출 확인 (응답 200 OK)
- [ ] 네이버 플레이스 승인 요청 (사업자등록증 필요)

## 9. 예상 일정 (실배포 기준)

| 단계 | 소요 시간 |
|------|:---:|
| site.ts 값 채우기 + 재빌드 | 10분 |
| Cloudflare Pages 배포 | 20분 (최초) |
| 커스텀 도메인 연결 | 30분 |
| 네이버 서치어드바이저 등록 | 1일 (승인) |
| 구글 서치콘솔 등록 | 즉시 |
| IndexNow 제출 | 5분 |
| 네이버 플레이스 등록 | 1~3일 (승인) |
| 첫 검색 노출 (네이버) | 1~4주 |
| 첫 검색 노출 (구글) | 3~7일 |
| 안정적 상위 노출 | 1~3개월 |
