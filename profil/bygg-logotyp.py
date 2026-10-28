"""Bygger Studio Dalaruds logotypfiler som rena vektorer.

Märket "Rundbågen": tre bågar som ett fönster eller en dörröppning, och innerst
en sten av lera. Namnet sätts i Young Serif och STUDIO i Jost Medium. All text
konverteras till kurvor, så att filerna fungerar utan typsnitten.

Användning:
    pip install fonttools
    python3 bygg-logotyp.py /mapp/med/typsnitt
Mappen ska innehålla YoungSerif.ttf och Jost-500.ttf (Google Fonts, fri licens).
"""
import sys
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

UT = Path(__file__).parent
GRANSKOG, LERA, LINNE, LERA_LJUS = "#2B362E", "#9B5E49", "#F3EEE6", "#D49C82"

# Märket i en ruta på 100 x 100
BAGAR = (42, 31, 20)   # bågarnas radier, utifrån och in
MITT = 52              # höjd där bågarna övergår i raka sidor
BOTTEN = 94
LINJE = 3.4
STEN = "M-9.8 .6c-.4-5 4.3-8.4 10.1-8.5 6-.1 10.2 3.1 10 7.9-.2 4.9-4.6 7.9-10.2 7.9-5.4 0-9.6-2.6-9.9-7.3Z"  # runt (0, 0)


def mark(ink, clay):
    arcs = "".join(f'<path d="M{50 - r} {BOTTEN}V{MITT}A{r} {r} 0 0 1 {50 + r} {MITT}V{BOTTEN}"/>' for r in BAGAR)
    return (f'<g fill="none" stroke="{ink}" stroke-width="{LINJE}" stroke-linecap="round">{arcs}</g>'
            f'<path fill="{clay}" transform="translate(50 86) scale(.62)" d="{STEN}"/>')


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


def liggande(serif, sans, ink, clay):
    name, wn = text_path(serif, "Dalarud", 48, 0, 122, 70)
    studio, _ = text_path(sans, "STUDIO", 13.5, .62, 124.5, 94)
    return svg(122 + wn + 6, 100, mark(ink, clay) + f'<path fill="{ink}" d="{name}"/><path fill="{ink}" d="{studio}"/>')


def staende(serif, sans, ink, clay):
    _, wn = text_path(serif, "Dalarud", 38, 0, 0, 0)
    _, ws = text_path(sans, "STUDIO", 9.5, .7, 0, 0)
    W = max(wn, 100) + 16
    name, _ = text_path(serif, "Dalarud", 38, 0, (W - wn) / 2, 140)
    studio, _ = text_path(sans, "STUDIO", 9.5, .7, (W - ws) / 2, 160)
    return svg(W, 166, f'<g transform="translate({(W - 100) / 2:.1f} 0)">{mark(ink, clay)}</g>'
                       f'<path fill="{ink}" d="{name}"/><path fill="{ink}" d="{studio}"/>')


def main(font_dir):
    serif = TTFont(Path(font_dir) / "YoungSerif.ttf")
    sans = TTFont(Path(font_dir) / "Jost-500.ttf")
    files = {}
    for suffix, ink, clay in (("", GRANSKOG, LERA), ("-ljus", LINNE, LERA_LJUS)):
        files[f"symbol{suffix}.svg"] = svg(100, 100, mark(ink, clay))
        files[f"logotyp{suffix}.svg"] = liggande(serif, sans, ink, clay)
        files[f"logotyp-staende{suffix}.svg"] = staende(serif, sans, ink, clay)
    # Versioner för hemsidan: färger från sidans tokens
    files["logotyp-webb.svg"] = liggande(serif, sans, "currentColor", "var(--accent)")
    files["symbol-webb.svg"] = svg(100, 100, mark("currentColor", "var(--accent)"))
    for name, content in files.items():
        (UT / name).write_text(content, encoding="utf-8")
        print(name)


if __name__ == "__main__":
    main(sys.argv[1])
