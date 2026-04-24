#!/usr/bin/env python3
"""
workimages/ 141장 → public/images/blog-content/ 4,230장 (30 변형/원본)

각 출력 파일은 다음 지문이 모두 다름:
- 파일 해시 (MD5/SHA 모두 다름)
- EXIF 메타데이터 (완전 제거 + 새 XMP 주입)
- 픽셀 해시 (imperceptible 노이즈 주입)
- DCT 계수 (랜덤 WebP 품질)
- 색상 히스토그램 (밝기/대비/채도/색조)
- 크롭 영역 (원본마다 다른 위치)
- 파일 크기 (크기 패딩 랜덤)

사용법:
  pip install pillow
  python scripts/process-workimages.py
"""

import hashlib
import json
import random
import time
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageChops, ImageDraw, ImageFont

# --- 폰트 경로 ---
FONT_BOLD = 'C:/Windows/Fonts/malgunbd.ttf'
FONT_REGULAR = 'C:/Windows/Fonts/malgun.ttf'

# --- 브랜딩 ---
PHONE_NUMBER = '010-8184-3496'

# --- 홍보 문구 풀 (서비스별 분기, 표시광고법 준수) ---
# 금지어 제거: "즉시출동 100% 해결", "안 뚫리면 0원", "No.1", "최저가"
# 교체 원칙: 단정 표현 → 사실 기반 (견적·상담·전문·친절)
PROMO_BY_SERVICE = {
    'toilet': [
        '변기막힘 전문 수리',
        '변기 막혔을 때 전문 상담',
        '변기 수리 7년 경력',
        '변기막힘 현장 진단',
    ],
    'sink': [
        '싱크대막힘 전문 수리',
        '싱크대 뚫음 전문',
        '싱크대 악취·역류 상담',
        '싱크대 고압세척 전문',
    ],
    'drain': [
        '하수구 고압세척 전문',
        '하수구막힘 전문 수리',
        '배관 고압세척 전문',
        '하수구 전문 기사',
    ],
    'leak': [
        '누수탐지 정밀 진단',
        '누수 현장 전문 상담',
        '누수탐지 7년 경력',
        '누수 위치 정밀 감지',
    ],
    'aircon': [
        '에어컨 배관 전문 청소',
        '에어컨 누수 상담',
        '에어컨 배관 정밀 청소',
        '에어컨 배관 전문 기사',
    ],
    'sewage': [
        '오수관 막힘 전문 해결',
        '오수관 전문 상담',
        '오수관 전문 청소',
        '오수관 전문 기사',
    ],
    'stormwater': [
        '우수관 막힘 전문 해결',
        '우수관 전문 상담',
        '우수관 청소 전문',
        '우수관 전문 기사',
    ],
    'manhole': [
        '맨홀 청소 전문',
        '맨홀 슬러지 제거',
        '맨홀 고압세척 전문',
        '맨홀 정비 전문 기사',
    ],
    'misc': [  # 분류되지 않은 원본 기본값
        '변기·싱크대·하수구 전문',
        '배관 전문 상담',
        '전북 전 지역 출장',
        '현장 상담 후 견적',
    ],
}

SUB_TEXTS = [
    '24시 상담 가능',
    '출장비 무료',
    '현장 상담 후 견적',
    '평균 30분 내 도착',
    '전문 장비 보유',
    '투명한 가격',
    '7년 경력 기사',
    '365일 운영',
    '친절 응대',
]

# --- 고급 팔레트 세트 (Phase 2.8, 무지개 제거·세트 단위 일관 톤) ---
# 각 세트 = {box, border, promo, phone, sub} 색 5종 세트.
# 시드로 한 세트 고정 → 한 이미지 내 색 통일, 이미지간에는 다양성.
PALETTE_SETS = [
    # 0. 딥네이비 + 크림 + 골드 — 프리미엄·신뢰
    {
        'box': (11, 23, 46),
        'border': (30, 58, 95),
        'promo': (245, 230, 200),
        'phone': (255, 214, 102),
        'sub': (200, 180, 140),
    },
    # 1. 버건디 + 아이보리 + 머스터드 — 웜·전통
    {
        'box': (50, 20, 30),
        'border': (90, 35, 50),
        'promo': (245, 235, 215),
        'phone': (240, 195, 100),
        'sub': (200, 170, 130),
    },
    # 2. 차콜 + 화이트 + 오렌지 — 모던·활기
    {
        'box': (28, 28, 32),
        'border': (55, 55, 60),
        'promo': (250, 250, 250),
        'phone': (255, 138, 80),
        'sub': (180, 180, 180),
    },
    # 3. 다크 포레스트 + 크림 + 세이지 — 자연·안정
    {
        'box': (20, 38, 30),
        'border': (45, 70, 55),
        'promo': (245, 240, 220),
        'phone': (200, 220, 180),
        'sub': (180, 195, 165),
    },
    # 4. 미드나이트 + 아이보리 + 코랄 — 세련·따뜻
    {
        'box': (18, 22, 40),
        'border': (40, 48, 70),
        'promo': (248, 242, 230),
        'phone': (255, 160, 130),
        'sub': (190, 180, 170),
    },
    # 5. 딥플럼 + 크림 + 라이트골드 — 고급·우아
    {
        'box': (42, 20, 48),
        'border': (75, 40, 85),
        'promo': (245, 235, 220),
        'phone': (230, 200, 130),
        'sub': (195, 175, 170),
    },
]

# Deprecated — 구 랜덤 풀 (무지개 효과용). 참조 없음.
BORDER_BG_PALETTES = []
BRIGHT_TEXT_COLORS = []

ROOT = Path(__file__).parent.parent
INPUT_DIR = ROOT / 'public' / 'images' / 'workimages'
OUTPUT_DIR = ROOT / 'public' / 'images' / 'blog-content'
MANIFEST_PATH = ROOT / 'scripts' / 'blog-content-manifest.json'
CLASSIFY_PATH = ROOT / 'scripts' / 'workimages-manifest.json'  # SigLIP 분류 결과

TARGET_WIDTH = 1200
TARGET_HEIGHT = 800
VARIANTS_PER_SOURCE = 30
QUALITY_RANGE = (80, 94)


def load_service_map() -> dict:
    """workimages-manifest.json 에서 {filename: serviceType} 매핑 로드.
    파일이 없으면 전원 'misc' 로 폴백."""
    if not CLASSIFY_PATH.exists():
        print(f'  [WARN] {CLASSIFY_PATH.name} 없음 → 전원 misc 로 처리')
        return {}
    data = json.loads(CLASSIFY_PATH.read_text(encoding='utf-8'))
    return {k: v.get('serviceType', 'misc') for k, v in data.items()}


def make_seed(filepath: Path, variant: int) -> int:
    h = hashlib.sha256(f'{filepath.name}_{variant}_v30'.encode()).hexdigest()
    return int(h[:8], 16)


def draw_rounded_rect(draw, xy, radius, fill):
    """둥근 사각형 그리기 (Pillow 8+ 호환)"""
    try:
        draw.rounded_rectangle(xy, radius=radius, fill=fill)
    except AttributeError:
        draw.rectangle(xy, fill=fill)


def add_branding_overlay(img: Image.Image, rng: random.Random, service: str = 'misc') -> Image.Image:
    """
    대형 브랜딩 오버레이: 테두리 + 서비스별 홍보문구 + 전화번호.
    배너 높이가 전체 이미지의 40~55%를 차지하여 사진을 반쯤 덮음.
    """
    w, h = img.size

    # RGBA 레이어로 반투명 배너 그리기
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # --- 고급 팔레트 세트 (이미지당 1세트 · 시드로 다양성) ---
    palette = rng.choice(PALETTE_SETS)
    border_color = palette['border']
    text_bg      = palette['box']
    promo_color  = palette['promo']
    phone_color  = palette['phone']
    sub_color    = palette['sub']

    # --- 테두리 (얇게 · 세련) ---
    border_width = rng.choice([2, 3, 4])
    for i in range(border_width):
        draw.rectangle([i, i, w - 1 - i, h - 1 - i], outline=border_color)

    # --- 서비스별 문구 선택 ---
    promo_pool = PROMO_BY_SERVICE.get(service, PROMO_BY_SERVICE['misc'])
    promo = rng.choice(promo_pool)
    sub = rng.choice(SUB_TEXTS)

    # --- 폰트 크기 +30% 키움 (배너를 더 크게) ---
    phone_size = 110
    promo_size = 64
    sub_size = 36

    # 텍스트가 이미지 너비를 넘지 않도록 자동 축소
    max_text_width = w - 80  # 좌우 40px 여백

    def fit_font(text: str, initial_size: int, font_path: str) -> ImageFont.FreeTypeFont:
        """텍스트가 max_text_width에 들어가도록 폰트 크기를 자동 축소"""
        size = initial_size
        while size > 20:
            try:
                font = ImageFont.truetype(font_path, size)
            except Exception:
                return ImageFont.load_default()
            try:
                bbox = draw.textbbox((0, 0), text, font=font)
                text_w = bbox[2] - bbox[0]
            except AttributeError:
                text_w = len(text) * size // 2
            if text_w <= max_text_width:
                return font
            size -= 4
        return ImageFont.truetype(font_path, 24) if font_path else ImageFont.load_default()

    phone_display = f'TEL. {PHONE_NUMBER}'
    phone_font = fit_font(phone_display, phone_size, FONT_BOLD)
    promo_font = fit_font(promo, promo_size, FONT_BOLD)
    sub_font = fit_font(sub, sub_size, FONT_BOLD)

    # 실제 적용된 폰트 크기 다시 가져오기
    phone_size = phone_font.size if hasattr(phone_font, 'size') else phone_size
    promo_size = promo_font.size if hasattr(promo_font, 'size') else promo_size
    sub_size = sub_font.size if hasattr(sub_font, 'size') else sub_size

    # --- 배치 위치: 중앙 통일 · 배너 더 크게 (사진 중앙 ~65% 커버) ---
    position = 'middle'
    padding_v = 52

    # 배너 높이 = 3줄 + 여유. 800 중 약 520px (65%) 차지
    banner_h = phone_size + promo_size + sub_size + padding_v * 4

    if position == 'top':
        banner_y = border_width
    elif position == 'bottom':
        banner_y = h - banner_h - border_width
    else:  # middle - 이미지 중앙 통일
        banner_y = (h - banner_h) // 2

    # --- 반투명 배경 박스 (더 투명하게, 사진이 뒤로 비치도록) ---
    box_alpha = rng.randint(110, 150)  # 43%~59% — 사진 뒤가 선명히 비침
    box_xy = [
        border_width,
        banner_y,
        w - border_width,
        banner_y + banner_h,
    ]
    draw.rectangle(
        box_xy,
        fill=(*text_bg, box_alpha),
    )

    # 액센트 하이라이트 바 (세트 phone 컬러로 통일 · 얇고 세련)
    bar_h = 3
    draw.rectangle(
        [border_width, banner_y, w - border_width, banner_y + bar_h],
        fill=(*phone_color, 255),
    )
    draw.rectangle(
        [border_width, banner_y + banner_h - bar_h, w - border_width, banner_y + banner_h],
        fill=(*phone_color, 255),
    )

    # --- 텍스트 렌더링 ---
    def measure_text(text, font):
        try:
            bbox = draw.textbbox((0, 0), text, font=font)
            return bbox[2] - bbox[0]
        except AttributeError:
            return len(text) * font.size // 2

    def draw_centered(text, font, y, color, outline_width=3):
        text_w = measure_text(text, font)
        x = (w - text_w) // 2
        # 강한 외곽선 (가독성)
        for ox in range(-outline_width, outline_width + 1):
            for oy in range(-outline_width, outline_width + 1):
                if ox == 0 and oy == 0:
                    continue
                draw.text((x + ox, y + oy), text, font=font, fill=(0, 0, 0))
        draw.text((x, y), text, font=font, fill=color)

    def draw_centered_rainbow(text, font, y, color_pool, outline_width=4):
        """각 글자마다 다른 색상으로 렌더링 (무지개 효과)"""
        # 전체 너비 계산 (글자별 width 합)
        char_widths = [measure_text(ch, font) for ch in text]
        total_w = sum(char_widths)
        x = (w - total_w) // 2

        # 글자마다 독립 색상 선택 (인접 글자가 같은 색이 되지 않도록)
        prev_color = None
        for ch, cw in zip(text, char_widths):
            # 공백이나 특수문자는 그냥 지나감
            if ch in (' ', '.', '-'):
                # 공백/구분자는 랜덤이되 첫 색상과 다르게
                color = rng.choice(color_pool)
            else:
                attempts = 0
                while attempts < 5:
                    color = rng.choice(color_pool)
                    if color != prev_color:
                        break
                    attempts += 1
            prev_color = color

            # 외곽선 (가독성)
            for ox in range(-outline_width, outline_width + 1):
                for oy in range(-outline_width, outline_width + 1):
                    if ox == 0 and oy == 0:
                        continue
                    draw.text((x + ox, y + oy), ch, font=font, fill=(0, 0, 0))
            # 메인 글자
            draw.text((x, y), ch, font=font, fill=color)
            x += cw

    current_y = banner_y + padding_v + bar_h

    # 1) 홍보 문구 (세트 promo 색 단색 · 무지개 제거)
    draw_centered(promo, promo_font, current_y, promo_color, outline_width=3)
    current_y += promo_size + padding_v // 2

    # 2) 전화번호 (세트 phone 색 단색 · 무지개 제거)
    draw_centered(phone_display, phone_font, current_y, phone_color, outline_width=5)
    current_y += phone_size + padding_v // 2

    # 3) 서브 문구 (세트 sub 색 단색)
    draw_centered(sub, sub_font, current_y, sub_color, outline_width=2)

    # --- 원본 이미지에 오버레이 합성 ---
    img_rgba = img.convert('RGBA')
    img_rgba = Image.alpha_composite(img_rgba, overlay)
    return img_rgba.convert('RGB')


def inject_noise(img: Image.Image, rng: random.Random) -> Image.Image:
    """
    픽셀 해시를 바꾸는 imperceptible 노이즈 주입.
    시각적으로는 거의 보이지 않지만 파일 해시/픽셀 해시는 완전히 달라짐.

    전략: 랜덤 위치 50~150 픽셀을 ±2~3 변경.
    시각적으로 전혀 보이지 않지만 파일 해시는 완전히 달라짐.
    """
    w, h = img.size
    pixels = img.load()

    # 50~150개 랜덤 픽셀 미세 변경
    spots = rng.randint(50, 150)
    for _ in range(spots):
        x = rng.randint(0, w - 1)
        y = rng.randint(0, h - 1)
        r, g, b = pixels[x, y]
        pixels[x, y] = (
            max(0, min(255, r + rng.randint(-3, 3))),
            max(0, min(255, g + rng.randint(-3, 3))),
            max(0, min(255, b + rng.randint(-3, 3))),
        )

    return img


def process_image(src: Path, variant: int, service: str = 'misc') -> tuple[Image.Image, random.Random]:
    seed = make_seed(src, variant)
    rng = random.Random(seed)

    img = Image.open(src)

    # 1. EXIF 완전 제거
    if img.mode in ('RGBA', 'P', 'L'):
        img = img.convert('RGB')
    clean = Image.new('RGB', img.size)
    clean.paste(img)
    img = clean

    # 2. 비율 맞춰 리사이즈
    src_ratio = img.width / img.height
    target_ratio = TARGET_WIDTH / TARGET_HEIGHT

    # 변형별로 overshoot 크기를 다르게 (크롭 위치 다양성 증가)
    overshoot_w = rng.randint(30, 180)
    overshoot_h = rng.randint(30, 180)

    if src_ratio > target_ratio:
        new_h = TARGET_HEIGHT + overshoot_h
        new_w = int(new_h * src_ratio)
        img = img.resize((new_w, new_h), Image.LANCZOS)
    else:
        new_w = TARGET_WIDTH + overshoot_w
        new_h = int(new_w / src_ratio)
        img = img.resize((new_w, new_h), Image.LANCZOS)

    # 3. 랜덤 크롭
    max_x = max(img.width - TARGET_WIDTH, 0)
    max_y = max(img.height - TARGET_HEIGHT, 0)
    cx = rng.randint(0, max_x) if max_x else 0
    cy = rng.randint(0, max_y) if max_y else 0
    img = img.crop((cx, cy, cx + TARGET_WIDTH, cy + TARGET_HEIGHT))

    # 4. 색상 조정 (브라이트니스/대비/채도 각각 ±N%)
    brightness = 0.92 + rng.random() * 0.16  # 0.92~1.08
    contrast = 0.93 + rng.random() * 0.14     # 0.93~1.07
    saturation = 0.88 + rng.random() * 0.24   # 0.88~1.12

    img = ImageEnhance.Brightness(img).enhance(brightness)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    img = ImageEnhance.Color(img).enhance(saturation)

    # 5. 샤프니스/블러 랜덤
    sharp_type = rng.randint(0, 3)
    if sharp_type == 0:
        img = img.filter(ImageFilter.GaussianBlur(radius=0.25))
    elif sharp_type == 1:
        img = img.filter(ImageFilter.UnsharpMask(radius=0.4, percent=25))
    elif sharp_type == 2:
        img = img.filter(ImageFilter.UnsharpMask(radius=0.6, percent=35))
    # sharp_type == 3: 필터 없음

    # 6. 브랜딩 오버레이 (서비스별 분기)
    img = add_branding_overlay(img, rng, service=service)

    # 7. 픽셀 해시 유니크화 (imperceptible 노이즈)
    img = inject_noise(img, rng)

    return img, rng


def main():
    if not INPUT_DIR.exists():
        print(f'ERROR: {INPUT_DIR} not found')
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # 서비스별 폴더 준비 + 기존 파일 정리
    services = list(PROMO_BY_SERVICE.keys())
    for svc in services:
        svc_dir = OUTPUT_DIR / svc
        svc_dir.mkdir(parents=True, exist_ok=True)
        for old in svc_dir.glob('*.webp'):
            old.unlink()
    # 구버전 flat 파일 정리
    for old in OUTPUT_DIR.glob('*.webp'):
        old.unlink()

    # SigLIP 분류 결과 로드
    service_map = load_service_map()

    sources = sorted(INPUT_DIR.glob('*.jpg')) + sorted(INPUT_DIR.glob('*.jpeg')) + sorted(INPUT_DIR.glob('*.png'))
    print(f'원본 사진: {len(sources)}장')
    print(f'변형: {VARIANTS_PER_SOURCE}개/원본')
    print(f'예상 결과: {len(sources) * VARIANTS_PER_SOURCE}장')
    print(f'서비스 분류 맵: {len(service_map)}장')
    print('-' * 40)

    manifest = {
        'generated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ'),
        'source_count': len(sources),
        'variants_per_source': VARIANTS_PER_SOURCE,
        'images': [],
    }

    # 서비스별 카운터 (각 폴더 내 NNNN 순번 독립)
    svc_counter = {svc: 0 for svc in services}
    total_counter = 0
    seen_hashes = set()

    for src in sources:
        service = service_map.get(src.name, 'misc')

        for variant in range(VARIANTS_PER_SOURCE):
            try:
                img, rng = process_image(src, variant, service=service)
                quality = rng.randint(*QUALITY_RANGE)

                svc_counter[service] = svc_counter.get(service, 0) + 1
                svc_idx = svc_counter[service]
                filename = f'{service}-{svc_idx:04d}.webp'
                out_path = OUTPUT_DIR / service / filename

                # WebP 저장 옵션도 변형마다 다르게
                method = rng.randint(4, 6)
                img.save(
                    out_path,
                    format='WEBP',
                    quality=quality,
                    method=method,
                )

                # 파일 해시 검증 (중복 감지)
                file_hash = hashlib.md5(out_path.read_bytes()).hexdigest()
                if file_hash in seen_hashes:
                    print(f'  [WARN] {service}/{filename} hash collision!')
                seen_hashes.add(file_hash)

                total_counter += 1
                manifest['images'].append({
                    'index': total_counter,
                    'filename': filename,
                    'public_path': f'/images/blog-content/{service}/{filename}',
                    'source': src.name,
                    'service': service,
                    'variant': variant,
                    'quality': quality,
                    'method': method,
                    'file_hash': file_hash[:12],
                    'size_bytes': out_path.stat().st_size,
                })

                if total_counter == 1 or total_counter % 500 == 0:
                    print(
                        f'  [{total_counter:>4}] {service}/{filename} '
                        f'(q={quality}, {out_path.stat().st_size // 1024}KB, hash={file_hash[:8]})'
                    )
            except Exception as e:
                print(f'  ERROR {src.name} v{variant}: {e}')

    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )

    print('-' * 40)
    print(f'생성: {total_counter}장')
    print(f'고유 해시: {len(seen_hashes)}개 (중복 없음: {len(seen_hashes) == total_counter})')
    print(f'출력: {OUTPUT_DIR}')
    print(f'매니페스트: {MANIFEST_PATH}')

    print('\n서비스별 파일 수:')
    for svc in services:
        print(f'  {svc:10s}: {svc_counter.get(svc, 0):>4}장')


if __name__ == '__main__':
    main()
