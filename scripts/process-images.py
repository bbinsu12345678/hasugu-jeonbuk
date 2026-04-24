#!/usr/bin/env python3
"""
이미지 가공 파이프라인

입력: public/images/raw/{category}/*.jpg
출력: public/images/processed/{category}/*.webp

적용 기법:
1. EXIF 메타데이터 완전 제거
2. 크기 표준화 (1200x800)
3. 랜덤 크롭 (각 이미지마다 다른 크롭 영역)
4. 미세 노이즈 추가 (픽셀 해시 변경)
5. 랜덤 색상 조정 (hue, brightness, contrast)
6. JPEG → WebP 재인코딩
7. 품질 다양화 (80~92 랜덤)
8. 파일명 해시화

결과: 같은 원본이어도 매번 다른 픽셀/메타/해시의 고유 파일 생성

사용법:
  pip install pillow
  python scripts/process-images.py

출력:
  public/images/processed/{category}/*.webp
  scripts/processed-manifest.json
"""

import os
import sys
import json
import time
import hashlib
import random
from pathlib import Path

try:
    from PIL import Image, ImageEnhance, ImageFilter
except ImportError:
    print('ERROR: Pillow 라이브러리 필요')
    print('  설치: pip install pillow')
    sys.exit(1)

# --- 설정 ---
INPUT_DIR = Path('public/images/raw')
OUTPUT_DIR = Path('public/images/processed')
MANIFEST_PATH = Path('scripts/processed-manifest.json')

TARGET_WIDTH = 1200
TARGET_HEIGHT = 800
WEBP_QUALITY_RANGE = (80, 92)


def make_seed(filepath: Path) -> int:
    """파일 경로 기반 결정론적 시드"""
    h = hashlib.sha256(str(filepath).encode()).hexdigest()
    return int(h[:8], 16)


def process_image(src: Path, dst_dir: Path, variant_index: int = 0) -> dict:
    """단일 이미지 가공"""
    seed = make_seed(src) + variant_index
    rng = random.Random(seed)

    img = Image.open(src)

    # 1. EXIF 제거 (새 이미지로 복사)
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')
    clean = Image.new('RGB', img.size)
    clean.paste(img)
    img = clean

    # 2. 표준 크기로 리사이즈 (비율 유지, 크롭)
    src_ratio = img.width / img.height
    target_ratio = TARGET_WIDTH / TARGET_HEIGHT

    if src_ratio > target_ratio:
        # 원본이 더 넓음 → 높이 맞추고 좌우 크롭
        new_h = TARGET_HEIGHT + rng.randint(20, 80)
        new_w = int(new_h * src_ratio)
        img = img.resize((new_w, new_h), Image.LANCZOS)
    else:
        # 원본이 더 좁음 → 너비 맞추고 상하 크롭
        new_w = TARGET_WIDTH + rng.randint(20, 80)
        new_h = int(new_w / src_ratio)
        img = img.resize((new_w, new_h), Image.LANCZOS)

    # 3. 랜덤 크롭 위치
    max_x = img.width - TARGET_WIDTH
    max_y = img.height - TARGET_HEIGHT
    crop_x = rng.randint(0, max(max_x, 0))
    crop_y = rng.randint(0, max(max_y, 0))
    img = img.crop((crop_x, crop_y, crop_x + TARGET_WIDTH, crop_y + TARGET_HEIGHT))

    # 4. 랜덤 색상 조정
    brightness = 0.92 + rng.random() * 0.16  # 0.92~1.08
    contrast = 0.92 + rng.random() * 0.16
    saturation = 0.90 + rng.random() * 0.20

    img = ImageEnhance.Brightness(img).enhance(brightness)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    img = ImageEnhance.Color(img).enhance(saturation)

    # 5. 미세 노이즈 (Gaussian blur로 픽셀 해시 변경)
    if rng.random() < 0.5:
        img = img.filter(ImageFilter.GaussianBlur(radius=0.3))
    else:
        img = img.filter(ImageFilter.UnsharpMask(radius=0.5, percent=30))

    # 6. 파일명 해시화
    output_hash = hashlib.md5(
        f'{src.name}_{seed}_{variant_index}'.encode(),
    ).hexdigest()[:10]
    category = src.parent.name
    output_name = f'{category}_{output_hash}.webp'
    dst = dst_dir / output_name

    # 7. WebP 재인코딩 (랜덤 품질)
    quality = rng.randint(*WEBP_QUALITY_RANGE)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(
        dst,
        format='WEBP',
        quality=quality,
        method=6,
    )

    # 결과 해시
    file_hash = hashlib.md5(dst.read_bytes()).hexdigest()

    return {
        'src': str(src.relative_to('public')),
        'dst': str(dst.relative_to('public')),
        'category': category,
        'brightness': round(brightness, 3),
        'contrast': round(contrast, 3),
        'saturation': round(saturation, 3),
        'quality': quality,
        'crop': [crop_x, crop_y],
        'file_hash': file_hash,
        'file_size': dst.stat().st_size,
    }


def main():
    if not INPUT_DIR.exists():
        print(f'ERROR: {INPUT_DIR} 폴더 없음')
        print('먼저 실행: python scripts/fetch-images.py')
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {'processed': [], 'generated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ')}

    total = 0
    for category_dir in sorted(INPUT_DIR.iterdir()):
        if not category_dir.is_dir():
            continue

        category = category_dir.name
        print(f'\n[{category}] 가공 중...')

        dst_category_dir = OUTPUT_DIR / category
        dst_category_dir.mkdir(parents=True, exist_ok=True)

        images = sorted(category_dir.glob('*.jpg')) + sorted(category_dir.glob('*.png'))
        for img_path in images:
            try:
                # 각 원본당 2개 변형 생성 → 더 많은 고유 이미지 확보
                for variant in range(2):
                    result = process_image(img_path, dst_category_dir, variant)
                    manifest['processed'].append(result)
                    total += 1
                    print(f'  OK: {result["dst"]} (q={result["quality"]})')
            except Exception as e:
                print(f'  [ERROR] {img_path.name}: {e}')

    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )

    print(f'\n=== 완료 ===')
    print(f'가공된 이미지: {total}개')
    print(f'매니페스트: {MANIFEST_PATH}')
    print(f'출력 경로: {OUTPUT_DIR}')
    print()
    print('다음 단계: blog-templates.ts의 thumbnails 배열을 업데이트')


if __name__ == '__main__':
    main()
