#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen-jeonbuk-og.py

광역 허브 (/jeonbuk) 전용 og:image 1장 생성.
"""
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path('public/images/og/jeonbuk.png')
FONT_REG = 'C:/Windows/Fonts/malgun.ttf'
FONT_BOLD = 'C:/Windows/Fonts/malgunbd.ttf'

NAVY = (27, 59, 95)
DEEP_NAVY = (15, 35, 65)
ORANGE = (245, 158, 66)
CREAM = (248, 245, 240)
WHITE = (255, 255, 255)


def gradient(size, c1, c2, direction='vertical'):
    w, h = size
    img = Image.new('RGB', size, c1)
    px = img.load()
    for y in range(h):
        for x in range(w):
            t = y / max(h - 1, 1) if direction == 'vertical' else x / max(w - 1, 1)
            px[x, y] = (
                int(c1[0] * (1 - t) + c2[0] * t),
                int(c1[1] * (1 - t) + c2[1] * t),
                int(c1[2] * (1 - t) + c2[2] * t),
            )
    return img


def main():
    img = gradient((1200, 630), DEEP_NAVY, NAVY, 'vertical')
    draw = ImageDraw.Draw(img)

    # 좌측 오렌지 세로 밴드
    draw.rectangle([(0, 0), (24, 630)], fill=ORANGE)
    # 우측 하단 오렌지 삼각형
    draw.polygon([(1200, 630), (1200, 500), (1050, 630)], fill=ORANGE)

    font_title = ImageFont.truetype(FONT_BOLD, 120)
    font_sub = ImageFont.truetype(FONT_BOLD, 62)
    font_foot = ImageFont.truetype(FONT_REG, 38)

    title = '전라북도'
    bbox = draw.textbbox((0, 0), title, font=font_title)
    tw = bbox[2] - bbox[0]
    draw.text(((1200 - tw) // 2 + 3, 123), title, fill=(0, 0, 0), font=font_title)
    draw.text(((1200 - tw) // 2, 120), title, fill=WHITE, font=font_title)

    sub = '하수구막힘 · 변기막힘 · 싱크대막힘'
    bbox = draw.textbbox((0, 0), sub, font=font_sub)
    tw = bbox[2] - bbox[0]
    draw.text(((1200 - tw) // 2, 310), sub, fill=CREAM, font=font_sub)

    # 하단 딥네이비 밴드
    draw.rectangle([(0, 520), (1200, 630)], fill=DEEP_NAVY)

    foot = '14개 시/군 전 지역 24시 긴급출동 · 전북하수구'
    bbox = draw.textbbox((0, 0), foot, font=font_foot)
    tw = bbox[2] - bbox[0]
    draw.text(((1200 - tw) // 2, 562), foot, fill=WHITE, font=font_foot)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, 'PNG', optimize=True)
    print(f'  wrote {OUT.relative_to(Path("."))}  ({OUT.stat().st_size:,}B)')


if __name__ == '__main__':
    main()
