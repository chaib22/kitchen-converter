#!/usr/bin/env python3
"""Play Store Feature Graphic 1024x500 for Kitchen & Baking Converter."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1024, 500
CREAM = (253, 246, 236)
SOFT = (250, 233, 217)
TERRA = (188, 90, 46)
COCOA = (59, 38, 26)
MUTE = (140, 110, 88)

DEJAVU_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
CARLITO_B = "/usr/share/fonts/truetype/english/Carlito-Bold.ttf"
TITLE_CANDIDATES = [
    "/usr/share/fonts/truetype/english/Tinos-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
]


def load_font(cands, size):
    for p in cands:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


img = Image.new("RGB", (W, H), CREAM)
d = ImageDraw.Draw(img)

# soft backdrop on the right side for the icon
d.ellipse([575, 15, 1045, 485], fill=SOFT)
d.ellipse([595, 35, 1025, 465], outline=(233, 210, 190), width=3)

# app icon pasted big on the right (rounded tile mask — play icon is full square)
icon = Image.open("/home/z/my-project/public/icons/play-icon-512.png").convert("RGBA")
size = 330
icon = icon.resize((size, size), Image.LANCZOS)
tile = Image.new("L", (size, size), 0)
ImageDraw.Draw(tile).rounded_rectangle(
    [0, 0, size - 1, size - 1], radius=int(size * 0.21), fill=255
)
img.paste(icon, (795 - size // 2, 250 - size // 2), tile)

title_font = load_font(TITLE_CANDIDATES, 70)
tag_font = ImageFont.truetype(DEJAVU_B, 29)
pill_font = ImageFont.truetype(CARLITO_B, 25)


def fit(text, font, max_w):
    while d.textlength(text, font=font) > max_w and getattr(font, "size", 0) > 12:
        font = ImageFont.truetype(font.path, font.size - 2)
    return font


LX = 64
MAXW = 560

t1 = "Kitchen & Baking"
t2 = "Converter"
f1 = fit(t1, title_font, MAXW)
f2 = fit(t2, title_font, MAXW)
d.text((LX, 96), t1, font=f1, fill=COCOA)
d.text((LX, 176), t2, font=f2, fill=COCOA)

tag = "Cups \u2194 Grams \u00b7 Oven Temps \u00b7 Volumes"
ft = fit(tag, tag_font, MAXW)
d.text((LX, 288), tag, font=ft, fill=TERRA)

# pills
pills = ["60+ ingredients", "100% offline", "EN \u00b7 FR \u00b7 ES"]
px, py = LX, 372
for txt in pills:
    tw = d.textlength(txt, font=pill_font)
    box = [px, py, px + tw + 36, py + 52]
    d.rounded_rectangle(box, radius=26, outline=TERRA, width=2)
    d.text((px + 18, py + 12), txt, font=pill_font, fill=COCOA)
    px = box[2] + 16

img.save("/home/z/my-project/download/play-feature-graphic.png", "PNG", optimize=True)
print("feature graphic saved", img.size)
