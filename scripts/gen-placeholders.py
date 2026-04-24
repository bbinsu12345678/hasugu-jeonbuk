#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen-placeholders.py

AI로 생성한 프론트엔드 이미지를 받을 때까지 쓸 **중립 placeholder** 생성.
- 브랜드 색 팔레트(네이비 + 오렌지)로 단순 gradient + 중앙 아이콘 자리만 비운 블록.
- 경쟁사 흔적 0, 텍스트 0.
- 파일명은 기존 참조를 그대로 유지해서 UI 코드 변경 없음.
- 확장자와 실제 포맷이 일치하도록 저장(기존 JPEG-as-PNG 버그 해결).

사용법:
    python scripts/gen-placeholders.py
"""
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path('public/images')

NAVY = (27, 59, 95)        # #1B3B5F
ORANGE = (245, 158, 66)    # #F59E42
CREAM = (248, 245, 240)    # #F8F5F0


def gradient(size, c1, c2, direction='vertical'):
    """두 색 사이 gradient 생성."""
    w, h = size
    img = Image.new('RGB', size, c1)
    px = img.load()
    for y in range(h):
        for x in range(w):
            if direction == 'vertical':
                t = y / max(h - 1, 1)
            else:
                t = x / max(w - 1, 1)
            px[x, y] = (
                int(c1[0] * (1 - t) + c2[0] * t),
                int(c1[1] * (1 - t) + c2[1] * t),
                int(c1[2] * (1 - t) + c2[2] * t),
            )
    return img


def solid(size, color, mode='RGB'):
    return Image.new(mode, size, color)


def save(img, path: Path, fmt: str, **kw):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, fmt, **kw)
    print(f'  wrote {path.relative_to(Path("."))}  ({path.stat().st_size:,}B)')


def main():
    print('placeholder 생성 시작')

    # 1. Hero 배경 — navy→orange 가로 gradient (AI 이미지 교체 전 중립)
    img = gradient((1920, 1080), NAVY, ORANGE, 'horizontal')
    save(img, OUT / 'main_bg.png', 'PNG', optimize=True)

    # 2. OG 이미지 — navy 단색 + 오렌지 코너 스트라이프 (텍스트는 overlay 단계에서)
    img = solid((1200, 630), NAVY)
    draw = ImageDraw.Draw(img)
    draw.polygon([(0, 530), (400, 630), (0, 630)], fill=ORANGE)
    save(img, OUT / 'og-image.png', 'PNG', optimize=True)

    # 3. 서비스지역 메인/서브 — 세로 gradient, 경쟁사와 완전히 다른 톤
    img = gradient((1071, 1428), CREAM, NAVY, 'vertical')
    save(img, OUT / 'area-main.jpg', 'JPEG', quality=85, optimize=True)

    img = gradient((1071, 1428), NAVY, CREAM, 'vertical')
    save(img, OUT / 'area-sub.jpg', 'JPEG', quality=85, optimize=True)

    # 4. 서비스 3종 카드 — 1200×800 (3:2) 가로형 통일
    #    컨테이너 aspect-[3/2] 와 원본 비율 일치 → object-cover 잘림 0
    for name in ['service-drain', 'service-sink', 'service-toilet']:
        w, h = 1200, 800
        img = solid((w, h), NAVY)
        draw = ImageDraw.Draw(img)
        cx, cy = w // 2, h // 2
        r = min(w, h) // 5
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=ORANGE)
        save(img, OUT / f'{name}.jpg', 'JPEG', quality=85, optimize=True)

    # 5. 후기 아바타 5~7 — 원형 placeholder, 실제 avatar-1~4 와 톤 맞춤
    palette = [NAVY, ORANGE, CREAM]
    for i, color in enumerate(palette, start=5):
        img = solid((100, 100), color)  # 기존 1~4와 동일 100x100로 normalize
        draw = ImageDraw.Draw(img)
        draw.ellipse([10, 10, 90, 90], fill=tuple(min(255, c + 30) for c in color))
        save(img, OUT / f'avatar-{i}.png', 'PNG', optimize=True)

    print('done.')


if __name__ == '__main__':
    main()
