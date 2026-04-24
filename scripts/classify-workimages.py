#!/usr/bin/env python3
"""
workimages/ 141장 → 8개 서비스 타입 자동 분류 (SigLIP zero-shot)

사용법:
  pip install transformers torch pillow
  python scripts/classify-workimages.py

출력:
  scripts/workimages-manifest.json
    {
      "before-001.jpg": {"serviceType": "drain", "confidence": 0.87, "all_probs": {...}},
      ...
    }

confidence < 0.5 인 장은 'manual_review' 플래그가 True 로 출력.
수동 검토 후 manifest JSON 직접 편집 가능.
"""

import json
import glob
from pathlib import Path

import torch
from PIL import Image
from transformers import AutoModel, AutoProcessor

# 서비스 타입 ↔ 영문 프롬프트 (SigLIP 영문 학습)
SERVICE_LABELS = {
    'toilet': 'a photo of a clogged toilet being repaired by a plumber in a Korean bathroom',
    'sink': 'a photo of a kitchen sink drain being unclogged or cleaned by a plumber',
    'drain': 'a photo of a bathroom floor drain or shower drain being cleaned with high pressure water',
    'leak': 'a photo of a water leak detection work, wet walls, or pipe leaking water',
    'aircon': 'a photo of an air conditioner indoor unit drain pipe being cleaned',
    'sewage': 'a photo of a sewage pipe blockage with dirty water or sewage overflow',
    'stormwater': 'a photo of a stormwater drain or rain drain outdoor ground level',
    'manhole': 'a photo of an underground manhole cover opened, workers cleaning sewage',
}
SERVICE_KEYS = list(SERVICE_LABELS.keys())
LABELS = list(SERVICE_LABELS.values())

ROOT = Path(__file__).parent.parent
INPUT_DIR = ROOT / 'public' / 'images' / 'workimages'
OUTPUT_PATH = ROOT / 'scripts' / 'workimages-manifest.json'


def main():
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f'Device: {device}')

    model_name = 'google/siglip-large-patch16-384'
    print(f'Loading model: {model_name}')
    model = AutoModel.from_pretrained(model_name).to(device)
    model.eval()
    processor = AutoProcessor.from_pretrained(model_name)

    image_files = sorted(glob.glob(str(INPUT_DIR / '*.jpg')))
    print(f'원본 사진: {len(image_files)}장')
    print('-' * 40)

    manifest = {}
    for idx, path in enumerate(image_files, 1):
        try:
            img = Image.open(path).convert('RGB')
            inputs = processor(
                text=LABELS,
                images=img,
                return_tensors='pt',
                padding='max_length',
                truncation=True,
            ).to(device)
            with torch.no_grad():
                out = model(**inputs)
            # SigLIP: logits_per_image 은 image x text
            logits = out.logits_per_image[0]
            probs = torch.sigmoid(logits)  # SigLIP 은 sigmoid 기반
            probs = probs / probs.sum()    # 정규화
            top_idx = probs.argmax().item()
            top_conf = float(probs[top_idx])

            filename = Path(path).name
            manifest[filename] = {
                'serviceType': SERVICE_KEYS[top_idx],
                'confidence': round(top_conf, 3),
                'manual_review': top_conf < 0.5,
                'all_probs': {
                    k: round(float(probs[i]), 3)
                    for i, k in enumerate(SERVICE_KEYS)
                },
            }

            flag = '⚠' if top_conf < 0.5 else ' '
            print(
                f'  [{idx:>3}/{len(image_files)}] {flag} {filename:20s} '
                f'→ {SERVICE_KEYS[top_idx]:10s} (conf={top_conf:.2f})'
            )
        except Exception as e:
            print(f'  ERROR {path}: {e}')
            manifest[Path(path).name] = {
                'serviceType': 'misc',
                'confidence': 0.0,
                'manual_review': True,
                'error': str(e),
            }

    # 요약
    dist = {}
    low_conf = 0
    for _, m in manifest.items():
        dist[m['serviceType']] = dist.get(m['serviceType'], 0) + 1
        if m.get('manual_review'):
            low_conf += 1

    OUTPUT_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )

    print('-' * 40)
    print(f'분류 분포:')
    for k in SERVICE_KEYS:
        print(f'  {k:10s}: {dist.get(k, 0):>3}장')
    print(f'  (manual review: {low_conf}장)')
    print(f'저장: {OUTPUT_PATH}')


if __name__ == '__main__':
    main()
