#!/usr/bin/env python3
"""Resize banner-1.webp into responsive variants for LCP optimisation."""
import os
from pathlib import Path
from PIL import Image

REPO_ROOT = Path(__file__).parent.parent
SRC = REPO_ROOT / "public" / "images" / "hero" / "banner-1.webp"

VARIANTS = [
    ("banner-1-600.webp",  600,  420, 85),
    ("banner-1-1200.webp", 1200, 840, 82),
]

def human_size(path: Path) -> str:
    size = path.stat().st_size
    return f"{size / 1024:.1f} KB"

def main():
    if not SRC.exists():
        raise FileNotFoundError(f"Source not found: {SRC}")

    print(f"Source : {SRC.name}  {human_size(SRC)}")

    with Image.open(SRC) as img:
        print(f"         {img.width}x{img.height} {img.mode}")

        for name, w, h, quality in VARIANTS:
            dest = SRC.parent / name
            resized = img.resize((w, h), Image.LANCZOS)
            resized.save(dest, "WEBP", quality=quality, method=6)
            print(f"-> {name}  {w}x{h}  quality={quality}  {human_size(dest)}")

    print(f"\nOriginal kept as fallback: {SRC.name}  {human_size(SRC)}")

if __name__ == "__main__":
    main()
