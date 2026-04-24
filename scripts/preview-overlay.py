"""
샘플 6장 빠른 미리보기 — 오버레이 조정 + 세트 다양성 확인용.
"""
import sys
from pathlib import Path
import importlib.util

ROOT = Path(__file__).parent.parent
spec = importlib.util.spec_from_file_location("pw", ROOT / "scripts" / "process-workimages.py")
pw = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pw)

OUT = Path('/tmp/overlay-preview')
OUT.mkdir(parents=True, exist_ok=True)

# 6 샘플 — 서로 다른 원본 · 서로 다른 variant 시드로 다른 팔레트 세트 유도
samples = [
    ('before-001.jpg', 'toilet', 0),
    ('during-050.jpg', 'drain', 5),
    ('after-009.jpg', 'sink', 3),
    ('before-013.jpg', 'leak', 7),
    ('during-030.jpg', 'aircon', 11),
    ('after-005.jpg', 'sewage', 17),
]

for src_name, service, variant in samples:
    src = ROOT / 'public' / 'images' / 'workimages' / src_name
    img, rng = pw.process_image(src, variant, service=service)
    out_path = OUT / f'preview-{service}-{src_name.replace(".jpg","")}-v{variant}.webp'
    img.save(out_path, format='WEBP', quality=90, method=5)
    print(f'saved: {out_path.name} ({out_path.stat().st_size // 1024}KB)')

print('DONE')
