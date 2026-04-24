#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen-service-og.py

8개 서비스별 og:image 1200x630 생성.
- 서비스명 overlay + 아이콘 자리
- 서비스별 색상 variation
"""
from __future__ import annotations

import hashlib
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path('public/images/og')
FONT_REG = 'C:/Windows/Fonts/malgun.ttf'
FONT_BOLD = 'C:/Windows/Fonts/malgunbd.ttf'

SERVICES = [
    ('toilet',    '변기막힘',     '💧'),
    ('sink',      '싱크대막힘',   '🚿'),
    ('drain',     '하수구막힘',   '🌀'),
    ('leak',      '누수탐지',     '🔍'),
    ('aircon',    '에어컨배관청소','❄️'),
    ('sewage',    '오수관막힘',   '⚙️'),
    ('stormwater','우수관막힘',   '☔'),
    ('manhole',   '맨홀청소',     '🕳️'),
]

NAVY = (27, 59, 95)
ORANGE = (245, 158, 66)
CREAM = (248, 245, 240)
WHITE = (255, 255, 255)

PALETTES = [
    ((27, 59, 95),  (245, 158, 66)),
    ((45, 72, 120), (255, 180, 70)),
    ((18, 82, 100), (240, 140, 60)),
    ((60, 55, 100), (250, 165, 80)),
    ((30, 70, 70),  (245, 170, 75)),
    ((35, 60, 95),  (255, 150, 55)),
    ((50, 65, 110), (245, 160, 65)),
    ((25, 75, 85),  (250, 170, 70)),
]


def palette_for(key: str):
    h = int(hashlib.md5(key.encode('utf-8')).hexdigest(), 16)
    return PALETTES[h % len(PALETTES)]


def gradient(img, c1, c2):
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


def gen(key: str, title: str) -> Image.Image:
    c1, c2 = palette_for(key)
    img = Image.new('RGB', (1200, 630), c1)
    gradient(img, c1, c2)

    draw = ImageDraw.Draw(img)
    draw.polygon([(0, 500), (320, 630), (0, 630)], fill=ORANGE)
    draw.polygon([(1200, 0), (1200, 180), (1010, 0)], fill=NAVY)

    font_title = ImageFont.truetype(FONT_BOLD, 140)
    font_sub = ImageFont.truetype(FONT_BOLD, 50)
    font_brand = ImageFont.truetype(FONT_REG, 34)

    bbox = draw.textbbox((0, 0), title, font=font_title)
    tw = bbox[2] - bbox[0]
    cx = (1200 - tw) // 2
    draw.text((cx + 3, 133), title, fill=(0, 0, 0), font=font_title)
    draw.text((cx, 130), title, fill=WHITE, font=font_title)

    sub = '전북 14개 시/군 24시 긴급출동'
    bbox = draw.textbbox((0, 0), sub, font=font_sub)
    tw = bbox[2] - bbox[0]
    draw.text(((1200 - tw) // 2, 340), sub, fill=CREAM, font=font_sub)

    # 하단 네이비 밴드
    draw.rectangle([(0, 520), (1200, 630)], fill=NAVY)

    brand = '전북하수구 · 출장비 무료 · 친절 상담'
    bbox = draw.textbbox((0, 0), brand, font=font_brand)
    tw = bbox[2] - bbox[0]
    draw.text(((1200 - tw) // 2, 562), brand, fill=WHITE, font=font_brand)

    return img


def save(img, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, 'PNG', optimize=True)
    print(f'  wrote {path.relative_to(Path("."))}  ({path.stat().st_size:,}B)')


def main():
    print(f'generating {len(SERVICES)} service OG images...')
    for key, title, _ in SERVICES:
        img = gen(key, title)
        save(img, OUT / f'service-{key}.png')
    print('done.')


if __name__ == '__main__':
    main()
