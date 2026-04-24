#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen-city-og.py

전북 14 시/군 각각의 og:image 1200x630 생성.
- 도시 이름 overlay (malgun.ttf Bold)
- 도시별 색상 variation (도시명 해시 → hue shift)
- 브랜드 '전북하수구' sub-text
- EXIF 주입 X (OG 이미지는 도시 단위 공유라 dedup 가치 낮음 — advisor 권고)

사용법:
    python scripts/gen-city-og.py [--smoke CITY]
"""
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path('public/images/og')
FONT_REG = 'C:/Windows/Fonts/malgun.ttf'
FONT_BOLD = 'C:/Windows/Fonts/malgunbd.ttf'

CITIES = [
    '전주시', '군산시', '익산시', '정읍시', '남원시', '김제시',
    '완주군', '고창군', '부안군', '진안군', '무주군', '장수군',
    '임실군', '순창군',
]

# 베이스 팔레트 (네이비 + 오렌지 브랜드 컬러)
NAVY = (27, 59, 95)
ORANGE = (245, 158, 66)
CREAM = (248, 245, 240)
WHITE = (255, 255, 255)

# 보조 팔레트 (도시별 hue shift)
PALETTES = [
    ((27, 59, 95),    (245, 158, 66)),   # 네이비 + 오렌지
    ((45, 72, 120),   (255, 180, 70)),   # 라이트 네이비
    ((18, 82, 100),   (240, 140, 60)),   # 틸
    ((60, 55, 100),   (250, 165, 80)),   # 퍼플리쉬
    ((30, 70, 70),    (245, 170, 75)),   # 다크 틸
    ((35, 60, 95),    (255, 150, 55)),   # 딥 네이비
    ((50, 65, 110),   (245, 160, 65)),   # 블루 바이올렛
    ((25, 75, 85),    (250, 170, 70)),   # 시안 딥
]


def palette_for(city: str):
    h = int(hashlib.md5(city.encode('utf-8')).hexdigest(), 16)
    return PALETTES[h % len(PALETTES)]


def draw_gradient(img: Image.Image, c1, c2):
    w, h = img.size
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        row = (
            int(c1[0] * (1 - t) + c2[0] * t),
            int(c1[1] * (1 - t) + c2[1] * t),
            int(c1[2] * (1 - t) + c2[2] * t),
        )
        for x in range(w):
            px[x, y] = row


def gen_city(city: str) -> Image.Image:
    c1, c2 = palette_for(city)
    img = Image.new('RGB', (1200, 630), c1)
    draw_gradient(img, c1, c2)

    draw = ImageDraw.Draw(img)

    # 왼쪽 아래 오렌지 삼각형 액센트
    draw.polygon([(0, 480), (360, 630), (0, 630)], fill=ORANGE)
    # 오른쪽 위 네이비 삼각형
    draw.polygon([(900, 0), (1200, 0), (1200, 200)], fill=NAVY)

    # 도시명 — 대형 Bold (malgun bold)
    font_city = ImageFont.truetype(FONT_BOLD, 140)
    font_service = ImageFont.truetype(FONT_BOLD, 56)
    font_brand = ImageFont.truetype(FONT_REG, 36)

    # 도시명 중앙 상단
    bbox = draw.textbbox((0, 0), city, font=font_city)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    cx = (1200 - tw) // 2
    cy = 140
    # 그림자
    draw.text((cx + 3, cy + 3), city, fill=(0, 0, 0), font=font_city)
    draw.text((cx, cy), city, fill=WHITE, font=font_city)

    # 서비스 문구
    service_text = '하수구막힘 · 변기막힘 · 싱크대막힘'
    bbox = draw.textbbox((0, 0), service_text, font=font_service)
    tw = bbox[2] - bbox[0]
    cx = (1200 - tw) // 2
    draw.text((cx, 340), service_text, fill=CREAM, font=font_service)

    # 하단 네이비 밴드 (브랜드 가독성 확보)
    draw.rectangle([(0, 520), (1200, 630)], fill=NAVY)

    # 브랜드 sub-text (네이비 밴드 위 화이트)
    brand_text = '전북하수구 · 24시 긴급출동 · 출장비 무료'
    bbox = draw.textbbox((0, 0), brand_text, font=font_brand)
    tw = bbox[2] - bbox[0]
    cx = (1200 - tw) // 2
    draw.text((cx, 562), brand_text, fill=WHITE, font=font_brand)

    return img


def save(img: Image.Image, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, 'PNG', optimize=True)
    print(f'  wrote {path.relative_to(Path("."))}  ({path.stat().st_size:,}B)')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--smoke', help='단일 도시 smoke test (e.g. --smoke 전주시)')
    args = parser.parse_args()

    if args.smoke:
        city = args.smoke
        if city not in CITIES:
            print(f'ERROR: {city} not in CITIES list')
            return
        print(f'[smoke] {city}')
        img = gen_city(city)
        save(img, OUT / f'{city}.png')
        return

    print(f'generating {len(CITIES)} city OG images...')
    for city in CITIES:
        img = gen_city(city)
        save(img, OUT / f'{city}.png')
    print('done.')


if __name__ == '__main__':
    main()
