#!/usr/bin/env python3
"""
배관/화장실 이미지 자동 수집 스크립트

소스: Pixabay API (무료, 상업 이용 가능, 출처 표기 불필요)
- 회원가입 없이 API 키 발급: https://pixabay.com/api/docs/
- 시간당 100개 요청 제한

사용법:
  1. Pixabay API 키 발급 후 환경변수 설정: PIXABAY_API_KEY=xxx
  2. python scripts/fetch-images.py

출력:
  public/images/raw/{category}/{name}.jpg  (원본)
  scripts/image-manifest.json  (수집 메타데이터)
"""

import os
import sys
import json
import time
import hashlib
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlencode

# --- 설정 ---
PIXABAY_API_KEY = os.environ.get('PIXABAY_API_KEY', '')
OUTPUT_DIR = Path('public/images/raw')
MANIFEST_PATH = Path('scripts/image-manifest.json')

# 카테고리별 검색 키워드
SEARCH_QUERIES = {
    '변기': ['toilet', 'bathroom toilet', 'toilet bowl'],
    '싱크대': ['kitchen sink', 'sink drain', 'kitchen faucet'],
    '하수구': ['drain pipe', 'sewage', 'plumbing pipe'],
    '고압세척': ['pressure washer', 'water jet cleaning'],
    '배관': ['plumbing', 'pipe repair', 'plumber tools'],
    '누수': ['water leak', 'leak detection', 'pipe leak'],
    '욕실': ['bathroom interior', 'modern bathroom'],
    '작업': ['plumber working', 'repair service', 'handyman'],
}

PER_PAGE = 15  # 카테고리당 다운로드 수


def fetch_pixabay(query: str, per_page: int = 15) -> list:
    """Pixabay API로 이미지 검색"""
    if not PIXABAY_API_KEY:
        print('ERROR: PIXABAY_API_KEY 환경변수 필요')
        print('  발급: https://pixabay.com/api/docs/')
        print('  설정: export PIXABAY_API_KEY=your_key')
        sys.exit(1)

    params = urlencode({
        'key': PIXABAY_API_KEY,
        'q': query,
        'image_type': 'photo',
        'orientation': 'horizontal',
        'per_page': per_page,
        'safesearch': 'true',
    })
    url = f'https://pixabay.com/api/?{params}'

    try:
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            return data.get('hits', [])
    except Exception as e:
        print(f'  [ERROR] {query}: {e}')
        return []


def download_image(url: str, dest: Path) -> bool:
    """이미지 다운로드"""
    try:
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urlopen(req, timeout=30) as resp:
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(resp.read())
            return True
    except Exception as e:
        print(f'    [ERROR] {dest.name}: {e}')
        return False


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {'images': [], 'generated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ')}

    total_downloaded = 0

    for category, queries in SEARCH_QUERIES.items():
        print(f'\n[{category}] 수집 중...')
        category_dir = OUTPUT_DIR / category
        category_dir.mkdir(parents=True, exist_ok=True)

        category_images = []
        for query in queries:
            hits = fetch_pixabay(query, PER_PAGE)
            print(f'  "{query}": {len(hits)}개 발견')

            for hit in hits:
                img_url = hit.get('largeImageURL') or hit.get('webformatURL')
                if not img_url:
                    continue

                # 파일명: pixabay ID + 간단한 해시
                img_id = hit.get('id', 0)
                short_hash = hashlib.md5(img_url.encode()).hexdigest()[:6]
                filename = f'{category}_{img_id}_{short_hash}.jpg'
                dest = category_dir / filename

                if dest.exists():
                    print(f'    SKIP: {filename} (이미 존재)')
                    continue

                if download_image(img_url, dest):
                    print(f'    OK: {filename}')
                    total_downloaded += 1
                    category_images.append({
                        'category': category,
                        'query': query,
                        'path': str(dest.relative_to('public')),
                        'pixabay_id': img_id,
                        'original_url': img_url,
                        'tags': hit.get('tags', ''),
                        'user': hit.get('user', ''),
                        'license': 'Pixabay Content License (무료 상업 이용 가능)',
                    })
                    time.sleep(0.3)  # API rate limit 보호

        manifest['images'].extend(category_images)

    # 매니페스트 저장
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )

    print(f'\n=== 완료 ===')
    print(f'다운로드: {total_downloaded}개')
    print(f'매니페스트: {MANIFEST_PATH}')
    print(f'출력 경로: {OUTPUT_DIR}')
    print(f'\n다음 단계: python scripts/process-images.py')


if __name__ == '__main__':
    main()
