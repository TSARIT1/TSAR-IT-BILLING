#!/usr/bin/env python3
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(r"d:\All in One Bill")
ART = Path(r"C:\Users\Raki\.gemini\antigravity\brain\095ebb31-d799-411f-a788-5847f43ab5a6\.user_uploaded\media_1790753070926.jpg")
PUB = ROOT / "frontend" / "public"
ASSETS = ROOT / "frontend" / "src" / "asstes"
MOB_PUB = ROOT / "All in One Bill Mobile App" / "public"
MOB_RES = ROOT / "All in One Bill Mobile App" / "android" / "app" / "src" / "main" / "res"

if not ART.is_file():
    print(f"Error: Art file not found at {ART}")
    sys.exit(1)

master = Image.open(ART).convert("RGBA")
print(f"Loaded master artwork: {master.size}")

def sq(img, size):
    return img.resize((size, size), Image.LANCZOS)

def rounded(img, size, radius_ratio):
    im = sq(img, size).copy()
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out

# 1. Update frontend src/asstes/
ASSETS.mkdir(parents=True, exist_ok=True)
sq(master, 1024).convert("RGB").save(ASSETS / "tsar_it_logo.jpg", quality=98)
sq(master, 1024).save(ASSETS / "tsar_it_logo.png", optimize=True)
print("Updated frontend/src/asstes/tsar_it_logo.jpg and .png")

# 2. Update frontend public/
PUB.mkdir(parents=True, exist_ok=True)
for size in (192, 512):
    sq(master, size).save(PUB / f"tsar-icon-{size}.png", optimize=True)
    sq(master, size).save(PUB / f"logo{size}.png", optimize=True)

fav_rounded = rounded(master, 256, 0.18)
fav_rounded.save(PUB / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print("Updated frontend/public icons and favicon.ico")

# 3. Update mobile app public/
MOB_PUB.mkdir(parents=True, exist_ok=True)
for size in (192, 512):
    sq(master, size).save(MOB_PUB / f"tsar-icon-{size}.png", optimize=True)
    sq(master, size).save(MOB_PUB / f"logo{size}.png", optimize=True)
fav_rounded.save(MOB_PUB / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("Updated mobile app public icons and favicon.ico")

# 4. Update Android APK mipmaps
DENSITIES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
for dpi, size in DENSITIES.items():
    target_dir = MOB_RES / f"mipmap-{dpi}"
    target_dir.mkdir(parents=True, exist_ok=True)
    rounded(master, size, 0.18).save(target_dir / "ic_launcher.png", optimize=True)
    rounded(master, size, 0.5).save(target_dir / "ic_launcher_round.png", optimize=True)
print("Updated all Android mipmap launcher and round icons")

# 5. Update Android adaptive icon in drawable
DRAWABLE = MOB_RES / "drawable"
DRAWABLE.mkdir(parents=True, exist_ok=True)
FG = 432
fg = Image.new("RGBA", (FG, FG), (0, 0, 0, 0))
inner = int(FG * 0.75)
art = sq(master, inner)
fg.paste(art, ((FG - inner) // 2, ((FG - inner) // 2)), art)
fg.save(DRAWABLE / "logo_tsar_it.png", optimize=True)

# Deep rich burgundy sampled from the outer bevel of the artwork
bg = Image.new("RGBA", (432, 432), (58, 8, 18, 255))
bg.save(DRAWABLE / "logo_tsar_it_bg.png", optimize=True)
print("Updated Android adaptive drawables: logo_tsar_it.png and logo_tsar_it_bg.png")

print("ALL BRAND ASSETS GENERATED SUCCESSFULLY!")
