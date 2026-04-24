"""
EXIF 주입 검증 — 샘플 3장 읽어 JSON 저장.
"""
import json
import sys
from pathlib import Path
import piexif

ROOT = Path(__file__).parent.parent
OUT = ROOT / 'scripts' / 'exif-verify.json'

paths = [
    ROOT / 'public/images/blog-content/aircon/aircon-0001.webp',
    ROOT / 'public/images/blog-content/toilet/toilet-0500.webp',
    ROOT / 'public/images/blog-content/drain/drain-0050.webp',
]

result = {}
for path in paths:
    if not path.exists():
        result[path.name] = {'error': 'missing'}
        continue
    try:
        exif = piexif.load(str(path))
        section = {}
        for ifd_name in ('0th', 'Exif', 'GPS'):
            tags = {}
            for tag, value in exif.get(ifd_name, {}).items():
                tag_name = piexif.TAGS[ifd_name].get(tag, {}).get('name', f'0x{tag:04x}')
                if isinstance(value, bytes):
                    try:
                        # Try ASCII/Latin-1
                        decoded = value.decode('ascii', errors='strict')
                        display = decoded
                    except UnicodeDecodeError:
                        # UserComment starts with UNICODE\0
                        if value.startswith(b'UNICODE\x00'):
                            display = 'UNICODE:' + value[8:].decode('utf-16-be', errors='replace')
                        else:
                            display = f'<bytes {len(value)}: ' + value.hex()[:40] + '>'
                elif isinstance(value, list):
                    display = value
                else:
                    display = value
                tags[tag_name] = display
            section[ifd_name] = tags
        result[path.name] = section
    except Exception as e:
        result[path.name] = {'error': str(e)}

OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'saved: {OUT}')
print(f'size: {OUT.stat().st_size} bytes')
