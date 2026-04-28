#!/usr/bin/env python3
"""Resize main_bg.webp into two smaller responsive variants."""
import os
from pathlib import Path
from PIL import Image

REPO_ROOT = Path(__file__).parent.parent
SRC = REPO_ROOT / "public" / "images" / "main_bg.webp"

VARIANTS = [
    ("main_bg-1200.webp", 1200, 1500, 85),
    ("main_bg-600.webp", 600, 750, 80),
]

def human_size(path: Path) -> str:
    size = path.stat().st_size
    return f"{size / 1024:.1f} KB"

def main():
    if not SRC.exists():
        raise FileNotFoundError(f"Source not found: {SRC}")

    print(f"Source : {SRC.name}  {human_size(SRC)}")

    with Image.open(SRC) as img:
        print(f"         {img.width}×{img.height} {img.mode}")

        for name, w, h, quality in VARIANTS:
            dest = SRC.parent / name
            resized = img.resize((w, h), Image.LANCZOS)
            resized.save(dest, "WEBP", quality=quality, method=6)
            print(f"→ {name}  {w}×{h}  quality={quality}  {human_size(dest)}")

    print("\nOriginal kept as fallback.")

if __name__ == "__main__":
    main()
