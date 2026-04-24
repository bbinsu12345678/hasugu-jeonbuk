"""
오버레이 갤러리 생성기 — 재생성된 webp 를 서비스별로 묶어 HTML 갤러리 출력.
"""
from pathlib import Path
import random

ROOT = Path(__file__).parent.parent
BLOG = ROOT / 'public' / 'images' / 'blog-content'
OUT = Path(r'C:\tmp\overlay-gallery.html')
OUT.parent.mkdir(parents=True, exist_ok=True)

services = ['toilet', 'sink', 'drain', 'leak', 'aircon', 'stormwater']
per_svc = 6
rng = random.Random(42)

html = ['''<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>오버레이 갤러리 · Phase 2.8</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css">
<style>
body{font-family:'Pretendard Variable',sans-serif;background:#0a0e1a;color:#e6edf7;margin:0;padding:32px}
h1{font-size:28px;margin:0 0 8px}
.meta{color:rgba(230,237,247,.5);font-size:13px;margin-bottom:24px}
h2{font-size:20px;color:#ffd166;margin:32px 0 12px;border-left:4px solid #ff6b35;padding-left:12px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px}
.card{background:#151a2a;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.08)}
.card img{display:block;width:100%;height:auto}
.card .name{font-size:12px;color:rgba(230,237,247,.6);padding:8px 12px;background:rgba(255,255,255,.02);border-top:1px solid rgba(255,255,255,.06)}
</style></head><body>
<h1>오버레이 갤러리 — Phase 2.8 재생성 결과</h1>
<div class="meta">6개 고급 팔레트 세트 · 배너 중앙 통일 65% · 반투명 · 단색(무지개 제거)</div>''']

for svc in services:
    dir_ = BLOG / svc
    if not dir_.exists():
        continue
    files = sorted(dir_.glob('*.webp'))
    if not files:
        continue
    samples = rng.sample(files, min(per_svc, len(files)))
    html.append(f'<h2>{svc} — 총 {len(files)}장 중 랜덤 {len(samples)}</h2><div class="grid">')
    for f in samples:
        uri = f.as_uri()  # file:///C:/... 자동 생성
        html.append(f'<div class="card"><img src="{uri}" loading="lazy"/><div class="name">{svc}/{f.name}</div></div>')
    html.append('</div>')

html.append('</body></html>')
OUT.write_text('\n'.join(html), encoding='utf-8')
print(f'saved: {OUT}')
print(f'size: {OUT.stat().st_size} bytes')
