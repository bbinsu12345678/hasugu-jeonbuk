# Design System — 전북하수구 (하수구막힘)

> 하이브리드 디자인 방향: **bluepipe 신뢰 구조 + 2025 트렌드 디테일**. 로컬 배관 서비스의 진정성을 유지하면서 검색 결과에서 시각적으로 차별화.

## Product Context
- **What this is:** 전북 14 시/군 · 251 동 · 8 서비스 배관 서비스 랜딩(19,327 정적 페이지)
- **Who it's for:** 전북 거주 30~60대, 변기·싱크대·하수구 막힘 긴급 대응 필요
- **Space/industry:** 로컬 배관 서비스 (네이버 검색·플레이스 중심)
- **Project type:** 마케팅 사이트 + 대규모 지역 랜딩(SEO)
- **Primary conversion:** 전화(`tel:010-8184-3496`) — 나머지(카카오·이메일)는 보조

## Aesthetic Direction
- **Direction:** Clean Trust + Bold Confidence
- **Decoration level:** intentional (과하지 X, 포인트만)
- **Mood:** 출장비 무료·24시 긴급·전문가가 먼저 신뢰감. 그 위에 2025 typography·motion 이 얹혀 "이 업체 최신이다" 첫인상.
- **Reference:**
  - 구조·CTA 반복 배치: bluepipe.co.kr (관찰만, 문구·이미지 차용 X)
  - 2025 트렌드: bold hero display · glassmorphism card · soft gradient mesh · micro-interaction

## Typography
- **Display/Hero:** `Pretendard Variable` (한글 native · weight 800) — bluepipe의 기본 sans를 넘어, 한글 정렬 최적 + 2025 variable font 트렌드
- **Body:** `Pretendard` (weight 400/500) — 긴 블로그 본문 가독성
- **UI/Labels:** `Pretendard` (weight 600)
- **Data/Numbers:** `Geist Mono` (tabular-nums) — 전화번호·가격·시간 정렬
- **Loading:** CDN `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css`
- **Scale (mobile → desktop)**:
  - Hero: 44/52/64px (font-weight 800)
  - H1: 32/36/40px (700)
  - H2: 24/26/28px (700)
  - H3: 18/20/22px (600)
  - Body: 16/17px (400)
  - Small: 13/14px (400)
- **Line-height:** hero 1.1, h1 1.2, body 1.7 (한글 optimal), data 1.4

## Color
- **Approach:** balanced + semantic (네이비·오렌지 브랜드 유지, saturation 낮춰 중후)
- **Palette:**
  - `--color-primary` Navy `#1B3B5F` (신뢰 · 헤더 · primary text)
  - `--color-primary-deep` `#0F2340` (hero background · footer)
  - `--color-primary-soft` `#E8EFF7` (섹션 divider · card background)
  - `--color-accent` Orange `#F59E42` (CTA · 강조 · hover)
  - `--color-accent-deep` `#D17A1F` (CTA hover state)
  - `--color-accent-soft` `#FFF4E6` (강조 배경)
  - `--color-bg` `#FAFAF7` (page background, warm off-white)
  - `--color-surface` `#FFFFFF` (card · input)
  - `--color-border` `#E8E5DF` (hairline)
  - `--color-text` `#2A2824` (본문)
  - `--color-text-muted` `#6B6560` (보조 · caption)
  - Semantic: success `#2F9E6D` · warning `#D48808` · error `#C84A3F` · info `#3B7FB5`
- **Dark mode:** Phase 3 이후 — 현재는 light only (로컬 서비스 고객층 light 선호)

## Spacing
- **Base:** 8px
- **Density:** comfortable (모바일 밀도↑, 데스크톱 넉넉)
- **Scale:**
  - `--space-2xs` 4px
  - `--space-xs` 8px
  - `--space-sm` 12px
  - `--space-md` 16px
  - `--space-lg` 24px
  - `--space-xl` 32px
  - `--space-2xl` 48px
  - `--space-3xl` 72px
  - `--space-4xl` 112px

## Layout
- **Approach:** hybrid (정보 블록은 grid-disciplined 12-col, hero는 editorial asymmetric)
- **Grid:** mobile 1col · tablet 2col · desktop 3col (최대 4col for 동 그리드)
- **Max content width:** 1200px (hero 까지) · 1024px (본문 섹션)
- **Border radius hierarchy:**
  - `--radius-sm` 6px (input · badge)
  - `--radius-md` 12px (card · button)
  - `--radius-lg` 20px (feature card · hero CTA)
  - `--radius-full` 9999px (pill · avatar)
- **Shadow:**
  - `--shadow-sm` `0 1px 3px rgba(15,35,64,0.06)`
  - `--shadow-md` `0 4px 16px rgba(15,35,64,0.08)`
  - `--shadow-lg` `0 12px 32px rgba(15,35,64,0.12)`
  - `--shadow-glass` `0 8px 32px rgba(27,59,95,0.12), inset 0 1px 0 rgba(255,255,255,0.4)` (glassmorphism)

## Motion
- **Approach:** intentional (micro-interaction, 과하지 X)
- **Easing:**
  - Enter `cubic-bezier(0.2, 0, 0, 1)` (ease-out-quart)
  - Exit `cubic-bezier(0.4, 0, 1, 1)` (ease-in)
  - Move `cubic-bezier(0.4, 0, 0.2, 1)` (material)
- **Duration:**
  - micro 120ms (hover · active)
  - short 200ms (button · card lift)
  - medium 400ms (scroll reveal)
  - long 600ms (hero entrance)
- **Patterns:**
  - Card hover: `translateY(-4px)` + shadow-md→shadow-lg, 200ms ease-out
  - CTA pulse: 전화 버튼 미세 scale `1.0→1.03→1.0` loop 1.5s (주목도, 모바일 FloatingCTA 전용)
  - Scroll reveal: `y: 20→0, opacity: 0→1`, 400ms ease-out (IntersectionObserver)
  - 페이지 전환: none (static export)
- **Reduce motion:** `@media (prefers-reduced-motion: reduce)` 시 모든 transform·pulse 제거, opacity 만 유지

## Components (적용 원칙)
- **Hero:** editorial asymmetric, bold display(64px 데스크톱), soft gradient mesh 배경(orange→transparent), 우측 하단 CTA. 반복 CTA는 중간·하단 섹션에도 배치.
- **ServiceCards:** 3-col grid, glassmorphism card(frosted blur `backdrop-filter`), aspect-[3/2] 이미지 상단, hover lift
- **BlogGrid:** 3-col (모바일 1col), aspect-[3/2] 이미지, 카드 hover lift, 제목 2줄 line-clamp
- **FAQ:** accordion, chevron 회전 200ms
- **FloatingCTA (모바일 하단 고정):** 오렌지 + CTA pulse, `role="button"` 접근성
- **Footer:** 네이비 background, 3-col info, 사업자번호·대표명·주소 법적 신뢰 확보

## Anti-Slop 준수
- ❌ Purple/violet gradient
- ❌ 3-column icon circle grid (centered 아이콘 원형 X)
- ❌ Centered everything + uniform border-radius (hierarchical 유지)
- ❌ 가짜 stock photo hero
- ❌ "Built for X · Designed for Y" 마케팅 copy
- ✅ Editorial asymmetric hero
- ✅ Hierarchical radius (card 12 / button 12 / input 6 / pill full)
- ✅ Brand 오렌지 CTA (not rainbow gradient)

## Accessibility
- Contrast WCAG AA 이상 (배경 bg vs text-muted 4.5:1 이상)
- Focus visible: 2px solid `--color-accent` + 2px offset
- Tap target ≥ 44×44px (모바일)
- `prefers-reduced-motion` respect
- `aria-label` 전화·카카오 CTA 버튼
- 한글 screen reader 테스트 (네이버 Yeti·NVDA 스크린리더 호환)

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-20 | Hybrid direction (bluepipe trust + 2025 trends) | 사용자 명시 · bluepipe는 2015~2018 스타일이라 트렌드 약함 → 구조만 차용 |
| 2026-04-20 | Pretendard Variable display font | 한글 native · Inter 같은 overused 영문 금지 · 2025 variable font |
| 2026-04-20 | Navy + Orange 유지 | 이미 브랜드 identity 로 정착 · saturation 낮춰 2025 감성 |
| 2026-04-20 | Light only (dark mode Phase 3 이후) | 로컬 서비스 고객 30~60대 light mode 선호 |
