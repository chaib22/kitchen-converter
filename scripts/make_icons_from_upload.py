#!/usr/bin/env python3
"""Generate the full PWA + store icon set from the user's uploaded 3D icon.

Source: upload/"Kitchen & Baking Converter.png" (2000x2000 RGB, rounded-square
3D design on a solid black background).

Method: the black frame around the rounded square is flood-filled from the
image border -> exact alpha silhouette of the design (interior dark pixels
like the scale screen are untouched because they are enclosed by cream).

Outputs (public/icons/):
  icon-192.png          design silhouette, transparent corners ("any")
  icon-512.png          design silhouette, transparent corners ("any")
  apple-touch-icon.png  full-bleed 180x180 (iOS adds its own rounding)
  maskable-512.png      full-bleed, artwork inside the 80% safe-zone circle
  play-icon-512.png     full-bleed 512x512 for Play Store listing
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os

SRC = "/home/z/my-project/upload/Kitchen & Baking Converter.png"
OUT = "/home/z/my-project/public/icons"
SS = 4  # supersample factor for the "any" icon resizes

os.makedirs(OUT, exist_ok=True)
im = Image.open(SRC).convert("RGB")
W, H = im.size
arr = np.asarray(im).astype(np.int16)

# ---- 1. Crop to the rounded square (drop the black frame) -------------------
nonblack = arr.max(axis=2) > 40
ys, xs = np.where(nonblack)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
print(f"content bbox: x {x0}..{x1}  y {y0}..{y1}  (src {W}x{H})")
crop = im.crop((x0, y0, x1 + 1, y1 + 1))
cw, ch = crop.size
side = min(cw, ch)
crop = crop.crop(((cw - side) // 2, (ch - side) // 2,
                  (cw + side) // 2, (ch + side) // 2))
print(f"square crop: {crop.size}")

# ---- 2. Alpha silhouette via border flood-fill over the black frame ---------
ca = np.asarray(crop).astype(np.int16)
black = ca.max(axis=2) < 48
try:
    from scipy import ndimage
    lbl, _ = ndimage.label(black)
    border = set(lbl[0, :]) | set(lbl[-1, :]) | set(lbl[:, 0]) | set(lbl[:, -1])
    border.discard(0)
    outside = np.isin(lbl, list(border))
    print("flood-fill: scipy")
except ImportError:
    bl = Image.fromarray((black * 255).astype(np.uint8))
    for seed in [(0, 0), (side - 1, 0), (0, side - 1), (side - 1, side - 1),
                 (side // 2, 0), (side // 2, side - 1), (0, side // 2), (side - 1, side // 2)]:
        if bl.getpixel(seed) == 255:
            ImageDraw.floodfill(bl, seed, 128)
    outside = np.asarray(bl) == 128
    print("flood-fill: PIL")

alpha = np.where(outside, 0, 255).astype(np.uint8)
print(f"outside-corner pixels: {outside.mean():.1%} of crop")
alpha_img = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(1.2))

# ---- 3. Sample the terracotta background colour ------------------------------
patch = ca[int(side * 0.03):int(side * 0.07), int(side * 0.44):int(side * 0.56)]
bg = tuple(int(v) for v in np.median(patch.reshape(-1, 3), axis=0))
print(f"background colour: rgb{bg}  #{bg[0]:02x}{bg[1]:02x}{bg[2]:02x}")

# ---- 4. square_full: design composited over flat bg (corners disappear) ------
base = Image.new("RGB", (side, side), bg)
square_full = Image.composite(crop, base, alpha_img)

# ---- 5. Measure artwork radial extent (for the maskable safe zone) ----------
# Strong threshold: only the real artwork (cup / scale / arrows — cream, yellow
# or near-black), NOT the design's 1-2px dark 3D edge shading.
fa = np.asarray(square_full).astype(np.int16)
diff = np.abs(fa - np.array(bg)).sum(axis=2)
art = diff > 200
leftover_black = int((fa.max(axis=2) < 20).sum())
print(f"leftover pure-black px: {leftover_black}")
yy, xx = np.mgrid[0:side, 0:side]
rr = np.sqrt((xx - side / 2) ** 2 + (yy - side / 2) ** 2) / (side / 2)
r_max = float(np.percentile(rr[art], 99.8))
print(f"artwork radial extent: {r_max:.3f} of half-size ({art.mean():.1%} px)")

# ---- 6. Emit the icon set -----------------------------------------------------
def save(img, name, **kw):
    img.save(f"{OUT}/{name}", **kw)
    kb = os.path.getsize(f"{OUT}/{name}") // 1024
    print(f"  wrote {name}  {img.size[0]}x{img.size[1]}  {kb} KB")

# "any" icons: design silhouette with transparent corners
for size in (512, 192):
    big = size * SS
    ico = crop.resize((big, big), Image.LANCZOS)
    m = alpha_img.resize((big, big), Image.LANCZOS)
    out = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    out.paste(ico, (0, 0), m)
    save(out.resize((size, size), Image.LANCZOS), f"icon-{size}.png", optimize=True)

# full-bleed helper: paste square_full scaled by f onto a bg canvas
def full_bleed(size, f):
    canvas = Image.new("RGB", (size, size), bg)
    inner = square_full.resize((int(size * f), int(size * f)), Image.LANCZOS)
    off = (size - inner.size[0]) // 2
    canvas.paste(inner, (off, off))
    return canvas

# maskable: artwork must sit inside the 80% safe-zone circle (r <= 0.395)
f_mask = min(0.98, 0.395 / r_max)
print(f"maskable scale: {f_mask:.3f}")
save(full_bleed(512, f_mask), "maskable-512.png", optimize=True)

# apple-touch + play store: full-bleed. square_full already has bg-filled
# corners, so a small 1.03 push only hides the 3D render's dark edge ring
# while keeping 100% of the artwork visible (artwork r 0.855 x 1.03 = 0.88).
save(full_bleed(180, 1.03), "apple-touch-icon.png", optimize=True)
save(full_bleed(512, 1.03), "play-icon-512.png", optimize=True)

print("DONE")
