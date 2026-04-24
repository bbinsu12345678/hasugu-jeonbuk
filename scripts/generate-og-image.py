#!/usr/bin/env python3
"""
OG 이미지 생성 (1200x630) - 소셜 미디어 공유용.
출력: public/images/og-image.png
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent.parent
OUTPUT = ROOT / 'public' / 'images' / 'og-image.png'

W, H = 1200, 630
FONT_BOLD = 'C:/Windows/Fonts/malgunbd.ttf'

PHONE = '010-8184-3496'
BRAND_KEYWORD = '변기막힘 싱크대막힘 하수구막힘'
SUBTITLE = '24시 긴급출동 · 전라북도 전 지역'
TAGLINE = '출장비 무료 · 안 뚫리면 0원 · 30분 내 도착'


def make_gradient(w: int, h: int, start: tuple, end: tuple) -> Image.Image:
    """위→아래 수직 그라데이션"""
    img = Image.new('RGB', (w, h), start)
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        r = int(start[0] * (1 - t) + end[0] * t)
        g = int(start[1] * (1 - t) + end[1] * t)
        b = int(start[2] * (1 - t) + end[2] * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    return img


def draw_text_centered(draw, text, font, y, color, outline=4, outline_color=(0, 0, 0)):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2
    # 외곽선
    for ox in range(-outline, outline + 1):
        for oy in range(-outline, outline + 1):
            if ox == 0 and oy == 0:
                continue
            draw.text((x + ox, y + oy), text, font=font, fill=outline_color)
    draw.text((x, y), text, font=font, fill=color)


def main():
    # 그라데이션 배경 (딥블루 → 블루)
    img = make_gradient(W, H, (15, 40, 120), (40, 90, 200))
    draw = ImageDraw.Draw(img)

    # 두꺼운 노란 테두리
    border_w = 14
    border_color = (255, 210, 0)
    for i in range(border_w):
        draw.rectangle([i, i, W - 1 - i, H - 1 - i], outline=border_color)

    # 상단 노란 바 (accent)
    bar_h = 50
    draw.rectangle([border_w, border_w, W - border_w, border_w + bar_h], fill=(255, 210, 0))
    # 하단 노란 바
    draw.rectangle([border_w, H - border_w - bar_h, W - border_w, H - border_w], fill=(255, 210, 0))

    max_text_width = W - 120  # 좌우 60px 여유

    def fit_font(text: str, initial_size: int) -> ImageFont.FreeTypeFont:
        size = initial_size
        while size > 20:
            font = ImageFont.truetype(FONT_BOLD, size)
            bbox = draw.textbbox((0, 0), text, font=font)
            if bbox[2] - bbox[0] <= max_text_width:
                return font
            size -= 4
        return ImageFont.truetype(FONT_BOLD, 24)

    phone_text = f'TEL. {PHONE}'
    title_font = fit_font(BRAND_KEYWORD, 72)
    phone_font = fit_font(phone_text, 115)
    subtitle_font = fit_font(SUBTITLE, 44)
    tagline_font = fit_font(TAGLINE, 36)

    # 타이틀 (흰색)
    draw_text_centered(draw, BRAND_KEYWORD, title_font, 115, (255, 255, 255), outline=4)

    # 서브타이틀 (연노랑)
    draw_text_centered(draw, SUBTITLE, subtitle_font, 215, (255, 240, 120), outline=3)

    # 전화번호 (초대형, 노랑)
    draw_text_centered(draw, phone_text, phone_font, 305, (255, 210, 0), outline=6)

    # 태그라인 (흰색)
    draw_text_centered(draw, TAGLINE, tagline_font, 470, (255, 255, 255), outline=3)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUTPUT, format='PNG', optimize=True)
    size_kb = OUTPUT.stat().st_size // 1024
    print(f'OK: {OUTPUT} ({W}x{H}, {size_kb}KB)')


if __name__ == '__main__':
    main()
