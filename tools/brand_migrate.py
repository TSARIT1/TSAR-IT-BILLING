#!/usr/bin/env python3
"""Migrate TSAR IT Billing app UI from the legacy indigo/orange palette to the
official burgundy/gold brand, and consolidate fonts to the loaded webfonts
(Sora + Plus Jakarta Sans). Idempotent; writes only files that change."""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "frontend" / "src"

# ---------- 1. Whole-token color replacements (case-insensitive) ----------
COLOR_MAP = {
    # legacy core brand indigo -> burgundy 600
    "#3e4e96": "#7c1e2e",
    # legacy bright blue -> primary 500
    "#4d7cff": "#9c3d52",
    # legacy periwinkle / slate-violet -> primary 700
    "#5a6fb8": "#8a2438",
    "#6a5acd": "#8a2438",
    # legacy orange accent -> brand gold
    "#e8961b": "#b45309",
    # landing-era orange -> landing gold
    "#ff6b35": "#c9973f",
    # tailwind indigo stragglers
    "#6366f1": "#9c3d52",
    "#4338ca": "#8a2438",
    "#4f46e5": "#7c1e2e",
    "#3730a3": "#4a1524",
    # indigo tint surfaces -> burgundy tint surfaces
    "#eef2ff": "#faf1ee",
    "#e0e7ff": "#f6e8e4",
    # slate-blue family used by legacy PDF/print templates (#2c3e50 family)
    "#2c3e50": "#4a1524",
    "#34495e": "#5b2a3a",
    # flat-ui indigo gradients (667eea -> 764ba2) from purchase-return template
    "#667eea": "#7c1e2e",
    "#764ba2": "#4a1524",
    "#5568d3": "#8a2438",
    "#4c51bf": "#8a2438",
    # pale blue tint badges/chips -> burgundy tint
    "#e7f3ff": "#faf1ee",
    "#f0f8ff": "#faf1ee",
    "#f0f7ff": "#faf1ee",
    "#f0f9ff": "#faf1ee",
    "#f8f9ff": "#faf1ee",
}

# ---------- 2. rgba() replacements (whitespace-tolerant) ----------
RGBA_MAP = [
    (re.compile(r"rgba\(\s*62\s*,\s*78\s*,\s*150\s*,", re.I), "rgba(124, 30, 46,"),
    (re.compile(r"rgba\(\s*77\s*,\s*124\s*,\s*255\s*,", re.I), "rgba(156, 61, 82,"),
    (re.compile(r"rgba\(\s*106\s*,\s*90\s*,\s*205\s*,", re.I), "rgba(138, 36, 56,"),
    (re.compile(r"rgba\(\s*232\s*,\s*150\s*,\s*27\s*,", re.I), "rgba(180, 83, 9,"),
    (re.compile(r"rgba\(\s*255\s*,\s*107\s*,\s*53\s*,", re.I), "rgba(201, 151, 63,"),
    (re.compile(r"rgba\(\s*79\s*,\s*70\s*,\s*229\s*,", re.I), "rgba(124, 30, 46,"),
    (re.compile(r"rgba\(\s*102\s*,\s*126\s*,\s*234\s*,", re.I), "rgba(124, 30, 46,"),
    (re.compile(r"rgba\(\s*99\s*,\s*102\s*,\s*241\s*,", re.I), "rgba(156, 61, 82,"),
]

# ---------- 3. Font family consolidation ----------
FONT_MAP = [
    # Poppins -> Sora (headings-scale sans actually loaded in index.html)
    (re.compile(r"""(["']?)Poppins\1\s*,\s*sans-serif"""), '"Sora", "Plus Jakarta Sans", sans-serif'),
    # Inter -> Plus Jakarta Sans (body sans actually loaded)
    (re.compile(r"""(["']?)Inter\1\s*,\s*sans-serif"""), '"Plus Jakarta Sans", "Inter", system-ui, sans-serif'),
    # stray Segoe-only stacks -> loaded stack
    (re.compile(r"""'Segoe UI',\s*Tahoma,\s*Geneva,\s*Verdana,\s*sans-serif"""), '"Sora", "Plus Jakarta Sans", sans-serif'),
]


def migrate(text: str):
    changes = 0
    for old, new in COLOR_MAP.items():
        pat = re.compile(re.escape(old), re.I)
        text, n = pat.subn(new, text)
        changes += n
    for pat, repl in RGBA_MAP:
        text, n = pat.subn(repl, text)
        changes += n
    for pat, repl in FONT_MAP:
        text, n = pat.subn(repl, text)
        changes += n
    return text, changes


def main():
    total_files = 0
    total_changes = 0
    for path in sorted(SRC.rglob("*")):
        if path.suffix.lower() not in {".css", ".jsx", ".js"}:
            continue
        try:
            raw = path.read_bytes()
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            print(f"SKIP (not utf-8): {path.relative_to(ROOT)}")
            continue
        new_text, n = migrate(text)
        if n:
            path.write_text(new_text, encoding="utf-8", newline="")
            total_files += 1
            total_changes += n
            print(f"{n:4d}  {path.relative_to(ROOT)}")
    print(f"\nDone: {total_changes} replacements across {total_files} files")


if __name__ == "__main__":
    main()
