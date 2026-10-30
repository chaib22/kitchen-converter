#!/usr/bin/env python3
"""Generate PWA / Play Store icon set for Kitchen & Baking Converter.
Outputs to /home/z/my-project/public/icons/
  - icon-192.png / icon-512.png       rounded, transparent corners ("any" purpose)
  - maskable-512.png                  full-bleed square (safe-zone content)
  - apple-touch-icon.png              180x180 full-bleed
  - play-icon-512.png                 512 listing icon
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = "/home/z/my-project/public/icons"
os.makedirs(OUT, exist_ok=True)

TERRA = (188, 90, 46, 255)        # primary terracotta
TERRA_DEEP = (158, 71, 33, 255)   # shading
WHITE = (255, 255, 255, 255)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def draw_art(d: ImageDraw.ImageDraw, S: float, scale: float = 1.0) -> None:
    """Draw the measuring-cup artwork centered in a 512 box.
    Coordinates are authored in a 512 space and scaled around the center."""
    C = 256.0

    def x(v): return C + (v - C) * S * scale
    def y(v): return C + (v - C) * S * scale
    def w(v): return v * S * scale

    cx = 256

    # ---- handle (drawn first, body covers its inner half) ----
    hy, hr, hw = 262, 54, 28
    hx = cx + 124
    d.ellipse(
        [x(hx - hr), y(hy - hr), x(hx + hr), y(hy + hr)],
        outline=WHITE, width=int(w(hw)),
    )

    # ---- cup body: slightly tapered trapezoid ----
    bx0, bx1 = cx - 100, cx + 92
    by0, by1 = 150, 380
    body = [
        (x(bx0), y(by0)),
        (x(bx1), y(by0)),
        (x(bx1 - 14), y(by1)),
        (x(bx0 + 14), y(by1)),
    ]
    d.polygon(body, fill=WHITE)
    # top rim
    d.rounded_rectangle([x(bx0 - 8), y(by0 - 14), x(bx1 + 8), y(by0 + 14)], radius=w(12), fill=WHITE)

    # ---- graduation ticks (terracotta), left side ----
    for i, frac in enumerate([0.10, 0.30, 0.50, 0.70, 0.90]):
        ty = by0 + 34 + (by1 - by0 - 68) * frac
        tx1 = bx0 + 30
        tx2 = tx1 + (38 if i % 2 == 0 else 24)
        d.rounded_rectangle([x(tx1), y(ty), x(tx2), y(ty + 9)], radius=w(4.5), fill=TERRA)

    # ---- "½" centered in the body (right of ticks) ----
    f = ImageFont.truetype(FONT_BOLD, int(w(104)))
    txt = "\u00bd"
    bbox = d.textbbox((0, 0), txt, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (bx0 + 30 + 38 + bx1) / 2  # midpoint between ticks end and body right
    d.text(
        (x(tx) - tw / 2 - bbox[0], y((by0 + by1) / 2 + 30) - th / 2 - bbox[1]),
        txt, font=f, fill=TERRA_DEEP,
    )


def make_icon(size: int, rounded: bool, maskable: bool = False) -> Image.Image:
    img = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable:
        # full-bleed background, art confined to central safe zone (~66%)
        d.rectangle([0, 0, 512, 512], fill=TERRA)
        draw_art(d, 1.0, scale=0.62)
    else:
        d.rounded_rectangle([0, 0, 512, 512], radius=112, fill=TERRA)
        draw_art(d, 1.0, scale=0.92)
    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    make_icon(192, rounded=True).save(f"{OUT}/icon-192.png")
    make_icon(512, rounded=True).save(f"{OUT}/icon-512.png")
    make_icon(512, rounded=False, maskable=True).save(f"{OUT}/maskable-512.png")
    make_icon(180, rounded=False).save(f"{OUT}/apple-touch-icon.png")  # iOS applies its own mask
    make_icon(512, rounded=True).save(f"{OUT}/play-icon-512.png")
    print("icons written to", OUT)


if __name__ == "__main__":
    main()
