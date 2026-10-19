#!/usr/bin/env python3
"""Generate the resized WebP photos the website serves.

For every photo (.jpg / .jpeg, any case) in the source folder this script:

  1. applies the EXIF orientation (so phone photos are the right way up),
  2. drops all metadata (EXIF, GPS location, camera details, ICC extras),
  3. writes two WebP files into the output folder:
       <name>-800.webp   800px wide
       <name>-1600.webp  1600px wide
     keeping the aspect ratio and never upscaling (a photo narrower than a
     target width is saved at its own width under that name), quality 78.

The site loads these through `responsiveImage()` in src/lib/images.ts, which
turns '/images/<name>.jpg' into a src + srcSet pointing at the two WebP files.
Existing WebP files are overwritten. The original JPGs are not touched.

Requirements: Python 3 with Pillow built with WebP support
  python3 -c "from PIL import features; print(features.check('webp'))"

Usage (from the repo root, in Terminal):
  python3 scripts/optimise-images.py                      # public/images -> public/images
  python3 scripts/optimise-images.py ~/Desktop/new-photos # new originals -> public/images
  python3 scripts/optimise-images.py SRC_DIR OUT_DIR

Adding a new photo: put the original JPG in a temporary folder outside the
repo, run the script with that folder as SRC_DIR, then commit only the two
generated .webp files and reference the photo in code as '/images/<name>.jpg'
via responsiveImage(). The large original does not need to be committed.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageOps

WIDTHS = (800, 1600)
QUALITY = 78
PHOTO_SUFFIXES = {".jpg", ".jpeg"}

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DIR = REPO_ROOT / "public" / "images"


def human(n: int) -> str:
    return f"{n / 1024:.0f} KB" if n < 1024 * 1024 else f"{n / 1024 / 1024:.2f} MB"


def optimise(photo: Path, out_dir: Path) -> list[Path]:
    written = []
    with Image.open(photo) as original:
        img = ImageOps.exif_transpose(original)
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")
        for width in WIDTHS:
            if img.width > width:
                height = round(img.height * width / img.width)
                resized = img.resize((width, height), Image.Resampling.LANCZOS)
            else:
                resized = img.copy()
            # Rebuilding from pixel data alone guarantees no metadata is carried over.
            clean = Image.new(resized.mode, resized.size)
            clean.putdata(list(resized.getdata()))
            target = out_dir / f"{photo.stem}-{width}.webp"
            clean.save(target, "WEBP", quality=QUALITY, method=6)
            written.append(target)
    return written


def main(argv: list[str]) -> int:
    src_dir = Path(argv[1]).expanduser() if len(argv) > 1 else DEFAULT_DIR
    out_dir = Path(argv[2]).expanduser() if len(argv) > 2 else DEFAULT_DIR
    if not src_dir.is_dir():
        print(f"Source folder not found: {src_dir}", file=sys.stderr)
        return 1
    out_dir.mkdir(parents=True, exist_ok=True)

    photos = sorted(p for p in src_dir.iterdir() if p.suffix.lower() in PHOTO_SUFFIXES)
    if not photos:
        print(f"No .jpg/.jpeg photos in {src_dir}")
        return 0

    for photo in photos:
        outputs = optimise(photo, out_dir)
        sizes = ", ".join(f"{o.name} {human(o.stat().st_size)}" for o in outputs)
        print(f"{photo.name} ({human(photo.stat().st_size)}) -> {sizes}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
