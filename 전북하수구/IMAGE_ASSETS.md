# AI 이미지 에셋 명세 — 전북하수구

> Midjourney·Flux·DALL-E 3·Ideogram 등 AI 이미지 도구에 바로 붙여넣을 수 있는 **상세 프롬프트 모음**. 우선순위·저장 경로·비율·해상도·스타일 가이드 포함.

## 공통 브랜드 가이드 (모든 이미지에 적용)

**브랜드 컬러 (프롬프트에 반드시 언급)**
- Primary Navy: `#1B3B5F` (deep navy blue, muted, trustworthy)
- Primary Deep: `#0F2340` (midnight navy, backgrounds)
- Accent Orange: `#F59E42` (warm orange, soft amber, not neon)
- Warm off-white: `#FAFAF7` (papery, not pure white)

**톤 & 무드**
- Professional · clean · trustworthy · local (Korean) · modern 2025
- Natural sunlight or soft studio lighting (NOT harsh flash)
- Slight film grain OK (2025 trend), but no heavy texture
- Composition: rule of thirds, negative space, editorial framing

**Negative (공통 — 모든 프롬프트에 추가)**
```
no text overlays, no watermarks, no phone numbers, no logos in frame,
no purple gradients, no rainbow colors, no oversaturated colors,
no AI-generated text glitches, no distorted hands/fingers,
no extra limbs, no uncanny faces, no low-quality jpeg artifacts,
no stock-photo cheesiness, no cliché "thumbs up" poses,
no heavy HDR, no cartoon style unless specified, no anime
```

**AI 도구별 추천 flag**
- **Midjourney v6.1**: `--ar <W:H> --style raw --v 6.1 --stylize 100 --quality 2`
- **Flux Pro 1.1**: 자연어 문단형, seed 고정 권장 (시리즈는 같은 seed + 프롬프트 일부 변경)
- **DALL·E 3**: 자연어 문장형, 한글 가능하지만 영문 + 끝에 "photorealistic, high detail" 추가
- **Ideogram 2.0**: 텍스트 렌더링 강점 (우리는 텍스트 금지라 굳이 X)

---

## 🔴 P0 — 즉시 필요 (배포 전 필수)

### 1. Favicon — 전북하수구 브랜드 마크

- **파일**: `src/app/icon.png` (Next.js 16 자동 인식) + `src/app/favicon.ico`
- **크기**: 512×512 (단일 SVG/PNG, 브라우저가 자동 다운스케일)
- **비율**: 1:1 정사각

**Prompt (영문 + 한글 병기)**
```
A minimalist flat vector brand mark logo icon, 512x512, square composition,
deep navy background (#0F2340 solid fill, no gradient),
featuring a stylized bold Korean hangul letter "전" in warm amber orange (#F59E42),
with a subtle pipe/drain arc motif integrated into the stroke,
geometric precision, high contrast, sharp clean edges,
designed for mobile browser tab and home screen use,
flat 2D vector style, no 3D, no shadows, no gradients,
modern Korean local service brand identity, trustworthy and professional.
```

**한글 설명**: 모바일 탭·홈스크린에서 한눈에 보이는 심플한 벡터 아이콘. 네이비 배경 + 오렌지 한글 "전" + 파이프 곡선 미세 통합. 그림자·그라데이션 X (작은 크기에서 뭉게짐).

**Midjourney**: `--ar 1:1 --style raw --v 6.1 --stylize 50 --quality 2`

---

### 2. Apple Touch Icon — iOS 홈스크린 아이콘

- **파일**: `public/apple-touch-icon.png`
- **크기**: 180×180
- **비율**: 1:1 정사각 (iOS가 자동 rounded corner 처리)

**Prompt**
```
Same brand mark as favicon (Korean "전" in amber orange on deep navy square),
but with a slightly larger safe zone — subject occupies center 70% only,
so the iOS automatic rounded corner doesn't clip it.
Solid deep navy background #0F2340, no texture.
Flat 2D vector, crisp edges, suitable for 180x180 display.
```

**한글 설명**: Favicon과 동일한 마크, 단 **중앙 70% 안전 영역**에 배치 (iOS가 모서리 둥글게 깎으므로).

---

### 3. 헤더 로고 — "전북하수구" 워드마크

- **파일**: `public/images/logo.svg` (우선) + `logo.png` (fallback)
- **크기**: 200×48 (가로형 워드마크)
- **비율**: ~4:1 (가로 넓음)

**Prompt**
```
A horizontal Korean brand wordmark "전북하수구", 
designed in a modern Korean typography style reminiscent of Pretendard Bold,
weight extra bold (800), tight letter spacing, slight custom kerning,
left-aligned with a small icon on the left — a minimalist water drop
or pipe segment in amber orange (#F59E42),
the word "전북하수구" in deep navy (#1B3B5F),
transparent background SVG,
total dimensions 200x48 with subject centered vertically,
clean vector, no gradients, no strokes, solid fills only,
professional local service brand, modern and legible.
```

**한글 설명**: Pretendard Bold 느낌의 한글 워드마크. 좌측에 물방울·파이프 심볼(오렌지) + "전북하수구"(네이비). 투명 배경 SVG가 가장 이상적.

**Tip**: AI가 한글 렌더링 어려우면 **일러스트레이터에서 Pretendard Bold 로 타이핑 + 심볼만 AI 생성** 조합 추천.

---

### 4. 푸터·다크 배경용 로고 (화이트 버전)

- **파일**: `public/images/logo-white.svg` (우선) + `logo-white.png`
- **크기**: 200×48
- **비율**: ~4:1

**Prompt**
```
Same horizontal wordmark as logo.svg (전북하수구 + drop/pipe symbol),
but ALL elements rendered in pure white #FFFFFF,
transparent background, no gradients,
intended for use on deep navy backgrounds (footer, hero overlay).
Vector SVG, crisp and legible at small sizes.
```

**한글 설명**: 로고 화이트 단색 버전. 푸터(네이비) + hero 배경 위에 사용.

---

### 5. Hero 메인 이미지 — 실제 작업 장면

- **파일**: `public/images/main_bg.webp` (기존 PNG 덮어쓰기)
- **크기**: 1200×1500
- **비율**: 4:5 (세로형 — hero 우측 컬럼용)

**Prompt (Midjourney/Flux)**
```
A professional Korean plumber in his mid 30s, wearing a clean deep navy blue
uniform shirt (no logos, no text), working on a kitchen sink drain pipe
inside a modern Korean apartment kitchen,
holding a specialized drain cleaning tool (brass auger or pipe wrench),
natural warm afternoon sunlight pouring through a side window,
shallow depth of field, 50mm lens, portrait orientation,
subject framed three-quarter body from waist up, turned slightly away from camera
focused on the work, confident and calm expression,
background softly blurred showing modern Korean kitchen cabinets in warm off-white,
subtle amber orange tone in the lighting to match brand palette,
photorealistic, cinematic composition, editorial quality,
4:5 vertical aspect ratio, high detail, 2400 resolution,
color grading: muted navy shadows, warm amber highlights,
mood: trustworthy, expert, approachable, modern 2025.
```

**한글 설명**: 한국 30대 배관 전문가 실제 작업 장면. 싱크대 작업, 네이비 유니폼, 측광 자연광, 전문성·신뢰감. 얼굴 정면 X (AI 얼굴 왜곡 방지), 3/4 각도.

**Midjourney flag**: `--ar 4:5 --style raw --v 6.1 --stylize 150 --quality 2`

**대안 A (사람 없는 버전 — 얼굴 왜곡 리스크 완전 회피)**:
```
A close-up product hero shot of modern plumbing tools arranged on a
warm off-white wooden workbench in soft afternoon sunlight.
Brass pipe wrench, copper drain auger, gleaming chrome fittings,
artfully composed with negative space.
Deep navy folded work cloth in the background adds color depth.
A single amber orange accent — perhaps a tool handle grip or a rubber seal.
Overhead 45-degree angle, shallow depth of field, 50mm macro lens,
editorial product photography style, cinematic natural lighting,
4:5 vertical composition, photorealistic, high detail.
```

---

### 6. Open Graph 기본 (이미 생성됨 — 업그레이드 원할 시)

- **파일**: `public/images/og-image.png` (14 city + 8 service + 1 jeonbuk 이미 존재)
- **크기**: 1200×630
- **비율**: 1.91:1

**현재**: Python Pillow로 자동 생성 (gradient + 도시명 오버레이). 유지 권장.

---

## 🟡 P1 — 디자인 완성도

### 7~14. 서비스 카드 이미지 (8장)

각 서비스별 1장, 총 8장. 스타일 **완전 통일** 필요 (시드 고정·같은 lens·같은 lighting).

- **저장 경로**: `public/images/service-{slug}.webp`
- **크기**: 1200×800
- **비율**: 3:2 가로

#### 7. `service-toilet.webp` (변기막힘)
```
Close-up photorealistic shot of a modern white toilet in a clean Korean
bathroom, viewed from above at a 30-degree downward angle,
warm natural sunlight from the right,
a professional plumber's blue-gloved hand entering the frame from the right
holding a stainless steel drain snake tool,
background: soft-focus tiled bathroom wall in warm off-white,
subtle amber orange accent on a nearby towel,
editorial product photography, shallow depth of field,
clean professional atmosphere, trustworthy and modern,
3:2 horizontal composition, photorealistic, high detail, no text.
```

#### 8. `service-sink.webp` (싱크대막힘)
```
Close-up of a modern Korean stainless steel kitchen sink drain,
water just starting to drain after being unclogged,
a professional plumber's hand with blue glove reaching toward the p-trap below,
warm afternoon kitchen light, marble-style countertop,
navy blue tool bag visible in the bottom-left corner,
amber orange dish soap bottle adds brand color accent in background,
shallow depth of field, overhead angle slightly tilted,
editorial clean photography, 3:2, photorealistic, warm tones.
```

#### 9. `service-drain.webp` (하수구막힘 / 외부 배수구)
```
Close-up of a Korean apartment complex outdoor drain cover (manhole-style)
being lifted by a professional plumber in navy uniform,
deep navy work pants and clean navy gloves visible,
amber orange safety cone blurred in background,
warm golden hour sunlight, slight grain texture,
ground-level angle, subject takes center frame,
editorial documentary style, photorealistic,
3:2 horizontal, high detail.
```

#### 10. `service-leak.webp` (누수탐지)
```
A professional Korean plumber's hands holding a modern electronic leak
detection device with digital display, pointed at a wall,
the wall has a subtle water stain indicating moisture,
navy-gloved hands, precise focused composition,
cool natural window light balanced with warm room ambiance,
amber orange LED indicator on the device,
shallow depth of field, macro lens angle,
editorial tech-forward photography, 3:2, photorealistic.
```

#### 11. `service-aircon.webp` (에어컨 배관 청소)
```
A wall-mounted white Korean air conditioner unit with its drain hose
being cleaned by a plumber using a specialized thin brush tool,
side-angle composition, modern Korean living room background softly blurred,
deep navy tool case visible on the floor,
warm afternoon light, amber orange brand accent on the tool handle,
editorial clean photography, 3:2, photorealistic, high detail.
```

#### 12. `service-sewage.webp` (오수관막힘)
```
A plumber operating a powerful hydro-jetting machine at a Korean
residential outdoor sewage pipe access point,
water stream visible just as it enters the pipe (frozen motion),
navy uniform, safety orange helmet visible in frame,
dusk or early morning soft light, cinematic tone,
editorial documentary, slight motion blur on water only,
3:2 horizontal, photorealistic, modern professional tone.
```

#### 13. `service-stormwater.webp` (우수관막힘)
```
Korean apartment rooftop stormwater drain grate being inspected
by a plumber kneeling with a flashlight, leaves and debris partially
visible being cleared away, overcast soft sky light,
navy uniform, amber orange flashlight beam provides warm accent,
top-down composition with subject off-center (rule of thirds),
editorial documentary photography, 3:2, photorealistic.
```

#### 14. `service-manhole.webp` (맨홀청소)
```
Close-up of a Korean residential manhole cover being opened with a
specialized hook tool by a professional plumber in navy uniform,
safety barrier tape in amber orange softly visible in background,
dusk warm lighting, ground-level dramatic angle,
editorial documentary tone, shadow detail retained,
3:2 horizontal, photorealistic, high detail, trustworthy mood.
```

**Midjourney flag (서비스 8장 공통)**: `--ar 3:2 --style raw --v 6.1 --stylize 120 --quality 2 --seed <FIX>`

---

### 15~21. 고객 아바타 (7장)

- **저장 경로**: `public/images/avatar-{1~7}.webp`
- **크기**: 200×200 (display 96×96 이하로 줄어드는데 retina 대응)
- **비율**: 1:1 정사각

**다양성 가이드** (7장 전체로 커버):
- avatar-1: 여성 30대, 짧은 머리, 밝은 베이지 톱
- avatar-2: 남성 40대, 안경, 네이비 셔츠
- avatar-3: 여성 50대, 중단발, 파스텔 카디건
- avatar-4: 남성 30대, 캐주얼 화이트 티, 미소
- avatar-5: 여성 60대, 단정한 블라우스, 자연스러운 표정
- avatar-6: 남성 50대, 흰머리 섞임, 부드러운 인상
- avatar-7: 여성 40대, 단발, 네이비 카디건

**공통 Prompt**
```
Portrait photograph of a {AGE}-year-old Korean {GENDER}, 
{CLOTHING description},
shoulder-up headshot, warm natural window light from the left,
soft gradient background in warm off-white (#FAFAF7),
genuine warm approachable expression (NOT "stock photo thumbs up"),
slight smile, looking slightly off-camera,
50mm portrait lens, shallow depth of field,
editorial natural portraiture style, photorealistic,
1:1 square composition, subject centered vertically,
modern Korean aesthetic, trustworthy and relatable.
```

**주의**: 스탁 사진처럼 과장된 미소·엄지척 금지. 자연스러운 일상 표정.

**Midjourney flag**: `--ar 1:1 --style raw --v 6.1 --stylize 100 --quality 2`

---

### 22. 전북 서비스 지역 맵

- **저장 경로**: `public/images/area-main.webp`
- **크기**: 1200×1500
- **비율**: 4:5 (세로)

**Prompt**
```
A minimalist flat vector illustration of Jeollabuk-do (North Jeolla) province
in South Korea, showing 14 city/county boundaries softly outlined,
each region highlighted with a small solid dot marker in amber orange (#F59E42),
connected by thin curved navy (#1B3B5F) lines suggesting service coverage network,
the 14 regions labeled in small Korean characters:
전주시, 군산시, 익산시, 정읍시, 남원시, 김제시,
완주군, 고창군, 부안군, 진안군, 무주군, 장수군, 임실군, 순창군,
background warm off-white #FAFAF7,
subtle navy gradient at the bottom edge,
4:5 vertical composition, editorial infographic style,
flat 2D vector, no 3D, no shadows, minimalist Korean aesthetic.
```

**한글 설명**: 전북 14시군 지도 일러스트. 오렌지 점(지역) + 네이비 선(서비스망). 한글 지역명 작게 표시.

**팁**: AI 한글 렌더링 약하면 **맵 프레임만 AI + 지역명 Figma/PS로 오버레이** 조합.

---

### 23. 전북 서비스 지역 서브 이미지

- **저장 경로**: `public/images/area-sub.webp`
- **크기**: 1200×1500
- **비율**: 4:5

**Prompt**
```
A warm, cinematic overhead drone shot of a Korean small city neighborhood
(resembling Jeonju hanok village area or modern Jeonju residential district),
soft morning light, autumn warm palette,
traditional and modern Korean rooftops mixed, narrow streets,
slight haze for depth, muted navy and amber orange color grading,
editorial travel photography style,
4:5 vertical composition, photorealistic, high detail,
mood: peaceful, local, trustworthy, home.
```

**한글 설명**: 전주 한옥마을 느낌 또는 현대 주택가 드론 샷. 지역성·따뜻함.

---

## 🟢 P2 — SEO·변별 (여유 시)

### 24. 블로그 본문 이미지 풀 (200~500장)

현재 `thumbnails/*.webp` 4,230장에 구 전화번호 overlay가 박혀있음. 페이지별 유니크성을 위해 **새 풀 200~500장 + 해시 기반 배포** 필요.

- **저장 경로**: `public/images/blog/blog-001.webp` ~ `blog-500.webp`
- **크기**: 1200×800
- **비율**: 3:2 가로
- **수량**: 200장(최소) · 500장(권장)

**Prompt 템플릿 10종 (각 20~50장씩 변형 seed로 생성)**

#### A. 배관 작업 현장 (50장)
```
Photorealistic documentary photograph of Korean plumbers at various work
scenarios — fixing toilet, unclogging sink, inspecting drain, using tools,
different angles and compositions every time, different lighting conditions
(morning, afternoon, evening, indoor overhead),
natural authentic moments (not posed),
navy uniforms, clean professional atmosphere,
3:2 horizontal, editorial documentary style,
no text overlays, no logos, no phone numbers, photorealistic, high detail.
--seed {RANDOM_PER_IMAGE}
```

#### B. 배관 도구·장비 클로즈업 (50장)
```
Close-up macro photography of various plumbing tools and equipment —
brass wrenches, copper fittings, drain snakes, hydro-jet nozzles, 
pipe cutters, pressure gauges, leak detectors,
artfully composed on dark navy or warm wood surfaces,
editorial product photography, cinematic natural lighting,
amber orange and navy color palette,
3:2 horizontal, shallow depth of field, photorealistic, high detail.
--seed {RANDOM}
```

#### C. 한국 가정 배관 공간 (50장)
```
Photorealistic interior shot of Korean apartment bathroom/kitchen/balcony
plumbing areas — sink drains, toilet bases, washing machine connections,
floor drains, wall-mounted pipes visible,
clean modern Korean aesthetic, warm afternoon sunlight,
muted navy and warm off-white tones with subtle amber accents,
3:2 horizontal, editorial architectural photography,
no people, photorealistic, high detail.
--seed {RANDOM}
```

#### D. 배관 문제 시각화 (40장)
```
Editorial photograph showing common plumbing issues —
water slowly draining in sink, clogged toilet water level,
leaking pipe with water drop frozen in motion,
floor drain with debris, water stain on wall indicating leak,
cinematic natural lighting, slightly dramatic but not alarming,
3:2 horizontal, photorealistic, documentary style,
no text, warm tones.
--seed {RANDOM}
```

#### E. 고압세척·세정 작업 (30장)
```
Dynamic photograph of high-pressure water jetting equipment in action,
water stream captured mid-motion, safety gear visible,
outdoor drain access points, industrial cleaning context,
dramatic warm lighting, slight motion blur on water,
navy uniforms, amber safety elements,
3:2 horizontal, editorial action photography, photorealistic.
--seed {RANDOM}
```

**Batch 생성 팁**:
- Midjourney `/imagine` 10~20장 batch 후 `--repeat 5` 로 변형
- Flux Pro API 스크립트: seed 1000~1500 범위 순회
- 완성 후 `scripts/inject-exif.py` 로 EXIF 유니크 주입 (기존 파이프라인 재사용)

---

## 📋 Summary Table (요약)

| # | Priority | File | Path | Size | Aspect | Count |
|---|---|---|---|---|---|---|
| 1 | P0 | `icon.png` / `favicon.ico` | `src/app/` | 512² | 1:1 | 1 |
| 2 | P0 | `apple-touch-icon.png` | `public/` | 180² | 1:1 | 1 |
| 3 | P0 | `logo.svg` | `public/images/` | 200×48 | ~4:1 | 1 |
| 4 | P0 | `logo-white.svg` | `public/images/` | 200×48 | ~4:1 | 1 |
| 5 | P0 | `main_bg.webp` (Hero) | `public/images/` | 1200×1500 | 4:5 | 1 |
| 7~14 | P1 | `service-{8종}.webp` | `public/images/` | 1200×800 | 3:2 | 8 |
| 15~21 | P1 | `avatar-{1~7}.webp` | `public/images/` | 200² | 1:1 | 7 |
| 22 | P1 | `area-main.webp` | `public/images/` | 1200×1500 | 4:5 | 1 |
| 23 | P1 | `area-sub.webp` | `public/images/` | 1200×1500 | 4:5 | 1 |
| 24 | P2 | `blog/blog-{001~500}.webp` | `public/images/blog/` | 1200×800 | 3:2 | 200~500 |

**P0 완료 = 13장** · **P1 완료 = +18장** · **P2 완료 = +200~500장**

---

## ⚙️ 전달 방법

1. AI 도구에서 위 프롬프트 그대로 복사 → 생성
2. 파일명·경로 위 표 그대로 저장 (WebP 권장, 없으면 JPG/PNG → 빌드 시 자동 변환)
3. 저장 후 `npm run dev` 또는 `npx next build` → out/ 반영
4. 블로그 본문 이미지 풀(P2) 업로드 후 `python scripts/inject-exif.py` 재실행

## 🚨 주의

- ✅ 모든 프롬프트에서 `no text overlays, no logos, no phone numbers` 네거티브 포함
- ✅ 얼굴 생성은 "3/4 각도" 또는 "측면" 권장 (AI 얼굴 왜곡 회피)
- ✅ 같은 시리즈(service 8장, avatar 7장)는 **같은 seed + 같은 lighting** 통일
- ❌ Stock photo 스타일 엄지척·과장된 미소 금지
- ❌ 원본 파일명에 경쟁사 흔적 절대 금지 (`jianhomecare`·`bluepipe` 등)
- ❌ 사진에 텍스트 overlay 절대 금지 (배포된 HTML에서 번호가 바뀌면 이미지 전부 재생성해야 함 — 이번 세션에서 겪은 문제)
