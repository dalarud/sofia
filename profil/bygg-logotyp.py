"""Bygger Studio Dalaruds logotypfiler som rena vektorer.

Märket "Gläntan": en rund stämpel av lodräta streck (skogen, ordningen, räfflad
keramik) med en öppning där en sten av lera vilar. Texten sätts i Jost Medium
och konverteras till kurvor, så att filerna fungerar utan typsnittet.

Användning:
    pip install fonttools
    python3 bygg-logotyp.py /sökväg/till/Jost-Medium.ttf
"""
import math
import sys
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

UT = Path(__file__).parent
GRANSKOG, LERA, LINNE, LERA_LJUS = "#2B362E", "#9B5E49", "#F3EEE6", "#D49C82"

# Märket i en ruta på 100 x 100
R = 46                 # stämpelns radie
STRECK = 13            # antal streck
BREDD = 3.1            # streckens bredd
GLANTA = (58, 64, 15)  # gläntans mitt och radie, lite åt sidan som en plats i skogen
STEN = "M40.2 60.6c-.4-5 4.3-8.4 10.1-8.5 6-.1 10.2 3.1 10 7.9-.2 4.9-4.6 7.9-10.2 7.9-5.4 0-9.6-2.6-9.9-7.3Z"


def mark(ink, clay):
    lines = []
    pitch = 2 * R / STRECK
    cx, cy, cr = GLANTA
    for i in range(STRECK):
        x = 50 - R + pitch * (i + .5)
        dx = x - 50
        half = math.sqrt(R * R - dx * dx) - BREDD / 2 - .6
        top, bot = 50 - half, 50 + half
        segs = [(top, bot)]
        if abs(x - cx) < cr:
            h = math.sqrt(cr * cr - (x - cx) ** 2)
            segs = [(top, cy - h - BREDD / 2), (cy + h + BREDD / 2, bot)]
        for a, b in segs:
            if b - a > 1.5:
                lines.append(f'<line x1="{x:.2f}" y1="{a:.2f}" x2="{x:.2f}" y2="{b:.2f}"/>')
    return (f'<g stroke="{ink}" stroke-width="{BREDD}" stroke-linecap="round">{"".join(lines)}</g>'
            f'<path fill="{clay}" transform="translate(8 4) scale(.9) translate(5.6 6.7)" d="{STEN}"/>')


def text_path(font, text, size, tracking, x, y):
    """Text som en SVG-path, med spärrning i em. Returnerar (path, bredd)."""
    gs, cmap, upm = font.getGlyphSet(), font.getBestCmap(), font["head"].unitsPerEm
    s = size / upm
    pen = SVGPathPen(gs)
    cur = 0
    for ch in text:
        g = cmap[ord(ch)]
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x + cur, y)))
        cur += gs[g].width * s + tracking * size
    return pen.getCommands(), cur - tracking * size


def svg(w, h, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}">{body}</svg>\n'


def main(font_path):
    font = TTFont(font_path)
    files = {}
    for suffix, ink, clay in (("", GRANSKOG, LERA), ("-ljus", LINNE, LERA_LJUS)):
        files[f"symbol{suffix}.svg"] = svg(100, 100, mark(ink, clay))

        # Liggande: märket till vänster, STUDIO över DALARUD
        studio, _ = text_path(font, "STUDIO", 13, .62, 124, 37)
        name, wn = text_path(font, "DALARUD", 44, .2, 122, 77)
        files[f"logotyp{suffix}.svg"] = svg(124 + wn + 4, 100, mark(ink, clay) +
                                            f'<path fill="{ink}" d="{studio}"/><path fill="{ink}" d="{name}"/>')

        # Stående: märket ovanför, namnet centrerat under
        _, wn = text_path(font, "DALARUD", 30, .24, 0, 0)
        _, ws = text_path(font, "STUDIO", 10, .7, 0, 0)
        W = max(wn, 100) + 20
        name, _ = text_path(font, "DALARUD", 30, .24, (W - wn) / 2, 148)
        studio, _ = text_path(font, "STUDIO", 10, .7, (W - ws) / 2, 168)
        files[f"logotyp-staende{suffix}.svg"] = svg(W, 176, f'<g transform="translate({(W - 100) / 2:.1f} 0)">{mark(ink, clay)}</g>'
                                                    f'<path fill="{ink}" d="{name}"/><path fill="{ink}" d="{studio}"/>')

    # Version för hemsidan: färger från sidans tokens
    studio, _ = text_path(font, "STUDIO", 13, .62, 124, 37)
    name, wn = text_path(font, "DALARUD", 44, .2, 122, 77)
    files["logotyp-webb.svg"] = svg(124 + wn + 4, 100, mark("currentColor", "var(--accent)") +
                                    f'<path fill="currentColor" d="{studio}"/><path fill="currentColor" d="{name}"/>')

    files["symbol-webb.svg"] = svg(100, 100, mark("currentColor", "var(--accent)"))

    for name, content in files.items():
        (UT / name).write_text(content, encoding="utf-8")
        print(name)


if __name__ == "__main__":
    main(sys.argv[1])
